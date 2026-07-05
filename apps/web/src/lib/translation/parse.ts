// Tag: core
// Path: apps/web/src/lib/translation/parse.ts

/**
 * AI 번역 응답 파싱 + 길이 검증 + 배치 청크 분할 유틸리티.
 * translate-recipe / cron/translate-missing / translate-announcement 세 라우트가 공유한다.
 */

export interface ParsedTranslationItem {
  /** 0-based index into the chunk array this response corresponds to */
  idx: number;
  text: string;
}

/**
 * "[1] 텍스트\n[2] 텍스트..." 형식의 응답을 파싱.
 * 멀티라인 번역(마크다운 등)도 다음 `[N]` 마커 직전까지 전부 캡처한다.
 *
 * `stopReason === "max_tokens"` 인 경우 마지막 항목은 잘렸을 가능성이 높으므로 폐기한다
 * (부분 번역이 그대로 저장되는 것을 방지).
 *
 * 주의: `[N]` 마커는 줄 시작(`^`, multiline)에서만 인식한다. 번역 본문 안에 우연히
 * 줄 시작이 `[5] ...` 형태인 텍스트가 있으면 마커로 오인될 수 있는 이론적 한계가 있다
 * (레시피/공지 텍스트에서는 실무상 발생 가능성이 극히 낮음).
 */
export function parseNumberedResponse(
  responseText: string,
  stopReason?: string | null
): ParsedTranslationItem[] {
  // 캡처 그룹이 있는 정규식으로 split 하면 구분자(번호)도 결과 배열에 포함된다.
  // 예: ["preamble", "1", "text1", "2", "text2\nmore", ...]
  const parts = responseText.split(/^\[(\d+)\]\s*/m);

  const results: ParsedTranslationItem[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const num = parseInt(parts[i], 10);
    const text = (parts[i + 1] ?? "").trim();
    if (Number.isNaN(num) || num < 1) continue;
    results.push({ idx: num - 1, text });
  }

  if (stopReason === "max_tokens" && results.length > 0) {
    // 마지막 항목은 응답이 잘려 불완전할 가능성이 높으므로 폐기한다.
    results.pop();
  }

  return results;
}

/**
 * S3 가드: 비정상적으로 긴 번역 결과를 스킵한다.
 * 짧은 원문(예: "파" 1글자 → "green onion" 11글자)도 통과하도록 최소 임계값(40)을 둔다.
 */
export function isTranslationLengthValid(sourceText: string, translatedText: string): boolean {
  const maxAllowed = Math.max(sourceText.length * 5, 40);
  return translatedText.length <= maxAllowed;
}

/**
 * 소스 텍스트 총 글자 수가 예산(budgetChars)을 넘지 않도록 아이템 배열을 청크로 분할한다.
 * 하나의 청크가 너무 크면 응답이 max_tokens(4096)를 초과해 잘릴 수 있으므로,
 * 호출당 입력 크기를 제한해 출력이 안전하게 max_tokens 이내로 유지되도록 한다.
 */
export function chunkBySourceLength<T extends { sourceText: string }>(
  items: T[],
  budgetChars = 3000
): T[][] {
  const chunks: T[][] = [];
  let current: T[] = [];
  let currentLen = 0;

  for (const item of items) {
    const len = item.sourceText.length;
    if (current.length > 0 && currentLen + len > budgetChars) {
      chunks.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(item);
    currentLen += len;
  }
  if (current.length > 0) chunks.push(current);

  return chunks;
}
