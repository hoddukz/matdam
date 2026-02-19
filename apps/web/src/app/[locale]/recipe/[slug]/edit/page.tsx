// Tag: core
// Path: apps/web/src/app/[locale]/recipe/[slug]/edit/page.tsx

import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipe/recipe-form";
import type { RecipeFormInitialData } from "@/components/recipe/recipe-form";
import type { IngredientEntry } from "@/components/recipe/ingredient-input";
import type { StepEntry } from "@/components/recipe/step-editor";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

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

  // steps → StepEntry 변환
  // ingredient_indices 재구성: step_number와 ingredient display_order 매핑
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
      return {
        description: s.description,
        timer_seconds: s.timer_seconds,
        image_url: s.image_url,
        tip: s.tip,
        ingredient_indices: indices,
      };
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
    recipeId: recipe.recipe_id,
    slug: recipe.slug,
    heroImageUrl: recipe.hero_image_url,
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
    steps:
      formSteps.length > 0
        ? formSteps
        : [
            {
              description: "",
              timer_seconds: null,
              image_url: null,
              tip: null,
              ingredient_indices: [],
            },
          ],
  };

  const t = await getTranslations("recipe");

  return (
    <div>
      <title>{t("editTitle")}</title>
      <RecipeForm initialData={initialData} />
    </div>
  );
}
