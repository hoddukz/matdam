// Tag: core
// Path: apps/web/src/app/api/translate-recipe/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import type { TranslationItem } from "@/lib/recipe/translation-types";
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

  const buildPrompt = (numberedTexts: string, sourceLang: string, targetLang: string) =>
    `You are a recipe translation assistant. Translate the following recipe texts from ${sourceLang} to ${targetLang}.
These are cooking recipe step descriptions, tips, and ingredient names.
Keep the cooking terminology natural and accurate.
Return ONLY the translations in the same numbered format, one per line.
For multi-line content, keep it as a single [N] entry with newlines preserved.

${numberedTexts}`;

  // Group by source→target locale pair to minimize API calls
  const byPair = new Map<string, TranslationItem[]>();
  for (const item of items) {
    const key = `${item.sourceLocale}→${item.targetLocale}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key)!.push(item);
  }

  const translations = new Map<TranslationItem, string>();
  let totalChunks = 0;
  let failedChunks = 0;

  for (const [, pairItems] of byPair) {
    const result = await translatePair(
      anthropic,
      pairItems,
      pairItems[0].sourceLocale,
      pairItems[0].targetLocale,
      buildPrompt,
      { contextLabel: `recipe ${recipeId}` }
    );
    totalChunks += result.totalChunks;
    failedChunks += result.failedChunks;
    for (const [item, text] of result.translations) {
      translations.set(item, text);
    }
  }

  // 7. Update DB with translations
  let updated = 0;
  const itemUpdateSucceeded = new Set<TranslationItem>();

  for (const [item, translatedText] of translations) {
    const merged = { ...ensureLocaleObject(item.existing), [item.targetLocale]: translatedText };

    const idColumn = item.table === "recipes" ? "recipe_id" : "id";
    const { error } = await supabase
      .from(item.table)
      .update({ [item.field]: merged })
      .eq(idColumn, item.rowId);

    if (!error) {
      updated++;
      itemUpdateSucceeded.add(item);
    } else {
      console.error(
        `[translation] DB update failed (recipe ${recipeId}) table=${item.table} field=${item.field} rowId=${item.rowId} targetLocale=${item.targetLocale}:`,
        error.message
      );
    }
  }

  // 8. Update translated_locales — 이번 실행에서 해당 locale로 번역이 필요했던
  //    모든 항목이 전부 성공했을 때만 stamp (일부만 성공한 locale은 stamp하지 않음)
  const itemsByTargetLocale = new Map<string, TranslationItem[]>();
  for (const item of items) {
    if (!itemsByTargetLocale.has(item.targetLocale)) {
      itemsByTargetLocale.set(item.targetLocale, []);
    }
    itemsByTargetLocale.get(item.targetLocale)!.push(item);
  }

  const successLocales = new Set<string>();
  for (const [targetLocale, targetItems] of itemsByTargetLocale) {
    if (targetItems.length === 0) continue;
    const allSucceeded = targetItems.every((item) => itemUpdateSucceeded.has(item));
    if (allSucceeded) successLocales.add(targetLocale);
  }

  if (successLocales.size > 0) {
    const existingTranslatedLocales = (recipe.translated_locales as Record<string, string>) ?? {};
    const merged: Record<string, string> = { ...existingTranslatedLocales };
    for (const loc of successLocales) {
      merged[loc] = new Date().toISOString();
    }
    await supabase.from("recipes").update({ translated_locales: merged }).eq("recipe_id", recipeId);
  }

  // 9. All translation calls failed → surface as an error instead of a silent 200
  if (totalChunks > 0 && failedChunks === totalChunks) {
    return NextResponse.json(
      { error: "all translation calls failed", translated: updated, failed: failedChunks },
      { status: 502 }
    );
  }

  // AI produced at least one translation, but every DB write for it failed →
  // surface as an error instead of a silent 200 (nothing actually persisted).
  const dbFailed = translations.size - updated;
  if (translations.size > 0 && updated === 0) {
    return NextResponse.json(
      { error: "all DB updates failed", translated: 0, failed: failedChunks, dbFailed },
      { status: 502 }
    );
  }

  return NextResponse.json({ translated: updated, failed: failedChunks, dbFailed });
}
