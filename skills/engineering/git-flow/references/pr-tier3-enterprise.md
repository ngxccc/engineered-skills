# Tier 3 PR Specification (Kernel-Grade / Audit-Ready Enterprise)

High rigor, audit-ready template for core architecture changes, breaking API changes, DB schema migrations, and security patches.

---

## 1. Commit Protocol (Kernel-Grade Atomic Commits)

- Every commit in the PR MUST be atomic: buildable and testable independently. No `wip` or `fixup` commits.
- Breaking changes MUST include `!` in the prefix or `BREAKING CHANGE:` in the commit footer.
- Commit body MUST explain:
  1. **Problem / Motivation**: Why the change is needed.
  2. **Solution**: Architectural approach taken.
  3. **Trade-offs**: Explicitly named trade-offs.

### Example Commit Format

```git
feat(auth)!: replace session cookies with JWT bearer tokens

Session cookies do not scale across microservice boundaries. Replacing with
RS256 signed JWT tokens verified at edge gateways.

BREAKING CHANGE: Authentication header now requires `Bearer <token>`.

Signed-off-by: Developer <dev@company.com>
```

---

## 2. PR Body Markdown Template

```markdown
## Summary

[Optional visual: Mermaid diagram, architecture image, call tree, or component hierarchy - include if helpful]

System-level architectural rationale and intent.

## Context

- ADR / RFC: `docs/adr/NNNN-slug.md` (Mandatory for Tier 3 changes)
- Resolves: #<issue_number> <!-- If completing an issue -->
- Relates to: #<issue_number> <!-- If referencing an issue without closing -->
- None <!-- If no related issue -->

## Type

- [ ] core: Architectural / Kernel overhaul
- [ ] breaking: Breaking API change (`!`)
- [ ] security: Security vulnerability patch
- [ ] schema: Database migration / DDL update

## Evidence

- **Before:** <benchmark metrics, system state, or previous behavior>
- **After:** <benchmark metrics, system state, or observed new behavior>

## Risk

- **Door:** <one-way door (breaking DDL, permanent migration, security cutover) | two-way door>
- **Blast Radius:** <exact downstream consumers, services, or data stores affected>
- **Rollback:** <documented step-by-step procedure to revert if failure occurs>

## Notes

- <Special instructions for deployment, migration sequencing, review strategy, or None>
```
