// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/explore/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitFork } from "lucide-react";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { DIFFICULTY_VARIANTS, DIFFICULTY_LABEL_KEYS } from "@/lib/recipe/constants";
import { ExploreSearch } from "@/components/explore/explore-search";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ difficulty?: string; q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "explore" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "ko" ? "ko_KR" : "en_US",
    },
  };
}

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
  parent_recipe_id: string | null;
  users: { display_name: string | null; avatar_url: string | null };
};

const VALID_DIFFICULTIES = ["beginner", "intermediate", "master"] as const;
type Difficulty = (typeof VALID_DIFFICULTIES)[number];

export default async function ExplorePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { difficulty: rawDifficulty, q: rawQ } = await searchParams;
  const difficulty = VALID_DIFFICULTIES.includes(rawDifficulty as Difficulty)
    ? (rawDifficulty as Difficulty)
    : undefined;
  const q = rawQ?.trim() || undefined;
  const t = await getTranslations({ locale, namespace: "explore" });

  const supabase = await createClient();

  let query = supabase
    .from("recipes")
    .select(
      "recipe_id, slug, title, description, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings, created_at, parent_recipe_id, users!recipes_author_id_fkey(display_name, avatar_url)"
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (difficulty) {
    query = query.eq("difficulty_level", difficulty);
  }

  if (q) {
    // PostgREST 필터 구문 문자 + LIKE 와일드카드 이스케이프
    const escaped = q.replace(/[%_\\]/g, (ch) => `\\${ch}`).replace(/[.,()]/g, "");
    query = query.or(`title->>'en'.ilike.%${escaped}%,title->>'ko'.ilike.%${escaped}%`);
  }

  const { data: recipes } = await query;

  // 리믹스 레시피의 부모 제목을 일괄 조회
  const parentIds = (recipes ?? [])
    .map((r: { parent_recipe_id: string | null }) => r.parent_recipe_id)
    .filter((id): id is string => id !== null);

  const parentTitleMap: Record<string, string> = {};
  if (parentIds.length > 0) {
    const { data: parents } = await supabase
      .from("recipes")
      .select("recipe_id, title")
      .in("recipe_id", parentIds);

    (parents ?? []).forEach((p: { recipe_id: string; title: Record<string, string> }) => {
      parentTitleMap[p.recipe_id] = getLocalizedText(p.title, locale);
    });
  }

  const difficultyFilters = [
    { value: undefined, label: t("filterAll") },
    { value: "beginner", label: t("filterBeginner") },
    { value: "intermediate", label: t("filterIntermediate") },
    { value: "master", label: t("filterMaster") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("description")}</p>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <ExploreSearch />
        </Suspense>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {difficultyFilters.map((filter) => {
          const params = new URLSearchParams();
          if (filter.value) params.set("difficulty", filter.value);
          if (q) params.set("q", q);
          const href = `?${params.toString()}`;
          const isActive = difficulty === filter.value || (!difficulty && !filter.value);
          return (
            <Link key={filter.value ?? "all"} href={href}>
              <Badge
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-sm"
              >
                {filter.label}
              </Badge>
            </Link>
          );
        })}
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">{t("noRecipes")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(recipes as unknown as Recipe[]).map((recipe) => {
            const title = getLocalizedText(recipe.title, locale);
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
                          {DIFFICULTY_LABEL_KEYS[recipe.difficulty_level]
                            ? t(DIFFICULTY_LABEL_KEYS[recipe.difficulty_level])
                            : recipe.difficulty_level}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      {t("by")} {recipe.users?.display_name ?? "—"}
                    </p>
                    {recipe.parent_recipe_id && parentTitleMap[recipe.parent_recipe_id] && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <GitFork className="h-3 w-3" />
                        {t("remixOf", { title: parentTitleMap[recipe.parent_recipe_id] })}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="gap-4 text-xs text-muted-foreground">
                    {totalMinutes > 0 && (
                      <span>
                        {totalMinutes} {t("minutes")}
                      </span>
                    )}
                    {recipe.servings != null && (
                      <span>
                        {recipe.servings} {t("servings")}
                      </span>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
