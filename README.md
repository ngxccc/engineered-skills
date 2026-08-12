# Engineered Skills

A modular, composable, and customizable collection of agent skills designed for pragmatic software engineering and productivity across AI coding agents (Claude Code, Codex, Oh My Pi, Cursor).

---

## Why These Skills Exist

Developing real applications is hard. Frameworks and agent harnesses often attempt to own the entire development process autonomously, taking away developer control and making bugs difficult to resolve.

These skills are designed to be small, easy to adapt, composable, and model-agnostic. They condense software engineering fundamentals into repeatable practices to fix common failure modes seen in AI-assisted development.

### 1. The Agent Didn't Do What I Want (Misalignment)

> "No one knows exactly what they want."  
> — David Thomas & Andrew Hunt, *The Pragmatic Programmer*

**The Problem:** The most common failure mode in software development is misalignment. There is a communication gap between the developer and the agent.

**The Fix:** A structured **grilling session** — getting the agent to interview you relentlessly with detailed questions about requirements, UI constraints, edge cases, and architectural boundaries before writing code.

- [`/grill-me`](./skills/productivity/grill-me/SKILL.md) — For general planning and non-code ideas.
- [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) — Grilling session that also builds project domain terms (`CONTEXT.md`) and Architectural Decision Records (ADRs).

### 2. The Agent Is Way Too Verbose (Jargon & Context Gap)

> "With a ubiquitous language, conversations among developers and expressions of the code are all derived from the same domain model."  
> — Eric Evans, *Domain-Driven Design*

**The Problem:** Agents dropped into a project without domain context waste token budget guessing jargon, using 20 words where one will do.

**The Fix:** A shared ubiquitous language defined in `CONTEXT.md`. It decodes project jargon for agents, sharpens variable/file naming, and reduces token consumption during thinking phases.

- [`/domain-modeling`](./skills/engineering/domain-modeling/SKILL.md) — Sharpen terms and update `CONTEXT.md` and ADRs.
- [`/wait-what`](./skills/productivity/wait-what/SKILL.md) — Force the agent to re-pitch a verbose message using `CONTEXT.md` terms.

### 3. The Code Doesn't Work (Feedback Loop Failures)

> "Always take small, deliberate steps. The rate of feedback is your speed limit. Never take on a task that's too big."  
> — David Thomas & Andrew Hunt, *The Pragmatic Programmer*

**The Problem:** Without continuous runtime feedback, an agent produces non-working code.

**The Fix:** Fast, structured feedback loops using static typing, automated testing, and disciplined bug diagnosis.

- [`/tdd`](./skills/engineering/tdd/SKILL.md) — Enforce a Red-Green-Refactor loop, writing failing tests first at pre-agreed seams.
- [`/diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md) — A 5-phase gated diagnosis loop: Red repro -> Minimize -> Hypothesize -> Instrument -> Fix -> Regression test.

### 4. We Built A Ball Of Mud (Software Entropy)

> "Invest in the design of the system every day."  
> — Kent Beck, *Extreme Programming Explained*

> "The best modules are deep. They allow a lot of functionality to be accessed through a simple interface."  
> — John Ousterhout, *A Philosophy of Software Design*

**The Problem:** Agents speed up coding, accelerating software entropy. Codebases grow complex and tangled at an unprecedented rate.

**The Fix:** Caring about codebase architecture and deep module design.

- [`/to-spec`](./skills/engineering/to-spec/SKILL.md) — Interrogate module boundaries before writing specifications.
- [`/codebase-design`](./skills/engineering/codebase-design/SKILL.md) — Vocabulary and discipline for small interfaces over deep functionality.
- [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) — Survey codebase for deepening opportunities and present candidates for refactoring.

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
