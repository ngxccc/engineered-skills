# ADR Specifications

Location: `docs/adr/NNNN-slug.md` (4-digit prefix).

## AI Selection Matrix

| Criterion      | Simple ADR (Micro)                                           | Formal ADR (Audit-Ready)                                                                           |
| -------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Scope**      | Single-team, inline domain decisions, low ceremony.          | Cross-team, hard-to-reverse, compliance/audit needs.                                               |
| **Shape**      | `# Title` + 1–3 sentence paragraph (Context, Decision, Why). | Full Nygard structure (`Status`, `Context`, `Decision`, `Consequences`, `### Explicit Tradeoffs`). |
| **Validation** | Flexible.                                                    | Strict via `validate-adrs.mjs`.                                                                    |

## 1. Simple ADR (Micro)

```md
# 1. Manual SQL over ORM for Query Optimization

We decided to use raw SQL with SQLx instead of an ORM for the write model. The context is that complex analytical queries were exceeding our 50ms P99 latency target under ORM-generated queries, and SQLx provides compile-time query safety without query generator overhead.
```

## 2. Formal ADR (Audit-Ready)

Must contain Level 1 Title (`# <Num>. <Title>`), Date (`Date: YYYY-MM-DD`), and exact headings: `## Status`, `## Context`, `## Decision`, `## Consequences`, `### Explicit Tradeoffs`.

```md
# 1. Event-Sourced Order Ledger

Date: 2026-08-19

## Status

Accepted

## Context

Order status updates require 100% audit log for financial reconciliation. Row mutation loses historical audit trace.

## Decision

Implement event-sourced write model via PostgreSQL append-only event tables with projected read views.

## Consequences

- Complete auditability of state changes.

### Explicit Tradeoffs

- **Write Overhead vs Audit Traceability**: Accept append latency & storage growth for immutable audit logs.
- **Eventual Consistency vs Read Simplicity**: Read models require async projection updates.
```
