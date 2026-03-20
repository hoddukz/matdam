// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/recipe/[slug]/page.tsx

import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { unwrapJoin } from "@/lib/supabase/unwrap-join";
import { getLocalizedText, detectOriginalLocale } from "@/lib/recipe/localized-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeIngredientList } from "@/components/recipe/recipe-detail-client";
import { RecipeOwnerMenu } from "@/components/recipe/recipe-owner-menu";
import { RecipeLanguageSwitcher } from "@/components/recipe/recipe-language-switcher";
import { EditableTranslation } from "@/components/recipe/editable-translation";
import { BookmarkButton } from "@/components/recipe/bookmark-button";
import { RecipeSocialClient } from "@/components/recipe/recipe-social-client";
import { TasteProfileDisplay } from "@/components/recipe/taste-profile-display";
import { ReportDialog } from "@/components/report/report-dialog";
import { Clock, Users, ChefHat, Lightbulb, GitFork, CookingPot } from "lucide-react";
import type { TasteProfile, VerifiedType } from "@matdam/types";
import { RankBadge } from "@/components/user/rank-badge";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// React.cache로 동일 요청 내 generateMetadata + page 쿼리 중복 제거
const getRecipe = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select(
      "*, users!recipes_author_id_fkey(display_name, avatar_url, activity_score, verified_type)"
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) return { title: "Recipe Not Found" };

  const title = getLocalizedText(recipe.title, locale) || "Recipe";
  const description = getLocalizedText(recipe.description, locale);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      images: recipe.hero_image_url ? [recipe.hero_image_url] : [],
    },
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "recipeDetail" });
  const supabase = await createClient();

  // 1. Get recipe with author (cached — deduped with generateMetadata)
  const [
    recipe,
    {
      data: { user },
    },
  ] = await Promise.all([getRecipe(slug), supabase.auth.getUser()]);

  if (!recipe) notFound();

  const isAuthor = user?.id === recipe.author_id;

  // 2+3. Get steps, ingredients, remix data, bookmark, votes, cook_log in parallel
  const [
    { data: steps },
    { data: recipeIngredients },
    { data: parentRecipe },
    { data: remixes },
    { data: bookmarkRow },
    { data: myVoteRow },
    { data: myCookLog },
    { count: cookCount },
    { data: myReportRow },
  ] = await Promise.all([
    supabase.from("recipe_steps").select("*").eq("recipe_id", recipe.recipe_id).order("step_order"),
    supabase
      .from("recipe_ingredients")
      .select("*, ingredients(names, category)")
      .eq("recipe_id", recipe.recipe_id)
      .order("display_order"),
    // 부모 레시피 조회 (리믹스 출처 표시용, published만)
    recipe.parent_recipe_id
      ? supabase
          .from("recipes")
          .select("slug, title, users!recipes_author_id_fkey(display_name)")
          .eq("recipe_id", recipe.parent_recipe_id)
          .eq("published", true)
          .single()
          .then(({ data }) => ({ data }))
      : Promise.resolve({ data: null }),
    // 이 레시피의 리믹스 목록
    supabase
      .from("recipes")
      .select("recipe_id, slug, title, hero_image_url, users!recipes_author_id_fkey(display_name)")
      .eq("parent_recipe_id", recipe.recipe_id)
      .eq("published", true)
      .order("created_at", { ascending: false }),
    // 북마크 상태 조회 (로그인 시에만)
    user
      ? supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", user.id)
          .eq("recipe_id", recipe.recipe_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    // 내 투표 조회
    user
      ? supabase
          .from("recipe_votes")
          .select("vote")
          .eq("user_id", user.id)
          .eq("recipe_id", recipe.recipe_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    // 내 cook_log 조회
    user
      ? supabase
          .from("cook_logs")
          .select("cook_log_id")
          .eq("user_id", user.id)
          .eq("recipe_id", recipe.recipe_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    // cook_log 총 수
    supabase
      .from("cook_logs")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", recipe.recipe_id),
    // 내 신고 여부 조회
    user
      ? supabase
          .from("reports")
          .select("id")
          .eq("reporter_id", user.id)
          .eq("target_type", "recipe")
          .eq("target_id", recipe.recipe_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // cook_review는 cook_log_id가 필요하므로 별도 조회
  let existingReview = null;
  if (myCookLog?.cook_log_id) {
    const { data } = await supabase
      .from("cook_reviews")
      .select("*")
      .eq("cook_log_id", myCookLog.cook_log_id)
      .maybeSingle();
    existingReview = data;
  }

  const hasReportedRecipe = myReportRow !== null;
  const isBookmarked = bookmarkRow !== null;
  const myVote = (myVoteRow?.vote as 1 | -1) ?? null;
  const myCookLogId = myCookLog?.cook_log_id ?? null;
  const tasteProfile = recipe.taste_profile as TasteProfile | null;
  const title = getLocalizedText(recipe.title, locale);
  const description = getLocalizedText(recipe.description, locale);
  const originalLocale = detectOriginalLocale(recipe.title);
  const translatedLocales = (recipe.translated_locales ?? {}) as Record<string, string>;
  const canEditTranslation = isAuthor && locale !== originalLocale;

  const author = unwrapJoin(recipe.users);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: title,
    description,
    image: recipe.hero_image_url,
    author: { "@type": "Person", name: author?.display_name ?? "Unknown" },
    prepTime: recipe.prep_time_minutes ? `PT${recipe.prep_time_minutes}M` : undefined,
    cookTime: recipe.cook_time_minutes ? `PT${recipe.cook_time_minutes}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeIngredient: (recipeIngredients ?? []).map(
      (ri: {
        amount: number | null;
        unit: string | null;
        custom_name: Record<string, string> | null;
        ingredients: { names: Record<string, string> } | null;
      }) => {
        const name = ri.ingredients
          ? getLocalizedText(ri.ingredients.names, locale)
          : ri.custom_name
            ? getLocalizedText(ri.custom_name, locale)
            : "";
        return ri.amount ? `${ri.amount} ${ri.unit || ""} ${name}`.trim() : name;
      }
    ),
    recipeInstructions: (steps ?? []).map(
      (s: { step_order: number; description: Record<string, string> }) => ({
        "@type": "HowToStep",
        position: s.step_order,
        text: getLocalizedText(s.description, locale),
      })
    ),
  };

  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />

      <article className="mx-auto max-w-3xl px-4 py-8">
        {/* Hero Image */}
        {recipe.hero_image_url && (
          <div className="relative mb-6 h-64 overflow-hidden rounded-xl sm:h-80">
            <Image
              src={recipe.hero_image_url}
              alt={title}
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-3 text-2xl sm:text-3xl font-bold tracking-tight">
            <EditableTranslation
              value={title}
              recipeId={recipe.recipe_id}
              table="recipes"
              rowId={recipe.recipe_id}
              field="title"
              locale={locale}
              canEdit={canEditTranslation}
            />
          </h1>
          {description && (
            <p className="mb-4 text-muted-foreground">
              <EditableTranslation
                value={description}
                recipeId={recipe.recipe_id}
                table="recipes"
                rowId={recipe.recipe_id}
                field="description"
                locale={locale}
                canEdit={canEditTranslation}
                multiline
              />
            </p>
          )}

          {/* Author + 수정/삭제/리믹스/투표 버튼 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              {t("by")}{" "}
              <Link
                href={`/${locale}/user/${recipe.author_id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {author?.display_name}
              </Link>
              {author && (
                <RankBadge
                  activityScore={(author as { activity_score?: number }).activity_score ?? 0}
                  verifiedType={
                    (author as { verified_type?: VerifiedType | null }).verified_type ?? null
                  }
                />
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <BookmarkButton
                recipeId={recipe.recipe_id}
                initialBookmarked={isBookmarked}
                isLoggedIn={!!user}
              />
              {user ? (
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <Link href={`/${locale}/recipe/${slug}/remix`}>
                    <GitFork className="h-4 w-4" />
                    {t("remix")}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <Link href="/login" title={t("loginToRemix")}>
                    <GitFork className="h-4 w-4" />
                    {t("remix")}
                  </Link>
                </Button>
              )}
              {isAuthor && (
                <RecipeOwnerMenu
                  recipeId={recipe.recipe_id}
                  editHref={`/${locale}/recipe/${slug}/edit`}
                />
              )}
              {!isAuthor && (
                <ReportDialog
                  targetType="recipe"
                  targetId={recipe.recipe_id}
                  isLoggedIn={!!user}
                  hasReported={hasReportedRecipe}
                />
              )}
            </div>
          </div>

          {/* Remixed from (출처 표시) */}
          {parentRecipe && (
            <div className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <GitFork className="h-4 w-4" />
              <span>{t("remixedFrom")}</span>
              <Link
                href={`/${locale}/recipe/${parentRecipe.slug}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                &ldquo;
                {getLocalizedText(parentRecipe.title, locale)}
                &rdquo;
              </Link>
              <span>
                {t("by")} {unwrapJoin(parentRecipe.users)?.display_name ?? "—"}
              </span>
            </div>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
            {recipe.difficulty_level && (
              <Badge variant="secondary" className="gap-1 capitalize">
                <ChefHat className="h-3 w-3" />
                {recipe.difficulty_level}
              </Badge>
            )}
            {recipe.dietary_tags &&
              recipe.dietary_tags.length > 0 &&
              recipe.dietary_tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                  {t(`dietary_${tag}` as Parameters<typeof t>[0])}
                </Badge>
              ))}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {recipe.servings} {t("servings")}
              </span>
            )}
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalTime} {t("minutes")}
              </span>
            )}
            {recipe.prep_time_minutes && (
              <span className="text-xs">
                {t("prepTime")}: {recipe.prep_time_minutes}
                {t("minutes")}
              </span>
            )}
            {recipe.cook_time_minutes && (
              <span className="text-xs">
                {t("cookTime")}: {recipe.cook_time_minutes}
                {t("minutes")}
              </span>
            )}
            <RecipeLanguageSwitcher
              slug={slug}
              recipeId={recipe.recipe_id}
              availableLocales={Object.keys(recipe.title).filter((loc) =>
                (steps ?? []).every((s: { description: Record<string, string> }) =>
                  s.description[loc]?.trim()
                )
              )}
              translatedLocales={translatedLocales}
              originalLocale={originalLocale}
              isAuthenticated={!!user}
            />
          </div>

          {/* 맛 프로필 스코어카드 */}
          {tasteProfile && (cookCount ?? 0) > 0 && (
            <div className="mt-4">
              <TasteProfileDisplay profile={tasteProfile} cookCount={cookCount ?? 0} />
            </div>
          )}
        </header>

        {/* Ingredients - client component for unit toggle */}
        {recipeIngredients && recipeIngredients.length > 0 && (
          <section className="mb-6 sm:mb-10">
            <RecipeIngredientList
              ingredients={recipeIngredients}
              recipeId={recipe.recipe_id}
              locale={locale}
              canEditTranslation={canEditTranslation}
            />
          </section>
        )}

        {/* Steps */}
        {steps && steps.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("steps")}</h2>
              <Button size="sm" className="gap-1" asChild>
                <Link href={`/${locale}/recipe/${slug}/cook`}>
                  <CookingPot className="h-4 w-4" />
                  {t("startCooking")}
                </Link>
              </Button>
            </div>
            {steps.map(
              (step: {
                id: string;
                step_order: number;
                description: Record<string, string>;
                timer_seconds: number | null;
                image_url: string | null;
                tip: Record<string, string> | null;
              }) => {
                const stepDesc = getLocalizedText(step.description, locale);
                const stepTip = step.tip ? getLocalizedText(step.tip, locale) : null;
                return (
                  <Card key={step.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {t("stepNumber", { number: step.step_order })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="whitespace-pre-line">
                        <EditableTranslation
                          value={stepDesc}
                          recipeId={recipe.recipe_id}
                          table="recipe_steps"
                          rowId={step.id}
                          field="description"
                          locale={locale}
                          canEdit={canEditTranslation}
                          multiline
                        />
                      </p>

                      {step.image_url && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                          <Image
                            src={step.image_url}
                            alt={`${t("stepNumber", { number: step.step_order })}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 384px"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {step.timer_seconds != null && step.timer_seconds > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(step.timer_seconds / 60)}:
                            {String(step.timer_seconds % 60).padStart(2, "0")}
                          </Badge>
                        )}
                        {stepTip && (
                          <div className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-sm">
                            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-matdam-gold" />
                            <EditableTranslation
                              value={stepTip}
                              recipeId={recipe.recipe_id}
                              table="recipe_steps"
                              rowId={step.id}
                              field="tip"
                              locale={locale}
                              canEdit={canEditTranslation}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </section>
        )}

        {/* Social: 추천/비추천 + 만들어봤어요 + 남은 재료 + 리뷰 + 코멘트 */}
        <section className="mt-8 space-y-6">
          <RecipeSocialClient
            recipeId={recipe.recipe_id}
            initialCookLogId={myCookLogId}
            existingReview={existingReview}
            isLoggedIn={!!user}
            currentUserId={user?.id ?? null}
            initialVote={myVote}
            initialUpvotes={recipe.upvote_count ?? 0}
            initialDownvotes={recipe.downvote_count ?? 0}
          />
        </section>

        {/* Remixes of this recipe */}
        {remixes && remixes.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">{t("remixesOfThis")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {remixes.map(
                (remix: {
                  recipe_id: string;
                  slug: string;
                  title: Record<string, string>;
                  hero_image_url: string | null;
                  users: { display_name: string } | { display_name: string }[];
                }) => {
                  const remixTitle = getLocalizedText(remix.title, locale);
                  const remixAuthor = unwrapJoin(remix.users);
                  const authorName = remixAuthor?.display_name ?? "—";
                  return (
                    <Link key={remix.recipe_id} href={`/${locale}/recipe/${remix.slug}`}>
                      <Card className="overflow-hidden transition-shadow hover:shadow-md">
                        {remix.hero_image_url && (
                          <div className="relative h-32 w-full overflow-hidden">
                            <Image
                              src={remix.hero_image_url}
                              alt={remixTitle}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{remixTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground">
                            {t("by")} {authorName}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
