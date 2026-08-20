## What it does

`git-flow` manages git branch creation, Conventional Commits formatting, feature branching strategies, and enterprise Pull Requests (PRs) via an **Adaptive 3-Tier PR Matrix**. It matches PR ceremony to change risk:

- **Tier 1 (Patch)**: 2-line summary for typos, docs, and minor updates.
- **Tier 2 (Standard - Default)**: Full 5-section PR body with verification logs for routine features and bug fixes.
- **Tier 3 (Enterprise Kernel-Grade)**: Atomic commits, mandatory ADR/RFC links, Signed-off-by, and full benchmark logs for core architectural changes, DB schema migrations, and security patches.

## When to reach for it

`git-flow` triggers autonomously or via keywords (`git flow`, `branch management`, `rebase`, `commit convention`, `create pr`, `pull request`, `pr template`, `gh pr`):

| The situation                                             | The move                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| Minor fix, typo, or docs update                           | Create Tier 1 Patch PR (`references/pr-tier1-patch.md`)             |
| Standard feature, bugfix, or refactor                     | Create Tier 2 Standard PR (`references/pr-tier2-standard.md`)       |
| Core architecture change, security patch, breaking change | Create Tier 3 Kernel-Grade PR (`references/pr-tier3-enterprise.md`) |

## Common questions

**Why use an Adaptive 3-Tier PR Matrix?**  
A single complex PR template wastes token footprint and time on trivial updates. Conversely, minor templates lack required verification and audit logs for core architectural shifts. The 3-Tier Matrix matches rigor to change risk.

**Does `git-flow` support force-pushing to main?**  
No. `git-flow` strictly enforces a `no-force-push-main` safety guardrail to protect main/master branch histories.
**Can the agent execute git commit automatically?**  
No. `git-flow` enforces a strict **Human Audit & Verification Protocol**. The agent proposes atomic commit slices and displays formatted commit messages, but MUST NOT execute `git commit` or `--execute` without explicit user audit confirmation.

## It's working if

- Minor fixes use Tier 1 lightweight templates without unnecessary fields.
- Routine features use Tier 2 Conventional Commits and 5-section verification bodies.
- Core architectural PRs (Tier 3) reference an ADR (`docs/adr/`), maintain atomic commit histories, and include full verification evidence.
