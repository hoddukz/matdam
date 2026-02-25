// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/page.tsx

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { LatestRecipesSection } from "@/components/home/latest-recipes-section";
import { RecentRemixesSection } from "@/components/home/recent-remixes-section";
import { PopularRecipesSection } from "@/components/home/popular-recipes-section";
import { RecommendedRecipesSection } from "@/components/home/recommended-recipes-section";
import { Button } from "@/components/ui/button";
import { getLocalizedText } from "@/lib/recipe/localized-text";

const DIFFICULTY_HOME_KEYS: Record<
  string,
  "difficultyBeginner" | "difficultyIntermediate" | "difficultyMaster"
> = {
  beginner: "difficultyBeginner",
  intermediate: "difficultyIntermediate",
  master: "difficultyMaster",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const supabase = await createClient();

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 최신 레시피 + 최신 리믹스 + 인기 레시피 + 맞춤 추천 병렬 조회
  const [
    { data: latestRecipes, error: latestErr },
    { data: remixRecipes, error: remixErr },
    { data: popularRpc, error: popularErr },
    { data: recommendedRpc, error: recommendedErr },
  ] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "recipe_id, slug, title, description, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings, created_at, users!recipes_author_id_fkey(display_name, avatar_url)"
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("recipes")
      .select(
        "recipe_id, slug, title, description, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings, created_at, parent_recipe_id, users!recipes_author_id_fkey(display_name, avatar_url)"
      )
      .eq("published", true)
      .not("parent_recipe_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.rpc("get_popular_recipes", { p_limit: 6 }),
    user
      ? supabase.rpc("get_recommended_recipes", { p_user_id: user.id, p_limit: 6 })
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (latestErr) console.error("Failed to fetch latest recipes:", latestErr.message);
  if (remixErr) console.error("Failed to fetch remix recipes:", remixErr.message);
  if (popularErr) console.error("Failed to fetch popular recipes:", popularErr.message);
  if (recommendedErr) console.error("Failed to fetch recommended recipes:", recommendedErr.message);

  const recommendedRecipes = recommendedRpc;

  // 인기 레시피 RPC 결과 → 컴포넌트용 변환
  const popularRecipes = (popularRpc ?? []).map(
    (r: {
      recipe_id: string;
      slug: string;
      title: Record<string, string>;
      description: Record<string, string> | null;
      hero_image_url: string | null;
      difficulty_level: string | null;
      prep_time_minutes: number | null;
      cook_time_minutes: number | null;
      servings: number | null;
      upvote_count: number;
      created_at: string;
      author_display_name: string | null;
      author_avatar_url: string | null;
    }) => ({
      recipe_id: r.recipe_id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      hero_image_url: r.hero_image_url,
      difficulty_level: r.difficulty_level,
      prep_time_minutes: r.prep_time_minutes,
      cook_time_minutes: r.cook_time_minutes,
      servings: r.servings,
      upvote_count: r.upvote_count,
      created_at: r.created_at,
      parent_recipe_id: null,
      dietary_tags: null,
      users: {
        display_name: r.author_display_name,
        avatar_url: r.author_avatar_url,
      },
    })
  );

  // 맞춤 추천 RPC 결과 → 컴포넌트용 변환
  const recommended = (recommendedRecipes ?? []).map(
    (r: {
      recipe_id: string;
      slug: string;
      title: Record<string, string>;
      description: Record<string, string> | null;
      hero_image_url: string | null;
      difficulty_level: string | null;
      prep_time_minutes: number | null;
      cook_time_minutes: number | null;
      servings: number | null;
      upvote_count: number;
      created_at: string;
      author_display_name: string | null;
      author_avatar_url: string | null;
    }) => ({
      recipe_id: r.recipe_id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      hero_image_url: r.hero_image_url,
      difficulty_level: r.difficulty_level,
      prep_time_minutes: r.prep_time_minutes,
      cook_time_minutes: r.cook_time_minutes,
      servings: r.servings,
      upvote_count: r.upvote_count,
      created_at: r.created_at,
      parent_recipe_id: null,
      dietary_tags: null,
      users: {
        display_name: r.author_display_name,
        avatar_url: r.author_avatar_url,
      },
    })
  );

  // 리믹스 부모 제목 일괄 조회
  const parentIds = (remixRecipes ?? [])
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

  return (
    <>
      <HeroSection
        locale={locale}
        t={{
          heroTagline: t("heroTagline"),
          heroTitle: t("heroTitle"),
          heroTitleAccent: t("heroTitleAccent"),
          heroDescription: t("heroDescription"),
          exploreRecipes: t("exploreRecipes"),
          createRecipe: t("createRecipe"),
        }}
      />

      <PopularRecipesSection
        locale={locale}
        recipes={popularRecipes}
        t={{
          popularTitle: t("popularTitle"),
          viewAll: t("viewAll"),
          by: t("by"),
          minutes: t("minutes"),
          servings: t("servings"),
          difficultyLabel: (level: string) => {
            const key = DIFFICULTY_HOME_KEYS[level];
            return key ? t(key) : level;
          },
        }}
      />

      {recommended.length > 0 && (
        <RecommendedRecipesSection
          locale={locale}
          recipes={recommended}
          t={{
            recommendedTitle: t("recommendedTitle"),
            recommendedSubtitle: t("recommendedSubtitle"),
            by: t("by"),
            minutes: t("minutes"),
            servings: t("servings"),
            difficultyLabel: (level: string) => {
              const key = DIFFICULTY_HOME_KEYS[level];
              return key ? t(key) : level;
            },
          }}
        />
      )}

      <LatestRecipesSection
        locale={locale}
        recipes={(latestRecipes ?? []).map((r) => ({
          ...r,
          upvote_count: 0,
          parent_recipe_id: null,
          dietary_tags: null,
          users: Array.isArray(r.users) ? r.users[0] : r.users,
        }))}
        t={{
          latestRecipes: t("latestRecipes"),
          viewAll: t("viewAll"),
          by: t("by"),
          minutes: t("minutes"),
          servings: t("servings"),
          difficultyLabel: (level: string) => {
            const key = DIFFICULTY_HOME_KEYS[level];
            return key ? t(key) : level;
          },
        }}
      />

      <RecentRemixesSection
        locale={locale}
        remixes={(remixRecipes ?? []).map((r) => ({
          ...r,
          upvote_count: 0,
          dietary_tags: null,
          users: Array.isArray(r.users) ? r.users[0] : r.users,
        }))}
        parentTitleMap={parentTitleMap}
        t={{
          trendingRemixes: t("trendingRemixes"),
          viewAll: t("viewAll"),
          remixOf: (title: string) => t("remixOf", { title }),
          by: t("by"),
          minutes: t("minutes"),
          servings: t("servings"),
          difficultyLabel: (level: string) => {
            const key = DIFFICULTY_HOME_KEYS[level];
            return key ? t(key) : level;
          },
        }}
      />

      {/* 더보기 CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 text-center sm:px-6 lg:px-8">
        <Button size="lg" className="h-12 px-8 text-base" asChild>
          <Link href={`/${locale}/explore`}>{t("exploreMore")}</Link>
        </Button>
      </section>
    </>
  );
}
