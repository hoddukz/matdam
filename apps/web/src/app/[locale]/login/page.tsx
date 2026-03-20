// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/login/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./_components/login-form";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user && !error) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("login");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-2 text-center">
          <p className="text-4xl font-bold tracking-tight">🍲 맛담</p>
          <p className="text-muted-foreground text-xs">MatDam</p>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>

        <LoginForm />

        <p className="text-muted-foreground text-center text-xs">{t("autoSignup")}</p>
      </div>
    </div>
  );
}
