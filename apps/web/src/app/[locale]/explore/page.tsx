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
import { exploreParamsSchema } from "@/lib/validation/search-params";
import type { RecipeCardData } from "@/lib/recipe/types";
import type { DietaryPreference, UserPreferences } from "@matdam/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    difficulty?: string;
    q?: string;
    sort?: string;
    dietary?: string;
    dietary_hard?: string;
    dietary_soft?: string;
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

const PAGE_SIZE = 20;

/** 유저 설정에서 DietaryPreference[] 추출 (하위 호환) */
function extractDietaryPreferences(prefs?: Partial<UserPreferences> | null): DietaryPreference[] {
  if (!prefs) return [];
  if (prefs.dietary_preferences && prefs.dietary_preferences.length > 0) {
    return prefs.dietary_preferences;
  }
  // 레거시 폴백: dietary_restrictions → hard 모드
  if (prefs.dietary_restrictions && prefs.dietary_restrictions.length > 0) {
    return prefs.dietary_restrictions.map((tag) => ({ tag, mode: "hard" as const }));
  }
  return [];
}

export default async function ExplorePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const raw = await searchParams;
  const t = await getTranslations({ locale, namespace: "explore" });

  // Zod 중앙 검증 — 검증 실패한 파라미터는 DB 쿼리에 도달하지 않음
  const parsed = exploreParamsSchema.safeParse(raw);
  const {
    q: sanitizedQ,
    sort = "newest",
    difficulty = [],
    dietary = [],
    dietary_hard = [],
    dietary_soft = [],
    page = 1,
  } = parsed.success
    ? parsed.data
    : {
        q: undefined,
        sort: "newest" as const,
        difficulty: [],
        dietary: [],
        dietary_hard: [],
        dietary_soft: [],
        page: 1,
      };

  const supabase = await createClient();

  // 로그인 유저의 dietary 설정 조회
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userDietaryPrefs: DietaryPreference[] = [];
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("preferences")
      .eq("user_id", user.id)
      .single();
    userDietaryPrefs = extractDietaryPreferences(
      profile?.preferences as Partial<UserPreferences> | null
    );
  }

  // URL에 dietary 파라미터가 없으면 유저 설정 자동 적용
  const hasExplicitDietary =
    raw.dietary_hard !== undefined || raw.dietary_soft !== undefined || raw.dietary !== undefined;

  let effectiveHard: string[] = dietary_hard;
  let effectiveSoft: string[] = dietary_soft;

  if (!hasExplicitDietary && userDietaryPrefs.length > 0) {
    effectiveHard = userDietaryPrefs.filter((p) => p.mode === "hard").map((p) => p.tag as string);
    effectiveSoft = userDietaryPrefs.filter((p) => p.mode === "soft").map((p) => p.tag as string);
  }

  // RPC 호출 — 검색/필터/정렬/페이지네이션을 DB 함수에서 처리 (SQL Injection 제거)
  const rpcParams = {
    search_term: sanitizedQ ?? "",
    sort_option: sort,
    difficulty_filter: difficulty,
    dietary_filter: dietary,
    page_number: page,
    page_size: PAGE_SIZE,
    dietary_hard_filter: effectiveHard,
    dietary_soft_filter: effectiveSoft,
  };

  const { data: rpcRows } = await supabase.rpc("search_recipes", rpcParams);
  let rows = rpcRows ?? [];
  let totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;
  let totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  let safePage = totalCount > 0 ? Math.min(page, totalPages) : 1;

  // 요청 페이지가 범위 초과 시 보정된 페이지로 재조회
  if (rows.length === 0 && page > 1) {
    const { data: retryRows } = await supabase.rpc("search_recipes", {
      ...rpcParams,
      page_number: 1,
    });
    rows = retryRows ?? [];
    totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;
    totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    safePage = Math.min(page, totalPages);

    if (safePage > 1) {
      const { data: correctedRows } = await supabase.rpc("search_recipes", {
        ...rpcParams,
        page_number: safePage,
      });
      rows = correctedRows ?? [];
    }
  }

  // RPC 결과를 RecipeCardData 형태로 매핑
  const recipes: RecipeCardData[] = rows.map((r: Record<string, unknown>) => ({
    recipe_id: r.recipe_id as string,
    slug: r.slug as string,
    title: r.title as Record<string, string>,
    description: r.description as Record<string, string>,
    hero_image_url: r.hero_image_url as string | null,
    difficulty_level: r.difficulty_level as string | null,
    prep_time_minutes: r.prep_time_minutes as number | null,
    cook_time_minutes: r.cook_time_minutes as number | null,
    servings: r.servings as number | null,
    created_at: r.created_at as string,
    parent_recipe_id: r.parent_recipe_id as string | null,
    upvote_count: r.upvote_count as number,
    dietary_tags: r.dietary_tags as string[] | null,
    users: {
      display_name: r.author_name as string | null,
      avatar_url: r.author_avatar as string | null,
    },
  }));

  // 페이지네이션 링크 생성 헬퍼
  function buildPageHref(targetPage: number): string {
    const params2 = new URLSearchParams();
    if (difficulty.length > 0) params2.set("difficulty", difficulty.join(","));
    if (sanitizedQ) params2.set("q", sanitizedQ);
    if (sort !== "newest") params2.set("sort", sort);
    if (dietary.length > 0) params2.set("dietary", dietary.join(","));
    if (dietary_hard.length > 0) params2.set("dietary_hard", dietary_hard.join(","));
    if (dietary_soft.length > 0) params2.set("dietary_soft", dietary_soft.join(","));
    if (targetPage > 1) params2.set("page", String(targetPage));
    const qs = params2.toString();
    return qs ? `?${qs}` : "?";
  }

  // 리믹스 레시피의 부모 제목을 일괄 조회
  const parentIds = recipes
    .map((r) => r.parent_recipe_id)
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
              <DietaryFilterPopover userPreferences={userDietaryPrefs} />
            </Suspense>
          </div>

          <div className="flex gap-2">
            {sortOptions.map((option) => {
              const params = new URLSearchParams();
              if (difficulty.length > 0) params.set("difficulty", difficulty.join(","));
              if (sanitizedQ) params.set("q", sanitizedQ);
              if (option.value !== "newest") params.set("sort", option.value);
              if (dietary.length > 0) params.set("dietary", dietary.join(","));
              if (dietary_hard.length > 0) params.set("dietary_hard", dietary_hard.join(","));
              if (dietary_soft.length > 0) params.set("dietary_soft", dietary_soft.join(","));
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

      {recipes.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">{t("noRecipes")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => {
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
