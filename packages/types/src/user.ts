// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/packages/types/src/user.ts

export type UserTier = "beginner" | "intermediate" | "master";

export interface UserPreferences {
  dietary: string[]; // ["vegan", "halal", "gluten_free", ...]
  skill_level: DifficultyLevel;
  preferred_unit: "metric" | "imperial";
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  country: string | null;
  tier: UserTier;
  trust_score: number;
  preferences: UserPreferences;
  created_at: string;
}

type DifficultyLevel = "beginner" | "intermediate" | "master";
