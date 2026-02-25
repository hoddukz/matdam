// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/recipe-detail-client.tsx

"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { UnitToggle } from "@/components/recipe/unit-toggle";
import { useUnitPreference } from "@/stores/unit-preference";
import { formatAmount } from "@/lib/recipe/unit-display";
import { getLocalizedText } from "@/lib/recipe/localized-text";

interface IngredientData {
  ingredient_id: string | null;
  amount: number | null;
  unit: string | null;
  qualifier: string | null;
  note: string | null;
  custom_name: Record<string, string> | null;
  ingredients: {
    names: Record<string, string>;
    category: string;
  } | null;
}

interface RecipeDetailClientProps {
  ingredients: IngredientData[];
}

export function RecipeIngredientList({ ingredients }: RecipeDetailClientProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const { system } = useUnitPreference();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("ingredients")}</h2>
        <UnitToggle />
      </div>
      <ul className="space-y-2">
        {ingredients.map((ing, i) => {
          const name = ing.ingredients
            ? getLocalizedText(ing.ingredients?.names, locale)
            : ing.custom_name
              ? getLocalizedText(ing.custom_name, locale)
              : "";
          const hasGlossary = !!ing.ingredient_id && ing.ingredients?.category !== "seasoning";
          return (
            <li
              key={i}
              className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
            >
              {hasGlossary ? (
                <Link
                  href={`/${locale}/glossary/${ing.ingredient_id}`}
                  className="min-w-0 truncate font-medium text-matdam-gold underline-offset-4 hover:underline"
                >
                  {name}
                </Link>
              ) : (
                <span className="min-w-0 truncate font-medium">{name}</span>
              )}
              <span className="text-sm text-muted-foreground">
                {formatAmount(ing.amount, ing.unit, ing.qualifier, system)}
                {ing.note && <span className="ml-1 italic">({ing.note})</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
