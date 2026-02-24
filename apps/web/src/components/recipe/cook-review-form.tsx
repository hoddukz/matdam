// Tag: core
// Path: apps/web/src/components/recipe/cook-review-form.tsx

"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CookReview } from "@matdam/types";

interface CookReviewFormProps {
  cookLogId: string;
  existingReview?: Partial<CookReview> | null;
  onSaved?: () => void;
}

type ReviewField =
  | "taste_overall"
  | "felt_difficulty"
  | "would_make_again"
  | "taste_sweet"
  | "taste_salty"
  | "taste_spicy"
  | "taste_sour"
  | "felt_accessibility"
  | "felt_time";

const SLIDER_SIMPLE_FIELDS: ReviewField[] = ["taste_overall", "would_make_again"];

const DIFFICULTY_OPTIONS = [
  { value: 1, labelKey: "difficultyVeryHard" },
  { value: 2, labelKey: "difficultyHard" },
  { value: 3, labelKey: "difficultyNormal" },
  { value: 4, labelKey: "difficultyEasy" },
  { value: 5, labelKey: "difficultyVeryEasy" },
] as const;
const DETAIL_FIELDS: ReviewField[] = [
  "taste_sweet",
  "taste_salty",
  "taste_spicy",
  "taste_sour",
  "felt_accessibility",
  "felt_time",
];

const FIELD_I18N: Record<ReviewField, { label: string; low: string; high: string }> = {
  taste_overall: {
    label: "reviewTasteOverall",
    low: "reviewTasteOverallLow",
    high: "reviewTasteOverallHigh",
  },
  felt_difficulty: {
    label: "reviewDifficulty",
    low: "reviewDifficultyLow",
    high: "reviewDifficultyHigh",
  },
  would_make_again: {
    label: "reviewMakeAgain",
    low: "reviewMakeAgainLow",
    high: "reviewMakeAgainHigh",
  },
  taste_sweet: { label: "reviewSweet", low: "reviewSweetLow", high: "reviewSweetHigh" },
  taste_salty: { label: "reviewSalty", low: "reviewSaltyLow", high: "reviewSaltyHigh" },
  taste_spicy: { label: "reviewSpicy", low: "reviewSpicyLow", high: "reviewSpicyHigh" },
  taste_sour: { label: "reviewSour", low: "reviewSourLow", high: "reviewSourHigh" },
  felt_accessibility: {
    label: "reviewAccessibility",
    low: "reviewAccessibilityLow",
    high: "reviewAccessibilityHigh",
  },
  felt_time: { label: "reviewTime", low: "reviewTimeLow", high: "reviewTimeHigh" },
};

export function CookReviewForm({ cookLogId, existingReview, onSaved }: CookReviewFormProps) {
  const t = useTranslations("recipeDetail");
  const supabaseRef = useRef(createClient());

  const [showDetail, setShowDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<Record<ReviewField, number | null>>({
    taste_overall: existingReview?.taste_overall ?? null,
    felt_difficulty: existingReview?.felt_difficulty ?? null,
    would_make_again: existingReview?.would_make_again ?? null,
    taste_sweet: existingReview?.taste_sweet ?? null,
    taste_salty: existingReview?.taste_salty ?? null,
    taste_spicy: existingReview?.taste_spicy ?? null,
    taste_sour: existingReview?.taste_sour ?? null,
    felt_accessibility: existingReview?.felt_accessibility ?? null,
    felt_time: existingReview?.felt_time ?? null,
  });

  function handleSliderChange(field: ReviewField, val: number) {
    setValues((prev) => ({ ...prev, [field]: val }));
    setSaved(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSaved(false);
    setError(null);

    try {
      const supabase = supabaseRef.current;

      const payload: Record<string, unknown> = { cook_log_id: cookLogId };
      for (const field of [
        ...SLIDER_SIMPLE_FIELDS,
        "felt_difficulty" as ReviewField,
        ...DETAIL_FIELDS,
      ]) {
        payload[field] = values[field];
      }

      const { error } = await supabase
        .from("cook_reviews")
        .upsert(payload, { onConflict: "cook_log_id" });

      if (error) throw error;

      setSaved(true);
      onSaved?.();
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  function renderSlider(field: ReviewField) {
    const i18n = FIELD_I18N[field];
    const value = values[field];

    return (
      <div key={field} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">{t(i18n.label as Parameters<typeof t>[0])}</Label>
          <span className="text-sm font-medium text-matdam-gold">{value ?? "—"}</span>
        </div>
        <Slider
          value={value !== null ? [value] : [3]}
          onValueChange={([v]: number[]) => handleSliderChange(field, v)}
          min={1}
          max={5}
          step={1}
          className={value === null ? "opacity-50" : ""}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t(i18n.low as Parameters<typeof t>[0])}</span>
          <span>{t(i18n.high as Parameters<typeof t>[0])}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg rounded-t-none border border-t-0 p-4">
      {/* 심플: 슬라이더 2개 + 난이도 버튼 그룹 */}
      <div className="space-y-4">
        {renderSlider("taste_overall")}

        {/* 난이도 — 버튼 그룹 */}
        <div className="space-y-2">
          <Label className="text-sm">{t("reviewDifficulty")}</Label>
          <div className="flex gap-1.5">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isSelected = values.felt_difficulty === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setValues((prev) => ({ ...prev, felt_difficulty: opt.value }));
                    setSaved(false);
                  }}
                  className={`flex-1 rounded-md border px-1.5 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-matdam-gold bg-matdam-gold/10 text-matdam-gold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t(opt.labelKey as Parameters<typeof t>[0])}
                </button>
              );
            })}
          </div>
        </div>

        {renderSlider("would_make_again")}
      </div>

      {/* 디테일 토글 */}
      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {t("reviewDetailToggle")}
      </button>

      {showDetail && <div className="space-y-4">{DETAIL_FIELDS.map(renderSlider)}</div>}

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? t("reviewSubmitting")
              : existingReview
                ? t("reviewUpdate")
                : t("reviewSubmit")}
          </Button>
          {saved && <span className="text-sm text-green-600">{t("reviewSaved")}</span>}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
