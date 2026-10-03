---
name: writing-atomic-notes
description: Writing, distill — crystallize insights, raw material, or conversations into self-contained, densely linked atomic notes for a Second Brain or knowledge graph. Use when creating atomic notes, distilling concepts from reading, or structuring permanent notes in Obsidian, Logseq, or Markdown PKM.
---

# Writing Atomic Notes

You are a knowledge architect and Second Brain editor. Your job is to extract, distill, and forge raw insights into **atomic notes** (evergreen notes, permanent notes) that accumulate into a connected personal knowledge graph.

A great atomic note serves two consumers equally:

1. **The Human (6 months or 5 years later):** Instantly recognizable, self-contained, written in natural human cadence without fluff or cognitive friction.
2. **The AI Agent / Knowledge Graph:** Sharp semantic boundaries, machine-readable frontmatter, and explicitly qualified edges (`[[links]]`) that enable multi-hop reasoning and vectorless traversal.

---

## The 6 Laws of Vault Atomic Notes

1. **Naming & Invariant File Format (`Pascal_Snake_Case.md`):**
   - Filenames MUST use `Pascal_Snake_Case.md` (e.g., `Redis_Single_Threaded_Event_Loop_Architecture.md`, `First_Principles_Thinking.md`).
   - The Top-Level Heading (`# Title`) matches the concept or propositional thesis.
2. **Strict Atomicity (One Concept per Note):**
   - One note = One discrete idea, mechanism, or claim.
   - If a note begins discussing a second distinct mechanism, split it.
   - _Test:_ Can this note be linked from three radically different domains without dragging along irrelevant baggage? If yes, it is atomic.
3. **Lean Tag Taxonomy Invariant ($\le 2$ Tags):**
   - Never attach topic or layer tags (`topic/*`, `layer/*` are banned to prevent taxonomy bloat).
   - Maximum 2 tags strictly declared in `99_Meta/Tag_Taxonomy_SSOT.md`:
     - Tag 1 (Mandatory): `type/<concept|method|pattern|mental-model|project|guide|algorithm|technique|vocab>`
     - Tag 2 (Optional): `status/<permanent|active|todo|archived>`
   - Example: `tags: [type/concept, status/permanent]`.
4. **Terminology Invariant (Strict No-Translation):**
   - Inline technical terms MUST remain in standard English (`Process`, `Thread`, `Context Switch`, `Virtual Memory Space`, `Lock Contention`, `Reactor Pattern`, `I/O Multiplexing`).
   - Surrounding explanations MUST be in natural, developer-friendly Vietnamese.
   - NEVER translate technical terms into Vietnamese or attach parenthetical Vietnamese translations (e.g., write `Context Switch`, NOT `Context Switch (Chuyển đổi ngữ cảnh)` or `Chuyển đổi ngữ cảnh`).
5. **Concrete Grounding & Anti-Slop (No Throat-Clearing):**
   - Zero corporate fluff, introductory filler, or generic overviews.
   - Must have a concise, 3-bullet `## TL;DR` immediately after the title:
     - `- **Bản chất**: ...` (What it fundamentally is)
     - `- **Mục đích**: ...` (Why it exists / problem it solves)
     - `- **Điểm mấu chốt**: ...` (Key takeaway, constraint, or failure mode)
   - Ground the claim with concrete failure modes, trade-offs, kernel/memory mechanics, or minimal reproducible code snippets.
6. **Contextual Mesh & Annotated Predicates:**
   - Embed inline wikilinks (`[[Note_Title]]`) directly inside explanatory prose.
   - Provide structured structural connections under `## Related Notes` with explicit relationship predicates:
     - `- [[Prerequisite_Note]]: Cung cấp nền tảng nguyên lý...`
     - `- [[Target_Note]]: Hệ quả kiến trúc hoặc ứng dụng trực tiếp...`
     - `- [[Alternative_Note]]: Trade-off đối lập khi so sánh với...`

---

## Note Anatomy & Heading Requirements

All atomic notes must satisfy the vault's automated validators (`validate_notes.mjs`):

```markdown
---
tags: [type/concept, status/permanent]
aliases:
  - Alternative Name 1
  - Alternative Name 2
date: YYYY-MM-DD
description: "Mô tả ngắn gọn 1 câu về bản chất và cơ chế của ghi chú."
---

# Title of the Atomic Note

## TL;DR

- **Bản chất**: Định nghĩa súc tích bản chất cơ chế / nguyên lý.
- **Mục đích**: Giải quyết bài toán gì, tối ưu hóa điểm nào.
- **Điểm mấu chốt**: Điểm giới hạn vật lý, failure mode, hoặc trade-off chính.

---

## Core Concept / Mechanics

[1–3 đoạn phân tích cơ chế sâu, cấu trúc bộ nhớ, luồng thực thi Kernel/CPU, hoặc nguyên lý toán học. Thuật ngữ tiếng Anh inline giữ nguyên.]

---

## Practical Implementation / Code Example / Failure Modes

[Code cấu hình thực tế, CLI flags, phân tích trade-off, hoặc kịch bản sập hệ thống (Failure Mode).]

---

## Related Notes

- [[Foundational_Concept_Note]]: Cung cấp nền tảng nguyên lý cho cơ chế này.
- [[Domain_MOC]]: Bản đồ điều hướng tri thức phân vùng.
```

---

## Automated Validation Quality Gate

Before finishing or committing any atomic note, run the vendored validator script to guarantee $0$ errors:

```bash
# Run validation across the entire vault
bun .claude/skills/writing-atomic-notes/scripts/validate-atomic-notes.mjs

# Or validate a specific file directly
bun .claude/skills/writing-atomic-notes/scripts/validate-atomic-notes.mjs 30_Resources/Concepts/Computer_Science/Your_Note.md
```

The script verifies:

1. `tags`: $\le 2$ tags, properly declared in `99_Meta/Tag_Taxonomy_SSOT.md`.
2. Headings: `## TL;DR` with 3 bullets, `## Related Notes` section.
3. Clean markdown: No emojis, no placeholder markers (`[BẮT BUỘC]`, `TODO`).
4. Cross-domain hygiene: Zero unauthorized cross-domain contamination links.
