# ADR 0008: Strategy Pattern for Unit Conversions

## Status

Accepted

## Date

2026-04-11

## Context

The dashboard displays weather data in both metric (°C, m/s, mb, mm) and imperial (°F, mph, inHg, in) units. The user toggles between them via a button in the header, persisted to localStorage.

The initial implementation used bare conversion functions (`convertTemp(value, "imperial")`) and a `UnitSystem` string type. This scattered `if (system === "imperial")` logic across components and made it possible to pass invalid strings.

## Decision

We use the **Strategy pattern** for unit conversions:

- `UnitStrategy` interface defines `temp()`, `wind()`, `pressure()`, `rain()`, `labels`, and `id`
- `MetricUnitStrategy` — identity conversions (API data is already metric)
- `ImperialUnitStrategy` — converts C→F, m/s→mph, mb→inHg, mm→in
- `getUnitStrategy(id)` factory for lookup by `UnitSystemId`
- Components receive a `UnitStrategy` object as a prop, never a raw string

### Why this works better

- **Type safety** — impossible to pass an invalid unit system to a component
- **Single Responsibility** — each strategy class owns its conversions and labels
- **Open/Closed** — adding a third system (e.g., nautical) means adding one class, no changes to existing components
- **No conditional branching** — components call `units.temp(value)` regardless of which system is active

## Consequences

- Metric is the canonical internal representation. All API data stays in metric until the display layer.
- `MetricUnitStrategy` methods are identity functions — this is intentional, not dead code.
- `UnitToggle` emits a `UnitStrategy` object, not a string id.
- `useUnitPreference` hook manages state + localStorage, returns `{ units, setUnits }`.
