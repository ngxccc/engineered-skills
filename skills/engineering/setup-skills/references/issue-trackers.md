# Issue Tracker Templates

## 1. GitHub Template

Issues and specifications for this repository are managed via **GitHub Issues**. Use the official `gh` CLI for all operations.

### CLI Command Conventions

| Operation        | Command                                       | Notes                                          |
| :--------------- | :-------------------------------------------- | :--------------------------------------------- |
| **Create Issue** | `gh issue create --title "..." --body "..."`  | Use heredocs for structured markdown bodies.   |
| **View Issue**   | `gh issue view <number> --comments`           | Reads issue description, labels, and comments. |
| **List Issues**  | `gh issue list --state open --label "<name>"` | Filter open tickets by status, type, or area.  |
| **Comment**      | `gh issue comment <number> --body "..."`      | Post updates or link PRs.                      |
| **Apply Labels** | `gh issue edit <number> --add-label "<name>"` | Update status or metadata labels.              |
| **Close Issue**  | `gh issue close <number> --comment "..."`     | Close ticket with resolution summary.          |

### Repository Label Taxonomy

#### A. Status & Lifecycle (Pragmatic & Automated)

Issue lifecycle is automated natively via Pull Requests (`Fixes #<id>`) and GitHub Projects. The repository eliminates manual status shuffling (`in-progress`, `needs-review`, `approved`, `triage`) to avoid administrative overhead and state desynchronization, retaining only actionable exception labels:

- `status:blocked` — Blocked on external dependency, third-party credentials, or upstream blocker issue.
- `wontfix` — Explicitly closed as out of scope, superseded, or rejected proposal.

#### B. Type Labels (Conventional Commits Alignment)

- `type:feat` — New feature or capability.
- `type:fix` — Bug fix or patch.
- `type:refactor` — Code refactoring without behavior change.
- `type:perf` — Performance optimization.
- `type:test` — Adding or updating test suites.
- `type:docs` — Documentation only.
- `type:chore` — Tooling, dependencies, or maintenance.
- `type:ci` — CI/CD workflow updates.
- `type:style` — Formatting or cosmetic changes.

#### C. Area Labels (Domain Scopes)

Scoped to domain modules and infrastructure components:

- `area:auth` — Authentication, authorization, tokens, passwords.
- `area:core` — Core application infrastructure, modules, configs.
- `area:api` — REST API routing, pipes, filters, OpenAPI.
- `area:ui` — UI components, themes, styling, navigation.
- `area:ci` — CI/CD workflows, build pipelines.
- `area:harness` — Agent harness, engineering standards, skills, prompts.

#### D. Priority Labels

- `priority:p0` — Critical blocker (emergency / system down).
- `priority:p1` — High priority (blocks release milestone).
- `priority:p2` — Normal priority (default).

### Triage Skill Mapping (`/triage`)

| Canonical Triage Role | Mapped Repo Label                          |
| :-------------------- | :----------------------------------------- |
| `needs-triage`        | Default open issue (no extra label needed) |
| `needs-info`          | `status:blocked`                           |
| `ready-for-agent`     | `type:*` + `area:*`                        |
| `ready-for-human`     | `priority:p0` / `priority:p1`              |
| `wontfix`             | `wontfix`                                  |

### Wayfinding Operations (`/wayfinder`)

- **Map Ticket**: Single GitHub issue labeled `wayfinder:map` holding decisions, notes, and fog tracker.
- **Child Tickets**: Linked sub-issues labeled `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`).
- **Dependency Blocking**: Uses GitHub native issue dependencies (`repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by`). A ticket is unblocked when all blocker issues are closed.

### GitHub Native Sub-Issues Protocol

When splitting an Epic or Parent feature issue into sub-tasks, link them natively using GitHub Issues REST API:

1. **Create Child Ticket:**

   ```bash
   gh issue create --title "<type>(<area>): <title>" --body "..." --label "<labels>"
   ```

2. **Get Child Database ID & Link to Parent:**

   ```bash
   CHILD_ID=$(gh api repos/{owner}/{repo}/issues/<child_number> --jq .id)
   gh api --method POST repos/{owner}/{repo}/issues/<parent_number>/sub_issues -F sub_issue_id=$CHILD_ID
   ```

3. **Query Native Sub-Issues:**

   ```bash
   gh api repos/{owner}/{repo}/issues/<parent_number>/sub_issues --jq '.[] | "#\(.number): \(.title)"'
   ```

---

## 2. GitLab Template

Issues and specs live as GitLab issues. Use the `glab` CLI for all operations.

### Conventions

- **Create**: `glab issue create --title "..." --description "..."`
- **Read / List**: `glab issue view <number> --comments`, `glab issue list -F json`
- **Comment / Close**: `glab issue note <number> --message "..."`, `glab issue close <number>`
- **Merge Requests**: Use `glab mr create`, `glab mr view`, `glab mr note`.

### Wayfinding Operations (`/wayfinder`)

- **Map**: Single issue labeled `wayfinder:map`.
- **Child ticket**: `Part of #<map>` in description with label `wayfinder:<type>`.
- **Blocking**: `/blocked_by #<blocker>` quick action note.
- **Claim & Resolve**: `glab issue update <n> --assignee @me` $\rightarrow$ close and link in map Decisions.

---

## 3. Local Markdown Template

Issues and specs live as markdown files in `.scratch/`.

### Conventions

- **Feature directory**: `.scratch/<feature-slug>/`
- **Spec**: `.scratch/<feature-slug>/spec.md`
- **Tickets**: `.scratch/<feature-slug>/issues/<NN>-<slug>.md` (numbered from `01`).
- **Status & Comments**: `Status:` line at top; conversation under `## Comments`.

### Wayfinding Operations (`/wayfinder`)

- **Map**: `.scratch/<effort>/map.md`
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md` with `Type:` and `Status: claimed/resolved`.
- **Blocking**: `Blocked by: NN, NN` line at top.
