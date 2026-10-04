# Conventional Commits & PR Tier Matrix

Defines Conventional Commit specifications, rules, and the 3-Tier PR Selection Matrix.

---

## Conventional Commit Structure

```
<type>(<scope>): <imperative summary>

[optional body explaining why, what, and tradeoffs]

[optional footer: BREAKING CHANGE: ..., Signed-off-by: Author <email>]
```

### Issue Closing & Linking Protocol

1. **Pull Request Descriptions (Primary)**: Declare `Resolves: #<id>` (to auto-close upon merge) or `Relates to: #<id>` (for non-closing reference / backlink) under `## Context` in the PR body.
2. **Atomic Commit Messages**: Focus strictly on technical context and rationale. Footers are optional and reserved for `BREAKING CHANGE:` or standalone bugfix trailers (`Fixes: <hash>` per Linux kernel conventions).

### Allowed Types

- `feat`: A new feature for the user or system.
- `fix`: A bug fix.
- `refactor`: Code refactoring without functional change.
- `perf`: Performance optimization.
- `test`: Adding missing tests or correcting existing tests.
- `docs`: Documentation changes only.
- `chore`: Maintenance tasks, dependency updates, or build configuration changes.
- `security`: Security patches or authorization updates.
- `core`: Core architecture changes.

### Commit Header Rules

1. **Imperative Mood**: Use imperative verbs ("add" not "added" or "adds", "fix" not "fixed").
2. **Max Length**: Maximum 72 characters for the header line.
3. **No Trailing Period**: Do NOT end header with `.`.
4. **No Emojis**: Strictly prohibited.
5. **Breaking Changes**: Add `!` after type/scope (e.g. `feat(auth)!: ...`) or `BREAKING CHANGE:` in footer.

### Commit Helper Script

Validate and format commits using helper script:

```bash
node skills/engineering/git-flow/scripts/format-commit.mjs --type feat --scope auth --summary "add PayOS webhook handler" --signoff
```

---

## Atomic Commit Slicing Protocol

When changes touch multiple distinct modules or concerns, **never squash them into a single unorganized commit**. Group changes logically by path/scope and commit sequentially:

```bash
# Step 1: Commit documentation changes
git add docs/
node skills/engineering/git-flow/scripts/format-commit.mjs --type docs --scope architecture --summary "update system design docs"

# Step 2: Commit core logic changes
git add src/modules/auth/
---

## Human Audit Protocol

1. When asked to commit, run `format-commit.mjs` without `--execute` to propose the message.
2. Wait for explicit user approval ("commit") before executing `git commit`.
node skills/engineering/git-flow/scripts/format-commit.mjs --type feat --scope auth --summary "add OAuth2 refresh token"

# Step 3: Commit test updates
git add tests/auth/
node skills/engineering/git-flow/scripts/format-commit.mjs --type test --scope auth --summary "add refresh token integration test"
```

---

## 3-Tier PR Selection Matrix

| Tier                      | Scope / Risk                                             | Reference Template                                            | Key Requirements                                                            |
| :------------------------ | :------------------------------------------------------- | :------------------------------------------------------------ | :-------------------------------------------------------------------------- |
| **Tier 1 (Patch)**        | Typo, docs, minor dependency bump.                       | [`references/pr-tier1-patch.md`](pr-tier1-patch.md)           | 2-line PR body, minimal ceremony.                                           |
| **Tier 2 (Standard)**     | Feature, bugfix, module refactor (Default).              | [`references/pr-tier2-standard.md`](pr-tier2-standard.md)     | Full 6-section PR body with visual summary and evidence.                    |
| **Tier 3 (Kernel-Grade)** | Core architecture, DB schema, security, breaking change. | [`references/pr-tier3-enterprise.md`](pr-tier3-enterprise.md) | Atomic commits, mandatory ADR/RFC link, Signed-off-by, full benchmark logs. |
