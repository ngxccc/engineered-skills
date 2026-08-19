# ADR Specifications

Location: `docs/adr/NNNN-slug.md` (4-digit prefix).

## Selection Matrix

| Criterion      | Simple ADR (Micro)                                           | Formal ADR (Audit-Ready)                                                                           |
| -------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| **Scope**      | Single-team, inline domain decisions, low ceremony.          | Cross-team, hard-to-reverse, compliance/audit needs.                                               |
| **Shape**      | `# Title` + 1–3 sentence paragraph (Context, Decision, Why). | Full Nygard structure (`Status`, `Context`, `Decision`, `Consequences`, `### Explicit Tradeoffs`). |
| **Validation** | Flexible.                                                    | Strict via `validate-adrs.mjs`.                                                                    |

## 1. Simple ADR (Micro)

```md
# 1. Manual SQL over ORM for Query Analytics

Use raw SQL with SQLx for write model analytical queries exceeding 50ms P99 under ORM, gaining compile-time safety without query generator latency.
```

## 2. Formal ADR (Audit-Ready)

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

- **Write Overhead vs Audit Traceability**: Append latency and storage growth for immutable audit logs.
```

---

System RFCs, Design Specs & validation: [`docs`](../../productivity/docs/SKILL.md) (`bun run skills/productivity/docs/scripts/validate-adrs.mjs`).
