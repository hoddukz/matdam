// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/login/_components/login-form.tsx

"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export function LoginForm() {
  const supabase = createClient();
  const t = useTranslations("login");

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("OAuth error:", error.message);
    }
  }

  return (
    <Button className="w-full" variant="outline" onClick={handleGoogleLogin} type="button">
      {t("google")}
    </Button>
  );
}
