import { renderHook, act } from "@testing-library/react";
import { useUnitPreference } from "./useUnitPreference";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(
    (key) => mockStorage[key] ?? null
  );
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(
    (key, value) => { mockStorage[key] = value; }
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useUnitPreference", () => {
  it("defaults to imperial", () => {
    const { result } = renderHook(() => useUnitPreference());
    expect(result.current.units.id).toBe("imperial");
  });

  it("reads saved preference from localStorage", () => {
    mockStorage["prospero-units"] = "metric";
    const { result } = renderHook(() => useUnitPreference());
    expect(result.current.units.id).toBe("metric");
  });

  it("updates units and persists to localStorage", () => {
    const { result } = renderHook(() => useUnitPreference());

    act(() => {
      result.current.setUnits(
        expect.objectContaining ? result.current.units : result.current.units
      );
    });

    // Use the actual getUnitStrategy to get the metric strategy
    const { getUnitStrategy } = require("@/lib/units");
    act(() => {
      result.current.setUnits(getUnitStrategy("metric"));
    });

    expect(result.current.units.id).toBe("metric");
    expect(mockStorage["prospero-units"]).toBe("metric");
  });

  it("ignores invalid localStorage values", () => {
    mockStorage["prospero-units"] = "bogus";
    const { result } = renderHook(() => useUnitPreference());
    expect(result.current.units.id).toBe("imperial");
  });
});
