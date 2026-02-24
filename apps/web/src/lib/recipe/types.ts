// Tag: util
// Path: apps/web/src/lib/recipe/types.ts

export type RecipeCardData = {
  recipe_id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string> | null;
  hero_image_url: string | null;
  difficulty_level: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
  parent_recipe_id: string | null;
  upvote_count: number;
  users: { display_name: string | null; avatar_url: string | null };
  dietary_tags: string[] | null;
};
