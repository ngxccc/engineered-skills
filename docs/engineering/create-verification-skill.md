## What it does

`create-verification-skill` interviews a repository (not the user) to generate a project-local verification skill (`<skills-dir>/verify-<app>/`, such as `.agents/skills/verify-<app>/` or `.claude/skills/verify-<app>/`) plus a user-POV feature map under `features/`. It encodes how to launch the app from a clean state, run a read-only `Doctor` check, drive real user surfaces (web/browser, CLI/PTY, or HTTP), capture surviving proof artifacts, and tear down only the instances it started.

Crucially, the skill requires executing its own generated instructions end-to-end on at least one mapped feature before handing it over — an unexecuted verification skill is treated as a draft, not a deliverable.

## When to reach for it

Type `/create-verification-skill` when a project has no scripted, repeatable way for agents to launch the real app, exercise user journeys, and capture runtime evidence.

## Common questions

**Does it replace unit or integration tests?**

No. Unit/integration tests belong to [tdd](https://aihero.dev/skills-tdd); `create-verification-skill` builds the repeatable end-to-end verification harness and feature map for proving real app behavior.

**What happens if seed data or local startup is broken?**

It fixes or reports the startup blocker first rather than weakening a journey to make it pass, and documents missing preconditions in that feature's `Gotchas` section.

## It's working if

- `<skills-dir>/verify-<app>/SKILL.md` and `features/README.md` exist with repo-grounded commands, selectors, and cleanup rules (no placeholders).
- At least one mapped feature was driven end-to-end, its evidence survived cleanup, and the generated `Cleanup` removed only the instances created by the run.
