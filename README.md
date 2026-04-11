# Prospero

Tempest weather station dashboard — real-time conditions, 10-day forecast, and historical charts.

## Architecture

```
Browser                        Prospero (Next.js)                 Tempest API
  |                                  |                                |
  |  GET /api/stations       ------->|  fetchStations(token)  ------->|
  |  GET /api/observations   ------->|  fetchObservations()   ------->|
  |  GET /api/forecast       ------->|  fetchForecast()       ------->|
  |  GET /api/history        ------->|  fetchObservationHistory() --->|
  |                                  |                                |
  |  wss://ws.weatherflow.com  <-----|  (WebSocket passthrough)       |
  |                                  |                                |
  |  Token NEVER sent to browser     |  Token stored in .env.local    |
```

### Data Flow

```
Tempest API  -->  lib/tempest.ts  -->  lib/transforms.ts  -->  API Routes  -->  Components
  (raw JSON)      (typed fetch)       (snake_case->camelCase)   (proxy)         (React)
```

### Component Tree

```
layout.tsx
  page.tsx (client, manages state)
    Header
      StationPicker (fetches /api/stations, auto-selects first)
      UnitToggle (°C/°F)
    NavTabs (Current | Forecast | History)
    [Current tab]
      DailySummary (high/low/rain/gust)
      CurrentConditions (8 MetricCards, auto-refresh 60s)
    [Forecast tab]
      ForecastStrip
        ForecastDay x10
    [History tab]
      HistoryView
        TimeRangeSelector (24h/7d/30d/1y)
        HistoryChart x3 (temp, pressure, wind)
        HistoryChart (humidity)
        RainChart (area chart)
```

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

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app auto-selects your first station and refreshes conditions every 60 seconds.

## Development Workflow

We follow strict TDD (see [ADR 0004](docs/adr/0004-pure-tdd.md)):

```
1. Write ONE failing test          (RED)
2. Write minimum code to pass      (GREEN)
3. Commit                          (test + implementation together)
4. Refactor                        (keep tests green)
5. Commit                          (refactor only)
6. If stuck, revert to last green  (BACK OUT)
7. Repeat
```

### Branching

All development on feature branches. PRs to `main` require CI + manual review.

| Prefix      | Use                    |
|-------------|------------------------|
| `feat/`     | New features           |
| `fix/`      | Bug fixes              |
| `refactor/` | Code improvements      |
| `docs/`     | Documentation          |
| `chore/`    | Tooling, CI, deps      |

### Tests

```bash
npm test                    # run all tests
npm run test:coverage       # run with coverage report
npx jest path/to/file       # run one test file
```

- **Jest 30** + **React Testing Library** + **@testing-library/user-event**
- 80% coverage enforced by CI (currently ~100% statements)
- API route tests use `@jest-environment node` (need `Request`/`Response` globals)
- Recharts components are mocked in tests (jsdom has limited SVG support)

### Lint

```bash
npm run lint
```

ESLint 9 with `eslint-config-next`. React 19 enforces `react-hooks/set-state-in-effect` — use `useCallback` + async function pattern instead of calling `setState` directly in effect bodies.

## Project Structure

```
src/
  app/
    api/                    # Next.js API routes (proxy to Tempest)
      stations/route.ts     #   GET /api/stations
      observations/route.ts #   GET /api/observations?station_id=N
      forecast/route.ts     #   GET /api/forecast?station_id=N
      history/route.ts      #   GET /api/history?station_id=N&time_start=X&time_end=Y
    layout.tsx              # Root layout (Geist fonts, metadata)
    page.tsx                # Dashboard page (client component, state management)
  components/
    Header.tsx              # App header with children slot
    NavTabs.tsx             # Current/Forecast/History tabs
    StationPicker.tsx       # Station dropdown (auto-selects first)
    UnitToggle.tsx          # °C/°F toggle button
    MetricCard.tsx          # Reusable metric display tile
    CurrentConditions.tsx   # Metric grid with auto-refresh
    DailySummary.tsx        # Today's high/low/rain/gust bar
    ForecastStrip.tsx       # 10-day horizontal forecast
    ForecastDay.tsx         # Single forecast day card
    HistoryView.tsx         # Charts + time range selector
    HistoryChart.tsx        # Recharts line chart wrapper
    RainChart.tsx           # Recharts area chart for rain
    TimeRangeSelector.tsx   # 24h/7d/30d/1y toggle
  hooks/
    useWeatherSocket.ts     # WebSocket hook for real-time data
  lib/
    config.ts               # Environment variable reader
    tempest.ts              # Tempest API client (fetch functions)
    types.ts                # TypeScript interfaces for API responses
    transforms.ts           # Raw array -> named object transforms
    units.ts                # Imperial/metric conversion functions
    severity.ts             # Color severity thresholds per metric
    websocket.ts            # WebSocket client with auto-reconnect
docs/
  adr/                      # Architecture Decision Records
```

## Key Patterns

### API Token Security

The Tempest API token lives in `.env.local` (server-side only). All API calls go through Next.js route handlers in `src/app/api/` — the token is never sent to the browser.

### React 19 Effect Pattern

React 19's linter forbids calling `setState` synchronously in effects. Use this pattern:

```tsx
const load = useCallback(async (signal: AbortSignal) => {
  // setState calls are OK inside async callbacks
  const data = await fetch(url, { signal });
  if (!signal.aborted) setData(data);
}, []);

useEffect(() => {
  const controller = new AbortController();
  load(controller.signal);
  return () => controller.abort();
}, [load]);
```

### Testing API Routes

API route tests need the Node environment (not jsdom) for `Request`/`Response`:

```ts
/** @jest-environment node */
import { GET } from "./route";
import { NextRequest } from "next/server";
```

## CI/CD

GitHub Actions runs on every PR to `main`:

1. **Lint** — `npm run lint`
2. **Test** — `npm test -- --coverage --ci`
3. **Build** — `npm run build` (depends on lint + test passing)

Branch protection requires all 3 checks + 1 approval.

## Deploy

### Vercel (recommended)

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Add environment variables: `TEMPEST_API_TOKEN`, `TEMPEST_STATION_ID`
3. Deploy

### Self-hosted

```bash
npm run build
npm start        # starts on port 3000
```

Set `TEMPEST_API_TOKEN` and `TEMPEST_STATION_ID` in your environment.

## Architecture Decisions

See `docs/adr/` for all ADRs:

| ADR | Decision |
|-----|----------|
| 0001 | Use Architecture Decision Records |
| 0002 | TypeScript + Next.js |
| 0003 | Tailwind CSS + Recharts |
| 0004 | Pure TDD workflow |
| 0005 | 80% code coverage minimum |
| 0006 | Jest + React Testing Library |
| 0007 | Branch protection + PR workflow |
