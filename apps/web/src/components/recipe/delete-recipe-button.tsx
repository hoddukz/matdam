// Tag: core
// Path: apps/web/src/components/recipe/delete-recipe-button.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Trash2 } from "lucide-react";

interface DeleteRecipeButtonProps {
  recipeId: string;
  iconOnly?: boolean;
}

export function DeleteRecipeButton({ recipeId, iconOnly }: DeleteRecipeButtonProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      // storage 이미지 삭제 (recipeId 폴더 전체)
      const { data: files } = await supabase.storage.from("recipe-images").list(recipeId);

      if (files && files.length > 0) {
        const paths = files.map((f) => `${recipeId}/${f.name}`);
        await supabase.storage.from("recipe-images").remove(paths);
      }

      // recipe 삭제 (CASCADE로 steps/ingredients 자동 삭제)
      const { error } = await supabase.from("recipes").delete().eq("recipe_id", recipeId);

      if (error) throw error;

      router.push(`/${locale}/profile`);
    } catch {
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
          <AlertDialogCancel>{t("deleteCancel")}</AlertDialogCancel>
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
