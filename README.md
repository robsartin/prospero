# Prospero

Tempest weather station dashboard — real-time conditions, 10-day forecast, and historical charts.

## Architecture

```
Browser                        Prospero (Next.js)                 Tempest API
  |                                  |                                |
  |  GET /api/stations       ------->|  fetchStations(token)  ------->|
  |  GET /api/observations   ------->|  fetchObservations()   ------->|
  |  GET /api/forecast       ------->|  fetchForecast()       ------->|
  |  GET /api/history        ------->|  fetchDeviceHistory()  ------->|
  |                                  |  (chunked into 5-day requests) |
  |  wss://ws.weatherflow.com  <-----|  (WebSocket passthrough)       |
  |                                  |                                |
  |  Token NEVER sent to browser     |  Token stored in .env.local    |
```

### Data Flow

```
Tempest API
  |
  v
lib/tempest.ts          Typed fetch functions (buildUrl returns URL object)
  |
  v
lib/transforms.ts       Raw device arrays -> TransformedObservation (camelCase)
  |
  v
API Routes              Server-side proxy, token injection, error mapping
  |
  v
lib/units.ts            UnitStrategy converts metric -> imperial (or identity)
lib/format.ts           formatValue applies per-metric precision rules
  |
  v
Components              React display with formatted, converted values
```

### Component Tree

```
layout.tsx
  error.tsx (error boundary — storm photo + retry)
  page.tsx (client, manages stationId + deviceId + units state)
    Header
      UnitToggle (°C ↔ °F, persists to localStorage)
      StationPicker (fetches /api/stations, auto-selects first)
    NavTabs (Current | Forecast | History)
    [Current tab]
      DailySummary (temp, rain today, peak gust)
      CurrentConditions (8 MetricCards, auto-refresh 60s, unit-aware)
    [Forecast tab]
      ForecastStrip (unit-aware temperatures)
        ForecastDay x10 (weather emoji + hi/lo + precip %)
    [History tab]
      HistoryView (parallel 5-day chunk fetches, unit-aware)
        TimeRangeSelector (Today | This Week | Past Month | Last Month | Past Year)
        HistoryChart x4 (temp, pressure, wind, humidity — with smart Y-axis domains)
        RainChart (area chart)
```

### Key Architectural Rules

1. **Token security** — API token lives in `.env.local` (server-side only). All Tempest calls go through `src/app/api/` routes. The token is never sent to the browser.

2. **Unit strategy pattern** — All unit conversions go through a `UnitStrategy` interface (see [ADR 0008](docs/adr/0008-unit-strategy.md)). Components receive a strategy object, never a raw string. `MetricUnitStrategy` is the identity (API data is metric). `ImperialUnitStrategy` converts. No `if (system === "imperial")` scattered across components.

3. **Display precision** — All displayed values pass through `formatValue(kind, value)` which applies per-metric precision rules (see [ADR 0009](docs/adr/0009-display-precision.md)). No raw `number.toString()` in UI.

4. **5-day chunking** — Tempest device API limits history queries to 5 days. For longer ranges, `chunkTimeRange()` splits into windows and `HistoryView` fires parallel `Promise.all` requests (see [ADR 0010](docs/adr/0010-history-chunking.md)).

5. **Error boundaries** — Unhandled errors render `ErrorDisplay` (storm photo + retry button). Components use `ErrorDisplay` for fetch failures with the actual API error message, not generic "HTTP 500".

6. **React 19 effect pattern** — `setState` cannot be called synchronously in effects. Use `useCallback` + async function + `AbortController` cleanup (see Key Patterns below).

## Prerequisites

- Node.js 20+
- npm
- A Tempest WeatherFlow account with a Personal Access Token

## Setup

1. Clone and install:

```bash
git clone git@github.com:robsartin/prospero.git
cd prospero
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
TEMPEST_API_TOKEN=your_token_here
TEMPEST_STATION_ID=your_station_id_here
```

**Get a token:** [Tempest Web App](https://tempestwx.com) > Settings > Data Authorizations > Create Token.

**Find your station ID:** Settings > Stations — the ID is in the URL or station details.

### Working in a git worktree

When using `git worktree add` for parallel branches, each worktree needs its own `node_modules` and `.env.local`:

```bash
git worktree add ../prospero-wt/my-branch -b my-branch main
cd ../prospero-wt/my-branch
npm ci
cp /path/to/main/checkout/.env.local .
```

Don't symlink `node_modules` from another checkout — Turbopack rejects symlinks pointing outside the project root and `next dev` will panic. `.env.local` can be symlinked or copied.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app auto-selects your first station and refreshes conditions every 60 seconds. Click the °C/°F button to toggle units.

## Development Rules

### TDD is mandatory

Every line of production code must be preceded by a failing test. See [ADR 0004](docs/adr/0004-pure-tdd.md).

```
1. Write ONE failing test          (RED)
2. Write minimum code to pass      (GREEN)
3. Commit                          (test + implementation together)
4. Refactor                        (keep tests green)
5. Commit                          (refactor only)
6. If stuck, revert to last green  (BACK OUT)
7. Repeat
```

### Branching and PRs

All development on feature branches. PRs to `main` require CI checks + manual review. See [ADR 0007](docs/adr/0007-branching-strategy.md).

| Prefix      | Use                    |
|-------------|------------------------|
| `feat/`     | New features           |
| `fix/`      | Bug fixes              |
| `refactor/` | Code improvements      |
| `docs/`     | Documentation          |
| `chore/`    | Tooling, CI, deps      |

### Never do these

- Display a raw number without `formatValue()` — always specify the metric kind
- Pass a unit string (`"metric"`, `"imperial"`) to a component — pass a `UnitStrategy` object
- Call `setState` synchronously in a `useEffect` body — use the async callback pattern
- Call the Tempest API directly from a client component — go through `/api/` routes
- Skip writing the failing test first — no exceptions
- Request more than 5 days from the device observation API in a single call — use `chunkTimeRange()`

### Tests

```bash
npm test                    # run all tests
npm run test:coverage       # run with coverage report
npx jest path/to/file       # run one test file
```

- **Jest 30** + **React Testing Library** + **@testing-library/user-event**
- 80% coverage enforced by CI (currently ~100% statements, 200+ tests)
- API route tests use `@jest-environment node` (need `Request`/`Response` globals)
- Recharts components are mocked in tests (jsdom has limited SVG support)
- Mock `global.fetch` at file scope, reset in `beforeEach`

### Lint

```bash
npm run lint
```

ESLint 9 with `eslint-config-next`. Zero errors required. Common gotchas:
- `react-hooks/set-state-in-effect` — use the async callback pattern
- `@typescript-eslint/no-require-imports` — use ES `import`, never `require()`
- `@typescript-eslint/no-unused-vars` — remove unused type imports from tests

## Project Structure

```
src/
  app/
    api/                    # Next.js API routes (proxy to Tempest)
      stations/route.ts     #   GET /api/stations
      observations/route.ts #   GET /api/observations?station_id=N
      forecast/route.ts     #   GET /api/forecast?station_id=N
      history/route.ts      #   GET /api/history?device_id=N&time_start=X&time_end=Y
    error.tsx               # Error boundary (storm photo + retry)
    layout.tsx              # Root layout (Geist fonts, metadata)
    page.tsx                # Dashboard page (client component, state)
  components/
    Header.tsx              # App header with children slot
    NavTabs.tsx             # Current/Forecast/History tabs
    StationPicker.tsx       # Station dropdown (auto-selects first, exposes Station)
    UnitToggle.tsx          # Unit toggle button (emits UnitStrategy)
    MetricCard.tsx          # Reusable metric tile (severityColor prop)
    CurrentConditions.tsx   # Metric grid (auto-refresh, unit-aware)
    DailySummary.tsx        # Today's extremes bar
    ErrorDisplay.tsx        # Error page with storm photo + retry
    ForecastStrip.tsx       # 10-day forecast (unit-aware)
    ForecastDay.tsx         # Single day card (emoji + hi/lo + precip)
    HistoryView.tsx         # Charts with chunked fetches (unit-aware)
    HistoryChart.tsx        # Recharts line chart (precision + domain props)
    RainChart.tsx           # Recharts area chart (precision + domain props)
    TimeRangeSelector.tsx   # Today/Week/Month/LastMonth/Year buttons
  hooks/
    useWeatherSocket.ts     # WebSocket hook for real-time data
    useUnitPreference.ts    # Unit state + localStorage persistence
  lib/
    chartDomain.ts          # Y-axis domain calculators per metric type
    config.ts               # Environment variable reader
    format.ts               # formatValue with per-metric precision rules
    severity.ts             # Color severity thresholds per metric
    tempest.ts              # Tempest API client (buildUrl returns URL)
    timeRanges.ts           # Named time ranges + 5-day chunking
    transforms.ts           # Raw device arrays -> TransformedObservation
    types.ts                # TypeScript interfaces for all API responses
    units.ts                # UnitStrategy interface + Metric/Imperial classes
    weatherEmoji.ts         # Condition icon/text -> emoji mapping
    websocket.ts            # WebSocket client with auto-reconnect
docs/
  adr/                      # Architecture Decision Records (see below)
```

## Key Patterns

### React 19 Effect Pattern

```tsx
const load = useCallback(async (id: number, signal: AbortSignal) => {
  setPending(true);
  try {
    const data = await fetchSomething(id, signal);
    if (!signal.aborted) {
      setData(data);
      setError(null);
    }
  } catch (err) {
    if (!signal.aborted && err instanceof Error && err.name !== "AbortError") {
      setError(err.message);
    }
  } finally {
    if (!signal.aborted) setPending(false);
  }
}, []);

useEffect(() => {
  if (!id) return;
  const controller = new AbortController();
  load(id, controller.signal);
  return () => controller.abort();
}, [id, load]);
```

### Testing API Routes

```ts
/** @jest-environment node */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/config", () => ({ getConfig: () => ({ token: "t" }) }));
const mockFn = jest.fn();
jest.mock("@/lib/tempest", () => ({ fetchSomething: (...a: unknown[]) => mockFn(...a) }));
```

### Unit Strategy Usage

```tsx
// In a component:
import { MetricUnitStrategy, type UnitStrategy } from "@/lib/units";
const DEFAULT = new MetricUnitStrategy();

function MyComponent({ units = DEFAULT }: { units?: UnitStrategy }) {
  const temp = formatValue("temperature", units.temp(rawCelsius));
  return <span>{temp} {units.labels.temp}</span>;
}
```

## CI/CD

GitHub Actions on every PR to `main`:

1. **Lint** — `npm run lint` (zero errors)
2. **Test** — `npm test -- --coverage --ci` (80% threshold)
3. **Build** — `npm run build` (TypeScript type check)

Branch protection: all 3 checks + 1 approval required.

## Deploy

### Vercel (recommended)

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Add environment variables: `TEMPEST_API_TOKEN`, `TEMPEST_STATION_ID`
3. Deploy

### Self-hosted

```bash
npm run build
npm start
```

Set `TEMPEST_API_TOKEN` and `TEMPEST_STATION_ID` in your environment.

## Architecture Decisions

See `docs/adr/` for all ADRs:

| ADR | Decision |
|-----|----------|
| [0001](docs/adr/0001-use-adrs.md) | Use Architecture Decision Records |
| [0002](docs/adr/0002-typescript-nextjs.md) | TypeScript + Next.js |
| [0003](docs/adr/0003-tailwind-recharts.md) | Tailwind CSS + Recharts |
| [0004](docs/adr/0004-pure-tdd.md) | Pure TDD workflow |
| [0005](docs/adr/0005-code-coverage.md) | 80% code coverage minimum |
| [0006](docs/adr/0006-test-tools.md) | Jest + React Testing Library |
| [0007](docs/adr/0007-branching-strategy.md) | Branch protection + PR workflow |
| [0008](docs/adr/0008-unit-strategy.md) | Strategy pattern for unit conversions |
| [0009](docs/adr/0009-display-precision.md) | Per-metric display precision rules |
| [0010](docs/adr/0010-history-chunking.md) | 5-day chunked history requests |
