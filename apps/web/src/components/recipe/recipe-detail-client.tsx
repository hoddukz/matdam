// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/recipe-detail-client.tsx

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { UnitToggle } from "@/components/recipe/unit-toggle";
import { useUnitPreference } from "@/stores/unit-preference";
import { convertVolume, convertWeight } from "@matdam/utils";

interface IngredientData {
  amount: number | null;
  unit: string | null;
  qualifier: string | null;
  note: string | null;
  custom_name: string | null;
  ingredients: {
    names: Record<string, string>;
    category: string;
  } | null;
}

interface RecipeDetailClientProps {
  ingredients: IngredientData[];
}

const metricToImperial: Record<string, string> = {
  ml: "fl_oz",
  l: "fl_oz",
  g: "oz",
  kg: "lb",
};

const imperialToMetric: Record<string, string> = {
  fl_oz: "ml",
  oz: "g",
  lb: "kg",
};

const volumeUnits = new Set(["tsp", "tbsp", "cup", "ml", "l", "fl_oz"]);
const weightUnits = new Set(["g", "kg", "oz", "lb"]);

function convertAmount(amount: number, fromUnit: string, toUnit: string): number | null {
  if (volumeUnits.has(fromUnit) && volumeUnits.has(toUnit)) {
    return convertVolume(amount, fromUnit, toUnit);
  }
  if (weightUnits.has(fromUnit) && weightUnits.has(toUnit)) {
    return convertWeight(amount, fromUnit, toUnit);
  }
  return null;
}

export function RecipeIngredientList({ ingredients }: RecipeDetailClientProps) {
  const t = useTranslations("recipeDetail");
  const locale = useLocale();
  const { system } = useUnitPreference();

  function displayAmount(ing: IngredientData): string {
    if (ing.amount == null || ing.unit == null) {
      return ing.qualifier || "";
    }

    let displayAmt = ing.amount;
    let displayUnit = ing.unit;

    if (system === "imperial" && metricToImperial[ing.unit]) {
      const target = metricToImperial[ing.unit];
      const converted = convertAmount(ing.amount, ing.unit, target);
      if (converted != null) {
        displayAmt = converted;
        displayUnit = target;
      }
    } else if (system === "metric" && imperialToMetric[ing.unit]) {
      const target = imperialToMetric[ing.unit];
      const converted = convertAmount(ing.amount, ing.unit, target);
      if (converted != null) {
        displayAmt = converted;
        displayUnit = target;
      }
    }

    const rounded = Math.round(displayAmt * 100) / 100;
    return `${rounded} ${displayUnit}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("ingredients")}</h2>
        <UnitToggle />
      </div>
      <ul className="space-y-2">
        {ingredients.map((ing, i) => {
          const name = ing.ingredients
            ? ing.ingredients.names[locale] || ing.ingredients.names["en"] || ""
            : ing.custom_name || "";
          return (
            <li
              key={i}
              className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{name}</span>
                {ing.ingredients?.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {ing.ingredients.category}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {displayAmount(ing)}
                {ing.note && <span className="ml-1 italic">({ing.note})</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
