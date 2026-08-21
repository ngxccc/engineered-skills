---
trigger_keywords: grill-with-docs, interview-requirements, adr-generation, domain-sharpening
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

# Grill With Docs

Stateful idea-sharpening interview that maintains project glossary and architecture records.

## Process

1. **Explore context** — inspect existing codebase and architecture before asking questions.
2. **Run Socratic interview** — execute `/grilling` applying [references/brainstorming-grill-protocol.md](references/brainstorming-grill-protocol.md):
   - Present architectural forks as a **Trade-Off Matrix** (2–3 options with recommendation).
   - Evaluate across the **7 Baseline Engineering Domains** (Security, UX, Performance, Reliability, Maintainability, Observability, Compliance).
3. **Persist discoveries**:
   - Record new or refined domain terminology in `CONTEXT.md` (via `/domain-modeling`).
   - Record architectural decisions as ADRs in `docs/adr/` (via `/docs adr`).
4. **Route artifact**:
   - **High-Risk Class** (Auth, Billing, DB Schema, Public API, Gateway, Secrets) → author Formal Specification via `/docs formal-spec`.
   - **Standard Features** → author System Design via `/docs design` or proceed directly to `/to-spec`.
