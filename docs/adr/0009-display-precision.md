# ADR 0009: Per-Metric Display Precision Rules

## Status

Accepted

## Date

2026-04-11

## Context

Weather values from the Tempest API arrive with arbitrary decimal precision. Displaying raw values (e.g., temperature `22.567°`) looks noisy and unprofessional. Different metrics warrant different precision — temperature needs one decimal for meaningful resolution, humidity is fine as an integer, UV index benefits from two decimals.

## Decision

All displayed weather values pass through `formatValue(kind, value)` from `src/lib/format.ts`. The function applies per-metric precision via `toFixed()`:

| Metric Kind | Precision | Examples |
|-------------|-----------|---------|
| `temperature`, `dew_point`, `feels_like` | 1 decimal | 22.5, -3.2 |
| `wind` (avg, gust, lull) | 1 decimal | 3.6, 12.3 |
| `pressure` | 1 decimal | 1013.3, 29.9 |
| `humidity`, `brightness`, `lightning`, `distance` | Integer | 65, 50124, 3, 15 |
| `uv` | 2 decimals | 6.79, 3.00 |
| `rain` | 2 decimals | 0.46, 2.50 |

Null/undefined values return `"--"`.

Chart Y-axes and tooltips use a `precision` prop that mirrors these rules.

## Consequences

- No component should display a raw number via `String(value)` or template literal — always use `formatValue`.
- The `MetricKind` type is the single source of truth for which metrics exist.
- Adding a new metric requires adding it to the `MetricKind` union and `PRECISION` record.
- `formatValue` returns a string, not a number — it is a display-layer function.
