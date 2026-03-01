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

/**
 * 등급별 권한 매핑
 * 새 권한 추가 시 여기에 키 + 필요 등급만 추가하면 됨
 */
export type RankPermission =
  | "suggest_ingredient_edit" // 재료 수정 제안
  | "report_content" // 콘텐츠 신고
  | "edit_ingredient" // 재료 직접 편집
  | "verify_recipe_vote" // 레시피 검증 투표
  | "add_ingredient" // 신규 재료 등록
  | "review_reports" // 신고 검토 참여
  | "curate_recipes" // 레시피 큐레이션
  | "moderate"; // 커뮤니티 모더레이터

const PERMISSION_MIN_RANK: Record<RankPermission, UserRankKey> = {
  suggest_ingredient_edit: "homeCook",
  report_content: "homeCook",
  edit_ingredient: "skilledCook",
  verify_recipe_vote: "skilledCook",
  add_ingredient: "artisan",
  review_reports: "artisan",
  curate_recipes: "master",
  moderate: "master",
};

/** activity_score 기준으로 특정 권한 보유 여부 확인 */
export function hasPermission(score: number, permission: RankPermission): boolean {
  const requiredKey = PERMISSION_MIN_RANK[permission];
  const requiredDef = RANK_DEFINITIONS.find((r) => r.key === requiredKey);
  if (!requiredDef) return false;
  return score >= requiredDef.minScore;
}
