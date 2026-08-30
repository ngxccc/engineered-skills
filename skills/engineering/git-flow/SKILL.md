---
name: git-flow
description: Git branching, Conventional Commits formatting, and 3-Tier PR creation workflows.
---

# Git Flow & Pull Request Protocol (`git-flow`)

Manage git branch creation, Conventional Commits formatting, feature branching strategies, and enterprise Pull Requests (PRs) via an **Adaptive 3-Tier PR Matrix**.

## PR Tier Selection Matrix

Before creating a branch or opening a PR, evaluate scope and risk to select the appropriate Tier:

| Tier                   | Scope & Risk                                                         | Template Reference                  | Requirements                                                           |
| :--------------------- | :------------------------------------------------------------------- | :---------------------------------- | :--------------------------------------------------------------------- |
| **Tier 1: Patch**      | Typo, docs, minor dependency update.                                 | `references/pr-tier1-patch.md`      | Single-sentence PR summary, low ceremony.                              |
| **Tier 2: Standard**   | Feature, bugfix, routine refactor (Default).                         | `references/pr-tier2-standard.md`   | Conventional Commits, full 5-section body, test logs.                  |
| **Tier 3: Enterprise** | Core architecture, DB schema, security patch, breaking change (`!`). | `references/pr-tier3-enterprise.md` | Atomic commits, mandatory ADR/RFC link, Signed-off-by, audit evidence. |

---

## Step-by-Step Workflow

1. **Check Working Directory Status:** Run `git status` or `node skills/engineering/git-flow/scripts/git-flow.mjs` to verify clean state and branch naming.
2. **Execute Clean Feature Branching:**
   - Feature branch pattern: `feature/<kebab-case-name>`
   - Bugfix branch pattern: `fix/<kebab-case-name>`
   - Hotfix branch pattern: `hotfix/<kebab-case-name>`
   - Core / Tier 3 branch pattern: `core/<kebab-case-name>`
3. **Analyze & Slice Atomic Commits:**
   - Inspect `git status` / `git diff`.
   - **Single Scope**: If all changes belong to one logical feature, stage and commit together.
   - **Multiple Scopes**: If changes span distinct modules (e.g., `docs/` vs `src/auth/`), **DO NOT squash into one blob commit**. Perform **Logical Sliced Commits**: stage specific paths per scope (`git add <path>`) and run `node skills/engineering/git-flow/scripts/format-commit.mjs --type <type> --scope <scope> --summary "<summary>"`.
4. **Select PR Tier & Create Pull Request:**
   - Check if active repository defines `.github/PULL_REQUEST_TEMPLATE.md`. If present, build PR body matching project template fields.
   - Otherwise, pick Tier 1, Tier 2, or Tier 3 template per Matrix above (`references/pr-tier*.md`).
   - Execute PR creation via `xd://github` (`op: pr_create`) or helper script `skills/engineering/git-flow/scripts/create-pr.mjs --tier <1|2|3>`.

---

## GitHub Native Sub-Issues Protocol

When decomposing a parent Epic or Feature issue into sub-tasks, link them natively in GitHub Issues using the official REST API:

1. **Create the Child Ticket:**

   ```bash
   gh issue create --title "<type>(<area>): <title>" --label "<labels>" --body "..."
   ```

2. **Extract Child Integer Database ID:**

   ```bash
   CHILD_ID=$(gh api repos/{owner}/{repo}/issues/<child_number> --jq .id)
   ```

3. **Link Child to Parent Issue via Native Sub-Issues Endpoint:**

   ```bash
   gh api --method POST repos/{owner}/{repo}/issues/<parent_number>/sub_issues -F sub_issue_id=$CHILD_ID
   ```

4. **Verify Parent Hierarchy:**
   ```bash
   gh api repos/{owner}/{repo}/issues/<parent_number>/sub_issues --jq '.[] | "#\(.number): \(.title)"'
   ```

---

## Human Audit & Verification Protocol (<critical>)

1. **Inspection & Staging Proposal Only**: When requested to commit or run `git-flow`, the agent MUST ONLY check `git status` / `git diff`, propose the atomic commit slicing plan, and display the formatted Conventional Commit message (`format-commit.mjs` without `--execute`).
2. **Explicit Human Confirmation Required**: The agent MUST NEVER execute `git commit` or pass `--execute` to `format-commit.mjs` until the user explicitly responds with audit approval (e.g., "xác nhận commit", "đồng ý commit", "execute commit").

---

## Quick Reference Rules

- `conventional-commits` - Format all messages as `<type>(<scope>): <description>`. Validate via `format-commit.mjs`.
- `clean-branching` - Use `feature/`, `fix/`, `hotfix/`, or `core/` branch naming prefixes.
- `enterprise-pr` - Enforce clean titles and structured body template without emojis.
- `no-force-push-main` - NEVER force-push to main or master branches.
- `human-audit-required` - NEVER execute `git commit` or `--execute` without explicit user audit confirmation.

---

## References

- [references/git-flow-templates.md](references/git-flow-templates.md) - Conventional commit & PR tier selection matrix.
- [references/pr-tier1-patch.md](references/pr-tier1-patch.md) - Tier 1 Patch PR template.
- [references/pr-tier2-standard.md](references/pr-tier2-standard.md) - Tier 2 Standard PR template.
- [references/pr-tier3-enterprise.md](references/pr-tier3-enterprise.md) - Tier 3 Kernel-Grade Enterprise PR template.
