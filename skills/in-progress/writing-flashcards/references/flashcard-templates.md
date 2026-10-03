# Flashcard Anatomies and Templates

Two standardized formats are supported: **Atomic Basic** (Q&A prompt with clean separation) and **Cloze Deletion** (single-slot keyword retrieval).

---

## 1. Atomic Basic Template (SSOT Standard)

Use this format for 90% of technical and conceptual flashcards.

```markdown
---
noteId: { { timestamp_or_uuid } }
---

{{Atomic Question: One single target mechanism, rule, or constraint}}

---

- **{{Core Fact / Concept}}**: {{Direct answer in 1-2 lines maximum. No fluff.}}
- **{{Key Nuance / Tradeoff}}**: {{Secondary essential technical parameter, if required.}}

---

Extra: {{Optional context, failure modes, real-world gotchas, code snippets, or CLI examples. NEVER required to be recalled to grade the card Good/Pass.}}
```

### Concrete Example (Engineered Good):

```markdown
---
noteId: 1790159213882
---

Điểm khác biệt an toàn cốt lõi giữa `git branch -d` và `git branch -D` là gì?

---

- **`-d` vs `-D`**: `-d` từ chối xóa nếu nhánh chưa được merge vào upstream; `-D` ép xóa vô điều kiện mà không kiểm tra merge status.

---

Extra: Xóa branch chỉ xóa con trỏ tham chiếu 41 bytes trong `.git/refs/heads/`. Commit objects vẫn nằm nguyên trong `.git/objects/` ít nhất 30-90 ngày trước khi `git gc` dọn dẹp.
```

---

## 2. Decision / Binary Contrast Template

Use when contrasting two easily confused concepts, algorithms, or configurations.

```markdown
---
noteId: { { timestamp_or_uuid } }
---

Khi nào bắt buộc phải dùng {{Technique A}} thay vì {{Technique B}}?

---

- **{{Decision Rule}}**: Dùng {{Technique A}} khi {{Single load-bearing condition}}; {{Technique B}} sẽ thất bại do {{Direct failure mode}}.

---

Extra: {{Performance implication, architectural rationale, or edge cases.}}
```

### Concrete Example:

```markdown
---
noteId: 1790774286880
---

Trong Redis, khi xóa một key chứa Hash có 5 triệu phần tử, tại sao bắt buộc dùng `UNLINK` thay vì `DEL`?

---

- **`UNLINK` vs `DEL`**: `DEL` giải phóng bộ nhớ đồng bộ trên Main Thread gây nghẽn Event Loop $O(N)$; `UNLINK` tách key khỏi keyspace $O(1)$ và giao việc thu hồi RAM cho Background Bio-Thread.

---

Extra: Nếu key chỉ chứa scalar string nhỏ (< 64 bytes), chi phí dispatch sang bio-thread của `UNLINK` không đem lại lợi ích rõ rệt, nhưng với collection lớn `UNLINK` là bắt buộc để tránh vi phạm P99 latency SLA.
```

---

## 3. High-Order Cloze Deletion Template

Use sparingly for precise syntax, hardware registers, or command-line flags where surrounding context is strictly minimal.

```markdown
Trong Go, hàm `atomic.AddInt64` tránh được Lock Contention vì nó ủy thác việc đồng bộ hóa từ Go Runtime xuống chỉ lệnh phần cứng CPU {{c1::`LOCK XADD`}} thay vì dùng Mutex.
```

---

## 4. English SLA Templates (Second Language Acquisition)

Three standardized templates designed specifically for rapid lexical and grammatical retrieval without cognitive overload.

### Template 4A: Lexical Collocation Template (Michael Lewis Lexical Approach)

Use for acquiring natural technical word pairings and institutionalized phrases.

```markdown
---
noteId: { { timestamp_or_uuid } }
---

What is the natural technical collocation for {{target action / technical intent}}?

---

- **Collocation**: `{{verb / adjective}} + {{noun / chunk}}` ({{Concise Vietnamese meaning}}).
- **Core Pattern**: `{{Key pattern or preposition rule}}`.

---

Extra:

- Pronunciation: /{{IPA}}/
- Word Family: {{verb}} (v), {{noun}} (n), {{adjective}} (adj), {{adverb}} (adv).
- Example: {{One authentic technical sentence demonstrating usage}}.
```

### Template 4B: Morphological Cloze Template (Paul Nation Word Parts)

Use for mastering word formation, parts of speech, and affixes in technical context.

```markdown
---
noteId: { { timestamp_or_uuid } }
---

Complete the sentence with the correct morphological form of **{{root_word}}**:

_"{{Sentence with blank ________ testing noun/verb/adj/adv}}"_

---

- **Answer**: `{{correct_inflected_form}}` ({{part_of_speech}} - {{Vietnamese meaning}}).
- **Key cue**: {{Single-line syntactic rationale explaining why this form fits}}.

---

Extra:

- Word Family: {{verb}} (v), {{noun}} (n), {{adjective}} (adj), {{adverb}} (adv).
- Collocations: `{{collocation 1}}`, `{{collocation 2}}`.
```

### Template 4C: Processing Instruction Grammar Template (VanPatten & James)

Use for debugging recurring SLA syntax bugs tracked in `data/errors/`.

```markdown
---
noteId: { { timestamp_or_uuid } }
---

Fix the structural error in this technical statement:

❌ _"{{Erroneous sentence representing common L1 interference}}"_

---

- **Correct**: _"{{Accurate sentence with **bold** corrected part}}"_
- **Mechanism**: {{Concise mechanical rule explaining the syntax state machine}}.

---

Extra:

- Taxonomy: {{Linguistic Category}} - {{Surface Modification Type}} (Carl James).
- Rule: {{Structural formula or contrastive comparison}}.
```

---

## Anti-Pattern Catalog

| Anti-Pattern               | Bad Example                                                       | Why it Fails                                                    | Correct Refactor                                                                 |
| :------------------------- | :---------------------------------------------------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Mini-Article Back**      | 5 bullet points + 2 code blocks explaining the whole architecture | Causes review fatigue; user cannot score pass/fail binary in 3s | Move details to `Extra:`; reduce answer to 1 core fact                           |
| **Double Question**        | "A khác B thế nào và làm sao để khắc phục C?"                     | Asymmetric recall: user remembers A vs B but forgets C          | Split into 2 atomic cards                                                        |
| **Trivia / Word-Matching** | "Redis ra đời năm nào bởi ai?"                                    | Low utility, no reasoning activation                            | Focus on mechanics: "Tại sao Redis đơn luồng vẫn đạt 100k OPS?"                  |
| **Vague Prompt**           | "Nêu suy nghĩ về Docker Network?"                                 | Fuzzy retrieval target; impossible to judge completeness        | "Trong Docker, network driver nào chia sẻ trực tiếp network namespace của host?" |
