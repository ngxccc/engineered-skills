---
name: git-flow
description: Shape branches, slice atomic commits, split multi-layer work into sequential PRs against main, create pull requests via the 3-Tier PR Matrix, or create sub-issues. Use when the user wants to branch, commit, push, split large work into small PRs, create a PR, format commit messages, or manage GitHub issues.
---

# Git Flow (`git-flow`)

Shape clean git branches from `main`, split oversized multi-layer work into **sequential atomic PRs against `main`**, slice atomic commits with bulleted details, create audit-ready Pull Requests matched to risk via the 3-Tier PR Matrix, and create linked GitHub sub-issues.

## PR Tier Matrix

Match ceremony to risk before opening a branch or PR:

| Tier                   | Scope & Risk                                                         | Reference                                                                | Key Requirements                                                              |
| :--------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Tier 1: Patch**      | Typo, docs, minor dependency update.                                 | [`references/pr-tier1-patch.md`](references/pr-tier1-patch.md)           | Single-sentence PR summary, low ceremony.                                     |
| **Tier 2: Standard**   | Feature, bugfix, routine refactor (Default).                         | [`references/pr-tier2-standard.md`](references/pr-tier2-standard.md)     | Conventional Commits, lean 6-section body, before/after evidence.             |
| **Tier 3: Enterprise** | Core architecture, DB schema, security patch, breaking change (`!`). | [`references/pr-tier3-enterprise.md`](references/pr-tier3-enterprise.md) | Sliced atomic commits, mandatory ADR/RFC link, rollback plan, audit evidence. |

---

## Step-by-Step Workflow

### Step 1: Health Check & Branch Sizing

Branch directly from an up-to-date `main` (`<type>/<kebab-name>`):

- Feature branch: `feature/<kebab-name>`
- Bugfix / Hotfix branch: `fix/<kebab-name>`, `hotfix/<kebab-name>`
- Core / Tier 3 branch: `core/<kebab-name>`
- Maintenance / Docs branch: `chore/<kebab-name>`, `docs/<kebab-name>`

**Sequential Sizing Gate:**
Keep each PR focused on one trust boundary or dependency layer (~<=15–20 hand-written files). When work spans multiple layers (schema/contracts → backend API → client UI) or decomposes a large bundle, follow [`references/sequential-prs.md`](references/sequential-prs.md) to land each layer sequentially into `main` (merge PR 1 to `main`, pull `main`, start PR 2) rather than creating a 50+ file PR or maintaining stacked non-`main` branches.

Validate state with `node skills/engineering/git-flow/scripts/git-flow.mjs` or `git status`.

**Completion criterion:** Branch prefix matches scope/tier, PR scope fits one cohesive layer, and working tree state is accounted for.

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

### Step 4: Construct PR Body & Open PR (`base: main`)

1. If repo defines `.github/PULL_REQUEST_TEMPLATE.md`, match its fields; otherwise select from `references/pr-tier*.md` based on Tier.
2. When a PR is part of a multi-PR rollout, include the sequence map under `## Context` per [`references/sequential-prs.md`](references/sequential-prs.md).
3. Keep evidence concrete (test commands run, before/after visuals when helpful) and state blast radius + rollback plan for Tier 3.
4. Open PR against `main` via `xd://github` (`op: pr_create`) or:
   ```bash
   node skills/engineering/git-flow/scripts/create-pr.mjs --tier <1|2|3> --base main --title "<title>" --body-file <path> --execute
   ```

**Completion criterion:** PR opened against `main` with validated tier template, evidence, and accurate issue/sequence linking.

---

## Issue Linking & Closing Protocol

- **Pull Request Descriptions (Primary)**: Declare `Resolves: #<id>` (to auto-close on merge) or `Part of: #<id>` / `Relates to: #<id>` under `## Context` in the PR body. If standalone, write `- None`.
- **Atomic Commit Messages**: Focus strictly on technical rationale. Reserve auto-closing keywords strictly for PR descriptions so intermediate sequential PRs do not close parent issues early.

---

## Sub-Issue Creation

When decomposing Epics into tracer-bullet tasks or creating bug reports:

- Use [`references/issue-templates.md`](references/issue-templates.md) for issue body specifications (`Task`, `Bug Report`, `Feature / Proposal`).
- Run `node skills/engineering/git-flow/scripts/create-issue.mjs --type task --title "task(<scope>): <summary>" --parent <parent_number> --execute` to create and link directly to parent issues via GitHub Native Sub-Issues API.

---

## Quick Reference Rules

- `conventional-commits` - Format all messages as `<type>(<scope>): <description>`. Validate via `format-commit.mjs`.
- `sequential-prs` - Keep PRs small (~<=15–20 hand-written files) and land multi-layer changes sequentially into `main` (merge PR 1 -> pull `main` -> open PR 2).
- `bulleted-commit-desc` - Commit proposal details and commit body rationale MUST be concise bullet points (`- ...`).
- `no-close-in-commits` - Reserve Fixes/Closes/Resolves strictly for PR descriptions.
- `clean-branching` - Use `feature/`, `fix/`, `hotfix/`, `core/`, `chore/`, or `docs/` branch prefixes.
- `enterprise-pr` - Enforce clean titles and structured body templates without emojis.
- `no-force-push-main` - NEVER force-push to `main` or `master`.
- `human-audit-required` - NEVER execute `git commit` or `--execute` without explicit human confirmation.

## References

- [`references/sequential-prs.md`](references/sequential-prs.md) - Single-workspace sequential PR workflow against `main` and issue/sequence linking.
- [`references/git-flow-templates.md`](references/git-flow-templates.md) - Conventional commit specifications and slicing patterns.
- [`references/pr-tier1-patch.md`](references/pr-tier1-patch.md) - Tier 1 Patch PR template.
- [`references/pr-tier2-standard.md`](references/pr-tier2-standard.md) - Tier 2 Standard PR template.
- [`references/pr-tier3-enterprise.md`](references/pr-tier3-enterprise.md) - Tier 3 Kernel-Grade Enterprise PR template.
- [`references/issue-templates.md`](references/issue-templates.md) - Task, Bug Report, and Feature Proposal templates for GitHub Issues.
