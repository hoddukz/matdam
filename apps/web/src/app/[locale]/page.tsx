// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/page.tsx

import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </main>
  );
}
