// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/lib/supabase/server.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출된 경우 쿠키 설정 무시
            // 미들웨어에서 세션 갱신이 처리됨
          }
        },
      },
    }
  );
}
