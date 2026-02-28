-- Tag: core
-- Path: supabase/migrations/010_announcements.sql
--
-- 공지사항 시스템 + 유저 role 컬럼
-- announcements: DB 기반 공지 (다국어 JSONB, 마크다운, 국가별 필터)
-- users.role: admin/user 구분

-- ============================================================
-- 1. users.role 컬럼 추가
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));


-- ============================================================
-- 2. announcements 테이블
-- ============================================================

CREATE TABLE public.announcements (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title              JSONB       NOT NULL,
  content            JSONB       NOT NULL,
  summary            JSONB       NOT NULL DEFAULT '{}'::jsonb,
  published          BOOLEAN     NOT NULL DEFAULT true,
  pinned             BOOLEAN     NOT NULL DEFAULT false,
  metadata           JSONB       NOT NULL DEFAULT '{}'::jsonb,
  target_locales     TEXT[]      DEFAULT NULL,
  translated_locales JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 3. 인덱스
-- ============================================================

CREATE INDEX idx_announcements_list
  ON public.announcements (published, pinned DESC, created_at DESC);


-- ============================================================
-- 4. updated_at 트리거 (set_updated_at 재사용)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 5. RLS 정책
-- ============================================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (published = true)
-- locale 필터는 앱 쿼리에서 처리 (RLS에서 세션 locale 접근 불가)
CREATE POLICY announcements_select_published
  ON public.announcements FOR SELECT
  USING (published = true);

-- 관리자 전체 읽기 (비공개 포함)
CREATE POLICY announcements_select_admin
  ON public.announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 관리자 쓰기
CREATE POLICY announcements_insert_admin
  ON public.announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY announcements_update_admin
  ON public.announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY announcements_delete_admin
  ON public.announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- 6. 시드 데이터 — 등급 시스템 공지 (마크다운 형식)
-- ============================================================

INSERT INTO public.announcements (title, content, summary, pinned, metadata)
VALUES (
  '{"ko": "유저 등급 시스템 출시", "en": "User Ranking System Launch"}'::jsonb,
  '{
    "ko": "맛담에 활동 기반 등급 시스템이 도입되었습니다!\n\n레시피를 작성하고, 요리하고, 댓글을 남기며 활동 점수를 쌓아보세요. 점수에 따라 7단계 등급이 부여됩니다.\n\n## 점수 획득 방법\n\n| 활동 | 점수 |\n|------|------|\n| 레시피 공개 | +10점 |\n| 추천 받기 | +2점 |\n| 요리 리뷰 작성 | +3점 |\n| 댓글 작성 | +1점 |\n| 만들어봤어요 | +1점 |\n| 북마크 받기 | +1점 |\n\n앞으로 고등급 유저에게 재료 데이터 편집 등 특별 권한이 부여될 예정입니다.",
    "en": "An activity-based ranking system has been introduced to MatDam!\n\nEarn activity points by creating recipes, cooking, and leaving comments. You will be assigned one of 7 ranks based on your score.\n\n## How to Earn Points\n\n| Activity | Points |\n|----------|--------|\n| Publish a recipe | +10 |\n| Receive an upvote | +2 |\n| Write a cook review | +3 |\n| Leave a comment | +1 |\n| Mark \"I Made This\" | +1 |\n| Receive a bookmark | +1 |\n\nIn the future, higher-ranked users will receive special privileges such as ingredient data editing."
  }'::jsonb,
  '{"ko": "활동 기반 등급 시스템이 도입되었습니다!", "en": "An activity-based ranking system has been introduced!"}'::jsonb,
  false,
  '{"widget": "rank_table"}'::jsonb
);
