// Tag: core
// Path: apps/web/src/app/[locale]/fridge/page.tsx

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FridgeClient } from "@/components/fridge/fridge-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fridge" });
  return { title: t("title"), description: t("description") };
}

export default async function FridgePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fridge" });
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>
      <FridgeClient />
    </div>
  );
}
