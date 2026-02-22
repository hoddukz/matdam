// Tag: core
// Path: apps/web/src/app/[locale]/glossary/[id]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { CATEGORY_LABEL_KEYS, DIETARY_FLAG_LABELS } from "@/lib/recipe/glossary-constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type Ingredient = {
  id: string;
  names: Record<string, string>;
  category: string;
  dietary_flags: string[];
  substitutes: string[];
  description: Record<string, string>;
  image_url: string | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("ingredients").select("names").eq("id", id).single();

  if (!data) return { title: "Ingredient Not Found" };
  const name = getLocalizedText(data.names, locale);
  return { title: name };
}

export default async function GlossaryDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const [t, tExplore] = await Promise.all([
    getTranslations({ locale, namespace: "glossary" }),
    getTranslations({ locale, namespace: "explore" }),
  ]);
  const supabase = await createClient();

  // 병렬 쿼리: 재료 + 이 재료를 사용하는 published 레시피
  const [{ data: ingredient }, { data: usedRecipes }] = await Promise.all([
    supabase
      .from("ingredients")
      .select("id, names, category, dietary_flags, substitutes, description, image_url")
      .eq("id", id)
      .single(),
    supabase
      .from("recipe_ingredients")
      .select(
        "recipes!inner(recipe_id, slug, title, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings)"
      )
      .eq("ingredient_id", id)
      .eq("recipes.published", true),
  ]);

  if (!ingredient) notFound();
  const ing = ingredient as Ingredient;

  const primaryName = getLocalizedText(ing.names, locale);
  const secondaryName = locale === "ko" ? ing.names["en"] : ing.names["ko"];
  const description = getLocalizedText(ing.description, locale);

  // 대체 재료 이름 조회
  let substituteIngredients: { id: string; names: Record<string, string> }[] = [];
  if (ing.substitutes.length > 0) {
    const { data } = await supabase
      .from("ingredients")
      .select("id, names")
      .in("id", ing.substitutes);
    substituteIngredients = (data ?? []) as { id: string; names: Record<string, string> }[];
  }

  // 레시피 중복 제거 (같은 레시피에서 이 재료를 여러 번 사용하는 경우)
  const recipeMap = new Map<
    string,
    {
      recipe_id: string;
      slug: string;
      title: Record<string, string>;
      hero_image_url: string | null;
      difficulty_level: string | null;
      prep_time_minutes: number | null;
      cook_time_minutes: number | null;
      servings: number | null;
    }
  >();
  (usedRecipes ?? []).forEach((ri: { recipes: unknown }) => {
    const r = ri.recipes as {
      recipe_id: string;
      slug: string;
      title: Record<string, string>;
      hero_image_url: string | null;
      difficulty_level: string | null;
      prep_time_minutes: number | null;
      cook_time_minutes: number | null;
      servings: number | null;
    };
    if (!recipeMap.has(r.recipe_id)) {
      recipeMap.set(r.recipe_id, r);
    }
  });
  const recipes = Array.from(recipeMap.values());

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 뒤로가기 */}
      <Button variant="ghost" size="sm" className="mb-6 gap-1" asChild>
        <Link href={`/${locale}/glossary`}>
          <ArrowLeft className="h-4 w-4" />
          {t("backToGlossary")}
        </Link>
      </Button>

      {/* 이미지 */}
      {ing.image_url && (
        <div className="mb-6 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ing.image_url} alt={primaryName} className="h-48 w-full object-cover sm:h-64" />
        </div>
      )}

      {/* 헤더 */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{primaryName}</h1>
        {secondaryName && <p className="mt-1 text-lg text-muted-foreground">{secondaryName}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">
            {CATEGORY_LABEL_KEYS[ing.category]
              ? t(CATEGORY_LABEL_KEYS[ing.category])
              : ing.category}
          </Badge>
          {ing.dietary_flags.map((flag) => (
            <Badge key={flag} variant="outline">
              {DIETARY_FLAG_LABELS[flag] ?? flag}
            </Badge>
          ))}
        </div>
      </header>

      {/* 설명 */}
      {description && (
        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">{t("about")}</h2>
          <p className="text-muted-foreground">{description}</p>
        </section>
      )}

      {/* 대체 재료 */}
      {substituteIngredients.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{t("substitutes")}</h2>
          <div className="flex flex-wrap gap-2">
            {substituteIngredients.map((sub) => (
              <Link key={sub.id} href={`/${locale}/glossary/${sub.id}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-3 py-1 text-sm hover:bg-accent"
                >
                  {getLocalizedText(sub.names, locale)}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 사용된 레시피 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("usedInRecipes")}</h2>
        {recipes.length === 0 ? (
          <p className="text-muted-foreground">{t("noRecipesUsing")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recipes.map((recipe) => {
              const title = getLocalizedText(recipe.title, locale);
              const totalMinutes =
                (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
              return (
                <Link key={recipe.recipe_id} href={`/${locale}/recipe/${recipe.slug}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                    {recipe.hero_image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={recipe.hero_image_url}
                        alt={title}
                        className="h-32 w-full object-cover"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
                    </CardHeader>
                    <CardFooter className="gap-4 text-xs text-muted-foreground">
                      {totalMinutes > 0 && (
                        <span>
                          {totalMinutes} {tExplore("minutes")}
                        </span>
                      )}
                      {recipe.servings != null && (
                        <span>
                          {recipe.servings} {tExplore("servings")}
                        </span>
                      )}
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
