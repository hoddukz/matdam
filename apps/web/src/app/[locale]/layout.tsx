// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/[locale]/layout.tsx

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { GNB } from "@/components/layout/gnb";
import { Footer } from "@/components/layout/footer";
import { PostHogProvider } from "@/lib/posthog/provider";
import { PostHogPageView } from "@/lib/posthog/page-view";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "맛담",
  },
  icons: {
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#D4A853",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ko")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <NextIntlClientProvider messages={messages}>
            <GNB />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
