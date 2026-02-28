// Tag: core
// Path: apps/web/src/app/[locale]/news/page.tsx

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/user/auth-utils";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  const t = await getTranslations("news");
  return { title: t("title") };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("news");
  const supabase = await createClient();

  // 관리자 여부 확인
  const admin = await isAdmin(supabase);

  // 공지 목록 조회 (locale 필터 적용)
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, summary, pinned, created_at, metadata, target_locales")
    .eq("published", true)
    .or(`target_locales.is.null,target_locales.cs.{${locale}}`)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        {admin && (
          <Link
            href={`/${locale}/news/write`}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("writeNew")}
          </Link>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-8">{t("subtitle")}</p>

      {!announcements || announcements.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noAnnouncements")}</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/news/${item.id}`}
              className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.pinned && (
                      <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        {t("pinned")}
                      </span>
                    )}
                    <h2 className="text-base font-semibold truncate">
                      {getLocalizedText(item.title as Record<string, string>, locale)}
                    </h2>
                  </div>
                  {item.summary &&
                    Object.keys(item.summary as Record<string, string>).length > 0 && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {getLocalizedText(item.summary as Record<string, string>, locale)}
                      </p>
                    )}
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString(
                    locale === "ko" ? "ko-KR" : "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
