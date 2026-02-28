// Tag: core
// Path: apps/web/src/app/api/recipe-translation/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureLocaleObject } from "@/lib/recipe/localized-text";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPPORTED_LOCALES = ["ko", "en"] as const;
const VALID_TABLES = ["recipes", "recipe_steps", "recipe_ingredients"] as const;
type ValidTable = (typeof VALID_TABLES)[number];

const VALID_FIELDS: Record<ValidTable, string[]> = {
  recipes: ["title", "description"],
  recipe_steps: ["description", "tip"],
  recipe_ingredients: ["custom_name", "note", "qualifier"],
};

export async function PATCH(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { recipeId, table, rowId, field, locale, value } = body as {
    recipeId?: string;
    table?: string;
    rowId?: string;
    field?: string;
    locale?: string;
    value?: string;
  };

  if (!recipeId || !table || !rowId || !field || !locale || typeof value !== "string") {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }
  if (!UUID_REGEX.test(recipeId) || !UUID_REGEX.test(rowId)) {
    return NextResponse.json({ error: "invalid ID format" }, { status: 400 });
  }
  if (!VALID_TABLES.includes(table as ValidTable)) {
    return NextResponse.json({ error: "invalid table" }, { status: 400 });
  }
  if (!VALID_FIELDS[table as ValidTable].includes(field)) {
    return NextResponse.json({ error: "invalid field" }, { status: 400 });
  }
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    return NextResponse.json({ error: "invalid locale" }, { status: 400 });
  }

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
            cookiesToSet.forEach(({ name, value: v, options }) =>
              cookieStore.set(name, v, options)
            );
          } catch {
            // ignored in API route
          }
        },
      },
    }
  );

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Recipe ownership verification
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("recipe_id, author_id, translated_locales")
    .eq("recipe_id", recipeId)
    .single();

  if (recipeError || !recipe) {
    return NextResponse.json({ error: "recipe not found" }, { status: 404 });
  }
  if (recipe.author_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Fetch current JSONB value (recipe_id 검증으로 cross-recipe 쓰기 방지)
  const isRecipesTable = (table as ValidTable) === "recipes";
  const idColumn = isRecipesTable ? "recipe_id" : "id";

  let query = supabase.from(table).select(field).eq(idColumn, rowId);
  if (!isRecipesTable) query = query.eq("recipe_id", recipeId);
  const { data: row, error: fetchError } = await query.single();

  if (fetchError || !row) {
    return NextResponse.json({ error: "row not found" }, { status: 404 });
  }

  // Merge locale into JSONB (string이 spread되면 character-indexed key 손상 발생 방지)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawExisting = (row as any)[field];
  const existing = ensureLocaleObject(rawExisting);
  const merged = { ...existing, [locale]: value };

  let updateQuery = supabase
    .from(table)
    .update({ [field]: merged })
    .eq(idColumn, rowId);
  if (!isRecipesTable) updateQuery = updateQuery.eq("recipe_id", recipeId);
  const { error: updateError } = await updateQuery;

  if (updateError) {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  // Update translated_locales to mark this locale as up-to-date
  const existingTranslatedLocales = (recipe.translated_locales as Record<string, string>) ?? {};
  const updatedTranslatedLocales = {
    ...existingTranslatedLocales,
    [locale]: new Date().toISOString(),
  };
  await supabase
    .from("recipes")
    .update({ translated_locales: updatedTranslatedLocales })
    .eq("recipe_id", recipeId);

  return NextResponse.json({ ok: true });
}
