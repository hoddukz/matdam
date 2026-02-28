// Tag: util
// Path: apps/web/src/lib/user/auth-utils.ts

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 현재 로그인 유저가 admin인지 확인하는 서버 유틸.
 * 인증되지 않았거나 role이 admin이 아니면 false 반환.
 */
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase.from("users").select("role").eq("user_id", user.id).single();

  return data?.role === "admin";
}
