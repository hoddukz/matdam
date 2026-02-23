// Tag: core
// Path: apps/web/src/app/[locale]/settings/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SettingsForm } from "./_components/settings-form";

export async function generateMetadata() {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, preferences")
    .eq("user_id", user.id)
    .single();

  const t = await getTranslations("settings");

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <SettingsForm
        currentDisplayName={profile?.display_name ?? ""}
        currentPreferences={profile?.preferences ?? null}
      />
    </div>
  );
}
