-- Tag: core
-- Path: supabase/migrations/006_bookmarks.sql

-- ============================================================
-- Migration 006: Bookmarks 테이블
-- ============================================================

CREATE TABLE public.bookmarks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  recipe_id   UUID        NOT NULL REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

-- 인덱스
CREATE INDEX idx_bookmarks_user_id   ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_recipe_id ON public.bookmarks(recipe_id);

-- RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks_select_own" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_own" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete_own" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);
