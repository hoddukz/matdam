// Tag: core
// Path: apps/web/src/app/api/translate-recipe/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import type { TranslationItem } from "@/lib/recipe/translation-types";
import { ensureLocaleObject } from "@/lib/recipe/localized-text";

const SUPPORTED_LOCALES = ["ko", "en"] as const;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // 1. Parse request
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const recipeId = body.recipeId as string | undefined;
  const force = body.force === true;
  if (!recipeId) {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }
  if (!UUID_REGEX.test(recipeId)) {
    return NextResponse.json({ error: "invalid recipeId format" }, { status: 400 });
  }

  // 2. API key + service role check (fail fast before expensive DB work)
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

  // 3. Auth check (로그인 사용자만 허용, 소유권 불요)
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

  // 4. Service role client for DB reads/writes (RLS 우회 — 번역은 누구나 트리거 가능)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

  // 5. Recipe fetch
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("recipe_id, author_id, published, title, description, translated_locales")
    .eq("recipe_id", recipeId)
    .single();

  if (recipeError) {
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }
  if (!recipe) {
    return NextResponse.json({ error: "recipe not found" }, { status: 404 });
  }
  if (!recipe.published) {
    return NextResponse.json({ error: "recipe not found" }, { status: 404 });
  }

  // 6. Fetch steps and ingredients
  const [{ data: steps, error: stepsError }, { data: ingredients, error: ingredientsError }] =
    await Promise.all([
      supabase
        .from("recipe_steps")
        .select("id, step_order, description, tip")
        .eq("recipe_id", recipeId)
        .order("step_order"),
      supabase
        .from("recipe_ingredients")
        .select("id, custom_name, note, qualifier, display_order")
        .eq("recipe_id", recipeId)
        .order("display_order"),
    ]);

  if (stepsError || ingredientsError) {
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }

  // 5. Collect texts that need translation
  const items: TranslationItem[] = [];

  function collectItems(
    table: TranslationItem["table"],
    rowId: string,
    field: TranslationItem["field"],
    raw: Record<string, string> | string | null
  ) {
    const jsonb = ensureLocaleObject(raw);
    if (Object.keys(jsonb).length === 0) return;
    const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
    if (presentLocales.length === 0) return;

    const sourceLocale = presentLocales.includes("ko") ? "ko" : presentLocales[0];
    const targetLocales = force
      ? SUPPORTED_LOCALES.filter((l) => l !== sourceLocale)
      : SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));

    for (const targetLocale of targetLocales) {
      items.push({
        table,
        rowId,
        field,
        sourceLocale,
        targetLocale,
        sourceText: jsonb[sourceLocale],
        existing: jsonb,
      });
    }
  }

  // 5a. Recipe title & description
  for (const field of ["title", "description"] as const) {
    collectItems("recipes", recipeId, field, recipe[field] as Record<string, string> | null);
  }

  // 5b. Steps
  for (const step of steps ?? []) {
    for (const field of ["description", "tip"] as const) {
      collectItems("recipe_steps", step.id, field, step[field] as Record<string, string> | null);
    }
  }

  // 5c. Ingredients
  for (const ing of ingredients ?? []) {
    for (const field of ["custom_name", "note", "qualifier"] as const) {
      collectItems(
        "recipe_ingredients",
        ing.id,
        field,
        ing[field] as Record<string, string> | null
      );
    }
  }

  if (items.length === 0) {
    return NextResponse.json({ translated: 0 });
  }

  // 6. Batch translate with Claude Haiku
  const anthropic = new Anthropic({ apiKey });

  const localeNames: Record<string, string> = { ko: "Korean", en: "English" };

  // Group by source→target locale pair to minimize API calls
  const byPair = new Map<string, TranslationItem[]>();
  for (const item of items) {
    const key = `${item.sourceLocale}→${item.targetLocale}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key)!.push(item);
  }

  const translations = new Map<TranslationItem, string>();

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
            content: `You are a recipe translation assistant. Translate the following recipe texts from ${sourceLang} to ${targetLang}.
These are cooking recipe step descriptions, tips, and ingredient names.
Keep the cooking terminology natural and accurate.
Return ONLY the translations in the same numbered format, one per line.

${numberedTexts}`,
          },
        ],
      });
    } catch {
      // Skip this pair on Claude API error, continue with others
      continue;
    }

    if (response.content.length === 0) continue;
    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse numbered responses
    const lines = responseText.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.+)$/);
      if (match) {
        const idx = parseInt(match[1], 10) - 1;
        if (idx >= 0 && idx < pairItems.length) {
          const translatedText = match[2].trim();
          const sourceText = pairItems[idx].sourceText;
          // S3: Skip abnormally long AI responses (> 5x source length)
          // Korean→English often expands 3-4x due to Korean's compact nature
          if (translatedText.length > sourceText.length * 5) continue;
          translations.set(pairItems[idx], translatedText);
        }
      }
    }
  }

  // 7. Update DB with translations
  let updated = 0;
  const successLocales = new Set<string>();

  for (const [item, translatedText] of translations) {
    const merged = { ...ensureLocaleObject(item.existing), [item.targetLocale]: translatedText };

    const idColumn = item.table === "recipes" ? "recipe_id" : "id";
    const { error } = await supabase
      .from(item.table)
      .update({ [item.field]: merged })
      .eq(idColumn, item.rowId);

    if (!error) {
      updated++;
      successLocales.add(item.targetLocale);
    }
  }

  // 8. Update translated_locales — 성공한 locale만 기록
  if (successLocales.size > 0) {
    const existingTranslatedLocales = (recipe.translated_locales as Record<string, string>) ?? {};
    const merged: Record<string, string> = { ...existingTranslatedLocales };
    for (const loc of successLocales) {
      merged[loc] = new Date().toISOString();
    }
    await supabase.from("recipes").update({ translated_locales: merged }).eq("recipe_id", recipeId);
  }

  return NextResponse.json({ translated: updated });
}
