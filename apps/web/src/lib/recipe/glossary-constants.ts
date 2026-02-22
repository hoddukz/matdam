// Tag: util
// Path: apps/web/src/lib/recipe/glossary-constants.ts

/** DB category 값 → i18n 키 매핑 */
export const CATEGORY_LABEL_KEYS: Record<string, string> = {
  sauce_paste: "filterSaucePaste",
  seasoning: "filterSeasoning",
  vegetable: "filterVegetable",
  protein: "filterProtein",
  grain_noodle: "filterGrainNoodle",
  dairy_egg: "filterDairyEgg",
  other: "filterOther",
};

/** 식이 플래그 → 표시 텍스트 */
export const DIETARY_FLAG_LABELS: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  gluten_free: "Gluten-Free",
  dairy_free: "Dairy-Free",
  nut_free: "Nut-Free",
};
