# Prospero

Tempest weather station dashboard — status, history, and forecast.

## Prerequisites

- Node.js 20+
- npm
- A Tempest WeatherFlow account with a Personal Access Token

## Setup

1. Clone the repo and install dependencies:

```bash
git clone git@github.com:robsartin/prospero.git
cd prospero
npm install
```

2. Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

3. Edit `.env.local` with your Tempest credentials:

```
TEMPEST_API_TOKEN=your_token_here
TEMPEST_STATION_ID=your_station_id_here
```

To get a token: open the [Tempest Web App](https://tempestwx.com), go to **Settings > Data Authorizations > Create Token**.

To find your station ID: go to **Settings > Stations** — the ID is shown in the URL or station details.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm test                # run all tests
npm run test:coverage   # run with coverage report
```

80% coverage is enforced by CI.

## Lint

```bash
npm run lint
```

## Project Structure

```
src/
  app/
    api/              # Next.js API routes (proxy to Tempest API)
      stations/
      observations/
      forecast/
    layout.tsx        # Root layout
    page.tsx          # Dashboard page
  components/         # React components
  hooks/              # Custom React hooks
  lib/                # API client, types, transforms, config
docs/
  adr/                # Architecture Decision Records
```

## Architecture Decisions

See `docs/adr/` for all ADRs covering language choices, TDD policy, test tooling, coverage requirements, and branching strategy.
