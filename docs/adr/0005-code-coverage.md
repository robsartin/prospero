# ADR 0005: Require 80% Code Coverage

## Status

Accepted

## Date

2026-04-11

## Context

With a pure TDD workflow (ADR 0004), coverage should naturally be high. We want a CI-enforced floor to catch lapses and prevent coverage from eroding over time.

## Decision

We require a minimum of **80% code coverage** across lines, branches, functions, and statements. This is enforced by Jest's `coverageThreshold` configuration and checked in CI.

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Why 80%

- High enough to ensure meaningful coverage of business logic.
- Low enough to avoid wasting effort covering generated code, framework boilerplate, or trivial wrappers where tests add no value.
- With TDD, actual coverage will typically exceed 80%; the threshold is a safety net, not a target.

## Consequences

- CI fails if any coverage metric drops below 80%.
- Generated files and configuration files should be excluded from coverage via `coveragePathIgnorePatterns`.
- Coverage reports are generated on every CI run for visibility.
