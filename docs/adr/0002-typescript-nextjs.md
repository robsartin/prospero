# ADR 0002: Use TypeScript and Next.js

## Status

Accepted

## Date

2026-04-11

## Context

We need a language and framework for a weather dashboard that:
- Consumes the Tempest WeatherFlow REST and WebSocket APIs
- Renders data-dense views (current conditions, forecasts, historical charts)
- Keeps API tokens server-side (not exposed to the browser)
- Supports real-time updates

## Decision

We will use **TypeScript** as the primary language and **Next.js** (App Router) as the framework.

### Rationale

- **TypeScript**: The Tempest API returns complex nested JSON with positional arrays. Static types prevent bugs when mapping raw sensor data to named fields and catch integration errors at compile time.
- **Next.js**: Server-side API routes proxy Tempest calls and keep tokens secure. The App Router provides good layout composition for a multi-view dashboard. React's component model fits a tile-based weather UI.

## Consequences

- All source code is TypeScript (strict mode).
- Server-side API routes in `src/app/api/` proxy all Tempest API calls.
- Contributors need familiarity with React and Next.js conventions.
