// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/page.tsx

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/hero-section";
import { LatestRecipesSection } from "@/components/home/latest-recipes-section";
import { RecentRemixesSection } from "@/components/home/recent-remixes-section";
import { getLocalizedText } from "@/lib/recipe/localized-text";

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

  // 최신 레시피 + 최신 리믹스 병렬 조회
  const [{ data: latestRecipes }, { data: remixRecipes }] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "recipe_id, slug, title, description, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings, created_at, users!inner(display_name, avatar_url)"
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("recipes")
      .select(
        "recipe_id, slug, title, description, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings, created_at, parent_recipe_id, users!inner(display_name, avatar_url)"
      )
      .eq("published", true)
      .not("parent_recipe_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

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

      <LatestRecipesSection
        locale={locale}
        recipes={(latestRecipes ?? []).map((r) => ({
          ...r,
          users: Array.isArray(r.users) ? r.users[0] : r.users,
        }))}
        t={{
          latestRecipes: t("latestRecipes"),
          viewAll: t("viewAll"),
          by: t("by"),
          minutes: t("minutes"),
          servings: t("servings"),
          difficultyBeginner: t("difficultyBeginner"),
          difficultyIntermediate: t("difficultyIntermediate"),
          difficultyMaster: t("difficultyMaster"),
        }}
      />

      <RecentRemixesSection
        locale={locale}
        remixes={(remixRecipes ?? []).map((r) => ({
          ...r,
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
          difficultyBeginner: t("difficultyBeginner"),
          difficultyIntermediate: t("difficultyIntermediate"),
          difficultyMaster: t("difficultyMaster"),
        }}
      />
    </>
  );
}
