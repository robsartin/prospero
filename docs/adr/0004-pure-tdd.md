# ADR 0004: Pure Test-Driven Development

## Status

Accepted

## Date

2026-04-11

## Context

We want a development process that produces well-tested, incrementally designed code and prevents regressions from the start.

## Decision

We will follow a strict TDD workflow for all production code:

1. **Red** — Write exactly one failing test that describes the next behavior.
2. **Green** — Write the minimum code to make that test pass.
3. **Commit** — Commit the passing test and implementation together.
4. **Refactor** — Improve the code (extract, rename, simplify) while keeping all tests green.
5. **Commit** — Commit the refactor separately.
6. **Back out** — If a change breaks tests and the fix isn't obvious, revert to the last green commit rather than debugging forward.
7. **Repeat.**

### Rules

- No production code is written without a failing test first.
- Each commit represents either a new passing test or a refactor — never both.
- Reverts are preferred over extended debugging sessions on broken code.
- Test descriptions use plain language that describes behavior, not implementation.

## Consequences

- Commit history is granular: small, focused commits that are easy to review and bisect.
- The test suite is always the authoritative specification of system behavior.
- Developers must resist the urge to write production code before the test.
- Reverts are a normal, expected part of the workflow — not a sign of failure.
