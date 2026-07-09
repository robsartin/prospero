# Data Export — Daily Rainfall (extensible)

**Date:** 2026-07-09
**Status:** Approved design, pre-implementation

## Summary

Add a way to **download** weather data as a file. First deliverable: **daily rainfall
totals** as CSV or JSON, over a user-chosen date range. Built on an extensible
**export-metric registry** so adding temperature, wind, humidity, etc. later is a
one-line change per metric.

Rainfall already flows through the app (Tempest device history → `/api/history` →
`TransformedObservation.rainAccumulated` → `RainChart`); what is missing is a way to
export it to a file. This feature adds that.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Output format | Both **CSV and JSON**, chosen at download time |
| Granularity (v1) | **Daily totals** (metric-specific aggregation, not raw obs) |
| Placement | **Dedicated** export UI with its own start/end date picker, independent of the History chart range |
| Architecture | **Server-side export endpoint** (`GET /api/export`) does the chunked fetch + aggregation + file response |
| Range cap | **Hard cap at 366 days**; longer spans rejected with a clear error |
| First cut wires up | **Rain only** in the registry; full machinery ships so other metrics are trivial follow-ups |

## Architecture

```
DownloadPanel (new, "Download" nav tab)
  start/end date pickers + metric checkboxes (from registry) + format toggle (CSV/JSON)
  + fixed "Daily" granularity label
  | fetch() the export URL (so errors can be shown), then Blob → synthetic <a download>
  v
GET /api/export?device_id&start&end&metrics=rain&granularity=daily&format=csv&units=metric&tz_offset=-420
  | (server-side)
  guard: end > start, and (end - start) <= 366 days  → else 400 (before any Tempest call)
  chunkTimeRange(start, end)                          (existing, lib/timeRanges.ts)
  fetchDeviceHistory() per chunk                      (existing, lib/tempest.ts)
  transformObservation() → enrichObservation()        (existing)
  v
lib/export/aggregate.ts   raw obs → local-day buckets → per-metric daily reductions
  v
lib/export/serialize.ts   rows → CSV string | rows → JSON string
  v
Response 200, Content-Type text/csv | application/json,
         Content-Disposition: attachment; filename="rain_2026-01-01_2026-07-09_daily.csv"
```

The endpoint reuses the existing chunking, fetch, transform, and enrich code paths. New
code is confined to `lib/export/*` and the `api/export` route plus the `DownloadPanel`
component.

## The extensibility model — export-metric registry

The core of "extend for other data." Each exportable metric is a descriptor in a registry
array. Adding a metric = adding one entry; the endpoint, serializer, and UI checkboxes all
read from the registry, so nothing else changes.

```ts
interface ExportMetric {
  key: string;                                   // "rain" — the ?metrics= token
  label: string;                                 // column header base, e.g. "Rain"
  unit: (u: UnitStrategy) => string;             // unit-aware header suffix, e.g. "mm"
  extract: (o: TransformedObservation) => number | null;   // which field
  convert: (u: UnitStrategy, v: number) => number;         // raw (metric) → display units
  reduce: DailyReducer;                          // how a day's values collapse → column(s)
}
```

`DailyReducer` is where metric-specific aggregation lives — this is why "daily total"
alone is insufficient across metrics:

| Reducer | Columns emitted | Used by |
|---|---|---|
| `sum` | one (`total`) | rain, lightning strikes |
| `minAvgMax` | three (`_min`, `_avg`, `_max`) | temperature, humidity, pressure, comfort |
| `mean` | one | wind avg |
| `peak` | one (max) | wind gust, UV |
| `meanPeak` | two (`_avg`, `_peak`) | solar radiation, illuminance |

A reducer receives the day's non-null values (already unit-converted) and returns one or
more named numeric columns. Days with no data for a metric emit empty cells.

### Candidate metric list (extension roadmap)

| Metric | Field (`TransformedObservation`) | Daily reduction | Ships in v1 |
|---|---|---|---|
| **Rain** | `rainAccumulated` | sum | ✅ |
| Temperature (air) | `airTemperature` | minAvgMax | later |
| Humidity | `relativeHumidity` | minAvgMax | later |
| Station pressure | `stationPressure` | minAvgMax | later |
| Wind (avg) | `windAvg` | mean | later |
| Wind (gust) | `windGust` | peak | later |
| Solar radiation | `solarRadiation` | meanPeak | later |
| Illuminance | `illuminance` | meanPeak | later |
| UV | `uv` | peak | later |
| Lightning strikes | `lightningStrikeCount` | sum | later |
| Heat index | `heatIndexC` (enriched) | minAvgMax | later |
| Wind chill | `windChillC` (enriched) | minAvgMax | later |
| Wet bulb | `wetBulbC` (enriched) | minAvgMax | later |
| Battery (diagnostic) | `battery` | min + last | later |

**Wind direction is intentionally excluded** for now — a correct daily "dominant
direction" needs vector averaging, a separate piece of work (YAGNI until requested).

## Endpoint contract — `GET /api/export`

| Param | Required | Notes |
|---|---|---|
| `device_id` | yes | int |
| `start`, `end` | yes | epoch seconds; `400` if `end <= start` |
| `metrics` | yes | comma list of registry keys; unknown key → `400`; empty → `400` |
| `granularity` | no | default `daily`; only `daily` supported now (param reserved for `hourly`/`raw`) |
| `format` | no | `csv` (default) or `json`; other value → `400` |
| `units` | no | `metric` (default) or `imperial`; reuses existing `UnitStrategy`; conversion lives on each `ExportMetric.convert` |
| `tz_offset` | no | station timezone offset in **minutes** so days bucket to station-local midnight; client passes `station.timezone_offset_minutes`; default `0` (UTC) |

**Success:** `200`, `Content-Type: text/csv` or `application/json`, and
`Content-Disposition: attachment; filename="<name>"`. Filename is
`<metrics>_<start-date>_<end-date>_<granularity>.<ext>` for a single metric (e.g.
`rain_2026-01-01_2026-07-09_daily.csv`); for multiple metrics the prefix is `export`.

**Errors:** follow the existing route pattern (see `api/history/route.ts`) —
`try/catch` returning `{ error: message }` JSON. Validation failures → `400`; Tempest/
unexpected failures → `500` with the real message.

**Range guard** (`end - start > 366 days`) runs **before** any Tempest call so an
oversized request never fans out.

## File / output shape

- CSV first column: `date` (`YYYY-MM-DD`, station-local).
- Header cells carry the unit suffix: `Rain (mm)`; a `minAvgMax` metric emits
  `Temperature_min (°C),Temperature_avg (°C),Temperature_max (°C)`.
- Missing data for a day → empty cell (CSV) / omitted-or-null field (JSON).
- CSV values are escaped per RFC 4180 (quote fields containing comma/quote/newline).
- JSON is the same rows as an array of objects keyed by column name, plus `date`.

## UI — `DownloadPanel`

- New `Download` tab in `NavTabs` (alongside Current / Forecast / History).
- Controls: start date input, end date input, metric checkboxes rendered **from the
  registry** (rain pre-checked), CSV/JSON radio, fixed "Daily" granularity label,
  Download button.
- Reads `deviceId`, `station.timezone_offset_minutes`, and the current `UnitStrategy`
  from `page.tsx` state (already tracked there).
- Client-side validation mirrors the server: Download disabled with a hint when
  `end < start`, span > 366 days, or no metric selected. Server remains the real gate.
- Download trigger uses `fetch()` (not a bare `<a download>`) so a `!res.ok` response is
  parsed and shown via the app's `ErrorDisplay`/inline message; on success the response
  becomes a `Blob` → object URL → synthetic `<a download>` click. Daily files are tiny,
  so in-memory handling is a non-issue.
- Accessibility: date inputs and checkboxes have associated labels; Download button has an
  accessible name and disabled state is conveyed to assistive tech; error message uses a
  live region consistent with existing `ErrorDisplay` usage.

## Error handling

| Condition | Result |
|---|---|
| Missing `device_id`/`start`/`end` | `400 { error }` |
| `end <= start` | `400 { error }` |
| Span > 366 days | `400 { error }` (before any fetch) |
| Unknown metric key / empty metrics | `400 { error }` |
| Unsupported `format` / `granularity` | `400 { error }` |
| Tempest fetch failure | `500 { error: <real message> }` |
| Client receives non-OK | parse JSON error, render via `ErrorDisplay`/inline message |

## Testing (TDD, per ADR 0004)

- `lib/export/aggregate.test.ts` — local-day bucketing (incl. `tz_offset`), each reducer
  (`sum`/`minAvgMax`/`mean`/`peak`/`meanPeak`), null handling, empty input, unit conversion.
- `lib/export/serialize.test.ts` — CSV header, rows, RFC-4180 escaping, empty cells; JSON shape.
- `lib/export/registry.test.ts` — rain descriptor `extract`/`reduce`/`unit`/`convert`.
- `api/export/route.test.ts` (`@jest-environment node`) — every `400` validation branch,
  `Content-Disposition`/`Content-Type` on success, happy path with mocked
  `fetchDeviceHistory`, chunk fan-out for a multi-chunk range.
- `DownloadPanel.test.tsx` — checkboxes rendered from registry, validation disables button,
  correct export URL built from inputs, error path renders message.

Coverage stays within the 80% CI gate (ADR 0005); aim for the project's ~100% statement norm.

## Documentation

- **ADR 0012** — export endpoint + metric-registry pattern (rationale: registry keeps
  metric addition to one entry; server-side keeps token/volume off the client, consistent
  with ADR 0008/0010 direction).
- **README** — new "Download / Export" section (endpoint, params, UI) and ADR table row.

## Scope boundaries (YAGNI)

- v1 wires up **rain only**; other metrics are follow-up PRs (one registry entry each).
- Only `daily` granularity is implemented; `hourly`/`raw` are reserved param values, not built.
- Wind direction is excluded pending vector-averaging design.
- No scheduling, emailing, or cloud storage of exports — download-to-browser only.
