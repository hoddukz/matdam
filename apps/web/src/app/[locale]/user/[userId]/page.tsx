// Tag: core
// Path: apps/web/src/app/[locale]/user/[userId]/page.tsx

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { DIFFICULTY_VARIANTS } from "@/lib/recipe/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportDialog } from "@/components/report/report-dialog";
import { Settings } from "lucide-react";
import { RankBadge } from "@/components/user/rank-badge";

type Props = {
  params: Promise<{ locale: string; userId: string }>;
};

type Recipe = {
  recipe_id: string;
  slug: string;
  title: Record<string, string>;
  hero_image_url: string | null;
  difficulty_level: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, userId } = await params;
  if (!UUID_RE.test(userId)) return { title: "User Not Found" };

  const t = await getTranslations({ locale, namespace: "userProfile" });
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("user_id", userId)
    .single();

  if (!profile) return { title: "User Not Found" };

  const metaTitle = `${profile.display_name} ${t("title")} | MatDam`;
  return {
    title: metaTitle,
    openGraph: {
      title: metaTitle,
      locale: locale === "ko" ? "ko_KR" : "en_US",
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { locale, userId } = await params;
  if (!UUID_RE.test(userId)) notFound();

  const t = await getTranslations({ locale, namespace: "userProfile" });
  const supabase = await createClient();

  const [
    { data: profile },
    { data: recipes },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("user_id, display_name, avatar_url, created_at, activity_score, verified_type")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("recipes")
      .select(
        "recipe_id, slug, title, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings"
      )
      .eq("author_id", userId)
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (!profile) notFound();

  const isOwnProfile = user?.id === profile.user_id;

  // 로그인 유저의 해당 유저 신고 여부 조회
  let hasReported = false;
  if (user && !isOwnProfile) {
    const { data: reportRow } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_id", user.id)
      .eq("target_type", "user")
      .eq("target_id", userId)
      .maybeSingle();
    hasReported = reportRow !== null;
  }

  const publishedRecipes = (recipes ?? []) as Recipe[];

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 유저 프로필 헤더 */}
      <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:text-left gap-4">
        <Avatar className="h-16 w-16">
          {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
          <AvatarFallback className="bg-matdam-gold text-xl text-white">
            {profile.display_name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold">{profile.display_name}</h1>
            <RankBadge
              activityScore={profile.activity_score ?? 0}
              verifiedType={(profile.verified_type as "chef" | "partner" | null) ?? null}
              size="md"
            />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {memberSince && (
              <span>
                {t("memberSince")}: {memberSince}
              </span>
            )}
            <span>{t("recipeCount", { count: publishedRecipes.length })}</span>
            <span>
              {t("activityScore")}: {profile.activity_score ?? 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwnProfile ? (
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link href={`/${locale}/settings`}>
                <Settings className="h-4 w-4" />
                {t("settings")}
              </Link>
            </Button>
          ) : (
            <ReportDialog
              targetType="user"
              targetId={userId}
              isLoggedIn={!!user}
              hasReported={hasReported}
            />
          )}
        </div>
      </div>

      {/* 공개 레시피 목록 */}
      <h2 className="mb-4 text-lg font-semibold">{t("recipes")}</h2>
      {publishedRecipes.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground">{t("noRecipes")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishedRecipes.map((recipe) => {
            const title = getLocalizedText(recipe.title, locale);
            const totalMinutes = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
            const badgeVariant = DIFFICULTY_VARIANTS[recipe.difficulty_level ?? ""] ?? "outline";

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
      )}
    </div>
  );
}
