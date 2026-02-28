// Tag: core
// Path: apps/web/src/components/fridge/fridge-client.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Search, Info } from "lucide-react";
import { getLocalizedText } from "@/lib/recipe/localized-text";

type SelectedIngredient = {
  id: string;
  name: string;
};

type SuggestedIngredient = {
  id: string;
  names: Record<string, string>;
};

type MatchedRecipe = {
  recipe_id: string;
  slug: string;
  title: Record<string, string>;
  hero_image_url: string | null;
  difficulty_level: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  matchCount: number;
  totalIngredients: number;
};

interface FridgeClientProps {
  fromRecipeId?: string;
}

export function FridgeClient({ fromRecipeId }: FridgeClientProps) {
  const t = useTranslations("fridge");
  const locale = useLocale();
  const supabaseRef = useRef(createClient());

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedIngredient[]>([]);
  const [selected, setSelected] = useState<SelectedIngredient[]>([]);
  const [results, setResults] = useState<MatchedRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLeftoverBanner, setShowLeftoverBanner] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSearchDoneRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // fromRecipeId: 레시피 재료 자동 로드
  useEffect(() => {
    if (!fromRecipeId || autoSearchDoneRef.current) return;

    async function loadRecipeIngredients() {
      const supabase = supabaseRef.current;

      // recipe_ingredients 에서 ingredient_id가 있는 행만 조회 + ingredients 테이블 조인
      const { data } = await supabase
        .from("recipe_ingredients")
        .select("ingredient_id, ingredients(id, names)")
        .eq("recipe_id", fromRecipeId!)
        .not("ingredient_id", "is", null);

      if (!data || data.length === 0) return;

      const ingredients: SelectedIngredient[] = [];
      const seen = new Set<string>();

      for (const row of data) {
        const ing = row.ingredients as unknown as {
          id: string;
          names: Record<string, string>;
        } | null;
        if (!ing || seen.has(ing.id)) continue;
        seen.add(ing.id);
        ingredients.push({
          id: ing.id,
          name: getLocalizedText(ing.names, locale),
        });
      }

      if (ingredients.length > 0) {
        setSelected(ingredients);
        setShowLeftoverBanner(true);
      }
    }

    loadRecipeIngredients();
  }, [fromRecipeId, locale]);

  // fromRecipeId: 재료 로드 후 자동 검색 (1회)
  useEffect(() => {
    if (!fromRecipeId || autoSearchDoneRef.current || selected.length === 0 || !showLeftoverBanner)
      return;
    autoSearchDoneRef.current = true;
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, showLeftoverBanner, fromRecipeId]);

  const fetchSuggestions = useCallback(
    async (term: string) => {
      if (term.trim().length < 1) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      const { data } = await supabaseRef.current.rpc("search_ingredients", {
        search_term: term.trim(),
        result_limit: 20,
      });
      const list = (data ?? []) as SuggestedIngredient[];
      // Filter out already selected ingredients
      const selectedIds = new Set(selected.map((s) => s.id));
      setSuggestions(list.filter((i) => !selectedIds.has(i.id)));
      setShowDropdown(true);
    },
    [selected]
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  }

  function handleSelect(ingredient: SuggestedIngredient) {
    const name = getLocalizedText(ingredient.names, locale);
    setSelected((prev) => {
      if (prev.some((s) => s.id === ingredient.id)) return prev;
      return [...prev, { id: ingredient.id, name }];
    });
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  }

  function handleRemove(id: string) {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }

  function handleClearAll() {
    setSelected([]);
    setShowLeftoverBanner(false);
    setResults([]);
    setHasSearched(false);
  }

  async function handleSearch() {
    if (selected.length === 0) return;
    setIsSearching(true);
    setHasSearched(true);

    const selectedIds = selected.map((s) => s.id);

    try {
      // Step 1: Find all recipe_ingredients rows for selected ingredient_ids
      const { data: matchRows } = await supabaseRef.current
        .from("recipe_ingredients")
        .select("recipe_id, ingredient_id")
        .in("ingredient_id", selectedIds);

      if (!matchRows || matchRows.length === 0) {
        setResults([]);
        return;
      }

      // Step 2: Group by recipe_id and count matches
      const matchCountMap: Record<string, number> = {};
      for (const row of matchRows) {
        matchCountMap[row.recipe_id] = (matchCountMap[row.recipe_id] ?? 0) + 1;
      }
      const matchedRecipeIds = Object.keys(matchCountMap);

      // Step 3: Get total ingredient count per recipe
      const { data: allIngRows } = await supabaseRef.current
        .from("recipe_ingredients")
        .select("recipe_id")
        .in("recipe_id", matchedRecipeIds);

      const totalCountMap: Record<string, number> = {};
      for (const row of allIngRows ?? []) {
        totalCountMap[row.recipe_id] = (totalCountMap[row.recipe_id] ?? 0) + 1;
      }

      // Step 4: Fetch recipe details (published only)
      const { data: recipeRows } = await supabaseRef.current
        .from("recipes")
        .select(
          "recipe_id, slug, title, hero_image_url, difficulty_level, prep_time_minutes, cook_time_minutes, servings"
        )
        .in("recipe_id", matchedRecipeIds)
        .eq("published", true);

      if (!recipeRows || recipeRows.length === 0) {
        setResults([]);
        return;
      }

      // Step 5: Combine and sort by matchCount descending
      const combined: MatchedRecipe[] = recipeRows.map((r) => ({
        recipe_id: r.recipe_id,
        slug: r.slug,
        title: r.title as Record<string, string>,
        hero_image_url: r.hero_image_url,
        difficulty_level: r.difficulty_level,
        prep_time_minutes: r.prep_time_minutes,
        cook_time_minutes: r.cook_time_minutes,
        servings: r.servings,
        matchCount: matchCountMap[r.recipe_id] ?? 0,
        totalIngredients: totalCountMap[r.recipe_id] ?? 1,
      }));

      combined.sort((a, b) => b.matchCount - a.matchCount);
      setResults(combined);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Leftover banner */}
      {showLeftoverBanner && (
        <div className="flex items-start gap-3 rounded-lg border border-matdam-gold/30 bg-matdam-gold/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-matdam-gold" />
          <div className="flex-1">
            <p className="text-sm font-medium">{t("leftoverBanner")}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs text-muted-foreground"
            onClick={handleClearAll}
          >
            {t("clearAll")}
          </Button>
        </div>
      )}

      {/* Ingredient search input */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            autoComplete="off"
          />
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
            {suggestions.map((ingredient) => {
              const name = getLocalizedText(ingredient.names, locale);
              const altName = locale === "ko" ? ingredient.names["en"] : ingredient.names["ko"];
              return (
                <li key={ingredient.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                    onMouseDown={(e) => {
                      // Prevent input blur before click registers
                      e.preventDefault();
                      handleSelect(ingredient);
                    }}
                  >
                    <span className="font-medium">{name}</span>
                    {altName && <span className="text-muted-foreground">{altName}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Selected ingredients */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t("selectedLabel")}</p>
        {selected.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noSelected")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((ingredient) => (
              <Badge key={ingredient.id} variant="secondary" className="gap-1 pr-1 text-sm">
                {ingredient.name}
                <button
                  type="button"
                  aria-label={`Remove ${ingredient.name}`}
                  onClick={() => handleRemove(ingredient.id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Search button */}
      <Button
        onClick={handleSearch}
        disabled={selected.length === 0 || isSearching}
        className="w-full sm:w-auto"
      >
        {isSearching ? t("searching") : t("searchRecipes")}
      </Button>

      {/* Results */}
      {hasSearched && (
        <div>
          {results.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t("noResults")}</p>
          ) : (
            <>
              <h2 className="mb-4 text-lg font-semibold">{t("resultsTitle")}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((recipe) => {
                  const title = getLocalizedText(recipe.title, locale);
                  const totalMinutes =
                    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
                  const matchPct = Math.round((recipe.matchCount / recipe.totalIngredients) * 100);

                  return (
                    <Link key={recipe.recipe_id} href={`/${locale}/recipe/${recipe.slug}`}>
                      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
                        {/* Hero image */}
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          {recipe.hero_image_url ? (
                            <Image
                              src={recipe.hero_image_url}
                              alt={title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-4xl">&#127836;</span>
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-2 text-base leading-snug">
                            {title}
                          </CardTitle>
                          {/* Match progress bar */}
                          <div className="flex items-center gap-2 pt-1">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-matdam-gold"
                                style={{ width: `${matchPct}%` }}
                              />
                            </div>
                            <span className="whitespace-nowrap text-xs text-muted-foreground">
                              {t("matchCount", {
                                matched: recipe.matchCount,
                                total: recipe.totalIngredients,
                              })}
                            </span>
                          </div>
                        </CardHeader>

                        <CardFooter className="gap-4 text-xs text-muted-foreground">
                          {totalMinutes > 0 && (
                            <span>
                              {totalMinutes} {t("minutes")}
                            </span>
                          )}
                          {recipe.servings != null && (
                            <span>
                              {recipe.servings} {t("servings")}
                            </span>
                          )}
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
