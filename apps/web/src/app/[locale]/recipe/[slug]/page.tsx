// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/recipe/[slug]/page.tsx

import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeIngredientList } from "@/components/recipe/recipe-detail-client";
import { DeleteRecipeButton } from "@/components/recipe/delete-recipe-button";
import { Clock, Users, ChefHat, Lightbulb, Pencil } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// React.cache로 동일 요청 내 generateMetadata + page 쿼리 중복 제거
const getRecipe = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("*, users!inner(display_name, avatar_url)")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) return { title: "Recipe Not Found" };

  const title =
    recipe.title[locale] || recipe.title["en"] || Object.values(recipe.title)[0] || "Recipe";
  const description = recipe.description?.[locale] || recipe.description?.["en"] || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      images: recipe.hero_image_url ? [recipe.hero_image_url] : [],
    },
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "recipeDetail" });
  const supabase = await createClient();

  // 1. Get recipe with author (cached — deduped with generateMetadata)
  const [
    recipe,
    {
      data: { user },
    },
  ] = await Promise.all([getRecipe(slug), supabase.auth.getUser()]);

  if (!recipe) notFound();

  const isAuthor = user?.id === recipe.author_id;

  // 2+3. Get steps and ingredients in parallel
  const [{ data: steps }, { data: recipeIngredients }] = await Promise.all([
    supabase.from("recipe_steps").select("*").eq("recipe_id", recipe.recipe_id).order("step_order"),
    supabase
      .from("recipe_ingredients")
      .select("*, ingredients(names, category)")
      .eq("recipe_id", recipe.recipe_id)
      .order("display_order"),
  ]);

  const title = recipe.title[locale] || recipe.title["en"] || Object.values(recipe.title)[0] || "";
  const description = recipe.description?.[locale] || recipe.description?.["en"] || "";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: title,
    description,
    image: recipe.hero_image_url,
    author: { "@type": "Person", name: recipe.users?.display_name ?? "Unknown" },
    prepTime: recipe.prep_time_minutes ? `PT${recipe.prep_time_minutes}M` : undefined,
    cookTime: recipe.cook_time_minutes ? `PT${recipe.cook_time_minutes}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeCategory: "Korean",
    recipeCuisine: "Korean",
    recipeIngredient: (recipeIngredients ?? []).map(
      (ri: {
        amount: number | null;
        unit: string | null;
        custom_name: string | null;
        ingredients: { names: Record<string, string> } | null;
      }) => {
        const name = ri.ingredients
          ? ri.ingredients.names[locale] || ri.ingredients.names["en"] || ""
          : ri.custom_name || "";
        return ri.amount ? `${ri.amount} ${ri.unit || ""} ${name}`.trim() : name;
      }
    ),
    recipeInstructions: (steps ?? []).map((s: { step_order: number; description: string }) => ({
      "@type": "HowToStep",
      position: s.step_order,
      text: s.description,
    })),
  };

  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />

      <article className="mx-auto max-w-3xl px-4 py-8">
        {/* Hero Image */}
        {recipe.hero_image_url && (
          <div className="mb-6 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recipe.hero_image_url}
              alt={title}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mb-4 text-muted-foreground">{description}</p>}

          {/* Author + 수정/삭제 버튼 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("by")}{" "}
              <span className="font-medium text-foreground">{recipe.users.display_name}</span>
            </p>
            {isAuthor && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <Link href={`/${locale}/recipe/${slug}/edit`}>
                    <Pencil className="h-4 w-4" />
                    {t("edit")}
                  </Link>
                </Button>
                <DeleteRecipeButton recipeId={recipe.recipe_id} />
              </div>
            )}
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {recipe.difficulty_level && (
              <Badge variant="secondary" className="gap-1 capitalize">
                <ChefHat className="h-3 w-3" />
                {recipe.difficulty_level}
              </Badge>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {recipe.servings} {t("servings")}
              </span>
            )}
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalTime} {t("minutes")}
              </span>
            )}
            {recipe.prep_time_minutes && (
              <span className="text-xs">
                {t("prepTime")}: {recipe.prep_time_minutes}
                {t("minutes")}
              </span>
            )}
            {recipe.cook_time_minutes && (
              <span className="text-xs">
                {t("cookTime")}: {recipe.cook_time_minutes}
                {t("minutes")}
              </span>
            )}
          </div>
        </header>

        {/* Ingredients - client component for unit toggle */}
        {recipeIngredients && recipeIngredients.length > 0 && (
          <section className="mb-10">
            <RecipeIngredientList ingredients={recipeIngredients} />
          </section>
        )}

        {/* Steps */}
        {steps && steps.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t("steps")}</h2>
            {steps.map(
              (step: {
                id: string;
                step_order: number;
                description: string;
                timer_seconds: number | null;
                image_url: string | null;
                tip: string | null;
              }) => (
                <Card key={step.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {t("stepNumber", { number: step.step_order })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="whitespace-pre-line">{step.description}</p>

                    {step.image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={step.image_url}
                        alt={`${t("stepNumber", { number: step.step_order })}`}
                        className="rounded-lg"
                      />
                    )}

                    <div className="flex flex-wrap gap-3">
                      {step.timer_seconds != null && step.timer_seconds > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(step.timer_seconds / 60)}:
                          {String(step.timer_seconds % 60).padStart(2, "0")}
                        </Badge>
                      )}
                      {step.tip && (
                        <div className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-sm">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-matdam-gold" />
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </section>
        )}
      </article>
    </>
  );
}
