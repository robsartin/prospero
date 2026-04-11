# ADR 0006: Test Tooling — Jest and React Testing Library

## Status

Accepted

## Date

2026-04-11

## Context

We need test tools that support our TDD workflow (ADR 0004), work well with TypeScript and Next.js, and enable testing at multiple levels (unit, component, integration).

## Decision

We will use:

- **Jest** — Test runner and assertion library. Configured with `ts-jest` for TypeScript support and `jest-environment-jsdom` for DOM simulation.
- **React Testing Library (`@testing-library/react`)** — Component testing that encourages testing behavior over implementation details.
- **`@testing-library/user-event`** — Simulates realistic user interactions (clicks, typing) for component tests.
- **`@testing-library/jest-dom`** — Custom Jest matchers for DOM assertions (`toBeInTheDocument`, `toHaveTextContent`, etc.).

### Test categories

| Level | Tool | What it tests |
|-------|------|---------------|
| Unit | Jest | `lib/` functions: API client, transforms, utilities |
| Component | Jest + RTL | React components: rendering, interaction, state |
| API Route | Jest | `src/app/api/` route handlers with mocked fetch |

## Alternatives Considered

- **Vitest**: Faster, but Next.js ecosystem tooling and examples are still more mature with Jest.
- **Playwright/Cypress**: Considered for E2E but deferred; unit and component tests come first in TDD.

## Consequences

- All tests live alongside source files as `*.test.ts` or `*.test.tsx`.
- Jest config is in `jest.config.ts` at the project root.
- CI runs `npm test` which executes Jest with coverage.
