# Atomic Note Reference & Templates

A comprehensive guide and reference template for creating high-leverage atomic notes adhering strictly to the Vault's **SSOT**, **Lean Taxonomy ($\le 2$ tags)**, and **Quality Gate**.

---

## 1. Standard Concept Note Skeleton (`type/concept`)

Use this skeleton for definitions, theories, algorithms, or mental models (`30_Resources/Concepts/`):

```markdown
---
tags: [type/concept, status/permanent]
aliases:
  - Concept Alias Name
  - English Full Name
date: YYYY-MM-DD
description: "Mô tả ngắn gọn 1 câu về bản chất và cơ chế cốt lõi của ghi chú."
---

# Concept Title in English or Standard Form

## TL;DR

- **Bản chất**: Định nghĩa súc tích bản chất cơ chế / nguyên lý.
- **Mục đích**: Giải quyết bài toán gì, tối ưu hóa điểm nào.
- **Điểm mấu chốt**: Điểm giới hạn vật lý, failure mode, hoặc trade-off chính.

---

## Core Concept

[Phân tích cơ chế sâu, cấu trúc bộ nhớ, luồng thực thi Kernel/CPU, hoặc nguyên lý hoạt động. Thuật ngữ tiếng Anh giữ nguyên inline.]

---

## Practical Implementation / Failure Modes

[Cấu hình thực tế, CLI flags, benchmark latency, hoặc kịch bản sập hệ thống (Failure Mode).]

---

## Related Notes

- [[Prerequisite_Concept_Note]]: Cung cấp nền tảng nguyên lý cho cơ chế này.
- [[Downstream_Application_Note]]: Hệ quả hoặc ứng dụng thực tế.
- [[000_Concepts_MOC]]: Danh mục tri thức nền tảng trong vault.
```

---

## 2. Standard Method Note Skeleton (`type/method`)

Use this skeleton for actionable SOPs, checklists, execution roadmaps, or workflows (`30_Resources/Methods/`):

```markdown
---
tags: [type/method, status/permanent]
aliases:
  - Method Workflow Name
  - Execution SOP Name
date: YYYY-MM-DD
description: "Mô tả ngắn gọn 1 câu về quy trình thực thi, mục tiêu giải quyết và phạm vi áp dụng."
---

# Method or SOP Title

## TL;DR

- **Bản chất**: Định nghĩa quy trình thực thi hoặc framework hành động.
- **Mục đích**: Đạt được kết quả gì, loại bỏ rủi ro nào.
- **Điểm mấu chốt**: Tiêu chí hoàn thành (Definition of Done) hoặc nguyên tắc cốt lõi.

---

## Context: When to use?

[Ngữ cảnh cụ thể khi nào nên áp dụng SOP này, điều kiện tiên quyết, và khi nào KHÔNG nên áp dụng.]

---

## Step-by-Step Implementation

1. **Bước 1 (Preparation)**: Các bước chuẩn bị và invariant cần kiểm tra.
2. **Bước 2 (Execution)**: Lệnh thực thi, code mẫu, hoặc hành động cụ thể.
3. **Bước 3 (Verification)**: Lệnh kiểm thử, đo lường kết quả thực tế.

---

## Related Notes

- [[Associated_Concept_Note]]: Nền tảng lý thuyết đằng sau quy trình này.
- [[000_Methods_MOC]]: Danh mục quy trình thực thi trong vault.
```

---

## 3. Real-World Vault Reference Example

```markdown
---
tags: [type/concept, status/permanent]
aliases:
  - Redis Event Loop Architecture
  - Redis Single Threaded Event Loop
date: 2026-10-02
description: "Bản chất kiến trúc Single-threaded Event Loop của Redis: phân tách Network Layer qua I/O Multiplexing epoll/kqueue và Execution Layer tuần tự trên RAM."
---

# Redis Single Threaded Event Loop Architecture

## TL;DR

- **Bản chất**: Redis vận hành dựa trên Reactor Pattern: tách bạch tầng Network I/O qua I/O Multiplexing (epoll/kqueue) và tầng Execution xử lý tuần tự từng Command trên đúng 1 luồng chính duy nhất.
- **Mục đích**: Loại bỏ chi phí Thread Context Switch, triệt tiêu Lock Contention, và tối đa hóa CPU Cache Locality khi thao tác trực tiếp trên RAM.
- **Điểm mấu chốt**: Vì Command Engine là Single-threaded tuần tự, bất kỳ lệnh nào có Time Complexity O(N) sẽ gây ra Head-of-Line Blocking làm tê liệt toàn bộ Event Loop.

---

## Core Concept

[Phân tích kiến trúc chi tiết...]

---

## Practical Implementation

[Code và cấu hình thực tế...]

---

## Related Notes

- [[Latency_Percentiles_and_Throughput_Fundamentals]]: Nguyên lý độ trễ p99 khi bị tắc nghẽn Single-thread.
- [[000_Tech_MOC]]: Bản đồ điều hướng kỹ thuật công nghệ.
```

---

## 4. Pre-Commit Quality Checklist

Trước khi lưu file hoặc kết thúc lượt làm việc:

- [ ] **Tên file**: Định dạng `Pascal_Snake_Case.md`.
- [ ] **Lean Tags**: Tối đa 2 tags (`type/*` bắt buộc, `status/*` tùy chọn).
- [ ] **Frontmatter**: Đầy đủ `tags`, `aliases`, `date`, `description`.
- [ ] **Heading 1**: Khớp với tên file hoặc luận điểm chính.
- [ ] **Mục TL;DR**: Đúng 3 bullets (`Bản chất`, `Mục đích`, `Điểm mấu chốt`).
- [ ] **Thuật ngữ**: Giữ nguyên English terms inline, giải thích bằng tiếng Việt tự nhiên.
- [ ] **Không Emoji**: 100% sạch icon/emoji.
- [ ] **Related Notes**: Có mục `## Related Notes` với liên kết ngữ cảnh có chú thích.
- [ ] **Quality Gate**: Chạy lệnh và đạt $0$ lỗi:
  ```bash
  bun .claude/skills/writing-atomic-notes/scripts/validate-atomic-notes.mjs <path-to-file>
  ```
