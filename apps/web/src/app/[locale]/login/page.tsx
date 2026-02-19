// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/login/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 로그인된 경우 홈으로 리다이렉트
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-muted-foreground text-sm">계속하려면 로그인하세요</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
