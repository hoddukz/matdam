// Tag: util
// Path: apps/web/src/lib/validation/search-params.ts

import { z } from "zod";

/**
 * 검색 파라미터 검증 스키마 (중앙 집중형)
 * 모든 검색/필터 파라미터는 DB 쿼리 전에 이 스키마를 통과해야 함.
 * 검증 실패 시 해당 파라미터는 무시되어 DB 쿼리에 도달하지 않음.
 */

// 검색어: 영문/한글/숫자/공백/하이픈만 허용, 최대 50자
const safeSearchQuery = z
  .string()
  .max(50)
  .regex(/^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]+$/)
  .transform((v) => v.trim())
  .optional();

// Explore 페이지 검색 파라미터
const VALID_DIFFICULTIES = ["beginner", "intermediate", "master"] as const;
const VALID_SORTS = ["newest", "popular"] as const;
const VALID_DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "pescatarian",
  "gluten_free",
  "dairy_free",
  "nut_free",
  "halal",
  "low_calorie",
  "diabetic_friendly",
  "low_sodium",
] as const;

const dietaryArrayTransform = z
  .string()
  .optional()
  .transform((v) =>
    v
      ? v
          .split(",")
          .filter((d): d is (typeof VALID_DIETARY_TAGS)[number] =>
            (VALID_DIETARY_TAGS as readonly string[]).includes(d)
          )
      : []
  );

export const exploreParamsSchema = z.object({
  q: safeSearchQuery,
  sort: z.enum(VALID_SORTS).optional(),
  difficulty: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .filter((d): d is (typeof VALID_DIFFICULTIES)[number] =>
              (VALID_DIFFICULTIES as readonly string[]).includes(d)
            )
        : []
    ),
  dietary: dietaryArrayTransform,
  dietary_hard: dietaryArrayTransform,
  dietary_soft: dietaryArrayTransform,
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? "1", 10) || 1)),
});

export type ExploreParams = z.infer<typeof exploreParamsSchema>;

// Glossary 페이지 검색 파라미터
export const VALID_CATEGORIES = [
  "sauce_paste",
  "seasoning",
  "vegetable",
  "protein",
  "grain_noodle",
  "dairy_egg",
  "other",
] as const;

export const glossaryParamsSchema = z.object({
  q: safeSearchQuery,
  category: z.enum(VALID_CATEGORIES).optional(),
  cuisine: z
    .string()
    .regex(/^[a-z_]+$/)
    .max(30)
    .optional(),
});

export type GlossaryParams = z.infer<typeof glossaryParamsSchema>;
