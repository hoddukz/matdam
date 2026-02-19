// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/auth/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";

  // Open redirect 방지: 상대경로만 허용, 프로토콜 상대 URL(//) 차단
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 코드가 없거나 교환 실패 시 홈으로 리다이렉트
  return NextResponse.redirect(`${origin}/`);
}
