// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/auth/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";

  // Open redirect 방지: 디코딩 후 검증, 프로토콜 상대 URL(//) 차단
  const decoded = decodeURIComponent(rawNext);
  const next = decoded.startsWith("/") && !decoded.startsWith("//") ? decoded : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 온보딩 완료 여부 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("preferences")
          .eq("user_id", user.id)
          .single();

        const onboardingComplete = profile?.preferences?.onboarding_complete === true;

        if (!onboardingComplete) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 코드가 없거나 교환 실패 시 홈으로 리다이렉트
  return NextResponse.redirect(`${origin}/`);
}
