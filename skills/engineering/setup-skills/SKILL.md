---
trigger_keywords: setup-skills, project-init, issue-tracker-config, domain-setup
name: setup-skills
description: Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, domain doc layout, and interactive 7-pillar Engineering Standards (docs/standards/). Run once before first use of the other engineering skills.
---

# Setup Engineered Skills's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker & triage** — where issues live and their triage label vocabulary
- **Domain docs** — where `CONTEXT.md` and ADRs live, and consumer rules for reading them
- **Engineering standards** — interactive 7-pillar SSOT under `docs/standards/` (Comments, API, Database, Concurrency, Testing, Security, Git Flow)

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config` — is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root — does either exist?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/standards/` — does this skill's prior output already exist?
- `.scratch/` — sign that a local-markdown issue tracker convention is already in use
- Is the `triage` skill installed? (a `triage` skill folder alongside this one, or `triage` in your available skills.)
- Monorepo signals — `pnpm-workspace.yaml`, `workspaces` in `package.json`, or populated `packages/*`.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order — one section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word.

**Section A — Issue tracker.**

Default posture: if `git remote` points at GitHub, propose GitHub. If GitLab, propose GitLab. Otherwise:

- **GitHub** — issues live in repo's GitHub Issues (uses `gh` CLI)
- **GitLab** — issues live in repo's GitLab Issues (uses `glab` CLI)
- **Local markdown** — issues live as files under `.scratch/<feature>/`
- **Other** (Jira, Linear, etc.) — record freeform prose description

Record the choice in `docs/standards/issue-tracker.md`.

**Section B — Triage label vocabulary.** Skip if `triage` skill is not installed.

Ask: "Do you want to keep the default triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)? (recommended: **yes**)"

**Section C — Domain docs.** Default to **single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root. Offer multi-context only for monorepos. Record rules in `docs/standards/domain-docs.md`.

**Section D — Engineering Standards (`docs/standards/`).**

Interview the user with terse single-line prompts for each pillar. Default: recommended.

1. **Code comment taxonomy** — English-only, 4-tier (TSDoc, `// WHY:`, `// TODO(context):`, ban echoing/dead code)? (recommended: yes)
2. **API & error handling** — RESTful routes, RFC 9457, envelope, Idempotency-Key? (recommended: yes)
3. **Database & migrations** — snake_case, selective projections, zero-downtime expand/contract? (recommended: yes)
4. **Concurrency & locking** — GiST exclusion, `SELECT FOR UPDATE`, Redlock, deadlock ordering? (recommended: yes)
5. **Testing & fixtures** — 3-tier hierarchy, factories & mothers, SUT isolation, OpenAPI types? (recommended: yes)
6. **Security & cryptography** — scrypt, timing-safe compare, single-use tokens, anti-enumeration? (recommended: yes)
7. **Git flow & PRs** — branch prefixes, conventional commits (≤72), 3-tier PR matrix, human audit? (recommended: yes)

On approval, scaffold `docs/standards/*.md` using the corresponding high-density seed templates in `references/standards/`.

### 3. Confirm and edit

Show the user a draft of the `## Engineering Standards` block to add to `AGENTS.md` / `CLAUDE.md` and the contents of `docs/standards/*.md`. Let them edit before writing.

### 4. Write

**Pick the file to edit:** `AGENTS.md` (or `CLAUDE.md` if existing).

Update the `## Engineering Standards` block in-place using sharp context pointers:

```markdown
## AI-Human Collaboration Protocol

- **Boilerplate Scaffolding**: AI scaffolds boilerplate code only (DTO schemas, module registrations, route constants, guard/interceptor skeletons, test harness).
- **Core Business Logic**: AI MUST NEVER write core business logic, domain calculations, database transactions, or algorithm implementations directly.
- **Structured TODO Guiding**: For all core logic, AI provides structured step-by-step `// TODO:` guidance and architectural review; human writes the implementation directly.

---

## Engineering Standards

MUST read the corresponding standard file under `docs/standards/` before modifying related code or tests:

- **Issue tracking & tickets** → `docs/standards/issue-tracker.md`
- **Domain glossary & ADRs** → `docs/standards/domain-docs.md`
- **Comments & docstrings** → `docs/standards/code-comment-taxonomy.md`
- **Routes, DTOs, and error responses** → `docs/standards/api-design-and-error-handling.md`
- **Schemas, queries, and migrations** → `docs/standards/database-and-migrations.md`
- **Locks, race conditions, and transactions** → `docs/standards/concurrency-and-locking.md`
- **Tests, factories, and fixtures** → `docs/standards/testing-and-fixtures.md`
- **Auth, hashing, and sanitization** → `docs/standards/security-and-cryptography.md`
- **Branches, commits, and PRs** → `docs/standards/git-flow-and-pr-matrix.md`
```

Scaffold all standard files into `docs/standards/` using the seed templates in `references/`:

- [references/issue-trackers.md](./references/issue-trackers.md) → `docs/standards/issue-tracker.md`
- [references/domain.md](./references/domain.md) → `docs/standards/domain-docs.md`
- [references/standards/code-comment-taxonomy.md](./references/standards/code-comment-taxonomy.md) → `docs/standards/code-comment-taxonomy.md`
- [references/standards/api-design-and-error-handling.md](./references/standards/api-design-and-error-handling.md) → `docs/standards/api-design-and-error-handling.md`
- [references/standards/database-and-migrations.md](./references/standards/database-and-migrations.md) → `docs/standards/database-and-migrations.md`
- [references/standards/concurrency-and-locking.md](./references/standards/concurrency-and-locking.md) → `docs/standards/concurrency-and-locking.md`
- [references/standards/testing-and-fixtures.md](./references/standards/testing-and-fixtures.md) → `docs/standards/testing-and-fixtures.md`
- [references/standards/security-and-cryptography.md](./references/standards/security-and-cryptography.md) → `docs/standards/security-and-cryptography.md`
- [references/standards/git-flow-and-pr-matrix.md](./references/standards/git-flow-and-pr-matrix.md) → `docs/standards/git-flow-and-pr-matrix.md`

Format requirement: high density — decision tables, code snippets, sharp context pointers. No narrative fluff, no redundant parentheses, zero tutorial prose.

### 5. Done

Tell the user the setup is complete. Mention they can edit `docs/standards/*.md` directly later — re-running this skill is only necessary if they want to reconfigure trackers or restart from scratch.
