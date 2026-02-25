// Tag: core
// Path: apps/web/src/components/recipe/recipe-language-switcher.tsx

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecipeLanguageSwitcherProps {
  slug: string;
  availableLocales: string[];
  originalLocale: string;
}

const LOCALE_LABELS: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

export function RecipeLanguageSwitcher({
  slug,
  availableLocales,
  originalLocale,
}: RecipeLanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("recipeDetail");

  const isOriginal = locale === originalLocale;

  const handleSelect = (newLocale: string) => {
    if (newLocale !== locale) {
      router.push(`/${newLocale}/recipe/${slug}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none">
        <Globe className="h-3.5 w-3.5" />
        <span>{LOCALE_LABELS[locale] ?? locale}</span>
        <Badge
          variant={isOriginal ? "secondary" : "outline"}
          className="ml-0.5 px-1.5 py-0 text-[10px] leading-4"
        >
          {isOriginal ? t("original") : t("autoTranslated")}
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {availableLocales.map((loc) => {
          const isActive = loc === locale;
          const isOrig = loc === originalLocale;

          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleSelect(loc)}
              className={isActive ? "font-semibold" : ""}
            >
              <span>{LOCALE_LABELS[loc] ?? loc}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {isOrig ? `(${t("original")})` : `(${t("autoTranslated")})`}
              </span>
              {isActive && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
