# Stacked Pull Requests Workflow

Split large multi-layer work into small, sequentially dependent PRs so reviewers inspect 150–400 hand-written lines per layer instead of one 50+ file diff.

## When to Stack vs Single PR

Use a single PR when work touches one cohesive layer or <= ~15 hand-written files with one trust boundary.

Split into a PR stack when any of these apply:

- Changes cross multiple dependency layers (DB schema + backend API + client UI).
- A PR exceeds ~15–20 hand-written files or spans >1 trust boundary or contract migration.
- Implementing a large bundle decomposed into sequenced child issues.

## Standard Bottom-Up Stack Order

Each PR targets the branch immediately below it (`PR 2` bases on `PR 1`):

1. **Stack 1 — Foundation (`--base main`)**:
   - ADR / design spec updates, shared enums/error codes/contracts, DB schemas & additive migrations.
   - Branch pattern: `<type>/<topic>-1-foundation` (or `-1-schema`).
2. **Stack 2 — Domain & API (`--base <stack-1-branch>`)**:
   - Guards, filters, DTOs, services, controllers, unit & integration tests, and generated API contract sync.
   - Branch pattern: `<type>/<topic>-2-api`.
3. **Stack 3 — Client / UI (`--base <stack-2-branch>`)**:
   - Client hooks, forms, UI states, and client tests consuming synced API contracts.
   - Branch pattern: `<type>/<topic>-3-ui`.

_(If an API change itself exceeds ~20 hand-written files, split shared/schema foundations into Stack 1, cross-cutting infra/hardening into Stack 2, and feature endpoints/E2E into Stack 3.)_

## Creating Stacked Branches & PRs

```bash
# 1. Foundation branch from main
git checkout main && git pull --ff-only
git checkout -b core/<topic>-1-foundation
# ... commit & push ...
node skills/engineering/git-flow/scripts/create-pr.mjs \
  --tier 3 --base main --title "[1/3] core(shared): <summary>" --body-file /tmp/pr1.md --execute

# 2. Dependent API branch from Stack 1 (not main)
git checkout -b core/<topic>-2-api
# ... commit & push ...
node skills/engineering/git-flow/scripts/create-pr.mjs \
  --tier 3 --base core/<topic>-1-foundation --draft \
  --title "[2/3] feat(api): <summary>" --body-file /tmp/pr2.md --execute
```

Use `--draft` on upper PRs when lower PRs are still undergoing architecture review so CI and reviewers stay focused bottom-up.

## Stack Lineage in PR `## Context`

Include a stack map in every stacked PR body:

```markdown
## Context

- Stack:
  1. #<pr1> (base: `main`) — foundation: docs, shared contracts, DB migrations
  2. #<pr2> (this PR, base: `<branch-1>`) — backend domain & API
  3. #<pr3> (base: `<branch-2>`) — client UI & integration
- Part of: #<epic-or-parent-issue>
- Resolves: #<child-issue-for-this-layer>
```

Keep `Resolves: #<id>` scoped to the issue that layer actually completes; use `Part of: #<id>` on intermediate slices.

## Retargeting After a Lower PR Merges

Always merge **bottom-up** (`#PR1` -> `#PR2` -> `#PR3`). Once `#PR1` merges into `main`:

```bash
# 1. Point Stack 2 PR base to main on GitHub before merging
gh pr edit <pr2-number> --base main

# 2. Update local main and rebase Stack 2 cleanly
git fetch origin main
git checkout core/<topic>-2-api
git rebase --onto origin/main origin/core/<topic>-1-foundation

# 3. Re-verify checks/tests, then push with lease
git push --force-with-lease origin core/<topic>-2-api

# 4. Mark Stack 2 ready for review if it was draft
gh pr ready <pr2-number>
```

Retarget to `main` after the parent lands before merging Stack 2 so diffs and commit history stay clean.
