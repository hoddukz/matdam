// Tag: core
// Path: apps/web/src/components/explore/explore-search.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ExploreSearch() {
  const t = useTranslations("explore");
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string).trim();

    const params = new URLSearchParams();
    // 기존 파라미터 보존
    const difficulty = searchParams.get("difficulty");
    if (difficulty) params.set("difficulty", difficulty);
    const dietary = searchParams.get("dietary");
    if (dietary) params.set("dietary", dietary);
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
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
