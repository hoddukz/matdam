// Tag: core
// Path: apps/web/src/app/[locale]/terms/page.tsx

import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("termsOfService");
  return { title: t("title") };
}

export default async function TermsPage() {
  const t = await getTranslations("termsOfService");

  const sections = [
    { title: t("acceptanceTitle"), content: t("acceptanceContent") },
    { title: t("serviceTitle"), content: t("serviceContent") },
    { title: t("accountTitle"), content: t("accountContent") },
    { title: t("contentTitle"), content: t("contentContent") },
    { title: t("conductTitle"), content: t("conductContent") },
    { title: t("disclaimerTitle"), content: t("disclaimerContent") },
    { title: t("changesTitle"), content: t("changesContent") },
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
