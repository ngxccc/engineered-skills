# System Design Doc Specification

Location: `docs/design/<kebab-case-description>.md`

## Required Structure

Must contain YAML frontmatter (`docType: feature-workflow | infrastructure-workflow`), Level 1 Title (`# Title`), and section headings matching:

- `## Overview & Context` (Executive summary, Goals, Non-Goals)
- `## Architecture` (C4 Container Diagram / Mermaid block diagram)
- `## Operational Flow` (Autonumbered Mermaid sequence diagram, State transitions)
- `## Work Breakdown Structure` (4-Level WBS Table: L1 Module, L2 Component, L3 Logic, L4 Execution)
- `## Data Contracts` (Database DDL / ERD, API Payloads)
- `## Security & Reliability` (RBAC, Failovers, Circuit breakers)

## 4-Level WBS Table Template

| WBS Code  | Component / Feature | Level         | Description / Task                | Output / Artifact                                     |
| :-------- | :------------------ | :------------ | :-------------------------------- | :---------------------------------------------------- |
| `1.0`     | Booking Module      | L1: Module    | Core booking reservation engine   | `src/modules/booking`                                 |
| `1.1`     | Reservation Service | L2: Component | Handle seat locks and timeouts    | `src/modules/booking/services/reservation.service.ts` |
| `1.1.1`   | Create Reservation  | L3: Task      | Validate payload and reserve seat | `createReservation()`                                 |
| `1.1.1.1` | DB Query / Lock     | L4: Execution | Select for update seat row        | `bun test tests/booking/create.test.ts`               |

## Frontmatter Template

```yaml
---
title: "Booking System Design & Workflow"
docType: "feature-workflow"
status: "Draft"
date: 2026-08-19
author: "Team / Agent"
version: "1.0.0"
---
```
