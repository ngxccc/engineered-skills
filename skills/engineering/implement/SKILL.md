---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

# Implement

Implement the work described by the user in the spec or tickets.

## Process

### 1. Read Repository Standards

Before writing code or tests, ALWAYS read the standards in `docs/standards/` (or `skills/engineering/setup-skills/references/standards/` if uninitialized; run `/setup-skills` if missing):

- `docs/standards/code-comment-taxonomy.md`
- `docs/standards/testing-and-fixtures.md`
- `docs/standards/security-and-cryptography.md`
- `docs/standards/concurrency-and-locking.md`
- `docs/standards/api-design-and-error-handling.md`
- `docs/standards/database-and-migrations.md`
- `docs/standards/git-flow-and-pr-matrix.md`
- `CONTEXT.md` and ADRs under `docs/adr/` (if present)

### 2. Drive TDD via Vertical Slices

Execute implementation test-first via [`/tdd`](../tdd/SKILL.md) at pre-agreed public seams:

- Work one vertical slice (tracer bullet) at a time: failing test (red) → minimal code (green) → clean refactor.
- Test observable behavior at the interface, avoiding implementation-coupled tests.

### 3. Continuous Verification

- Run typechecking (`tsc --noEmit` or language equivalent) regularly during development.
- Run single test files frequently during slice iterations.
- Run the full project test suite once at the end before code review.

### 4. Code Review Gate

Once implementation is complete, run [`/code-review`](../code-review/SKILL.md) to audit changes along both axes:

- **Standards Axis**: Verify compliance with `docs/standards/` and the code smell baseline.
- **Spec Axis**: Verify completeness against the ticket / formal spec without scope creep.

### 5. Atomic Conventional Commits

Format Conventional Commits using [`git-flow`](../git-flow/SKILL.md) (`node skills/engineering/git-flow/scripts/format-commit.mjs`).
