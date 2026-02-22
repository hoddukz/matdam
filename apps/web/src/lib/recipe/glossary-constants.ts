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

/** cuisine 값 → i18n 키 매핑 */
export const CUISINE_LABEL_KEYS: Record<string, string> = {
  korean: "cuisineKorean",
  japanese: "cuisineJapanese",
  chinese: "cuisineChinese",
  thai: "cuisineThai",
  western: "cuisineWestern",
};

/** importance 값 → i18n 키 매핑 */
export const IMPORTANCE_LABEL_KEYS: Record<string, string> = {
  must_have: "importanceMustHave",
  recommended: "importanceRecommended",
  advanced: "importanceAdvanced",
};

/** importance 정렬 순서 */
export const IMPORTANCE_ORDER: Record<string, number> = {
  must_have: 0,
  recommended: 1,
  advanced: 2,
};

/** 식이 플래그 → 표시 텍스트 */
export const DIETARY_FLAG_LABELS: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  gluten_free: "Gluten-Free",
  dairy_free: "Dairy-Free",
  nut_free: "Nut-Free",
};
