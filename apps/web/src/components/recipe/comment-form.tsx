// Tag: core
// Path: apps/web/src/components/recipe/comment-form.tsx

"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentFormProps {
  recipeId: string;
  cookLogId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ recipeId, cookLogId, onCommentAdded }: CommentFormProps) {
  const t = useTranslations("recipeDetail");
  const supabaseRef = useRef(createClient());

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 2000) return;

    setSubmitting(true);

    try {
      const supabase = supabaseRef.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("comments").insert({
        cook_log_id: cookLogId,
        recipe_id: recipeId,
        user_id: user.id,
        body: trimmed,
      });

      if (error) throw error;

      setBody("");
      onCommentAdded?.();
    } catch {
      // 에러 무시
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("commentPlaceholder")}
        maxLength={2000}
        rows={2}
        className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <Button
        type="submit"
        className="h-auto w-10 shrink-0 rounded-lg"
        disabled={submitting || !body.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
