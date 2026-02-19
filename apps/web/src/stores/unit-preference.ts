// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/stores/unit-preference.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UnitSystem = "metric" | "imperial";

interface UnitPreferenceState {
  system: UnitSystem;
  toggle: () => void;
  set: (system: UnitSystem) => void;
}

export const useUnitPreference = create<UnitPreferenceState>()(
  persist(
    (set) => ({
      system: "metric",
      toggle: () =>
        set((state) => ({
          system: state.system === "metric" ? "imperial" : "metric",
        })),
      set: (system) => set({ system }),
    }),
    { name: "matdam-unit-preference" }
  )
);
