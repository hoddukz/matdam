// Tag: util
// Path: apps/web/src/lib/recipe/translation-types.ts

export type TranslationItem = {
  table: "recipe_steps" | "recipe_ingredients" | "recipes";
  rowId: string;
  field: "description" | "tip" | "custom_name" | "title" | "note" | "qualifier";
  sourceLocale: string;
  targetLocale: string;
  sourceText: string;
  existing: Record<string, string>;
};
