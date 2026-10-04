---
name: docs
description: "Manage technical documentation, ADRs, RFCs, System Design Specs, Benchmark Reports, and Operational Workflows through structured generation and automated validation."
layer: helper
---

# Documentation, Specs & Validation (`docs`)

Manage technical documentation, Architectural Decision Records (ADRs), RFCs, System Design Specs, and Operational Workflows through structured generation and automated validation.

## Subcommands & Routing

Parse `$ARGUMENTS` first word:

| Command           | Reference                               | Purpose                                                                      |
| ----------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| `/docs update`    | `references/update-workflow.md`         | Scan codebase changes & update documentation.                                |
| `/docs summarize` | `references/summarize-workflow.md`      | Produce concise high-level codebase summary.                                 |
| `/docs adr`       | `references/adr-layout.md`              | Create or validate ADRs (Simple vs Formal).                                  |
| `/docs rfc`       | `references/rfc-layout.md`              | Create or validate RFC proposals under `docs/rfc/`.                          |
| `/docs design`    | `references/design-doc-layout.md`       | Create or validate System Design Specs under `docs/design/`.                 |
| `/docs benchmark` | `references/benchmark-report-layout.md` | Create or validate Benchmark & Performance Reports under `docs/benchmarks/`. |

## Automated Validation Scripts

Validation suites under `skills/productivity/docs/scripts/`:

- **All suites in parallel:** `bun run skills/productivity/docs/scripts/validate-docs.mjs`
- **ADRs:** `bun run skills/productivity/docs/scripts/validate-adrs.mjs`
- **RFCs:** `bun run skills/productivity/docs/scripts/validate-rfcs.mjs`
- **Design Docs:** `bun run skills/productivity/docs/scripts/validate-design-docs.mjs`
- **Benchmark Reports:** `bun run skills/productivity/docs/scripts/validate-benchmarks.mjs`

---

## References

- [references/adr-layout.md](references/adr-layout.md) - Simple vs Formal ADR layouts.
- [references/rfc-layout.md](references/rfc-layout.md) - RFC proposal layout.
- [references/design-doc-layout.md](references/design-doc-layout.md) - System Design layout.
- [references/workflow-documentation-standard.md](references/workflow-documentation-standard.md) - SSOT Workflow Standard (Mermaid sequence diagrams).
- [references/benchmark-report-layout.md](references/benchmark-report-layout.md) - Benchmark & Performance Report layout (SUT, KPIs, RED/USE, Comparison Matrix).
