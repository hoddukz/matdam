// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/stores/unit-preference.ts

import { create } from "zustand";

export type UnitSystem = "metric" | "imperial";

interface UnitPreferenceState {
  system: UnitSystem;
  toggle: () => void;
  set: (system: UnitSystem) => void;
}

export const useUnitPreference = create<UnitPreferenceState>((set) => ({
  system: "metric",
  toggle: () =>
    set((state) => ({
      system: state.system === "metric" ? "imperial" : "metric",
    })),
  set: (system) => set({ system }),
}));
