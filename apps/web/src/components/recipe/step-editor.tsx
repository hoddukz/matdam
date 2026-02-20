// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/step-editor.tsx

"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock, Lightbulb, ImageIcon, UtensilsCrossed } from "lucide-react";
import { uploadRecipeImage } from "@/lib/supabase/storage";
import type { IngredientEntry } from "@/components/recipe/ingredient-input";

export interface StepEntry {
  // _id is a client-only stable key for React reconciliation; not sent to DB
  _id: string;
  description: string;
  timer_seconds: number | null;
  image_url: string | null;
  tip: string | null;
  ingredient_indices: number[];
}

export function makeStep(
  partial: Omit<StepEntry, "_id"> = {
    description: "",
    timer_seconds: null,
    image_url: null,
    tip: null,
    ingredient_indices: [],
  }
): StepEntry {
  return { _id: Math.random().toString(36).slice(2), ...partial };
}

interface StepEditorProps {
  value: StepEntry[];
  onChange: (steps: StepEntry[]) => void;
  recipeId?: string;
  ingredients?: IngredientEntry[];
}

function secondsToMinSec(seconds: number | null): { min: string; sec: string } {
  if (seconds == null) return { min: "", sec: "" };
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return { min: String(m), sec: String(s).padStart(2, "0") };
}

function minSecToSeconds(min: string, sec: string): number | null {
  const m = parseInt(min, 10);
  const s = parseInt(sec, 10);
  if (isNaN(m) && isNaN(s)) return null;
  return (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
}

export function StepEditor({ value, onChange, recipeId, ingredients = [] }: StepEditorProps) {
  const t = useTranslations("recipe");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Ref to always hold the latest steps, preventing stale closure issues
  // when multiple rapid updates occur between React renders
  const stepsRef = useRef(value);
  stepsRef.current = value;

  function emitUpdate(updated: StepEntry[]) {
    stepsRef.current = updated;
    onChange(updated);
  }

  function updateStep(index: number, patch: Partial<StepEntry>) {
    const current = stepsRef.current;
    const updated = current.map((step, i) => (i === index ? { ...step, ...patch } : step));

    // Auto-expand: typing in last step's description adds a new empty step
    if (
      patch.description !== undefined &&
      index === current.length - 1 &&
      patch.description.length > 0
    ) {
      updated.push(makeStep());
    }

    emitUpdate(updated);
  }

  function removeStep(index: number) {
    const current = stepsRef.current;
    if (current.length <= 1) return;
    emitUpdate(current.filter((_, i) => i !== index));
  }

  function addStep() {
    emitUpdate([...stepsRef.current, makeStep()]);
  }

  function toggleIngredient(stepIndex: number, ingredientIndex: number) {
    const step = stepsRef.current[stepIndex];
    const indices = step.ingredient_indices.includes(ingredientIndex)
      ? step.ingredient_indices.filter((i) => i !== ingredientIndex)
      : [...step.ingredient_indices, ingredientIndex];
    updateStep(stepIndex, { ingredient_indices: indices });
  }

  function handleDescriptionKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) {
    if (e.key === "Enter") {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);

      const isDoubleEnter =
        textBefore.endsWith("\n") || (textBefore === "" && textarea.value === "");

      if (isDoubleEnter) {
        e.preventDefault();
        const trimmedDescription = textarea.value.replace(/\n$/, "");
        updateStep(index, { description: trimmedDescription });
        addStep();
        setTimeout(() => {
          const nextCard = document.querySelector(
            `[data-step-index="${index + 1}"] textarea`
          ) as HTMLTextAreaElement | null;
          nextCard?.focus();
        }, 50);
      }
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = recipeId ?? `temp-${Date.now()}`;
    const url = await uploadRecipeImage(file, id, `step-${index + 1}`);
    if (url) {
      updateStep(index, { image_url: url });
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      {value.map((step, index) => {
        const { min, sec } = secondsToMinSec(step.timer_seconds);

        return (
          <Card key={step._id} data-step-index={index} className="relative">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                {t("stepNumber", { number: index + 1 })}
              </CardTitle>
              {value.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeStep(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <div className="space-y-1.5">
                <Textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, { description: e.target.value })}
                  onKeyDown={(e) => handleDescriptionKeyDown(e, index)}
                  placeholder={t("stepDescriptionPlaceholder")}
                  className="min-h-[80px] resize-none"
                />
                <p className="text-xs text-muted-foreground">{t("stepDoubleEnterHint")}</p>
              </div>

              {/* Ingredients used in this step */}
              {ingredients.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UtensilsCrossed className="h-3 w-3" />
                    {t("stepIngredients")}
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredients.map((ing, ingIdx) => {
                      const isSelected = step.ingredient_indices.includes(ingIdx);
                      return (
                        <Badge
                          key={ingIdx}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer select-none text-xs transition-colors"
                          onClick={() => toggleIngredient(index, ingIdx)}
                        >
                          {ing.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional fields row */}
              <div className="flex flex-wrap gap-3">
                {/* Timer */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {t("stepTimer")}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={min}
                      onChange={(e) =>
                        updateStep(index, {
                          timer_seconds: minSecToSeconds(e.target.value, sec),
                        })
                      }
                      placeholder="0"
                      className="w-16 text-center"
                      min={0}
                    />
                    <span className="text-sm text-muted-foreground">:</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={sec}
                      onChange={(e) =>
                        updateStep(index, {
                          timer_seconds: minSecToSeconds(min, e.target.value),
                        })
                      }
                      placeholder="00"
                      className="w-16 text-center"
                      min={0}
                      max={59}
                    />
                  </div>
                </div>

                {/* Image upload */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />
                    {t("stepImage")}
                  </Label>
                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => fileInputRefs.current[index]?.click()}
                  >
                    <ImageIcon className="h-3 w-3" />
                    {step.image_url ? t("stepImageChange") : t("stepImageAdd")}
                  </Button>
                  {step.image_url && (
                    <div className="flex items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={step.image_url}
                        alt={t("stepImagePreview")}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => updateStep(index, { image_url: null })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tip */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lightbulb className="h-3 w-3" />
                  {t("stepTip")}
                </Label>
                <Input
                  value={step.tip ?? ""}
                  onChange={(e) => updateStep(index, { tip: e.target.value || null })}
                  placeholder={t("stepTipPlaceholder")}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button type="button" variant="outline" className="w-full gap-2" onClick={addStep}>
        <Plus className="h-4 w-4" />
        {t("addStep")}
      </Button>
    </div>
  );
}
