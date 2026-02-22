// Tag: core
// Path: apps/web/src/components/glossary/glossary-search.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function GlossarySearch() {
  const t = useTranslations("glossary");
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string).trim();

    const params = new URLSearchParams();
    // 기존 category 파라미터 보존
    const category = searchParams.get("category");
    if (category) params.set("category", category);
    if (q) params.set("q", q);

    router.push(`?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        type="search"
        placeholder={t("searchPlaceholder")}
        defaultValue={searchParams.get("q") ?? ""}
        className="pl-9"
      />
    </form>
  );
}
