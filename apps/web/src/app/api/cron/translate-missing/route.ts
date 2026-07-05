// Tag: core
// Path: apps/web/src/app/api/cron/translate-missing/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { timingSafeEqual } from "crypto";
import type { TranslationItem } from "@/lib/recipe/translation-types";
import { ensureLocaleObject } from "@/lib/recipe/localized-text";
import { SUPPORTED_LOCALES } from "@/lib/i18n/constants";
import { translatePair } from "@/lib/translation/translate-pair";
const MAX_RECIPES_PER_RUN = 5;

export const maxDuration = 60;

export async function GET(request: Request) {
  // 1. Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is not set");
    return NextResponse.json({ error: "server misconfiguration" }, { status: 500 });
  }
  const expectedBearer = `Bearer ${cronSecret ?? ""}`;
  const providedBearer = authHeader ?? "";
  const secretsMatch =
    cronSecret &&
    providedBearer.length === expectedBearer.length &&
    timingSafeEqual(Buffer.from(providedBearer), Buffer.from(expectedBearer));
  if (!secretsMatch) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Service role client (bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 3. Anthropic client
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }
  const anthropic = new Anthropic({ apiKey });

  // 4. Find recipes with untranslated steps
  //    A step description JSONB with only 1 locale key means translation is missing
  const { data: untranslatedSteps } = await supabase
    .from("recipe_steps")
    .select("recipe_id, description")
    .not("description", "is", null)
    .limit(1000);

  const recipeIdsNeedingTranslation = new Set<string>();
  for (const step of untranslatedSteps ?? []) {
    const jsonb = ensureLocaleObject(step.description as Record<string, string> | string | null);
    if (Object.keys(jsonb).length === 0) continue;
    const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
    const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));
    if (missingLocales.length > 0 && presentLocales.length > 0) {
      recipeIdsNeedingTranslation.add(step.recipe_id);
    }
  }

  // Also check recipe title/description JSONB
  const { data: recipes } = await supabase
    .from("recipes")
    .select("recipe_id, title, description")
    .limit(1000);

  for (const recipe of recipes ?? []) {
    for (const field of ["title", "description"] as const) {
      const jsonb = ensureLocaleObject(recipe[field] as Record<string, string> | string | null);
      if (Object.keys(jsonb).length === 0) continue;
      const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
      const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));
      if (missingLocales.length > 0 && presentLocales.length > 0) {
        recipeIdsNeedingTranslation.add(recipe.recipe_id);
      }
    }
  }

  const targetRecipeIds = Array.from(recipeIdsNeedingTranslation).slice(0, MAX_RECIPES_PER_RUN);

  if (targetRecipeIds.length === 0) {
    return NextResponse.json({ processed: 0, translated: 0 });
  }

  // 5. Translate each recipe
  let totalTranslated = 0;
  let totalChunksAll = 0;
  let totalFailedChunksAll = 0;
  let totalAiTranslatedAll = 0;
  let totalDbFailedAll = 0;

  const buildPrompt = (numberedTexts: string, sourceLang: string, targetLang: string) =>
    `You are a recipe translation assistant. Translate the following recipe texts from ${sourceLang} to ${targetLang}.
These are cooking recipe titles, descriptions, step descriptions, tips, and ingredient names.
Keep the cooking terminology natural and accurate.
Return ONLY the translations in the same numbered format, one per line.
For multi-line content, keep it as a single [N] entry with newlines preserved.

${numberedTexts}`;

  for (const recipeId of targetRecipeIds) {
    const items: TranslationItem[] = [];

    // Fetch recipe, steps, and ingredients in parallel
    const [{ data: recipe }, { data: steps }, { data: ingredients }] = await Promise.all([
      supabase
        .from("recipes")
        .select("recipe_id, title, description, translated_locales")
        .eq("recipe_id", recipeId)
        .single(),
      supabase
        .from("recipe_steps")
        .select("id, step_order, description, tip")
        .eq("recipe_id", recipeId)
        .order("step_order"),
      supabase
        .from("recipe_ingredients")
        .select("id, custom_name, display_order")
        .eq("recipe_id", recipeId)
        .order("display_order"),
    ]);

    if (recipe) {
      for (const field of ["title", "description"] as const) {
        const jsonb = ensureLocaleObject(recipe[field] as Record<string, string> | string | null);
        if (Object.keys(jsonb).length === 0) continue;
        const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
        const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));
        if (missingLocales.length === 0 || presentLocales.length === 0) continue;
        const sourceLocale = presentLocales.includes("ko") ? "ko" : presentLocales[0];
        for (const targetLocale of missingLocales) {
          items.push({
            table: "recipes",
            rowId: recipeId,
            field,
            sourceLocale,
            targetLocale,
            sourceText: jsonb[sourceLocale],
            existing: jsonb,
          });
        }
      }
    }

    for (const step of steps ?? []) {
      for (const field of ["description", "tip"] as const) {
        const jsonb = ensureLocaleObject(step[field] as Record<string, string> | string | null);
        if (Object.keys(jsonb).length === 0) continue;
        const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
        const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));
        if (missingLocales.length === 0 || presentLocales.length === 0) continue;
        const sourceLocale = presentLocales.includes("ko") ? "ko" : presentLocales[0];
        for (const targetLocale of missingLocales) {
          items.push({
            table: "recipe_steps",
            rowId: step.id,
            field,
            sourceLocale,
            targetLocale,
            sourceText: jsonb[sourceLocale],
            existing: jsonb,
          });
        }
      }
    }

    for (const ing of ingredients ?? []) {
      const jsonb = ensureLocaleObject(ing.custom_name as Record<string, string> | string | null);
      if (Object.keys(jsonb).length === 0) continue;
      const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
      const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));
      if (missingLocales.length === 0 || presentLocales.length === 0) continue;
      const sourceLocale = presentLocales.includes("ko") ? "ko" : presentLocales[0];
      for (const targetLocale of missingLocales) {
        items.push({
          table: "recipe_ingredients",
          rowId: ing.id,
          field: "custom_name",
          sourceLocale,
          targetLocale,
          sourceText: jsonb[sourceLocale],
          existing: jsonb,
        });
      }
    }

    if (items.length === 0) continue;

    // Group by source→target locale pair
    const byPair = new Map<string, TranslationItem[]>();
    for (const item of items) {
      const key = `${item.sourceLocale}→${item.targetLocale}`;
      if (!byPair.has(key)) byPair.set(key, []);
      byPair.get(key)!.push(item);
    }

    const translations = new Map<TranslationItem, string>();

    for (const [, pairItems] of byPair) {
      const result = await translatePair(
        anthropic,
        pairItems,
        pairItems[0].sourceLocale,
        pairItems[0].targetLocale,
        buildPrompt,
        { contextLabel: `recipe ${recipeId}` }
      );
      totalChunksAll += result.totalChunks;
      totalFailedChunksAll += result.failedChunks;
      for (const [item, text] of result.translations) {
        translations.set(item, text);
      }
    }

    totalAiTranslatedAll += translations.size;

    // Update DB
    const itemUpdateSucceeded = new Set<TranslationItem>();
    for (const [item, translatedText] of translations) {
      const merged = { ...ensureLocaleObject(item.existing), [item.targetLocale]: translatedText };
      const idColumn = item.table === "recipes" ? "recipe_id" : "id";
      const { error } = await supabase
        .from(item.table)
        .update({ [item.field]: merged })
        .eq(idColumn, item.rowId);
      if (!error) {
        totalTranslated++;
        itemUpdateSucceeded.add(item);
      } else {
        totalDbFailedAll++;
        console.error(
          `[translation] DB update failed (recipe ${recipeId}) table=${item.table} field=${item.field} rowId=${item.rowId} targetLocale=${item.targetLocale}:`,
          error.message
        );
      }
    }

    // Stamp translated_locales — 이번 실행에서 해당 locale로 번역이 필요했던
    // 모든 항목이 전부 성공했을 때만 stamp
    if (recipe) {
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
        const existingTranslatedLocales =
          (recipe.translated_locales as Record<string, string>) ?? {};
        const merged: Record<string, string> = { ...existingTranslatedLocales };
        for (const loc of successLocales) {
          merged[loc] = new Date().toISOString();
        }
        await supabase
          .from("recipes")
          .update({ translated_locales: merged })
          .eq("recipe_id", recipeId);
      }
    }
  }

  // All translation calls failed across every recipe processed this run
  if (totalChunksAll > 0 && totalFailedChunksAll === totalChunksAll) {
    return NextResponse.json(
      {
        error: "all translation calls failed",
        processed: targetRecipeIds.length,
        translated: totalTranslated,
        failed: totalFailedChunksAll,
      },
      { status: 502 }
    );
  }

  // AI produced translations across this run, but every single DB write failed →
  // surface as an error instead of a silent 200 (nothing actually persisted).
  if (totalAiTranslatedAll > 0 && totalTranslated === 0) {
    return NextResponse.json(
      {
        error: "all DB updates failed",
        processed: targetRecipeIds.length,
        translated: 0,
        failed: totalFailedChunksAll,
        dbFailed: totalDbFailedAll,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    processed: targetRecipeIds.length,
    translated: totalTranslated,
    failed: totalFailedChunksAll,
    dbFailed: totalDbFailedAll,
  });
}
