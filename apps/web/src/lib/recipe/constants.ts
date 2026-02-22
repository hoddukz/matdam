// Tag: util
// Path: apps/web/src/lib/recipe/constants.ts

export const DIFFICULTY_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  beginner: "secondary",
  intermediate: "default",
  master: "destructive",
};

export const DIFFICULTY_LABEL_KEYS: Record<string, string> = {
  beginner: "filterBeginner",
  intermediate: "filterIntermediate",
  master: "filterMaster",
};
