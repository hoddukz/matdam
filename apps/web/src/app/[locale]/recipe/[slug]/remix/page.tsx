// Tag: core
// Path: apps/web/src/app/[locale]/recipe/[slug]/remix/page.tsx

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipe/recipe-form";
import type { RecipeFormInitialData } from "@/components/recipe/recipe-form";
import { makeStep } from "@/components/recipe/step-types";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { dbStepsToForm, dbIngredientsToForm } from "@/lib/recipe/transforms";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recipe" });
  return { title: t("remixTitle") };
}

export default async function RemixRecipePage({ params }: Props) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 원본 레시피 조회 (published만 리믹스 가능)
  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!recipe) notFound();

  // steps + ingredients 병렬 조회
  const [{ data: steps }, { data: recipeIngredients }] = await Promise.all([
    supabase.from("recipe_steps").select("*").eq("recipe_id", recipe.recipe_id).order("step_order"),
    supabase
      .from("recipe_ingredients")
      .select("*, ingredients(id, names, category)")
      .eq("recipe_id", recipe.recipe_id)
      .order("display_order"),
  ]);

  const formSteps = dbStepsToForm(steps ?? [], recipeIngredients ?? []);

  const formIngredients = dbIngredientsToForm(recipeIngredients ?? [], locale);

  const title = getLocalizedText(recipe.title, locale);

  const initialData: RecipeFormInitialData = {
    mode: "remix",
    // recipeId, slug 미포함 — 새 레시피 생성
    heroImageUrl: null, // 리믹스 시 원본 이미지는 복사하지 않음
    rawTitle: recipe.title,
    rawDescription: recipe.description,
    parentRecipeId: recipe.recipe_id,
    rootRecipeId: recipe.root_recipe_id ?? recipe.recipe_id,
    title,
    description: getLocalizedText(recipe.description, locale),
    difficulty_level: recipe.difficulty_level ?? "beginner",
    servings: recipe.servings ?? 2,
    prep_time_minutes: recipe.prep_time_minutes ?? undefined,
    cook_time_minutes: recipe.cook_time_minutes ?? undefined,
    ingredients: formIngredients,
    steps: formSteps.length > 0 ? formSteps : [makeStep()],
  };

  return (
    <div>
      <RecipeForm initialData={initialData} />
    </div>
  );
}
