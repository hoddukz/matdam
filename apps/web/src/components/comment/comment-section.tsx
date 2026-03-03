// Tag: core
// Path: apps/web/src/components/comment/comment-section.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CommentCard, type CommentData } from "./comment-card";
import { CommentForm } from "./comment-form";
import { ArrowUpDown } from "lucide-react";

type SortMode = "top" | "newest";

type CommentContext =
  | { targetType: "recipe"; recipeId: string; cookLogId: string | null }
  | { targetType: "ingredient"; ingredientId: string };

interface CommentSectionProps {
  context: CommentContext;
  currentUserId: string | null;
  isLoggedIn: boolean;
}

export function CommentSection({ context, currentUserId, isLoggedIn }: CommentSectionProps) {
  const t = useTranslations("comments");
  const supabaseRef = useRef(createClient());

  const [comments, setComments] = useState<CommentData[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, 1 | -1>>({});
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [loading, setLoading] = useState(true);

  const targetId = context.targetType === "recipe" ? context.recipeId : context.ingredientId;

  const fetchComments = useCallback(async () => {
    const supabase = supabaseRef.current;

    const filterColumn = context.targetType === "recipe" ? "recipe_id" : "ingredient_id";

    const { data: commentData } = await supabase
      .from("comments")
      .select(
        "*, users!comments_user_id_fkey(display_name, avatar_url, activity_score, verified_type)"
      )
      .eq(filterColumn, targetId)
      .eq("target_type", context.targetType)
      .order("created_at", { ascending: false });

    if (commentData) {
      setComments(commentData as CommentData[]);
    }

    // 내 투표 + 신고 상태 조회
    if (currentUserId && commentData && commentData.length > 0) {
      const commentIds = commentData.map((c: { comment_id: string }) => c.comment_id);

      const [{ data: voteData }, { data: reportData }] = await Promise.all([
        supabase
          .from("comment_votes")
          .select("comment_id, vote")
          .eq("user_id", currentUserId)
          .in("comment_id", commentIds),
        supabase
          .from("reports")
          .select("target_id")
          .eq("reporter_id", currentUserId)
          .eq("target_type", "comment")
          .in("target_id", commentIds),
      ]);

      if (voteData) {
        const voteMap: Record<string, 1 | -1> = {};
        for (const v of voteData) {
          voteMap[v.comment_id] = v.vote as 1 | -1;
        }
        setMyVotes(voteMap);
      }

      if (reportData) {
        setReportedIds(new Set(reportData.map((r: { target_id: string }) => r.target_id)));
      }
    }

    setLoading(false);
  }, [context.targetType, targetId, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 트리 구조 빌드
  const { topLevel, repliesMap } = useMemo(() => {
    const top: CommentData[] = [];
    const replies: Record<string, CommentData[]> = {};

    for (const c of comments) {
      if (c.parent_comment_id === null) {
        top.push(c);
      } else {
        if (!replies[c.parent_comment_id]) {
          replies[c.parent_comment_id] = [];
        }
        replies[c.parent_comment_id].push(c);
      }
    }

    // 답글은 created_at ASC 고정
    for (const key of Object.keys(replies)) {
      replies[key].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return { topLevel: top, repliesMap: replies };
  }, [comments]);

  // 최상위 댓글 정렬
  const sortedTopLevel = useMemo(() => {
    return [...topLevel].sort((a, b) => {
      if (sortMode === "top") {
        const scoreA = a.upvote_count - a.downvote_count;
        const scoreB = b.upvote_count - b.downvote_count;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [topLevel, sortMode]);

  // Top 3 고정 + 나머지
  const top3 = sortMode === "top" ? sortedTopLevel.slice(0, 3) : [];
  const rest = sortMode === "top" ? sortedTopLevel.slice(3) : sortedTopLevel;

  // 전체 최상위 댓글 수 (답글 제외)
  const topLevelCount = topLevel.length;

  // 폼 표시 조건 및 FormContext 결정
  const canShowForm = context.targetType === "recipe" ? !!context.cookLogId : isLoggedIn;

  const formContext =
    context.targetType === "recipe" && context.cookLogId
      ? ({
          targetType: "recipe",
          recipeId: context.recipeId,
          cookLogId: context.cookLogId,
        } as const)
      : context.targetType === "ingredient"
        ? ({ targetType: "ingredient", ingredientId: context.ingredientId } as const)
        : null;

  // 각 댓글의 canReply / formContext 결정
  const cardCanReply = context.targetType === "recipe" ? !!context.cookLogId : isLoggedIn;

  const cardFormContext = formContext;

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <div className="text-sm text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  const renderComment = (c: CommentData) => (
    <CommentCard
      key={c.comment_id}
      comment={c}
      myVote={myVotes[c.comment_id] ?? null}
      isLoggedIn={isLoggedIn}
      isOwner={currentUserId === c.user_id}
      canReply={cardCanReply}
      formContext={cardFormContext}
      replies={repliesMap[c.comment_id] ?? []}
      myVotes={myVotes}
      currentUserId={currentUserId}
      hasReported={reportedIds.has(c.comment_id)}
      reportedIds={reportedIds}
      onDeleted={fetchComments}
      onReplyAdded={fetchComments}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {t("title")}
          {topLevelCount > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">{topLevelCount}</span>
          )}
        </h3>
        {topLevelCount > 1 && (
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

      {/* 작성 폼 */}
      {canShowForm && formContext ? (
        <CommentForm context={formContext} onCommentAdded={fetchComments} />
      ) : isLoggedIn && context.targetType === "recipe" ? (
        <p className="text-sm text-muted-foreground">{t("requiresCook")}</p>
      ) : !isLoggedIn ? (
        <p className="text-sm text-muted-foreground">{t("loginToComment")}</p>
      ) : null}

      {/* Top 3 */}
      {top3.length > 0 && <div className="space-y-3">{top3.map(renderComment)}</div>}

      {/* 나머지 */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {sortMode === "top" && top3.length > 0 && <hr className="my-2" />}
          {rest.map(renderComment)}
        </div>
      )}

      {topLevelCount === 0 && <p className="text-sm text-muted-foreground">{t("noComments")}</p>}
    </div>
  );
}
