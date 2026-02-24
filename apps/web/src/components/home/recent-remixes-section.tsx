// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/home/recent-remixes-section.tsx

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GitFork } from "lucide-react";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { DifficultyBadge } from "@/components/recipe/difficulty-badge";
import type { RecipeCardData } from "@/lib/recipe/types";

type RecentRemixesSectionProps = {
  locale: string;
  remixes: RecipeCardData[];
  parentTitleMap: Record<string, string>;
  t: {
    trendingRemixes: string;
    viewAll: string;
    remixOf: (title: string) => string;
    by: string;
    minutes: string;
    servings: string;
  };
};

export function RecentRemixesSection({
  locale,
  remixes,
  parentTitleMap,
  t,
}: RecentRemixesSectionProps) {
  if (remixes.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-6 flex items-end justify-between sm:mb-8">
        <h2 className="font-heading-ko text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
          {t.trendingRemixes}
        </h2>
        <Link
          href={`/${locale}/explore`}
          className="shrink-0 text-sm font-medium text-matdam-gold hover:underline"
        >
          {t.viewAll} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {remixes.map((recipe) => {
          const title = getLocalizedText(recipe.title, locale);
          const totalMinutes = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
          const parentTitle = recipe.parent_recipe_id
            ? (parentTitleMap[recipe.parent_recipe_id] ?? "")
            : "";

          return (
            <Link key={recipe.recipe_id} href={`/${locale}/recipe/${recipe.slug}`}>
              <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {recipe.hero_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={recipe.hero_image_url}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl">&#127836;</span>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base leading-snug">{title}</CardTitle>
                    <DifficultyBadge level={recipe.difficulty_level} />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    {t.by} {recipe.users?.display_name ?? "\u2014"}
                  </p>
                  {parentTitle && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <GitFork className="h-3 w-3" />
                      {t.remixOf(parentTitle)}
                    </p>
                  )}
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
