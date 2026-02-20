// Tag: core
// Path: apps/web/src/components/recipe/step-types.ts

export interface StepEntry {
  // _id is a client-only stable key for React reconciliation; not sent to DB
  _id: string;
  description: string;
  timer_seconds: number | null;
  image_url: string | null;
  tip: string | null;
  ingredient_indices: number[];
}

export function makeStep(
  partial: Omit<StepEntry, "_id"> = {
    description: "",
    timer_seconds: null,
    image_url: null,
    tip: null,
    ingredient_indices: [],
  }
): StepEntry {
  return { _id: Math.random().toString(36).slice(2), ...partial };
}
