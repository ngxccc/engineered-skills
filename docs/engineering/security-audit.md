## What it does

`security-audit` is a defensive, source-first security review and vulnerability audit skill for codebases, APIs, services, CLI tools, libraries, and daemons. It requires every candidate finding to name a lower-trust principal, accepted input or action, intended control, crossed trust boundary, affected resource, and concrete observed or owner-observable result — refusing to elevate missing best practices or guessed deployment behavior into confirmed vulnerabilities.

It operates in two distinct modes:

- **Guidance mode (default)**: answers security questions, triages findings, or runs focused reviews using only the relevant reference modules (`ATTACK-CLASSES.md`, `WEB-PROTOCOL-AND-AUTH.md`, `AI-AND-LLM.md`, `CLOUD-AND-DEPLOYMENT.md`, `SUPPLY-CHAIN-AND-RELEASE.md`, etc.) without creating output directories or running all six phases.
- **Full audit mode**: runs a six-phase workflow (Reconnaissance, Coverage-ledger hunting with critic waves, Independent candidate validation, Reporting) with strict write isolation (`~/security-audit-skill/<repo-name>/run-<N>`), run profiles (`quick`, `standard`, `deep`), cost budgets, and schema-validated artifacts (`coverage-ledger.json`, `findings.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`).

## When to reach for it

Invoke `security-audit` (or let the model reach for it) whenever you need a security review, threat-boundary check, or full codebase audit:

| Your situation                                                          | Reach for                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Full codebase audit, pen-test review, or formal audit report            | `security-audit` (explicitly request full audit mode)        |
| Focused security question or reviewing a specific auth/isolation module | `security-audit` (guidance mode)                             |
| Routine PR / diff review against repo standards and spec                | [code-review](https://aihero.dev/skills-code-review)         |
| Hard bug or regression with a reproducible failing command              | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |

## Common questions

**Does loading `security-audit` immediately start a full multi-agent audit?**

No. Guidance mode is the default. The full six-phase workflow and artifact creation run only when you explicitly ask for a codebase audit, pen-test, comprehensive/end-to-end security review, or report artifacts. If a request is ambiguous, it asks one clarifying question first.

**Does it probe live endpoints or deployed infrastructure?**

No. Execution is strictly sandboxed source and local-only: dummy principals, fixtures, and secrets only. If a decisive security fact lives outside the repository (proxy headers, cloud IAM, broker ACLs), it records the item as `needs_validation` with the exact missing fact and a safe owner-verification plan rather than guessing.

**Where are full-audit artifacts written?**

Outside the target repository by default (`~/security-audit-skill/<repo-name>/run-<N>`), with parent-owned `artifacts/` separated from agent-writable `scratch/` dirs. It only writes inside the target repo if you explicitly choose a gitignored directory.

## It's working if

- Guidance questions get focused, trust-boundary-grounded answers without creating `run-<N>` directories.
- Full audits produce schema-validated `coverage-ledger.json` and `findings.json` (checked by `validate-coverage-ledger.cjs` and `validate-findings.cjs`) and separate `confirmed` findings from `needs_validation` blockers.
- Every confirmed finding cites exact source paths, symbols, trust boundaries, and minimal reproduction steps.
