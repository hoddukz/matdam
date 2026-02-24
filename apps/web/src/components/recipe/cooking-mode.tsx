// Tag: core
// Path: apps/web/src/components/recipe/cooking-mode.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { CookingTimer, ScrollColumn, type ActiveTimer } from "./cooking-timer";
import { getLocalizedText } from "@/lib/recipe/localized-text";
import { formatAmount } from "@/lib/recipe/unit-display";
import { useUnitPreference } from "@/stores/unit-preference";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  BookOpen,
  Undo2,
  Settings,
} from "lucide-react";

interface Step {
  id: string;
  step_order: number;
  description: string;
  timer_seconds: number | null;
  image_url: string | null;
  tip: string | null;
}

interface Ingredient {
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

export interface CookingModeProps {
  recipe: { title: Record<string, string>; slug: string };
  steps: Step[];
  ingredientsByStep: Record<number, Ingredient[]>;
  locale: string;
}

function formatTimerDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CookingMode({ recipe, steps, ingredientsByStep, locale }: CookingModeProps) {
  const t = useTranslations("cookingMode");
  const uiLocale = useLocale();
  const { system } = useUnitPreference();
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState<number | null>(null);
  const [timers, setTimers] = useState<ActiveTimer[]>([]);
  const [customDurations, setCustomDurations] = useState<Record<number, number>>({});
  const [preStartExpanded, setPreStartExpanded] = useState<number | null>(null);
  const [pickerMin, setPickerMin] = useState(0);
  const [pickerSec, setPickerSec] = useState(0);

  const total = steps.length;
  const step = steps[currentStep];
  const current = currentStep + 1;
  const stepIngredients = ingredientsByStep[step.step_order] ?? [];
  const recipeTitle = getLocalizedText(recipe.title, uiLocale);
  const progressPercent = (current / total) * 100;
  const activeTimerForStep = timers.find((tm) => tm.stepOrder === step.step_order);

  const goNext = () => {
    if (currentStep < total - 1) {
      setPreviousStep(null);
      setCurrentStep((p) => p + 1);
    }
  };
  const goPrev = () => {
    if (currentStep > 0) {
      setPreviousStep(null);
      setCurrentStep((p) => p - 1);
    }
  };

  const startTimer = () => {
    if (!step.timer_seconds) return;
    const duration = customDurations[step.step_order] ?? step.timer_seconds;
    setTimers((prev) => {
      if (prev.some((t) => t.stepOrder === step.step_order)) return prev;
      return [
        ...prev,
        {
          stepOrder: step.step_order,
          totalSeconds: duration,
          remainingSeconds: duration,
          isRunning: true,
        },
      ];
    });
    setPreStartExpanded(null);
  };

  const togglePreStartPicker = (stepOrder: number, defaultSeconds: number) => {
    if (preStartExpanded === stepOrder) {
      setPreStartExpanded(null);
    } else {
      const sec = customDurations[stepOrder] ?? defaultSeconds;
      setPickerMin(Math.floor(sec / 60));
      setPickerSec(sec % 60);
      setPreStartExpanded(stepOrder);
    }
  };

  const applyPreStartTime = (stepOrder: number) => {
    const newTotal = pickerMin * 60 + pickerSec;
    if (newTotal > 0) {
      setCustomDurations((prev) => ({ ...prev, [stepOrder]: newTotal }));
      setPreStartExpanded(null);
    }
  };

  const updateTimer = useCallback((stepOrder: number, updated: ActiveTimer) => {
    setTimers((prev) => prev.map((t) => (t.stepOrder === stepOrder ? updated : t)));
  }, []);

  const removeTimer = useCallback((stepOrder: number) => {
    setTimers((prev) => prev.filter((t) => t.stepOrder !== stepOrder));
  }, []);

  const navigateToStep = useCallback(
    (stepOrder: number) => {
      const idx = steps.findIndex((s) => s.step_order === stepOrder);
      if (idx >= 0) {
        setCurrentStep((prev) => {
          setPreviousStep(prev);
          return idx;
        });
      }
    },
    [steps]
  );

  const goBackToPrevious = () => {
    if (previousStep != null) {
      setCurrentStep(previousStep);
      setPreviousStep(null);
    }
  };

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake Lock request failed (e.g., low battery or unsupported browser)
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    }

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLock?.release();
    };
  }, []);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === total - 1;

  const ingredientName = (ing: Ingredient): string => {
    return ing.ingredients
      ? getLocalizedText(ing.ingredients.names, uiLocale)
      : ing.custom_name || "";
  };

  const ingredientKey = (ing: Ingredient, i: number): string => {
    return ing.ingredients
      ? (ing.ingredients.names.en ?? ing.ingredients.names[uiLocale] ?? String(i))
      : (ing.custom_name ?? String(i));
  };

  // -- Sidebar content (shared between desktop sidebar and mobile inline) --
  const renderStepTimer = () => {
    if (step.timer_seconds == null || step.timer_seconds <= 0) return null;
    return (
      <div>
        {activeTimerForStep ? (
          <CookingTimer
            timer={activeTimerForStep}
            label={t("stepOf", { current, total })}
            onUpdate={(updated) => updateTimer(step.step_order, updated)}
            onRemove={() => removeTimer(step.step_order)}
            doneLabel={t("timerDone")}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={startTimer}
              className="flex h-12 w-full items-center gap-2 rounded-lg border px-4 text-base transition-colors hover:bg-muted/50"
            >
              <Clock className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">
                {t("startTimer")}{" "}
                {formatTimerDisplay(customDurations[step.step_order] ?? step.timer_seconds)}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreStartPicker(step.step_order, step.timer_seconds!);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    togglePreStartPicker(step.step_order, step.timer_seconds!);
                  }
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t("adjustTime")}
              >
                <Settings className="h-4 w-4" />
              </span>
            </button>
            {preStartExpanded === step.step_order && (
              <div className="mt-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-center gap-3">
                  <ScrollColumn
                    key={`min-${step.step_order}`}
                    value={pickerMin}
                    onChange={setPickerMin}
                    max={59}
                  />
                  <span className="text-2xl font-bold text-muted-foreground">:</span>
                  <ScrollColumn
                    key={`sec-${step.step_order}`}
                    value={pickerSec}
                    onChange={setPickerSec}
                    max={59}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => applyPreStartTime(step.step_order)}
                  className="mt-3 w-full"
                >
                  {t("apply")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderIngredients = () => {
    if (stepIngredients.length === 0) return null;
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          {t("ingredientsNeeded")}
        </h3>
        <ul className="space-y-1.5">
          {stepIngredients.map((ing, i) => (
            <li key={ingredientKey(ing, i)} className="flex items-center justify-between text-sm">
              <span className="font-medium">{ingredientName(ing)}</span>
              <span className="text-muted-foreground">
                {formatAmount(ing.amount, ing.unit, ing.qualifier, system)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTip = () => {
    if (!step.tip) return null;
    return (
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-matdam-gold" />
        <div>
          <span className="font-semibold">{t("tip")}</span>
          <p className="mt-0.5">{step.tip}</p>
        </div>
      </div>
    );
  };

  const renderActiveTimers = () => {
    if (timers.length === 0) return null;
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t("activeTimers")}</h3>
        <div className="space-y-2">
          {timers.map((timer) => (
            <CookingTimer
              key={timer.stepOrder}
              timer={timer}
              label={t("stepOf", {
                current: timer.stepOrder,
                total,
              })}
              onUpdate={(updated) => updateTimer(timer.stepOrder, updated)}
              onRemove={() => removeTimer(timer.stepOrder)}
              onNavigate={() => navigateToStep(timer.stepOrder)}
              compact
              doneLabel={t("timerDone")}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* ── Top Bar ── */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href={`/${locale}/recipe/${recipe.slug}`}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </Link>
        <span className="text-sm font-semibold">{t("stepOf", { current, total })}</span>
        {previousStep != null && (
          <button
            onClick={goBackToPrevious}
            className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
          >
            <Undo2 className="h-3 w-3" />
            {t("goBack", { step: previousStep + 1 })}
          </button>
        )}
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-matdam-gold transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <span className="hidden text-sm text-muted-foreground md:block">{recipeTitle}</span>
      </header>

      {/* ── Main Content ── */}
      <div className="flex min-h-0 flex-1">
        {/* Left / Main */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Step Image */}
          {step.image_url && (
            <div className="mb-4 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.image_url}
                alt={t("stepOf", { current, total })}
                className="h-48 w-full object-cover md:h-64"
              />
            </div>
          )}

          {/* Step Header + Description */}
          <h2 className="mb-2 text-xl font-bold md:text-2xl">{t("stepOf", { current, total })}</h2>
          <p className="whitespace-pre-line text-base leading-relaxed md:text-lg">
            {step.description}
          </p>

          {/* Mobile only: timer, ingredients, tip, active timers inline */}
          <div className="mt-6 space-y-4 md:hidden">
            {renderStepTimer()}
            {renderIngredients()}
            {renderTip()}
            {renderActiveTimers()}
          </div>
        </main>

        {/* Right Sidebar (desktop only) */}
        <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l p-4 md:block">
          <div className="space-y-6">
            {renderStepTimer()}
            {renderIngredients()}
            {renderTip()}
            {renderActiveTimers()}
          </div>
        </aside>
      </div>

      {/* ── Bottom Navigation ── */}
      <footer className="shrink-0 border-t px-4 py-3">
        {/* Mobile: active timers summary above buttons */}
        {timers.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 md:hidden">
            {timers.map((timer) => (
              <span
                key={timer.stepOrder}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  timer.remainingSeconds === 0
                    ? "animate-pulse bg-red-100 text-red-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t("stepOf", { current: timer.stepOrder, total })}{" "}
                {timer.remainingSeconds === 0
                  ? t("timerDone")
                  : formatTimerDisplay(timer.remainingSeconds)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={goPrev}
            disabled={isFirstStep}
            variant="outline"
            className="h-12 min-w-[100px] gap-1 text-base"
          >
            <ChevronLeft className="h-5 w-5" />
            {t("previous")}
          </Button>

          <Button variant="ghost" className="h-12 gap-1 text-base" asChild>
            <Link href={`/${locale}/recipe/${recipe.slug}`}>
              <BookOpen className="h-5 w-5" />
              <span className="hidden sm:inline">{t("viewFullRecipe")}</span>
            </Link>
          </Button>

          {isLastStep ? (
            <Button className="h-12 min-w-[100px] text-base" asChild>
              <Link href={`/${locale}/recipe/${recipe.slug}`}>{t("finish")}</Link>
            </Button>
          ) : (
            <Button onClick={goNext} className="h-12 min-w-[100px] gap-1 text-base">
              {t("next")}
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
