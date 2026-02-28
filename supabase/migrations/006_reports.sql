-- Tag: core
-- Path: supabase/migrations_merged/006_reports.sql

-- ============================================================
-- MatDam — Reports Table + Auto-unpublish Trigger
-- Merged from original: 015 (unchanged)
-- ============================================================

-- report_reason 열거형
CREATE TYPE public.report_reason AS ENUM ('inappropriate','spam','copyright','other');

-- reports 테이블
CREATE TABLE public.reports (
  id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID            NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  target_type  TEXT            NOT NULL CHECK (target_type IN ('recipe', 'comment', 'user')),
  target_id    UUID            NOT NULL,
  reason       report_reason   NOT NULL,
  description  TEXT            CHECK (description IS NULL OR char_length(description) <= 1000),
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id)
);

-- 인덱스
CREATE INDEX idx_reports_target ON public.reports(target_type, target_id);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 자동 비공개 트리거 함수: 3명 이상 신고 시 published = false
CREATE OR REPLACE FUNCTION public.check_report_threshold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report_count INT;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM public.reports
  WHERE target_type = NEW.target_type
    AND target_id = NEW.target_id;

  IF report_count = 3 THEN
    IF NEW.target_type = 'recipe' THEN
      UPDATE public.recipes SET published = false WHERE recipe_id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      DELETE FROM public.comments WHERE comment_id = NEW.target_id;
    ELSIF NEW.target_type = 'user' THEN
      UPDATE public.users SET trust_score = -1 WHERE user_id = NEW.target_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_report_threshold
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.check_report_threshold();
