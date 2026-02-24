// Tag: core
// Path: apps/web/src/components/recipe/taste-profile-display.tsx

"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
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

export function TasteProfileDisplay({ profile, cookCount }: TasteProfileDisplayProps) {
  const t = useTranslations("recipeDetail");

  if (!profile || cookCount === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        {t("noReviews")}
      </div>
    );
  }

  const allFields = SIMPLE_DISPLAY.filter((f) => (profile[f.key] as number | null) !== null);

  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("tasteProfileTitle")}</h3>
        <span className="text-xs text-muted-foreground">
          {t("cookCount", { count: cookCount })}
        </span>
      </div>
      <div className="flex justify-around">
        {allFields.map((field) => {
          const value = profile![field.key] as number;
          return (
            <div key={field.key} className="flex flex-col items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {t(field.labelKey as Parameters<typeof t>[0])}
              </span>
              <span className="text-xl font-bold text-matdam-gold">{value}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i <= value ? "fill-matdam-gold text-matdam-gold" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
