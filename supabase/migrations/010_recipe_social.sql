-- Tag: core
-- Path: supabase/migrations/010_recipe_social.sql

-- ============================================================
-- Migration 010: 레시피 소셜 기능
--   - recipe_votes (추천/비추천)
--   - cook_logs (만들어봤어요)
--   - cook_reviews (맛/품질 평가)
--   - comments (코멘트)
--   - comment_votes (코멘트 추천/비추천)
--   - recipes 테이블 확장 (taste_profile, vote 캐시)
-- ============================================================


-- ============================================================
-- 1. recipes 테이블 확장
-- ============================================================

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS taste_profile   JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS upvote_count    INT   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvote_count  INT   NOT NULL DEFAULT 0;


-- ============================================================
-- 2. recipe_votes — 레시피 추천/비추천
-- ============================================================

CREATE TABLE public.recipe_votes (
  user_id    UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  recipe_id  UUID        NOT NULL REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
  vote       SMALLINT    NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE INDEX idx_recipe_votes_recipe_id ON public.recipe_votes(recipe_id);

-- RLS
ALTER TABLE public.recipe_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_votes_select_all" ON public.recipe_votes
  FOR SELECT USING (true);

CREATE POLICY "recipe_votes_insert_own" ON public.recipe_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipe_votes_update_own" ON public.recipe_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "recipe_votes_delete_own" ON public.recipe_votes
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- 3. 투표 카운트 동기화 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_recipe_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_recipe_id UUID;
BEGIN
  -- DELETE 시 OLD, 그 외 NEW
  target_recipe_id := COALESCE(NEW.recipe_id, OLD.recipe_id);

  UPDATE public.recipes
  SET
    upvote_count   = (SELECT COUNT(*) FROM public.recipe_votes WHERE recipe_id = target_recipe_id AND vote = 1),
    downvote_count = (SELECT COUNT(*) FROM public.recipe_votes WHERE recipe_id = target_recipe_id AND vote = -1)
  WHERE recipe_id = target_recipe_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recipe_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.recipe_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_recipe_vote_counts();


-- ============================================================
-- 4. cook_logs — "만들어봤어요" 기록
-- ============================================================

CREATE TABLE public.cook_logs (
  cook_log_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  recipe_id   UUID        NOT NULL REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

CREATE INDEX idx_cook_logs_recipe_id ON public.cook_logs(recipe_id);
CREATE INDEX idx_cook_logs_user_id   ON public.cook_logs(user_id);

-- RLS
ALTER TABLE public.cook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cook_logs_select_all" ON public.cook_logs
  FOR SELECT USING (true);

CREATE POLICY "cook_logs_insert_own" ON public.cook_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cook_logs_delete_own" ON public.cook_logs
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- 5. cook_reviews — 맛/품질 평가
-- ============================================================

CREATE TABLE public.cook_reviews (
  cook_log_id UUID        PRIMARY KEY REFERENCES public.cook_logs(cook_log_id) ON DELETE CASCADE,

  -- 심플 (기본 3개)
  taste_overall     SMALLINT CHECK (taste_overall BETWEEN 1 AND 5),
  felt_difficulty   SMALLINT CHECK (felt_difficulty BETWEEN 1 AND 5),
  would_make_again  SMALLINT CHECK (would_make_again BETWEEN 1 AND 5),

  -- 디테일 (선택 6개)
  taste_sweet        SMALLINT CHECK (taste_sweet BETWEEN 1 AND 5),
  taste_salty        SMALLINT CHECK (taste_salty BETWEEN 1 AND 5),
  taste_spicy        SMALLINT CHECK (taste_spicy BETWEEN 1 AND 5),
  taste_sour         SMALLINT CHECK (taste_sour BETWEEN 1 AND 5),
  felt_accessibility SMALLINT CHECK (felt_accessibility BETWEEN 1 AND 5),
  felt_time          SMALLINT CHECK (felt_time BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_cook_reviews_updated_at
  BEFORE UPDATE ON public.cook_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: cook_log 소유자만 INSERT/UPDATE, SELECT 전체
ALTER TABLE public.cook_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cook_reviews_select_all" ON public.cook_reviews
  FOR SELECT USING (true);

CREATE POLICY "cook_reviews_insert_own" ON public.cook_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cook_logs
      WHERE cook_log_id = cook_reviews.cook_log_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "cook_reviews_update_own" ON public.cook_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cook_logs
      WHERE cook_log_id = cook_reviews.cook_log_id
        AND user_id = auth.uid()
    )
  );


-- ============================================================
-- 6. 맛 프로필 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_recipe_taste_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_recipe_id UUID;
BEGIN
  -- cook_log_id로 recipe_id 조회
  SELECT cl.recipe_id INTO target_recipe_id
  FROM public.cook_logs cl
  WHERE cl.cook_log_id = COALESCE(NEW.cook_log_id, OLD.cook_log_id);

  IF target_recipe_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.recipes
  SET taste_profile = (
    SELECT jsonb_build_object(
      'taste_overall',     ROUND(AVG(cr.taste_overall), 1),
      'felt_difficulty',   ROUND(AVG(cr.felt_difficulty), 1),
      'would_make_again',  ROUND(AVG(cr.would_make_again), 1),
      'taste_sweet',       ROUND(AVG(cr.taste_sweet), 1),
      'taste_salty',       ROUND(AVG(cr.taste_salty), 1),
      'taste_spicy',       ROUND(AVG(cr.taste_spicy), 1),
      'taste_sour',        ROUND(AVG(cr.taste_sour), 1),
      'felt_accessibility', ROUND(AVG(cr.felt_accessibility), 1),
      'felt_time',         ROUND(AVG(cr.felt_time), 1),
      'review_count',      COUNT(*)::int
    )
    FROM public.cook_reviews cr
    JOIN public.cook_logs cl ON cl.cook_log_id = cr.cook_log_id
    WHERE cl.recipe_id = target_recipe_id
  )
  WHERE recipe_id = target_recipe_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recipe_taste_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.cook_reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_recipe_taste_profile();


-- ============================================================
-- 7. comments — 코멘트 (만들어본 사람만)
-- ============================================================

CREATE TABLE public.comments (
  comment_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_log_id UUID        NOT NULL REFERENCES public.cook_logs(cook_log_id) ON DELETE CASCADE,
  recipe_id   UUID        NOT NULL REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  body        TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  image_url   TEXT,
  upvote_count   INT      NOT NULL DEFAULT 0,
  downvote_count INT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_recipe_id ON public.comments(recipe_id);
CREATE INDEX idx_comments_user_id   ON public.comments(user_id);

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: cook_log 소유자만 INSERT, 본인 UPDATE/DELETE, SELECT 전체
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_own" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.cook_logs
      WHERE cook_log_id = comments.cook_log_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- 8. comment_votes — 코멘트 추천/비추천
-- ============================================================

CREATE TABLE public.comment_votes (
  user_id    UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  comment_id UUID        NOT NULL REFERENCES public.comments(comment_id) ON DELETE CASCADE,
  vote       SMALLINT    NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);

-- RLS
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_votes_select_all" ON public.comment_votes
  FOR SELECT USING (true);

CREATE POLICY "comment_votes_insert_own" ON public.comment_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_votes_update_own" ON public.comment_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comment_votes_delete_own" ON public.comment_votes
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- 9. 코멘트 투표 카운트 동기화 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_comment_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_comment_id UUID;
BEGIN
  target_comment_id := COALESCE(NEW.comment_id, OLD.comment_id);

  UPDATE public.comments
  SET
    upvote_count   = (SELECT COUNT(*) FROM public.comment_votes WHERE comment_id = target_comment_id AND vote = 1),
    downvote_count = (SELECT COUNT(*) FROM public.comment_votes WHERE comment_id = target_comment_id AND vote = -1)
  WHERE comment_id = target_comment_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_comment_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_vote_counts();
