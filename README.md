# Engineered Skills

Composable, small, model-agnostic skills for software engineering with AI agents — prioritizing precision, architectural discipline, and repeatable feedback loops over vibe coding.

---

## Installation (30-second setup)

Two ways in, two philosophies. Link skills directly from this central repository into your project directory for instant live updates across all agent sessions.

### 1. Get the skills

#### Method 1: Using Compiled Go CLI (Fastest & Standalone)

Run the compiled Go binary to interactively select skills or perform instant bulk symlinking:

```bash
# Interactive TUI mode:
~/workspace/40-tools/engineered-skills/bin/engineered-cli

# Automatic fast symlink mode (in your target project directory):
~/workspace/40-tools/engineered-skills/bin/engineered-cli --link --yes
```

To run `engineered-cli` globally from anywhere on your machine, copy the binary to your local bin path:

```bash
cp ~/workspace/40-tools/engineered-skills/bin/engineered-cli ~/.local/bin/

# Then run inside any project:
engineered-cli --link --yes
```

#### Method 2: Direct Manual Symlink Commands

```bash
# In your target project directory:
mkdir -p .claude/skills

# Symlink specific skills from this repository:
ln -s ~/workspace/40-tools/engineered-skills/skills/engineering/grill-with-docs .claude/skills/
ln -s ~/workspace/40-tools/engineered-skills/skills/engineering/to-tickets .claude/skills/
ln -s ~/workspace/40-tools/engineered-skills/skills/engineering/implement .claude/skills/
ln -s ~/workspace/40-tools/engineered-skills/skills/engineering/tdd .claude/skills/
ln -s ~/workspace/40-tools/engineered-skills/skills/engineering/code-review .claude/skills/

# Symlink for Codex / Oh My Pi cross-agent compatibility:
ln -s .claude/skills .agents/skills
```

### 2. Run `/setup-skills`

In your agent, run it once per repo. It will:

- Ask you which issue tracker you want to use (GitHub, Linear, or local files)
- Ask you what labels you apply to tickets when you triage them (`/triage` uses labels)
- Ask you where you want to save any docs created

### 3. Bam — you're ready to go

---

## Why These Skills Exist

Addresses four core failure modes in AI agent development:

| Failure Mode                | Root Cause                                            | Solution Skill                                                                                                                                                                                |
| :-------------------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Misalignment**         | Agent builds without understanding human intent.      | [`/grill-me`](./skills/productivity/grill-me/SKILL.md), [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) — Relentlessly interviews intent before writing code.             |
| **2. Verbosity & Jargon**   | Missing domain language causes agent token waste.     | [`domain-modeling`](./skills/engineering/domain-modeling/SKILL.md) — Builds Ubiquitous Language (`CONTEXT.md`) to decode project jargon.                                                      |
| **3. Non-Working Code**     | Missing feedback loops during implementation.         | [`/tdd`](./skills/engineering/tdd/SKILL.md), [`diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md) — Red-green-refactor testing and gated debugging loops.                       |
| **4. Architecture Entropy** | Fast coding leads to complex "ball-of-mud" codebases. | [`/to-spec`](./skills/engineering/to-spec/SKILL.md), [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) — Enforces deep modules and clean seams. |

---

## Reference

These split on one axis — who can invoke them. **User-invoked** skills are reachable only when you type them (e.g. `/grill-me`); their job is to orchestrate. **Model-invoked** skills can be invoked by you _or_ reached for automatically by the agent when the task fits; they hold the reusable discipline. A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.

### Engineering

Skills used daily for code work.

**User-invoked**

- **[ask-skills](./skills/engineering/ask-skills/SKILL.md)** — Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — Grilling session that also builds your project's domain model, sharpening terminology and updating `CONTEXT.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)** — Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual report, then grill through whichever one you pick.
- **[setup-skills](./skills/engineering/setup-skills/SKILL.md)** — Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo before using the other engineering skills.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)** — Turn the current conversation into a spec and publish it to the issue tracker. No interview — just synthesizes what you've already discussed.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)** — Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges — written as text in a local file, or as native blocking links on a real tracker.
- **[implement](./skills/engineering/implement/SKILL.md)** — Build the work described by a spec or set of tickets, driving `/tdd` at pre-agreed seams and closing out with `/code-review` before committing.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)** — Plan a huge chunk of work, more than one agent session can hold, as a shared map of decision tickets on the issue tracker — resolve them one at a time until the way to the destination is clear.

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway prototype to answer a design question — a single shareable HTML file for state/logic questions, or several radically different UI variations toggleable from one route.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: build a feedback loop that goes red on this bug -> minimise -> hypothesise -> instrument -> fix -> regression-test.
- **[research](./skills/engineering/research/SKILL.md)** — Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — Actively build and sharpen a project's domain model — challenge terms against the glossary, stress-test with edge-case scenarios, and update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.
- **[code-review](./skills/engineering/code-review/SKILL.md)** — Two-axis review of the diff since a fixed point: Standards (does it follow the repo's coding standards, plus a Fowler smell baseline?) and Spec (does it faithfully implement the originating issue/spec?), run as parallel sub-agents so neither pollutes the other.
- **[resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md)** — Work through an in-progress git merge or rebase conflict hunk by hunk, resolving by intent traced to each side's primary source, then finish the operation — never `--abort`.
- **[wizard](./skills/engineering/wizard/SKILL.md)** — Generate an interactive bash wizard that walks a human through steps only they can perform: provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover.
- **[git-flow](./skills/engineering/git-flow/SKILL.md)** — Git branching, Conventional Commits formatting, and 3-Tier PR creation workflows.

### Productivity

General workflow tools, not code-specific.

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)** — Get relentlessly interviewed about a plan or design until every branch of the design tree is resolved.
- **[handoff](./skills/productivity/handoff/SKILL.md)** — Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./skills/productivity/teach/SKILL.md)** — Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md)** — Turn a decision you can't answer alone into a Markdown questionnaire for the one person who can — filled in async, or together over a meeting. It grills you about the send (who it's for, what you need back), not the subject.
- **[wait-what](./skills/productivity/wait-what/SKILL.md)** — Fire this the moment a message doesn't land. The agent re-pitches it with the context you're missing, in plain English, using your `CONTEXT.md` vocabulary.

**Model-invoked**

- **[docs](./skills/productivity/docs/SKILL.md)** — Manage codebase documentation, ADRs (Simple & Formal), RFCs, System Design Specs, and SSOT Workflows with automated validation.
- **[grilling](./skills/productivity/grilling/SKILL.md)** — Interview the user relentlessly about a plan, decision, or idea until every branch of the design tree is resolved. The reusable interview primitive behind `grill-me`, `grill-with-docs`, `triage`, `wayfinder` and `improve-codebase-architecture`.
- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)** — Writing documents for agents: skills, AGENTS.md/CLAUDE.md, and any doc an agent reaches by a pointer.
