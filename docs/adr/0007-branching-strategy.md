# ADR 0007: Branch Protection and PR Workflow

## Status

Accepted

## Date

2026-04-11

## Context

We need a branching strategy that supports TDD's frequent small commits while keeping `main` stable and deployable at all times.

## Decision

- **`main` is locked.** No direct pushes. All changes enter via pull request.
- **All development happens on feature branches** named descriptively (e.g., `feat/current-conditions`, `fix/websocket-reconnect`).
- **PRs require:**
  - All CI checks passing (lint, tests, coverage threshold)
  - At least one approval (when collaborators are present)
- **Merge strategy:** Squash merge to keep `main` history clean, unless the granular TDD commit history is valuable for that PR.

### Branch naming conventions

| Prefix | Use |
|--------|-----|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `refactor/` | Code improvements without behavior change |
| `docs/` | Documentation only |
| `chore/` | Tooling, CI, dependency updates |

## Consequences

- `main` always passes CI and is deployable.
- Feature branches are short-lived; merge early and often.
- GitHub branch protection rules enforce these constraints automatically.
- Developers must create a branch before writing any code.
