# ADR 0011: WebSocket Token Exposure (Accepted Risk)

## Status

Accepted (with documented mitigations as future work)

## Date

2026-04-14

## Context

`src/lib/websocket.ts` connects to `wss://ws.weatherflow.com/swd/data` and authenticates by appending the user's Tempest API token as a query string parameter:

```ts
const url = `${WS_URL}?token=${this.options.token}`;
```

This was flagged in code review (issue #76) as a security concern. Query-string credentials are visible in:

- Browser history (mitigated for `wss://` since the URL isn't a navigation, but devtools still show it)
- DevTools Network → WS frame
- `window.performance.getEntries()` accessible to any script on the page (XSS risk amplifier)
- Server-side proxy / reverse-proxy access logs (if any forward our requests)

## Why this is the current shape

Tempest's WebSocket API requires the token as a `?token=` query parameter ([Tempest API docs — Realtime API](https://weatherflow.github.io/Tempest/api/ws.html)). They do not document a header-based or message-based auth alternative.

Browsers' WebSocket constructor cannot set custom HTTP headers. The only header-style option is the `Sec-WebSocket-Protocol` header, which Tempest does not consume.

So at the protocol layer with the browser as the client, query-string is the only path.

## Decision

Accept the exposure for now. We are a personal dashboard with a single user account; the realistic threat model is:

1. **Malicious script in our own bundle (XSS)** — already game-over; reading the token from `localStorage` or memory is no harder than reading `performance.getEntries()`.
2. **Malicious browser extension** — same.
3. **Network observer** — TLS protects the URL in transit; not a concern.
4. **Shared device with browser history** — `wss://` URLs are not in navigation history, only DevTools.

The token grants read access to weather data for the account's stations only. No write capabilities, no PII beyond station location.

## Future mitigations (not implemented)

If we ever multi-tenant this app, we should:

1. **Server-side WebSocket proxy** — Next.js server connects to Tempest using the token (server-side env var); browser connects to our server via session cookie. Token never reaches the browser. Requires a long-lived WebSocket-capable backend (Vercel serverless functions don't support persistent WS).
2. **Per-session scoped token** — if Tempest ever supports it, mint a read-only, time-bounded token server-side and ship that to the browser instead of the account token.

## Consequences

- `src/lib/websocket.ts` keeps the current `?token=...` shape; we add no defensive theater (e.g., obfuscation) that doesn't actually move the threat model.
- Issue #76 is closed referencing this ADR; reopening should require a real change in deployment model (multi-tenant) or a new Tempest auth option.
- README setup instructions remind users that the token is treated as user-equivalent — it should not be shared.
