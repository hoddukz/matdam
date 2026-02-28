// Tag: core
// Path: apps/web/src/app/[locale]/news/write/form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface Labels {
  titlePlaceholder: string;
  summaryPlaceholder: string;
  contentPlaceholder: string;
  preview: string;
  write: string;
  save: string;
  cancel: string;
  pinnedToggle: string;
  publishToggle: string;
  targetLocale: string;
  targetAll: string;
  targetKo: string;
  targetEn: string;
}

interface Existing {
  id: string;
  title: Record<string, string>;
  content: Record<string, string>;
  summary: Record<string, string>;
  pinned: boolean;
  published: boolean;
  target_locales: string[] | null;
  metadata: Record<string, unknown>;
}

interface NewsWriteFormProps {
  locale: string;
  existing: Existing | null;
  labels: Labels;
}

export function NewsWriteForm({ locale, existing, labels }: NewsWriteFormProps) {
  const router = useRouter();
  const isEdit = !!existing;

  // 작성 언어는 ko 기본 (관리자가 한국어로 작성)
  const [title, setTitle] = useState(existing?.title?.ko ?? "");
  const [summary, setSummary] = useState(existing?.summary?.ko ?? "");
  const [content, setContent] = useState(existing?.content?.ko ?? "");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);
  const [published, setPublished] = useState(existing?.published ?? true);
  const [targetLocale, setTargetLocale] = useState<"all" | "ko" | "en">(
    existing?.target_locales === null
      ? "all"
      : existing?.target_locales?.[0] === "ko"
        ? "ko"
        : existing?.target_locales?.[0] === "en"
          ? "en"
          : "all"
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);

    const targetLocales = targetLocale === "all" ? null : [targetLocale];
    const payload = {
      title: { ko: title },
      content: { ko: content },
      summary: summary.trim() ? { ko: summary } : {},
      pinned,
      published,
      targetLocales,
      metadata: existing?.metadata ?? {},
    };

    const url = isEdit ? `/api/announcements/${existing.id}` : "/api/announcements";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const redirectId = isEdit ? existing.id : data.id;
        router.push(`/${locale}/news/${redirectId}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제목 */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={labels.titlePlaceholder}
          className="w-full rounded-md border bg-background px-3 py-2 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* 요약 */}
      <div>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder={labels.summaryPlaceholder}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 본문 탭 (작성 / 미리보기) */}
      <div>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              !showPreview
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {labels.write}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              showPreview
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {labels.preview}
          </button>
        </div>

        {showPreview ? (
          <div className="min-h-[200px] rounded-md border p-4">
            <MarkdownRenderer content={content || ""} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={labels.contentPlaceholder}
            rows={12}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            required
          />
        )}
      </div>

      {/* 옵션 */}
      <div className="flex flex-wrap gap-6 text-sm">
        {/* 대상 국가 */}
        <div className="space-y-1">
          <label className="font-medium">{labels.targetLocale}</label>
          <div className="flex gap-3">
            {(["all", "ko", "en"] as const).map((val) => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetLocale"
                  value={val}
                  checked={targetLocale === val}
                  onChange={() => setTargetLocale(val)}
                  className="accent-primary"
                />
                {val === "all"
                  ? labels.targetAll
                  : val === "ko"
                    ? labels.targetKo
                    : labels.targetEn}
              </label>
            ))}
          </div>
        </div>

        {/* 고정 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="accent-primary"
          />
          {labels.pinnedToggle}
        </label>

        {/* 공개 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-primary"
          />
          {labels.publishToggle}
        </label>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !title.trim() || !content.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "..." : labels.save}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}
