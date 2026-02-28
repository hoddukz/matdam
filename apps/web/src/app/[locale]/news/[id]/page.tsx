// Tag: core
// Path: apps/web/src/app/[locale]/news/[id]/page.tsx

import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/user/auth-utils";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { RANK_DEFINITIONS } from "@/lib/user/rank-constants";
import Link from "next/link";
import { NewsDetailActions } from "./actions";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const getAnnouncement = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("*").eq("id", id).single();
  return data;
});

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const announcement = await getAnnouncement(id);
  if (!announcement) return { title: "Not Found" };
  return {
    title: getLocalizedText(announcement.title as Record<string, string>, locale),
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) notFound();

  const t = await getTranslations("news");
  const tRank = await getTranslations("rank");
  const supabase = await createClient();
  const admin = await isAdmin(supabase);

  const title = getLocalizedText(announcement.title as Record<string, string>, locale);
  const content = getLocalizedText(announcement.content as Record<string, string>, locale);
  const metadata = announcement.metadata as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/${locale}/news`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← {t("backToList")}
      </Link>

      <article className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            {announcement.pinned && (
              <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary mb-2">
                {t("pinned")}
              </span>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {admin && (
            <NewsDetailActions
              id={announcement.id}
              locale={locale}
              editLabel={t("editPost")}
              deleteLabel={t("deletePost")}
              deleteConfirmLabel={t("deleteConfirm")}
            />
          )}
        </div>

        <time className="block text-xs text-muted-foreground">
          {new Date(announcement.created_at).toLocaleDateString(
            locale === "ko" ? "ko-KR" : "en-US",
            { year: "numeric", month: "long", day: "numeric" }
          )}
        </time>

        <MarkdownRenderer content={content} />

        {/* 등급 테이블 위젯 */}
        {metadata?.widget === "rank_table" && (
          <div className="overflow-x-auto rounded-lg border mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="px-3 py-2 font-medium">{t("rankTableTier")}</th>
                  <th className="px-3 py-2 font-medium">{t("rankTableName")}</th>
                  <th className="px-3 py-2 font-medium text-right">{t("rankTableScore")}</th>
                </tr>
              </thead>
              <tbody>
                {RANK_DEFINITIONS.map((rank) => (
                  <tr key={rank.key} className="border-t">
                    <td className="px-3 py-2">{rank.tier}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${rank.color} ${rank.textColor}`}
                      >
                        {tRank(rank.key)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{rank.minScore}+</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  );
}
