// Tag: core
// Path: apps/web/src/components/recipe/recipe-social-client.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CookLogButton } from "./cook-log-button";
import { RecipeVoteButton } from "./recipe-vote-button";
import { CookReviewForm } from "./cook-review-form";
import { CommentSection } from "@/components/comment/comment-section";
import { ChevronDown, ChevronUp, Utensils } from "lucide-react";
import type { CookReview } from "@matdam/types";

interface RecipeSocialClientProps {
  recipeId: string;
  initialCookLogId: string | null;
  existingReview: Partial<CookReview> | null;
  isLoggedIn: boolean;
  currentUserId: string | null;
  initialVote: 1 | -1 | null;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function RecipeSocialClient({
  recipeId,
  initialCookLogId,
  existingReview,
  isLoggedIn,
  currentUserId,
  initialVote,
  initialUpvotes,
  initialDownvotes,
}: RecipeSocialClientProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const [cookLogId, setCookLogId] = useState<string | null>(initialCookLogId);
  const [showReview, setShowReview] = useState(false);

  function handleCookLogCreated(id: string) {
    setCookLogId(id);
  }

  return (
    <div className="space-y-6">
      {/* 2x2 액션 버튼 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <RecipeVoteButton
          recipeId={recipeId}
          initialVote={initialVote}
          initialUpvotes={initialUpvotes}
          initialDownvotes={initialDownvotes}
          isLoggedIn={isLoggedIn}
          size="lg"
        />
        <CookLogButton
          recipeId={recipeId}
          initialCookLogId={cookLogId}
          isLoggedIn={isLoggedIn}
          onCookLogCreated={handleCookLogCreated}
        />
        <Link
          href={`/${locale}/fridge?from=${recipeId}`}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Utensils className="h-5 w-5" />
          {t("leftoverRecommend")}
        </Link>
      </div>

      {/* 리뷰 폼 (만들어본 경우만) */}
      {cookLogId && (
        <div>
          <button
            type="button"
            onClick={() => setShowReview(!showReview)}
            className="flex w-full items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted/50"
          >
            {t("reviewTitle")}
            {existingReview && !showReview && (
              <span className="text-xs font-normal text-muted-foreground">{t("reviewSaved")}</span>
            )}
            {showReview ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showReview && <CookReviewForm cookLogId={cookLogId} existingReview={existingReview} />}
        </div>
      )}

      {/* 코멘트 섹션 */}
      <CommentSection
        context={{ targetType: "recipe", recipeId, cookLogId }}
        currentUserId={currentUserId}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
