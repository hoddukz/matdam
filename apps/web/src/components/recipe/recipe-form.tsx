// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/recipe-form.tsx

"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IngredientInput, type IngredientEntry } from "@/components/recipe/ingredient-input";
import { StepEditor, type StepEntry } from "@/components/recipe/step-editor";
import { UnitToggle } from "@/components/recipe/unit-toggle";
import { createClient } from "@/lib/supabase/client";
import { uploadRecipeImage } from "@/lib/supabase/storage";
import { createRecipeFormSchema, type RecipeFormValues } from "@/lib/validators/recipe";
import { ImageIcon, X } from "lucide-react";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export function RecipeForm() {
  const t = useTranslations("recipe");
  const tv = useTranslations("validation");
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const recipeFormSchema = useMemo(() => createRecipeFormSchema((key) => tv(key)), [tv]);

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const publishRef = useRef(true);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty_level: "beginner",
      servings: 2,
      prep_time_minutes: undefined,
      cook_time_minutes: undefined,
      ingredients: [],
      steps: [
        {
          description: "",
          timer_seconds: null,
          image_url: null,
          tip: null,
          ingredient_indices: [],
        },
      ],
    },
  });

  const watchedIngredients = useWatch({ control, name: "ingredients" }) as IngredientEntry[];

  function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function clearHero() {
    setHeroFile(null);
    if (heroPreview) {
      URL.revokeObjectURL(heroPreview);
      setHeroPreview(null);
    }
  }

  function cleanTrailingEmptySteps() {
    const steps = getValues("steps");
    const cleaned = steps.filter((s) => s.description.trim().length > 0);
    if (cleaned.length === 0) return;
    if (cleaned.length !== steps.length) {
      setValue("steps", cleaned);
    }
  }

  async function onSubmit(data: RecipeFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    const published = publishRef.current;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsSubmitting(false);
        router.push("/login");
        return;
      }

      const slug = generateSlug(data.title);

      // INSERT recipe row
      const { data: recipeRow, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          slug,
          title: { [locale]: data.title },
          description: data.description ? { [locale]: data.description } : null,
          author_id: user.id,
          difficulty_level: data.difficulty_level,
          servings: data.servings,
          prep_time_minutes: data.prep_time_minutes ?? null,
          cook_time_minutes: data.cook_time_minutes ?? null,
          hero_image_url: null,
          published,
          dietary_tags: [],
        })
        .select("recipe_id")
        .single();

      if (recipeError || !recipeRow) {
        throw new Error(recipeError?.message ?? "Failed to create recipe");
      }

      const recipeId: string = recipeRow.recipe_id;

      try {
        // Upload hero image if provided
        if (heroFile) {
          const heroUrl = await uploadRecipeImage(heroFile, recipeId, "hero");
          if (heroUrl) {
            await supabase
              .from("recipes")
              .update({ hero_image_url: heroUrl })
              .eq("recipe_id", recipeId);
          }
        }

        // INSERT recipe_steps
        if (data.steps.length > 0) {
          const stepsPayload = data.steps.map((step: StepEntry, i: number) => ({
            recipe_id: recipeId,
            step_order: i + 1,
            description: step.description,
            timer_seconds: step.timer_seconds,
            image_url: step.image_url,
            tip: step.tip,
          }));

          const { error: stepsError } = await supabase.from("recipe_steps").insert(stepsPayload);
          if (stepsError) {
            throw new Error(stepsError.message);
          }
        }

        // Build step_number map from step ingredient_indices
        const ingredientStepMap = new Map<number, number>();
        data.steps.forEach((step: StepEntry, stepIdx: number) => {
          for (const ingIdx of step.ingredient_indices) {
            if (!ingredientStepMap.has(ingIdx)) {
              ingredientStepMap.set(ingIdx, stepIdx + 1);
            }
          }
        });

        // INSERT recipe_ingredients
        if (data.ingredients.length > 0) {
          const ingredientsPayload = data.ingredients.map((ing: IngredientEntry, i: number) => ({
            recipe_id: recipeId,
            ingredient_id: ing.ingredient_id || null,
            custom_name: ing.ingredient_id ? null : ing.name,
            amount: ing.amount,
            unit: ing.unit,
            qualifier: ing.qualifier,
            note: ing.note,
            step_number: ingredientStepMap.get(i) ?? null,
            display_order: i + 1,
          }));

          const { error: ingError } = await supabase
            .from("recipe_ingredients")
            .insert(ingredientsPayload);

          if (ingError) {
            throw new Error(ingError.message);
          }
        }
      } catch (innerErr) {
        // 고아 레코드 방지: steps/ingredients 실패 시 recipe 삭제
        await supabase.from("recipes").delete().eq("recipe_id", recipeId);
        throw innerErr;
      }

      if (published) {
        router.push(`/${locale}/recipe/${slug}`);
      } else {
        router.push(`/${locale}/explore`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">{t("createTitle")}</h1>

      {/* Hero image */}
      <div className="space-y-2">
        <Label>{t("heroImage")}</Label>
        {heroPreview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPreview}
              alt={t("heroImagePreview")}
              className="h-48 w-full rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7 bg-background/80"
              onClick={clearHero}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input text-sm text-muted-foreground hover:border-ring hover:text-foreground transition-colors">
            <ImageIcon className="h-8 w-8" />
            {t("heroImagePlaceholder")}
            <input type="file" accept="image/*" className="hidden" onChange={handleHeroChange} />
          </label>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t("titleLabel")}</Label>
        <Input id="title" {...register("title")} placeholder={t("titlePlaceholder")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t("descriptionLabel")}</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder={t("descriptionPlaceholder")}
          className="resize-none"
          rows={3}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>{t("difficultyLabel")}</Label>
        <Controller
          control={control}
          name="difficulty_level"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{t("difficultyBeginner")}</SelectItem>
                <SelectItem value="intermediate">{t("difficultyIntermediate")}</SelectItem>
                <SelectItem value="master">{t("difficultyMaster")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Servings / Prep / Cook */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servings">{t("servingsLabel")}</Label>
          <Input
            id="servings"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            {...register("servings", { valueAsNumber: true })}
          />
          {errors.servings && <p className="text-xs text-destructive">{errors.servings.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prep_time_minutes">{t("prepTimeLabel")}</Label>
          <Input
            id="prep_time_minutes"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            {...register("prep_time_minutes", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
          {errors.prep_time_minutes && (
            <p className="text-xs text-destructive">{errors.prep_time_minutes.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cook_time_minutes">{t("cookTimeLabel")}</Label>
          <Input
            id="cook_time_minutes"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            {...register("cook_time_minutes", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
          {errors.cook_time_minutes && (
            <p className="text-xs text-destructive">{errors.cook_time_minutes.message}</p>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t("ingredientsLabel")}</Label>
          <UnitToggle />
        </div>
        <Controller
          control={control}
          name="ingredients"
          render={({ field }) => <IngredientInput value={field.value} onChange={field.onChange} />}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <Label>{t("stepsLabel")}</Label>
        <Controller
          control={control}
          name="steps"
          render={({ field }) => (
            <StepEditor
              value={field.value as StepEntry[]}
              onChange={field.onChange}
              ingredients={watchedIngredients}
            />
          )}
        />
        {errors.steps &&
          (Array.isArray(errors.steps)
            ? errors.steps.map(
                (stepError, i) =>
                  stepError?.description && (
                    <p key={i} className="text-xs text-destructive">
                      Step {i + 1}: {stepError.description.message}
                    </p>
                  )
              )
            : errors.steps.message && (
                <p className="text-xs text-destructive">{errors.steps.message}</p>
              ))}
      </div>

      {/* Submit error */}
      {submitError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
          onClick={() => {
            publishRef.current = false;
            cleanTrailingEmptySteps();
            void handleSubmit(onSubmit)();
          }}
        >
          {t("saveDraft")}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
          onClick={() => {
            publishRef.current = true;
            cleanTrailingEmptySteps();
          }}
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
