// Tag: core
// Path: apps/web/src/app/api/cron/translate-missing/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { timingSafeEqual } from "crypto";

const SUPPORTED_LOCALES = ["ko", "en"] as const;
const MAX_RECIPES_PER_RUN = 5;

export async function GET(request: Request) {
  // 1. Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
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
    .not("description", "is", null);

  const recipeIdsNeedingTranslation = new Set<string>();
  for (const step of untranslatedSteps ?? []) {
    const jsonb = step.description as Record<string, string> | null;
    if (!jsonb) continue;
    const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
    const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));
    if (missingLocales.length > 0 && presentLocales.length > 0) {
      recipeIdsNeedingTranslation.add(step.recipe_id);
    }
  }

  // Also check recipe title/description JSONB
  const { data: recipes } = await supabase.from("recipes").select("recipe_id, title, description");

  for (const recipe of recipes ?? []) {
    for (const field of ["title", "description"] as const) {
      const jsonb = recipe[field] as Record<string, string> | null;
      if (!jsonb) continue;
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

  type TranslationItem = {
    table: "recipe_steps" | "recipe_ingredients" | "recipes";
    rowId: string;
    field: "description" | "tip" | "custom_name" | "title";
    sourceLocale: string;
    targetLocale: string;
    sourceText: string;
    existing: Record<string, string>;
  };

  const localeNames: Record<string, string> = { ko: "Korean", en: "English" };

  for (const recipeId of targetRecipeIds) {
    const items: TranslationItem[] = [];

    // Fetch recipe, steps, and ingredients in parallel
    const [{ data: recipe }, { data: steps }, { data: ingredients }] = await Promise.all([
      supabase
        .from("recipes")
        .select("recipe_id, title, description")
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
        const jsonb = recipe[field] as Record<string, string> | null;
        if (!jsonb) continue;
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
        const jsonb = step[field] as Record<string, string> | null;
        if (!jsonb) continue;
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
      const jsonb = ing.custom_name as Record<string, string> | null;
      if (!jsonb) continue;
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
      const sourceLang = localeNames[pairItems[0].sourceLocale] ?? pairItems[0].sourceLocale;
      const targetLang = localeNames[pairItems[0].targetLocale] ?? pairItems[0].targetLocale;
      const numberedTexts = pairItems.map((item, i) => `[${i + 1}] ${item.sourceText}`).join("\n");

      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `You are a recipe translation assistant. Translate the following recipe texts from ${sourceLang} to ${targetLang}.
These are cooking recipe titles, descriptions, step descriptions, tips, and ingredient names.
Keep the cooking terminology natural and accurate.
Return ONLY the translations in the same numbered format, one per line.

${numberedTexts}`,
            },
          ],
        });

        const responseText = response.content[0].type === "text" ? response.content[0].text : "";

        const lines = responseText.split("\n").filter((l) => l.trim());
        for (const line of lines) {
          const match = line.match(/^\[(\d+)\]\s*(.+)$/);
          if (match) {
            const idx = parseInt(match[1], 10) - 1;
            if (idx >= 0 && idx < pairItems.length) {
              const translatedText = match[2].trim();
              const sourceText = pairItems[idx].sourceText;
              // S3: Skip abnormally long AI responses (> 3x source length)
              if (translatedText.length > sourceText.length * 3) continue;
              translations.set(pairItems[idx], translatedText);
            }
          }
        }
      } catch {
        // Skip this pair on error, continue with others
        continue;
      }
    }

    // Update DB
    for (const [item, translatedText] of translations) {
      const merged = { ...item.existing, [item.targetLocale]: translatedText };
      const idColumn = item.table === "recipes" ? "recipe_id" : "id";
      const { error } = await supabase
        .from(item.table)
        .update({ [item.field]: merged })
        .eq(idColumn, item.rowId);
      if (!error) totalTranslated++;
    }
  }

  return NextResponse.json({
    processed: targetRecipeIds.length,
    translated: totalTranslated,
  });
}
