// Tag: core
// Path: apps/web/src/app/[locale]/onboarding/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OnboardingForm } from "./_components/onboarding-form";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, preferences")
    .eq("user_id", user.id)
    .single();

  // 이미 온보딩 완료한 유저는 홈으로 리다이렉트
  if (profile?.preferences?.onboarding_complete === true) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("onboarding");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="space-y-2 text-center">
          <p className="text-4xl font-bold tracking-tight">🍲 맛담</p>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>

        <OnboardingForm
          defaultDisplayName={profile?.display_name ?? ""}
          existingPreferences={profile?.preferences ?? null}
        />
      </div>
    </div>
  );
}
