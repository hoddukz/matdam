// Tag: core
// Path: apps/web/src/app/api/translate-announcement/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { ensureLocaleObject } from "@/lib/recipe/localized-text";
import { SUPPORTED_LOCALES } from "@/lib/i18n/constants";
import { translatePair } from "@/lib/translation/translate-pair";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const maxDuration = 60;

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

  const buildPrompt = (numberedTexts: string, sourceLang: string, targetLang: string) =>
    `You are a translation assistant for a food/recipe community website.
Translate the following announcement texts from ${sourceLang} to ${targetLang}.
These are website announcement titles, content (in Markdown format), and summaries.
Keep Markdown formatting intact. Keep the tone professional but friendly.
Return ONLY the translations in the same numbered format, one per line.
For multi-line content, keep it as a single [N] entry with newlines preserved.

${numberedTexts}`;

  // Group by source→target locale pair
  const byPair = new Map<string, TranslationEntry[]>();
  for (const item of items) {
    const key = `${item.sourceLocale}→${item.targetLocale}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key)!.push(item);
  }

  const translations = new Map<TranslationEntry, string>();
  let totalChunks = 0;
  let failedChunks = 0;

  for (const [, pairItems] of byPair) {
    const result = await translatePair(
      anthropic,
      pairItems,
      pairItems[0].sourceLocale,
      pairItems[0].targetLocale,
      buildPrompt,
      { contextLabel: `announcement ${announcementId}` }
    );
    totalChunks += result.totalChunks;
    failedChunks += result.failedChunks;
    for (const [item, text] of result.translations) {
      translations.set(item, text);
    }
  }

  // 8. Update DB with translations
  let updated = 0;

  // Group updates by field
  const fieldUpdates: Record<string, Record<string, string>> = {};

  for (const [item, translatedText] of translations) {
    if (!fieldUpdates[item.field]) {
      fieldUpdates[item.field] = {
        ...ensureLocaleObject(item.existing),
      };
    }
    fieldUpdates[item.field][item.targetLocale] = translatedText;
  }

  // Apply updates — only report items as translated if the DB write actually succeeds.
  // There is a single combined update, so a failure here means nothing persisted.
  if (Object.keys(fieldUpdates).length > 0) {
    const updatePayload: Record<string, unknown> = {};
    for (const [field, merged] of Object.entries(fieldUpdates)) {
      updatePayload[field] = merged;
    }

    // translated_locales — 이번 실행에서 해당 locale로 번역이 필요했던 모든 항목이
    // 전부 성공했을 때만 stamp (일부 필드만 성공한 locale은 stamp하지 않음)
    const itemsByTargetLocale = new Map<string, TranslationEntry[]>();
    for (const item of items) {
      if (!itemsByTargetLocale.has(item.targetLocale)) {
        itemsByTargetLocale.set(item.targetLocale, []);
      }
      itemsByTargetLocale.get(item.targetLocale)!.push(item);
    }

    const successLocales = new Set<string>();
    for (const [targetLocale, targetItems] of itemsByTargetLocale) {
      if (targetItems.length === 0) continue;
      const allSucceeded = targetItems.every((item) => translations.has(item));
      if (allSucceeded) successLocales.add(targetLocale);
    }

    if (successLocales.size > 0) {
      const existingTranslatedLocales =
        (announcement.translated_locales as Record<string, string>) ?? {};
      const mergedLocales: Record<string, string> = {
        ...existingTranslatedLocales,
      };
      for (const loc of successLocales) {
        mergedLocales[loc] = new Date().toISOString();
      }
      updatePayload.translated_locales = mergedLocales;
    }

    const { error: updateError } = await supabase
      .from("announcements")
      .update(updatePayload)
      .eq("id", announcementId);

    if (updateError) {
      console.error(
        `[translation] DB update failed (announcement ${announcementId}):`,
        updateError.message
      );
      return NextResponse.json(
        { error: "DB update failed", translated: 0, failed: failedChunks },
        { status: 502 }
      );
    }

    updated = translations.size;
  }

  // All translation calls failed → surface as an error instead of a silent 200
  if (totalChunks > 0 && failedChunks === totalChunks) {
    return NextResponse.json(
      { error: "all translation calls failed", translated: updated, failed: failedChunks },
      { status: 502 }
    );
  }

  return NextResponse.json({ translated: updated, failed: failedChunks });
}
