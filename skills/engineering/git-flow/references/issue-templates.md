# Issue Templates Specification

Lean, single-noun issue specifications for software engineering workflows with agents and human contributors.

---

## Title Standard

All issues MUST use the Conventional Commit format:

```text
<type>(<scope>): <summary>
```

- **Types:** `task`, `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`.
- **Examples:**
  - `task(sync): implement upstream diff parser`
  - `feat(auth): add OAuth2 token refresh endpoint`
  - `fix(db): resolve lock contention on order status updates`

---

## 1. Task (Tracer-Bullet Vertical Slice)

Used when decomposing a feature, spec, or plan into vertical slices via `/to-tickets` or sub-issues.

```markdown
## Context

- Parent: #<issue_number> <!-- Or None if root task -->
- Blocked by: #<issue_number> <!-- Or None if ready immediately -->

## Scope

Concise description of the end-to-end behavior delivered by this ticket from the user/system perspective (avoid layer-by-layer file inventories).

## Acceptance

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Automated or manual verification scenario passes
```

---

## 2. Bug Report

Used when reporting unexpected behavior, crashes, or test failures.

```markdown
## Summary

Clear and concise description of the bug and what was expected to happen instead.

## Reproduction

1. Minimal step 1
2. Minimal step 2
3. Observed error or failure

## Environment

- OS / Runtime / Package version:
- Relevant log output or error stack trace:
```

---

## 3. Feature / Proposal

Used for architectural changes, major new capabilities, or RFC proposals.

```markdown
## Summary

Motivation and problem statement: why is this capability needed?

## Proposal

High-level architecture and implementation approach.

## Context

- ADR / RFC: `docs/adr/NNNN-slug.md` <!-- If applicable, or None -->
- Alternatives considered / trade-offs:
```
