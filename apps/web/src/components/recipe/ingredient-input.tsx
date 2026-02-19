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
import { X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUnitPreference } from "@/stores/unit-preference";
import { convertVolume, convertWeight } from "@matdam/utils";

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

const metricToImperial: Record<string, string> = {
  ml: "fl_oz",
  l: "fl_oz",
  g: "oz",
  kg: "lb",
};

const imperialToMetric: Record<string, string> = {
  fl_oz: "ml",
  oz: "g",
  lb: "kg",
};

const volumeUnits = new Set(["tsp", "tbsp", "cup", "ml", "l", "fl_oz"]);
const weightUnits = new Set(["g", "kg", "oz", "lb"]);

function convertAmount(amount: number, fromUnit: string, toUnit: string): number | null {
  if (volumeUnits.has(fromUnit) && volumeUnits.has(toUnit)) {
    return convertVolume(amount, fromUnit, toUnit);
  }
  if (weightUnits.has(fromUnit) && weightUnits.has(toUnit)) {
    return convertWeight(amount, fromUnit, toUnit);
  }
  return null;
}

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
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  // --- Search ---

  const searchIngredients = useCallback(
    async (term: string) => {
      if (term.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      // 이전 요청 취소
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsSearching(true);
      const { data, error } = await supabaseRef.current.rpc("search_ingredients", {
        search_term: term,
        locale,
        result_limit: 8,
      });

      // 취소된 요청이면 무시
      if (controller.signal.aborted) return;

      if (!error && data) {
        setResults(data as IngredientResult[]);
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
      note: null,
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
    setResults([]);
    setShowDropdown(false);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
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

  // --- Display helpers ---

  function displayAmount(entry: IngredientEntry): string {
    if (entry.amount == null || entry.unit == null) {
      return entry.qualifier || "";
    }

    const currentUnit = entry.unit;
    let displayAmt = entry.amount;
    let displayUnit = currentUnit;

    if (system === "imperial" && metricToImperial[currentUnit]) {
      const targetUnit = metricToImperial[currentUnit];
      const converted = convertAmount(entry.amount, currentUnit, targetUnit);
      if (converted != null) {
        displayAmt = converted;
        displayUnit = targetUnit;
      }
    } else if (system === "metric" && imperialToMetric[currentUnit]) {
      const targetUnit = imperialToMetric[currentUnit];
      const converted = convertAmount(entry.amount, currentUnit, targetUnit);
      if (converted != null) {
        displayAmt = converted;
        displayUnit = targetUnit;
      }
    }

    const rounded = Math.round(displayAmt * 100) / 100;
    return `${rounded} ${displayUnit}`;
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
                <span className="text-muted-foreground">{displayAmount(entry)}</span>
              )}
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
      <div className="flex items-center gap-2" onKeyDown={handleKeyDown}>
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
            <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => handleSelectIngredient(item)}
                >
                  <span className="font-medium">{item.names[locale] || item.names["en"]}</span>
                  {locale !== "en" && item.names["en"] && (
                    <span className="text-muted-foreground text-xs">{item.names["en"]}</span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{item.category}</span>
                </button>
              ))}
              {/* Custom ingredient option */}
              {searchTerm.length >= 2 && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm border-t px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={handleSelectCustom}
                >
                  <Plus className="h-3 w-3 text-muted-foreground" />
                  <span>{t("addCustom", { name: searchTerm })}</span>
                </button>
              )}
            </div>
          )}
          {isSearching && searchTerm.length >= 2 && (
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
            className="w-20"
            min={0}
            step="any"
          />
        )}

        {/* Step 3: Unit */}
        {step !== "search" && canAdd && (
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="w-24">
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
    </div>
  );
}
