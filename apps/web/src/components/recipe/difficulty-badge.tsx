"use client";

// Tag: util
// Path: apps/web/src/components/recipe/difficulty-badge.tsx

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_VARIANTS, DIFFICULTY_LABEL_KEYS } from "@/lib/recipe/constants";

interface DifficultyBadgeProps {
  level: string | null;
}

export function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const t = useTranslations("explore");

  if (!level) return null;

  const variant = DIFFICULTY_VARIANTS[level] ?? "outline";
  const labelKey = DIFFICULTY_LABEL_KEYS[level];

  return (
    <Badge variant={variant} className="shrink-0">
      {labelKey ? t(labelKey) : level}
    </Badge>
  );
}
