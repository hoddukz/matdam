// Tag: core
// Path: apps/web/src/components/comment/comment-card.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Trash2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { ReportDialog } from "@/components/report/report-dialog";
import { RankBadge } from "@/components/user/rank-badge";
import { CommentForm, type FormContext } from "./comment-form";
import { unwrapJoin } from "@/lib/supabase/unwrap-join";

type CommentUser = {
  display_name: string;
  avatar_url: string | null;
  activity_score?: number;
  verified_type?: "chef" | "partner" | null;
};

export type CommentData = {
  comment_id: string;
  target_type?: "recipe" | "ingredient";
  cook_log_id: string | null;
  recipe_id: string | null;
  ingredient_id?: string | null;
  user_id: string;
  body: string;
  image_url: string | null;
  upvote_count: number;
  downvote_count: number;
  parent_comment_id: string | null;
  created_at: string;
  users: CommentUser | CommentUser[];
};

interface CommentCardProps {
  comment: CommentData;
  myVote: 1 | -1 | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  isReply?: boolean;
  canReply: boolean;
  formContext: FormContext | null;
  replies?: CommentData[];
  myVotes?: Record<string, 1 | -1>;
  currentUserId: string | null;
  hasReported?: boolean;
  reportedIds?: Set<string>;
  onDeleted?: () => void;
  onReplyAdded?: () => void;
}

export function CommentCard({
  comment,
  myVote: initialMyVote,
  isLoggedIn,
  isOwner,
  isReply = false,
  canReply,
  formContext,
  replies = [],
  myVotes = {},
  currentUserId,
  hasReported = false,
  reportedIds = new Set(),
  onDeleted,
  onReplyAdded,
}: CommentCardProps) {
  const t = useTranslations("comments");
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  const [myVote, setMyVote] = useState<1 | -1 | null>(initialMyVote);
  const [upvotes, setUpvotes] = useState(comment.upvote_count);
  const [downvotes, setDownvotes] = useState(comment.downvote_count);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const author = unwrapJoin(comment.users);
  const timeAgo = getTimeAgo(comment.created_at, t, locale);

  async function handleVote(vote: 1 | -1) {
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    if (pending) return;
    setPending(true);

    const prevVote = myVote;
    const prevUp = upvotes;
    const prevDown = downvotes;
    const newVote = prevVote === vote ? null : vote;

    setMyVote(newVote);
    setUpvotes(prevUp + (newVote === 1 ? 1 : 0) - (prevVote === 1 ? 1 : 0));
    setDownvotes(prevDown + (newVote === -1 ? 1 : 0) - (prevVote === -1 ? 1 : 0));

    try {
      const supabase = supabaseRef.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (newVote === null) {
        const { error } = await supabase
          .from("comment_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", comment.comment_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_votes")
          .upsert(
            { user_id: user.id, comment_id: comment.comment_id, vote: newVote },
            { onConflict: "user_id,comment_id" }
          );
        if (error) throw error;
      }
    } catch {
      setMyVote(prevVote);
      setUpvotes(prevUp);
      setDownvotes(prevDown);
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(true);

    try {
      const supabase = supabaseRef.current;
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("comment_id", comment.comment_id);
      if (error) throw error;
      onDeleted?.();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div
        className={`rounded-lg border bg-muted/30 p-4 ${isReply ? "ml-8 border-l-2 border-l-muted-foreground/20" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center rounded-full bg-muted text-xs font-medium ${isReply ? "h-6 w-6" : "h-7 w-7"}`}
            >
              {author?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <Link
              href={`/${locale}/user/${comment.user_id}`}
              className={`font-medium underline-offset-4 hover:underline ${isReply ? "text-xs" : "text-sm"}`}
            >
              {author?.display_name ?? "—"}
            </Link>
            {author && (
              <RankBadge
                activityScore={author.activity_score ?? 0}
                verifiedType={author.verified_type ?? null}
              />
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isOwner && (
              <ReportDialog
                targetType="comment"
                targetId={comment.comment_id}
                isLoggedIn={isLoggedIn}
                hasReported={hasReported}
              />
            )}
          </div>
        </div>

        {/* Body + Vote 같은 줄 */}
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`whitespace-pre-line leading-relaxed ${isReply ? "text-xs" : "text-sm"}`}>
              {comment.body}
            </p>
            {/* Image */}
            {comment.image_url && (
              <Image
                src={comment.image_url}
                alt=""
                width={0}
                height={0}
                sizes="100vw"
                className="mt-2 max-h-48 w-auto rounded-lg object-cover"
              />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 gap-1 px-2 ${myVote === 1 ? "text-matdam-gold" : "text-muted-foreground"}`}
              onClick={() => handleVote(1)}
              disabled={pending}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {upvotes > 0 && <span className="text-xs">{upvotes}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 gap-1 px-2 ${myVote === -1 ? "text-destructive" : "text-muted-foreground"}`}
              onClick={() => handleVote(-1)}
              disabled={pending}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {downvotes > 0 && <span className="text-xs">{downvotes}</span>}
            </Button>
          </div>
        </div>

        {/* 답글 버튼 — 최상위 댓글만 (2단계 제한) */}
        {!isReply && canReply && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-3 w-3" />
              {t("reply")}
            </Button>
            {replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {showReplies ? t("hideReplies") : t("replyCount", { count: replies.length })}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 인라인 답글 폼 */}
      {!isReply && showReplyForm && canReply && formContext && (
        <div className="ml-8 mt-2">
          <CommentForm
            context={formContext}
            parentCommentId={comment.comment_id}
            onCommentAdded={() => {
              setShowReplyForm(false);
              onReplyAdded?.();
            }}
          />
        </div>
      )}

      {/* 답글 목록 */}
      {!isReply && showReplies && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <CommentCard
              key={reply.comment_id}
              comment={reply}
              myVote={myVotes[reply.comment_id] ?? null}
              isLoggedIn={isLoggedIn}
              isOwner={currentUserId === reply.user_id}
              isReply
              canReply={false}
              formContext={null}
              currentUserId={currentUserId}
              hasReported={reportedIds.has(reply.comment_id)}
              reportedIds={reportedIds}
              onDeleted={onReplyAdded}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(
  dateStr: string,
  t: (key: string, values?: Record<string, number>) => string,
  locale: string
): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { count: minutes });
  if (hours < 24) return t("hoursAgo", { count: hours });
  if (days < 30) return t("daysAgo", { count: days });
  return new Date(dateStr).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US");
}
