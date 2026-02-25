// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/components/recipe/ingredient-input.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUnitPreference } from "@/stores/unit-preference";
import { formatAmount } from "@/lib/recipe/unit-display";

// --- Types ---

interface IngredientResult {
  id: string;
  names: Record<string, string>;
  category: string;
  common_units: string[];
  default_unit: string;
  dietary_flags: string[];
}

export interface IngredientEntry {
  ingredient_id: string | null;
  name: string;
  amount: number | null;
  unit: string | null;
  qualifier: string | null;
  note: string | null;
}

interface IngredientInputProps {
  value: IngredientEntry[];
  onChange: (entries: IngredientEntry[]) => void;
}

// --- Constants ---

const CUSTOM_UNITS = ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "piece", "whole"];

// --- Component ---

export function IngredientInput({ value, onChange }: IngredientInputProps) {
  const t = useTranslations("ingredient");
  const locale = useLocale();
  const { system } = useUnitPreference();

  const [step, setStep] = useState<"search" | "amount" | "unit">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<IngredientResult[]>([]);
  const [selected, setSelected] = useState<IngredientResult | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestionPage, setSuggestionPage] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  // --- Search ---

  const searchIngredients = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < 1) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsSearching(true);
      const { data, error } = await supabaseRef.current.rpc("search_ingredients", {
        search_term: trimmed,
        locale,
        result_limit: 36,
      });

      if (controller.signal.aborted) return;

      if (!error && data) {
        setResults(data as IngredientResult[]);
        setSuggestionPage(0);
        setShowDropdown(true);
      }
      setIsSearching(false);
    },
    [locale]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchIngredients(searchTerm);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, searchIngredients]);

  // --- Handlers ---

  function handleSelectIngredient(ingredient: IngredientResult) {
    setSelected(ingredient);
    setIsCustom(false);
    setSearchTerm(ingredient.names[locale] || ingredient.names["en"] || ingredient.id);
    setUnit(ingredient.default_unit);
    setShowDropdown(false);
    setStep("amount");
    setTimeout(() => amountInputRef.current?.focus(), 50);
  }

  function handleSelectCustom() {
    setIsCustom(true);
    setSelected(null);
    setCustomName(searchTerm);
    setUnit("g");
    setShowDropdown(false);
    setStep("amount");
    setTimeout(() => amountInputRef.current?.focus(), 50);
  }

  function handleAddIngredient() {
    if (!selected && !isCustom) return;

    const entry: IngredientEntry = {
      ingredient_id: isCustom ? null : selected!.id,
      name: isCustom
        ? customName
        : selected!.names[locale] || selected!.names["en"] || selected!.id,
      amount: amount ? parseFloat(amount) : null,
      unit: unit || null,
      qualifier: null,
      note: note.trim() || null,
    };

    onChange([...value, entry]);
    resetForm();
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function resetForm() {
    setStep("search");
    setSearchTerm("");
    setSelected(null);
    setIsCustom(false);
    setCustomName("");
    setAmount("");
    setUnit("");
    setNote("");
    setResults([]);
    setShowDropdown(false);
    setSuggestionPage(0);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  // 페이지네이션 계산
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const pageResults = results.slice(
    suggestionPage * ITEMS_PER_PAGE,
    (suggestionPage + 1) * ITEMS_PER_PAGE
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    // 드롭다운이 열려있을 때: 숫자키로 선택, 화살표로 페이지 이동
    if (showDropdown && step === "search") {
      // 숫자 1~9 → 해당 번호 재료 선택
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && num <= pageResults.length) {
        e.preventDefault();
        handleSelectIngredient(pageResults[num - 1]);
        return;
      }
      // 0 → 커스텀 직접 추가
      if (e.key === "0" && searchTerm.trim().length >= 1) {
        e.preventDefault();
        handleSelectCustom();
        return;
      }
      // ← → 페이지 이동
      if (e.key === "ArrowRight" && suggestionPage < totalPages - 1) {
        e.preventDefault();
        setSuggestionPage((p) => p + 1);
        return;
      }
      if (e.key === "ArrowLeft" && suggestionPage > 0) {
        e.preventDefault();
        setSuggestionPage((p) => p - 1);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (step === "amount" && (selected || isCustom)) {
        setStep("unit");
      } else if (step === "unit") {
        handleAddIngredient();
      }
    }
    if (e.key === "Escape") {
      resetForm();
    }
  }

  const activeUnits = isCustom ? CUSTOM_UNITS : (selected?.common_units ?? CUSTOM_UNITS);

  const canAdd = !!(selected || isCustom);

  return (
    <div className="space-y-3">
      {/* Added ingredients list */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((entry, i) => (
            <Badge key={i} variant="secondary" className="gap-1 py-1 pl-3 pr-1">
              <span>{entry.name}</span>
              {(entry.amount || entry.qualifier) && (
                <span className="text-muted-foreground">
                  {formatAmount(entry.amount, entry.unit, entry.qualifier, system)}
                </span>
              )}
              {entry.note && <span className="text-xs text-muted-foreground">({entry.note})</span>}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input form */}
      <div className="flex flex-wrap items-center gap-2" onKeyDown={handleKeyDown}>
        {/* Step 1: Search */}
        <div className="relative flex-1">
          <Input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selected || isCustom) {
                setSelected(null);
                setIsCustom(false);
                setStep("search");
              }
            }}
            placeholder={t("searchPlaceholder")}
            className="w-full"
            disabled={step !== "search" && canAdd}
          />
          {showDropdown && (
            <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
              {/* 번호 붙은 제안 목록 */}
              <div className="grid grid-cols-1 gap-0.5">
                {pageResults.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleSelectIngredient(item)}
                  >
                    <kbd className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-mono font-medium">
                      {idx + 1}
                    </kbd>
                    <span className="font-medium">{item.names[locale] || item.names["en"]}</span>
                    {locale !== "en" && item.names["en"] && (
                      <span className="text-muted-foreground text-xs">{item.names["en"]}</span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">{item.category}</span>
                  </button>
                ))}
              </div>

              {/* 커스텀 직접 추가 (0번) */}
              {searchTerm.trim().length >= 1 && (
                <button
                  type="button"
                  className="mt-1 flex w-full items-center gap-2 rounded-sm border-t px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={handleSelectCustom}
                >
                  <kbd className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-mono font-medium">
                    0
                  </kbd>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                  <span>{t("addCustom", { name: searchTerm.trim() })}</span>
                </button>
              )}

              {/* 페이지 네비게이션 */}
              {totalPages > 1 && (
                <div className="mt-1.5 flex items-center justify-between border-t pt-1.5 text-xs text-muted-foreground">
                  <button
                    type="button"
                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 hover:bg-accent disabled:opacity-30"
                    disabled={suggestionPage === 0}
                    onClick={() => setSuggestionPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-3 w-3" />
                    <kbd className="font-mono">&#8592;</kbd>
                  </button>
                  <span>
                    {suggestionPage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-0.5 rounded px-1.5 py-0.5 hover:bg-accent disabled:opacity-30"
                    disabled={suggestionPage >= totalPages - 1}
                    onClick={() => setSuggestionPage((p) => p + 1)}
                  >
                    <kbd className="font-mono">&#8594;</kbd>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
          {isSearching && searchTerm.trim().length >= 1 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </div>

        {/* Step 2: Amount */}
        {step !== "search" && (
          <Input
            ref={amountInputRef}
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t("amountPlaceholder")}
            className="w-16 sm:w-20"
            min={0}
            step="any"
          />
        )}

        {/* Step 3: Unit */}
        {step !== "search" && canAdd && (
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="w-20 sm:w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeUnits.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Add button */}
        {canAdd && (
          <Button type="button" size="icon" variant="outline" onClick={handleAddIngredient}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Note input (optional, shown during amount/unit step) */}
      {step !== "search" && canAdd && (
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("notePlaceholder")}
          className="w-full text-sm"
        />
      )}
    </div>
  );
}
