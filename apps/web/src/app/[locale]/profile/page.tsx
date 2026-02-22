// Tag: core
// Path: apps/web/src/app/[locale]/profile/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { DIFFICULTY_VARIANTS } from "@/lib/recipe/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteRecipeButton } from "@/components/recipe/delete-recipe-button";
import { Pencil } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("title") };
}

type Recipe = {
  recipe_id: string;
  slug: string;
  title: Record<string, string>;
  hero_image_url: string | null;
  difficulty_level: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  published: boolean;
  created_at: string;
};

export default async function ProfilePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations({ locale, namespace: "profile" });

  // 유저 정보 + 본인 레시피 + 북마크 조회
  const [{ data: profile }, { data: recipes }, { data: bookmarks }] = await Promise.all([
    supabase
      .from("users")
      .select("display_name, avatar_url, created_at")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("recipes")
      .select(
        "recipe_id, slug, title, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings, published, created_at"
      )
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("bookmarks")
      .select(
        "recipe_id, created_at, recipes!inner(recipe_id, slug, title, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const allRecipes = (recipes ?? []) as Recipe[];
  const publishedRecipes = allRecipes.filter((r) => r.published);
  const draftRecipes = allRecipes.filter((r) => !r.published);

  // 북마크된 레시피 추출 (published 레시피만 — !inner 조인으로 보장)
  const bookmarkedRecipes = (bookmarks ?? []).map(
    (b: { recipes: unknown }) =>
      ({ ...(b.recipes as Record<string, unknown>), published: true }) as Recipe
  );

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  function renderBookmarkGrid(list: Recipe[]) {
    if (list.length === 0) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground">{t("noBookmarks")}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((recipe) => {
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
                      <Badge variant={badgeVariant} className="shrink-0 capitalize">
                        {recipe.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
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
    );
  }

  function renderRecipeGrid(list: Recipe[]) {
    if (list.length === 0) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground">{t("noRecipes")}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((recipe) => {
          const title = getLocalizedText(recipe.title, locale);
          const totalMinutes = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
          const badgeVariant = DIFFICULTY_VARIANTS[recipe.difficulty_level ?? ""] ?? "outline";

          const cardHref = recipe.published
            ? `/${locale}/recipe/${recipe.slug}`
            : `/${locale}/recipe/${recipe.slug}/edit`;

          return (
            <div key={recipe.recipe_id} className="group relative">
              <Link href={cardHref}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
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
                        <Badge variant={badgeVariant} className="shrink-0 capitalize">
                          {recipe.difficulty_level}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
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

              {/* 수정/삭제 오버레이 */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
                <Button variant="secondary" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/${locale}/recipe/${recipe.slug}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <DeleteRecipeButton recipeId={recipe.recipe_id} iconOnly />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 유저 프로필 헤더 */}
      <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:text-left gap-4">
        <Avatar className="h-16 w-16">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
          <AvatarFallback className="bg-matdam-gold text-xl text-white">
            {profile?.display_name?.charAt(0)?.toUpperCase() ??
              user.email?.charAt(0)?.toUpperCase() ??
              "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">{profile?.display_name ?? user.email}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {memberSince && (
              <span>
                {t("memberSince")}: {memberSince}
              </span>
            )}
            <span>{t("recipeCount", { count: allRecipes.length })}</span>
          </div>
        </div>
      </div>

      {/* 공개/임시저장/북마크 탭 */}
      <Tabs
        defaultValue={tab === "bookmarks" ? "bookmarks" : tab === "drafts" ? "drafts" : "published"}
      >
        <TabsList>
          <TabsTrigger value="published">
            {t("publishedTab")} ({publishedRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            {t("draftsTab")} ({draftRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="bookmarks">
            {t("bookmarksTab")} ({bookmarkedRecipes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-6">
          {renderRecipeGrid(publishedRecipes)}
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          {renderRecipeGrid(draftRecipes)}
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          {renderBookmarkGrid(bookmarkedRecipes)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
