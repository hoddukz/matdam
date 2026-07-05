-- Tag: core
-- Path: supabase/migrations/016_fix_legacy_korean_en_keys.sql
--
-- 레거시 데이터 정정: detectLocale 도입(커밋 d9ecac7) 이전에는 recipe-form.tsx가
-- 입력 텍스트가 아닌 "현재 URL/쿠키 locale"을 JSONB 키로 사용했다. 그 결과, 사용자가
-- 영어 UI(locale=en)에서 한국어 텍스트를 입력한 경우 실제로는 한국어인 값이 "en" 키
-- 아래에 저장되었다. 번역 파이프라인(translate-recipe / cron / translate-announcement)은
-- 키의 "존재 여부"만으로 번역 완료를 판단하므로, 이런 행은 영원히 "이미 번역됨"으로
-- 간주되어 다시 번역되지 않는다.
--
-- 이 마이그레이션은 recipes / recipe_steps / recipe_ingredients 의 각 JSONB 컬럼에서
-- "en" 키 값이 "주로 한글"인 경우 다음과 같이 정정한다:
--   - "ko" 키가 이미 있으면: 잘못된 "en" 키만 제거 (한국어 원문은 ko에 이미 존재)
--   - "ko" 키가 없으면: "en"의 값을 "ko"로 이동 (원문 보존 — 필드가 빈 객체가 되는
--     데이터 유실 케이스 없음)
-- 어느 경우든 "en" 키가 사라지므로 cron이 정상적으로 재번역 대상으로 인식한다.
-- 영향을 받은 recipes.translated_locales 의 "en" 스탬프도 함께 제거한다(제목/설명뿐
-- 아니라 스텝/재료 중 하나라도 정정되면 해당 레시피 전체를 재검토 대상으로 삼는다).
--
-- 판별 휴리스틱(보수적):
--   - 값에서 한글(완성형 + 자모)만 남기고 모두 제거한 길이가 >= 2 글자
--   - 그 한글 글자 수가 (공백 제거한) 전체 길이의 30% 초과
--   예) "Kimchi (김치) stew" 같은 정상적인 영어 텍스트는 한글 비중이 낮아 보존된다.
--
-- 사전 점검(선택): 운영 반영 전 어떤 행이 "en → ko 이동" 대상인지 보려면:
--
--   SELECT recipe_id, title FROM public.recipes
--   WHERE title ? 'en' AND NOT title ? 'ko'
--     AND public.mig016_is_predominantly_hangul(title ->> 'en');
--
--   (마이그레이션 실행 전에 헬퍼 함수 정의(아래 1번 섹션)를 먼저 실행해야 한다.)
--
-- 구현 노트: 여러 개의 data-modifying CTE가 "같은 행"을 동시에 수정하려 하면
-- PostgreSQL은 에러 없이 그중 하나의 수정만 반영하고 나머지는 조용히 무시한다.
-- 실제로 title/description을 별도 CTE로 동시에 갱신하면 하나만 반영되는 것을
-- 로컬 테스트로 확인했다. 따라서 이 마이그레이션은 필드별 UPDATE를 순차적인 개별
-- top-level 문장으로 실행하고, 영향받은 recipe_id는 임시 테이블에 모아 마지막에
-- translated_locales 정리에 사용한다.
--
-- 멱등성: 이미 "en" 키가 제거/이동된 행은 `? 'en'` 조건에 걸리지 않으므로 재실행해도
-- 안전하다(no-op).

BEGIN;

-- ============================================================
-- 1. 헬퍼 함수: 값이 "주로 한글"인지 판별
-- ============================================================

CREATE OR REPLACE FUNCTION public.mig016_is_predominantly_hangul(input text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    input IS NOT NULL
    AND (length(input) - length(regexp_replace(input, '[가-힣ㄱ-ㅎㅏ-ㅣ]', '', 'g'))) >= 2
    AND (length(input) - length(regexp_replace(input, '[가-힣ㄱ-ㅎㅏ-ㅣ]', '', 'g')))::numeric
        > 0.3 * GREATEST(length(regexp_replace(input, '\s', '', 'g')), 1)
$$;

-- ============================================================
-- 2. 헬퍼 함수: 정정된 JSONB 계산
--    - ko 키가 있으면 en만 제거
--    - ko 키가 없으면 en 값을 ko로 이동 후 en 제거 (원문 보존)
-- ============================================================

CREATE OR REPLACE FUNCTION public.mig016_relocate_en(value jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN value ? 'ko' THEN value - 'en'
    ELSE jsonb_set(value - 'en', '{ko}', value -> 'en')
  END
$$;

-- ============================================================
-- 3. 영향받은 recipe_id 를 모을 임시 테이블
-- ============================================================

CREATE TEMP TABLE mig016_affected_recipes (recipe_id UUID PRIMARY KEY) ON COMMIT DROP;

-- ------------------------------------------------------------
-- 3-1. recipes.title
-- ------------------------------------------------------------
INSERT INTO mig016_affected_recipes (recipe_id)
SELECT recipe_id FROM public.recipes
WHERE title ? 'en' AND public.mig016_is_predominantly_hangul(title ->> 'en')
ON CONFLICT DO NOTHING;

UPDATE public.recipes
SET title = public.mig016_relocate_en(title)
WHERE title ? 'en' AND public.mig016_is_predominantly_hangul(title ->> 'en');

-- ------------------------------------------------------------
-- 3-2. recipes.description
-- ------------------------------------------------------------
INSERT INTO mig016_affected_recipes (recipe_id)
SELECT recipe_id FROM public.recipes
WHERE description ? 'en' AND public.mig016_is_predominantly_hangul(description ->> 'en')
ON CONFLICT DO NOTHING;

UPDATE public.recipes
SET description = public.mig016_relocate_en(description)
WHERE description ? 'en' AND public.mig016_is_predominantly_hangul(description ->> 'en');

-- ------------------------------------------------------------
-- 3-3. recipe_steps.description
-- ------------------------------------------------------------
INSERT INTO mig016_affected_recipes (recipe_id)
SELECT recipe_id FROM public.recipe_steps
WHERE description ? 'en' AND public.mig016_is_predominantly_hangul(description ->> 'en')
ON CONFLICT DO NOTHING;

UPDATE public.recipe_steps
SET description = public.mig016_relocate_en(description)
WHERE description ? 'en' AND public.mig016_is_predominantly_hangul(description ->> 'en');

-- ------------------------------------------------------------
-- 3-4. recipe_steps.tip
-- ------------------------------------------------------------
INSERT INTO mig016_affected_recipes (recipe_id)
SELECT recipe_id FROM public.recipe_steps
WHERE tip ? 'en' AND public.mig016_is_predominantly_hangul(tip ->> 'en')
ON CONFLICT DO NOTHING;

UPDATE public.recipe_steps
SET tip = public.mig016_relocate_en(tip)
WHERE tip ? 'en' AND public.mig016_is_predominantly_hangul(tip ->> 'en');

-- ------------------------------------------------------------
-- 3-5. recipe_ingredients.custom_name
--      "en"이 유일한 키였던 경우에도 이제 값이 "ko"로 이동하므로 결과가 빈 객체('{}')가
--      되는 경우는 없다 → chk_ingredient_or_custom (ingredient_id IS NULL이면
--      custom_name != '{}') 제약을 위반할 수 없어 별도 가드가 필요 없다.
-- ------------------------------------------------------------
INSERT INTO mig016_affected_recipes (recipe_id)
SELECT recipe_id FROM public.recipe_ingredients
WHERE custom_name ? 'en' AND public.mig016_is_predominantly_hangul(custom_name ->> 'en')
ON CONFLICT DO NOTHING;

UPDATE public.recipe_ingredients
SET custom_name = public.mig016_relocate_en(custom_name)
WHERE custom_name ? 'en' AND public.mig016_is_predominantly_hangul(custom_name ->> 'en');

-- ------------------------------------------------------------
-- 3-6. recipe_ingredients.note
-- ------------------------------------------------------------
INSERT INTO mig016_affected_recipes (recipe_id)
SELECT recipe_id FROM public.recipe_ingredients
WHERE note ? 'en' AND public.mig016_is_predominantly_hangul(note ->> 'en')
ON CONFLICT DO NOTHING;

UPDATE public.recipe_ingredients
SET note = public.mig016_relocate_en(note)
WHERE note ? 'en' AND public.mig016_is_predominantly_hangul(note ->> 'en');

-- ------------------------------------------------------------
-- 3-7. recipe_ingredients.qualifier
-- ------------------------------------------------------------
INSERT INTO mig016_affected_recipes (recipe_id)
SELECT recipe_id FROM public.recipe_ingredients
WHERE qualifier ? 'en' AND public.mig016_is_predominantly_hangul(qualifier ->> 'en')
ON CONFLICT DO NOTHING;

UPDATE public.recipe_ingredients
SET qualifier = public.mig016_relocate_en(qualifier)
WHERE qualifier ? 'en' AND public.mig016_is_predominantly_hangul(qualifier ->> 'en');

-- ============================================================
-- 4. 영향받은 recipe들의 translated_locales->'en' 스탬프 제거 (cron 재번역 유도)
-- ============================================================

UPDATE public.recipes r
SET translated_locales = translated_locales - 'en'
FROM mig016_affected_recipes a
WHERE r.recipe_id = a.recipe_id
  AND r.translated_locales ? 'en';

-- ============================================================
-- 5. 헬퍼 함수 정리 (일회성 마이그레이션 전용 — 스키마에 영구히 남기지 않음)
-- ============================================================

DROP FUNCTION IF EXISTS public.mig016_is_predominantly_hangul(text);
DROP FUNCTION IF EXISTS public.mig016_relocate_en(jsonb);

COMMIT;
