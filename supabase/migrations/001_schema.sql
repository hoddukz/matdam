-- Tag: core
-- Path: supabase/migrations_merged/001_schema.sql

-- ============================================================
-- MatDam — Consolidated Schema Migration
-- Merged from originals: 001, 005, 007, 010, 012, 014, 016, 017
--
-- Consolidation notes:
--   • recipe_steps.description/tip: created as JSONB (014 folded in)
--   • recipe_ingredients.ingredient_id: nullable (005 folded in)
--   • recipe_ingredients.custom_name/qualifier/note: JSONB (014+016 folded in)
--   • recipe_ingredients constraint: final version from 016 folded in
--   • recipes: taste_profile/upvote_count/downvote_count from 010 folded in
--   • recipes: translated_locales from 017 folded in
--   • ingredients: cuisines/importance from 007 folded in
--   • comments: parent_comment_id from 012 folded in
-- ============================================================


-- ============================================================
-- 1. HELPER: updated_at 자동 갱신 트리거 함수
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


-- ============================================================
-- 2. TABLES
-- ============================================================

-- ----------------------------------------------------------
-- 2-1. users (Supabase Auth 프로필 확장)
-- ----------------------------------------------------------
CREATE TABLE public.users (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT        NOT NULL,
  avatar_url    TEXT,
  country       TEXT,
  tier          TEXT        NOT NULL DEFAULT 'beginner'
                            CHECK (tier IN ('beginner', 'intermediate', 'master')),
  trust_score   INTEGER     NOT NULL DEFAULT 0,
  preferences   JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ----------------------------------------------------------
-- 2-2. ingredients (재료 마스터)
-- Includes cuisines/importance columns folded in from 007
-- ----------------------------------------------------------
CREATE TABLE public.ingredients (
  id             TEXT        PRIMARY KEY,
  names          JSONB       NOT NULL,
  category       TEXT        NOT NULL,
  common_units   TEXT[]      NOT NULL,
  default_unit   TEXT        NOT NULL,
  is_commodity   BOOLEAN     NOT NULL DEFAULT false,
  dietary_flags  TEXT[]      NOT NULL DEFAULT '{}',
  substitutes    TEXT[]      NOT NULL DEFAULT '{}',
  description    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  image_url      TEXT,
  cuisines       TEXT[]      NOT NULL DEFAULT '{}',
  importance     TEXT        NOT NULL DEFAULT 'recommended'
                             CHECK (importance IN ('must_have', 'recommended', 'advanced')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ingredients_cuisines
  ON public.ingredients USING GIN (cuisines);


-- ----------------------------------------------------------
-- 2-3. units (단위)
-- ----------------------------------------------------------
CREATE TABLE public.units (
  unit_id        TEXT        PRIMARY KEY,
  names          JSONB       NOT NULL,
  ml_equivalent  NUMERIC,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------
-- 2-4. recipes
-- Includes taste_profile/upvote_count/downvote_count from 010
-- and translated_locales from 017, all folded in
-- ----------------------------------------------------------
CREATE TABLE public.recipes (
  recipe_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT        UNIQUE NOT NULL,
  title              JSONB       NOT NULL,
  author_id          UUID        NOT NULL REFERENCES public.users(user_id),
  parent_recipe_id   UUID        REFERENCES public.recipes(recipe_id),
  root_recipe_id     UUID        REFERENCES public.recipes(recipe_id),
  version_number     INTEGER     NOT NULL DEFAULT 1,
  description        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  difficulty_level   TEXT        NOT NULL DEFAULT 'beginner'
                                 CHECK (difficulty_level IN ('beginner', 'intermediate', 'master')),
  dietary_tags       TEXT[]      NOT NULL DEFAULT '{}',
  prep_time_minutes  INTEGER,
  cook_time_minutes  INTEGER,
  servings           INTEGER     NOT NULL DEFAULT 2,
  hero_image_url     TEXT,
  inspired_by        TEXT,
  is_approved_remix  BOOLEAN     NOT NULL DEFAULT false,
  master_choice      BOOLEAN     NOT NULL DEFAULT false,
  published          BOOLEAN     NOT NULL DEFAULT false,
  published_version  INTEGER,
  taste_profile      JSONB       DEFAULT NULL,
  upvote_count       INT         NOT NULL DEFAULT 0,
  downvote_count     INT         NOT NULL DEFAULT 0,
  translated_locales JSONB       NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ----------------------------------------------------------
-- 2-5. recipe_steps
-- description/tip created as JSONB (014 folded in — no ALTER needed)
-- ----------------------------------------------------------
CREATE TABLE public.recipe_steps (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id     UUID        NOT NULL REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
  step_order    INTEGER     NOT NULL,
  title         TEXT,
  description   JSONB       NOT NULL,
  timer_seconds INTEGER,
  image_url     TEXT,
  tip           JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recipe_id, step_order)
);


-- ----------------------------------------------------------
-- 2-6. recipe_ingredients
-- ingredient_id nullable (005 folded in)
-- custom_name/qualifier/note as JSONB (014+016 folded in)
-- Constraint: final version from 016 folded in
-- ----------------------------------------------------------
CREATE TABLE public.recipe_ingredients (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id      UUID        NOT NULL REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
  ingredient_id  TEXT        REFERENCES public.ingredients(id),
  amount         NUMERIC,
  unit           TEXT        REFERENCES public.units(unit_id),
  qualifier      JSONB,
  note           JSONB,
  custom_name    JSONB,
  step_number    INTEGER,
  display_order  INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ingredient_or_custom
    CHECK (ingredient_id IS NOT NULL OR (custom_name IS NOT NULL AND custom_name != '{}'::jsonb))
);


-- ============================================================
-- 3. INDEXES (basic — additional composite indexes in 007_indexes.sql)
-- ============================================================

CREATE INDEX idx_recipes_slug          ON public.recipes(slug);
CREATE INDEX idx_recipes_author_id     ON public.recipes(author_id);
CREATE INDEX idx_recipes_published     ON public.recipes(published) WHERE published = true;
CREATE INDEX idx_ri_recipe_id          ON public.recipe_ingredients(recipe_id);
CREATE INDEX idx_ri_ingredient_id      ON public.recipe_ingredients(ingredient_id);
CREATE INDEX idx_steps_recipe_id       ON public.recipe_steps(recipe_id);


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- 4-1. users
CREATE POLICY "users_select_public"   ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_own"      ON public.users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own"      ON public.users FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own"      ON public.users FOR DELETE USING (auth.uid() = user_id);

-- 4-2. ingredients (공개 읽기, 인증된 유저만 삽입)
CREATE POLICY "ingredients_select_public"        ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "ingredients_insert_authenticated" ON public.ingredients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4-3. units (공개 읽기, 인증된 유저만 삽입)
CREATE POLICY "units_select_public"        ON public.units FOR SELECT USING (true);
CREATE POLICY "units_insert_authenticated" ON public.units FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4-4. recipes
CREATE POLICY "recipes_select_public"        ON public.recipes FOR SELECT USING (true);
CREATE POLICY "recipes_insert_authenticated" ON public.recipes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "recipes_update_author"        ON public.recipes FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "recipes_delete_author"        ON public.recipes FOR DELETE USING (auth.uid() = author_id);

-- 4-5. recipe_steps (공개 읽기, 레시피 작성자만 수정/삭제)
CREATE POLICY "recipe_steps_select_public"        ON public.recipe_steps FOR SELECT USING (true);
CREATE POLICY "recipe_steps_insert_authenticated" ON public.recipe_steps FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "recipe_steps_update_recipe_author" ON public.recipe_steps FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.recipe_id = recipe_steps.recipe_id AND r.author_id = auth.uid()));
CREATE POLICY "recipe_steps_delete_recipe_author" ON public.recipe_steps FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.recipe_id = recipe_steps.recipe_id AND r.author_id = auth.uid()));

-- 4-6. recipe_ingredients (공개 읽기, 레시피 작성자만 수정/삭제)
CREATE POLICY "recipe_ingredients_select_public"        ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "recipe_ingredients_insert_authenticated" ON public.recipe_ingredients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "recipe_ingredients_update_recipe_author" ON public.recipe_ingredients FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.recipe_id = recipe_ingredients.recipe_id AND r.author_id = auth.uid()));
CREATE POLICY "recipe_ingredients_delete_recipe_author" ON public.recipe_ingredients FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.recipe_id = recipe_ingredients.recipe_id AND r.author_id = auth.uid()));


-- ============================================================
-- 5. TRIGGER: 신규 가입 시 users 프로필 자동 생성
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
