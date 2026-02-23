// Tag: core
// Path: apps/web/src/components/recipe/comment-card.tsx

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";

interface CommentCardProps {
  comment: {
    comment_id: string;
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
  myVote: 1 | -1 | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  onDeleted?: () => void;
}

export function CommentCard({
  comment,
  myVote: initialMyVote,
  isLoggedIn,
  isOwner,
  onDeleted,
}: CommentCardProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  const [myVote, setMyVote] = useState<1 | -1 | null>(initialMyVote);
  const [upvotes, setUpvotes] = useState(comment.upvote_count);
  const [downvotes, setDownvotes] = useState(comment.downvote_count);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const author = Array.isArray(comment.users) ? comment.users[0] : comment.users;
  const timeAgo = getTimeAgo(comment.created_at, locale);

  async function handleVote(vote: 1 | -1) {
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    if (pending) return;

    const prevVote = myVote;
    const prevUp = upvotes;
    const prevDown = downvotes;
    const newVote = prevVote === vote ? null : vote;

    setMyVote(newVote);
    setUpvotes(prevUp + (newVote === 1 ? 1 : 0) - (prevVote === 1 ? 1 : 0));
    setDownvotes(prevDown + (newVote === -1 ? 1 : 0) - (prevVote === -1 ? 1 : 0));
    setPending(true);

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
    if (!confirm(t("commentDeleteConfirm"))) return;
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
    <div className="rounded-lg border bg-muted/30 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {author.display_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{author.display_name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
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
      </div>

      {/* Body + Vote 같은 줄 */}
      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line text-sm leading-relaxed">{comment.body}</p>
          {/* Image */}
          {comment.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={comment.image_url} alt="" className="mt-2 max-h-48 rounded-lg object-cover" />
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
    </div>
  );
}

function getTimeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (locale === "ko") {
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 30) return `${days}일 전`;
    return new Date(dateStr).toLocaleDateString("ko-KR");
  }

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US");
}
