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

/** cuisine 값 → i18n 키 매핑 (전체) */
export const CUISINE_LABEL_KEYS: Record<string, string> = {
  korean: "cuisineKorean",
  japanese: "cuisineJapanese",
  chinese: "cuisineChinese",
  thai: "cuisineThai",
  western: "cuisineWestern",
  southeast_asian: "cuisineSoutheastAsian",
  indian: "cuisineIndian",
  mexican: "cuisineMexican",
};

/** 시드데이터가 존재하는 활성 문화권만 (필터 UI용) */
export const ACTIVE_CUISINES = ["korean", "japanese", "western"] as const;

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

/** 식이 플래그 → i18n 키 매핑 */
export const DIETARY_FLAG_LABEL_KEYS: Record<string, string> = {
  vegan: "dietaryVegan",
  vegetarian: "dietaryVegetarian",
  gluten_free: "dietaryGlutenFree",
  dairy_free: "dietaryDairyFree",
  nut_free: "dietaryNutFree",
};
