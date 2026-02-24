// Tag: core
// Path: apps/web/src/components/recipe/delete-recipe-button.tsx

"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { extractStoragePath } from "@/lib/supabase/storage";
import { Trash2 } from "lucide-react";

interface DeleteRecipeButtonProps {
  recipeId: string;
  iconOnly?: boolean;
}

export function DeleteRecipeButton({ recipeId, iconOnly }: DeleteRecipeButtonProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // DB 삭제 전 step image_url 수집 (temp 경로 포함)
      // NOTE: 생성 직후 relocation 미완료 상태에서 삭제 시 일부 temp 파일 누락 가능 (극히 드문 케이스)
      const extraImagePaths: string[] = [];
      try {
        const { data: steps } = await supabase
          .from("recipe_steps")
          .select("image_url")
          .eq("recipe_id", recipeId);
        if (steps) {
          for (const step of steps) {
            if (step.image_url) {
              const p = extractStoragePath(step.image_url);
              if (p && !p.startsWith(`${recipeId}/`)) {
                extraImagePaths.push(p);
              }
            }
          }
        }
      } catch {
        // 수집 실패 시 삭제 진행
      }

      // DB 삭제 (CASCADE로 steps/ingredients 자동 삭제)
      const { error } = await supabase.from("recipes").delete().eq("recipe_id", recipeId);
      if (error) throw error;

      // storage 이미지 정리 — {recipeId}/ 디렉토리 + 수집한 temp 경로
      try {
        const { data: files } = await supabase.storage.from("recipe-images").list(recipeId);
        const regularPaths = files?.map((f) => `${recipeId}/${f.name}`) ?? [];
        const allPaths = [...regularPaths, ...extraImagePaths];
        if (allPaths.length > 0) {
          await supabase.storage.from("recipe-images").remove(allPaths);
        }
      } catch {
        // storage 정리 실패는 무시 (고아 이미지는 치명적이지 않음)
      }

      window.location.href = `/${locale}/profile`;
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {iconOnly ? (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {t("delete")}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {deleteError && <p className="w-full text-sm text-destructive">{deleteError}</p>}
          <AlertDialogCancel disabled={isDeleting}>{t("deleteCancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
