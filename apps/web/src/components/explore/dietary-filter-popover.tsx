// Tag: core
// Path: apps/web/src/components/explore/dietary-filter-popover.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

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

export function DietaryFilterPopover() {
  const t = useTranslations("explore");
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDietary = (searchParams.get("dietary") ?? "")
    .split(",")
    .filter((v) => DIETARY_TAGS.includes(v as (typeof DIETARY_TAGS)[number]));

  function toggleTag(tag: string) {
    const next = currentDietary.includes(tag)
      ? currentDietary.filter((d) => d !== tag)
      : [...currentDietary, tag];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set("dietary", next.join(","));
    } else {
      params.delete("dietary");
    }
    router.push(`?${params.toString()}`);
  }

  const activeCount = currentDietary.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          {t("dietaryFilter")}
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-matdam-gold px-1.5 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-3">
        <div className="space-y-2">
          {DIETARY_TAGS.map((tag) => {
            const checked = currentDietary.includes(tag);
            return (
              <div key={tag} className="flex items-center gap-2">
                <Checkbox
                  id={`dietary-${tag}`}
                  checked={checked}
                  onCheckedChange={() => toggleTag(tag)}
                />
                <label htmlFor={`dietary-${tag}`} className="cursor-pointer text-sm">
                  {t(DIETARY_I18N_MAP[tag] as Parameters<typeof t>[0])}
                </label>
              </div>
            );
          })}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-xs"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("dietary");
              router.push(`?${params.toString()}`);
            }}
          >
            {t("clearFilters")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
