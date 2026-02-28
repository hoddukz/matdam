// Tag: util
// Path: apps/web/src/lib/user/rank-constants.ts

import type { UserRankKey } from "@matdam/types";

export interface RankDefinition {
  tier: number;
  key: UserRankKey;
  minScore: number;
  color: string;
  textColor: string;
}

export const RANK_DEFINITIONS: RankDefinition[] = [
  { tier: 1, key: "apprentice", minScore: 0, color: "bg-gray-200", textColor: "text-gray-700" },
  { tier: 2, key: "noviceCook", minScore: 30, color: "bg-green-200", textColor: "text-green-800" },
  { tier: 3, key: "homeCook", minScore: 100, color: "bg-blue-200", textColor: "text-blue-800" },
  {
    tier: 4,
    key: "skilledCook",
    minScore: 300,
    color: "bg-purple-200",
    textColor: "text-purple-800",
  },
  { tier: 5, key: "artisan", minScore: 700, color: "bg-amber-200", textColor: "text-amber-800" },
  { tier: 6, key: "master", minScore: 1500, color: "bg-orange-200", textColor: "text-orange-800" },
  {
    tier: 7,
    key: "grandmaster",
    minScore: 3000,
    color: "bg-matdam-gold/30",
    textColor: "text-matdam-gold",
  },
];

/** activity_score → 해당 등급 RankDefinition 반환 */
export function getRankFromScore(score: number): RankDefinition {
  for (let i = RANK_DEFINITIONS.length - 1; i >= 0; i--) {
    if (score >= RANK_DEFINITIONS[i].minScore) {
      return RANK_DEFINITIONS[i];
    }
  }
  return RANK_DEFINITIONS[0];
}

/** i18n 키 매핑 */
export const RANK_I18N_MAP: Record<UserRankKey, string> = {
  apprentice: "apprentice",
  noviceCook: "noviceCook",
  homeCook: "homeCook",
  skilledCook: "skilledCook",
  artisan: "artisan",
  master: "master",
  grandmaster: "grandmaster",
};
