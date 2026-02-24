// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/packages/types/src/user.ts

export type DietType = "omnivore" | "vegetarian" | "vegan" | "pescatarian";

export type ProteinPreference = "beef" | "pork" | "chicken" | "seafood" | "tofu_legumes";

export type DietaryRestriction =
  | "gluten_free"
  | "dairy_free"
  | "nut_free"
  | "halal"
  | "egg_free"
  | "shellfish_free";

export type CuisinePreference =
  | "korean"
  | "japanese"
  | "chinese"
  | "thai"
  | "western"
  | "southeast_asian"
  | "indian"
  | "mexican";

export type TasteKey = "sweet" | "salty" | "spicy" | "sour" | "umami";

export interface TastePreferences {
  sweet: number; // 1~5
  salty: number;
  spicy: number;
  sour: number;
  umami: number;
}

export interface UserPreferences {
  onboarding_complete?: boolean;
  skill_level?: import("./recipe").DifficultyLevel;
  cuisines?: CuisinePreference[];
  diet_type?: DietType;
  protein_preferences?: ProteinPreference[];
  dietary_restrictions?: DietaryRestriction[];
  taste_preferences?: TastePreferences;
  preferred_unit?: "metric" | "imperial";
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  country: string | null;
  tier: import("./recipe").DifficultyLevel;
  trust_score: number;
  preferences: UserPreferences;
  created_at: string;
}
