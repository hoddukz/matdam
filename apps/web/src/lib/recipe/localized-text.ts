// Tag: util
// Path: apps/web/src/lib/recipe/localized-text.ts

/**
 * JSONB { locale: text } 에서 현재 로케일 → en → 첫 번째 값 순서로 폴백
 */
export function getLocalizedText(
  text: Record<string, string> | null | undefined,
  locale: string,
  fallback = ""
): string {
  if (!text) return fallback;
  return text[locale] || text["en"] || Object.values(text)[0] || fallback;
}
