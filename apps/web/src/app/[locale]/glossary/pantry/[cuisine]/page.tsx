// Tag: core
// Path: apps/web/src/app/[locale]/glossary/pantry/[cuisine]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import {
  CUISINE_LABEL_KEYS,
  CATEGORY_LABEL_KEYS,
  DIETARY_FLAG_LABEL_KEYS,
  IMPORTANCE_LABEL_KEYS,
} from "@/lib/recipe/glossary-constants";

type Props = {
  params: Promise<{ locale: string; cuisine: string }>;
};

type Ingredient = {
  id: string;
  names: Record<string, string>;
  category: string;
  dietary_flags: string[];
  importance: string;
  image_url?: string | null;
};

const VALID_CUISINES = Object.keys(CUISINE_LABEL_KEYS);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cuisine } = await params;
  if (!VALID_CUISINES.includes(cuisine)) return { title: "Not Found" };

  const t = await getTranslations({ locale, namespace: "glossary" });
  const cuisineName = t(CUISINE_LABEL_KEYS[cuisine]);
  return {
    title: t("pantryTitle", { cuisine: cuisineName }),
    description: t("pantryDescription", { cuisine: cuisineName }),
  };
}

const IMPORTANCE_BADGE_VARIANT: Record<string, string> = {
  must_have: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  recommended: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export default async function PantryPage({ params }: Props) {
  const { locale, cuisine } = await params;
  if (!VALID_CUISINES.includes(cuisine)) notFound();

  const t = await getTranslations({ locale, namespace: "glossary" });
  const cuisineName = t(CUISINE_LABEL_KEYS[cuisine]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("ingredients")
    .select("id, names, category, dietary_flags, importance, image_url")
    .contains("cuisines", [cuisine])
    .order("names->en");

  const ingredients = (data ?? []) as Ingredient[];

  // 중요도별 그룹핑
  const grouped = new Map<string, Map<string, Ingredient[]>>();
  for (const imp of ["must_have", "recommended", "advanced"]) {
    grouped.set(imp, new Map());
  }

  for (const ing of ingredients) {
    const impGroup = grouped.get(ing.importance);
    if (!impGroup) continue;
    const catList = impGroup.get(ing.category) ?? [];
    catList.push(ing);
    impGroup.set(ing.category, catList);
  }

  // 카테고리 정렬 순서
  const CATEGORY_ORDER = [
    "sauce_paste",
    "seasoning",
    "vegetable",
    "protein",
    "grain_noodle",
    "dairy_egg",
    "other",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      {/* 브레드크럼 */}
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          {t("pantryTitle", { cuisine: cuisineName })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("pantryDescription", { cuisine: cuisineName })}
        </p>
      </div>

      {ingredients.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {(["must_have", "recommended", "advanced"] as const).map((importance) => {
            const catMap = grouped.get(importance);
            if (!catMap || catMap.size === 0) return null;

            const sortedCategories = CATEGORY_ORDER.filter((c) => catMap.has(c));

            return (
              <section key={importance}>
                {/* 중요도 헤더 */}
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {t(IMPORTANCE_LABEL_KEYS[importance])}
                  </h2>
                  <Badge className={`text-xs ${IMPORTANCE_BADGE_VARIANT[importance]}`}>
                    {Array.from(catMap.values()).flat().length}
                  </Badge>
                </div>

                {/* 카테고리별 소그룹 */}
                <div className="space-y-6">
                  {sortedCategories.map((cat) => {
                    const items = catMap.get(cat)!;
                    return (
                      <div key={cat}>
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                          {CATEGORY_LABEL_KEYS[cat] ? t(CATEGORY_LABEL_KEYS[cat]) : cat}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {items.map((ingredient) => {
                            const primaryName = getLocalizedText(ingredient.names, locale);
                            const secondaryName =
                              locale === "ko" ? ingredient.names["en"] : ingredient.names["ko"];

                            return (
                              <Link
                                key={ingredient.id}
                                href={`/${locale}/glossary/${ingredient.id}`}
                              >
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
                                      <p className="text-sm text-muted-foreground">
                                        {secondaryName}
                                      </p>
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
                                        {DIETARY_FLAG_LABEL_KEYS[flag]
                                          ? t(DIETARY_FLAG_LABEL_KEYS[flag])
                                          : flag}
                                      </Badge>
                                    ))}
                                  </CardContent>
                                </Card>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
