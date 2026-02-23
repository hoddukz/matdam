// Tag: core
// Path: apps/web/src/components/recipe/cook-log-button.tsx

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CookingPot, Check } from "lucide-react";

interface CookLogButtonProps {
  recipeId: string;
  initialCookLogId: string | null;
  isLoggedIn: boolean;
  onCookLogCreated?: (cookLogId: string) => void;
}

export function CookLogButton({
  recipeId,
  initialCookLogId,
  isLoggedIn,
  onCookLogCreated,
}: CookLogButtonProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  const [cookLogId, setCookLogId] = useState<string | null>(initialCookLogId);
  const [pending, setPending] = useState(false);

  const hasCooked = cookLogId !== null;

  async function handleClick() {
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    if (pending || hasCooked) return;

    setPending(true);

    try {
      const supabase = supabaseRef.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("cook_logs")
        .insert({ user_id: user.id, recipe_id: recipeId })
        .select("cook_log_id")
        .single();

      if (error) throw error;

      setCookLogId(data.cook_log_id);
      onCookLogCreated?.(data.cook_log_id);
    } catch {
      // 중복 등 에러 무시
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={hasCooked ? "secondary" : "outline"}
      size="sm"
      className={`gap-1.5 ${hasCooked ? "border-green-500/50 text-green-600" : ""}`}
      onClick={handleClick}
      disabled={pending || hasCooked}
    >
      {hasCooked ? (
        <>
          <Check className="h-4 w-4" />
          {t("cooked")}
        </>
      ) : (
        <>
          <CookingPot className="h-4 w-4" />
          {pending ? t("cookingLog") : t("markCooked")}
        </>
      )}
    </Button>
  );
}
