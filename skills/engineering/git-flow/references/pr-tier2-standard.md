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

Concise explanation of changes introduced by this PR and the technical reason.

## Type of Change

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] refactor: Code refactoring
- [ ] perf: Performance improvement
- [ ] test: Testing updates
- [ ] docs: Documentation update
- [ ] chore: Maintenance update

## Context & Related References

- Relates to #<issue_number>

## Changes Made

- Technical breakdown of specific changes made across files/packages.

## Verification & Testing

- [ ] Type check passed (`bun run check-types` / `tsc --noEmit`)
- [ ] Unit & integration test suite passed (`bun test`)
- [ ] Manual verification completed

### Testing Evidence
```

[Paste execution output, test suite logs, or smoke test command results here]

```

## Security & Compliance Checklist
- [ ] No hardcoded secrets or API tokens
- [ ] Zero Semantic Noise commenting standards maintained
- [ ] Backwards-compatibility verified
```
