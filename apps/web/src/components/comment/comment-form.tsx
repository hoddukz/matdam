// Tag: core
// Path: apps/web/src/components/comment/comment-form.tsx

"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export type FormContext =
  | { targetType: "recipe"; recipeId: string; cookLogId: string }
  | { targetType: "ingredient"; ingredientId: string };

interface CommentFormProps {
  context: FormContext;
  parentCommentId?: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ context, parentCommentId, onCommentAdded }: CommentFormProps) {
  const t = useTranslations("comments");
  const supabaseRef = useRef(createClient());

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReply = !!parentCommentId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 2000) return;

    setSubmitting(true);
    setError(null);

    try {
      const supabase = supabaseRef.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const insertData: Record<string, string> =
        context.targetType === "recipe"
          ? {
              target_type: "recipe",
              cook_log_id: context.cookLogId,
              recipe_id: context.recipeId,
              user_id: user.id,
              body: trimmed,
            }
          : {
              target_type: "ingredient",
              ingredient_id: context.ingredientId,
              user_id: user.id,
              body: trimmed,
            };

      if (parentCommentId) {
        insertData.parent_comment_id = parentCommentId;
      }

      const { error } = await supabase.from("comments").insert(insertData);

      if (error) throw error;

      setBody("");
      onCommentAdded?.();
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={isReply ? t("replyPlaceholder") : t("placeholder")}
          maxLength={2000}
          rows={isReply ? 1 : 2}
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
