// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/packages/types/src/ingredient.ts

export interface Ingredient {
  id: string; // e.g. "ing_gochujang_001"
  names: Record<string, string>; // { ko: "고추장", en: "Gochujang", ... }
  category: string;
  common_units: string[]; // ["tbsp", "tsp", "g", "cup"]
  default_unit: string;
  is_commodity: boolean;
  dietary_flags: string[]; // ["vegan", "gluten_free", ...]
  substitutes: string[]; // other ingredient IDs
  affiliate_links: Record<string, AffiliateLink>;
}

export interface AffiliateLink {
  url: string;
  product_name: string;
}

export interface Unit {
  unit_id: string; // e.g. "tbsp"
  names: Record<string, string[]>; // { ko: ["큰술", "T"], en: ["tbsp", "tablespoon"], ... }
  ml_equivalent: number;
}

export interface RecipeIngredient {
  ingredient_id: string | null; // null for custom ingredients
  amount: number | null; // null = 비정형 수량
  unit: string | null; // unit_id, null = 비정형
  qualifier: string | null; // "to_taste", "pinch", "handful", etc.
  note: string | null;
}
