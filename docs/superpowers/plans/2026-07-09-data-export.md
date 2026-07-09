# Data Export (Daily Rainfall, extensible) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated UI + server endpoint to download weather data as CSV/JSON over a chosen date range, shipping daily rainfall first on an extensible metric registry.

**Architecture:** A new `GET /api/export` route reuses the existing chunk/fetch/transform/enrich pipeline, aggregates raw observations into per-day rows via a metric registry, and returns a downloadable file. A new `DownloadPanel` (own nav tab) provides the date range, metric, and format controls. All new logic lives in `src/lib/export/*`, `src/app/api/export/`, and `src/components/DownloadPanel.tsx`.

**Tech Stack:** TypeScript, Next.js 16 (App Router), React 19, Jest 30 + React Testing Library. No new dependencies.

## Global Constraints

- **TDD (ADR 0004):** every production line preceded by a failing test; commit test + implementation **together**.
- **80% coverage minimum (ADR 0005):** CI gate; project norm is ~100% statements.
- **All Tempest calls go through `/api` routes (README rule 1):** token never reaches the browser.
- **Unit strategy pattern (ADR 0008):** conversions go through a `UnitStrategy` object, never an `if (system === "imperial")`.
- **5-day chunking (ADR 0010):** never request >5 days from the device API in one call; use `chunkTimeRange()`.
- **React 19 effect pattern:** no synchronous `setState` in effect bodies; use `useCallback` + async + `AbortController` where effects are involved.
- **ESLint 9 clean:** zero errors; ES imports only (no `require`); no unused vars.
- **API route tests use `@jest-environment node`.**
- Range hard cap: **366 days** (`366 * 86400` seconds).
- Files that change together live together; keep each `lib/export/*` file single-responsibility.

---

### Task 1: Daily reducers

**Files:**
- Create: `src/lib/export/reducers.ts`
- Test: `src/lib/export/reducers.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface DailyReducer { suffixes: string[]; apply: (values: number[]) => number[] }` — `apply` returns one number per suffix; callers guarantee `values` is non-empty.
  - Named reducers: `sum`, `mean`, `peak`, `minAvgMax`, `meanPeak` (all `DailyReducer`).

- [ ] **Step 1: Write the failing test**

```ts
import { sum, mean, peak, minAvgMax, meanPeak } from "./reducers";

describe("daily reducers", () => {
  it("sum totals the day's values in one column", () => {
    expect(sum.suffixes).toEqual([""]);
    expect(sum.apply([0.2, 0.3, 0.5])).toEqual([1]);
  });

  it("mean averages the values", () => {
    expect(mean.suffixes).toEqual([""]);
    expect(mean.apply([2, 4])).toEqual([3]);
  });

  it("peak returns the maximum", () => {
    expect(peak.suffixes).toEqual([""]);
    expect(peak.apply([1, 9, 4])).toEqual([9]);
  });

  it("minAvgMax returns three columns", () => {
    expect(minAvgMax.suffixes).toEqual(["_min", "_avg", "_max"]);
    expect(minAvgMax.apply([2, 4, 6])).toEqual([2, 4, 6]);
  });

  it("meanPeak returns avg then peak", () => {
    expect(meanPeak.suffixes).toEqual(["_avg", "_peak"]);
    expect(meanPeak.apply([2, 4, 6])).toEqual([4, 6]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/export/reducers.test.ts`
Expected: FAIL — `Cannot find module './reducers'`.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface DailyReducer {
  suffixes: string[];
  apply: (values: number[]) => number[];
}

const total = (v: number[]): number => v.reduce((a, b) => a + b, 0);
const avg = (v: number[]): number => total(v) / v.length;

export const sum: DailyReducer = { suffixes: [""], apply: (v) => [total(v)] };
export const mean: DailyReducer = { suffixes: [""], apply: (v) => [avg(v)] };
export const peak: DailyReducer = { suffixes: [""], apply: (v) => [Math.max(...v)] };

export const minAvgMax: DailyReducer = {
  suffixes: ["_min", "_avg", "_max"],
  apply: (v) => [Math.min(...v), avg(v), Math.max(...v)],
};

export const meanPeak: DailyReducer = {
  suffixes: ["_avg", "_peak"],
  apply: (v) => [avg(v), Math.max(...v)],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/export/reducers.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/reducers.ts src/lib/export/reducers.test.ts
git commit -m "feat: daily aggregation reducers for data export"
```

---

### Task 2: Export metric registry

**Files:**
- Create: `src/lib/export/registry.ts`
- Test: `src/lib/export/registry.test.ts`

**Interfaces:**
- Consumes: `DailyReducer`, `sum` from `./reducers`; `TransformedObservation` from `../transforms`; `UnitStrategy` from `../units`.
- Produces:
  - `interface ExportMetric { key: string; label: string; precision: number; unit: (u: UnitStrategy) => string; extract: (o: TransformedObservation) => number | null; convert: (u: UnitStrategy, v: number) => number; reduce: DailyReducer }`
  - `const EXPORT_METRICS: ExportMetric[]` — v1 contains **rain** only.
  - `function getExportMetric(key: string): ExportMetric | undefined`

- [ ] **Step 1: Write the failing test**

```ts
import { EXPORT_METRICS, getExportMetric } from "./registry";
import { MetricUnitStrategy, ImperialUnitStrategy } from "../units";
import type { TransformedObservation } from "../transforms";

const obs = (rain: number | null) =>
  ({ rainAccumulated: rain } as TransformedObservation);

describe("export registry", () => {
  it("includes a rain metric", () => {
    expect(getExportMetric("rain")).toBeDefined();
    expect(EXPORT_METRICS.map((m) => m.key)).toContain("rain");
  });

  it("returns undefined for unknown keys", () => {
    expect(getExportMetric("nope")).toBeUndefined();
  });

  it("rain extracts rainAccumulated and reduces by sum", () => {
    const rain = getExportMetric("rain")!;
    expect(rain.extract(obs(0.5))).toBe(0.5);
    expect(rain.extract(obs(null))).toBeNull();
    expect(rain.reduce.suffixes).toEqual([""]);
  });

  it("rain unit and conversion are strategy-driven", () => {
    const rain = getExportMetric("rain")!;
    expect(rain.unit(new MetricUnitStrategy())).toBe("mm");
    expect(rain.unit(new ImperialUnitStrategy())).toBe("in");
    expect(rain.convert(new MetricUnitStrategy(), 25.4)).toBeCloseTo(25.4);
    expect(rain.convert(new ImperialUnitStrategy(), 25.4)).toBeCloseTo(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/export/registry.test.ts`
Expected: FAIL — `Cannot find module './registry'`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { TransformedObservation } from "../transforms";
import type { UnitStrategy } from "../units";
import { type DailyReducer, sum } from "./reducers";

export interface ExportMetric {
  key: string;
  label: string;
  precision: number;
  unit: (u: UnitStrategy) => string;
  extract: (o: TransformedObservation) => number | null;
  convert: (u: UnitStrategy, v: number) => number;
  reduce: DailyReducer;
}

export const EXPORT_METRICS: ExportMetric[] = [
  {
    key: "rain",
    label: "Rain",
    precision: 2,
    unit: (u) => u.labels.rain,
    extract: (o) => o.rainAccumulated,
    convert: (u, v) => u.rain(v),
    reduce: sum,
  },
];

export function getExportMetric(key: string): ExportMetric | undefined {
  return EXPORT_METRICS.find((m) => m.key === key);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/export/registry.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/registry.ts src/lib/export/registry.test.ts
git commit -m "feat: export metric registry with rain metric"
```

---

### Task 3: Daily aggregation

**Files:**
- Create: `src/lib/export/aggregate.ts`
- Test: `src/lib/export/aggregate.test.ts`

**Interfaces:**
- Consumes: `ExportMetric` from `./registry`; `TransformedObservation` from `../transforms`; `UnitStrategy` from `../units`.
- Produces:
  - `interface ExportColumn { key: string; header: string }`
  - `interface ExportTable { columns: ExportColumn[]; rows: Record<string, string | number | null>[] }`
  - `function aggregate(obs: TransformedObservation[], metrics: ExportMetric[], units: UnitStrategy, tzOffsetMinutes: number): ExportTable`
    - First column is always `{ key: "date", header: "date" }`; each row's `date` is a `YYYY-MM-DD` local-day string.
    - Days are sorted ascending; a day with no non-null values for a metric gets `null` in that metric's column(s); values are rounded to `metric.precision`.

- [ ] **Step 1: Write the failing test**

```ts
import { aggregate } from "./aggregate";
import { getExportMetric } from "./registry";
import { MetricUnitStrategy, ImperialUnitStrategy } from "../units";
import type { TransformedObservation } from "../transforms";

const rain = getExportMetric("rain")!;
// 2026-01-01T00:00:00Z = 1767225600
const obs = (ts: number, r: number | null) =>
  ({ timestamp: ts, rainAccumulated: r } as TransformedObservation);

describe("aggregate", () => {
  it("builds a date column plus one column per metric with unit header", () => {
    const table = aggregate([obs(1767225600, 1)], [rain], new MetricUnitStrategy(), 0);
    expect(table.columns).toEqual([
      { key: "date", header: "date" },
      { key: "rain", header: "Rain (mm)" },
    ]);
  });

  it("sums a day's rain into one row, rounded to precision", () => {
    const table = aggregate(
      [obs(1767225600, 0.1), obs(1767229200, 0.2)],
      [rain],
      new MetricUnitStrategy(),
      0
    );
    expect(table.rows).toEqual([{ date: "2026-01-01", rain: 0.3 }]);
  });

  it("buckets by local day using tz offset (minutes)", () => {
    // 1767268740 = 2026-01-01T11:59:00Z; offset -720 min shifts to prev local day
    const table = aggregate([obs(1767268740, 5)], [rain], new MetricUnitStrategy(), -720);
    expect(table.rows[0].date).toBe("2025-12-31");
  });

  it("emits null when a day has no non-null values", () => {
    const table = aggregate([obs(1767225600, null)], [rain], new MetricUnitStrategy(), 0);
    expect(table.rows).toEqual([{ date: "2026-01-01", rain: null }]);
  });

  it("applies unit conversion before reducing", () => {
    const table = aggregate([obs(1767225600, 25.4)], [rain], new ImperialUnitStrategy(), 0);
    expect(table.columns[1].header).toBe("Rain (in)");
    expect(table.rows[0].rain).toBe(1);
  });

  it("sorts days ascending", () => {
    const table = aggregate(
      [obs(1767312000, 2), obs(1767225600, 1)],
      [rain],
      new MetricUnitStrategy(),
      0
    );
    expect(table.rows.map((r) => r.date)).toEqual(["2026-01-01", "2026-01-02"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/export/aggregate.test.ts`
Expected: FAIL — `Cannot find module './aggregate'`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { TransformedObservation } from "../transforms";
import type { UnitStrategy } from "../units";
import type { ExportMetric } from "./registry";

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportTable {
  columns: ExportColumn[];
  rows: Record<string, string | number | null>[];
}

function localDay(timestamp: number, tzOffsetMinutes: number): string {
  const localMs = (timestamp + tzOffsetMinutes * 60) * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

function round(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function aggregate(
  obs: TransformedObservation[],
  metrics: ExportMetric[],
  units: UnitStrategy,
  tzOffsetMinutes: number
): ExportTable {
  const columns: ExportColumn[] = [{ key: "date", header: "date" }];
  for (const m of metrics) {
    for (const suffix of m.reduce.suffixes) {
      columns.push({
        key: `${m.key}${suffix}`,
        header: `${m.label}${suffix} (${m.unit(units)})`,
      });
    }
  }

  const byDay = new Map<string, TransformedObservation[]>();
  for (const o of obs) {
    const day = localDay(o.timestamp, tzOffsetMinutes);
    const bucket = byDay.get(day);
    if (bucket) bucket.push(o);
    else byDay.set(day, [o]);
  }

  const rows = [...byDay.keys()].sort().map((day) => {
    const row: Record<string, string | number | null> = { date: day };
    for (const m of metrics) {
      const values = byDay
        .get(day)!
        .map((o) => m.extract(o))
        .filter((v): v is number => v != null)
        .map((v) => m.convert(units, v));
      if (values.length === 0) {
        for (const suffix of m.reduce.suffixes) row[`${m.key}${suffix}`] = null;
      } else {
        const results = m.reduce.apply(values);
        m.reduce.suffixes.forEach((suffix, i) => {
          row[`${m.key}${suffix}`] = round(results[i], m.precision);
        });
      }
    }
    return row;
  });

  return { columns, rows };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/export/aggregate.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/aggregate.ts src/lib/export/aggregate.test.ts
git commit -m "feat: daily aggregation of observations into export table"
```

---

### Task 4: CSV/JSON serialization

**Files:**
- Create: `src/lib/export/serialize.ts`
- Test: `src/lib/export/serialize.test.ts`

**Interfaces:**
- Consumes: `ExportTable` from `./aggregate`.
- Produces:
  - `function toCsv(table: ExportTable): string` — header row from column headers, `null` → empty cell, RFC-4180 escaping (quote fields containing `,`, `"`, or newline; double interior quotes).
  - `function toJson(table: ExportTable): string` — `JSON.stringify(table.rows, null, 2)`.

- [ ] **Step 1: Write the failing test**

```ts
import { toCsv, toJson } from "./serialize";
import type { ExportTable } from "./aggregate";

const table: ExportTable = {
  columns: [
    { key: "date", header: "date" },
    { key: "rain", header: "Rain (mm)" },
  ],
  rows: [
    { date: "2026-01-01", rain: 0.3 },
    { date: "2026-01-02", rain: null },
  ],
};

describe("serialize", () => {
  it("renders CSV with header and rows, null as empty cell", () => {
    expect(toCsv(table)).toBe("date,Rain (mm)\n2026-01-01,0.3\n2026-01-02,");
  });

  it("escapes fields containing commas or quotes per RFC 4180", () => {
    const t: ExportTable = {
      columns: [{ key: "date", header: "date" }, { key: "note", header: "Note, and \"q\"" }],
      rows: [{ date: "2026-01-01", note: "a,b" }],
    };
    expect(toCsv(t)).toBe('date,"Note, and ""q"""\n2026-01-01,"a,b"');
  });

  it("renders JSON as the rows array", () => {
    expect(JSON.parse(toJson(table))).toEqual(table.rows);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/export/serialize.test.ts`
Expected: FAIL — `Cannot find module './serialize'`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { ExportTable } from "./aggregate";

function escapeCsv(field: string): string {
  return /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
}

export function toCsv(table: ExportTable): string {
  const header = table.columns.map((c) => escapeCsv(c.header)).join(",");
  const lines = table.rows.map((row) =>
    table.columns
      .map((c) => {
        const value = row[c.key];
        return value == null ? "" : escapeCsv(String(value));
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

export function toJson(table: ExportTable): string {
  return JSON.stringify(table.rows, null, 2);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/export/serialize.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/serialize.ts src/lib/export/serialize.test.ts
git commit -m "feat: CSV and JSON serialization of export tables"
```

---

### Task 5: Export param parsing & validation

**Files:**
- Create: `src/lib/export/params.ts`
- Test: `src/lib/export/params.test.ts`

**Interfaces:**
- Consumes: `UnitSystemId` from `../units`; `getExportMetric` from `./registry`.
- Produces:
  - `interface ExportParams { deviceId: number; start: number; end: number; metricKeys: string[]; granularity: "daily"; format: "csv" | "json"; unitId: UnitSystemId; tzOffset: number }`
  - `type ParseResult = { ok: true; value: ExportParams } | { ok: false; error: string }`
  - `function parseExportParams(params: URLSearchParams): ParseResult`

- [ ] **Step 1: Write the failing test**

```ts
import { parseExportParams } from "./params";

const qs = (s: string) => new URLSearchParams(s);

describe("parseExportParams", () => {
  it("parses a valid request with defaults", () => {
    const r = parseExportParams(qs("device_id=5&start=1000&end=2000&metrics=rain"));
    expect(r).toEqual({
      ok: true,
      value: {
        deviceId: 5,
        start: 1000,
        end: 2000,
        metricKeys: ["rain"],
        granularity: "daily",
        format: "csv",
        unitId: "metric",
        tzOffset: 0,
      },
    });
  });

  it("honors format, units, and tz_offset", () => {
    const r = parseExportParams(
      qs("device_id=5&start=1000&end=2000&metrics=rain&format=json&units=imperial&tz_offset=-420")
    );
    expect(r).toMatchObject({ ok: true, value: { format: "json", unitId: "imperial", tzOffset: -420 } });
  });

  it("rejects missing required params", () => {
    expect(parseExportParams(qs("device_id=5"))).toMatchObject({ ok: false });
  });

  it("rejects end <= start", () => {
    const r = parseExportParams(qs("device_id=5&start=2000&end=2000&metrics=rain"));
    expect(r).toMatchObject({ ok: false });
    expect((r as { error: string }).error).toContain("start");
  });

  it("rejects spans over 366 days", () => {
    const end = 1000 + 366 * 86400 + 1;
    const r = parseExportParams(qs(`device_id=5&start=1000&end=${end}&metrics=rain`));
    expect(r).toMatchObject({ ok: false });
    expect((r as { error: string }).error).toContain("366");
  });

  it("rejects unknown metric keys", () => {
    const r = parseExportParams(qs("device_id=5&start=1000&end=2000&metrics=rain,zzz"));
    expect(r).toMatchObject({ ok: false });
    expect((r as { error: string }).error).toContain("zzz");
  });

  it("rejects unsupported format, granularity, and units", () => {
    expect(parseExportParams(qs("device_id=5&start=1&end=2&metrics=rain&format=xml"))).toMatchObject({ ok: false });
    expect(parseExportParams(qs("device_id=5&start=1&end=2&metrics=rain&granularity=hourly"))).toMatchObject({ ok: false });
    expect(parseExportParams(qs("device_id=5&start=1&end=2&metrics=rain&units=stone"))).toMatchObject({ ok: false });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/export/params.test.ts`
Expected: FAIL — `Cannot find module './params'`.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { UnitSystemId } from "../units";
import { getExportMetric } from "./registry";

const MAX_SPAN = 366 * 86400;

export interface ExportParams {
  deviceId: number;
  start: number;
  end: number;
  metricKeys: string[];
  granularity: "daily";
  format: "csv" | "json";
  unitId: UnitSystemId;
  tzOffset: number;
}

export type ParseResult =
  | { ok: true; value: ExportParams }
  | { ok: false; error: string };

export function parseExportParams(params: URLSearchParams): ParseResult {
  const deviceId = params.get("device_id");
  const start = params.get("start");
  const end = params.get("end");
  const metrics = params.get("metrics");

  if (!deviceId || !start || !end || !metrics) {
    return { ok: false, error: "device_id, start, end, and metrics query parameters are required" };
  }

  const startN = Number(start);
  const endN = Number(end);
  if (!Number.isFinite(startN) || !Number.isFinite(endN) || endN <= startN) {
    return { ok: false, error: "end must be greater than start" };
  }
  if (endN - startN > MAX_SPAN) {
    return { ok: false, error: "date range must not exceed 366 days" };
  }

  const metricKeys = metrics.split(",").filter(Boolean);
  if (metricKeys.length === 0) {
    return { ok: false, error: "at least one metric is required" };
  }
  for (const key of metricKeys) {
    if (!getExportMetric(key)) {
      return { ok: false, error: `unknown metric: ${key}` };
    }
  }

  const granularity = params.get("granularity") ?? "daily";
  if (granularity !== "daily") {
    return { ok: false, error: `unsupported granularity: ${granularity}` };
  }

  const format = params.get("format") ?? "csv";
  if (format !== "csv" && format !== "json") {
    return { ok: false, error: `unsupported format: ${format}` };
  }

  const units = params.get("units") ?? "metric";
  if (units !== "metric" && units !== "imperial") {
    return { ok: false, error: `unsupported units: ${units}` };
  }

  const tzOffset = Number(params.get("tz_offset") ?? "0");
  if (!Number.isFinite(tzOffset)) {
    return { ok: false, error: "tz_offset must be a number" };
  }

  return {
    ok: true,
    value: {
      deviceId: Number(deviceId),
      start: startN,
      end: endN,
      metricKeys,
      granularity: "daily",
      format,
      unitId: units,
      tzOffset,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/export/params.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/params.ts src/lib/export/params.test.ts
git commit -m "feat: export param parsing and validation"
```

---

### Task 6: Export API route

**Files:**
- Create: `src/app/api/export/route.ts`
- Test: `src/app/api/export/route.test.ts`

**Interfaces:**
- Consumes: `getConfig` (`@/lib/config`), `fetchDeviceHistory` (`@/lib/tempest`), `transformObservation` (`@/lib/transforms`), `enrichObservation` (`@/lib/enrichObservation`), `chunkTimeRange` (`@/lib/timeRanges`), `getUnitStrategy` (`@/lib/units`), `parseExportParams` (`@/lib/export/params`), `getExportMetric` (`@/lib/export/registry`), `aggregate` (`@/lib/export/aggregate`), `toCsv`/`toJson` (`@/lib/export/serialize`).
- Produces: `async function GET(request: NextRequest): Promise<NextResponse | Response>`.
  - `400 { error }` on invalid params; `500 { error }` on fetch failure.
  - Success: `200` with `Content-Type: text/csv | application/json` and `Content-Disposition: attachment; filename="<prefix>_<startDate>_<endDate>_daily.<ext>"` (prefix = the single metric key, or `export` for multiple).

- [ ] **Step 1: Write the failing test**

```ts
/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/config", () => ({ getConfig: () => ({ token: "test-token" }) }));

const mockFetchDeviceHistory = jest.fn();
jest.mock("@/lib/tempest", () => ({
  fetchDeviceHistory: (...args: unknown[]) => mockFetchDeviceHistory(...args),
}));

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

// One ST obs row: index 0 = timestamp, index 12 = rain accumulated.
function obsRow(ts: number, rain: number) {
  const row = new Array(18).fill(0);
  row[0] = ts;
  row[12] = rain;
  return row;
}

describe("GET /api/export", () => {
  beforeEach(() => mockFetchDeviceHistory.mockReset());

  it("returns a CSV attachment of daily rain totals", async () => {
    mockFetchDeviceHistory.mockResolvedValue({
      obs: [obsRow(1767225600, 0.2), obsRow(1767229200, 0.3)],
      status: { status_code: 0, status_message: "SUCCESS" },
    });

    const res = await GET(
      createRequest("/api/export?device_id=9&start=1767225600&end=1767250000&metrics=rain&format=csv")
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain('filename="rain_2026-01-01_');
    expect(await res.text()).toBe("date,Rain (mm)\n2026-01-01,0.5");
  });

  it("returns JSON when format=json", async () => {
    mockFetchDeviceHistory.mockResolvedValue({ obs: [obsRow(1767225600, 1)], status: {} });
    const res = await GET(
      createRequest("/api/export?device_id=9&start=1767225600&end=1767250000&metrics=rain&format=json")
    );
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(await res.text())).toEqual([{ date: "2026-01-01", rain: 1 }]);
  });

  it("fans out across 5-day chunks", async () => {
    mockFetchDeviceHistory.mockResolvedValue({ obs: [], status: {} });
    // 12-day span -> 3 chunks of <=5 days.
    const start = 1767225600;
    const end = start + 12 * 86400;
    await GET(createRequest(`/api/export?device_id=9&start=${start}&end=${end}&metrics=rain`));
    expect(mockFetchDeviceHistory).toHaveBeenCalledTimes(3);
  });

  it("returns 400 on invalid params without calling Tempest", async () => {
    const res = await GET(createRequest("/api/export?device_id=9"));
    expect(res.status).toBe(400);
    expect(mockFetchDeviceHistory).not.toHaveBeenCalled();
  });

  it("returns 500 when the fetch fails", async () => {
    mockFetchDeviceHistory.mockRejectedValue(new Error("API down"));
    const res = await GET(
      createRequest("/api/export?device_id=9&start=1767225600&end=1767250000&metrics=rain")
    );
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("API down");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/app/api/export/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Write minimal implementation**

```ts
import { type NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { fetchDeviceHistory } from "@/lib/tempest";
import { transformObservation } from "@/lib/transforms";
import { enrichObservation } from "@/lib/enrichObservation";
import { chunkTimeRange } from "@/lib/timeRanges";
import { getUnitStrategy } from "@/lib/units";
import { parseExportParams } from "@/lib/export/params";
import { getExportMetric } from "@/lib/export/registry";
import { aggregate } from "@/lib/export/aggregate";
import { toCsv, toJson } from "@/lib/export/serialize";

function isoDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const parsed = parseExportParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { deviceId, start, end, metricKeys, format, unitId, tzOffset } = parsed.value;

  try {
    const { token } = getConfig();
    const chunks = chunkTimeRange(start, end);
    const responses = await Promise.all(
      chunks.map(([s, e]) => fetchDeviceHistory(deviceId, token, s, e))
    );
    const obs = responses
      .flatMap((r) => r.obs ?? [])
      .map(transformObservation)
      .map(enrichObservation);

    const metrics = metricKeys.map((key) => getExportMetric(key)!);
    const table = aggregate(obs, metrics, getUnitStrategy(unitId), tzOffset);
    const body = format === "csv" ? toCsv(table) : toJson(table);

    const prefix = metricKeys.length === 1 ? metricKeys[0] : "export";
    const filename = `${prefix}_${isoDate(start)}_${isoDate(end)}_daily.${format}`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": format === "csv" ? "text/csv" : "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/app/api/export/route.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/export/route.ts src/app/api/export/route.test.ts
git commit -m "feat: /api/export route for downloadable daily data"
```

---

### Task 7: DownloadPanel component

**Files:**
- Create: `src/components/DownloadPanel.tsx`
- Test: `src/components/DownloadPanel.test.tsx`

**Interfaces:**
- Consumes: `EXPORT_METRICS` from `@/lib/export/registry`; `MetricUnitStrategy`, `type UnitStrategy` from `@/lib/units`.
- Produces: `export default function DownloadPanel(props: { deviceId: number | null; units?: UnitStrategy; tzOffsetMinutes?: number }): JSX.Element`.

**Notes for the implementer:**
- Date inputs are `type="date"` (value `YYYY-MM-DD`). Convert to epoch seconds with `Date.parse(`${date}T00:00:00Z`)/1000` for start and `Date.parse(`${date}T23:59:59Z`)/1000` for end; `tz_offset` handles local-day bucketing server-side.
- The Download button is disabled when: no `deviceId`, no start, no end, `start > end`, span `> 366` days, or no metric selected. Show a short hint next to the disabled button.
- On click: `fetch()` the export URL; if `!res.ok`, read `{ error }` JSON and render it (reuse the app's inline error style: `<p role="alert" className="text-red-500">`); on success, `res.blob()` → `URL.createObjectURL` → synthetic `<a download={filename}>` click → `URL.revokeObjectURL`.
- Follow ADR 0008: pass/read `UnitStrategy`, never a unit string — the panel reads `units.id` for the query and `units.labels.rain` etc. via the registry.
- Accessibility: associate `<label>` with each input/checkbox; give the alert `role="alert"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadPanel from "./DownloadPanel";

describe("DownloadPanel", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    global.URL.createObjectURL = jest.fn(() => "blob:x");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("renders a checkbox per registry metric with rain checked", () => {
    render(<DownloadPanel deviceId={9} />);
    expect(screen.getByRole("checkbox", { name: /rain/i })).toBeChecked();
  });

  it("disables download when no device is selected", () => {
    render(<DownloadPanel deviceId={null} />);
    expect(screen.getByRole("button", { name: /download/i })).toBeDisabled();
  });

  it("requests the export URL with chosen params on download", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["date,Rain (mm)\n"], { type: "text/csv" }),
    });
    render(<DownloadPanel deviceId={9} tzOffsetMinutes={-420} />);

    await userEvent.type(screen.getByLabelText(/start/i), "2026-01-01");
    await userEvent.type(screen.getByLabelText(/end/i), "2026-01-31");
    await userEvent.click(screen.getByRole("button", { name: /download/i }));

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("/api/export?");
    expect(url).toContain("device_id=9");
    expect(url).toContain("metrics=rain");
    expect(url).toContain("units=metric");
    expect(url).toContain("tz_offset=-420");
    expect(url).toContain("format=csv");
  });

  it("shows the server error message when the request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "date range must not exceed 366 days" }),
    });
    render(<DownloadPanel deviceId={9} />);

    await userEvent.type(screen.getByLabelText(/start/i), "2020-01-01");
    await userEvent.type(screen.getByLabelText(/end/i), "2026-01-01");
    await userEvent.click(screen.getByRole("button", { name: /download/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/366 days/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/DownloadPanel.test.tsx`
Expected: FAIL — `Cannot find module './DownloadPanel'`.

- [ ] **Step 3: Write minimal implementation**

```tsx
"use client";

import { useState } from "react";
import { EXPORT_METRICS } from "@/lib/export/registry";
import { MetricUnitStrategy, type UnitStrategy } from "@/lib/units";

const DEFAULT_UNITS = new MetricUnitStrategy();
const DAY = 86400;
const MAX_SPAN = 366 * DAY;

interface DownloadPanelProps {
  deviceId: number | null;
  units?: UnitStrategy;
  tzOffsetMinutes?: number;
}

function toStartEpoch(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
}
function toEndEpoch(date: string): number {
  return Math.floor(Date.parse(`${date}T23:59:59Z`) / 1000);
}

export default function DownloadPanel({
  deviceId,
  units = DEFAULT_UNITS,
  tzOffsetMinutes = 0,
}: DownloadPanelProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(EXPORT_METRICS.map((m) => m.key))
  );
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [error, setError] = useState<string | null>(null);

  const startEpoch = start ? toStartEpoch(start) : null;
  const endEpoch = end ? toEndEpoch(end) : null;
  const spanOk =
    startEpoch != null && endEpoch != null && endEpoch > startEpoch && endEpoch - startEpoch <= MAX_SPAN;
  const canDownload = deviceId != null && spanOk && selected.size > 0;

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const download = async () => {
    if (!canDownload || deviceId == null || startEpoch == null || endEpoch == null) return;
    setError(null);
    const metrics = EXPORT_METRICS.filter((m) => selected.has(m.key)).map((m) => m.key);
    const url =
      `/api/export?device_id=${deviceId}&start=${startEpoch}&end=${endEpoch}` +
      `&metrics=${metrics.join(",")}&granularity=daily&format=${format}` +
      `&units=${units.id}&tz_offset=${tzOffsetMinutes}`;

    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setError(body.error ?? `HTTP ${res.status}`);
      return;
    }
    const blob = await res.blob();
    const prefix = metrics.length === 1 ? metrics[0] : "export";
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${prefix}_${start}_${end}_daily.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Download data</h2>

      <div className="flex gap-4">
        <label className="flex flex-col text-sm">
          Start date
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col text-sm">
          End date
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Metrics</legend>
        {EXPORT_METRICS.map((m) => (
          <label key={m.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(m.key)}
              onChange={() => toggle(m.key)}
            />
            {m.label} ({m.unit(units)})
          </label>
        ))}
      </fieldset>

      <fieldset className="flex gap-4 text-sm">
        <legend className="text-sm font-medium">Format</legend>
        {(["csv", "json"] as const).map((f) => (
          <label key={f} className="flex items-center gap-1">
            <input
              type="radio"
              name="format"
              checked={format === f}
              onChange={() => setFormat(f)}
            />
            {f.toUpperCase()}
          </label>
        ))}
      </fieldset>

      <p className="text-xs text-zinc-500">Granularity: Daily</p>

      <button
        onClick={download}
        disabled={!canDownload}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        Download
      </button>
      {!canDownload && deviceId != null && (
        <span className="ml-2 text-xs text-zinc-500">
          Pick a start/end date within 366 days and at least one metric.
        </span>
      )}

      {error && (
        <p role="alert" className="text-red-500">
          Error: {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/DownloadPanel.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/DownloadPanel.tsx src/components/DownloadPanel.test.tsx
git commit -m "feat: DownloadPanel with date range, metric, and format controls"
```

---

### Task 8: Wire the Download tab into the dashboard

**Files:**
- Modify: `src/components/NavTabs.tsx:1` (add `"Download"` to `TABS`)
- Modify: `src/components/NavTabs.test.tsx` (assert Download tab renders — if the file exists; otherwise add the assertion to the nearest existing NavTabs test)
- Modify: `src/app/page.tsx` (track `tzOffsetMinutes`, render `DownloadPanel` for the Download tab)

**Interfaces:**
- Consumes: `DownloadPanel` (`@/components/DownloadPanel`); `Station.timezone_offset_minutes` (`@/lib/types`).
- Produces: no new exports.

- [ ] **Step 1: Write the failing test**

Add to `src/components/NavTabs.test.tsx` (create the file if it does not exist, using the block below):

```tsx
import { render, screen } from "@testing-library/react";
import NavTabs from "./NavTabs";

describe("NavTabs", () => {
  it("renders a Download tab", () => {
    render(<NavTabs activeTab="Current" onTabChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Download" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/NavTabs.test.tsx`
Expected: FAIL — no tab named "Download".

- [ ] **Step 3: Write minimal implementation**

In `src/components/NavTabs.tsx`, extend the tab list:

```tsx
const TABS = ["Current", "Forecast", "History", "Download"] as const;
```

In `src/app/page.tsx`, add timezone state and render the panel. Add the import:

```tsx
import DownloadPanel from "@/components/DownloadPanel";
```

Add state alongside the other `useState` hooks:

```tsx
  const [tzOffsetMinutes, setTzOffsetMinutes] = useState<number>(0);
```

Set it inside `handleStationSelect` (right after `setElevationM(...)`):

```tsx
    setTzOffsetMinutes(station.timezone_offset_minutes ?? 0);
```

Render the panel inside `<main>`, after the History block:

```tsx
        {activeTab === "Download" && (
          <DownloadPanel
            deviceId={deviceId}
            units={units}
            tzOffsetMinutes={tzOffsetMinutes}
          />
        )}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/NavTabs.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/NavTabs.tsx src/components/NavTabs.test.tsx src/app/page.tsx
git commit -m "feat: add Download tab and wire DownloadPanel into the dashboard"
```

---

### Task 9: ADR 0012 and README

**Files:**
- Create: `docs/adr/0012-data-export.md`
- Modify: `README.md` (add a "Download / Export" section and an ADR-table row)

**Interfaces:** none (documentation only).

- [ ] **Step 1: Write ADR 0012**

Create `docs/adr/0012-data-export.md` (match the heading style of `docs/adr/0010-history-chunking.md`):

```markdown
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
(`Content-Disposition: attachment`). Exportable metrics are defined in an
`ExportMetric` registry (`src/lib/export/registry.ts`); each entry declares how to
extract a field, convert units (via `UnitStrategy`, per ADR 0008), and reduce a day's
values (`sum`, `minAvgMax`, `mean`, `peak`, `meanPeak`). Adding a metric is one registry
entry. A single export is hard-capped at 366 days, rejected before any Tempest call.

## Consequences

- Heavy fetching/aggregation stays server-side; the browser downloads a small file.
- New metrics require no endpoint, serializer, or UI changes beyond a registry entry.
- Only `daily` granularity ships now; `hourly`/`raw` are reserved query values.
- Wind direction is deferred (needs vector averaging).
```

- [ ] **Step 2: Update the README**

In `README.md`, add a row to the ADR table:

```markdown
| [0012](docs/adr/0012-data-export.md) | Data export endpoint + metric registry |
```

And add a section after the "Run Locally" section:

```markdown
## Download / Export

The **Download** tab exports station data as CSV or JSON over a chosen date range.
It calls `GET /api/export`:

| Param | Notes |
|-------|-------|
| `device_id` | required |
| `start`, `end` | epoch seconds; span capped at 366 days |
| `metrics` | comma list of registry keys (e.g. `rain`) |
| `granularity` | `daily` (only value supported today) |
| `format` | `csv` (default) or `json` |
| `units` | `metric` (default) or `imperial` |
| `tz_offset` | station timezone offset in minutes, for local-day bucketing |

Add a new metric by appending one entry to `EXPORT_METRICS` in
`src/lib/export/registry.ts` (field extractor + unit conversion + daily reducer).
```

- [ ] **Step 3: Commit**

```bash
git add docs/adr/0012-data-export.md README.md
git commit -m "docs: ADR 0012 and README for data export"
```

---

### Task 10: Full gate check

**Files:** none (verification only).

- [ ] **Step 1: Run the full CI gate locally**

Run: `npm run lint && npm test -- --coverage --ci && npm run build`
Expected: lint clean (zero errors), all tests pass, coverage ≥ 80% (line) — project norm ~100% statements — and the build/type-check succeeds.

- [ ] **Step 2: Fix any failures**

If lint, coverage, or build fails, fix inline and re-run Step 1 until green. Do not push red.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feat/data-export
gh pr create --base main --title "feat: downloadable daily data export (rainfall)" \
  --body "Implements docs/superpowers/specs/2026-07-09-rainfall-export-design.md.

Adds GET /api/export + a Download tab exporting daily rainfall as CSV/JSON over a
date range, built on an extensible ExportMetric registry (rain wired up; other metrics
are one registry entry each). See ADR 0012.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## Self-Review

**Spec coverage:**
- Both CSV + JSON → Tasks 4, 6, 7. ✅
- Daily totals w/ metric-specific reducers → Tasks 1, 3. ✅
- Dedicated date-range picker → Task 7. ✅
- Server-side endpoint (Approach A) → Task 6. ✅
- Hard cap 366 days (before any fetch) → Task 5 (`parseExportParams`), verified in Task 6 test indirectly. ✅
- Extensible registry + candidate metric list → Task 2 (rain wired; others documented as one-entry adds). ✅
- `tz_offset` local-day bucketing → Tasks 3, 5, 7. ✅
- Unit-aware export via `UnitStrategy` → Tasks 2, 3, 6, 7. ✅
- Content-Disposition filename → Task 6. ✅
- Error handling table → Tasks 5 (400s), 6 (500 + 400 passthrough), 7 (client alert). ✅
- Accessibility (labels, live region) → Task 7. ✅
- ADR 0012 + README → Task 9. ✅
- Tests enumerated in spec → Tasks 1–7 each ship their test. ✅

**Placeholder scan:** none — every code and test step contains complete, runnable content.

**Type consistency:** `DailyReducer` (`suffixes`/`apply`) is defined in Task 1 and consumed unchanged in Tasks 2–3. `ExportMetric` fields (Task 2) match usage in Tasks 3, 6, 7. `ExportTable`/`ExportColumn` (Task 3) match Task 4 serialize and Task 6 route. `ExportParams`/`parseExportParams` (Task 5) match Task 6 usage. `DownloadPanel` prop names (`deviceId`, `units`, `tzOffsetMinutes`) match Task 8 wiring.

**Scope:** single cohesive feature; one plan is appropriate.
