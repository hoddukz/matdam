// Tag: core
// Path: apps/web/src/app/[locale]/news/[id]/actions.tsx

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewsDetailActionsProps {
  id: string;
  locale: string;
  editLabel: string;
  deleteLabel: string;
  deleteConfirmLabel: string;
}

export function NewsDetailActions({
  id,
  locale,
  editLabel,
  deleteLabel,
  deleteConfirmLabel,
}: NewsDetailActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(deleteConfirmLabel)) return;

    const res = await fetch(`/api/announcements/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push(`/${locale}/news`);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={`/${locale}/news/write?edit=${id}`}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
      >
        {editLabel}
      </Link>
      <button
        onClick={handleDelete}
        className="rounded-md border border-destructive/50 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
      >
        {deleteLabel}
      </button>
    </div>
  );
}
