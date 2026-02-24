// Tag: core
// Path: apps/web/src/components/explore/difficulty-filter-popover.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat } from "lucide-react";

const DIFFICULTIES = ["beginner", "intermediate", "master"] as const;

const DIFFICULTY_I18N_MAP: Record<string, string> = {
  beginner: "filterBeginner",
  intermediate: "filterIntermediate",
  master: "filterMaster",
};

export function DifficultyFilterPopover() {
  const t = useTranslations("explore");
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDifficulty = (searchParams.get("difficulty") ?? "")
    .split(",")
    .filter((v) => DIFFICULTIES.includes(v as (typeof DIFFICULTIES)[number]));

  function toggleLevel(level: string) {
    const next = currentDifficulty.includes(level)
      ? currentDifficulty.filter((d) => d !== level)
      : [...currentDifficulty, level];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set("difficulty", next.join(","));
    } else {
      params.delete("difficulty");
    }
    router.push(`?${params.toString()}`);
  }

  const activeCount = currentDifficulty.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ChefHat className="h-3.5 w-3.5" />
          {t("difficultyFilter")}
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-matdam-gold px-1.5 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-3">
        <div className="space-y-2">
          {DIFFICULTIES.map((level) => {
            const checked = currentDifficulty.includes(level);
            return (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={`diff-${level}`}
                  checked={checked}
                  onCheckedChange={() => toggleLevel(level)}
                />
                <label htmlFor={`diff-${level}`} className="cursor-pointer text-sm">
                  {t(DIFFICULTY_I18N_MAP[level] as Parameters<typeof t>[0])}
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
              params.delete("difficulty");
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
