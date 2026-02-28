// Tag: core
// Path: apps/web/src/app/[locale]/glossary/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlossarySearch } from "@/components/glossary/glossary-search";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import {
  CATEGORY_LABEL_KEYS,
  DIETARY_FLAG_LABEL_KEYS,
  CUISINE_LABEL_KEYS,
  ACTIVE_CUISINES,
} from "@/lib/recipe/glossary-constants";
import { glossaryParamsSchema, VALID_CATEGORIES } from "@/lib/validation/search-params";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; cuisine?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Ingredient = {
  id: string;
  names: Record<string, string>;
  category: string;
  dietary_flags: string[];
  description?: Record<string, string>;
  image_url?: string | null;
};

export default async function GlossaryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const raw = await searchParams;
  const t = await getTranslations({ locale, namespace: "glossary" });

  // Zod 중앙 검증 — 검증 실패 시 DB 쿼리 스킵
  const VALID_CUISINES = Object.keys(CUISINE_LABEL_KEYS);
  const parsed = glossaryParamsSchema.safeParse(raw);
  const validParams = parsed.success ? parsed.data : {};
  const category = validParams.category;
  const cuisine =
    validParams.cuisine && VALID_CUISINES.includes(validParams.cuisine)
      ? validParams.cuisine
      : undefined;
  const q = validParams.q;

  // Zod 검증 실패 시 DB 쿼리 스킵 (타이밍 기반 오탐 방지)
  const hasInvalidParam = !parsed.success;
  const activeCuisines = ACTIVE_CUISINES as readonly string[];
  const supabase = await createClient();

  const ingredients: Ingredient[] = hasInvalidParam
    ? []
    : await (async () => {
        if (q && q.length >= 2) {
          // 검색어가 있으면 RPC 사용 (Zod에서 이미 trim/검증 완료)
          const { data } = await supabase.rpc("search_ingredients", {
            search_term: q,
            locale,
            result_limit: 50,
          });
          let results = (data ?? []) as Ingredient[];
          // 카테고리 필터 적용
          if (category) results = results.filter((i) => i.category === category);
          // cuisine 필터: RPC는 cuisines를 반환하지 않으므로 id 목록으로 2차 필터
          if (cuisine && results.length > 0) {
            const ids = results.map((i) => i.id);
            const { data: filtered } = await supabase
              .from("ingredients")
              .select("id")
              .in("id", ids)
              .contains("cuisines", [cuisine]);
            const validIds = new Set((filtered ?? []).map((r: { id: string }) => r.id));
            results = results.filter((i) => validIds.has(i.id));
          }
          return results;
        }

        // 검색어 없으면 직접 쿼리
        let query = supabase
          .from("ingredients")
          .select("id, names, category, dietary_flags, description, image_url, cuisines")
          .order("names->en")
          .limit(100);

        if (category) {
          query = query.eq("category", category);
        }
        if (cuisine) {
          query = query.contains("cuisines", [cuisine]);
        }

        const { data } = await query;
        return (data ?? []) as Ingredient[];
      })();

  const cuisineFilters = [
    { value: undefined, labelKey: "cuisineAll" as const },
    ...activeCuisines.map((c) => ({
      value: c,
      labelKey: CUISINE_LABEL_KEYS[c] as string,
    })),
  ];

  const categoryFilters = [
    { value: undefined, labelKey: "filterAll" as const },
    ...VALID_CATEGORIES.map((c) => ({
      value: c,
      labelKey: CATEGORY_LABEL_KEYS[c] as string,
    })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("description")}</p>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <GlossarySearch />
        </Suspense>
      </div>

      {/* 문화권 필터 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {cuisineFilters.map((filter) => {
          const params = new URLSearchParams();
          if (filter.value) params.set("cuisine", filter.value);
          if (category) params.set("category", category);
          if (q) params.set("q", q);
          const href = `?${params.toString()}`;
          const isActive = cuisine === filter.value || (!cuisine && !filter.value);
          return (
            <Link key={filter.labelKey} href={href}>
              <Badge
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-sm"
              >
                {t(filter.labelKey)}
              </Badge>
            </Link>
          );
        })}
        {cuisine && (
          <Link
            href={`/${locale}/glossary/pantry/${cuisine}`}
            className="ml-2 text-sm text-primary hover:underline"
          >
            {t("viewPantryGuide")} →
          </Link>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categoryFilters.map((filter) => {
          const params = new URLSearchParams();
          if (cuisine) params.set("cuisine", cuisine);
          if (filter.value) params.set("category", filter.value);
          if (q) params.set("q", q);
          const href = `?${params.toString()}`;
          const isActive = category === filter.value || (!category && !filter.value);
          return (
            <Link key={filter.labelKey} href={href}>
              <Badge
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-sm"
              >
                {t(filter.labelKey)}
              </Badge>
            </Link>
          );
        })}
      </div>

      {/* 재료 그리드 */}
      {ingredients.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ingredients.map((ingredient) => {
            const primaryName = getLocalizedText(ingredient.names, locale);
            const secondaryName = locale === "ko" ? ingredient.names["en"] : ingredient.names["ko"];

            return (
              <Link key={ingredient.id} href={`/${locale}/glossary/${ingredient.id}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  {ingredient.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ingredient.image_url}
                      alt={primaryName}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{primaryName}</CardTitle>
                    {secondaryName && (
                      <p className="text-sm text-muted-foreground">{secondaryName}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABEL_KEYS[ingredient.category]
                        ? t(CATEGORY_LABEL_KEYS[ingredient.category])
                        : ingredient.category}
                    </Badge>
                    {ingredient.dietary_flags.map((flag) => (
                      <Badge key={flag} variant="outline" className="text-xs">
                        {DIETARY_FLAG_LABEL_KEYS[flag] ? t(DIETARY_FLAG_LABEL_KEYS[flag]) : flag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
