// Tag: core
// Path: apps/web/src/app/[locale]/glossary/[id]/glossary-comment-client.tsx

"use client";

import { CommentSection } from "@/components/comment/comment-section";

interface GlossaryCommentClientProps {
  ingredientId: string;
  currentUserId: string | null;
  isLoggedIn: boolean;
}

export function GlossaryCommentClient({
  ingredientId,
  currentUserId,
  isLoggedIn,
}: GlossaryCommentClientProps) {
  return (
    <CommentSection
      context={{ targetType: "ingredient", ingredientId }}
      currentUserId={currentUserId}
      isLoggedIn={isLoggedIn}
    />
  );
}
