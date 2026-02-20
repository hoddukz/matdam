// Tag: core
// Path: apps/web/src/app/[locale]/recipe/[slug]/remix/page.tsx

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipe/recipe-form";
import type { RecipeFormInitialData } from "@/components/recipe/recipe-form";
import type { IngredientEntry } from "@/components/recipe/ingredient-input";
import { makeStep, type StepEntry } from "@/components/recipe/step-types";

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

  // steps → StepEntry 변환
  const formSteps: StepEntry[] = (steps ?? []).map(
    (s: {
      step_order: number;
      description: string;
      timer_seconds: number | null;
      image_url: string | null;
      tip: string | null;
    }) => {
      const indices: number[] = [];
      (recipeIngredients ?? []).forEach(
        (ing: { step_number: number | null; display_order: number }, idx: number) => {
          if (ing.step_number === s.step_order) {
            indices.push(idx);
          }
        }
      );
      return makeStep({
        description: s.description,
        timer_seconds: s.timer_seconds,
        image_url: s.image_url,
        tip: s.tip,
        ingredient_indices: indices,
      });
    }
  );

  // ingredients → IngredientEntry 변환
  const formIngredients: IngredientEntry[] = (recipeIngredients ?? []).map(
    (ri: {
      ingredient_id: string | null;
      custom_name: string | null;
      amount: number | null;
      unit: string | null;
      qualifier: string | null;
      note: string | null;
      ingredients: { id: string; names: Record<string, string> } | null;
    }) => ({
      ingredient_id: ri.ingredient_id,
      name: ri.ingredients
        ? ri.ingredients.names[locale] || ri.ingredients.names["en"] || ""
        : ri.custom_name || "",
      amount: ri.amount,
      unit: ri.unit,
      qualifier: ri.qualifier,
      note: ri.note,
    })
  );

  const title = recipe.title[locale] || recipe.title["en"] || Object.values(recipe.title)[0] || "";

  const initialData: RecipeFormInitialData = {
    mode: "remix",
    // recipeId, slug 미포함 — 새 레시피 생성
    heroImageUrl: null, // 리믹스 시 원본 이미지는 복사하지 않음
    rawTitle: recipe.title,
    rawDescription: recipe.description,
    parentRecipeId: recipe.recipe_id,
    rootRecipeId: recipe.root_recipe_id ?? recipe.recipe_id,
    title,
    description:
      recipe.description?.[locale] ||
      recipe.description?.["en"] ||
      (recipe.description ? Object.values(recipe.description)[0] : "") ||
      "",
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
