# ADR 0010: 5-Day Chunked History Requests

## Status

Accepted

## Date

2026-04-11

## Context

The Tempest device observation API (`/observations/device/{device_id}`) limits time-range queries to a maximum of 5 days per request. Users want to view history for longer periods: a week, a month, or a full year.

The station observation endpoint (`/observations/station/{station_id}`) does not support time ranges at all — it always returns only the latest observation.

## Decision

We use a **chunking strategy** for historical data:

1. `getTimeRange(range)` computes `[start, end]` epoch seconds for named ranges:
   - **Today** — midnight UTC of current day to now
   - **This Week** — 7 days ending now
   - **Past Month** — 30 days ending now
   - **Last Month** — first to last day of previous calendar month
   - **Past Year** — 365 days ending now

2. `chunkTimeRange(start, end)` splits any range into consecutive ≤5-day windows with no gaps.

3. `HistoryView` fires all chunk requests in parallel via `Promise.all`, then concatenates results.

4. The API route (`/api/history`) handles a single chunk: accepts `device_id`, `time_start`, `time_end`, calls `fetchDeviceHistory`, transforms raw arrays via `transformObservation`, returns `TransformedObservation[]`.

### Why parallel requests

- A year of data requires ~73 requests. Sequential execution would take minutes.
- `Promise.all` fires them concurrently, limited only by browser connection limits (~6 per host).
- If any chunk fails, the entire `Promise.all` rejects and the error is shown to the user.

### Why device endpoint, not station

- The station endpoint (`/observations/station/{id}`) ignores `time_start`/`time_end` and returns only the latest observation.
- The device endpoint returns raw observation arrays for the requested time range.
- The ST (Tempest) device ID is resolved from `station.devices` when the user selects a station.

## Consequences

- `HistoryView` takes a `deviceId` prop, not `stationId`. The parent resolves the device ID from the station.
- Large ranges (year) generate many parallel requests. This is acceptable for a personal dashboard but could hit rate limits on shared deployments.
- The `TransformedObservation` type uses camelCase field names (from `transforms.ts`), not the snake_case `StationObservation` type.
- Time ranges are defined in `src/lib/timeRanges.ts` — adding a new range means adding to the `TimeRange` union, `getTimeRange` switch, and `TimeRangeSelector` display list.
