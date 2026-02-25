// Tag: util
// Path: apps/web/src/lib/recipe/recipe-linter.ts

export type LintSeverity = "error" | "warning";

export type LintResult = {
  severity: LintSeverity;
  messageKey: string;
  params?: Record<string, string | number>;
};

const TIME_WORDS_PATTERN = /분|초|minute|second|hour/i;

export function lintRecipe(
  ingredients: { name: string }[],
  steps: { description: string; timer_seconds: number | null; ingredient_indices: number[] }[]
): LintResult[] {
  const results: LintResult[] = [];

  // Collect all ingredient indices referenced by any step
  const usedIndices = new Set<number>();
  for (const step of steps) {
    for (const idx of step.ingredient_indices) {
      usedIndices.add(idx);
    }
  }

  // Rule: Unused ingredient (error)
  ingredients.forEach((ing, idx) => {
    if (!usedIndices.has(idx)) {
      results.push({
        severity: "error",
        messageKey: "lintUnusedIngredient",
        params: { name: ing.name },
      });
    }
  });

  steps.forEach((step, idx) => {
    const stepNumber = idx + 1;

    // Rule: Empty step (error)
    if (step.description.trim().length === 0) {
      results.push({
        severity: "error",
        messageKey: "lintEmptyStep",
        params: { step: stepNumber },
      });
    }

    // Rule: Step without ingredients (warning)
    if (step.ingredient_indices.length === 0) {
      results.push({
        severity: "warning",
        messageKey: "lintStepNoIngredients",
        params: { step: stepNumber },
      });
    }

    // Rule: Missing timer (warning) — only when description has time words
    if (
      step.description.trim().length > 0 &&
      TIME_WORDS_PATTERN.test(step.description) &&
      step.timer_seconds == null
    ) {
      results.push({
        severity: "warning",
        messageKey: "lintMissingTimer",
        params: { step: stepNumber },
      });
    }
  });

  return results;
}
