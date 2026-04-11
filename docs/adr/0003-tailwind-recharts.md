# ADR 0003: Use Tailwind CSS and Recharts

## Status

Accepted

## Date

2026-04-11

## Context

The dashboard needs styling for a data-dense layout (metric tiles, forecast strips, responsive grids) and charting for historical weather data (temperature trends, rain accumulation, pressure over time).

## Decision

We will use **Tailwind CSS** for styling and **Recharts** for data visualization.

### Rationale

- **Tailwind CSS**: Utility-first CSS enables rapid iteration on dashboard layouts without fighting a component library's opinions. Built-in responsive utilities handle mobile/desktop views. No runtime cost.
- **Recharts**: React-native charting library built on D3. Composable, declarative API that fits naturally into React components. Supports line, area, bar, and composed charts — all needed for weather history views. Good TypeScript support.

## Alternatives Considered

- **Chart.js / react-chartjs-2**: Mature but imperative API doesn't compose as naturally in React.
- **CSS Modules / styled-components**: More boilerplate for a dashboard-style app with many small layout tweaks.

## Consequences

- Tailwind utility classes are used directly in JSX; no separate CSS files.
- `tailwind.config.ts` is the source of truth for design tokens (colors, spacing).
- Recharts is the sole charting library; all time-series and statistical charts use it.
