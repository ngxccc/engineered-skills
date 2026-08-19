---
name: docs
description: "Trigger keywords: docs, README, document codebase, ADR, architectural decision, decision record, design doc, architecture record, RFC, request for comments, architectural proposal, system design. Skill for analyzing codebase, managing project documentation, creating/validating Architectural Decision Records (ADRs), Request for Comments (RFCs), and System Design Docs."
trigger_keywords: docs
layer: helper
---

# Documentation, Specs & Validation (`docs`)

Manage technical documentation, Architectural Decision Records (ADRs), RFCs, System Design Specs, and Operational Workflows through structured generation and automated validation.

## Subcommands & Routing

Parse `$ARGUMENTS` first word:

| Command           | Reference                                       | Purpose                                                      |
| ----------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| `/docs update`    | `references/update-workflow.md`                 | Scan codebase changes & update documentation.                |
| `/docs summarize` | `references/summarize-workflow.md`              | Produce concise high-level codebase summary.                 |
| `/docs adr`       | `references/adr-layout.md`                      | Create or validate ADRs (Simple vs Formal).                  |
| `/docs rfc`       | `references/rfc-layout.md`                      | Create or validate RFC proposals under `docs/rfc/`.          |
| `/docs design`    | `references/design-doc-layout.md`               | Create or validate System Design Specs under `docs/design/`. |
| `/docs workflow`  | `references/workflow-documentation-standard.md` | Create or validate Operational Workflows (WBS & Mermaid).    |

## Automated Validation Scripts

Validation suites under `skills/productivity/docs/scripts/`:

- **All suites in parallel:** `bun run skills/productivity/docs/scripts/validate-docs.mjs`
- **ADRs:** `bun run skills/productivity/docs/scripts/validate-adrs.mjs`
- **RFCs:** `bun run skills/productivity/docs/scripts/validate-rfcs.mjs`
- **Design Docs:** `bun run skills/productivity/docs/scripts/validate-design-docs.mjs`
- **Workflows:** `bun run skills/productivity/docs/scripts/validate-workflow-docs.mjs`

---

## References

- [references/adr-layout.md](references/adr-layout.md) - Simple vs Formal ADR layouts.
- [references/rfc-layout.md](references/rfc-layout.md) - RFC proposal layout.
- [references/design-doc-layout.md](references/design-doc-layout.md) - System Design layout.
- [references/workflow-documentation-standard.md](references/workflow-documentation-standard.md) - SSOT Workflow Standard (WBS & Sequence diagrams).
