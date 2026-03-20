// Tag: core
// Path: apps/web/src/app/[locale]/onboarding/_components/onboarding-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createClient } from "@/lib/supabase/client";
import {
  SKILL_LEVELS,
  CUISINES,
  DIET_TYPES,
  PROTEINS,
  RESTRICTIONS,
  TASTE_KEYS,
  DEFAULT_TASTES,
  CUISINE_EMOJI_MAP,
  CUISINE_I18N_MAP,
  DIET_I18N_MAP,
  PROTEIN_I18N_MAP,
  RESTRICTION_I18N_MAP,
  TASTE_I18N_MAP,
  SKILL_I18N_MAP,
  SELECTED_STYLE,
  toggleItem,
} from "@/lib/user/preference-constants";
import type {
  DifficultyLevel,
  CuisinePreference,
  DietType,
  DietaryRestriction,
  DietaryPreference,
  DietaryPreferenceMode,
  ProteinPreference,
  TastePreferences,
  UserPreferences,
} from "@matdam/types";
import { initDietaryPrefs } from "@/lib/user/dietary-helpers";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import posthog from "posthog-js";

const TOTAL_STEPS = 4;

interface OnboardingFormProps {
  defaultDisplayName: string;
  existingPreferences?: Partial<UserPreferences> | null;
}

export function OnboardingForm({ defaultDisplayName, existingPreferences }: OnboardingFormProps) {
  const supabaseRef = useRef(createClient());
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [skillLevel, setSkillLevel] = useState<DifficultyLevel | null>(
    existingPreferences?.skill_level ?? null
  );

  // Step 2
  const [cuisines, setCuisines] = useState<CuisinePreference[]>(
    existingPreferences?.cuisines ?? []
  );

  // Step 3
  const [dietType, setDietType] = useState<DietType | null>(existingPreferences?.diet_type ?? null);
  const [proteins, setProteins] = useState<ProteinPreference[]>(
    existingPreferences?.protein_preferences ?? []
  );
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(
    initDietaryPrefs(existingPreferences)
  );

  // Step 4
  const [tastes, setTastes] = useState<TastePreferences>(
    existingPreferences?.taste_preferences ?? { ...DEFAULT_TASTES }
  );

  function canProceed(): boolean {
    if (step === 1) {
      const trimmed = displayName.trim();
      return trimmed.length >= 2 && trimmed.length <= 30;
    }
    return true;
  }

  function handleNext() {
    if (step === 1 && !canProceed()) {
      setError(t("displayNameError"));
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSkip() {
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function toggleRestriction(restriction: DietaryRestriction) {
    setDietaryPrefs((prev) => {
      const existing = prev.find((p) => p.tag === restriction);
      if (existing) {
        return prev.filter((p) => p.tag !== restriction);
      }
      return [...prev, { tag: restriction, mode: "hard" as DietaryPreferenceMode }];
    });
  }

  function toggleRestrictionMode(restriction: DietaryRestriction) {
    setDietaryPrefs((prev) =>
      prev.map((p) =>
        p.tag === restriction
          ? { ...p, mode: p.mode === "hard" ? ("soft" as const) : ("hard" as const) }
          : p
      )
    );
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);

    const {
      data: { user },
    } = await supabaseRef.current.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    // 하위 호환: dietary_restrictions 배열도 함께 저장
    const restrictionTags = dietaryPrefs.map((p) => p.tag);

    const preferences: UserPreferences = {
      onboarding_complete: true,
      ...(skillLevel && { skill_level: skillLevel }),
      ...(cuisines.length > 0 && { cuisines }),
      ...(dietType && { diet_type: dietType }),
      ...(proteins.length > 0 && { protein_preferences: proteins }),
      ...(dietaryPrefs.length > 0 && {
        dietary_restrictions: restrictionTags,
        dietary_preferences: dietaryPrefs,
      }),
      taste_preferences: tastes,
    };

    const { error: updateError } = await supabaseRef.current
      .from("users")
      .update({
        display_name: displayName.trim(),
        preferences,
      })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    posthog.capture("signup_completed", { user_id: user.id });
    setSubmitting(false);
    router.push(`/${locale}`);
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-all ${
              i + 1 <= step ? "bg-matdam-gold" : "bg-muted"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {t("stepIndicator", { current: step, total: TOTAL_STEPS })}
        </span>
      </div>

      {/* Step 1: Nickname + Skill Level */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">{t("step1Title")}</h2>
            <p className="text-sm text-muted-foreground">{t("step1Subtitle")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">{t("displayNameLabel")}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("displayNamePlaceholder")}
              minLength={2}
              maxLength={30}
              required
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label>{t("skillLevelLabel")}</Label>
            <div className="grid grid-cols-3 gap-3">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`rounded-lg border p-3 text-center transition-all hover:border-matdam-gold/50 ${
                    skillLevel === level ? SELECTED_STYLE : "border-border"
                  }`}
                >
                  <div className="text-2xl">
                    {level === "beginner" ? "🥄" : level === "intermediate" ? "🍳" : "👨‍🍳"}
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {t(SKILL_I18N_MAP[level].label as Parameters<typeof t>[0])}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t(SKILL_I18N_MAP[level].desc as Parameters<typeof t>[0])}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Cuisine Interests */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">{t("step2Title")}</h2>
            <p className="text-sm text-muted-foreground">{t("step2Subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                onClick={() => setCuisines(toggleItem(cuisines, cuisine))}
                className={`rounded-lg border p-3 text-center transition-all hover:border-matdam-gold/50 ${
                  cuisines.includes(cuisine) ? SELECTED_STYLE : "border-border"
                }`}
              >
                <div className="text-2xl">{CUISINE_EMOJI_MAP[cuisine]}</div>
                <div className="mt-1 text-sm font-medium">
                  {t(CUISINE_I18N_MAP[cuisine] as Parameters<typeof t>[0])}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Dietary Profile */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">{t("step3Title")}</h2>
            <p className="text-sm text-muted-foreground">{t("step3Subtitle")}</p>
          </div>

          {/* Diet Type */}
          <div className="space-y-3">
            <Label>{t("dietTypeLabel")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {DIET_TYPES.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => setDietType(dt)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-all hover:border-matdam-gold/50 ${
                    dietType === dt ? SELECTED_STYLE : "border-border"
                  }`}
                >
                  {t(DIET_I18N_MAP[dt] as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Proteins */}
          <div className="space-y-3">
            <Label>{t("proteinLabel")}</Label>
            <div className="flex flex-wrap gap-2">
              {PROTEINS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProteins(toggleItem(proteins, p))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-all hover:border-matdam-gold/50 ${
                    proteins.includes(p) ? SELECTED_STYLE : "border-border"
                  }`}
                >
                  {t(PROTEIN_I18N_MAP[p] as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Restrictions with Soft/Hard toggle */}
          <div className="space-y-3">
            <Label>{t("restrictionsLabel")}</Label>
            <div className="space-y-2">
              {RESTRICTIONS.map((r) => {
                const pref = dietaryPrefs.find((p) => p.tag === r);
                const isSelected = !!pref;
                return (
                  <div key={r} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRestriction(r)}
                      className={`flex-1 rounded-full border px-3 py-1.5 text-sm text-left transition-all hover:border-matdam-gold/50 ${
                        isSelected ? SELECTED_STYLE : "border-border"
                      }`}
                    >
                      {t(RESTRICTION_I18N_MAP[r] as Parameters<typeof t>[0])}
                    </button>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => toggleRestrictionMode(r)}
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                          pref.mode === "hard"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-400/10 text-amber-600"
                        }`}
                      >
                        {pref.mode === "hard" ? t("modeHard") : t("modeSoft")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Taste Preferences */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">{t("step4Title")}</h2>
            <p className="text-sm text-muted-foreground">{t("step4Subtitle")}</p>
          </div>

          <div className="space-y-5">
            {TASTE_KEYS.map((tasteKey) => {
              const i18n = TASTE_I18N_MAP[tasteKey];
              return (
                <div key={tasteKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t(i18n.label as Parameters<typeof t>[0])}</Label>
                    <span className="text-sm font-medium text-matdam-gold">{tastes[tasteKey]}</span>
                  </div>
                  <Slider
                    value={[tastes[tasteKey]]}
                    onValueChange={([v]: number[]) =>
                      setTastes((prev: TastePreferences) => ({ ...prev, [tasteKey]: v }))
                    }
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t(i18n.low as Parameters<typeof t>[0])}</span>
                    <span>{t(i18n.high as Parameters<typeof t>[0])}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
            {t("back")}
          </Button>
        )}

        {step > 1 && step < TOTAL_STEPS && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            {t("skip")}
          </Button>
        )}

        {step < TOTAL_STEPS && (
          <Button type="button" onClick={handleNext} className="flex-1" disabled={!canProceed()}>
            {t("next")}
          </Button>
        )}

        {step === TOTAL_STEPS && (
          <Button type="button" onClick={handleSubmit} className="flex-1" disabled={submitting}>
            {submitting ? t("submitting") : t("start")}
          </Button>
        )}
      </div>
    </div>
  );
}
