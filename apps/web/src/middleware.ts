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

  // Supabase 쿠키를 intl 응답에 병합 (redirect 응답 포함)
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  // Supabase auth 쿠키에만 보안 옵션 강제 적용 (NEXT_LOCALE 등은 클라이언트 접근 필요)
  const isProduction = process.env.NODE_ENV === "production";
  intlResponse.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      intlResponse.cookies.set(cookie.name, cookie.value, {
        ...cookie,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      });
    }
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
