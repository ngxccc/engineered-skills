# Engineered Skills

A modular, composable, and customizable collection of agent skills designed for pragmatic software engineering and productivity across AI coding agents (Claude Code, Codex, Oh My Pi, Cursor).

---

## Management & Installation

### Option A: Local Symlink Management (Recommended)

Link skills directly from this central repository into your target project directory for instant live updates across all agent sessions.

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

---

## Initial Setup

Run `/setup-skills` once per repository session:

- Configures issue tracker integration (GitHub, Linear, or local Markdown files).
- Configures triage labels and domain documentation structure.
- Creates `CONTEXT.md` for shared ubiquitous domain language.

---

## Available Skills

### Engineering Skills

* **User-Invoked (Explicit Trigger):**
  - `/ask-skills` — Router skill to recommend the right workflow or skill for your task.
  - `/grill-with-docs` — Relentless interview session to clarify requirements and update `CONTEXT.md` + ADRs.
  - `/triage` — Move issue tickets through triage states.
  - `/improve-codebase-architecture` — Survey codebase for deep module opportunities (Ousterhout design).
  - `/setup-skills` — Configure issue tracker, triage labels, and domain doc layout.
  - `/to-spec` — Synthesize conversation into a technical specification.
  - `/to-tickets` — Break spec into tracer-bullet tickets with explicit blocking edges.
  - `/implement` — Build ticket work driving `/tdd` at seams and closing out with `/code-review`.
  - `/wayfinder` — Map multi-session decision tickets across large architectural features.

* **Model-Invoked (Disciplined Helpers):**
  - `/prototype` — Build throwaway shareable HTML prototypes to answer design questions.
  - `/diagnosing-bugs` — 5-phase gated diagnosis loop for complex bugs and performance regressions.
  - `/research` — Investigate questions against high-trust primary sources.
  - `/tdd` — Red-Green-Refactor test-driven development loop.
  - `/domain-modeling` — Sharpen domain terms in `CONTEXT.md` and ADRs.
  - `/codebase-design` — Enforce small interfaces over deep modules.
  - `/code-review` — Parallel 2-axis code review (Standards/Smells + Spec Compliance).
  - `/resolving-merge-conflicts` — Resolve git merge/rebase conflicts hunk by hunk.
  - `/wizard` — Generate interactive bash wizards for manual procedures.

### Productivity Skills

* **User-Invoked:**
  - `/grill-me` — Relentless interview about a plan or idea until all branches are resolved.
  - `/handoff` — Compact current conversation into a handoff artifact.
  - `/teach` — Multi-session interactive teaching workspace.
  - `/to-questionnaire` — Generate async Markdown questionnaire for external decision makers.
  - `/wait-what` — Force agent to re-pitch a confusing message in plain English using `CONTEXT.md` terms.

* **Model-Invoked:**
  - `/grilling` — Interview primitive behind all grilling workflows.
  - `/writing-for-agents` — Guidelines for authoring clear docs, skills, and agent rules.
