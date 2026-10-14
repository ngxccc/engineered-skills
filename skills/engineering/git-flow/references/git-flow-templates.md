# Conventional Commits & Slicing Reference

Detailed Conventional Commit rules, atomic slicing patterns, and helper script usage.

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
node skills/engineering/git-flow/scripts/format-commit.mjs --type feat --scope auth --summary "add OAuth2 refresh token"

# Step 3: Commit test updates
git add tests/auth/
node skills/engineering/git-flow/scripts/format-commit.mjs --type test --scope auth --summary "add refresh token integration test"
```

### Bulleted Descriptions Format

When proposing atomic commit plans or including a commit body, **NEVER write long, dense paragraphs**. Format descriptions as concise, high-signal bullet points (`- ...`):

```markdown
1. deb3cea - feat(ui): add reusable LoadingScreen component:
   - Add standalone LoadingScreen.tsx supporting both full-screen and inline containers.
2. 7ff4bb0 - refactor(auth): migrate session management to Zustand useAuthStore:
   - Add useAuthStore.ts centralizing session token, user profile, and logout flow.
   - Update useUIStore.ts to sync .dark class to <html> upon store initialization.
   - Eliminate prop-drilling across App.tsx, AppRoutes.tsx, LoginPage.tsx, RegisterPage.tsx, ProtectedRoute.tsx, SidebarUserProfile.tsx, and TopNav.tsx.
3. a372d91 - refactor(dashboard): eliminate prop-drilling in canvas and modals:
   - Remove hasPrivatePin prop-drilling from Sidebar.tsx and NoteSidebarItem.tsx (delegate directly to NoteActionMenu.tsx via auth store).
   - Connect NoteEditor.tsx and UnlockCard.tsx to useWorkspaceStore fallback, decoupling DocumentCanvas.tsx.
   - Connect SearchModal.tsx directly to useUIStore and useWorkspaceStore, freeing WorkspaceLayoutContent from 7 intermediate props and unnecessary search re-renders.
4. e27bd99 - docs(architecture): update session design spec and standardize ADR frontmatters:
   - Update Mermaid sequence diagram and invariants INV-AUTH-04, INV-AUTH-05 in docs/design/01-auth-session-and-pin-setup.md.
   - Standardize YAML frontmatter across all 5 ADRs (0001 through 0005).
```

---

## PR Tier Selection Matrix

| Tier                      | Scope / Risk                                             | Reference Template                                 | Key Requirements                                                         |
| :------------------------ | :------------------------------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------- |
| **Tier 1 (Patch)**        | Typo, docs, minor dependency bump.                       | [`pr-tier1-patch.md`](pr-tier1-patch.md)           | 2-section PR body, minimal ceremony.                                     |
| **Tier 2 (Standard)**     | Feature, bugfix, module refactor (Default).              | [`pr-tier2-standard.md`](pr-tier2-standard.md)     | Lean 6-section PR body (Summary, Context, Type, Evidence, Risk, Notes).  |
| **Tier 3 (Kernel-Grade)** | Core architecture, DB schema, security, breaking change. | [`pr-tier3-enterprise.md`](pr-tier3-enterprise.md) | Lean 6-section PR body with mandatory ADR/RFC link, rollback, and notes. |
