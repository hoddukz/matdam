// Tag: core
// Path: apps/web/src/components/recipe/recipe-owner-menu.tsx

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeleteRecipeButton } from "./delete-recipe-button";
import { createClient } from "@/lib/supabase/client";
import { extractStoragePath } from "@/lib/supabase/storage";
import { Languages, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface RecipeOwnerMenuProps {
  recipeId: string;
  editHref: string;
}

export function RecipeOwnerMenu({ recipeId, editHref }: RecipeOwnerMenuProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translateSuccess, setTranslateSuccess] = useState(false);

  async function handleTranslate() {
    setIsTranslating(true);
    setTranslateError(null);
    setTranslateSuccess(false);
    try {
      const res = await fetch("/api/translate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) throw new Error("Translation failed");
      setTranslateSuccess(true);
      router.refresh();
      setTimeout(() => setTranslateSuccess(false), 3000);
    } catch {
      setTranslateError(t("translateError"));
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const supabase = supabaseRef.current;
    try {
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

      const { error } = await supabase.from("recipes").delete().eq("recipe_id", recipeId);
      if (error) throw error;

      try {
        const { data: files } = await supabase.storage.from("recipe-images").list(recipeId);
        const regularPaths = files?.map((f) => `${recipeId}/${f.name}`) ?? [];
        const allPaths = [...regularPaths, ...extraImagePaths];
        if (allPaths.length > 0) {
          await supabase.storage.from("recipe-images").remove(allPaths);
        }
      } catch {
        // storage 정리 실패는 무시
      }

      window.location.href = `/${locale}/profile`;
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* Desktop: 기존 버튼 */}
      <div className="hidden md:flex md:items-center md:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {isTranslating ? t("translating") : t("translate")}
        </Button>
        {translateSuccess && (
          <span className="text-sm text-green-600">{t("translateSuccess")}</span>
        )}
        {translateError && <span className="text-sm text-destructive">{translateError}</span>}
        <Button variant="outline" size="sm" className="gap-1" asChild>
          <Link href={editHref}>
            <Pencil className="h-4 w-4" />
            {t("edit")}
          </Link>
        </Button>
        <DeleteRecipeButton recipeId={recipeId} />
      </div>

      {/* Mobile: ... 드롭다운 */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onSelect={handleTranslate} disabled={isTranslating}>
              {isTranslating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Languages className="h-4 w-4" />
              )}
              {isTranslating ? t("translating") : t("translate")}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={editHref} className="gap-2">
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onSelect={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
        {translateSuccess && <p className="mt-1 text-xs text-green-600">{t("translateSuccess")}</p>}
        {translateError && <p className="mt-1 text-xs text-destructive">{translateError}</p>}
      </div>
    </>
  );
}
