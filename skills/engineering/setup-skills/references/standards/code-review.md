# Code Review Standards

Repo-specific overrides and checklist deltas for `/code-review` (the skill reads this file during its Standards axis).

## Diff Noise & Tool-Enforced Skips

- **Exclude from primary sub-agent diff**: lockfiles, generated OpenAPI/schema files, and snapshot artifacts (e.g., `**/openapi.json`, `**/api-schema.d.ts`, `**/snapshot.json`).
- **Skip tool-enforced checks**: leave formatting, lint rules, and static type errors to the repo's configured formatter, linter, and typechecker.

## Repo Layer & UI Overrides

- **Backend / Data / API**: record project-specific ORM projection helpers, shared error contract envelopes, auth decorators, or transaction helpers that reviewers must verify.
- **Frontend / UI**: record design token packages, shared UI primitives, BFF/client boundaries, and test invariant markers if applicable.

## Generated Contract Spot-Check

- **Target file**: `<path/to/generated/api-schema.d.ts>` (inspect generated TypeScript types rather than raw OpenAPI JSON when contracts or migrations change).
- Check for unexpected `data?:`, `Record<string, never>` on null-data endpoints, `unknown` field regressions, and enum/status parity with controllers.

## Design & Structural Invariants

- **Model the Domain & Type Discipline**: Encode stateful logic and repeated shape assumptions in explicit state machines, tables/registries, or branded/discriminated types so illegal states are unrepresentable; parse untrusted external data at boundaries and keep internal logic pure.
- **Minimize Reader Load & Subtract First**: Remove dead weight before adding abstractions, collapse one-caller wrappers, and shrink mutable scope.
- **Clean Cutover (Migrate & Delete in One Wave)**: When introducing a new internal API or target architecture, migrate all callers and delete legacy APIs/throwaway compatibility shims in the same wave.
