// Tag: util
// Path: apps/web/src/lib/recipe/transforms.ts

import { makeStep, type StepEntry } from "@/components/recipe/step-types";
import type { IngredientEntry } from "@/components/recipe/ingredient-input";
import { getLocalizedText } from "./localized-text";

interface DBStep {
  step_order: number;
  description: string;
  timer_seconds: number | null;
  image_url: string | null;
  tip: string | null;
}

interface DBIngredient {
  ingredient_id: string | null;
  custom_name: string | null;
  amount: number | null;
  unit: string | null;
  qualifier: string | null;
  note: string | null;
  step_number: number | null;
  display_order: number;
  ingredients: { id: string; names: Record<string, string> } | null;
}

export function dbStepsToForm(steps: DBStep[], ingredients: DBIngredient[]): StepEntry[] {
  return steps.map((s) => {
    const indices: number[] = [];
    ingredients.forEach((ing, idx) => {
      if (ing.step_number === s.step_order) {
        indices.push(idx);
      }
    });
    return makeStep({
      description: s.description,
      timer_seconds: s.timer_seconds,
      image_url: s.image_url,
      tip: s.tip,
      ingredient_indices: indices,
    });
  });
}

export function dbIngredientsToForm(
  ingredients: DBIngredient[],
  locale: string
): IngredientEntry[] {
  return ingredients.map((ri) => ({
    ingredient_id: ri.ingredient_id,
    name: ri.ingredients ? getLocalizedText(ri.ingredients.names, locale) : ri.custom_name || "",
    amount: ri.amount,
    unit: ri.unit,
    qualifier: ri.qualifier,
    note: ri.note,
  }));
}
