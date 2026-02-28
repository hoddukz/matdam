// Tag: core
// Path: apps/web/src/components/home/popular-recipes-section.tsx

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { DifficultyBadge } from "@/components/recipe/difficulty-badge";
import type { RecipeCardData } from "@/lib/recipe/types";
import { RankBadge } from "@/components/user/rank-badge";

type PopularRecipesSectionProps = {
  locale: string;
  recipes: RecipeCardData[];
  t: {
    popularTitle: string;
    viewAll: string;
    by: string;
    minutes: string;
    servings: string;
    difficultyLabel: (level: string) => string;
  };
};

export function PopularRecipesSection({ locale, recipes, t }: PopularRecipesSectionProps) {
  if (recipes.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-6 flex items-end justify-between sm:mb-8">
        <h2 className="font-heading-ko text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
          {t.popularTitle}
        </h2>
        <Link
          href={`/${locale}/explore?sort=popular`}
          className="shrink-0 text-sm font-medium text-matdam-gold hover:underline"
        >
          {t.viewAll} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const title = getLocalizedText(recipe.title, locale);
          const totalMinutes = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

          return (
            <Link key={recipe.recipe_id} href={`/${locale}/recipe/${recipe.slug}`}>
              <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {recipe.hero_image_url ? (
                    <Image
                      src={recipe.hero_image_url}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl">&#127836;</span>
                    </div>
                  )}
                  {/* Upvote badge */}
                  {recipe.upvote_count > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                      <ThumbsUp className="h-3 w-3" />
                      {recipe.upvote_count}
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base leading-snug">{title}</CardTitle>
                    <DifficultyBadge
                      level={recipe.difficulty_level}
                      label={
                        recipe.difficulty_level
                          ? t.difficultyLabel(recipe.difficulty_level)
                          : undefined
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    {t.by} {recipe.users?.display_name ?? "\u2014"}
                    {recipe.users && (
                      <RankBadge
                        activityScore={recipe.users.activity_score ?? 0}
                        verifiedType={recipe.users.verified_type ?? null}
                      />
                    )}
                  </p>
                </CardContent>
                <CardFooter className="gap-4 text-xs text-muted-foreground">
                  {totalMinutes > 0 && (
                    <span>
                      {totalMinutes} {t.minutes}
                    </span>
                  )}
                  {recipe.servings != null && (
                    <span>
                      {recipe.servings} {t.servings}
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
