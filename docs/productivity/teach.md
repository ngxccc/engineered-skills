## What it does

`teach` transforms the AI into an interactive, evidence-first Socratic tutor. It enforces **First-Principles Thinking**, **Specification & Invariant Engineering** (defining strict system bounds and assertions), **Automated Verification** (CLI output, log traces, profilers, tests over manual eye-reading), and **Desirable Difficulty** (Active Recall & ZPD).

It operates adaptively across two execution modes:

- **Mode A (Project Repo):** Just-In-Time learning to overcome technical blockers without polluting the Git tree with scratchpad files.
- **Mode B (Second Brain Vault):** Systematic long-term knowledge synthesis into structured Atomic Notes after empirical verification.

## When to reach for it

Invoke `/teach` when mastering complex software engineering concepts, deep architectural mechanics, or technical domains:

| What you want                                                | What to reach for                                |
| ------------------------------------------------------------ | ------------------------------------------------ |
| Learn a technical topic, framework, or architectural pattern | `/teach`                                         |
| Get a single message re-pitched in plain English             | [wait-what](https://aihero.dev/skills-wait-what) |
| Sharpen existing plans or assumptions via interview          | [grill-me](https://aihero.dev/skills-grill-me)   |
| Delegate reading legwork to a background agent               | [research](https://aihero.dev/skills-research)   |

## Common questions

**What is 30-40-30 Strategic Resource Allocation?**  
It focuses learning energy on high-leverage engineering core instead of syntax memorization: 30% Core Fundamentals (Memory, Concurrency, Protocols, DB Internals), 40% System Design & Specifications (System Invariants, Schemas, Contracts, TDD), and 30% AI Orchestration & Automated Verification (Debuggers, Profilers, Traces, Automated Tests).

**Why Specification & Invariant Engineering over "Human Auditor"?**  
Manually reading AI code line-by-line by eye causes Cognitive Load overload and unscalable review (Review Fatigue). `teach` trains you to define strict **System Invariants** (e.g., "Balance $\ge$ 0 under concurrency") and write automated test assertions (TDD), forcing the runtime or AI code to prove compliance.

**How does empirical verification work?**  
Mental models must be proven against runtime reality: inspecting CLI outputs, network packet frames, log traces, running failing-to-passing tests, or profiling memory/CPU metrics.

**What is the 3-Phase Learner Progression Model?**  
Derived from empirical research on AI-native engineering pedagogy, it structures mastery into three progressive phases: Phase 1 (Master System Fundamentals & Runtime Mechanics via hands-on scaffolding without abstractions), Phase 2 (Invariant & Test-Driven Specification defining strict boundary assertions before business code), and Phase 3 (AI Agent Orchestration & Observability for automated verification at scale).

## It's working if

- It asks targeted Socratic questions calibrated to your Zone of Proximal Development (ZPD) instead of dumping essay explanations.
- It challenges Cognitive Biases (Sunk Cost Fallacy of manual syntax typing, Passive AI usage).
- Learning in a Second Brain vault produces single-responsibility Atomic Notes linked into your MOC.
- Verification relies on CLI logs, profilers, or automated test suites rather than manual code skimming.
