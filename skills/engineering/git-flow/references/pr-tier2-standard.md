# Tier 2 PR Specification (Standard Feature / Fix / Refactor)

Balanced rigor template for routine features, bug fixes, and module refactoring.

---

## Title Standard

```
<type>(<scope>): <summary>
```

Examples:

- `feat(auth): add PayOS webhook handler`
- `fix(db): resolve deadlock on concurrent order locks`

---

## PR Body Markdown Template

```markdown
## Summary

[Optional visual: screenshot/image, Mermaid diagram, call tree, or diff sketch - include only if helpful]

Concise explanation of changes introduced by this PR and the technical reason.

## Context

- Resolves: #<issue_number> <!-- If completing an issue -->
- Relates to: #<issue_number> <!-- If referencing an issue without closing -->
- None <!-- If standalone / no related issue -->

## Changes

Type of change:

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] refactor: Code refactoring
- [ ] perf: Performance improvement
- [ ] test: Testing updates
- [ ] docs: Documentation update
- [ ] chore: Maintenance update

Key changes:

- Technical breakdown of specific changes made across files/packages.

## Evidence

- **Before:** <embedded screenshot/image, failing test execution log, or old behavior>
- **After:** <embedded screenshot/image, passing test execution log, or new behavior>

## Risk

- **Door:** <two-way door (low risk, cheap to roll back) | one-way door (high friction/irreversible)>
- **Blast Radius:** <scope of impact, downstream modules, or services affected>

## Checklist

- [ ] Type check passed (`tsc --noEmit` / language equivalent)
- [ ] Unit & integration test suite passed
- [ ] Manual verification completed
- [ ] Zero hardcoded secrets or API tokens
- [ ] No breaking changes to existing public APIs
```
