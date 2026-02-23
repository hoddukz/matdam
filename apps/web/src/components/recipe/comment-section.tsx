// Tag: core
// Path: apps/web/src/components/recipe/comment-section.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CommentCard } from "./comment-card";
import { CommentForm } from "./comment-form";
import { ArrowUpDown } from "lucide-react";

type CommentRow = {
  comment_id: string;
  cook_log_id: string;
  recipe_id: string;
  user_id: string;
  body: string;
  image_url: string | null;
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  users:
    | { display_name: string; avatar_url: string | null }
    | { display_name: string; avatar_url: string | null }[];
};

type SortMode = "top" | "newest";

interface CommentSectionProps {
  recipeId: string;
  cookLogId: string | null; // null이면 만들어보지 않은 유저
  currentUserId: string | null;
  isLoggedIn: boolean;
}

export function CommentSection({
  recipeId,
  cookLogId,
  currentUserId,
  isLoggedIn,
}: CommentSectionProps) {
  const t = useTranslations("recipeDetail");
  const supabaseRef = useRef(createClient());

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, 1 | -1>>({});
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const supabase = supabaseRef.current;

    const { data: commentData } = await supabase
      .from("comments")
      .select("*, users!comments_user_id_fkey(display_name, avatar_url)")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false });

    if (commentData) {
      setComments(commentData as CommentRow[]);
    }

    // 내 투표 조회
    if (currentUserId && commentData && commentData.length > 0) {
      const commentIds = commentData.map((c: { comment_id: string }) => c.comment_id);
      const { data: voteData } = await supabase
        .from("comment_votes")
        .select("comment_id, vote")
        .eq("user_id", currentUserId)
        .in("comment_id", commentIds);

      if (voteData) {
        const voteMap: Record<string, 1 | -1> = {};
        for (const v of voteData) {
          voteMap[v.comment_id] = v.vote as 1 | -1;
        }
        setMyVotes(voteMap);
      }
    }

    setLoading(false);
  }, [recipeId, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 정렬
  const sortedComments = [...comments].sort((a, b) => {
    if (sortMode === "top") {
      const scoreA = a.upvote_count - a.downvote_count;
      const scoreB = b.upvote_count - b.downvote_count;
      if (scoreB !== scoreA) return scoreB - scoreA;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Top 3 고정 + 나머지
  const top3 = sortMode === "top" ? sortedComments.slice(0, 3) : [];
  const rest = sortMode === "top" ? sortedComments.slice(3) : sortedComments;

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("commentsTitle")}</h3>
        <div className="text-sm text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {t("commentsTitle")}
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {comments.length}
            </span>
          )}
        </h3>
        {comments.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => setSortMode(sortMode === "top" ? "newest" : "top")}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortMode === "top" ? t("sortNewest") : t("sortTop")}
          </Button>
        )}
      </div>

      {/* 작성 폼 — 만들어본 유저만 */}
      {cookLogId ? (
        <CommentForm recipeId={recipeId} cookLogId={cookLogId} onCommentAdded={fetchComments} />
      ) : isLoggedIn ? (
        <p className="text-sm text-muted-foreground">{t("commentRequiresCook")}</p>
      ) : null}

      {/* Top 3 */}
      {top3.length > 0 && (
        <div className="space-y-3">
          {top3.map((c) => (
            <CommentCard
              key={c.comment_id}
              comment={c}
              myVote={myVotes[c.comment_id] ?? null}
              isLoggedIn={isLoggedIn}
              isOwner={currentUserId === c.user_id}
              onDeleted={fetchComments}
            />
          ))}
        </div>
      )}

      {/* 나머지 */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {sortMode === "top" && top3.length > 0 && <hr className="my-2" />}
          {rest.map((c) => (
            <CommentCard
              key={c.comment_id}
              comment={c}
              myVote={myVotes[c.comment_id] ?? null}
              isLoggedIn={isLoggedIn}
              isOwner={currentUserId === c.user_id}
              onDeleted={fetchComments}
            />
          ))}
        </div>
      )}

      {comments.length === 0 && <p className="text-sm text-muted-foreground">{t("noComments")}</p>}
    </div>
  );
}
