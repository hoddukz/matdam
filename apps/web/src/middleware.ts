// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/middleware.ts

import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Supabase 세션 갱신 (토큰 리프레시)
  const supabaseResponse = await updateSession(request);

  // 2. next-intl 미들웨어 실행
  const intlResponse = intlMiddleware(request);

  // next-intl이 리다이렉트를 내릴 경우 해당 응답 우선 반환
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  // Supabase 쿠키를 intl 응답에 병합
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
