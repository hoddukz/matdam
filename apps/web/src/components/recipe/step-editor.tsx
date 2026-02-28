// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/step-editor.tsx

"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock, Lightbulb, ImageIcon, UtensilsCrossed, GripVertical } from "lucide-react";
import { uploadRecipeImage } from "@/lib/supabase/storage";
import type { IngredientEntry } from "@/components/recipe/ingredient-input";
import { makeStep, type StepEntry } from "@/components/recipe/step-types";

// Re-export from shared module (server/client 양쪽 사용 가능)
export { makeStep, type StepEntry };

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

/* ── Sortable Step Card ─────────────────────────────────────────────── */

interface SortableStepCardProps {
  step: StepEntry;
  index: number;
  totalSteps: number;
  ingredients: IngredientEntry[];
  recipeId?: string;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onUpdate: (index: number, patch: Partial<StepEntry>) => void;
  onRemove: (index: number) => void;
  onToggleIngredient: (stepIndex: number, ingredientIndex: number) => void;
  onDescriptionKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  t: ReturnType<typeof useTranslations<"recipe">>;
}

function SortableStepCard({
  step,
  index,
  totalSteps,
  ingredients,
  fileInputRef,
  onUpdate,
  onRemove,
  onToggleIngredient,
  onDescriptionKeyDown,
  onImageUpload,
  t,
}: SortableStepCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { min, sec } = secondsToMinSec(step.timer_seconds);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-step-index={index}
      className={`relative ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label={t("dragToReorder")}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <CardTitle className="text-base font-semibold">
            {t("stepNumber", { number: index + 1 })}
          </CardTitle>
        </div>
        {totalSteps > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
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
            onChange={(e) => onUpdate(index, { description: e.target.value })}
            onKeyDown={(e) => onDescriptionKeyDown(e, index)}
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
                    onClick={() => onToggleIngredient(index, ingIdx)}
                  >
                    {ing.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional fields row */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
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
                  onUpdate(index, {
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
                  onUpdate(index, {
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageUpload(e, index)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                // trigger file input via ref stored in parent
                const input = document.querySelector(
                  `[data-step-index="${index}"] input[type="file"]`
                ) as HTMLInputElement | null;
                input?.click();
              }}
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
                  onClick={() => onUpdate(index, { image_url: null })}
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
            onChange={(e) => onUpdate(index, { tip: e.target.value || null })}
            placeholder={t("stepTipPlaceholder")}
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main Editor ────────────────────────────────────────────────────── */

export function StepEditor({ value, onChange, recipeId, ingredients = [] }: StepEditorProps) {
  const t = useTranslations("recipe");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Ref to always hold the latest steps, preventing stale closure issues
  // when multiple rapid updates occur between React renders
  const stepsRef = useRef(value);
  stepsRef.current = value;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = stepsRef.current;
    const oldIndex = current.findIndex((s) => s._id === active.id);
    const newIndex = current.findIndex((s) => s._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    emitUpdate(arrayMove(current, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((s) => s._id)} strategy={verticalListSortingStrategy}>
          {value.map((step, index) => (
            <SortableStepCard
              key={step._id}
              step={step}
              index={index}
              totalSteps={value.length}
              ingredients={ingredients}
              recipeId={recipeId}
              fileInputRef={(el) => {
                fileInputRefs.current[index] = el;
              }}
              onUpdate={updateStep}
              onRemove={removeStep}
              onToggleIngredient={toggleIngredient}
              onDescriptionKeyDown={handleDescriptionKeyDown}
              onImageUpload={handleImageUpload}
              t={t}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" className="w-full gap-2" onClick={addStep}>
        <Plus className="h-4 w-4" />
        {t("addStep")}
      </Button>
    </div>
  );
}
