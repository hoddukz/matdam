// Tag: core
// Path: apps/web/src/app/api/translate-recipe/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";

const SUPPORTED_LOCALES = ["ko", "en"] as const;

export async function POST(request: Request) {
  // 1. Parse request
  const body = await request.json();
  const recipeId = body.recipeId as string | undefined;
  if (!recipeId) {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }

  // 2. Auth check
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 3. Recipe ownership verification
  const { data: recipe } = await supabase
    .from("recipes")
    .select("recipe_id, author_id, title, description")
    .eq("recipe_id", recipeId)
    .single();

  if (!recipe || recipe.author_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 4. Fetch steps and ingredients
  const [{ data: steps }, { data: ingredients }] = await Promise.all([
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

  // 5. Collect texts that need translation
  type TranslationItem = {
    table: "recipe_steps" | "recipe_ingredients" | "recipes";
    rowId: string;
    field: "description" | "tip" | "custom_name" | "title";
    sourceLocale: string;
    targetLocale: string;
    sourceText: string;
    existing: Record<string, string>;
  };

  const items: TranslationItem[] = [];

  // 5a. Recipe title & description
  for (const field of ["title", "description"] as const) {
    const jsonb = recipe[field] as Record<string, string> | null;
    if (!jsonb) continue;

    const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
    const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));

    if (missingLocales.length === 0 || presentLocales.length === 0) continue;

    const sourceLocale = presentLocales[0];
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

  // 5b. Steps
  for (const step of steps ?? []) {
    for (const field of ["description", "tip"] as const) {
      const jsonb = step[field] as Record<string, string> | null;
      if (!jsonb) continue;

      const presentLocales = Object.keys(jsonb).filter((k) => jsonb[k]?.trim());
      const missingLocales = SUPPORTED_LOCALES.filter((l) => !presentLocales.includes(l));

      if (missingLocales.length === 0 || presentLocales.length === 0) continue;

      const sourceLocale = presentLocales[0];
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

    const sourceLocale = presentLocales[0];
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

  if (items.length === 0) {
    return NextResponse.json({ translated: 0 });
  }

  // 6. Batch translate with Claude Haiku
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

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

    const response = await anthropic.messages.create({
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

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse numbered responses
    const lines = responseText.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.+)$/);
      if (match) {
        const idx = parseInt(match[1], 10) - 1;
        if (idx >= 0 && idx < pairItems.length) {
          translations.set(pairItems[idx], match[2].trim());
        }
      }
    }
  }

  // 7. Update DB with translations
  let updated = 0;

  for (const [item, translatedText] of translations) {
    const merged = { ...item.existing, [item.targetLocale]: translatedText };

    const idColumn = item.table === "recipes" ? "recipe_id" : "id";
    const { error } = await supabase
      .from(item.table)
      .update({ [item.field]: merged })
      .eq(idColumn, item.rowId);

    if (!error) updated++;
  }

  return NextResponse.json({ translated: updated });
}
