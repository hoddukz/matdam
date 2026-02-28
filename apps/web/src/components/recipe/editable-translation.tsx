// Tag: core
// Path: apps/web/src/components/recipe/editable-translation.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Check, X } from "lucide-react";

interface EditableTranslationProps {
  value: string;
  recipeId: string;
  table: "recipes" | "recipe_steps" | "recipe_ingredients";
  rowId: string;
  field: string;
  locale: string;
  canEdit: boolean;
  multiline?: boolean;
  className?: string;
}

export function EditableTranslation({
  value,
  recipeId,
  table,
  rowId,
  field,
  locale,
  canEdit,
  multiline = false,
  className = "",
}: EditableTranslationProps) {
  const t = useTranslations("recipeDetail");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  async function handleSave() {
    if (editValue === displayValue) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    setSaveError(false);
    try {
      const res = await fetch("/api/recipe-translation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, table, rowId, field, locale, value: editValue }),
      });
      if (!res.ok) throw new Error("save failed");
      setDisplayValue(editValue);
      setIsEditing(false);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setEditValue(displayValue);
    setIsEditing(false);
    setSaveError(false);
  }

  if (!canEdit) {
    return <span className={className}>{displayValue}</span>;
  }

  if (isEditing) {
    return (
      <span className={`inline-flex flex-col gap-1 ${className}`}>
        <span className="inline-flex items-start gap-1">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-h-[3rem] rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
              disabled={isSaving}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={isSaving}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="shrink-0 rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50"
            title={t("saveTranslation")}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
            title={t("cancelEdit")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
        {saveError && <span className="text-xs text-destructive">{t("translateError")}</span>}
      </span>
    );
  }

  return (
    <span className={`group/edit relative inline ${className}`}>
      <span>{displayValue}</span>
      <button
        type="button"
        onClick={() => {
          setEditValue(displayValue);
          setSaveError(false);
          setIsEditing(true);
        }}
        className="absolute -right-4 top-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/edit:opacity-100 hover:text-foreground"
        title={t("editTranslation")}
      >
        <Pencil className="h-3 w-3" />
      </button>
    </span>
  );
}
