// Tag: core
// Path: apps/web/src/app/[locale]/news/write/page.tsx

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/user/auth-utils";
import { NewsWriteForm } from "./form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export async function generateMetadata() {
  const t = await getTranslations("news");
  return { title: t("writeNew") };
}

export default async function NewsWritePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();
  const admin = await isAdmin(supabase);

  if (!admin) {
    redirect(`/${locale}/news`);
  }

  // 수정 모드: 기존 데이터 로드
  let existing = null;
  if (edit) {
    const { data } = await supabase.from("announcements").select("*").eq("id", edit).single();
    existing = data;
  }

  const t = await getTranslations("news");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{existing ? t("editPost") : t("writeNew")}</h1>
      <NewsWriteForm
        locale={locale}
        existing={existing}
        labels={{
          titlePlaceholder: t("titlePlaceholder"),
          summaryPlaceholder: t("summaryPlaceholder"),
          contentPlaceholder: t("contentPlaceholder"),
          preview: t("preview"),
          write: t("write"),
          save: t("save"),
          cancel: t("cancel"),
          pinnedToggle: t("pinnedToggle"),
          publishToggle: t("publishToggle"),
          targetLocale: t("targetLocale"),
          targetAll: t("targetAll"),
          targetKo: t("targetKo"),
          targetEn: t("targetEn"),
        }}
      />
    </div>
  );
}
