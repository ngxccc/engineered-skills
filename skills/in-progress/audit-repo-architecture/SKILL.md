---
trigger_keywords: repo-architecture-survey, monorepo-polyrepo-audit, boundary-leakage, architectural-drift, conway-law-sensing, multi-tool-audit
name: audit-repo-architecture
description: Survey a repository architecture across multiple cross-checking tools (AST, package manifests, temporal git dynamics, shared gravity), evaluate Conway's Law context, and triangulate architectural decisions.
disable-model-invocation: true
---

# Audit Repo Architecture

Survey a codebase using a **multi-tool triangulation protocol** to diagnose its structural integrity: determine whether the repository shape matches its operational scale (Monorepo, Modular Monolith, Stack-Segmented Monorepo, or Polyrepo), cross-check boundary leakage across multiple independent analyzers, and evaluate alignment with Conway's Law.

For deep-module terminology (**module**, **interface**, **depth**, **seam**, **adapter**, **locality**), refer to the `/codebase-design` skill.

## Core Invariants

1. **Multi-Tool Triangulation (Never Trust a Single Tool)**: A static import analyzer only sees syntax; it misses temporal coupling or runtime database sharing. A manifest checker only sees top-level packages; it misses deep internal leaks. Run multiple distinct tools across four audit suites and cross-validate findings.
2. **Machine-First Extraction, LLM Synthesis**: Never read an entire `src/` directory directly into agent context. Run deterministic CLI tools and bundled scripts to generate condensed reports, then synthesize architectural conclusions.
3. **Conway's Law Context Sensing**: Code layout cannot be judged in isolation from the organization. A high-coupling monorepo is productive for 3 engineers but paralyzing for 60 distributed engineers. Measure team size, contributor count, and deployment cadence before diagnosing.
4. **Harden Before Split**: Never default to recommending repository extraction or microservice splitting. Enforce seams and boundaries with static analysis in place first; recommend polyrepo isolation only when organizational or CI blast radius limits are breached.

## The Multi-Tool Diagnostic Matrix

| Audit Suite                             | Primary Tools                                              | What It Inspects                                                                  | Blind Spot (Why Cross-Check is Needed)                             |
| :-------------------------------------- | :--------------------------------------------------------- | :-------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **Suite A: Semantic Graph & AST**       | `codebase-memory-mcp`, `ast-grep`, `madge`                 | Syntactic imports, call graph cycles (SCCs), cross-service hops (gRPC/HTTP/tRPC). | Blind to temporal co-change, commit velocity, and dead code.       |
| **Suite B: Package Isolation**          | `depcheck`, `syncpack`, manifest inspect                   | Workspace contracts, hoisted phantom dependencies, version drift.                 | Blind to private subfolder traversal inside declared dependencies. |
| **Suite C: Temporal Git Dynamics**      | `git log` co-change, `git shortlog`, `detect-coupling.mjs` | Co-committed files, commit velocity, team bus factor.                             | Cannot identify the exact code construct causing the coupling.     |
| **Suite D: Shared Gravity & Contracts** | `audit-shared-gravity.mjs`, schema checks                  | ORM models in `/shared`, DB connections, OpenAPI/Protobuf contracts.              | Blind to organizational release train overhead.                    |

## Process

### 0. Tool Pre-Flight & Capability Discovery

Before executing analyzers, discover which tools are installed and which can run via `npx` or bundled scripts:

```bash
node <skill-path>/scripts/check-tools.mjs
```

- **Installed tools** (e.g., `codebase-memory-mcp`, `ast-grep`): Run directly via CLI.
- **Missing Codebase Memory MCP**:
  - Run zero-install: `npx -y codebase-memory-mcp cli <tool> <args>` (or `bunx codebase-memory-mcp`)
  - Install globally: `npm i -g codebase-memory-mcp` or `pip install -U codebase-memory-mcp`
  - Or skip CBM entirely: The skill automatically falls back to `ast-grep` + `madge` + bundled scripts without degraded diagnostic validity.
- **Other missing tools**: Run zero-install via `npx` (e.g., `npx @ast-grep/cli`, `npx madge`, `npx depcruise`), or rely on the zero-dependency bundled scripts in `<skill-path>/scripts/`.
  **Done when:** Available local tools and fallback execution paths are known.

### 1. Conway's Law & Operational Context Sensing

Collect organizational and operational metrics before inspecting source code:

Run the bundled quick scan script to gather contributor metrics, topology, and coupling ratio in one step:

```bash
node <skill-path>/scripts/detect-coupling.mjs
```

1. **Active Contributor Velocity**:

   ```bash
   git shortlog -sn --since="3 months ago" | head -n 30
   ```

   Count unique active committers in the past 90 days:
   - `< 10 contributors`: Small team. Informal alignment high; tooling overhead must stay near zero.
   - `10 - 40 contributors`: Medium scale. Informal alignment breaks; requires automated boundary enforcement.
   - `> 40 contributors`: Enterprise scale. Multiple squads; merge contention and pipeline queues become dominant bottlenecks.

2. **Deployment Cadence & Independent Units**:
   - Inspect CI/CD definitions (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, Dockerfiles).
   - Count independently deployable runtime targets (services, background workers, frontends).
   - Detect whether builds are lockstep (single release pipeline) or decoupled (path-filtered triggers).

3. **Context Clarification (Prompt when ambiguous)**:
   If contributor count or deployment boundaries are unclear from Git history, prompt the user with two specific questions:
   - How many full-time engineers regularly commit to this repository?
   - Must services deploy independently to production, or can they release together on a single schedule?

**Done when:** Contributor scale tier (<10, 10-40, >40) and deployment coupling model (lockstep vs. independent) are documented.

### 2. Multi-Suite Automated Scanning

Execute automated analyzers across all 4 suites:

#### Suite A: Semantic Graph, AST & Cross-Service Hops

1. **When `codebase-memory-mcp` is available and repo is indexed**:
   - Scan call-graph circular dependencies (SCCs of size > 1):
     ```bash
     codebase-memory-mcp cli get_architecture --project <name> --aspects cycles
     ```
   - Trace cross-service RPC / HTTP hops across boundaries:
     ```bash
     codebase-memory-mcp cli trace_path --project <name> --function-name <entry-fn> --mode cross_service
     ```
2. **Standard AST & Seam checks (Instant / Unindexed repos)**:
   - Detect deep relative imports traversing package boundaries:
     ```bash
     ast-grep -p 'import { $$$VARS } from "$PATH"' -r '$PATH' | grep -E '\.\./\.\./(apps|packages|services)/[^/]+/(src|lib|internal)/'
     ```
   - Detect graph cycles:
     - TypeScript: Run `npx madge --circular --extensions ts,tsx,js,jsx <entry-dir>` or check `.dependency-cruiser.cjs`.
     - Go: Run `go vet ./...`.

#### Suite B: Package Manifest & Dependency Hygiene

1. Run `node <skill-path>/scripts/cross-check-triangulation.mjs` to evaluate declared sub-package workspace contracts.
2. Check for dependency version drift across sub-packages (e.g. mismatched ORM or runtime library versions).

#### Suite C: Temporal Co-Change Coupling (Git Dynamics)

Measure how frequently different services or applications change together in the same Git commit:

```bash
git log --oneline --name-only -n 60
```

Flag any pair of services that co-change in `> 25%` of multi-file commits.

#### Suite D: Shared Gravity & Contract Discipline

Run the bundled shared gravity auditor:

```bash
node <skill-path>/scripts/audit-shared-gravity.mjs
```

- Scans `/shared`, `/common`, `/libs` for Database Entities, ORM schemas, and stateful singletons.
- Checks whether inter-service communication utilizes formal contracts (OpenAPI, Protobuf, Zod, tRPC) or raw shared internal code.

**Done when:** Results from Suites A, B, C, and D are collected.

### 3. Cross-Validation Triangulation Protocol

Cross-examine findings between tools to eliminate blind spots:

```
                  ┌───────────────────────────────────────────────┐
                  │          Triangulation Protocol               │
                  └──────────────────────┬────────────────────────┘
                                         │
         ┌───────────────────────────────┼──────────────────────────────┐
         ▼                               ▼                              ▼
  Cross-Check 1                   Cross-Check 2                  Cross-Check 3
  Static AST vs. Manifest         Static Clean vs. Temporal      Declared vs. Shared Gravity
  ┌─────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
  │ Code imports traverse   │     │ Static imports clean,  │     │ Repo declares services,│
  │ deep private paths while│     │ but services co-change │     │ but /shared contains   │
  │ manifest claims boundary│     │ in 40% of Git commits. │     │ ORM models & DB schemas│
  ├─────────────────────────┤     ├────────────────────────┤     ├────────────────────────┤
  │ DIAGNOSIS: False        │     │ DIAGNOSIS: Hidden DB / │     │ DIAGNOSIS: Distributed │
  │ Boundary (Phantom Leaks)│     │ Event Broker Coupling  │     │ Monolith in Disguise   │
  └─────────────────────────┘     └────────────────────────┘     └────────────────────────┘
```

1. **Cross-Check 1 (Static AST vs. Manifest):**
   - _Symptom:_ Package `A` declares dependency on package `B` via workspace manifest, but AST reveals `A` directly imports `B/src/internal/helpers.ts`.
   - _Verdict:_ **False Boundary / Phantom Leaks**. The package cannot be extracted without breaking builds.
2. **Cross-Check 2 (Static Cleanliness vs. Temporal Git Co-Change):**
   - _Symptom:_ Suite A reports zero cross-service imports, but Suite C reports Service `orders` and Service `billing` co-change in 40% of commits.
   - _Verdict:_ **Hidden Coupling (Architectural Blind Spot)**. The services are coupled through an unversioned database table, shared migration, or undocumented event payload.
3. **Cross-Check 3 (Declared Microservices vs. Shared Gravity):**
   - _Symptom:_ Repo claims to run independent microservices, but Suite D discovers ORM entities or database connection pools inside `/shared`.
   - _Verdict:_ **Distributed Monolith in Disguise**. Services cannot deploy independently.

**Done when:** Triangulation verdicts are determined and root causes identified.

### 4. Diagnostic Assessment & Actionable Prescription

Synthesize observations into a diagnostic report with the following structure:

#### A. Architecture Classification & Health Matrix

| Dimension               | Observed State               | Recommended Target               | Gap / Risk              |
| :---------------------- | :--------------------------- | :------------------------------- | :---------------------- |
| **Repo Topology**       | (e.g., Unenforced Monorepo)  | (e.g., Stack-Segmented Monorepo) | High / Medium / Low     |
| **Team Fit (Conway)**   | (e.g., 25 devs on naive Git) | Requires affected-graph tooling  | Merge queue choke risk  |
| **Boundary Discipline** | (e.g., Leaky deep imports)   | Deep modules via entry points    | Regression blast radius |
| **Runtime Coupling**    | (e.g., Shared DB entities)   | Contract-first interfaces        | Deploy lockstep failure |

#### B. Architectural Drift Hotspots (Cross-Validated Evidence)

List exact file locations and code smells validated by multiple tools:

- Cross-boundary leaks: `path/to/service-a/file.ts:15` importing private module of `service-b` (validated by AST + manifest check).
- Shared folder pollution: `packages/shared/models/order.ts` shared across multiple services (validated by Suite D).
- Hidden temporal coupling: `apps/billing` and `apps/notifications` co-changed in 14 of 40 commits (validated by Suite C).

#### C. Decision Verdict: Keep, Harden, or Split

1. **Keep As-Is**:
   - Condition: Small team (< 10), high cohesion, zero circular dependencies, minimal `/shared` pollution. No change needed.
2. **Harden In-Place (Most Common Recommendation)**:
   - Condition: Team 10-50, monorepo structure makes sense, but code boundaries are degrading due to missing tooling.
   - Actions:
     - Install static boundary enforcement (for TypeScript, trigger the `/setup-ts-deep-modules` skill).
     - Cleanse `/shared` by pushing domain entities back to owning packages.
     - Configure affected target execution in CI (Turborepo, Nx, or Pants).
3. **Split (Polyrepo or Multi-Monorepo Transition)**:
   - Condition: Polyglot toolchains causing CI friction, distinct teams operating independently without shared deployments, or regulatory compliance requiring isolated access control.
   - Actions:
     - Establish Contract-First schema repositories (Protobuf, OpenAPI) before moving code.
     - Move shared libraries to an internal package registry with explicit SemVer versioning.
     - Carve out independent Git repositories along bounded context seams.

#### D. Tactical 3-Step Execution Plan

Provide a concrete, prioritized roadmap of actions the engineering team can run immediately.

**Done when:** The complete diagnostic report is presented to the user, citing observed data and linking to remediation skills.
