---
trigger_keywords: grill-with-docs, interview-requirements, adr-generation, domain-sharpening, stress-test-idea, stress-test-design, assumption-testing
name: grill-with-docs
description: A relentless interview to stress-test and sharpen a plan or design against a codebase, creating docs (ADRs and glossary) as we go.
disable-model-invocation: true
---

# Grill With Docs

Stateful interview that stress-tests ideas, sharpens plans, and maintains project glossary and architecture records.

## Process

1. **Explore context** — inspect existing codebase and architecture before asking questions. Finding facts is the agent's job; do not ask the user for anything readable in the repo.
2. **Challenge unviable premises first (Premise Gate)** — if the premise or architecture is physically impossible, logically contradictory, breaks foundational invariants, or is fundamentally unviable against the codebase, attack the root premise on Round 1. State the fatal flaw directly, explain why it cannot work as conceived, and recommend killing, pivoting, or reframing before expanding child branches, constructing trade-off matrices, or writing docs. Do not flatter the user or design on broken foundations.
3. **Run Socratic interview (`/grilling`)** applying [references/brainstorming-grill-protocol.md](references/brainstorming-grill-protocol.md):
   - Work in **rounds** across the **frontier** using standard question format (`❓ **Q<n>** - **<title>**:` and `➡️ <recommendation>`).
   - Recommendations (`➡️`) must actively stress-test failure modes, hidden costs, security holes, and unstated assumptions rather than smoothing over trade-offs to please the user.
   - Present architectural forks as a **Trade-Off Matrix** (2–3 options with recommendation) embedded in question bodies.
   - Evaluate across the **7 Baseline Engineering Domains** (Security, UX, Performance, Reliability, Maintainability, Observability, Compliance).
4. **Persist discoveries inline**:
   - Record new or refined domain terminology in `GLOSSARY.md` (via `/domain-modeling`) the moment it crystallizes (pure vocabulary, no implementation details).
   - Record architectural decisions as ADRs in `docs/adr/` (via `/docs adr`) ONLY when all 3 gates pass: (1) hard to reverse, (2) surprising without context, (3) result of a real trade-off. Otherwise skip.
5. **Confirm shared understanding & route artifact**:
   - The session ends only when the frontier is empty and the user confirms shared understanding. Do not author downstream specs prematurely.
   - **High-Risk Class** (Auth, Billing, DB Schema, Public API, Gateway, Secrets) → author Formal Specification via `/docs formal-spec`.
   - **Standard Features** → author System Design via `/docs design` or proceed directly to `/to-spec`.

When authoring documentation artifacts (ADRs, System Design, Formal Specs), author and decider fields MUST default to the user's local GitHub username (via `gh api user --jq .login` or `git config user.name`), never generic placeholders (`Team`) or AI names (`Agent`, `Claude`).
