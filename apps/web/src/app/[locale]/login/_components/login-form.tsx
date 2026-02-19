// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/login/_components/login-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const supabase = createClient();

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <Button className="w-full" variant="outline" onClick={handleGoogleLogin} type="button">
      Google로 계속하기
    </Button>
  );
}
