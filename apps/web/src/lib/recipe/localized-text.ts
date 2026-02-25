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

/**
 * JSONB 키 순서는 PostgreSQL에서 알파벳순 정렬되므로 신뢰할 수 없음.
 * title 값에 한글(Hangul)이 포함되어 있으면 원본은 한국어로 판별.
 */
export function detectOriginalLocale(title: Record<string, string>): string {
  const keys = Object.keys(title);
  if (keys.length <= 1) return keys[0] ?? "en";

  const koText = title["ko"];
  if (koText && /[\uAC00-\uD7AF]/.test(koText)) {
    return "ko";
  }

  return keys[0];
}
