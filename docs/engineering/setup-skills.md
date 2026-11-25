## What it does

`setup-skills` configures one repo for the rest of the engineering skills. It answers four questions — where issues live, what the triage labels are called, where the domain docs sit, and which engineering standards bind the code — and records the answers as markdown under `docs/standards/`.

Those files are the only thing that varies between repos. The skills themselves are identical everywhere; they read `docs/standards/issue-tracker.md` at run time and do what it says. That is why the set is not tied to GitHub, and why no skill file ever needs editing to point it somewhere else. Invoking it with "link the skills to a custom issue tracker" works with anything you can connect to programmatically, with zero changes to the skills.

The standards half is the other SSOT: seven dense files covering comments, API and errors, database and migrations, concurrency, testing, security, and git flow. They are written to be read by an agent before it touches the matching code, and the `## Engineering Standards` block it adds to `AGENTS.md` is the map from a change to the file that governs it.

It is a prompt-driven skill, not a deterministic script. It reads your `git remote`, your existing `AGENTS.md` / `CLAUDE.md`, your existing `GLOSSARY.md`, proposes what it found, and waits for you to confirm before writing anything.

## When to reach for it

Reach for it once per repo, before the first use of any other engineering skill. If [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), [to-tickets](https://aihero.dev/skills-to-tickets) or [wayfinder](https://aihero.dev/skills-wayfinder) start guessing where your issues go, or apply labels your tracker doesn't have, they have not been set up here yet.

It is reachable by typing `/setup-skills`, and a repo already halfway through a project is a fine place to run it; the skill reads what is already there and no earlier work is wasted.

## Prerequisites

It writes into the repo you run it in:

| It writes                                                                                                                                                                                                                                   | Where                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `issue-tracker.md` (tracker + triage label vocabulary)                                                                                                                                                                                      | `docs/standards/`                                                     |
| `domain-docs.md`                                                                                                                                                                                                                            | `docs/standards/`                                                     |
| `code-review.md` (repo-specific diff excludes, tool skips, layer symbol map, contract spot-check)                                                                                                                                           | `docs/standards/`                                                     |
| Seven pillar standards (`code-comment-taxonomy.md`, `api-design-and-error-handling.md`, `database-and-migrations.md`, `concurrency-and-locking.md`, `testing-and-fixtures.md`, `security-and-cryptography.md`, `git-flow-and-pr-matrix.md`) | `docs/standards/`                                                     |
| An `## Engineering Standards` block                                                                                                                                                                                                         | `AGENTS.md`, or `CLAUDE.md` when that is the file that already exists |
| Issue forms (`task.yml`, `sub_issue.yml`, `bug_report.yml`, `feature_request.yml`, `config.yml`)                                                                                                                                            | `.github/ISSUE_TEMPLATE/`, only on GitHub when missing                |
| A starter `GLOSSARY.md`                                                                                                                                                                                                                     | repo root, only when single-context and missing                       |

All of it is committed markdown. There is no user-level or global mode: the config lives in the repo, so every repo gets its own copy.

## The four decisions

It leads each section with the recommended answer, and skips whatever exploration already settled.

| Decision                  | What it proposes                                                                                              | When it actually asks                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Issue tracker**         | the one matching your `git remote`                                                                            | always — this is the one real choice                                                    |
| **Triage labels**         | keep the five canonical names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) | only if the `triage` skill is installed                                                 |
| **Domain docs**           | single-context: one `GLOSSARY.md` plus `docs/adr/` at the root                                                | only if it spots monorepo signals, and then it offers a multi-context `GLOSSARY-MAP.md` |
| **Engineering standards** | accept all seven pillars                                                                                      | per pillar, with a one-line prompt each                                                 |

The tracker options:

| Option             | Where issues live                              | Needs                                          |
| ------------------ | ---------------------------------------------- | ---------------------------------------------- |
| **GitHub**         | the repo's GitHub Issues                       | the `gh` CLI                                   |
| **GitLab**         | the repo's GitLab Issues                       | the `glab` CLI                                 |
| **Local markdown** | files under `.scratch/<feature>/` in this repo | nothing — no remote at all                     |
| **Other**          | wherever you say                               | one paragraph from you describing the workflow |

The first three ship as templates in the skill and work out of the box. Local markdown is a first-class option, not a fallback: a solo project with no remote is fully supported. One caveat is worth repeating: don't use local markdown if you're using GitHub. They are alternatives, not layers.

"Other" is not a stub either. It is the reason Jira, Linear, Azure DevOps and Beads all work: you describe the workflow, the skill records your prose in `docs/standards/issue-tracker.md`, and the downstream skills follow the prose. The community has already done this — a Jira-over-[MCP](https://www.aihero.dev/ai-coding-dictionary/mcp) variant, a Gitea CLI shaped like `gh`, a hand-built local dashboard.

The seven standards pillars are opinionated defaults, each seeded from a high-density template: code-comment taxonomy, API and error handling, database and migrations, concurrency and locking, testing and fixtures, security and cryptography, and git flow and PRs. You approve them per pillar, and they are written to `docs/standards/*.md` so you can edit them by hand afterwards.

## Common questions

**Do I have to use GitHub?**

No. GitHub, GitLab and local markdown under `.scratch/` all ship as ready-made templates, and anything else works through the "other" path. This is the most-repeated question in the record, in roughly these words: _"hard locked to github"_, _"can I use GitLab / Jira"_, _"what about Azure DevOps"_. The answer every time is that the tracker is a setup answer, not a skill property.

**Do I need to re-run it after updating the skills?**

Usually no. Re-running is for switching trackers, restarting the configuration, or refreshing seed templates that changed between releases. If a downstream skill starts reading a file or a flag the docs describe differently, re-running is the cheap fix; day-to-day edits to `docs/standards/*.md` are meant to be made by hand.

**It wrote to `CLAUDE.md`, but I'm on Codex.**

It prefers `AGENTS.md` and only falls back to `CLAUDE.md` when that is the file that already exists. If you run Codex, keep `AGENTS.md` canonical — either move the `## Engineering Standards` block there or make `CLAUDE.md` a one-line pointer at it. If neither file exists, the skill asks you which to create rather than picking.

**It didn't create my triage labels.**

It does now, on GitHub and GitLab: the configured vocabulary is recorded in `docs/standards/issue-tracker.md`, and setup creates each label the tracker lacks (`gh label create` / `glab label create`). If your tracker already uses the canonical names, the mapping is an identity table and there is nothing left to create. [wayfinder](https://aihero.dev/skills-wayfinder)'s `wayfinder:map` and `wayfinder:<type>` labels are still not created here, and `gh issue create --label <missing>` fails outright rather than creating the label, so create those by hand before the first wayfinder run on a GitHub repo.

**Can I configure the other skills' behaviour here — [grilling](https://www.aihero.dev/ai-coding-dictionary/grilling) cadence, question format, tone?**

No. It configures four things: tracker, labels, domain doc layout, and the engineering standards. There have been direct requests to make it the home for per-user preferences, and the standing answer is that skills stay opinionated: _"Config is death."_ Preferences belong in your `AGENTS.md` / `CLAUDE.md` as plain instructions, which every skill already reads.

**Can I keep the config in `~/.claude` instead of committing it to every repo?**

Not today. There is an open request for exactly this from someone running the skills across many repos, and no user-level mode exists. Every repo carries its own `docs/standards/`.

**Isn't it strange to have a skill that configures the other skills?**

One long-standing complaint says yes, in these words: _"having a skill to set up the other skill does not feel right to me — that means the LLM is configuring its own skills."_ The trade is real and acknowledged: the alternative to a setup step is duplicating tracker and standards instructions into every skill that touches issues or code. The output is inspectable, editable markdown, which is the mitigation — you can read every file it wrote and change it by hand, and day-to-day tweaks are exactly that, not another run.

## It's working if

- `docs/standards/issue-tracker.md`, `docs/standards/domain-docs.md`, `docs/standards/code-review.md`, and the seven pillar files exist (`scripts/verify-setup.mjs` passes).
- An `## Engineering Standards` section appears in `AGENTS.md` (or the instruction file your harness actually reads), with a one-line pointer to each standard.
- Every configured triage label exists in the tracker.
- On GitHub, `.github/ISSUE_TEMPLATE/` has the issue forms, and `GLOSSARY.md` exists if you chose single-context.
- Afterwards, `/to-tickets` publishes without asking you where issues live, `/triage` applies labels rather than inventing them, and `/implement` reads the standard that governs the change before writing code.
- Nothing in the skill files themselves changed. If setup edited a `SKILL.md`, something went wrong.

## Where it fits

`setup-skills` is the **run-once setup** for the engineering flow, the precondition everything else assumes rather than a step in the chain. Its neighbours are its readers: [triage](https://aihero.dev/skills-triage), which applies the label vocabulary written here; [to-spec](https://aihero.dev/skills-to-spec) and [to-tickets](https://aihero.dev/skills-to-tickets), which publish into the tracker named here; and [wayfinder](https://aihero.dev/skills-wayfinder), which reads the "Wayfinding operations" section of the same tracker file to know how maps and child [tickets](https://www.aihero.dev/ai-coding-dictionary/ticket) are stored. The standards files are read by [implement](https://aihero.dev/skills-implement) before it writes code, by [tdd](https://aihero.dev/skills-tdd) before it writes a test, and by [code-review](https://aihero.dev/skills-code-review) as the Standards axis. The domain-doc layout it records is the one [domain-modeling](https://aihero.dev/skills-domain-modeling) fills in later — it creates `GLOSSARY.md` and ADRs lazily, when a term or decision actually gets resolved, so an empty repo after setup is the expected state. For which skill to reach for next, [ask-skills](https://aihero.dev/skills-ask-skills) routes the whole set.
