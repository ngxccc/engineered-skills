# RFC Layout Specification

Location: `docs/rfc/NNNN-slug.md` (4-digit prefix, kebab-case).

## Required Structure

Must contain Level 1 Title (`# <Num>. <Title>`), Date (`Date: YYYY-MM-DD`), Author (`Author: <github-username>`), Status (`Status: Draft | Under Review | Approved | Rejected | Superseded by ADR-XXXX`), and exact section headings:

- **Author Attribution**: MUST default to the user's local GitHub username (via `gh api user --jq .login` or `git config user.name`). Never generic (`Team`) or AI names (`Agent`, `Claude`).

- `## Summary`
- `## Context & Motivation`
- `## Detailed Proposal`
- `## Drawbacks & Alternatives`
- `## Unresolved Questions`

## Canonical RFC Template

```md
# 1. Payment Gateway Refactor

Date: 2026-08-19
Author: <github-username>
Status: Draft

## Summary

Refactor payment gateway integration to support multi-provider fallback.

## Context & Motivation

Single provider downtime causes checkout failures and lost revenue.

## Detailed Proposal

Implement payment router pattern with automatic circuit-breaker failover.

## Drawbacks & Alternatives

- **Drawback**: Increases settlement reconciliation complexity.
- **Alternative 1**: Retain single provider with manual failover.

## Unresolved Questions

- [ ] Webhook signature verification strategy across providers.
```
