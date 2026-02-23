// Tag: core
// Path: apps/web/src/app/[locale]/privacy/page.tsx

import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("privacyPolicy");
  return { title: t("title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPolicy");

  const sections = [
    { title: t("introTitle"), content: t("introContent") },
    { title: t("collectTitle"), content: t("collectContent") },
    { title: t("useTitle"), content: t("useContent") },
    { title: t("thirdPartyTitle"), content: t("thirdPartyContent") },
    { title: t("retentionTitle"), content: t("retentionContent") },
    { title: t("contactTitle"), content: t("contactContent") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("effectiveDate")}</p>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
