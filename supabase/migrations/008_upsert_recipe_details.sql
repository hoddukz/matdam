-- Tag: core
-- Path: /Users/hodduk/Documents/git/mat_dam/supabase/migrations/008_upsert_recipe_details.sql

-- ============================================================
-- Migration 008: Atomic upsert for recipe steps & ingredients
-- DELETE→INSERT를 단일 트랜잭션으로 처리하여 중간 실패 시 데이터 유실 방지
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

  -- 2. 새 steps 삽입
  INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, image_url, tip)
  SELECT
    p_recipe_id,
    (s->>'step_order')::int,
    s->>'description',
    (s->>'timer_seconds')::int,
    s->>'image_url',
    s->>'tip'
  FROM jsonb_array_elements(p_steps) AS s;

  -- 3. 새 ingredients 삽입
  INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
  SELECT
    p_recipe_id,
    NULLIF(i->>'ingredient_id', ''),
    i->>'custom_name',
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
