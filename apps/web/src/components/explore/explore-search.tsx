// Tag: core
// Path: apps/web/src/components/explore/explore-search.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

export function ExploreSearch() {
  const t = useTranslations("explore");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      const difficulty = searchParams.get("difficulty");
      if (difficulty) params.set("difficulty", difficulty);
      const dietary = searchParams.get("dietary");
      if (dietary) params.set("dietary", dietary);
      const sort = searchParams.get("sort");
      if (sort) params.set("sort", sort);
      if (q.trim()) params.set("q", q.trim());
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushQuery(value), DEBOUNCE_MS);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    pushQuery(query);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t("searchPlaceholder")}
        value={query}
        onChange={handleChange}
        className="pl-9"
      />
    </form>
  );
}
