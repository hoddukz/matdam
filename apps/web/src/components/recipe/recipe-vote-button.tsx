// Tag: core
// Path: apps/web/src/components/recipe/recipe-vote-button.tsx

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface RecipeVoteButtonProps {
  recipeId: string;
  initialVote: 1 | -1 | null; // 현재 유저의 투표 상태
  initialUpvotes: number;
  initialDownvotes: number;
  isLoggedIn: boolean;
  size?: "sm" | "lg";
}

export function RecipeVoteButton({
  recipeId,
  initialVote,
  initialUpvotes,
  initialDownvotes,
  isLoggedIn,
  size = "sm",
}: RecipeVoteButtonProps) {
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  const [myVote, setMyVote] = useState<1 | -1 | null>(initialVote);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [pending, setPending] = useState(false);

  async function handleVote(vote: 1 | -1) {
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    if (pending) return;

    const prevVote = myVote;
    const prevUp = upvotes;
    const prevDown = downvotes;

    // 같은 버튼 → 취소, 다른 버튼 → 전환
    const newVote = prevVote === vote ? null : vote;

    // 낙관적 UI 업데이트
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
        // 투표 취소
        const { error } = await supabase
          .from("recipe_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId);
        if (error) throw error;
      } else {
        // UPSERT: 새 투표 또는 전환
        const { error } = await supabase
          .from("recipe_votes")
          .upsert(
            { user_id: user.id, recipe_id: recipeId, vote: newVote },
            { onConflict: "user_id,recipe_id" }
          );
        if (error) throw error;
      }
    } catch {
      // 롤백
      setMyVote(prevVote);
      setUpvotes(prevUp);
      setDownvotes(prevDown);
    } finally {
      setPending(false);
    }
  }

  const isLg = size === "lg";
  const iconClass = isLg ? "h-5 w-5" : "h-4 w-4";
  const btnSize = isLg ? "default" : "sm";

  return (
    <div className={`flex items-center ${isLg ? "justify-center gap-3" : "gap-1"}`}>
      <Button
        variant="outline"
        size={btnSize}
        className={`gap-2 ${isLg ? "px-6 py-2 text-base" : ""} ${myVote === 1 ? "border-matdam-gold bg-matdam-gold/10 text-matdam-gold" : ""}`}
        onClick={() => handleVote(1)}
        disabled={pending}
      >
        <ThumbsUp className={iconClass} />
        {upvotes > 0 && <span>{upvotes}</span>}
      </Button>
      <Button
        variant="outline"
        size={btnSize}
        className={`gap-2 ${isLg ? "px-6 py-2 text-base" : ""} ${myVote === -1 ? "border-destructive bg-destructive/10 text-destructive" : ""}`}
        onClick={() => handleVote(-1)}
        disabled={pending}
      >
        <ThumbsDown className={iconClass} />
        {downvotes > 0 && <span>{downvotes}</span>}
      </Button>
    </div>
  );
}
