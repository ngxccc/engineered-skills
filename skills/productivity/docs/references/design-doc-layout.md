# System Design Doc Specification

Location: `docs/design/<kebab-case-description>.md`

## Required Structure

Must contain YAML frontmatter (`docType: feature-workflow | infrastructure-workflow`), Level 1 Title (`# Title`), and section headings matching:

- `## Overview & Context` (Executive summary, Goals, Non-Goals)
- `## Architecture` (C4 Container Diagram / Mermaid block diagram)
- `## Operational Flow` (Autonumbered Mermaid sequence diagram, State transitions)
- `## Security & Reliability` (RBAC, Fail-open degradation, Rate limiting, Circuit breakers)
- `## Domain Invariant Taxonomy` (Formal `INV-N` matrix and verification test mapping)

## Author Attribution Standard

The frontmatter `author` field MUST default to the user's local GitHub username (resolved via `gh api user --jq .login` or `git config user.name`). NEVER use generic team titles (e.g. `"Team / Core Architecture"`) or AI identities (`"Claude"`, `"Agent"`).

## Symbol Referencing Standard

Per `docs/standards/domain-docs.md`:

- **Do NOT copy-paste raw TypeScript interfaces or raw SQL DDL schemas** into Markdown files.
- Reference code symbols directly by file path and identifier (e.g. `ShowSeatsResponseDto` in `src/modules/shows/dto/show-seats-response.dto.ts`).
- OpenAPI/Swagger is the authoritative Single Source of Truth for API schemas.

## Frontmatter Template

```yaml
---
title: "Booking System Design & Workflow"
docType: "feature-workflow"
status: "approved"
date: YYYY-MM-DD
author: "<github-username>"
version: "1.0.0"
---
```
