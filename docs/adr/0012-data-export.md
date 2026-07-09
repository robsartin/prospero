# 12. Data export via server endpoint + metric registry

Date: 2026-07-09

## Status

Accepted

## Context

Users need to download station data (starting with daily rainfall) as CSV or JSON
over an arbitrary date range, with more metrics to follow. Fetching raw per-minute
observations into the browser to aggregate there would pull hundreds of thousands of
rows client-side and fan out many parallel Tempest calls from the browser, conflicting
with the rule that all Tempest access goes through server `/api` routes (README rule 1).

## Decision

Add `GET /api/export`. The server reuses the existing chunk/fetch/transform/enrich
pipeline, then aggregates observations into per-day rows and returns a file
(`Content-Disposition: attachment`). Both formats are self-describing and carry
units: CSV puts units in the header row (`Rain (mm)`), and JSON is an object
`{ "columns": [{ "key", "header" }], "rows": [...] }` where `columns[].header`
carries the same unit-bearing labels while `rows` keep clean, stable keys. JSON is
deliberately not a bare `rows` array — that would drop the metric/unit metadata a
consumer needs to tell mm from in. Exportable metrics are defined in an
`ExportMetric` registry (`src/lib/export/registry.ts`); each entry declares how to
extract a field, convert units (via `UnitStrategy`, per ADR 0008), and reduce a day's
values (`sum`, `minAvgMax`, `mean`, `peak`, `meanPeak`). Adding a metric is one registry
entry. A single export is hard-capped at 366 days, rejected before any Tempest call.

## Consequences

- Heavy fetching/aggregation stays server-side; the browser downloads a small file.
- New metrics require no endpoint, serializer, or UI changes beyond a registry entry.
- Only `daily` granularity ships now; `hourly`/`raw` are reserved query values.
- Wind direction is deferred (needs vector averaging).
