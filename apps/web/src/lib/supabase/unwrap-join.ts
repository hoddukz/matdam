// Tag: util
// Path: apps/web/src/lib/supabase/unwrap-join.ts

/**
 * Supabase JOIN 결과가 단일 객체 또는 배열로 반환될 수 있으므로
 * 항상 단일 객체(또는 null)로 언래핑하는 헬퍼.
 */
export function unwrapJoin<T>(value: T | T[] | null): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
