// Tag: util
// Path: apps/web/src/components/recipe/difficulty-badge.tsx

import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_VARIANTS } from "@/lib/recipe/constants";

interface DifficultyBadgeProps {
  level: string | null;
  label?: string;
}

export function DifficultyBadge({ level, label }: DifficultyBadgeProps) {
  if (!level) return null;

  const variant = DIFFICULTY_VARIANTS[level] ?? "outline";

  return (
    <Badge variant={variant} className="shrink-0">
      {label ?? level}
    </Badge>
  );
}
