// Tag: core
// Path: apps/web/src/app/[locale]/community/page.tsx
// DISABLED: 커뮤니티 기능 비활성화 상태

import { getTranslations } from "next-intl/server";
import { MessageSquare } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "discussion" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("comingSoon")}</p>
    </div>
  );
}
