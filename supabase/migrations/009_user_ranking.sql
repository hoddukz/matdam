-- Tag: core
-- Path: supabase/migrations/009_user_ranking.sql
--
-- 유저 활동 점수 시스템
-- activity_score: 활동 기반 자동 계산 (등급은 앱에서 매핑)
-- verified_type: 관리자 수동 부여 (chef / partner)

-- ============================================================
-- 1. 스키마 변경
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS activity_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_type TEXT DEFAULT NULL
    CHECK (verified_type IN ('chef', 'partner'));

CREATE INDEX IF NOT EXISTS idx_users_activity_score ON public.users(activity_score DESC);


-- ============================================================
-- 2. 활동 점수 동기화 트리거 함수
-- ============================================================
-- 점수 기준:
--   recipes (published)   +10  (INSERT/DELETE/UPDATE on published)
--   recipe_votes (upvote) +2   (INSERT/DELETE, 레시피 author에게)
--   cook_reviews          +3   (INSERT/DELETE, cook_log의 user에게)
--   comments              +1   (INSERT/DELETE, 작성자에게)
--   cook_logs             +1   (INSERT/DELETE, 작성자에게)
--   bookmarks             +1   (INSERT/DELETE, 레시피 author에게)

CREATE OR REPLACE FUNCTION public.sync_activity_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  delta INTEGER;
BEGIN
  -- ─── recipes ───
  IF TG_TABLE_NAME = 'recipes' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.published = true THEN
        target_user_id := NEW.author_id;
        delta := 10;
      ELSE
        RETURN NEW;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.published = true THEN
        target_user_id := OLD.author_id;
        delta := -10;
      ELSE
        RETURN OLD;
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      -- published 상태 변경 시에만 처리
      IF OLD.published = false AND NEW.published = true THEN
        target_user_id := NEW.author_id;
        delta := 10;
      ELSIF OLD.published = true AND NEW.published = false THEN
        target_user_id := NEW.author_id;
        delta := -10;
      ELSE
        RETURN NEW;
      END IF;
    END IF;

  -- ─── recipe_votes (upvote만) ───
  ELSIF TG_TABLE_NAME = 'recipe_votes' THEN
    IF TG_OP = 'INSERT' AND NEW.vote = 1 THEN
      SELECT author_id INTO target_user_id FROM public.recipes WHERE recipe_id = NEW.recipe_id;
      delta := 2;
    ELSIF TG_OP = 'DELETE' AND OLD.vote = 1 THEN
      SELECT author_id INTO target_user_id FROM public.recipes WHERE recipe_id = OLD.recipe_id;
      delta := -2;
    ELSE
      RETURN COALESCE(NEW, OLD);
    END IF;

  -- ─── cook_reviews ───
  ELSIF TG_TABLE_NAME = 'cook_reviews' THEN
    IF TG_OP = 'INSERT' THEN
      SELECT cl.user_id INTO target_user_id FROM public.cook_logs cl WHERE cl.cook_log_id = NEW.cook_log_id;
      delta := 3;
    ELSIF TG_OP = 'DELETE' THEN
      SELECT cl.user_id INTO target_user_id FROM public.cook_logs cl WHERE cl.cook_log_id = OLD.cook_log_id;
      delta := -3;
    ELSE
      RETURN COALESCE(NEW, OLD);
    END IF;

  -- ─── comments ───
  ELSIF TG_TABLE_NAME = 'comments' THEN
    IF TG_OP = 'INSERT' THEN
      target_user_id := NEW.user_id;
      delta := 1;
    ELSIF TG_OP = 'DELETE' THEN
      target_user_id := OLD.user_id;
      delta := -1;
    ELSE
      RETURN COALESCE(NEW, OLD);
    END IF;

  -- ─── cook_logs ───
  ELSIF TG_TABLE_NAME = 'cook_logs' THEN
    IF TG_OP = 'INSERT' THEN
      target_user_id := NEW.user_id;
      delta := 1;
    ELSIF TG_OP = 'DELETE' THEN
      target_user_id := OLD.user_id;
      delta := -1;
    ELSE
      RETURN COALESCE(NEW, OLD);
    END IF;

  -- ─── bookmarks ───
  ELSIF TG_TABLE_NAME = 'bookmarks' THEN
    IF TG_OP = 'INSERT' THEN
      SELECT author_id INTO target_user_id FROM public.recipes WHERE recipe_id = NEW.recipe_id;
      delta := 1;
    ELSIF TG_OP = 'DELETE' THEN
      SELECT author_id INTO target_user_id FROM public.recipes WHERE recipe_id = OLD.recipe_id;
      delta := -1;
    ELSE
      RETURN COALESCE(NEW, OLD);
    END IF;

  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- 점수 업데이트 (음수 방지)
  IF target_user_id IS NOT NULL THEN
    UPDATE public.users
    SET activity_score = GREATEST(0, activity_score + delta)
    WHERE user_id = target_user_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;


-- ============================================================
-- 3. 트리거 바인딩
-- ============================================================

CREATE TRIGGER trg_activity_score_recipes
  AFTER INSERT OR UPDATE OF published OR DELETE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.sync_activity_score();

CREATE TRIGGER trg_activity_score_recipe_votes
  AFTER INSERT OR DELETE ON public.recipe_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_activity_score();

CREATE TRIGGER trg_activity_score_cook_reviews
  AFTER INSERT OR DELETE ON public.cook_reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_activity_score();

CREATE TRIGGER trg_activity_score_comments
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_activity_score();

CREATE TRIGGER trg_activity_score_cook_logs
  AFTER INSERT OR DELETE ON public.cook_logs
  FOR EACH ROW EXECUTE FUNCTION public.sync_activity_score();

CREATE TRIGGER trg_activity_score_bookmarks
  AFTER INSERT OR DELETE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.sync_activity_score();


-- ============================================================
-- 4. 기존 데이터 백필
-- ============================================================

UPDATE public.users u
SET activity_score = GREATEST(0, (
  -- 공개 레시피 × 10
  (SELECT COUNT(*) FROM public.recipes r WHERE r.author_id = u.user_id AND r.published = true) * 10
  -- 받은 upvote × 2
  + (SELECT COUNT(*) FROM public.recipe_votes rv
     JOIN public.recipes r ON r.recipe_id = rv.recipe_id
     WHERE r.author_id = u.user_id AND rv.vote = 1) * 2
  -- cook_review × 3
  + (SELECT COUNT(*) FROM public.cook_reviews cr
     JOIN public.cook_logs cl ON cl.cook_log_id = cr.cook_log_id
     WHERE cl.user_id = u.user_id) * 3
  -- 댓글 × 1
  + (SELECT COUNT(*) FROM public.comments c WHERE c.user_id = u.user_id)
  -- cook_log × 1
  + (SELECT COUNT(*) FROM public.cook_logs cl WHERE cl.user_id = u.user_id)
  -- 받은 북마크 × 1
  + (SELECT COUNT(*) FROM public.bookmarks bm
     JOIN public.recipes r ON r.recipe_id = bm.recipe_id
     WHERE r.author_id = u.user_id)
));


-- ============================================================
-- 5. RPC 재정의 — activity_score, verified_type 반환 추가
--    반환 타입(OUT 컬럼) 변경 시 DROP 필수
-- ============================================================

DROP FUNCTION IF EXISTS public.search_recipes(TEXT, TEXT, TEXT[], TEXT[], INT, INT, TEXT[], TEXT[]);
DROP FUNCTION IF EXISTS public.get_popular_recipes(INT);
DROP FUNCTION IF EXISTS public.get_recommended_recipes(UUID, INT);

-- 5-1. search_recipes
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
  author_activity_score INT,
  author_verified_type  TEXT,
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
    u.activity_score AS author_activity_score,
    u.verified_type  AS author_verified_type,
    COUNT(*) OVER() AS total_count
  FROM public.recipes r
  JOIN public.users u ON u.user_id = r.author_id
  WHERE r.published = true
    AND (trimmed = '' OR (r.title->>'en') ILIKE '%' || trimmed || '%'
                      OR (r.title->>'ko') ILIKE '%' || trimmed || '%')
    AND (array_length(difficulty_filter, 1) IS NULL
         OR r.difficulty_level = ANY(difficulty_filter))
    AND (array_length(dietary_filter, 1) IS NULL
         OR r.dietary_tags && dietary_filter)
    AND (array_length(dietary_hard_filter, 1) IS NULL
         OR r.dietary_tags @> dietary_hard_filter)
  ORDER BY
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

-- 5-2. get_popular_recipes
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
  author_avatar_url   TEXT,
  author_activity_score INT,
  author_verified_type  TEXT
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
    u.avatar_url   AS author_avatar_url,
    u.activity_score AS author_activity_score,
    u.verified_type  AS author_verified_type
  FROM public.recipes r
  JOIN public.users u ON u.user_id = r.author_id
  WHERE r.published = true
  ORDER BY r.upvote_count DESC, r.created_at DESC
  LIMIT p_limit;
$$;

-- 5-3. get_recommended_recipes
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
  author_activity_score INT,
  author_verified_type  TEXT,
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
  SELECT (preferences->'taste_preferences') INTO v_prefs
  FROM public.users
  WHERE user_id = p_user_id;

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
    u.activity_score AS author_activity_score,
    u.verified_type  AS author_verified_type,
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
