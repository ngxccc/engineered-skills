# Sequential Atomic PRs Workflow

Keep a single working copy and always branch from and target `main`, merging each small layer before starting the next.

## When to Split into Sequential PRs

Use a single PR when work touches one cohesive layer or <= ~15–20 hand-written files with one trust boundary.

Split into sequential PRs against `main` when:

- Changes cross multiple dependency layers (DB schema + backend API + client UI).
- A change exceeds ~15–20 hand-written files or mixes unrelated trust boundaries.
- Implementing a large bundle decomposed into child sub-issues.

## Standard Bottom-Up Sequence (`main -> merge -> main`)

1. **PR 1 — Foundation (`base: main`)**:
   - ADR / design spec updates, shared enums/error codes/contracts, DB schema & additive migrations.
   - Branch: `core/<topic>-foundation` (or matching `docs/` / `core/` prefix).
   - Merge PR 1 into `main` so CI verifies migrations and shared contracts on `main`.
2. **PR 2 — Domain & API (`base: main`)**:
   - Pull `main` (`git checkout main && git pull --ff-only`), branch `feature/<topic>-api` (or `core/<topic>`).
   - Implement guards, DTOs, services, controllers, unit/integration tests, and generated OpenAPI/client types.
   - Merge PR 2 into `main`.
3. **PR 3 — Client / UI (`base: main`)**:
   - Pull `main`, branch `feature/<topic>-ui`.
   - Implement client hooks, forms, and tests consuming the merged API contracts, then merge into `main`.

## Cycle Between Sequential PRs

```bash
# After PR N is merged into main on GitHub:
git checkout main
git pull --ff-only
git branch -d <merged-branch>
git checkout -b <next-branch> main
```

Every PR targets `main` directly, runs full CI on `main`, needs no extra git worktrees, and avoids `--onto` rebase chains.

## Issue & Sequence Linking in `## Context`

Prefer one atomic GitHub sub-issue per PR (`Resolves: #<sub-issue>`) attached to the parent bundle/epic (`Part of: #<parent-issue>`):

```markdown
## Context

- Resolves: #<sub-issue-for-this-pr>
- Part of: #<parent-epic-or-bundle>
- Sequence:
  1. #<pr1> — foundation: ADR, shared contracts, DB migrations (merged)
  2. This PR — backend domain, API, integration tests
  3. Next — client UI & tests
```

Keep `Resolves: #<id>` scoped to what this PR finishes so merging PR 1 never closes a multi-PR parent issue prematurely.
