// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/packages/types/src/recipe.ts

import type { RecipeIngredient } from "./ingredient";

export type DifficultyLevel = "beginner" | "intermediate" | "master";

export interface RecipeStep {
  order: number;
  description: string;
  ingredients_used: string[]; // ingredient IDs used in this step
  timer_seconds: number | null;
  image_url: string | null;
  tip?: string | null;
}

export interface Recipe {
  recipe_id: string;
  title: Record<string, string>; // { en: "Tteokbokki", ko: "떡볶이" }
  author_id: string;
  parent_recipe_id: string | null; // direct parent remix
  parent_version_number: number | null;
  root_recipe_id: string | null; // tree root
  version_number: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  dietary_tags: string[];
  difficulty_level: DifficultyLevel;
  inspired_by: string | null; // external reference
  is_approved_remix: boolean;
  master_choice: boolean;
  created_at: string;
  updated_at: string;
}
