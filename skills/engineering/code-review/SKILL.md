---
trigger_keywords: code-review, spec-compliance, code-smells, git-diff-review
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (documented repo conventions + layered risk checklist + code smells) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents with diff noise triage and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

# Code Review (`code-review`)

Two-axis, risk-layered review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards, [layered risk checklist](references/layered-risk-checklist.md), and baseline code smells?
- **Spec** — does the code faithfully implement the originating issue / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, followed by a targeted spot-check on any generated contracts. Start every sub-agent with a fresh context window.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-skills`.

## Process

### 1. Pin the fixed point & triage diff noise

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it before spawning sub-agents.

Confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. Collect the commit list and `--stat` overview once:

```bash
git log <fixed-point>..HEAD --oneline
git diff --stat <fixed-point>...HEAD
```

Separate generated noise from hand-written code so large PRs do not flood sub-agent context:

- **Generated / Snapshot artifacts** (`**/openapi.json`, `**/api-schema.d.ts`, `**/snapshot.json`, `bun.lock`, `package-lock.json`, `pnpm-lock.yaml`, `*.generated.*`): exclude from the primary diff passed to sub-agents, and reserve for Step 5 contract spot-checking.
- **Primary diff command** for sub-agents:

```bash
git diff <fixed-point>...HEAD -- . \
  ':!**/openapi.json' \
  ':!**/api-schema.d.ts' \
  ':!**/snapshot.json' \
  ':!bun.lock' \
  ':!package-lock.json' \
  ':!pnpm-lock.yaml'
```

**Completion criterion:** Fixed point verified, commit list + `--stat` captured, and generated artifacts excluded from the primary review diff.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, `Resolves: #45`, GitLab `!67`) — fetch via the workflow in the tracker doc.
2. A path the user passed as an argument.
3. A spec, ADR, or RFC file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

**Completion criterion:** Spec path or fetched issue body resolved, or explicitly confirmed absent.

### 3. Identify the standards sources & baseline

Search the repo for every file that documents how code should be written, including `AGENTS.md`, `CLAUDE.md`, `docs/standards/`, and any `CODING_STANDARDS.md` or `CONTRIBUTING.md`. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it must be on the list.

On top of whatever the repo documents, the Standards axis carries [references/layered-risk-checklist.md](references/layered-risk-checklist.md) and the **smell baseline** below (Fowler, _Refactoring_, ch.3). Three rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and skip anything tooling (`oxlint`, `eslint`, `tsc`, formatters) already enforces.
- **Verify before reporting.** Inspect full surrounding context for every candidate defect to eliminate false positives.

**Fowler smell baseline**:

- **Mysterious Name** — unclear name → rename; if none comes, design is murky.
- **Duplicated Code** — same logic shape recurs → extract shared helper.
- **Feature Envy** — method reaches into another object's data → move onto that data.
- **Data Clumps** — same fields travel together → bundle into one type.
- **Primitive Obsession** — raw primitive/string for domain concept → give it a type.
- **Repeated Switches** — same `switch`/`if`-cascade recurs → polymorphism or shared map.
- **Shotgun Surgery** — one logical change scatters edits → gather into one module.
- **Divergent Change** — one module edits for unrelated reasons → split by responsibility.
- **Speculative Generality** — unused abstraction/hooks → delete/inline.
- **Message Chains** — long `a.b().c().d()` chains → encapsulate on first object.
- **Middle Man** — thin forwarding wrapper → call target direct.
- **Refused Bequest** — subclass ignores inherited interface → use composition.

**Completion criterion:** Repo standards sources, layered risk checklist, and smell baseline assembled.

### 4. Spawn both sub-agents in parallel (Bottom-Up, Find -> Verify -> Report)

Issue both sub-agent calls together, in the foreground, and aggregate the reports they return.

Instruct both sub-agents to inspect files **bottom-up by dependency layer** (Backend: 1. Data/Migrations/Projections → 2. Boundaries/DTOs/Guards/Filters → 3. Controllers → 4. Services/Concurrency/Transactions → 5. Tests; Frontend: UI-1 Tokens/Assets → UI-2 Primitives/Shells → UI-3 Rendering/Trust Boundaries → UI-4 Error Recovery/Navigation/A11y → UI-5 UI Tests):

**Standards sub-agent prompt** — include:

- The excluded primary diff command, `--stat`, and commit list.
- The list of standards-source files from step 3, [references/layered-risk-checklist.md](references/layered-risk-checklist.md), and the smell baseline.
- The brief: _"Do not invoke `/code-review` or spawn additional agents — perform this review directly. Inspect modified files bottom-up (Backend Layer 1 to Layer 5; Frontend UI-1 to UI-5). Verify every candidate finding against full surrounding file context before reporting. Report — grouped by layer — (a) hard violations (documented-standard breaches, security/concurrency/contract defects: cite standard/checklist item and exact file/symbol/lines) and (b) judgement calls (baseline smells: name it and quote the hunk). Check Blast Radius on unmodified callers of changed interfaces. Skip anything tooling enforces. Keep concise bullets; target under 400 words for <=15 hand-written files, or compact bullets per finding for larger diffs."_

**Spec sub-agent prompt** — include:

- The excluded primary diff command, `--stat`, and commit list.
- The path or fetched contents of the spec.
- The brief: _"Do not invoke `/code-review` or spawn additional agents — perform this review directly. Inspect bottom-up against spec requirements, invariants, authorization matrix, state transitions, and edge cases. Verify each candidate finding in full file context before reporting: (a) missing or partial requirements; (b) scope creep outside the spec; (c) requirements whose implementation or error/response contract mismatches the spec. Quote the spec line for each finding."_

If the spec is missing, skip the Spec sub-agent and note this in the final report.

**Completion criterion:** Parallel axis reports received (or Spec skipped with reason).

### 5. Generated Contract Spot-Check, Blast Radius & Aggregate

If generated OpenAPI/type files (`openapi.json`, `api-schema.d.ts`) changed, inspect the generated TypeScript types using the Generated Contract Spot-Check in [references/layered-risk-checklist.md](references/layered-risk-checklist.md) rather than reading raw OpenAPI JSON.

If the diff modifies shared interfaces, schemas, DTOs, exported contracts, or cross-layer invariants, invoke `/blast-radius` to identify the key safety invariant and prove it by running code rather than relying on grep alone.

Present the reports separately under `## Standards`, `## Spec`, and `## Generated Contract & Blast Radius` (when applicable). Do **not** merge or rerank findings across axes.

End with a per-axis count and the worst issue _within each axis_ (if any).
