"use client";

import { useState } from "react";
import {
  getUnitStrategy,
  type UnitStrategy,
  type UnitSystemId,
} from "@/lib/units";

const STORAGE_KEY = "prospero-units";
const DEFAULT_SYSTEM: UnitSystemId = "imperial";
const VALID_IDS: UnitSystemId[] = ["metric", "imperial"];

function loadPreference(): UnitStrategy {
  if (typeof window === "undefined") return getUnitStrategy(DEFAULT_SYSTEM);
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && VALID_IDS.includes(saved as UnitSystemId)) {
    return getUnitStrategy(saved as UnitSystemId);
  }
  return getUnitStrategy(DEFAULT_SYSTEM);
}

export function useUnitPreference() {
  const [units, setUnitsState] = useState<UnitStrategy>(loadPreference);

  const setUnits = (strategy: UnitStrategy) => {
    setUnitsState(strategy);
    localStorage.setItem(STORAGE_KEY, strategy.id);
  };

  return { units, setUnits };
}
