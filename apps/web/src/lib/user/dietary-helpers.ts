// Tag: util
// Path: apps/web/src/lib/user/dietary-helpers.ts

import type { DietaryPreference, UserPreferences } from "@matdam/types";

/** 기존 dietary_restrictions → DietaryPreference[] 폴백 변환 */
export function initDietaryPrefs(prefs?: Partial<UserPreferences> | null): DietaryPreference[] {
  if (prefs?.dietary_preferences && prefs.dietary_preferences.length > 0) {
    return prefs.dietary_preferences;
  }
  if (prefs?.dietary_restrictions && prefs.dietary_restrictions.length > 0) {
    return prefs.dietary_restrictions.map((tag) => ({ tag, mode: "hard" as const }));
  }
  return [];
}
