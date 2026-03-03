// Tag: core
// Path: apps/web/src/app/[locale]/settings/_components/settings-form.tsx

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
  CUISINE_I18N_MAP,
  DIET_I18N_MAP,
  PROTEIN_I18N_MAP,
  RESTRICTION_I18N_MAP,
  TASTE_I18N_MAP,
  SKILL_LABEL_I18N_MAP,
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
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useState } from "react";

interface SettingsFormProps {
  currentDisplayName: string;
  currentPreferences?: Partial<UserPreferences> | null;
}

/** 기존 dietary_restrictions → DietaryPreference[] 폴백 변환 */
function initDietaryPrefs(prefs?: Partial<UserPreferences> | null): DietaryPreference[] {
  if (prefs?.dietary_preferences && prefs.dietary_preferences.length > 0) {
    return prefs.dietary_preferences;
  }
  if (prefs?.dietary_restrictions && prefs.dietary_restrictions.length > 0) {
    return prefs.dietary_restrictions.map((tag) => ({ tag, mode: "hard" as const }));
  }
  return [];
}

export function SettingsForm({ currentDisplayName, currentPreferences }: SettingsFormProps) {
  const supabaseRef = useRef(createClient());
  const t = useTranslations("settings");
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [selectedLocale, setSelectedLocale] = useState<"ko" | "en">(
    (currentPreferences?.preferred_locale as "ko" | "en") ?? (currentLocale as "ko" | "en")
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [skillLevel, setSkillLevel] = useState<DifficultyLevel | null>(
    currentPreferences?.skill_level ?? null
  );
  const [cuisines, setCuisines] = useState<CuisinePreference[]>(currentPreferences?.cuisines ?? []);
  const [dietType, setDietType] = useState<DietType | null>(currentPreferences?.diet_type ?? null);
  const [proteins, setProteins] = useState<ProteinPreference[]>(
    currentPreferences?.protein_preferences ?? []
  );
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(
    initDietaryPrefs(currentPreferences)
  );
  const [tastes, setTastes] = useState<TastePreferences>(
    currentPreferences?.taste_preferences ?? { ...DEFAULT_TASTES }
  );

  function toggleRestriction(restriction: DietaryRestriction) {
    setSaved(false);
    setDietaryPrefs((prev) => {
      const existing = prev.find((p) => p.tag === restriction);
      if (existing) {
        return prev.filter((p) => p.tag !== restriction);
      }
      return [...prev, { tag: restriction, mode: "hard" as DietaryPreferenceMode }];
    });
  }

  function toggleRestrictionMode(restriction: DietaryRestriction) {
    setSaved(false);
    setDietaryPrefs((prev) =>
      prev.map((p) =>
        p.tag === restriction
          ? { ...p, mode: p.mode === "hard" ? ("soft" as const) : ("hard" as const) }
          : p
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    const trimmed = displayName.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setError(t("displayNameError"));
      return;
    }

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
      preferred_locale: selectedLocale,
    };

    const { error: updateError } = await supabaseRef.current
      .from("users")
      .update({
        display_name: trimmed,
        preferences,
      })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    // NEXT_LOCALE 쿠키 설정 (1년)
    document.cookie = `NEXT_LOCALE=${selectedLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;

    setSubmitting(false);
    setSaved(true);

    // locale이 변경된 경우 새 locale URL로 redirect
    if (selectedLocale !== currentLocale) {
      const newPath = pathname.replace(`/${currentLocale}`, `/${selectedLocale}`);
      router.push(newPath);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("displayNameLabel")}</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setSaved(false);
          }}
          placeholder={t("displayNamePlaceholder")}
          minLength={2}
          maxLength={30}
          required
        />
      </div>

      {/* Language */}
      <div className="space-y-3">
        <Label>{t("languageLabel")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["ko", "en"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                setSelectedLocale(loc);
                setSaved(false);
              }}
              className={`rounded-lg border px-3 py-2 text-sm transition-all hover:border-matdam-gold/50 ${
                selectedLocale === loc ? SELECTED_STYLE : "border-border"
              }`}
            >
              {t(loc === "ko" ? "languageKo" : "languageEn")}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level */}
      <div className="space-y-3">
        <Label>{t("skillLevelLabel")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                setSkillLevel(level);
                setSaved(false);
              }}
              className={`rounded-lg border px-3 py-2 text-sm transition-all hover:border-matdam-gold/50 ${
                skillLevel === level ? SELECTED_STYLE : "border-border"
              }`}
            >
              {t(SKILL_LABEL_I18N_MAP[level] as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisines */}
      <div className="space-y-3">
        <Label>{t("cuisinesLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              onClick={() => {
                setCuisines(toggleItem(cuisines, cuisine));
                setSaved(false);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm transition-all hover:border-matdam-gold/50 ${
                cuisines.includes(cuisine) ? SELECTED_STYLE : "border-border"
              }`}
            >
              {t(CUISINE_I18N_MAP[cuisine] as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </div>

      {/* Diet Type */}
      <div className="space-y-3">
        <Label>{t("dietTypeLabel")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {DIET_TYPES.map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => {
                setDietType(dt);
                setSaved(false);
              }}
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
              onClick={() => {
                setProteins(toggleItem(proteins, p));
                setSaved(false);
              }}
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

      {/* Taste Preferences */}
      <div className="space-y-4">
        <Label>{t("tasteLabel")}</Label>
        {TASTE_KEYS.map((tasteKey) => {
          const i18n = TASTE_I18N_MAP[tasteKey];
          return (
            <div key={tasteKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t(i18n.label as Parameters<typeof t>[0])}</span>
                <span className="text-sm font-medium text-matdam-gold">{tastes[tasteKey]}</span>
              </div>
              <Slider
                value={[tastes[tasteKey]]}
                onValueChange={([v]: number[]) => {
                  setTastes((prev: TastePreferences) => ({ ...prev, [tasteKey]: v }));
                  setSaved(false);
                }}
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

      {error && <p className="text-destructive text-sm">{error}</p>}
      {saved && <p className="text-green-600 text-sm">{t("saved")}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
