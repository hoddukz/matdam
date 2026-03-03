// Tag: core
// Path: packages/types/src/social.ts

/** 레시피 추천/비추천 */
export interface RecipeVote {
  user_id: string;
  recipe_id: string;
  vote: 1 | -1;
  created_at: string;
}

/** "만들어봤어요" 기록 */
export interface CookLog {
  cook_log_id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

/** 맛/품질 평가 (cook_log 필수) */
export interface CookReview {
  cook_log_id: string;
  // 심플 (기본 3개)
  taste_overall: number | null;
  felt_difficulty: number | null;
  would_make_again: number | null;
  // 디테일 (선택 6개)
  taste_sweet: number | null;
  taste_salty: number | null;
  taste_spicy: number | null;
  taste_sour: number | null;
  felt_accessibility: number | null;
  felt_time: number | null;
  created_at: string;
  updated_at: string;
}

/** 레시피 taste_profile JSONB 집계 결과 */
export interface TasteProfile {
  taste_overall: number | null;
  felt_difficulty: number | null;
  would_make_again: number | null;
  taste_sweet: number | null;
  taste_salty: number | null;
  taste_spicy: number | null;
  taste_sour: number | null;
  felt_accessibility: number | null;
  felt_time: number | null;
  review_count: number;
}

/** 코멘트 */
export interface Comment {
  comment_id: string;
  target_type: "recipe" | "ingredient";
  cook_log_id: string | null;
  recipe_id: string | null;
  ingredient_id: string | null;
  user_id: string;
  body: string;
  image_url: string | null;
  upvote_count: number;
  downvote_count: number;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

/** 코멘트 추천/비추천 */
export interface CommentVote {
  user_id: string;
  comment_id: string;
  vote: 1 | -1;
  created_at: string;
}
