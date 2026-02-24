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
    key: "would_make_again",
    labelKey: "reviewMakeAgainShort",
    lowKey: "reviewMakeAgainLow",
    highKey: "reviewMakeAgainHigh",
  },
  {
    key: "felt_difficulty",
    labelKey: "reviewDifficultyShort",
    lowKey: "reviewDifficultyLow",
    highKey: "reviewDifficultyHigh",
  },
];

const DIFFICULTY_LABEL_KEYS = [
  "", // 0 unused
  "difficultyVeryHard",
  "difficultyHard",
  "difficultyNormal",
  "difficultyEasy",
  "difficultyVeryEasy",
];

const DIFFICULTY_EMOJI = [
  "",
  "\uD83E\uDD75",
  "\uD83D\uDE13",
  "\uD83D\uDE10",
  "\uD83D\uDE0A",
  "\uD83D\uDE0E",
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
          const isDifficulty = field.key === "felt_difficulty";
          const rounded = Math.round(value);

          return (
            <div key={field.key} className="flex flex-col items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {t(field.labelKey as Parameters<typeof t>[0])}
              </span>
              {isDifficulty ? (
                <>
                  <span className="text-2xl">
                    {DIFFICULTY_EMOJI[Math.min(Math.max(rounded, 1), 5)]}
                  </span>
                  <span className="text-xs font-medium text-matdam-gold">
                    {t(
                      DIFFICULTY_LABEL_KEYS[Math.min(Math.max(rounded, 1), 5)] as Parameters<
                        typeof t
                      >[0]
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl font-bold text-matdam-gold">{rounded}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i <= rounded ? "fill-matdam-gold text-matdam-gold" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
