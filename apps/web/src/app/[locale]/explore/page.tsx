// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/explore/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitFork } from "lucide-react";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { DifficultyBadge } from "@/components/recipe/difficulty-badge";
import { DIFFICULTY_LABEL_KEYS } from "@/lib/recipe/constants";
import { ExploreSearch } from "@/components/explore/explore-search";
import { DietaryFilterPopover } from "@/components/explore/dietary-filter-popover";
import { DifficultyFilterPopover } from "@/components/explore/difficulty-filter-popover";
import type { RecipeCardData } from "@/lib/recipe/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    difficulty?: string;
    q?: string;
    sort?: string;
    dietary?: string;
    page?: string;
  }>;
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

const VALID_DIFFICULTIES = ["beginner", "intermediate", "master"] as const;
type Difficulty = (typeof VALID_DIFFICULTIES)[number];

const VALID_DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "pescatarian",
  "gluten_free",
  "dairy_free",
  "nut_free",
  "halal",
  "low_calorie",
  "diabetic_friendly",
  "low_sodium",
] as const;
type DietaryTag = (typeof VALID_DIETARY_TAGS)[number];

const VALID_SORTS = ["newest", "popular"] as const;
type SortOption = (typeof VALID_SORTS)[number];

const PAGE_SIZE = 20;

export default async function ExplorePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const {
    difficulty: rawDifficulty,
    q: rawQ,
    sort: rawSort,
    dietary: rawDietary,
    page: rawPage,
  } = await searchParams;
  const difficulty = rawDifficulty
    ? (rawDifficulty
        .split(",")
        .filter((v) => VALID_DIFFICULTIES.includes(v as Difficulty)) as Difficulty[])
    : [];
  const q = rawQ?.trim() || undefined;
  const sort: SortOption = VALID_SORTS.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : "newest";
  const dietary = rawDietary
    ? (rawDietary
        .split(",")
        .filter((v) => VALID_DIETARY_TAGS.includes(v as DietaryTag)) as DietaryTag[])
    : [];
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);
  const t = await getTranslations({ locale, namespace: "explore" });

  const supabase = await createClient();

  // 검색어 이스케이프 (공통)
  const escapedQ = q ? q.replace(/[%_\\]/g, (ch) => `\\${ch}`).replace(/[.,()'"]/g, "") : null;

  // 전체 개수 조회 (페이지네이션용)
  let countQuery = supabase
    .from("recipes")
    .select("recipe_id", { count: "exact", head: true })
    .eq("published", true);
  if (sort === "popular") {
    countQuery = countQuery
      .order("upvote_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    countQuery = countQuery.order("created_at", { ascending: false });
  }
  if (difficulty.length > 0) countQuery = countQuery.in("difficulty_level", difficulty);
  if (dietary.length > 0) countQuery = countQuery.overlaps("dietary_tags", dietary);
  if (escapedQ) {
    countQuery = countQuery.or(`title->>'en'.ilike.%${escapedQ}%,title->>'ko'.ilike.%${escapedQ}%`);
  }
  const { count } = await countQuery;
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // 현재 페이지 레시피 조회
  let dataQuery = supabase
    .from("recipes")
    .select(
      "recipe_id, slug, title, description, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings, created_at, parent_recipe_id, upvote_count, dietary_tags, users!recipes_author_id_fkey(display_name, avatar_url)"
    )
    .eq("published", true);
  if (sort === "popular") {
    dataQuery = dataQuery
      .order("upvote_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    dataQuery = dataQuery.order("created_at", { ascending: false });
  }
  if (difficulty.length > 0) dataQuery = dataQuery.in("difficulty_level", difficulty);
  if (dietary.length > 0) dataQuery = dataQuery.overlaps("dietary_tags", dietary);
  if (escapedQ) {
    dataQuery = dataQuery.or(`title->>'en'.ilike.%${escapedQ}%,title->>'ko'.ilike.%${escapedQ}%`);
  }
  dataQuery = dataQuery.range((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE - 1);

  const { data: recipes } = await dataQuery;

  // 페이지네이션 링크 생성 헬퍼
  function buildPageHref(targetPage: number): string {
    const params2 = new URLSearchParams();
    if (difficulty.length > 0) params2.set("difficulty", difficulty.join(","));
    if (q) params2.set("q", q);
    if (sort !== "newest") params2.set("sort", sort);
    if (dietary.length > 0) params2.set("dietary", dietary.join(","));
    if (targetPage > 1) params2.set("page", String(targetPage));
    const qs = params2.toString();
    return qs ? `?${qs}` : "?";
  }

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

  const sortOptions = [
    { value: "newest", label: t("sortNewest") },
    { value: "popular", label: t("sortPopular") },
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

      {/* 필터 + 정렬 */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Suspense fallback={null}>
              <DifficultyFilterPopover />
            </Suspense>
            <Suspense fallback={null}>
              <DietaryFilterPopover />
            </Suspense>
          </div>

          <div className="flex gap-2">
            {sortOptions.map((option) => {
              const params = new URLSearchParams();
              if (difficulty.length > 0) params.set("difficulty", difficulty.join(","));
              if (q) params.set("q", q);
              if (option.value !== "newest") params.set("sort", option.value);
              if (dietary.length > 0) params.set("dietary", dietary.join(","));
              const href = `?${params.toString()}`;
              const isActive = sort === option.value;
              return (
                <Link key={option.value} href={href}>
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 text-sm"
                  >
                    {option.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">{t("noRecipes")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(recipes as unknown as RecipeCardData[]).map((recipe) => {
              const title = getLocalizedText(recipe.title, locale);
              const totalMinutes =
                (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
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
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-base leading-snug">
                          {title}
                        </CardTitle>
                        <DifficultyBadge
                          level={recipe.difficulty_level}
                          label={
                            recipe.difficulty_level &&
                            DIFFICULTY_LABEL_KEYS[recipe.difficulty_level]
                              ? t(
                                  DIFFICULTY_LABEL_KEYS[recipe.difficulty_level] as Parameters<
                                    typeof t
                                  >[0]
                                )
                              : undefined
                          }
                        />
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

          {/* 페이지네이션 */}
          <div className="mt-10 flex items-center justify-center gap-4">
            {safePage > 1 ? (
              <Link
                href={buildPageHref(safePage - 1)}
                className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                {t("previousPage")}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium opacity-40 cursor-not-allowed">
                {t("previousPage")}
              </span>
            )}

            <span className="text-sm text-muted-foreground">
              {t("pageInfo", { current: safePage, total: totalPages })}
            </span>

            {safePage < totalPages ? (
              <Link
                href={buildPageHref(safePage + 1)}
                className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                {t("nextPage")}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium opacity-40 cursor-not-allowed">
                {t("nextPage")}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
