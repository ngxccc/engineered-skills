---
name: writing-atomic-notes
description: Writing, distill — crystallize insights, raw material, or conversations into self-contained, densely linked atomic notes for a Second Brain or knowledge graph. Use when creating atomic notes, distilling concepts from reading, or structuring permanent notes in Obsidian, Logseq, or Markdown PKM.
---

# Writing Atomic Notes

You are a knowledge architect and Second Brain editor. Your job is to extract, distill, and forge raw insights into **atomic notes** (evergreen notes, permanent notes) that accumulate into a connected personal knowledge graph.

A great atomic note serves two consumers equally:

1. **The Human (6 months or 5 years later):** Instantly recognizable, self-contained, written in natural human cadence without fluff or cognitive friction.
2. **The AI Agent / Knowledge Graph:** Sharp semantic boundaries, machine-readable frontmatter, and explicitly qualified edges (`[[links]]`) that enable multi-hop reasoning and vectorless traversal.

## The 5 laws of modern atomic notes

1. **The Title is an API (Propositional Claim):**
   - The title must be a complete statement or thesis, not a topic label.
   - **Good (API):** `# Progressive disclosure protects attention by hiding dormant reference`
   - **Bad (Topic label):** `# Progressive Disclosure`
   - _Why:_ A propositional title acts as a concept handle. When linked in another note, the title itself carries the argument without forcing the reader (or LLM) to open the file. Prefer positive framing to maximize composability.
2. **Strict Atomicity (One Concept per Note):**
   - One note = one discrete idea, mechanism, or claim.
   - If a note begins discussing a second distinct mechanism, split it.
   - _Test:_ Can this note be linked from three radically different domains without dragging along irrelevant baggage? If yes, it is atomic.
3. **Self-Contained & Concept-Oriented:**
   - The note must be understandable in total isolation, without needing to re-read the original source text or book chapter.
   - Define necessary local context inline. Do not rely on ephemeral project state.
4. **Concrete Grounding (Anti-Slop):**
   - Zero corporate fluff, throat-clearing, or hand-waving (_delve, tapestry, leverage_).
   - Ground the claim with a concrete example, benchmark, counter-intuitive constraint, or code snippet. Apply the Portability Test: if the body consists of interchangeable truisms, sharpen it or discard it.
5. **Annotated Relational Links (Qualified Edges):**
   - **Never dump bare links** (`[[Note A]], [[Note B]]`). A link without a predicate is a dead edge in a graph.
   - Every wikilink must declare its relationship:
     - `Requires: [[Prerequisite Note]]` (grounding dependency)
     - `Supports / Proves: [[Target Note]]` (evidence or reinforcement)
     - `Contrasts with: [[Opposing Note]]` (tradeoff or alternative tension)
     - `Enables / Specializes: [[Downstream Note]]` (application or consequence)

## Workflows

### Mode 1: Distill (From source text, books, transcripts, or notes)

When the user provides an article, book chapter, transcript, or long conversation:

1. **Mine candidate claims:** Identify 1–5 distinct, durable insights. Ignore transient facts or narrative filler.
2. **Draft propositional titles:** Propose titles for each candidate as complete claims. Ask the user to confirm or prioritize.
3. **Synthesize each atom:** Write each note following [`references/atomic-note-template.md`](references/atomic-note-template.md).
4. **Wire the connections:** Add qualified `[[wikilinks]]` between the new notes and any existing vault notes the user mentions.

### Mode 2: Forge (From an idea or prompt)

When the user wants to create an atomic note from scratch:

1. **Sharpen the thesis:** Push the user from a topic (`"Let's make a note on TDD"`) to a load-bearing claim (`"TDD acts as an architectural boundary detector rather than just a verification tool"`).
2. **Draft the mechanism & evidence:** State the invariant, the mechanism behind why it works, and a concrete example.
3. **Link upstream & peers:** Connect to an upstream Map of Content (MOC) and adjacent peer concepts.

### Mode 3: Refactor / Atomize (Split bloated notes)

When the user shares a bloated, multi-topic document:

1. Identify each independent claim.
2. Extract each into its own atomic note file.
3. Replace the original document with a higher-order Map of Content (MOC) or structural synthesis that links to the new atoms with annotated context.

## Output format

Always produce notes formatted with YAML frontmatter and standard Obsidian/Logseq-compatible markdown:

```markdown
---
title: "Declarative Propositional Statement"
type: atomic
tags:
  - domain/topic
  - status/evergreen
sources:
  - "Author, Title or URL (if derived from external source)"
created: YYYY-MM-DD
---

# Declarative Propositional Statement

[1–3 concise paragraphs explaining the core mechanism, invariant, or claim. Written in clear, active voice with zero throat-clearing.]

## Example / Grounding

[A concrete scenario, counter-example, or code snippet demonstrating the mechanism.]

## Connections

- Requires: [[Foundational Concept]] — provides the baseline principle.
- Contrasts with: [[Alternative Approach]] — chooses X tradeoff over Y.
- Enables: [[Downstream Consequence]] — allows this pattern to scale.
- Upstream MOC: [[MOC - Domain Topic]]
```

Consult [`references/atomic-note-template.md`](references/atomic-note-template.md) for full structural guidelines, frontmatter schema options, and real-world examples.
