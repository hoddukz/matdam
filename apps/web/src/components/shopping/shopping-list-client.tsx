// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/shopping/shopping-list-client.tsx

"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type ShoppingItem = {
  key: string;
  name: string;
  totalAmount: number | null;
  unit: string | null;
  category: string | null;
  sources: { recipeId: string; title: string; slug: string }[];
};

interface ShoppingListClientProps {
  recipes: { recipeId: string; title: string; slug: string }[];
  items: ShoppingItem[];
}

export function ShoppingListClient({ recipes, items }: ShoppingListClientProps) {
  const t = useTranslations("shoppingList");
  const tGlossary = useTranslations("glossary");

  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(
    () => new Set(recipes.map((r) => r.recipeId))
  );
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());

  function toggleRecipe(recipeId: string) {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  }

  function toggleItem(key: string) {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function clearChecked() {
    setCheckedKeys(new Set());
  }

  // Filter items to only those that have at least one selected recipe as source
  const filteredItems = useMemo(() => {
    return items.filter((item) => item.sources.some((s) => selectedRecipeIds.has(s.recipeId)));
  }, [items, selectedRecipeIds]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>();
    for (const item of filteredItems) {
      const cat = item.category ?? "__uncategorized__";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [filteredItems]);

  const categoryOrder = [
    "sauce_paste",
    "seasoning",
    "vegetable",
    "protein",
    "grain_noodle",
    "dairy_egg",
    "other",
    "__uncategorized__",
  ];

  const sortedCategories = [...grouped.keys()].sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const CATEGORY_LABEL_KEYS: Record<string, string> = {
    sauce_paste: "filterSaucePaste",
    seasoning: "filterSeasoning",
    vegetable: "filterVegetable",
    protein: "filterProtein",
    grain_noodle: "filterGrainNoodle",
    dairy_egg: "filterDairyEgg",
    other: "filterOther",
  };

  function getCategoryLabel(cat: string): string {
    if (cat === "__uncategorized__") return t("uncategorized");
    const key = CATEGORY_LABEL_KEYS[cat];
    if (key) return tGlossary(key as Parameters<typeof tGlossary>[0]);
    return cat;
  }

  const checkedCount = checkedKeys.size;

  return (
    <div className="space-y-6">
      {/* Recipe selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("recipesLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {recipes.map((r) => {
            const isSelected = selectedRecipeIds.has(r.recipeId);
            return (
              <button
                key={r.recipeId}
                onClick={() => toggleRecipe(r.recipeId)}
                className="focus:outline-none"
              >
                <Badge variant={isSelected ? "default" : "outline"} className="cursor-pointer">
                  {r.title}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("itemCount", { count: filteredItems.length })}
        </p>
        {checkedCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearChecked}>
            {t("clearChecked")}
          </Button>
        )}
      </div>

      {/* Ingredient list grouped by category */}
      {filteredItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t("noBookmarks")}</p>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((cat) => {
            const catItems = grouped.get(cat) ?? [];
            return (
              <div key={cat}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {getCategoryLabel(cat)}
                </h3>
                <div className="space-y-2">
                  {catItems.map((item) => {
                    const isChecked = checkedKeys.has(item.key);
                    // Only show sources that belong to currently selected recipes
                    const visibleSources = item.sources.filter((s) =>
                      selectedRecipeIds.has(s.recipeId)
                    );
                    return (
                      <div key={item.key} className="flex items-start gap-3 py-1">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(item.key)}
                          className="mt-0.5"
                        />
                        <div className="flex flex-col">
                          <span
                            className={
                              isChecked ? "line-through text-muted-foreground" : "text-foreground"
                            }
                          >
                            {item.totalAmount != null && (
                              <span className="font-medium">{item.totalAmount} </span>
                            )}
                            {item.unit && <span className="font-medium">{item.unit} </span>}
                            {item.name}
                          </span>
                          {visibleSources.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {t("fromRecipes", {
                                recipes: visibleSources.map((s) => s.title).join(", "),
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
