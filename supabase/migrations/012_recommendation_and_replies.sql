-- Tag: core
-- Path: supabase/migrations/012_recommendation_and_replies.sql
-- Phase 5: 추천 시스템 RPC + 대댓글 parent_comment_id

------------------------------------------------------------
-- A. 추천 RPC 함수
------------------------------------------------------------

-- RPC 1: 인기 레시피 (upvote_count DESC)
CREATE OR REPLACE FUNCTION public.get_popular_recipes(p_limit INT DEFAULT 6)
RETURNS TABLE (
  recipe_id   UUID,
  slug        TEXT,
  title       JSONB,
  description JSONB,
  hero_image_url TEXT,
  difficulty_level TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings    INT,
  upvote_count INT,
  created_at  TIMESTAMPTZ,
  author_display_name TEXT,
  author_avatar_url   TEXT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    r.recipe_id,
    r.slug,
    r.title,
    r.description,
    r.hero_image_url,
    r.difficulty_level,
    r.prep_time_minutes,
    r.cook_time_minutes,
    r.servings,
    r.upvote_count,
    r.created_at,
    u.display_name AS author_display_name,
    u.avatar_url   AS author_avatar_url
  FROM public.recipes r
  JOIN public.users u ON u.user_id = r.author_id
  WHERE r.published = true
  ORDER BY r.upvote_count DESC, r.created_at DESC
  LIMIT p_limit;
$$;

-- RPC 2: 맞춤 추천 (유클리디안 거리 기반)
CREATE OR REPLACE FUNCTION public.get_recommended_recipes(p_user_id UUID, p_limit INT DEFAULT 6)
RETURNS TABLE (
  recipe_id   UUID,
  slug        TEXT,
  title       JSONB,
  description JSONB,
  hero_image_url TEXT,
  difficulty_level TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings    INT,
  upvote_count INT,
  created_at  TIMESTAMPTZ,
  author_display_name TEXT,
  author_avatar_url   TEXT,
  distance    FLOAT
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_prefs JSONB;
  v_sweet FLOAT;
  v_salty FLOAT;
  v_spicy FLOAT;
  v_sour  FLOAT;
BEGIN
  -- 사용자 taste_preferences 조회
  SELECT (preferences->'taste_preferences') INTO v_prefs
  FROM public.users
  WHERE user_id = p_user_id;

  -- preferences가 없으면 빈 결과
  IF v_prefs IS NULL THEN
    RETURN;
  END IF;

  v_sweet := COALESCE((v_prefs->>'sweet')::FLOAT, 3);
  v_salty := COALESCE((v_prefs->>'salty')::FLOAT, 3);
  v_spicy := COALESCE((v_prefs->>'spicy')::FLOAT, 3);
  v_sour  := COALESCE((v_prefs->>'sour')::FLOAT, 3);

  RETURN QUERY
  SELECT
    r.recipe_id,
    r.slug,
    r.title,
    r.description,
    r.hero_image_url,
    r.difficulty_level,
    r.prep_time_minutes,
    r.cook_time_minutes,
    r.servings,
    r.upvote_count,
    r.created_at,
    u.display_name AS author_display_name,
    u.avatar_url   AS author_avatar_url,
    |/ (
      POWER(COALESCE((r.taste_profile->>'taste_sweet')::FLOAT, 3) - v_sweet, 2) +
      POWER(COALESCE((r.taste_profile->>'taste_salty')::FLOAT, 3) - v_salty, 2) +
      POWER(COALESCE((r.taste_profile->>'taste_spicy')::FLOAT, 3) - v_spicy, 2) +
      POWER(COALESCE((r.taste_profile->>'taste_sour')::FLOAT, 3)  - v_sour, 2)
    ) AS distance
  FROM public.recipes r
  JOIN public.users u ON u.user_id = r.author_id
  WHERE r.published = true
    AND r.taste_profile IS NOT NULL
    AND COALESCE((r.taste_profile->>'review_count')::INT, 0) >= 1
  ORDER BY distance ASC, r.upvote_count DESC
  LIMIT p_limit;
END;
$$;

------------------------------------------------------------
-- B. 대댓글: parent_comment_id 추가
------------------------------------------------------------

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(comment_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON public.comments(parent_comment_id)
  WHERE parent_comment_id IS NOT NULL;
