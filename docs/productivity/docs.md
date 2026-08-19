## What it does

`docs` manages the complete lifecycle of technical and architectural documentation across the codebase. It analyzes codebases, generates and updates system specifications (RFCs, System Design Specs, Operational Workflows), and maintains Architectural Decision Records (ADRs) with support for both **Simple (Lightweight)** and **Formal (Audit-Ready)** ADR layouts.

It also includes automated validation scripts to audit Markdown formatting and structure across ADRs, RFCs, System Design Docs, and SSOT Workflow documents in parallel.

## When to reach for it

Invoke `/docs` when creating, updating, or auditing system documentation, or when you need structured technical proposals or automated doc validation:

| The situation                                                   | The move                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| Code changes occurred and documentation needs updating          | `/docs update`                                               |
| You need a fast high-level codebase summary                     | `/docs summarize`                                            |
| You need to record or validate architectural decisions          | `/docs adr`                                                  |
| You are proposing a major technical RFC proposal                | `/docs rfc`                                                  |
| You are designing a feature/infrastructure system specification | `/docs design`                                               |
| You are defining an operational sequence and WBS workflow       | `/docs workflow`                                             |
| You want to run automated documentation validation scripts      | `bun run skills/productivity/docs/scripts/validate-docs.mjs` |

## Common questions

**Should I use Simple ADR or Formal ADR layout?**  
Use **Simple ADR** (1 title + 1-3 sentences) for quick inline recording during active coding or domain modeling when low ceremony is preferred. Use **Formal ADR** (ISO/Nygard structure with Status, Context, Decision, Consequences, and `### Explicit Tradeoffs`) for cross-team architectural changes, enterprise audit trails, or when automated validation is enforced via `validate-adrs.mjs`.

**Why is `docs` separated from `domain-modeling`?**  
`domain-modeling` focuses on Domain-Driven Design (DDD) business vocabulary, ubiquitous language (`CONTEXT.md`), and bounded context maps (`CONTEXT-MAP.md`). `docs` focuses on system-wide technical documentation management (RFCs, Design Specs, Workflows) and automated Markdown validation suites.

**Where do generated ADRs, RFCs, and Design Docs live?**  
ADRs live in `docs/adr/` (`0001-slug.md`), RFCs live in `docs/rfc/` (`0001-slug.md`), and Design/Workflow specs live in `docs/design/` (`slug-workflow.md`).

## It's working if

- Running `bun run skills/productivity/docs/scripts/validate-docs.mjs` executes validation suites and reports PASS for valid ADRs, RFCs, and Design Docs.
- ADRs created match the selected Simple or Formal layout standard.
- System Design Docs include autonumbered Mermaid sequence diagrams and structured 4-Level WBS tables.
