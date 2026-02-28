// Tag: core
// Path: apps/web/src/components/recipe/recipe-language-switcher.tsx

"use client";

import { useRef, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe, Languages, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecipeLanguageSwitcherProps {
  slug: string;
  recipeId: string;
  availableLocales: string[];
  translatedLocales: Record<string, string>;
  originalLocale: string;
  isAuthenticated?: boolean;
}

const LOCALE_LABELS: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

export function RecipeLanguageSwitcher({
  slug,
  recipeId,
  availableLocales,
  translatedLocales,
  originalLocale,
  isAuthenticated = false,
}: RecipeLanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("recipeDetail");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  useEffect(() => {
    const timer = timerRef.current;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const isOriginal = locale === originalLocale;
  const isCurrentTranslated = availableLocales.includes(locale);
  const isStale = !isOriginal && !translatedLocales[locale];
  const showTranslateButton = isAuthenticated && !isOriginal;

  const dropdownLocales = availableLocales.includes(locale)
    ? availableLocales
    : [locale, ...availableLocales];

  const handleSelect = (newLocale: string) => {
    if (newLocale !== locale) {
      router.push(`/${newLocale}/recipe/${slug}`);
    }
  };

  async function handleTranslate() {
    setIsTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch("/api/translate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, force: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Translation failed");
      }
      // 하드 리로드로 ISR 캐시 우회
      window.location.reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[translate]", msg);
      setTranslateError(`${t("translateError")} (${msg})`);
    } finally {
      setIsTranslating(false);
    }
  }

  const getBadgeText = () => {
    if (isOriginal) return t("original");
    if (translatedLocales[locale]) return t("autoTranslated");
    if (isCurrentTranslated) return t("translationStale");
    return t("notTranslated");
  };

  const getBadgeVariant = () => {
    if (isOriginal) return "secondary" as const;
    return "outline" as const;
  };

  return (
    <div className="flex items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none">
          <Globe className="h-3.5 w-3.5" />
          <span>{LOCALE_LABELS[locale] ?? locale}</span>
          <Badge
            variant={getBadgeVariant()}
            className={`ml-0.5 px-1.5 py-0 text-[10px] leading-4${isStale ? " border-amber-400 text-amber-600 dark:text-amber-400" : ""}`}
          >
            {getBadgeText()}
          </Badge>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {dropdownLocales.map((loc) => {
            const isActive = loc === locale;
            const isOrig = loc === originalLocale;
            const hasContent = availableLocales.includes(loc);
            const isUpToDate = !!translatedLocales[loc];

            let statusText: string;
            if (isOrig) statusText = t("original");
            else if (isUpToDate) statusText = t("autoTranslated");
            else if (hasContent) statusText = t("translationStale");
            else statusText = t("notTranslated");

            return (
              <DropdownMenuItem
                key={loc}
                onClick={() => handleSelect(loc)}
                className={isActive ? "font-semibold" : ""}
              >
                <span>{LOCALE_LABELS[loc] ?? loc}</span>
                <span className="ml-2 text-xs text-muted-foreground">({statusText})</span>
                {isActive && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {showTranslateButton && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          {isTranslating ? t("translating") : t("translate")}
        </Button>
      )}
      {translateError && <span className="text-xs text-destructive">{translateError}</span>}
    </div>
  );
}
