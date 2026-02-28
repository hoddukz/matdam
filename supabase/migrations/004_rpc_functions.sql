-- Tag: core
-- Path: supabase/migrations_merged/004_rpc_functions.sql

-- ============================================================
-- MatDam — Consolidated RPC / Function Definitions
-- Merged from originals: 003, 008, 012, 018, 020
--
-- Consolidation notes:
--   • 003: search_ingredients RPC (unchanged)
--   • 008: upsert_recipe_details — superseded by 014, then 016
--     → only the final version (016) is kept here
--   • 012: get_popular_recipes + get_recommended_recipes RPCs
--   • 018: search_recipes v1 — superseded by 020
--     → only the final version (020) is kept here
--   • 020: search_recipes v2 (dietary soft/hard filter support)
--     The DROP FUNCTION from 020 is omitted since we only define
--     the final version once from scratch.
-- ============================================================


-- ============================================================
-- 1. search_ingredients RPC (from 003 — unchanged)
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_ingredients(
  search_term  TEXT,
  locale       TEXT DEFAULT 'en',
  result_limit INT  DEFAULT 10
)
RETURNS TABLE (
  id            TEXT,
  names         JSONB,
  category      TEXT,
  common_units  TEXT[],
  default_unit  TEXT,
  dietary_flags TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id,
    i.names,
    i.category,
    i.common_units,
    i.default_unit,
    i.dietary_flags
  FROM public.ingredients i
  WHERE
    length(trim(search_term)) >= 2
    AND (
      (i.names->>'en') ILIKE '%' || trim(search_term) || '%'
      OR
      (i.names->>'ko') ILIKE '%' || trim(search_term) || '%'
    )
  ORDER BY
    (
      CASE
        WHEN lower(i.names->>locale) = lower(trim(search_term))                           THEN 6
        WHEN lower(i.names->>locale) LIKE lower(trim(search_term)) || '%'                THEN 4
        WHEN lower(i.names->>locale) LIKE '%' || lower(trim(search_term)) || '%'         THEN 2
        ELSE 0
      END
      +
      CASE
        WHEN lower(i.names->>'en') = lower(trim(search_term))
          OR lower(i.names->>'ko') = lower(trim(search_term))                             THEN 3
        WHEN lower(i.names->>'en') LIKE lower(trim(search_term)) || '%'
          OR lower(i.names->>'ko') LIKE lower(trim(search_term)) || '%'                  THEN 2
        WHEN lower(i.names->>'en') LIKE '%' || lower(trim(search_term)) || '%'
          OR lower(i.names->>'ko') LIKE '%' || lower(trim(search_term)) || '%'           THEN 1
        ELSE 0
      END
    ) DESC,
    i.names->>locale ASC
  LIMIT result_limit;
$$;

GRANT EXECUTE ON FUNCTION public.search_ingredients(TEXT, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_ingredients(TEXT, TEXT, INT) TO anon;


-- ============================================================
-- 2. upsert_recipe_details RPC
--    Final version from 016 (note/qualifier as JSONB)
--    Supersedes versions from 008 and 014.
-- ============================================================

CREATE OR REPLACE FUNCTION public.upsert_recipe_details(
  p_recipe_id UUID,
  p_steps JSONB,
  p_ingredients JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 소유권 검증: 호출자가 해당 레시피의 author인지 확인
  IF NOT EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipe_id = p_recipe_id AND author_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  -- 1. 기존 steps/ingredients 삭제
  DELETE FROM public.recipe_steps WHERE recipe_id = p_recipe_id;
  DELETE FROM public.recipe_ingredients WHERE recipe_id = p_recipe_id;

  -- 2. 새 steps 삽입 (description, tip → JSONB 추출)
  INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, image_url, tip)
  SELECT
    p_recipe_id,
    (s->>'step_order')::int,
    s->'description',
    (s->>'timer_seconds')::int,
    s->>'image_url',
    NULLIF(s->'tip', 'null'::jsonb)
  FROM jsonb_array_elements(p_steps) AS s;

  -- 3. 새 ingredients 삽입 (custom_name, note, qualifier → JSONB 추출)
  INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
  SELECT
    p_recipe_id,
    NULLIF(i->>'ingredient_id', ''),
    NULLIF(i->'custom_name', 'null'::jsonb),
    (i->>'amount')::numeric,
    i->>'unit',
    NULLIF(i->'qualifier', 'null'::jsonb),
    NULLIF(i->'note', 'null'::jsonb),
    (i->>'step_number')::int,
    (i->>'display_order')::int
  FROM jsonb_array_elements(p_ingredients) AS i;

  -- 함수 전체가 단일 트랜잭션 → 중간 실패 시 자동 ROLLBACK
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_recipe_details(UUID, JSONB, JSONB) TO authenticated;


-- ============================================================
-- 3. Recommendation RPCs (from 012)
-- ============================================================

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


-- ============================================================
-- 4. search_recipes RPC — Final version (from 020)
--    v2: dietary_hard_filter + dietary_soft_filter support
--    Supersedes the v1 from 018 (no DROP needed — CREATE OR REPLACE
--    with the new signature replaces the old one if signatures match;
--    since 020 uses DROP + CREATE we define only the final version here).
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_recipes(
  search_term         TEXT    DEFAULT NULL,
  sort_option         TEXT    DEFAULT 'newest',
  difficulty_filter   TEXT[]  DEFAULT '{}',
  dietary_filter      TEXT[]  DEFAULT '{}',
  page_number         INT    DEFAULT 1,
  page_size           INT    DEFAULT 20,
  dietary_hard_filter TEXT[]  DEFAULT '{}',
  dietary_soft_filter TEXT[]  DEFAULT '{}'
)
RETURNS TABLE (
  recipe_id         UUID,
  slug              TEXT,
  title             JSONB,
  description       JSONB,
  hero_image_url    TEXT,
  difficulty_level  TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings          INT,
  created_at        TIMESTAMPTZ,
  parent_recipe_id  UUID,
  upvote_count      INT,
  dietary_tags      TEXT[],
  author_name       TEXT,
  author_avatar     TEXT,
  total_count       BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  trimmed TEXT := COALESCE(trim(search_term), '');
  soft_count INT := COALESCE(array_length(dietary_soft_filter, 1), 0);
BEGIN
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
    r.created_at,
    r.parent_recipe_id,
    r.upvote_count,
    r.dietary_tags,
    u.display_name AS author_name,
    u.avatar_url   AS author_avatar,
    COUNT(*) OVER() AS total_count
  FROM public.recipes r
  JOIN public.users u ON u.user_id = r.author_id
  WHERE r.published = true
    AND (trimmed = '' OR (r.title->>'en') ILIKE '%' || trimmed || '%'
                      OR (r.title->>'ko') ILIKE '%' || trimmed || '%')
    AND (array_length(difficulty_filter, 1) IS NULL
         OR r.difficulty_level = ANY(difficulty_filter))
    -- 레거시 dietary_filter (ANY 매칭)
    AND (array_length(dietary_filter, 1) IS NULL
         OR r.dietary_tags && dietary_filter)
    -- Hard 필터: 모든 태그 포함 필수
    AND (array_length(dietary_hard_filter, 1) IS NULL
         OR r.dietary_tags @> dietary_hard_filter)
  ORDER BY
    -- Soft 부스트: soft 태그와 매칭되는 수가 많을수록 상위
    CASE WHEN soft_count > 0 THEN
      COALESCE(array_length(
        ARRAY(
          SELECT unnest(r.dietary_tags)
          INTERSECT
          SELECT unnest(dietary_soft_filter)
        ), 1
      ), 0)
    ELSE 0 END DESC,
    CASE WHEN sort_option = 'popular' THEN r.upvote_count END DESC NULLS LAST,
    r.created_at DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_recipes(TEXT, TEXT, TEXT[], TEXT[], INT, INT, TEXT[], TEXT[])
  TO authenticated, anon;
