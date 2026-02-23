// Tag: util
// Path: apps/web/src/lib/user/preference-constants.ts

import type {
  DifficultyLevel,
  CuisinePreference,
  DietType,
  DietaryRestriction,
  ProteinPreference,
  TasteKey,
  TastePreferences,
} from "@matdam/types";

export const SKILL_LEVELS: DifficultyLevel[] = ["beginner", "intermediate", "master"];

export const CUISINES: CuisinePreference[] = [
  "korean",
  "japanese",
  "chinese",
  "thai",
  "western",
  "southeast_asian",
  "indian",
  "mexican",
];

export const DIET_TYPES: DietType[] = ["omnivore", "vegetarian", "vegan", "pescatarian"];

export const PROTEINS: ProteinPreference[] = ["beef", "pork", "chicken", "seafood", "tofu_legumes"];

export const RESTRICTIONS: DietaryRestriction[] = [
  "gluten_free",
  "dairy_free",
  "nut_free",
  "halal",
  "egg_free",
  "shellfish_free",
];

export const TASTE_KEYS: TasteKey[] = ["sweet", "salty", "spicy", "sour", "umami"];

export const DEFAULT_TASTES: TastePreferences = {
  sweet: 3,
  salty: 3,
  spicy: 3,
  sour: 3,
  umami: 3,
};

export const CUISINE_EMOJI_MAP: Record<CuisinePreference, string> = {
  korean: "\u{1F1F0}\u{1F1F7}",
  japanese: "\u{1F1EF}\u{1F1F5}",
  chinese: "\u{1F1E8}\u{1F1F3}",
  thai: "\u{1F1F9}\u{1F1ED}",
  western: "\u{1F35D}",
  southeast_asian: "\u{1F30F}",
  indian: "\u{1F1EE}\u{1F1F3}",
  mexican: "\u{1F1F2}\u{1F1FD}",
};

export const CUISINE_I18N_MAP: Record<CuisinePreference, string> = {
  korean: "cuisineKorean",
  japanese: "cuisineJapanese",
  chinese: "cuisineChinese",
  thai: "cuisineThai",
  western: "cuisineWestern",
  southeast_asian: "cuisineSoutheastAsian",
  indian: "cuisineIndian",
  mexican: "cuisineMexican",
};

export const DIET_I18N_MAP: Record<DietType, string> = {
  omnivore: "dietOmnivore",
  vegetarian: "dietVegetarian",
  vegan: "dietVegan",
  pescatarian: "dietPescatarian",
};

export const PROTEIN_I18N_MAP: Record<ProteinPreference, string> = {
  beef: "proteinBeef",
  pork: "proteinPork",
  chicken: "proteinChicken",
  seafood: "proteinSeafood",
  tofu_legumes: "proteinTofuLegumes",
};

export const RESTRICTION_I18N_MAP: Record<DietaryRestriction, string> = {
  gluten_free: "restrictionGlutenFree",
  dairy_free: "restrictionDairyFree",
  nut_free: "restrictionNutFree",
  halal: "restrictionHalal",
  egg_free: "restrictionEggFree",
  shellfish_free: "restrictionShellfishFree",
};

export const TASTE_I18N_MAP: Record<TasteKey, { label: string; low: string; high: string }> = {
  sweet: {
    label: "tasteSweet",
    low: "tasteSweetLow",
    high: "tasteSweetHigh",
  },
  salty: {
    label: "tasteSalty",
    low: "tasteSaltyLow",
    high: "tasteSaltyHigh",
  },
  spicy: {
    label: "tasteSpicy",
    low: "tasteSpicyLow",
    high: "tasteSpicyHigh",
  },
  sour: { label: "tasteSour", low: "tasteSourLow", high: "tasteSourHigh" },
  umami: {
    label: "tasteUmami",
    low: "tasteUmamiLow",
    high: "tasteUmamiHigh",
  },
};

export const SKILL_I18N_MAP: Record<DifficultyLevel, { label: string; desc: string }> = {
  beginner: { label: "skillBeginner", desc: "skillBeginnerDesc" },
  intermediate: {
    label: "skillIntermediate",
    desc: "skillIntermediateDesc",
  },
  master: { label: "skillMaster", desc: "skillMasterDesc" },
};

/** Settings 페이지용 (desc 없는 버전) */
export const SKILL_LABEL_I18N_MAP: Record<DifficultyLevel, string> = {
  beginner: "skillBeginner",
  intermediate: "skillIntermediate",
  master: "skillMaster",
};

export const SELECTED_STYLE = "ring-2 ring-matdam-gold bg-matdam-gold/10 border-matdam-gold";

export function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}
