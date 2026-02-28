// Tag: core
// Path: apps/web/src/components/explore/dietary-filter-popover.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import type { DietaryPreference, DietaryPreferenceMode } from "@matdam/types";

const DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "pescatarian",
  "gluten_free",
  "dairy_free",
  "nut_free",
  "halal",
  "low_calorie",
  "diabetic_friendly",
  "low_sodium",
] as const;

const DIETARY_I18N_MAP: Record<string, string> = {
  vegan: "filterDietaryVegan",
  vegetarian: "filterDietaryVegetarian",
  pescatarian: "filterDietaryPescatarian",
  gluten_free: "filterDietaryGlutenFree",
  dairy_free: "filterDietaryDairyFree",
  nut_free: "filterDietaryNutFree",
  halal: "filterDietaryHalal",
  low_calorie: "filterDietaryLowCalorie",
  diabetic_friendly: "filterDietaryDiabeticFriendly",
  low_sodium: "filterDietaryLowSodium",
};

type TagState = {
  tag: string;
  mode: DietaryPreferenceMode;
};

interface DietaryFilterPopoverProps {
  userPreferences?: DietaryPreference[];
}

export function DietaryFilterPopover({ userPreferences }: DietaryFilterPopoverProps) {
  const t = useTranslations("explore");
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 현재 상태 읽기 (URL > 유저 설정 > 빈 상태)
  const urlHard = (searchParams.get("dietary_hard") ?? "")
    .split(",")
    .filter((v) => DIETARY_TAGS.includes(v as (typeof DIETARY_TAGS)[number]));
  const urlSoft = (searchParams.get("dietary_soft") ?? "")
    .split(",")
    .filter((v) => DIETARY_TAGS.includes(v as (typeof DIETARY_TAGS)[number]));
  // 레거시 dietary 파라미터 → hard로 취급
  const urlLegacy = (searchParams.get("dietary") ?? "")
    .split(",")
    .filter((v) => DIETARY_TAGS.includes(v as (typeof DIETARY_TAGS)[number]));

  // URL에 명시적 파라미터가 있으면 URL 사용, 없으면 유저 설정 폴백
  const hasUrlParams =
    searchParams.has("dietary_hard") ||
    searchParams.has("dietary_soft") ||
    searchParams.has("dietary");

  function buildTagStates(): TagState[] {
    if (hasUrlParams) {
      const states: TagState[] = [];
      const allHard = new Set([...urlHard, ...urlLegacy]);
      for (const tag of allHard) {
        states.push({ tag, mode: "hard" });
      }
      for (const tag of urlSoft) {
        if (!allHard.has(tag)) {
          states.push({ tag, mode: "soft" });
        }
      }
      return states;
    }
    // 유저 설정 폴백
    if (userPreferences && userPreferences.length > 0) {
      return userPreferences.map((p) => ({ tag: p.tag, mode: p.mode }));
    }
    return [];
  }

  const tagStates = buildTagStates();
  const tagStateMap = new Map(tagStates.map((s) => [s.tag, s.mode]));

  function updateUrl(newStates: TagState[]) {
    const params = new URLSearchParams(searchParams.toString());
    // 레거시 dietary 제거
    params.delete("dietary");
    // 페이지 리셋
    params.delete("page");

    const hardTags = newStates.filter((s) => s.mode === "hard").map((s) => s.tag);
    const softTags = newStates.filter((s) => s.mode === "soft").map((s) => s.tag);

    if (hardTags.length > 0) {
      params.set("dietary_hard", hardTags.join(","));
    } else {
      params.delete("dietary_hard");
    }

    if (softTags.length > 0) {
      params.set("dietary_soft", softTags.join(","));
    } else {
      params.delete("dietary_soft");
    }

    router.push(`?${params.toString()}`);
  }

  function handleCheckToggle(tag: string) {
    if (tagStateMap.has(tag)) {
      // 선택 해제
      updateUrl(tagStates.filter((s) => s.tag !== tag));
    } else {
      // 새로 선택 → 기본 hard
      updateUrl([...tagStates, { tag, mode: "hard" }]);
    }
  }

  function handleModeToggle(tag: string) {
    updateUrl(
      tagStates.map((s) =>
        s.tag === tag ? { ...s, mode: s.mode === "hard" ? "soft" : "hard" } : s
      )
    );
  }

  function handleClearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dietary");
    params.delete("dietary_hard");
    params.delete("dietary_soft");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  const hardCount = tagStates.filter((s) => s.mode === "hard").length;
  const softCount = tagStates.filter((s) => s.mode === "soft").length;
  const totalCount = hardCount + softCount;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          {t("dietaryFilter")}
          {hardCount > 0 && (
            <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-white">
              {hardCount}
            </span>
          )}
          {softCount > 0 && (
            <span className="ml-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs text-white">
              {softCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="space-y-2">
          {DIETARY_TAGS.map((tag) => {
            const checked = tagStateMap.has(tag);
            const mode = tagStateMap.get(tag);
            return (
              <div key={tag} className="flex items-center gap-2">
                <Checkbox
                  id={`dietary-${tag}`}
                  checked={checked}
                  onCheckedChange={() => handleCheckToggle(tag)}
                />
                <label htmlFor={`dietary-${tag}`} className="flex-1 cursor-pointer text-sm">
                  {t(DIETARY_I18N_MAP[tag] as Parameters<typeof t>[0])}
                </label>
                {checked && (
                  <button
                    type="button"
                    onClick={() => handleModeToggle(tag)}
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                      mode === "hard"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-400/10 text-amber-600"
                    }`}
                  >
                    {mode === "hard" ? t("filterModeHard") : t("filterModeSoft")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {totalCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-xs"
            onClick={handleClearAll}
          >
            {t("clearFilters")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
