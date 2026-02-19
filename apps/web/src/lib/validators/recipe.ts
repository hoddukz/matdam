// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/lib/validators/recipe.ts

import { z } from "zod";

export const ingredientEntrySchema = z.object({
  ingredient_id: z.string(),
  name: z.string(),
  amount: z.number().nullable(),
  unit: z.string().nullable(),
  qualifier: z.string().nullable(),
  note: z.string().nullable(),
});

export const stepEntrySchema = z.object({
  description: z.string().min(1),
  timer_seconds: z.number().nullable(),
  image_url: z.string().nullable(),
  tip: z.string().nullable(),
});

export const recipeFormSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  difficulty_level: z.enum(["beginner", "intermediate", "master"]),
  servings: z.number().min(1).max(50),
  prep_time_minutes: z.number().min(0).optional(),
  cook_time_minutes: z.number().min(0).optional(),
  ingredients: z.array(ingredientEntrySchema),
  steps: z.array(stepEntrySchema).min(1),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
export type IngredientEntrySchema = z.infer<typeof ingredientEntrySchema>;
export type StepEntrySchema = z.infer<typeof stepEntrySchema>;
