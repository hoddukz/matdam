// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/shopping-list/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { Button } from "@/components/ui/button";
import { ShoppingListClient, type ShoppingItem } from "@/components/shopping/shopping-list-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shoppingList" });
  return { title: t("title") };
}

type RawIngredientRow = {
  recipe_id: string;
  ingredient_id: string | null;
  custom_name: string | null;
  amount: number | null;
  unit: string | null;
  ingredients: { names: Record<string, string>; category: string | null } | null;
  recipes: { recipe_id: string; title: Record<string, string>; slug: string } | null;
};

export default async function ShoppingListPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations({ locale, namespace: "shoppingList" });

  // 1. Fetch bookmarked recipe IDs
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("recipe_id")
    .eq("user_id", user.id);

  const bookmarkedIds = (bookmarks ?? []).map((b: { recipe_id: string }) => b.recipe_id);

  if (bookmarkedIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
        <p className="mb-2 text-muted-foreground">{t("description")}</p>
        <p className="mb-6 text-muted-foreground">{t("noBookmarks")}</p>
        <Button asChild>
          <Link href={`/${locale}/explore`}>{t("exploreCta")}</Link>
        </Button>
      </div>
    );
  }

  // 2. Fetch all recipe_ingredients for bookmarked recipes, joined with ingredients and recipes
  const { data: rawRows } = await supabase
    .from("recipe_ingredients")
    .select(
      "recipe_id, ingredient_id, custom_name, amount, unit, ingredients(names, category), recipes(recipe_id, title, slug)"
    )
    .in("recipe_id", bookmarkedIds);

  const rows = (rawRows ?? []) as unknown as RawIngredientRow[];

  // 3. Build recipe map for display (title, slug per recipeId)
  const recipeMap = new Map<string, { recipeId: string; title: string; slug: string }>();
  for (const row of rows) {
    if (row.recipes && !recipeMap.has(row.recipe_id)) {
      recipeMap.set(row.recipe_id, {
        recipeId: row.recipe_id,
        title: getLocalizedText(row.recipes.title, locale),
        slug: row.recipes.slug,
      });
    }
  }

  // For bookmarked recipes that had no ingredients, still include them in the recipe selector.
  // We need their titles — fetch separately for any missing IDs.
  const missingIds = bookmarkedIds.filter((id) => !recipeMap.has(id));
  if (missingIds.length > 0) {
    const { data: missingRecipes } = await supabase
      .from("recipes")
      .select("recipe_id, title, slug")
      .in("recipe_id", missingIds);
    for (const r of missingRecipes ?? []) {
      recipeMap.set(r.recipe_id, {
        recipeId: r.recipe_id,
        title: getLocalizedText(r.title, locale),
        slug: r.slug,
      });
    }
  }

  // 4. Merge/group ingredients
  const mergedMap = new Map<string, ShoppingItem>();

  for (const row of rows) {
    const recipeInfo = recipeMap.get(row.recipe_id);
    if (!recipeInfo) continue;

    let key: string;
    let name: string;
    let category: string | null = null;

    if (row.ingredient_id && row.ingredients) {
      // Standard ingredient: group by ingredient_id + unit
      key = `${row.ingredient_id}::${row.unit ?? ""}`;
      name = getLocalizedText(row.ingredients.names, locale);
      category = row.ingredients.category ?? null;
    } else {
      // Custom ingredient: group by custom_name + unit
      const customName = row.custom_name ?? "";
      key = `custom::${customName.toLowerCase()}::${row.unit ?? ""}`;
      name = customName;
    }

    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!;
      // Sum amounts (only when both are numeric)
      if (row.amount != null && existing.totalAmount != null) {
        existing.totalAmount += row.amount;
      } else if (row.amount != null && existing.totalAmount == null) {
        existing.totalAmount = row.amount;
      }
      // Add source recipe if not already present
      if (!existing.sources.some((s) => s.recipeId === recipeInfo.recipeId)) {
        existing.sources.push(recipeInfo);
      }
    } else {
      mergedMap.set(key, {
        key,
        name,
        totalAmount: row.amount,
        unit: row.unit,
        category,
        sources: [recipeInfo],
      });
    }
  }

  const items = Array.from(mergedMap.values());

  // Preserve bookmark order for recipes list
  const recipes = bookmarkedIds
    .map((id) => recipeMap.get(id))
    .filter((r): r is { recipeId: string; title: string; slug: string } => r != null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <ShoppingListClient recipes={recipes} items={items} />
    </div>
  );
}
