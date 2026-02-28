-- Tag: config
-- Path: supabase/migrations_merged/007_indexes.sql

-- ============================================================
-- MatDam — Composite Performance Indexes
-- Merged from original: 019 (unchanged)
--
-- Partial index (WHERE published = true) excludes drafts,
-- reducing index size. DESC ordering matches query patterns
-- (newest/popular sorts).
-- ============================================================


-- ============================================================
-- TIER 1 — 핵심 (매 페이지 로드마다 사용)
-- ============================================================

-- 홈 최신 레시피, explore 페이지네이션
CREATE INDEX IF NOT EXISTS idx_recipes_published_created
  ON public.recipes(created_at DESC)
  WHERE published = true;

-- 홈 인기 레시피 RPC
CREATE INDEX IF NOT EXISTS idx_recipes_published_upvote
  ON public.recipes(upvote_count DESC, created_at DESC)
  WHERE published = true;

-- 유저 프로필 레시피 목록
CREATE INDEX IF NOT EXISTS idx_recipes_author_created
  ON public.recipes(author_id, created_at DESC);

-- 레시피 상세: 유저가 요리했는지 체크
CREATE INDEX IF NOT EXISTS idx_cook_logs_user_recipe
  ON public.cook_logs(user_id, recipe_id);

-- 냉장고 털이: 재료→레시피 매칭
CREATE INDEX IF NOT EXISTS idx_ingredients_ingredient_recipe
  ON public.recipe_ingredients(ingredient_id, recipe_id);


-- ============================================================
-- TIER 2 — 고빈도 (상세 페이지, 리믹스)
-- ============================================================

-- 홈 리믹스 섹션
CREATE INDEX IF NOT EXISTS idx_recipes_published_remix
  ON public.recipes(created_at DESC)
  WHERE published = true AND parent_recipe_id IS NOT NULL;

-- 댓글 로딩 (레시피 상세)
CREATE INDEX IF NOT EXISTS idx_comments_recipe_created
  ON public.comments(recipe_id, created_at DESC);

-- 유저 투표 체크 (레시피 상세)
CREATE INDEX IF NOT EXISTS idx_recipe_votes_user_recipe
  ON public.recipe_votes(user_id, recipe_id);

-- 북마크 조회 (쇼핑 리스트, 프로필)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_recipe
  ON public.bookmarks(user_id, recipe_id);


-- ============================================================
-- TIER 3 — 보조
-- ============================================================

-- 신고 중복 체크: 006_reports.sql UNIQUE(reporter_id, target_type, target_id)
-- 제약조건이 동일 컬럼 순서의 인덱스를 자동 생성하므로 별도 인덱스 불필요

-- 스텝 순서 로딩
CREATE INDEX IF NOT EXISTS idx_steps_recipe_order
  ON public.recipe_steps(recipe_id, step_order);

-- 재료 순서 로딩
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_order
  ON public.recipe_ingredients(recipe_id, display_order);
