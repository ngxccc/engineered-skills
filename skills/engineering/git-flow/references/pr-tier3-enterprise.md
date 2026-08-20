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

Fixes: #104
Signed-off-by: Developer <dev@company.com>
ADR: docs/adr/0002-jwt-bearer-auth.md
```

---

## 2. PR Body Markdown Template

```markdown
## Summary & Architectural Intent

High-level description of architectural changes and system-level rationale.

## Linked ADR / RFC Spec

- ADR / RFC: `docs/adr/NNNN-slug.md` (Mandatory for Tier 3 changes)

## Type of Change

- [ ] core: Architectural / Kernel overhaul
- [ ] breaking: Breaking API change (`!`)
- [ ] security: Security vulnerability patch
- [ ] schema: Database migration / DDL update

## Detailed Architectural Impact

- **Data Models / State**: Changes to state machines or database tables.
- **Interfaces / Seams**: API contracts or boundary modifications.
- **Performance & Latency Impact**: Expected latency/throughput tradeoffs.

## Atomic Commit Verification

- [ ] Every commit in PR branch compiles and passes test suite independently.

## Verification Evidence & Logs
```

[Paste full terminal test logs, benchmark execution outputs, or integration test evidence]

```

## Security & Audit Assessment
- [ ] Zero hardcoded credentials or unmasked secrets
- [ ] RBAC / Authorization boundaries validated
- [ ] Production rollback strategy documented
```
