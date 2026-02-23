// Tag: core
// Path: apps/web/src/components/recipe/taste-profile-display.tsx

"use client";

import { useTranslations } from "next-intl";
import type { TasteProfile } from "@matdam/types";

interface TasteProfileDisplayProps {
  profile: TasteProfile | null;
  cookCount: number;
}

type DisplayField = {
  key: keyof TasteProfile;
  labelKey: string;
  lowKey: string;
  highKey: string;
};

const SIMPLE_DISPLAY: DisplayField[] = [
  {
    key: "taste_overall",
    labelKey: "reviewTasteOverall",
    lowKey: "reviewTasteOverallLow",
    highKey: "reviewTasteOverallHigh",
  },
  {
    key: "felt_difficulty",
    labelKey: "reviewDifficulty",
    lowKey: "reviewDifficultyLow",
    highKey: "reviewDifficultyHigh",
  },
  {
    key: "would_make_again",
    labelKey: "reviewMakeAgain",
    lowKey: "reviewMakeAgainLow",
    highKey: "reviewMakeAgainHigh",
  },
];

const DETAIL_DISPLAY: DisplayField[] = [
  {
    key: "taste_sweet",
    labelKey: "reviewSweet",
    lowKey: "reviewSweetLow",
    highKey: "reviewSweetHigh",
  },
  {
    key: "taste_salty",
    labelKey: "reviewSalty",
    lowKey: "reviewSaltyLow",
    highKey: "reviewSaltyHigh",
  },
  {
    key: "taste_spicy",
    labelKey: "reviewSpicy",
    lowKey: "reviewSpicyLow",
    highKey: "reviewSpicyHigh",
  },
  { key: "taste_sour", labelKey: "reviewSour", lowKey: "reviewSourLow", highKey: "reviewSourHigh" },
  {
    key: "felt_accessibility",
    labelKey: "reviewAccessibility",
    lowKey: "reviewAccessibilityLow",
    highKey: "reviewAccessibilityHigh",
  },
  { key: "felt_time", labelKey: "reviewTime", lowKey: "reviewTimeLow", highKey: "reviewTimeHigh" },
];

export function TasteProfileDisplay({ profile, cookCount }: TasteProfileDisplayProps) {
  const t = useTranslations("recipeDetail");

  if (!profile || cookCount === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        {t("noReviews")}
      </div>
    );
  }

  function renderBar(field: DisplayField) {
    const value = profile![field.key] as number | null;
    if (value === null) return null;

    const percentage = ((value - 1) / 4) * 100;

    return (
      <div key={field.key} className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span>{t(field.labelKey as Parameters<typeof t>[0])}</span>
          <span className="font-medium">{value}</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-matdam-gold transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{t(field.lowKey as Parameters<typeof t>[0])}</span>
          <span>{t(field.highKey as Parameters<typeof t>[0])}</span>
        </div>
      </div>
    );
  }

  const hasDetailData = DETAIL_DISPLAY.some((f) => (profile[f.key] as number | null) !== null);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("tasteProfileTitle")}</h3>
        <span className="text-xs text-muted-foreground">
          {t("cookCount", { count: cookCount })}
        </span>
      </div>

      <div className="space-y-3">{SIMPLE_DISPLAY.map(renderBar)}</div>

      {hasDetailData && (
        <>
          <hr />
          <div className="space-y-3">{DETAIL_DISPLAY.map(renderBar)}</div>
        </>
      )}
    </div>
  );
}
