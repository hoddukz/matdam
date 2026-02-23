// Tag: core
// Path: apps/web/src/components/recipe/recipe-social-client.tsx

"use client";

import { useState } from "react";
import { CookLogButton } from "./cook-log-button";
import { CookReviewForm } from "./cook-review-form";
import { CommentSection } from "./comment-section";
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
  const [cookLogId, setCookLogId] = useState<string | null>(initialCookLogId);
  const [reviewKey, setReviewKey] = useState(0);

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
        <CookReviewForm
          key={reviewKey}
          cookLogId={cookLogId}
          existingReview={existingReview}
          onSaved={() => setReviewKey((k) => k + 1)}
        />
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
