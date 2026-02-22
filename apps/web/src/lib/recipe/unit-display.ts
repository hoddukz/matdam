// Tag: util
// Path: apps/web/src/lib/recipe/unit-display.ts

import { convertVolume, convertWeight } from "@matdam/utils";
import type { UnitSystem } from "@/stores/unit-preference";

export const metricToImperial: Record<string, string> = {
  ml: "fl_oz",
  l: "fl_oz",
  g: "oz",
  kg: "lb",
};

export const imperialToMetric: Record<string, string> = {
  fl_oz: "ml",
  oz: "g",
  lb: "kg",
};

const volumeUnits = new Set(["tsp", "tbsp", "cup", "ml", "l", "fl_oz"]);
const weightUnits = new Set(["g", "kg", "oz", "lb"]);

export const unitDisplayMap: Record<string, string> = {
  l: "L",
  ml: "mL",
  fl_oz: "fl oz",
};

export function convertAmount(amount: number, fromUnit: string, toUnit: string): number | null {
  if (volumeUnits.has(fromUnit) && volumeUnits.has(toUnit)) {
    return convertVolume(amount, fromUnit, toUnit);
  }
  if (weightUnits.has(fromUnit) && weightUnits.has(toUnit)) {
    return convertWeight(amount, fromUnit, toUnit);
  }
  return null;
}

export function formatAmount(
  amount: number | null,
  unit: string | null,
  qualifier: string | null,
  system: UnitSystem
): string {
  if (amount == null || unit == null) {
    return qualifier || "";
  }

  let displayAmt = amount;
  let displayUnit = unit;

  if (system === "imperial" && metricToImperial[unit]) {
    const target = metricToImperial[unit];
    const converted = convertAmount(amount, unit, target);
    if (converted != null) {
      displayAmt = converted;
      displayUnit = target;
    }
  } else if (system === "metric" && imperialToMetric[unit]) {
    const target = imperialToMetric[unit];
    const converted = convertAmount(amount, unit, target);
    if (converted != null) {
      displayAmt = converted;
      displayUnit = target;
    }
  }

  const rounded =
    displayAmt < 1 ? parseFloat(displayAmt.toFixed(2)) : parseFloat(displayAmt.toFixed(1));
  const label = unitDisplayMap[displayUnit] || displayUnit;
  return `${rounded} ${label}`;
}
