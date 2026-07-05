// Tag: core
// Path: apps/web/src/lib/translation/translate-pair.ts

import Anthropic from "@anthropic-ai/sdk";
import { chunkBySourceLength, isTranslationLengthValid, parseNumberedResponse } from "./parse";

const LOCALE_NAMES: Record<string, string> = { ko: "Korean", en: "English" };

export function getLocaleName(locale: string): string {
  return LOCALE_NAMES[locale] ?? locale;
}

export interface TranslatePairResult<T> {
  /** 성공적으로 번역된 항목 (원본 item 참조 → 번역문) */
  translations: Map<T, string>;
  /** 이 그룹을 처리하기 위해 시도한 Anthropic 호출(청크) 총 수 */
  totalChunks: number;
  /** 에러/빈 응답으로 실패한 청크 수 */
  failedChunks: number;
}

/**
 * 하나의 (sourceLocale → targetLocale) 그룹을 번역한다.
 * - 큰 배치는 chunkBySourceLength 로 분할해 max_tokens 잘림을 방지한다.
 * - 각 청크 호출 실패는 context(recipeId 등)와 함께 console.error 로 로깅 후 다음 청크로 계속 진행한다.
 * - stop_reason === "max_tokens" 인 경우 마지막 파싱 항목을 폐기하고 경고 로그를 남긴다.
 * - 5x 길이 가드(최소 40) 를 적용한다.
 */
export async function translatePair<T extends { sourceText: string }>(
  anthropic: Anthropic,
  items: T[],
  sourceLocale: string,
  targetLocale: string,
  buildPrompt: (numberedTexts: string, sourceLang: string, targetLang: string) => string,
  options?: {
    /** 로그에 포함할 컨텍스트 라벨 (예: `recipe ${recipeId}`, `announcement ${id}`) */
    contextLabel?: string;
    chunkBudgetChars?: number;
    model?: string;
    maxTokens?: number;
  }
): Promise<TranslatePairResult<T>> {
  const sourceLang = getLocaleName(sourceLocale);
  const targetLang = getLocaleName(targetLocale);
  const contextPrefix = options?.contextLabel ? `(${options.contextLabel}) ` : "";
  const pairLabel = `${sourceLocale}->${targetLocale}`;

  const chunks = chunkBySourceLength(items, options?.chunkBudgetChars);
  const translations = new Map<T, string>();
  let failedChunks = 0;

  for (const chunk of chunks) {
    const numberedTexts = chunk.map((item, i) => `[${i + 1}] ${item.sourceText}`).join("\n");
    const prompt = buildPrompt(numberedTexts, sourceLang, targetLang);

    let response;
    try {
      response = await anthropic.messages.create({
        model: options?.model ?? "claude-haiku-4-5-20251001",
        max_tokens: options?.maxTokens ?? 4096,
        messages: [{ role: "user", content: prompt }],
      });
    } catch (err) {
      failedChunks++;
      console.error(
        `[translation] ${contextPrefix}Anthropic API call failed [${pairLabel}]:`,
        err instanceof Error ? err.message : err
      );
      continue;
    }

    if (response.content.length === 0) {
      failedChunks++;
      console.error(`[translation] ${contextPrefix}empty response content [${pairLabel}]`);
      continue;
    }

    if (response.content[0].type !== "text") {
      failedChunks++;
      console.warn(
        `[translation] ${contextPrefix}non-text first content block (type=${response.content[0].type}) [${pairLabel}] — skipping chunk`
      );
      continue;
    }
    const responseText = response.content[0].text;

    if (response.stop_reason === "max_tokens") {
      console.warn(
        `[translation] ${contextPrefix}response truncated (stop_reason=max_tokens) [${pairLabel}] chunk_size=${chunk.length} — discarding last (possibly partial) item`
      );
    }

    const parsed = parseNumberedResponse(responseText, response.stop_reason);

    for (const { idx, text } of parsed) {
      if (idx < 0 || idx >= chunk.length) continue;
      const item = chunk[idx];
      if (!isTranslationLengthValid(item.sourceText, text)) {
        console.error(
          `[translation] ${contextPrefix}skipping abnormally long translation [${pairLabel}] idx=${idx} source_len=${item.sourceText.length} translated_len=${text.length}`
        );
        continue;
      }
      translations.set(item, text);
    }
  }

  return { translations, totalChunks: chunks.length, failedChunks };
}
