// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/recipe-form.tsx

"use client";

import { useRef, useMemo, useState, useEffect } from "react";
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
import { StepEditor, makeStep, type StepEntry } from "@/components/recipe/step-editor";
import { UnitToggle } from "@/components/recipe/unit-toggle";
import { createClient } from "@/lib/supabase/client";
import { uploadRecipeImage, relocateTempStepImages } from "@/lib/supabase/storage";
import { createRecipeFormSchema, type RecipeFormValues } from "@/lib/validators/recipe";
import { SELECTED_STYLE, toggleItem } from "@/lib/user/preference-constants";
import { ImageIcon, X } from "lucide-react";
import posthog from "posthog-js";
import { lintRecipe, type LintResult } from "@/lib/recipe/recipe-linter";
import { ensureLocaleObject, detectLocale } from "@/lib/recipe/localized-text";
import { slugify } from "transliteration";

/** 재료 인덱스 → step_number 매핑 빌더 */
function buildIngredientStepMap(steps: { ingredient_indices: number[] }[]): Map<number, number> {
  const map = new Map<number, number>();
  steps.forEach((step, stepIdx) => {
    for (const ingIdx of step.ingredient_indices) {
      if (!map.has(ingIdx)) {
        map.set(ingIdx, stepIdx + 1);
      }
    }
  });
  return map;
}

function generateSlug(title: string): string {
  const base = slugify(title, { lowercase: true, separator: "-", trim: true });
  const suffix = crypto.randomUUID().slice(0, 8);
  return base ? `${base}-${suffix}` : suffix;
}

export type RecipeFormMode = "create" | "edit" | "remix";

export interface RecipeFormInitialData extends RecipeFormValues {
  recipeId?: string;
  slug?: string;
  heroImageUrl: string | null;
  rawTitle: Record<string, string>;
  rawDescription: Record<string, string> | null;
  rawSteps?: Array<{ description: Record<string, string>; tip: Record<string, string> | null }>;
  rawIngredients?: Array<{
    custom_name: Record<string, string> | null;
    note: Record<string, string> | null;
    qualifier: Record<string, string> | null;
  }>;
  parentRecipeId?: string;
  rootRecipeId?: string;
  published?: boolean;
  mode: RecipeFormMode;
  dietaryTags?: string[];
}

interface RecipeFormProps {
  initialData?: RecipeFormInitialData;
}

export function RecipeForm({ initialData }: RecipeFormProps = {}) {
  const t = useTranslations("recipe");
  const tv = useTranslations("validation");
  const locale = useLocale();
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const recipeFormSchema = useMemo(() => createRecipeFormSchema((key) => tv(key)), [tv]);

  const mode: RecipeFormMode = initialData?.mode ?? "create";
  const isEditMode = mode === "edit";
  const isRemixMode = mode === "remix";

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(initialData?.heroImageUrl ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dietaryTags, setDietaryTags] = useState<string[]>(initialData?.dietaryTags ?? []);
  const [lintResults, setLintResults] = useState<LintResult[]>([]);

  const publishRef = useRef(initialData?.published ?? true);

  // Blob URL leak 방지: unmount 시 revoke
  useEffect(() => {
    return () => {
      if (heroPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(heroPreview);
      }
    };
  }, [heroPreview]);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? "",
          difficulty_level: initialData.difficulty_level,
          servings: initialData.servings,
          prep_time_minutes: initialData.prep_time_minutes,
          cook_time_minutes: initialData.cook_time_minutes,
          ingredients: initialData.ingredients,
          steps: initialData.steps,
        }
      : {
          title: "",
          description: "",
          difficulty_level: "beginner",
          servings: 2,
          prep_time_minutes: undefined,
          cook_time_minutes: undefined,
          ingredients: [],
          steps: [makeStep()],
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
      if (heroPreview.startsWith("blob:")) {
        URL.revokeObjectURL(heroPreview);
      }
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

  function runLint(data: RecipeFormValues): LintResult[] {
    const results = lintRecipe(data.ingredients, data.steps);
    setLintResults(results);
    return results;
  }

  async function onSubmit(data: RecipeFormValues) {
    const results = runLint(data);
    const hasErrors = results.some((r) => r.severity === "error");
    if (hasErrors) return;

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

      if (isEditMode) {
        await handleUpdate(data, user.id, published);
      } else {
        await handleCreate(data, user.id, published, {
          parentRecipeId: initialData?.parentRecipeId,
          rootRecipeId: initialData?.rootRecipeId,
        });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreate(
    data: RecipeFormValues,
    userId: string,
    published: boolean,
    remix?: { parentRecipeId?: string; rootRecipeId?: string }
  ) {
    const slug = generateSlug(data.title);

    const { data: recipeRow, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        slug,
        title: { [detectLocale(data.title)]: data.title },
        description: data.description
          ? { [detectLocale(data.description)]: data.description }
          : null,
        author_id: userId,
        difficulty_level: data.difficulty_level,
        servings: data.servings,
        prep_time_minutes: data.prep_time_minutes ?? null,
        cook_time_minutes: data.cook_time_minutes ?? null,
        hero_image_url: null,
        published,
        dietary_tags: dietaryTags,
        parent_recipe_id: remix?.parentRecipeId ?? null,
        root_recipe_id: remix?.rootRecipeId ?? null,
      })
      .select("recipe_id")
      .single();

    if (recipeError || !recipeRow) {
      throw new Error(recipeError?.message ?? "Failed to create recipe");
    }

    const recipeId: string = recipeRow.recipe_id;

    try {
      if (heroFile) {
        const heroUrl = await uploadRecipeImage(heroFile, recipeId, "hero");
        if (heroUrl) {
          await supabase
            .from("recipes")
            .update({ hero_image_url: heroUrl })
            .eq("recipe_id", recipeId);
        }
      }

      await insertStepsAndIngredients(data, recipeId);

      // Relocate temp step images to permanent {recipeId}/ path
      // NOTE: insertSteps → relocation 사이 짧은 윈도우 동안 DB에 temp URL이 남음.
      //       relocation 실패 시에도 temp URL이 유효하므로 데이터 손실 없음.
      try {
        const relocated = await relocateTempStepImages(data.steps, recipeId);
        for (const { stepIndex, newUrl } of relocated) {
          await supabase
            .from("recipe_steps")
            .update({ image_url: newUrl })
            .eq("recipe_id", recipeId)
            .eq("step_order", stepIndex + 1);
        }
      } catch {
        // relocation failure is non-critical; temp URLs still work
      }
    } catch (innerErr) {
      await supabase.from("recipes").delete().eq("recipe_id", recipeId);
      throw innerErr;
    }

    const eventName = remix?.parentRecipeId ? "recipe_remixed" : "recipe_created";
    posthog.capture(eventName, {
      recipe_id: recipeId,
      slug,
      published,
      ...(remix?.parentRecipeId && { parent_recipe_id: remix.parentRecipeId }),
    });

    // Fire-and-forget: AI 자동번역
    fetch("/api/translate-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId }),
    }).catch(() => {});

    if (published) {
      router.push(`/${locale}/recipe/${slug}`);
    } else {
      router.push(`/${locale}/profile`);
    }
  }

  async function handleUpdate(data: RecipeFormValues, userId: string, published: boolean) {
    if (!initialData?.recipeId || !initialData?.slug) {
      return; // should never happen in edit mode
    }
    const recipeId = initialData.recipeId;
    const slug = initialData.slug;

    // UPDATE recipe row (slug 유지, author_id 검증 포함)
    let heroImageUrl = initialData.heroImageUrl;

    if (heroFile) {
      const newUrl = await uploadRecipeImage(heroFile, recipeId, "hero");
      if (newUrl) heroImageUrl = newUrl;
    } else if (!heroPreview) {
      // 사용자가 이미지를 제거한 경우
      heroImageUrl = null;
    }

    // 기존 로케일 데이터를 보존하면서 현재 로케일만 업데이트
    const mergedTitle = { ...initialData.rawTitle, [detectLocale(data.title)]: data.title };
    const mergedDescription = data.description
      ? {
          ...(initialData.rawDescription ?? {}),
          [detectLocale(data.description)]: data.description,
        }
      : initialData.rawDescription;

    const { error: recipeError } = await supabase
      .from("recipes")
      .update({
        title: mergedTitle,
        description: mergedDescription,
        difficulty_level: data.difficulty_level,
        servings: data.servings,
        prep_time_minutes: data.prep_time_minutes ?? null,
        cook_time_minutes: data.cook_time_minutes ?? null,
        hero_image_url: heroImageUrl,
        published,
        dietary_tags: dietaryTags,
        translated_locales: {},
      })
      .eq("recipe_id", recipeId)
      .eq("author_id", userId);

    if (recipeError) {
      throw new Error(recipeError.message);
    }

    // 단일 트랜잭션 RPC로 DELETE→INSERT 원자적 처리
    const ingredientStepMap = buildIngredientStepMap(data.steps);

    const stepsPayload = data.steps.map((step, i) => {
      const rawStep = initialData.rawSteps?.[i];
      return {
        step_order: i + 1,
        description: {
          ...ensureLocaleObject(rawStep?.description),
          [detectLocale(step.description)]: step.description,
        },
        timer_seconds: step.timer_seconds ?? null,
        image_url: step.image_url ?? null,
        tip: step.tip
          ? { ...ensureLocaleObject(rawStep?.tip), [detectLocale(step.tip)]: step.tip }
          : null,
      };
    });

    const ingredientsPayload = data.ingredients.map((ing: IngredientEntry, i: number) => {
      const rawIng = initialData.rawIngredients?.[i];
      return {
        ingredient_id: ing.ingredient_id || null,
        custom_name: ing.ingredient_id
          ? null
          : { ...ensureLocaleObject(rawIng?.custom_name), [detectLocale(ing.name)]: ing.name },
        amount: ing.amount ?? null,
        unit: ing.unit ?? null,
        qualifier: ing.qualifier
          ? {
              ...ensureLocaleObject(rawIng?.qualifier),
              [detectLocale(ing.qualifier)]: ing.qualifier,
            }
          : null,
        note: ing.note
          ? { ...ensureLocaleObject(rawIng?.note), [detectLocale(ing.note)]: ing.note }
          : null,
        step_number: ingredientStepMap.get(i) ?? null,
        display_order: i + 1,
      };
    });

    const { error: upsertError } = await supabase.rpc("upsert_recipe_details", {
      p_recipe_id: recipeId,
      p_steps: stepsPayload,
      p_ingredients: ingredientsPayload,
    });
    if (upsertError) throw new Error(upsertError.message);

    // 캐시 우회를 위해 하드 네비게이션
    if (published) {
      window.location.href = `/${locale}/recipe/${slug}`;
    } else {
      window.location.href = `/${locale}/profile`;
    }
  }

  async function insertStepsAndIngredients(data: RecipeFormValues, recipeId: string) {
    if (data.steps.length > 0) {
      const stepsPayload = data.steps.map((step, i) => ({
        recipe_id: recipeId,
        step_order: i + 1,
        description: { [detectLocale(step.description)]: step.description },
        timer_seconds: step.timer_seconds,
        image_url: step.image_url,
        tip: step.tip ? { [detectLocale(step.tip)]: step.tip } : null,
      }));

      const { error: stepsError } = await supabase.from("recipe_steps").insert(stepsPayload);
      if (stepsError) {
        throw new Error(stepsError.message);
      }
    }

    const ingredientStepMap = buildIngredientStepMap(data.steps);

    if (data.ingredients.length > 0) {
      const ingredientsPayload = data.ingredients.map((ing: IngredientEntry, i: number) => ({
        recipe_id: recipeId,
        ingredient_id: ing.ingredient_id || null,
        custom_name: ing.ingredient_id ? null : { [detectLocale(ing.name)]: ing.name },
        amount: ing.amount,
        unit: ing.unit,
        qualifier: ing.qualifier ? { [detectLocale(ing.qualifier)]: ing.qualifier } : null,
        note: ing.note ? { [detectLocale(ing.note)]: ing.note } : null,
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
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-6 sm:space-y-8 px-4 py-8"
    >
      <h1 className="text-2xl font-bold">
        {isEditMode ? t("editTitle") : isRemixMode ? t("remixTitle") : t("createTitle")}
      </h1>

      {/* Hero image */}
      <div className="space-y-2">
        <Label>{t("heroImage")}</Label>
        {heroPreview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPreview}
              alt={t("heroImagePreview")}
              className="h-36 sm:h-48 w-full rounded-lg object-cover"
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

      {/* Dietary Tags */}
      <div className="space-y-2">
        <Label>{t("dietaryTagsLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "vegan",
              "vegetarian",
              "pescatarian",
              "gluten_free",
              "dairy_free",
              "nut_free",
              "halal",
              "low_calorie",
              "diabetic_friendly",
              "low_sodium",
            ] as const
          ).map((tag) => {
            const isActive = dietaryTags.includes(tag);
            const labelMap: Record<string, string> = {
              vegan: t("dietaryVegan"),
              vegetarian: t("dietaryVegetarian"),
              pescatarian: t("dietaryPescatarian"),
              gluten_free: t("dietaryGlutenFree"),
              dairy_free: t("dietaryDairyFree"),
              nut_free: t("dietaryNutFree"),
              halal: t("dietaryHalal"),
              low_calorie: t("dietaryLowCalorie"),
              diabetic_friendly: t("dietaryDiabeticFriendly"),
              low_sodium: t("dietaryLowSodium"),
            };
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setDietaryTags(toggleItem(dietaryTags, tag))}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${isActive ? SELECTED_STYLE : "border-input bg-background hover:bg-muted"}`}
              >
                {labelMap[tag]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Servings / Prep / Cook */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              recipeId={initialData?.recipeId}
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

      {/* Lint results banner */}
      {lintResults.length > 0 &&
        (() => {
          const hasErrors = lintResults.some((r) => r.severity === "error");
          return (
            <div
              className={`space-y-1 rounded-md border px-3 py-2 text-sm ${
                hasErrors
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-yellow-400/50 bg-yellow-50 dark:bg-yellow-950/30"
              }`}
            >
              <p className="font-medium">{t("lintWarnings")}</p>
              <ul className="space-y-0.5">
                {lintResults.map((result, i) => (
                  <li
                    key={i}
                    className={
                      result.severity === "error"
                        ? "text-destructive"
                        : "text-yellow-700 dark:text-yellow-400"
                    }
                  >
                    {t(result.messageKey as Parameters<typeof t>[0], result.params)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

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
          {isSubmitting
            ? isEditMode
              ? t("updating")
              : isRemixMode
                ? t("publishingRemix")
                : t("submitting")
            : isEditMode
              ? t("update")
              : isRemixMode
                ? t("publishRemix")
                : t("submit")}
        </Button>
      </div>
    </form>
  );
}
