# Issue Tracker Templates

## 1. GitHub Template

Issues and specs live as GitHub issues. Use the `gh` CLI for all operations.

### Conventions

- **Create**: `gh issue create --title "..." --body "..."`
- **Read**: `gh issue view <number> --comments`
- **List**: `gh issue list --state open --json number,title,body,labels,comments`
- **Comment / Label / Close**: `gh issue comment <number> --body "..."`, `gh issue edit --add-label "..."`, `gh issue close <number>`
- **PRs as triage surface**: Set `PRs as a request surface: no` (or `yes` if triaging contributor PRs).

### Wayfinding Operations (`/wayfinder`)

- **Map**: Single issue labeled `wayfinder:map`.
- **Child ticket**: Sub-issue linked to map with label `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`).
- **Blocking**: Native dependencies (`repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by`).
- **Claim & Resolve**: `gh issue edit <n> --add-assignee @me` $\rightarrow$ close and link in map Decisions.

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
