// Tag: core
// Path: apps/web/src/components/recipe/recipe-social-client.tsx

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CookLogButton } from "./cook-log-button";
import { CookReviewForm } from "./cook-review-form";
import { CommentSection } from "./comment-section";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CookReview } from "@matdam/types";

interface RecipeSocialClientProps {
  recipeId: string;
  initialCookLogId: string | null;
  existingReview: Partial<CookReview> | null;
  isLoggedIn: boolean;
  currentUserId: string | null;
}

export function RecipeSocialClient({
  recipeId,
  initialCookLogId,
  existingReview,
  isLoggedIn,
  currentUserId,
}: RecipeSocialClientProps) {
  const t = useTranslations("recipeDetail");
  const [cookLogId, setCookLogId] = useState<string | null>(initialCookLogId);
  const [reviewKey, setReviewKey] = useState(0);
  const [showReview, setShowReview] = useState(false);

  function handleCookLogCreated(id: string) {
    setCookLogId(id);
  }

  return (
    <div className="space-y-6">
      {/* 만들어봤어요 버튼 */}
      <CookLogButton
        recipeId={recipeId}
        initialCookLogId={cookLogId}
        isLoggedIn={isLoggedIn}
        onCookLogCreated={handleCookLogCreated}
      />

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
          {showReview && (
            <CookReviewForm
              key={reviewKey}
              cookLogId={cookLogId}
              existingReview={existingReview}
              onSaved={() => setReviewKey((k) => k + 1)}
            />
          )}
        </div>
      )}

      {/* 코멘트 섹션 */}
      <CommentSection
        recipeId={recipeId}
        cookLogId={cookLogId}
        currentUserId={currentUserId}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
