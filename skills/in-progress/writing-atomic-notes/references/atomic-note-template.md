# Atomic Note Reference & Templates

A comprehensive guide and template for creating high-leverage atomic notes in Obsidian, Logseq, or Markdown-based Second Brain vaults.

---

## 1. The Standard Atomic Note Template

Copy and fill this skeleton for new notes:

```markdown
---
title: "Declarative Propositional Statement"
type: atomic
status: seedling | evergreen
tags:
  - domain/subdomain
sources:
  - "Author (Year) - Title, or URL"
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Declarative Propositional Statement

[Paragraph 1: The Core Claim & Context. State the core insight directly in active voice. Explain the invariant or boundary condition.]

[Paragraph 2: The Mechanism. Explain _why_ or _how_ it works. Avoid vague abstractions; focus on the cause-and-effect relationship.]

## Grounding & Examples

[Provide a concrete real-world scenario, code snippet, numerical comparison, or counter-example that proves or grounds the claim.]

## Connections

- Requires: [[Prerequisite Note]] — why this concept depends on that one.
- Supports: [[Target Note]] — how this claim provides evidence or mechanisms for another.
- Contrasts with: [[Alternative Note]] — how this perspective differs or trades off against another.
- Enables: [[Downstream Note]] — what becomes possible once this claim is accepted.
- Upstream MOC: [[MOC - Core Domain]]
```

---

## 2. Complete Real-World Example

Here is a finished, high-quality atomic note demonstrating every principle:

```markdown
---
title: "Deep modules lower cognitive load by placing extensive behavior behind small interfaces"
type: atomic
status: evergreen
tags:
  - architecture/interface-design
  - engineering/complexity
sources:
  - "John Ousterhout (2018) - A Philosophy of Software Design, Chapter 4"
created: 2026-09-13
---

# Deep modules lower cognitive load by placing extensive behavior behind small interfaces

A module is "deep" when its interface is dramatically simpler than the implementation behind it. The value of a module lies in the ratio of complexity hidden to interface surface area exposed. When a module encapsulates substantial complexity while offering only a handful of well-chosen methods, consumers can reason about the system without loading internal mechanics into working memory.

Conversely, "shallow" modules—where the interface is nearly as complex as the implementation—provide negative leverage. They force the caller to manage internal details (such as multi-step lifecycle initialization or leaky error flags) while adding indirection without abstraction.

## Grounding & Examples

- **Standard Unix I/O:** Five simple system calls (`open`, `read`, `write`, `close`, `lseek`) hide massive complexity across file systems, disk drivers, buffer caches, and network sockets. A consumer needs zero knowledge of block allocation or interrupt routines.
- **Counter-example (Shallow Class):** A `UserValidationHelper` class with 10 lines of code across 3 separate pass-through methods adds boilerplate and import overhead without saving the consumer from understanding the underlying validation logic.

## Connections

- Requires: [[Information hiding prevents state leakage across architectural seams]] — foundational concept behind deep interface boundaries.
- Contrasts with: [[Micro-abstractions increase system entropy through dependency fan-out]] — shallow modules create tangled call graphs.
- Enables: [[Stable seams allow independent refactoring without breaking callers]] — callers depend only on the minimal API contract.
- Upstream MOC: [[MOC - Software Architecture]]
```

---

## 3. Anti-Patterns vs. Modern Best Practices

| Anti-Pattern                                                                              | Why It Fails                                                                                   | Modern Atomic Pattern                                                                                                                 |
| :---------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Topic Titles:**<br>`# Caching`                                                          | Doesn't make a claim. Reader and RAG models must open the file to know what it argues.         | **Propositional API:**<br>`# Write-through caches eliminate read latency at the expense of write throughput`                          |
| **Bare Link Dumps:**<br>`See also: [[A]], [[B]], [[C]]`                                   | Dead graph edges. Zero information about _why_ they relate, breaking semantic graph traversal. | **Annotated Predicates:**<br>`- Contrasts with: [[Write-around caching]] which avoids polluting cache with one-off bulk writes.`      |
| **Source Summaries:**<br>Three pages summarizing Chapter 2 of a book.                     | Monolithic note that cannot be reused across different projects or contexts.                   | **Atomized Extraction:**<br>Extract 3–5 standalone claims from Chapter 2 into separate atomic notes, each linking back to the source. |
| **Corporate AI Slop:**<br>_"Caching plays a vital role in fostering scalable paradigms."_ | Zero information density. Fails the Portability Test.                                          | **Concrete Mechanics:**<br>_"LRU eviction bounds memory consumption to O(N) entries with O(1) amortized access time."_                |

---

## 4. Pre-Save Quality Checklist

Before finalizing an atomic note, verify:

- [ ] **Propositional Title:** Does the title read as a complete, declarative sentence?
- [ ] **Strict Atomicity:** Does this note make exactly one core claim?
- [ ] **Self-Contained:** Can an engineer or reader understand this note without opening its sources?
- [ ] **Portability Test:** Is the note free of generic filler and buzzwords?
- [ ] **Annotated Edges:** Does every `[[wikilink]]` have an explicit relationship predicate?
- [ ] **Upstream Anchor:** Is it hooked into at least one Map of Content (MOC) or index?
