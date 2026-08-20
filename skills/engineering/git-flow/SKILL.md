---
name: git-flow
description: "Trigger keywords: git flow, branch management, rebase, merge request, commit convention, release flow, create pr, pull request, pr template, gh pr. Skill for managing branch creation, conventional commit formatting, feature branching, and clean pull request creation workflows."
trigger_keywords: git, flow
layer: helper
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
   - Pick Tier 1, Tier 2, or Tier 3 template per Matrix above.
   - Build PR body using the corresponding template file.
   - Execute PR creation via `xd://github` (`op: pr_create`) or helper script `skills/engineering/git-flow/scripts/create-pr.mjs --tier <1|2|3>`.

---

## Quick Reference Rules

- `conventional-commits` - Format all messages as `<type>(<scope>): <description>`. Validate via `format-commit.mjs`.
- `clean-branching` - Use `feature/`, `fix/`, `hotfix/`, or `core/` branch naming prefixes.
- `enterprise-pr` - Enforce clean titles and structured body template without emojis.
- `no-force-push-main` - NEVER force-push to main or master branches.

---

## References

- [references/git-flow-templates.md](references/git-flow-templates.md) - Conventional commit & PR tier selection matrix.
- [references/pr-tier1-patch.md](references/pr-tier1-patch.md) - Tier 1 Patch PR template.
- [references/pr-tier2-standard.md](references/pr-tier2-standard.md) - Tier 2 Standard PR template.
- [references/pr-tier3-enterprise.md](references/pr-tier3-enterprise.md) - Tier 3 Kernel-Grade Enterprise PR template.
