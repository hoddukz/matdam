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
 * JSONB 필드가 string으로 반환된 경우 안전하게 locale 객체로 변환.
 * spread 연산 전에 반드시 호출 — string을 spread하면 character-indexed 키가 생성됨.
 */
export function ensureLocaleObject(
  value: Record<string, string> | string | null | undefined,
  fallbackLocale = "ko"
): Record<string, string> {
  if (!value) return {};
  if (typeof value === "string") return { [fallbackLocale]: value };
  return value;
}

/**
 * 입력 텍스트의 언어를 감지하여 저장할 locale 키를 결정.
 * 한글이 포함되면 "ko", 일본어(히라가나/가타카나)면 "ja", 한자만이면 "zh", 그 외 "en".
 */
export function detectLocale(text: string): "ko" | "en" | "ja" | "zh" {
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text)) return "ko";
  if (/[ぁ-んァ-ヶ]/.test(text)) return "ja";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  return "en";
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

  const priorityList = ["ko", "en"];
  for (const locale of priorityList) {
    if (keys.includes(locale)) return locale;
  }
  return keys[0];
}
