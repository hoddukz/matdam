// Tag: core
// Path: apps/web/src/app/api/translate-announcement/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { ensureLocaleObject } from "@/lib/recipe/localized-text";
import { SUPPORTED_LOCALES } from "@/lib/i18n/constants";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // 1. Parse request
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const announcementId = body.announcementId as string | undefined;
  if (!announcementId) {
    return NextResponse.json({ error: "announcementId required" }, { status: 400 });
  }
  if (!UUID_REGEX.test(announcementId)) {
    return NextResponse.json({ error: "invalid announcementId format" }, { status: 400 });
  }

  // 2. API key + service role check
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }

  // 3. Auth check (admin만 허용)
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignored in API route
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 4. Service role client
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

  // Admin 확인
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (userData?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 5. Announcement fetch
  const { data: announcement, error: fetchError } = await supabase
    .from("announcements")
    .select("id, title, content, summary, target_locales, translated_locales")
    .eq("id", announcementId)
    .single();

  if (fetchError || !announcement) {
    return NextResponse.json({ error: "announcement not found" }, { status: 404 });
  }

  // target_locales가 설정된 경우 → 특정 국가 전용이므로 번역 스킵
  if (announcement.target_locales !== null) {
    return NextResponse.json({ translated: 0, skipped: "target_locales set" });
  }

  // 6. Collect texts to translate
  interface TranslationEntry {
    field: "title" | "content" | "summary";
    sourceLocale: string;
    targetLocale: string;
    sourceText: string;
    existing: Record<string, string>;
  }

  const items: TranslationEntry[] = [];

  for (const field of ["title", "content", "summary"] as const) {
    const raw = announcement[field] as Record<string, string> | string | null;
    const jsonb = ensureLocaleObject(raw);
    if (Object.keys(jsonb).length === 0) continue;

    const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
    if (presentLocales.length === 0) continue;

    const sourceLocale = presentLocales.includes("ko") ? "ko" : presentLocales[0];
    const targetLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));

    for (const targetLocale of targetLocales) {
      items.push({
        field,
        sourceLocale,
        targetLocale,
        sourceText: jsonb[sourceLocale],
        existing: jsonb,
      });
    }
  }

  if (items.length === 0) {
    return NextResponse.json({ translated: 0 });
  }

  // 7. Batch translate with Claude Haiku
  const anthropic = new Anthropic({ apiKey });
  const localeNames: Record<string, string> = { ko: "Korean", en: "English" };

  // Group by source→target locale pair
  const byPair = new Map<string, TranslationEntry[]>();
  for (const item of items) {
    const key = `${item.sourceLocale}→${item.targetLocale}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key)!.push(item);
  }

  const translations = new Map<TranslationEntry, string>();

  for (const [, pairItems] of byPair) {
    const sourceLang = localeNames[pairItems[0].sourceLocale] ?? pairItems[0].sourceLocale;
    const targetLang = localeNames[pairItems[0].targetLocale] ?? pairItems[0].targetLocale;

    const numberedTexts = pairItems.map((item, i) => `[${i + 1}] ${item.sourceText}`).join("\n");

    let response;
    try {
      response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `You are a translation assistant for a food/recipe community website.
Translate the following announcement texts from ${sourceLang} to ${targetLang}.
These are website announcement titles, content (in Markdown format), and summaries.
Keep Markdown formatting intact. Keep the tone professional but friendly.
Return ONLY the translations in the same numbered format, one per line.
For multi-line content, keep it as a single [N] entry with newlines preserved.

${numberedTexts}`,
          },
        ],
      });
    } catch {
      continue;
    }

    if (response.content.length === 0) continue;
    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse numbered responses (handle multi-line content)
    const regex = /\[(\d+)\]\s*([\s\S]*?)(?=\n\[\d+\]|$)/g;
    let match;
    while ((match = regex.exec(responseText)) !== null) {
      const idx = parseInt(match[1], 10) - 1;
      if (idx >= 0 && idx < pairItems.length) {
        const translatedText = match[2].trim();
        const sourceText = pairItems[idx].sourceText;
        if (translatedText.length > sourceText.length * 5) continue;
        translations.set(pairItems[idx], translatedText);
      }
    }
  }

  // 8. Update DB with translations
  let updated = 0;
  const successLocales = new Set<string>();

  // Group updates by field
  const fieldUpdates: Record<string, Record<string, string>> = {};

  for (const [item, translatedText] of translations) {
    if (!fieldUpdates[item.field]) {
      fieldUpdates[item.field] = {
        ...ensureLocaleObject(item.existing),
      };
    }
    fieldUpdates[item.field][item.targetLocale] = translatedText;
    updated++;
    successLocales.add(item.targetLocale);
  }

  // Apply updates
  if (Object.keys(fieldUpdates).length > 0) {
    const updatePayload: Record<string, unknown> = {};
    for (const [field, merged] of Object.entries(fieldUpdates)) {
      updatePayload[field] = merged;
    }

    // Update translated_locales timestamps
    const existingTranslatedLocales =
      (announcement.translated_locales as Record<string, string>) ?? {};
    const mergedLocales: Record<string, string> = {
      ...existingTranslatedLocales,
    };
    for (const loc of successLocales) {
      mergedLocales[loc] = new Date().toISOString();
    }
    updatePayload.translated_locales = mergedLocales;

    await supabase.from("announcements").update(updatePayload).eq("id", announcementId);
  }

  return NextResponse.json({ translated: updated });
}
