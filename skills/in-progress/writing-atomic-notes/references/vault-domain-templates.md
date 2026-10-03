# Vault Core Templates Reference

This reference documents the 4 essential templates powering the Vault, synchronized with `99_Meta/Templates/`, **Lean Taxonomy ($\le 2$ tags)**, and automated validation rules.

---

## 1. Technical Concept Note (`type/concept`)

**Template Path**: `99_Meta/Templates/Technical_Concept_Template.md`  
**Primary Destination**: `30_Resources/Concepts/` (Computer Science, Economics, Psychology, Linguistics) & `30_Resources/Tech/`

Use for all theoretical mechanics, system architecture, data structures, algorithms, and mental models.

```markdown
---
tags: [type/concept, status/permanent]
aliases: []
date: YYYY-MM-DD
description: "Tóm tắt ngắn gọn 1 câu về bản chất và cơ chế cốt lõi của ghi chú."
---

# Title of the Concept Note

## TL;DR

- **Bản chất**: Bản chất trừu tượng của cơ chế, thuật toán hoặc nguyên lý.
- **Mục đích**: Giải quyết vấn đề gì, loại bỏ chi phí nào (latency, context switch, lock contention).
- **Điểm mấu chốt**: Ranh giới vật lý, failure mode, hoặc trade-off chính.

---

## Core Concept / Mechanics

[1–3 đoạn phân tích cơ chế sâu, cấu trúc bộ nhớ RAM/Disk, luồng thực thi Kernel/CPU, hoặc thuật toán. Giữ nguyên thuật ngữ tiếng Anh inline.]

---

## Practical Implementation / Failure Modes

[Code cấu hình thực tế, CLI flags, benchmark số liệu, hoặc kịch bản sập hệ thống (Failure Mode).]

---

## Related Notes

- [[Prerequisite_Concept_Note]]: Cung cấp nền tảng nguyên lý cho cơ chế này.
- [[Downstream_Application_Note]]: Hệ quả hoặc ứng dụng thực tế.
- [[000_Concepts_MOC]]: Danh mục tri thức nền tảng trong vault.
```

---

## 2. Method & Actionable SOP Note (`type/method`)

**Template Path**: `99_Meta/Templates/Method_SOP_Template.md`  
**Primary Destination**: `30_Resources/Methods/` (Engineering, Learning, Finance)

Use for standard operating procedures, execution roadmaps, workflows, and root-cause analysis (RCA).

```markdown
---
tags: [type/method, status/permanent]
aliases: []
date: YYYY-MM-DD
description: "Tóm tắt ngắn gọn 1 câu về quy trình/phương pháp thực thi."
---

# Title of the Method or SOP

## TL;DR

- **Bản chất**: Định nghĩa quy trình thực thi hoặc framework hành động.
- **Mục đích**: Đạt được kết quả gì, chuẩn hóa khâu nào.
- **Điểm mấu chốt**: Tiêu chí hoàn thành (Definition of Done) hoặc nguyên tắc cốt lõi.

---

## Context: When to use?

[Ngữ cảnh cụ thể khi nào nên áp dụng SOP này, điều kiện tiên quyết, và khi nào KHÔNG nên áp dụng.]

---

## Step-by-Step Implementation

1. **Bước 1 (Chuẩn bị / Khám phá)**: Các điều kiện bất biến (Invariants) cần kiểm tra.
2. **Bước 2 (Thực thi)**: Lệnh terminal, script cấu hình, hoặc hành động cụ thể.
3. **Bước 3 (Kiểm chứng)**: Tiêu chuẩn nghiệm thu, log terminal xác nhận thành công.

---

## Related Notes

- [[Associated_Concept_Note]]: Nền tảng lý thuyết đằng sau quy trình này.
- [[000_Methods_MOC]]: Danh mục quy trình thực thi trong vault.
```

---

## 3. Project Hub Note (`type/project`)

**Template Path**: `99_Meta/Templates/Project_Template.md`  
**Primary Destination**: `10_Projects/<Project_Name>/`

Use for active technical initiatives with concrete deliverables and deadlines.

```markdown
---
tags: [type/project, status/active]
aliases: []
date: YYYY-MM-DD
description: "Mục tiêu cốt lõi và kết quả đầu ra của dự án."
---

# Project Name

## TL;DR

- **Mục tiêu**: Deliverables cụ thể cần hoàn thành trước deadline.
- **Phạm vi kỹ thuật**: Tech stack chính và các phân hệ kiến trúc.
- **Tiêu chuẩn hoàn thành (DoD)**: Tiêu chí kiểm định nghiệm thu.

---

## Architecture & Work Breakdown Structure (WBS)

[Sơ đồ kiến trúc phân rã, phân nhiệm các module con (Auth, Database, DevOps, Testing).]

---

## Milestone Tracking

- [ ] Milestone 1: Baseline Architecture & DB Schema
- [ ] Milestone 2: Core Domain Logic & Integration
- [ ] Milestone 3: End-to-End Testing & Performance Quality Gates

---

## Related Notes

- [[000_System_Structure]]: Cấu trúc định danh dự án trong vault.
```

---

## 4. Master Engineering SSOT & Roadmap (`type/guide`)

**Template Path**: `99_Meta/Templates/Master_SSOT_Template.md`  
**Primary Destination**: `30_Resources/Methods/Engineering/`

Use for comprehensive master roadmaps and domain Single Sources of Truth (SSOT).

```markdown
---
tags: [type/guide, status/permanent]
status: permanent
date: YYYY-MM-DD
aliases:
  - Master Engineering SSOT
description: "Single Source of Truth (SSOT) và lộ trình phát triển toàn diện."
---

# Master Engineering SSOT Title

## TL;DR

- **Sứ mệnh**: Định vị vai trò kỹ sư mục tiêu và lộ trình phát triển.
- **Mục đích**: Thiết lập chuẩn mực kỹ thuật và năng lực giải quyết vấn đề.
- **Điểm mấu chốt**: Các mốc thời gian và tiêu chí đánh giá đo lường được.

---

## 4-Layer Cognitive Stack / Core Roadmaps

[Khung năng lực phân tầng hoặc danh mục các kỹ năng cốt lõi.]

---

## Action Plan & Verification

[Checklist lộ trình thực thi theo sprint hoặc quý.]

---

## Related Notes

- [[Master_Roadmaps_Index]]: Bảng điều hướng trung tâm các lộ trình.
```
