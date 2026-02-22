-- Tag: core
-- Path: supabase/migrations/007_cuisine_pantry.sql

-- ============================================================
-- Migration 007: Cuisine Pantry
-- cuisines / importance 컬럼 추가 + 기존 30개 재료 시드 업데이트
-- ============================================================

-- 1. 컬럼 추가
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS cuisines TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS importance TEXT NOT NULL DEFAULT 'recommended'
    CHECK (importance IN ('must_have', 'recommended', 'advanced'));

-- 2. GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_ingredients_cuisines
  ON public.ingredients USING GIN (cuisines);

-- 3. 시드 데이터 업데이트 (한식 — must_have 10개)
UPDATE public.ingredients
SET cuisines = ARRAY['korean'], importance = 'must_have'
WHERE id IN (
  'gochujang', 'doenjang', 'ganjang', 'sesame_oil', 'gochugaru',
  'garlic', 'ginger', 'green_onion', 'short_grain_rice', 'salt'
);

-- 4. 시드 데이터 업데이트 (한식 — recommended 10개)
UPDATE public.ingredients
SET cuisines = ARRAY['korean'], importance = 'recommended'
WHERE id IN (
  'fish_sauce', 'sugar', 'tofu', 'napa_cabbage', 'korean_radish',
  'onion', 'egg', 'sesame_seeds', 'bean_sprouts', 'pork_belly'
);

-- 5. 시드 데이터 업데이트 (한식 — advanced 10개)
UPDATE public.ingredients
SET cuisines = ARRAY['korean'], importance = 'advanced'
WHERE id IN (
  'mozzarella', 'sweet_potato_noodle', 'rice_cake', 'ramyeon_noodle',
  'zucchini', 'spinach', 'carrot', 'beef_brisket', 'chicken_thigh', 'dried_anchovy'
);
