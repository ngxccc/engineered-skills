---
name: git-flow
description: Shape branches, slice atomic commits, create pull requests via the 3-Tier PR Matrix, or create sub-issues. Use when the user wants to branch, commit, push, create a PR, format commit messages, or manage GitHub issues.
---

# Git Flow (`git-flow`)

Shape clean git branches, slice atomic commits with bulleted details, create audit-ready Pull Requests matched to risk via the 3-Tier PR Matrix, and create linked GitHub sub-issues.

## PR Tier Matrix

Match ceremony to risk before opening a branch or PR:

| Tier                   | Scope & Risk                                                         | Reference                                                                | Key Requirements                                                              |
| :--------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Tier 1: Patch**      | Typo, docs, minor dependency update.                                 | [`references/pr-tier1-patch.md`](references/pr-tier1-patch.md)           | Single-sentence PR summary, low ceremony.                                     |
| **Tier 2: Standard**   | Feature, bugfix, routine refactor (Default).                         | [`references/pr-tier2-standard.md`](references/pr-tier2-standard.md)     | Conventional Commits, lean 6-section body, before/after evidence.             |
| **Tier 3: Enterprise** | Core architecture, DB schema, security patch, breaking change (`!`). | [`references/pr-tier3-enterprise.md`](references/pr-tier3-enterprise.md) | Sliced atomic commits, mandatory ADR/RFC link, rollback plan, audit evidence. |

---

## Step-by-Step Workflow

### Step 1: Health Check & Clean Branching

Verify clean working tree and ensure branch naming reflects scope:

- Feature branch: `feature/<kebab-name>`
- Bugfix branch: `fix/<kebab-name>`
- Hotfix branch: `hotfix/<kebab-name>`
- Core / Tier 3 branch: `core/<kebab-name>`

Validate state with `node skills/engineering/git-flow/scripts/git-flow.mjs` or `git status`.

**Completion criterion:** Branch prefix adheres to convention and working tree state is clean or accounted for.

### Step 2: Slice Atomic Commits

Inspect `git status` and `git diff`. Never squash changes across distinct concerns or modules into a single blob commit.

1. **Single Scope**: If all changes belong to one feature or fix, stage and commit together.
2. **Multiple Scopes**: Sliced commits by module/path (`git add <path>`).
3. **Bulleted Descriptions Only**: When proposing atomic commit plans or writing commit bodies, never write dense paragraphs. Format details as concise, high-signal bullet points (`- ...`).
4. **Commit Formatting**: Validate with `node skills/engineering/git-flow/scripts/format-commit.mjs --type <type> --scope <scope> --summary "<summary>"`.

**Completion criterion:** Sliced commit plan is staged logically per path/scope, with each slice independently buildable and testable.

### Step 3: Human Audit Protocol (<critical>)

1. **Proposal Only**: Inspect `git status` / `git diff`, propose the numbered atomic commit slicing plan with bulleted change details, and display the formatted Conventional Commit message (`format-commit.mjs` without `--execute`).
2. **Proposal Schema**:
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
3. **Explicit Human Confirmation Required**: NEVER execute `git commit` or pass `--execute` to `format-commit.mjs` until the user explicitly confirms approval (e.g., "confirm commit", "approve commit", "execute commit").

**Completion criterion:** Explicit human confirmation received before any commit execution.

### Step 4: Construct PR Body & Open PR

1. If repo defines `.github/PULL_REQUEST_TEMPLATE.md`, match its fields.
2. Otherwise, select template from `references/pr-tier*.md` based on Tier.
3. Follow the **Visual-First Guidelines**:
   - Include visuals (Mermaid diagrams, screenshots, Before/After image tables, shallow call trees) only when they genuinely clarify UI changes or complex architecture. For straightforward fixes, concise plain text is sufficient.
   - Keep evidence concrete: before/after screenshots for UI, failing->passing test logs for logic.
   - Name risk: two-way door vs one-way door, blast radius, and rollback plan if Tier 3.
4. Open PR via `xd://github` (`op: pr_create`) or `node skills/engineering/git-flow/scripts/create-pr.mjs --tier <1|2|3>`.

**Completion criterion:** PR opened with validated tier template, before/after evidence, and correct issue linking.

---

## Issue Linking & Closing Protocol

- **Pull Request Descriptions (Primary)**: Declare `Resolves: #<id>` (to auto-close on merge) or `Relates to: #<id>` (for non-closing reference) under `## Context` in the PR body. If standalone, write `- None`. Never self-reference the PR itself (`Relates to: #<own-pr-id>`).
- **Atomic Commit Messages**: Focus strictly on technical rationale. Never use auto-closing keywords (`Fixes:`, `Closes:`, `Resolves:`) in commit messages to prevent premature issue closure. Footers are reserved for `BREAKING CHANGE:` or standalone bugfix trailers (`Fixes: <hash>`).

---

## Sub-Issue Creation

When decomposing Epics into tracer-bullet tasks or creating bug reports:

- Use `references/issue-templates.md` for issue body specifications (`Task`, `Bug Report`, `Feature / Proposal`).
- Run `node skills/engineering/git-flow/scripts/create-issue.mjs --type task --title "task(<scope>): <summary>" --parent <parent_number> --execute` to create and link directly to parent issues via the GitHub Native Sub-Issues API.

---

## Quick Reference Rules

- `conventional-commits` - Format all messages as `<type>(<scope>): <description>`. Validate via `format-commit.mjs`.
- `bulleted-commit-desc` - All commit proposal details and commit body rationale MUST be concise bullet points (`- ...`), never dense paragraphs.
- `no-close-in-commits` - NEVER use Fixes/Closes/Resolves in commit messages. Reserve auto-closing strictly for PR descriptions.
- `clean-branching` - Use `feature/`, `fix/`, `hotfix/`, or `core/` branch naming prefixes.
- `enterprise-pr` - Enforce clean titles and structured body template without emojis.
- `no-force-push-main` - NEVER force-push to main or master branches.
- `human-audit-required` - NEVER execute `git commit` or `--execute` without explicit human confirmation.

## References

- [`references/git-flow-templates.md`](references/git-flow-templates.md) - Conventional commit specifications, helper options, and slicing patterns.
- [`references/pr-tier1-patch.md`](references/pr-tier1-patch.md) - Tier 1 Patch PR template.
- [`references/pr-tier2-standard.md`](references/pr-tier2-standard.md) - Tier 2 Standard PR template.
- [`references/pr-tier3-enterprise.md`](references/pr-tier3-enterprise.md) - Tier 3 Kernel-Grade Enterprise PR template.
- [`references/issue-templates.md`](references/issue-templates.md) - Task, Bug Report, and Feature Proposal templates for GitHub Issues.
