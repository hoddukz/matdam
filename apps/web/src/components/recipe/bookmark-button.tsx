// Tag: core
// Path: apps/web/src/components/recipe/bookmark-button.tsx

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface BookmarkButtonProps {
  recipeId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}

export function BookmarkButton({ recipeId, initialBookmarked, isLoggedIn }: BookmarkButtonProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }

    const prev = bookmarked;
    setBookmarked(!prev);
    setPending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (prev) {
        // 북마크 삭제
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId);
        if (error) throw error;
      } else {
        // 북마크 추가
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, recipe_id: recipeId });
        if (error) throw error;
      }
    } catch {
      // 롤백
      setBookmarked(prev);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1" onClick={handleToggle} disabled={pending}>
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-matdam-gold" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {bookmarked ? t("bookmarked") : t("bookmark")}
    </Button>
  );
}
