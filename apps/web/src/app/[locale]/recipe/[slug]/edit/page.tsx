// Tag: core
// Path: apps/web/src/app/[locale]/recipe/[slug]/edit/page.tsx

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
  return { title: t("editTitle") };
}

export default async function EditRecipePage({ params }: Props) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 레시피 조회 (published 무관 — 작성자 본인이므로)
  const { data: recipe } = await supabase.from("recipes").select("*").eq("slug", slug).single();

  if (!recipe) notFound();

  // 작성자 확인
  if (recipe.author_id !== user.id) notFound();

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
    mode: "edit",
    recipeId: recipe.recipe_id,
    slug: recipe.slug,
    heroImageUrl: recipe.hero_image_url,
    rawTitle: recipe.title,
    rawDescription: recipe.description,
    title,
    description: getLocalizedText(recipe.description, locale),
    difficulty_level: recipe.difficulty_level ?? "beginner",
    servings: recipe.servings ?? 2,
    prep_time_minutes: recipe.prep_time_minutes ?? undefined,
    cook_time_minutes: recipe.cook_time_minutes ?? undefined,
    ingredients: formIngredients,
    steps: formSteps.length > 0 ? formSteps : [makeStep()],
    dietaryTags: recipe.dietary_tags ?? [],
  };

  return (
    <div>
      <RecipeForm initialData={initialData} />
    </div>
  );
}
