// Tag: core
// Path: apps/web/src/app/[locale]/recipe/[slug]/cook/page.tsx

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { CookingMode } from "@/components/recipe/cooking-mode";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const getRecipeWithStepCount = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: recipe } = await supabase
    .from("recipes")
    .select("recipe_id, title, slug")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (!recipe) return null;
  const { count } = await supabase
    .from("recipe_steps")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipe.recipe_id);
  return { ...recipe, stepCount: count ?? 0 };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const recipe = await getRecipeWithStepCount(slug);
  if (!recipe) return { title: "Not Found" };
  const title = getLocalizedText(recipe.title, locale);
  const t = await getTranslations({ locale, namespace: "cookingMode" });
  return { title: `${t("stepOf", { current: 1, total: recipe.stepCount })} — ${title}` };
}

export default async function CookPage({ params }: Props) {
  const { locale, slug } = await params;
  const supabase = await createClient();

  const recipe = await getRecipeWithStepCount(slug);
  if (!recipe) notFound();

  const [{ data: steps }, { data: recipeIngredients }] = await Promise.all([
    supabase.from("recipe_steps").select("*").eq("recipe_id", recipe.recipe_id).order("step_order"),
    supabase
      .from("recipe_ingredients")
      .select("*, ingredients(names, category)")
      .eq("recipe_id", recipe.recipe_id)
      .order("display_order"),
  ]);

  if (!steps || steps.length === 0) notFound();

  // Group ingredients by step_number
  const ingredientsByStep: Record<number, NonNullable<typeof recipeIngredients>> = {};
  for (const ing of recipeIngredients ?? []) {
    if (ing.step_number != null) {
      if (!ingredientsByStep[ing.step_number]) {
        ingredientsByStep[ing.step_number] = [];
      }
      ingredientsByStep[ing.step_number]!.push(ing);
    }
  }

  return (
    <CookingMode
      recipe={{ title: recipe.title, slug: recipe.slug }}
      steps={steps}
      ingredientsByStep={ingredientsByStep}
      locale={locale}
    />
  );
}
