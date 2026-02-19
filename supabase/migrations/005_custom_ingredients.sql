-- Tag: core
-- Path: /Users/hodduk/Documents/git/mat_dam/supabase/migrations/005_custom_ingredients.sql

-- ============================================================
-- Migration 005: Allow custom (free-text) ingredients
-- ============================================================

-- Make ingredient_id nullable for custom entries
ALTER TABLE public.recipe_ingredients
  ALTER COLUMN ingredient_id DROP NOT NULL;

-- Add custom_name column for free-text ingredients
ALTER TABLE public.recipe_ingredients
  ADD COLUMN custom_name TEXT;

-- Ensure either ingredient_id or custom_name is provided
ALTER TABLE public.recipe_ingredients
  ADD CONSTRAINT chk_ingredient_or_custom
  CHECK (ingredient_id IS NOT NULL OR custom_name IS NOT NULL);
