// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/unit-toggle.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useUnitPreference } from "@/stores/unit-preference";
import { useTranslations } from "next-intl";

export function UnitToggle() {
  const { system, toggle } = useUnitPreference();
  const t = useTranslations("ingredient");

  return (
    <Button variant="outline" size="sm" onClick={toggle} className="gap-1.5 text-xs">
      {system === "metric" ? t("metric") : t("imperial")}
      <span className="text-muted-foreground">→</span>
      {system === "metric" ? t("imperial") : t("metric")}
    </Button>
  );
}
