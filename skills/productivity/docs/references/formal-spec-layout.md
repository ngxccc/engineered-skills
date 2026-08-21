# Formal Specification Standard

Location: `docs/formal-specs/<kebab-case-name>.md`

## Required Structure

Must contain YAML frontmatter (`docType: formal-spec`), Level 1 Title (`# Title`), and section headings matching:

- `## Objectives & Boundaries` (Core objective, Expected outcomes, Allowed dependencies, Prohibited side-effects)
- `## Input Data Contracts` (Strict input schema definitions, validation rules, type boundaries)
- `## Constraints & System Invariants` (`INV-1..N` logical/mathematical invariants, Pre/Post-conditions, Error boundaries)
- `## Edge Cases & Adversarial Matrix` (`EDGE-1..N` fail-safe table, Property-based/fuzzing strategy, `ADV-1..N` concurrency/race-condition matrix)

---

## Frontmatter Template

```yaml
---
title: "Formal Specification: <Feature> <Topic>"
docType: "formal-spec"
status: "Draft | Approved | Verified"
riskClass: "Auth | Billing | DB Migration | API Contract | Secrets | Gateway"
targetModule: "path/to/target/module"
date: YYYY-MM-DD
author: "Team / Agent"
version: "1.0.0"
---
```

---

## Section Templates

### 1. Objectives & Boundaries

- **Core Objective**: Concise summary of what this module guarantees.
- **Expected Outcome**: Observable success state upon completion.
- **Module Isolation Boundary**:
  - Allowed Dependencies: Explicit list of permitted libraries or modules.
  - Prohibited Side-Effects: Forbidden mutations (e.g. no global state mutation, no direct network calls).

### 2. Input Data Contracts

Strict schema definitions and field constraints using the project's native validation framework (e.g. JSON Schema, Pydantic, Go structs, Rust serde/validator, Zod):

```
Schema / Type Contract:
- Request ID: UUIDv4, mandatory
- Amount: Positive numeric (> 0), required
- Sender ID: Non-empty identifier, must differ from Receiver ID
- Receiver ID: Non-empty identifier
```

### 3. Constraints & System Invariants

Non-negotiable logical and mathematical rules that MUST hold true before, during, and after execution:

- `INV-1 (Data Integrity)`: [Rule description, e.g. Balance_after == Balance_before - Amount]
- `INV-2 (Security Boundary)`: [Access control rule or permission check]
- `INV-3 (State Transition)`: [Permitted state machine transitions]

#### Contract Guarantees:

- **Pre-conditions**: Required conditions before execution begins.
- **Post-conditions**: Verified state after successful completion.
- **Error Boundaries**: Fail-safe fallback and rollback behavior on failure.

### 4. Edge Cases & Adversarial Matrix

#### A. Edge Cases Matrix (`EDGE-1..N`)

| ID       | Edge Case / Anomaly                   | Fail-Safe Expected Behavior                            |
| :------- | :------------------------------------ | :----------------------------------------------------- |
| `EDGE-1` | Malformed or negative input values    | Reject immediately at validation boundary              |
| `EDGE-2` | Database partition or network timeout | Abort cleanly, rollback transaction, return safe error |

#### B. Adversarial & Concurrency Matrix (`ADV-1..N`)

| ID      | Adversarial Scenario / Race Condition           | Expected Proof Outcome                                 |
| :------ | :---------------------------------------------- | :----------------------------------------------------- |
| `ADV-1` | Concurrent duplicate requests within 1ms window | Exactly one succeeds, remaining rejected (Idempotency) |
| `ADV-2` | Malicious payload injection attempt             | Sanitized or rejected before processing                |
