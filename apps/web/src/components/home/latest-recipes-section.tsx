// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/home/latest-recipes-section.tsx

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Recipe = {
  recipe_id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string> | null;
  hero_image_url: string | null;
  difficulty_level: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
  users: { display_name: string | null; avatar_url: string | null };
};

type LatestRecipesSectionProps = {
  locale: string;
  recipes: Recipe[];
  t: {
    latestRecipes: string;
    viewAll: string;
    by: string;
    minutes: string;
    servings: string;
    difficultyBeginner: string;
    difficultyIntermediate: string;
    difficultyMaster: string;
  };
};

const DIFFICULTY_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  beginner: "secondary",
  intermediate: "default",
  master: "destructive",
};

export function LatestRecipesSection({ locale, recipes, t }: LatestRecipesSectionProps) {
  if (recipes.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-6 flex items-end justify-between sm:mb-8">
        <h2 className="font-heading-ko text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
          {t.latestRecipes}
        </h2>
        <Link
          href={`/${locale}/explore`}
          className="shrink-0 text-sm font-medium text-matdam-gold hover:underline"
        >
          {t.viewAll} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {recipes.map((recipe) => {
          const title =
            recipe.title[locale] ?? recipe.title["en"] ?? Object.values(recipe.title)[0] ?? "";
          const totalMinutes = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
          const badgeVariant = DIFFICULTY_VARIANTS[recipe.difficulty_level ?? ""] ?? "outline";

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
                    {recipe.difficulty_level && (
                      <Badge variant={badgeVariant} className="shrink-0">
                        {recipe.difficulty_level === "beginner"
                          ? t.difficultyBeginner
                          : recipe.difficulty_level === "intermediate"
                            ? t.difficultyIntermediate
                            : recipe.difficulty_level === "master"
                              ? t.difficultyMaster
                              : recipe.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    {t.by} {recipe.users?.display_name ?? "\u2014"}
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
