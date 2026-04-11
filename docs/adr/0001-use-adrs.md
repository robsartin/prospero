# ADR 0001: Use Architecture Decision Records

## Status

Accepted

## Date

2026-04-11

## Context

We need a lightweight way to capture and communicate significant architectural and process decisions so that current and future contributors understand *why* the project is shaped the way it is — not just *what* it looks like today.

## Decision

We will use Architecture Decision Records (ADRs) as described by Michael Nygard. Each ADR is a short Markdown file stored in `docs/adr/` and numbered sequentially. ADRs are immutable once accepted; if a decision is reversed, a new ADR supersedes the old one.

## Consequences

- Every significant technical or process decision gets a permanent, discoverable record.
- New contributors can read the ADR log to understand project history.
- We accept the small overhead of writing an ADR for each decision.
