-- Tag: core
-- Path: supabase/migrations/012_glossary_comments_and_discussions.sql

-- ============================================================
-- MatDam — Glossary Comments + Discussions (disabled)
-- ============================================================

-- ============================================================
-- 1. comments 테이블 확장 (식재료 댓글 지원)
-- ============================================================

-- target_type 컬럼 추가 (기본값 'recipe'로 기존 데이터 호환)
ALTER TABLE public.comments ADD COLUMN target_type TEXT NOT NULL DEFAULT 'recipe';
ALTER TABLE public.comments ADD COLUMN ingredient_id TEXT REFERENCES public.ingredients(id) ON DELETE CASCADE;

-- cook_log_id, recipe_id를 nullable로 변경
ALTER TABLE public.comments ALTER COLUMN cook_log_id DROP NOT NULL;
ALTER TABLE public.comments ALTER COLUMN recipe_id DROP NOT NULL;

-- 타입별 무결성 CHECK
ALTER TABLE public.comments ADD CONSTRAINT chk_comment_target CHECK (
  (target_type = 'recipe' AND recipe_id IS NOT NULL AND cook_log_id IS NOT NULL) OR
  (target_type = 'ingredient' AND ingredient_id IS NOT NULL)
);

-- 인덱스
CREATE INDEX idx_comments_ingredient_id ON public.comments(ingredient_id) WHERE ingredient_id IS NOT NULL;
CREATE INDEX idx_comments_target_type ON public.comments(target_type);

-- ============================================================
-- 2. RLS 정책 교체 (INSERT만 분리)
-- ============================================================

-- 기존 INSERT 정책 삭제 후 2개로 분리
DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;

-- 레시피 댓글: cook_log 소유 필수 (기존 동작 유지)
CREATE POLICY "comments_insert_recipe" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND target_type = 'recipe'
    AND EXISTS (SELECT 1 FROM public.cook_logs WHERE cook_log_id = comments.cook_log_id AND user_id = auth.uid())
  );

-- 식재료 댓글: 로그인만 하면 가능
CREATE POLICY "comments_insert_ingredient" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND target_type = 'ingredient' AND ingredient_id IS NOT NULL
  );

-- 기존 SELECT/UPDATE/DELETE 정책은 그대로 유지 (target_type 무관하게 동작)

-- ============================================================
-- 3. discussions 테이블 (커뮤니티용, UI 비활성화)
-- ============================================================

CREATE TABLE public.discussions (
  discussion_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title          JSONB NOT NULL,
  body           TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  category       TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'tip', 'question', 'substitute')),
  recipe_id      UUID REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
  ingredient_id  TEXT REFERENCES public.ingredients(id) ON DELETE CASCADE,
  upvote_count   INT NOT NULL DEFAULT 0,
  downvote_count INT NOT NULL DEFAULT 0,
  comment_count  INT NOT NULL DEFAULT 0,
  pinned         BOOLEAN NOT NULL DEFAULT false,
  closed         BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_discussions_user_id ON public.discussions(user_id);
CREATE INDEX idx_discussions_category ON public.discussions(category);
CREATE INDEX idx_discussions_created_at ON public.discussions(created_at DESC);

-- updated_at 트리거
CREATE TRIGGER trg_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discussions_select_all" ON public.discussions
  FOR SELECT USING (true);

CREATE POLICY "discussions_insert_own" ON public.discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "discussions_update_own" ON public.discussions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "discussions_delete_own" ON public.discussions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. reports 테이블 target_type 확장
-- ============================================================

-- 기존 CHECK 제약 삭제 후 재생성 (ingredient_comment 추가)
ALTER TABLE public.reports DROP CONSTRAINT reports_target_type_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_check
  CHECK (target_type IN ('recipe', 'comment', 'user', 'ingredient_comment', 'discussion'));
