-- Tag: core
-- Path: /Users/hodduk/Documents/git/mat_dam/supabase/migrations/003_ingredient_search_rpc.sql

-- ============================================================
-- Migration 003: Ingredient Autocomplete Search RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_ingredients(
  search_term  TEXT,
  locale       TEXT DEFAULT 'en',
  result_limit INT  DEFAULT 10
)
RETURNS TABLE (
  id            TEXT,
  names         JSONB,
  category      TEXT,
  common_units  TEXT[],
  default_unit  TEXT,
  dietary_flags TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id,
    i.names,
    i.category,
    i.common_units,
    i.default_unit,
    i.dietary_flags
  FROM public.ingredients i
  WHERE
    length(trim(search_term)) >= 2
    AND (
      (i.names->>'en') ILIKE '%' || trim(search_term) || '%'
      OR
      (i.names->>'ko') ILIKE '%' || trim(search_term) || '%'
    )
  ORDER BY
    (
      CASE
        WHEN lower(i.names->>locale) = lower(trim(search_term))                           THEN 6
        WHEN lower(i.names->>locale) LIKE lower(trim(search_term)) || '%'                THEN 4
        WHEN lower(i.names->>locale) LIKE '%' || lower(trim(search_term)) || '%'         THEN 2
        ELSE 0
      END
      +
      CASE
        WHEN lower(i.names->>'en') = lower(trim(search_term))
          OR lower(i.names->>'ko') = lower(trim(search_term))                             THEN 3
        WHEN lower(i.names->>'en') LIKE lower(trim(search_term)) || '%'
          OR lower(i.names->>'ko') LIKE lower(trim(search_term)) || '%'                  THEN 2
        WHEN lower(i.names->>'en') LIKE '%' || lower(trim(search_term)) || '%'
          OR lower(i.names->>'ko') LIKE '%' || lower(trim(search_term)) || '%'           THEN 1
        ELSE 0
      END
    ) DESC,
    i.names->>locale ASC
  LIMIT result_limit;
$$;

GRANT EXECUTE ON FUNCTION public.search_ingredients(TEXT, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_ingredients(TEXT, TEXT, INT) TO anon;
