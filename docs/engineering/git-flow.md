## What it does

`git-flow` manages git branch creation, Conventional Commits formatting, feature branching strategies, enterprise Pull Requests (PRs) via an **Adaptive 3-Tier PR Matrix**, and standardized GitHub Issue creation with Native Sub-Issues linking (`create-issue.mjs`). It matches ceremony to change risk:

- **Tier 1 (Patch)**: 2-section summary and verification for typos, docs, and trivial updates.
- **Tier 2 (Standard - Default)**: Lean 6-section PR body (`Summary`, `Context`, `Type`, `Evidence`, `Risk`, `Notes`) with Before/After verification for routine features and bug fixes.
- **Tier 3 (Enterprise Kernel-Grade)**: Atomic commits, mandatory ADR/RFC links, rollback procedures, and reviewer notes for core architectural shifts, DB schema migrations, and security patches.

## When to reach for it

`git-flow` triggers autonomously or via keywords (`git flow`, `branch management`, `rebase`, `commit convention`, `create pr`, `pull request`, `pr template`, `gh pr`):

| The situation                                             | The move                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| Minor fix, typo, or docs update                           | Create Tier 1 Patch PR (`references/pr-tier1-patch.md`)             |
| Standard feature, bugfix, or refactor                     | Create Tier 2 Standard PR (`references/pr-tier2-standard.md`)       |
| Core architecture change, security patch, breaking change | Create Tier 3 Kernel-Grade PR (`references/pr-tier3-enterprise.md`) |
| Create task, bug report, or sub-issue                     | Run `create-issue.mjs` (`references/issue-templates.md`)            |

## Common questions

**Why use an Adaptive 3-Tier PR Matrix?**  
A single complex PR template wastes token footprint and time on trivial updates. Conversely, minor templates lack required verification and audit logs for core architectural shifts. The 3-Tier Matrix matches rigor to change risk.

**Does `git-flow` support force-pushing to main?**  
No. `git-flow` strictly enforces a `no-force-push-main` safety guardrail to protect main/master branch histories.
**Can the agent execute git commit automatically?**  
No. `git-flow` enforces a strict **Human Audit & Verification Protocol**. The agent proposes atomic commit slices and displays formatted commit messages, but MUST NOT execute `git commit` or `--execute` without explicit user audit confirmation.

**How does `git-flow` handle GitHub Native Sub-Issues?**  
`create-issue.mjs` automatically queries the child issue's database ID and calls GitHub's Native Sub-Issues REST API (`POST repos/{owner}/{repo}/issues/{parent}/sub_issues`) when `--parent` is passed, linking child tickets into the parent hierarchy in a single command.

## It's working if

- Minor fixes use Tier 1 lightweight templates without unnecessary fields.
- Routine features use Tier 2 Conventional Commits and lean 6-section verification bodies (`Summary`, `Context`, `Type`, `Evidence`, `Risk`, `Notes`).
- Core architectural PRs (Tier 3) reference an ADR (`docs/adr/`), maintain atomic commit histories, and include full verification evidence.
- Sub-issues are automatically attached to parent issues via `create-issue.mjs --parent <id>`.
