// Tag: core
// Path: apps/web/src/components/user/rank-badge.tsx

"use client";

import { useTranslations } from "next-intl";
import { getRankFromScore } from "@/lib/user/rank-constants";
import { BadgeCheck } from "lucide-react";
import type { VerifiedType } from "@matdam/types";

interface RankBadgeProps {
  activityScore: number;
  verifiedType?: VerifiedType | null;
  size?: "sm" | "md";
}

export function RankBadge({ activityScore, verifiedType, size = "sm" }: RankBadgeProps) {
  const t = useTranslations("rank");
  const rank = getRankFromScore(activityScore);
  const label = t(rank.key);

  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center rounded-full font-medium ${rank.color} ${rank.textColor} ${sizeClasses}`}
      >
        {label}
      </span>
      {verifiedType && (
        <BadgeCheck
          className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} ${
            verifiedType === "chef" ? "text-blue-500" : "text-purple-500"
          }`}
        />
      )}
    </span>
  );
}
