---
name: git-flow
description: Shape branches (single or stacked PR chains), slice atomic commits, create pull requests via the 3-Tier PR Matrix, or create sub-issues. Use when the user wants to branch, commit, push, split work into stacked PRs, create a PR, format commit messages, or manage GitHub issues.
---

# Git Flow (`git-flow`)

Shape clean git branches (including **bottom-up stacked PRs** for multi-layer work), slice atomic commits with bulleted details, create audit-ready Pull Requests matched to risk via the 3-Tier PR Matrix, and create linked GitHub sub-issues.

## PR Tier Matrix

Match ceremony to risk before opening a branch or PR:

| Tier                   | Scope & Risk                                                         | Reference                                                                | Key Requirements                                                              |
| :--------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Tier 1: Patch**      | Typo, docs, minor dependency update.                                 | [`references/pr-tier1-patch.md`](references/pr-tier1-patch.md)           | Single-sentence PR summary, low ceremony.                                     |
| **Tier 2: Standard**   | Feature, bugfix, routine refactor (Default).                         | [`references/pr-tier2-standard.md`](references/pr-tier2-standard.md)     | Conventional Commits, lean 6-section body, before/after evidence.             |
| **Tier 3: Enterprise** | Core architecture, DB schema, security patch, breaking change (`!`). | [`references/pr-tier3-enterprise.md`](references/pr-tier3-enterprise.md) | Sliced atomic commits, mandatory ADR/RFC link, rollback plan, audit evidence. |

---

## Step-by-Step Workflow

### Step 1: Shape Branch or PR Stack

Verify clean working tree and ensure branch naming reflects scope:

- Feature branch: `feature/<kebab-name>`
- Bugfix / Hotfix branch: `fix/<kebab-name>`, `hotfix/<kebab-name>`
- Core / Tier 3 branch: `core/<kebab-name>`
- Maintenance / Docs branch: `chore/<kebab-name>`, `docs/<kebab-name>`

**Stacking Gate (AI-era PR Sizing):**
Keep each PR focused on one trust boundary or dependency layer (~<=15–20 hand-written files). When work spans multiple layers (schema/contracts → backend API → client UI) or decomposes a large bundle, follow [`references/stacked-prs.md`](references/stacked-prs.md) to branch and PR bottom-up (`--base <lower-branch>`) instead of opening a 50+ file PR.

Validate state with `node skills/engineering/git-flow/scripts/git-flow.mjs` or `git status`.

**Completion criterion:** Branch prefix (or stack plan) matches scope/tier and working tree state is accounted for.

### Step 2: Slice Atomic Commits

Collect file changes in a **single combined snapshot**: run `git status -s && git diff` in one command. Never query `git diff` file-by-file across multiple serialized turns.

Never squash changes across distinct concerns or modules into a single blob commit.

1. **Single Scope**: If all changes belong to one feature or fix, stage and commit together.
2. **Multiple Scopes**: Slice commits by module/path (`git add <path>`). Commit specs, contracts, and migrations before domain implementation and generated schema syncs.
3. **Bulleted Descriptions Only**: When proposing atomic commit plans or writing commit bodies, format details as concise, high-signal bullet points (`- ...`) rather than dense paragraphs.
4. **Lean Turnaround**: Draft the formatted commit proposal directly in your markdown response during Step 3 instead of running dry-run scripts just to preview text.

**Completion criterion:** Sliced commit plan is staged logically per path/scope, with each slice independently buildable and testable.

### Step 3: Human Audit Protocol (<critical>)

1. **Proposal in Chat**: Inspect the single-shot `git status -s && git diff` output, propose the numbered atomic commit slicing plan with bulleted change details directly in your response markdown, and ask for explicit human confirmation.
2. **Proposal Schema**:
   ```markdown
   ### Proposed Atomic Commit Plan

   1. <type>(<scope>): <imperative summary <= 72 chars>
      - <concise bullet describing change & why>
   ```
3. **Explicit Human Confirmation Required**: NEVER execute `git commit` or pass `--execute` to `format-commit.mjs` until the user explicitly confirms approval (e.g., "confirm commit", "approve commit", "execute commit", "LGTM").
4. **Single-Step Execution**: Once confirmation is received, stage the files and execute the commit in a single step using `node skills/engineering/git-flow/scripts/format-commit.mjs --type <type> --scope <scope> --summary "<summary>" --body "<body>" --execute`.

**Completion criterion:** Explicit human confirmation received before any commit execution, with validation and commit occurring in a single confirmed execution step.

### Step 4: Construct PR Body & Open PR (Single or Stacked)

1. If repo defines `.github/PULL_REQUEST_TEMPLATE.md`, match its fields; otherwise select from `references/pr-tier*.md` based on Tier.
2. For stacked PRs, pass `--base <parent-branch>` (plus `--draft` if lower layers are still under review) and include the stack lineage map in `## Context` per [`references/stacked-prs.md`](references/stacked-prs.md).
3. Keep evidence concrete (test commands run, before/after visuals when helpful) and state blast radius + rollback plan for Tier 3.
4. Open PR via `xd://github` (`op: pr_create`) or:
   ```bash
   node skills/engineering/git-flow/scripts/create-pr.mjs --tier <1|2|3> --base <base-branch> --title "<title>" --body-file <path> --execute
   ```
5. After a lower PR in a stack merges, retarget (`gh pr edit <n> --base main`), rebase `--onto`, re-test, and push with `--force-with-lease` per [`references/stacked-prs.md`](references/stacked-prs.md).

**Completion criterion:** PR opened against the right base branch with validated tier template, evidence, and accurate issue/stack linking.

---

## Issue Linking & Closing Protocol

- **Pull Request Descriptions (Primary)**: Declare `Resolves: #<id>` (to auto-close on merge) or `Part of: #<id>` / `Relates to: #<id>` under `## Context` in the PR body. If standalone, write `- None`.
- **Atomic Commit Messages**: Focus strictly on technical rationale. Reserve auto-closing keywords strictly for PR descriptions; footers are for `BREAKING CHANGE:` or standalone bugfix trailers (`Fixes: <hash>`).

---

## Sub-Issue Creation

When decomposing Epics into tracer-bullet tasks or creating bug reports:

- Use [`references/issue-templates.md`](references/issue-templates.md) for issue body specifications (`Task`, `Bug Report`, `Feature / Proposal`).
- Run `node skills/engineering/git-flow/scripts/create-issue.mjs --type task --title "task(<scope>): <summary>" --parent <parent_number> --execute` to link directly to parent issues via GitHub Native Sub-Issues API.

---

## Quick Reference Rules

- `conventional-commits` - Format all messages as `<type>(<scope>): <description>`. Validate via `format-commit.mjs`.
- `stacked-prs` - Split multi-layer or >15-20 file changes into bottom-up stacked PRs (`--base <lower-branch>`); retarget and rebase as lower PRs merge.
- `bulleted-commit-desc` - Commit proposal details and commit body rationale MUST be concise bullet points (`- ...`).
- `no-close-in-commits` - Reserve Fixes/Closes/Resolves strictly for PR descriptions.
- `clean-branching` - Use `feature/`, `fix/`, `hotfix/`, `core/`, `chore/`, or `docs/` branch prefixes.
- `enterprise-pr` - Enforce clean titles and structured body templates without emojis.
- `no-force-push-main` - NEVER force-push to `main` or `master`; use `--force-with-lease` only on stacked/feature branches after rebase.
- `human-audit-required` - NEVER execute `git commit` or `--execute` without explicit human confirmation.

## References

- [`references/stacked-prs.md`](references/stacked-prs.md) - Stacked branch naming, `--base` PR creation, stack lineage, and bottom-up rebase/retarget steps.
- [`references/git-flow-templates.md`](references/git-flow-templates.md) - Conventional commit specifications, helper options, and slicing patterns.
- [`references/pr-tier1-patch.md`](references/pr-tier1-patch.md) - Tier 1 Patch PR template.
- [`references/pr-tier2-standard.md`](references/pr-tier2-standard.md) - Tier 2 Standard PR template.
- [`references/pr-tier3-enterprise.md`](references/pr-tier3-enterprise.md) - Tier 3 Kernel-Grade Enterprise PR template.
- [`references/issue-templates.md`](references/issue-templates.md) - Task, Bug Report, and Feature Proposal templates for GitHub Issues.
