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

## Visual-First PR Body Formatting

When constructing PR bodies (Tier 2 Standard & Tier 3 Enterprise), prioritize instant comprehension. Visuals (diagrams, images, trees) are **optional and context-dependent**: include them when they genuinely clarify changes (e.g. UI overhauls, complex architecture/state transitions). For straightforward fixes, refactors, or config changes, concise plain text is completely sufficient — **never fabricate artificial diagrams or trees where they add no value**.

### 1. Summary Visuals (Include only when helpful)

- **UI / Frontend Changes:** Embed screenshots, side-by-side Before/After image tables, or recording links:
  ```markdown
  | Before                       | After                       |
  | :--------------------------- | :-------------------------- |
  | ![Before](image-url-or-path) | ![After](image-url-or-path) |
  ```
- **Architecture & Multi-Entity Workflows:** Mermaid diagrams (`sequenceDiagram`, `flowchart TD`, `stateDiagram-v2`):
  ```mermaid
  sequenceDiagram
      participant Client
      participant Gateway
      participant Auth
      Client->>Gateway: POST /auth/login
      Gateway->>Auth: Verify Credentials
      Auth-->>Gateway: Issue JWT Bearer
      Gateway-->>Client: 200 OK (Token)
  ```
- **Runtime & Control Flow:** Call trees or execution traces:
  ```text
  submitOrder
    validateInventory
    chargePayment
      dispatchWebhook
    sendReceiptEmail
  ```
- **Component & Module Structure:** Hierarchy trees or shallow file trees:
  ```text
  src/
  ├── auth/         # session & JWT verification
  ├── orders/       # order intake & state machine
  └── transport/    # HTTP & WebSocket adapters
  ```
- **Logic & State Transitions:** Pseudocode or unified diff sketches showing core behavior changes without noise.

### 2. Evidence Hierarchy

- **S-Tier (Visual):** Screenshots, before/after images, or screen recordings for any visual/interactive surface.
- **A-Tier (Execution):** Real terminal output, before/after test run logs (`auth.spec.ts: failing -> passing`).
- **B-Tier (Metrics):** Benchmark numbers, throughput (RPS), memory profiles, or latency percentiles (p95/p99).

### 3. Risk Assessment

Always evaluate risk along two clear axes in `## Risk`:

- **Door:**
  - **Two-way door:** Easily reversible, low blast radius, cheap to roll back.
  - **One-way door:** Irreversible or high friction to undo (destructive DB migration, breaking API cutover, auth provider change). Demands rigorous pre-merge review.
- **Blast Radius:** Explicitly name potential downstream impacts (e.g. mobile client breakages, cache invalidation storms, dependent microservices).

### 4. Reviewer Notes

Use `## Notes` to call out specific areas for the reviewer to scrutinize, architectural tradeoffs accepted, deployment/migration order, or open questions. If no special notes are needed, write `- None`.

---

## GitHub Issue Creation & Native Sub-Issues Protocol

When creating issues or decomposing a parent Epic/Feature into sub-tasks:

1. **Create and Link via `create-issue.mjs` (Recommended)**:

   ```bash
   node skills/engineering/git-flow/scripts/create-issue.mjs \
     --type task \
     --title "task(<scope>): <summary>" \
     --parent <parent_number> \
     --blocked-by <blocked_by_number> \
     --execute
   ```

   Automatically validates Conventional Commit title, verifies the single-noun body schema (`Context`, `Scope`, `Acceptance`), publishes the issue, and links it to the parent via the GitHub Native Sub-Issues API.

2. **Manual Native Sub-Issues Linking (Under the Hood)**:

   ```bash
   # 1. Create child ticket
   gh issue create --title "task(<scope>): <title>" --label "type:task" --body "..."

   # 2. Extract child integer database ID
   CHILD_ID=$(gh api repos/{owner}/{repo}/issues/<child_number> --jq .id)

   # 3. Link child to parent issue via REST API
   gh api --method POST repos/{owner}/{repo}/issues/<parent_number>/sub_issues -F sub_issue_id=$CHILD_ID

   # 4. Verify parent hierarchy
   gh api repos/{owner}/{repo}/issues/<parent_number>/sub_issues --jq '.[] | "#\(.number): \(.title)"'
   ```

---

## Issue Linking & Closing Protocol

1. **Pull Request Descriptions (Primary Linking Mechanism)**:
   - Issue tracking belongs at the Pull Request level, NOT in individual atomic commits.
   - Under `## Context`, declare `Resolves: #<id>` (to auto-close the issue on merge) or `Relates to: #<id>` (for non-closing reference / backlink).
   - If the PR is standalone or does not relate to an existing issue, keep `## Context` and specify `- None`. Do NOT omit `## Context` (ensuring every PR shares the identical 6-part layout) and NEVER self-reference the PR itself (`Relates to: #<own-pr-id>`).
2. **Atomic Commit Messages**:
   - Commits focus strictly on technical rationale; issue reference footers (`Ref: #<id>`) are NOT mandatory on individual branch commits.
   - NEVER use auto-closing keywords (`Fixes:`, `Closes:`, `Resolves:`) in commit messages to prevent premature issue closure.
   - Footers are strictly reserved for `BREAKING CHANGE:` or optional standalone bugfix trailers (`Fixes: <hash>` per Linux kernel conventions).

## Human Audit & Verification Protocol (<critical>)

1. **Inspection & Staging Proposal Only**: When requested to commit or run `git-flow`, the agent MUST ONLY check `git status` / `git diff`, propose the atomic commit slicing plan, and display the formatted Conventional Commit message (`format-commit.mjs` without `--execute`).
2. **Explicit Human Confirmation Required**: The agent MUST NEVER execute `git commit` or pass `--execute` to `format-commit.mjs` until the user explicitly responds with audit approval (e.g., "xác nhận commit", "đồng ý commit", "execute commit").

---

## Quick Reference Rules

- `conventional-commits` - Format all messages as `<type>(<scope>): <description>`. Validate via `format-commit.mjs`.
- `no-close-in-commits` - NEVER use Fixes/Closes/Resolves in commit messages. Reserve issue linking and auto-closing keywords strictly for Pull Request descriptions.
- `clean-branching` - Use `feature/`, `fix/`, `hotfix/`, or `core/` branch naming prefixes.
- `enterprise-pr` - Enforce clean titles and structured body template without emojis.
- `no-force-push-main` - NEVER force-push to main or master branches.
- `human-audit-required` - NEVER execute `git commit` or `--execute` without explicit user audit confirmation.

## References

- [references/git-flow-templates.md](references/git-flow-templates.md) - Conventional commit & PR tier selection matrix.
- [references/pr-tier1-patch.md](references/pr-tier1-patch.md) - Tier 1 Patch PR template.
- [references/pr-tier2-standard.md](references/pr-tier2-standard.md) - Tier 2 Standard PR template.
- [references/pr-tier3-enterprise.md](references/pr-tier3-enterprise.md) - Tier 3 Kernel-Grade Enterprise PR template.
