-- Tag: core
-- Path: supabase/migrations/014_multilingual_steps_ingredients.sql

-- ============================================================
-- Migration 014: TEXT → JSONB for multilingual recipe content
-- recipe_steps.description, recipe_steps.tip, recipe_ingredients.custom_name
-- 기존 데이터는 전부 한국어 → jsonb_build_object('ko', ...) 으로 변환
-- ============================================================

-- 1-1. 컬럼 타입 변환

-- recipe_steps.description: TEXT NOT NULL → JSONB NOT NULL
ALTER TABLE public.recipe_steps
  ALTER COLUMN description TYPE JSONB
  USING jsonb_build_object('ko', description);

-- recipe_steps.tip: TEXT (nullable) → JSONB (nullable)
ALTER TABLE public.recipe_steps
  ALTER COLUMN tip TYPE JSONB
  USING CASE WHEN tip IS NOT NULL THEN jsonb_build_object('ko', tip) ELSE NULL END;

-- recipe_ingredients.custom_name: TEXT (nullable) → JSONB (nullable)
ALTER TABLE public.recipe_ingredients
  ALTER COLUMN custom_name TYPE JSONB
  USING CASE WHEN custom_name IS NOT NULL THEN jsonb_build_object('ko', custom_name) ELSE NULL END;

-- 1-2. 제약조건 갱신
ALTER TABLE public.recipe_ingredients DROP CONSTRAINT IF EXISTS chk_ingredient_or_custom;
ALTER TABLE public.recipe_ingredients
  ADD CONSTRAINT chk_ingredient_or_custom
  CHECK (ingredient_id IS NOT NULL OR (custom_name IS NOT NULL AND custom_name != '{}'::jsonb));

-- 1-3. RPC 업데이트: description/tip → JSONB 추출, custom_name → JSONB 추출
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

  -- 3. 새 ingredients 삽입 (custom_name → JSONB 추출)
  INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
  SELECT
    p_recipe_id,
    NULLIF(i->>'ingredient_id', ''),
    NULLIF(i->'custom_name', 'null'::jsonb),
    (i->>'amount')::numeric,
    i->>'unit',
    i->>'qualifier',
    i->>'note',
    (i->>'step_number')::int,
    (i->>'display_order')::int
  FROM jsonb_array_elements(p_ingredients) AS i;

  -- 함수 전체가 단일 트랜잭션 → 중간 실패 시 자동 ROLLBACK
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_recipe_details(UUID, JSONB, JSONB) TO authenticated;
