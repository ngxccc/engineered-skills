# Brainstorming & Technical Evaluation Protocol

Protocol for sharpening technical ideas into validated designs during `/grill-with-docs`.

---

## 1. Trade-Off Matrix

For non-obvious architecture choices, present 2–3 distinct approaches before settling:

| Option | Approach              | Pros             | Cons                     | Risk Class       | Recommendation  |
| :----- | :-------------------- | :--------------- | :----------------------- | :--------------- | :-------------- |
| **A**  | _Approach summary_    | _Key advantages_ | _Drawbacks & complexity_ | Low / Med / High | **Recommended** |
| **B**  | _Alternative summary_ | _Key advantages_ | _Drawbacks & complexity_ | Low / Med / High | Alternative     |

---

## 2. 7-Domain Engineering Evaluation Matrix

Evaluate proposed architectures across seven baseline domains:

1. **Domain A: Security & Privacy** — Trust boundaries, least privilege, input validation, encryption, PII handling.
2. **Domain B: UI/UX & Usability** — Interaction flow, accessibility, loading/empty states, error feedback.
3. **Domain C: Performance & Scalability** — Latency targets, query efficiency, caching, rate limiting, memory footprint.
4. **Domain D: Reliability & Resilience** — Idempotency guarantees, transactions, retries, fail-safes, graceful degradation.
5. **Domain E: Maintainability & Architecture** — Deep modules, explicit seams, loose coupling, 6-month readability.
6. **Domain F: Observability & Operations** — Structured logging, error telemetry, metrics, runbooks, health checks.
7. **Domain G: Business & Compliance** — System invariants, domain rules, state transitions, regulatory limits.

---

## 3. Risk Gate & Invariant Discovery

When a feature touches **High-Risk areas** (Auth, Billing, DB Schema Migrations, Public API Contracts, Gateway, Secrets):

1. **Discover Invariants (`INV-1..N`)**: Extract non-negotiable mathematical or business rules that must hold true across all execution states.
2. **Define Fail-Safe Boundaries**: Specify fallback behavior during unexpected failures, partitions, or timeouts.
3. **Output Target**: Direct the session to produce a Formal Spec via `/docs formal-spec`.

---

## 4. Edge Case & Adversarial Discovery Framework

Systematically interrogate edge cases during grilling rounds using 4 anomaly classes:

| Anomaly Class              | Focus Areas                                                        | Discovery Questions                                                                            | Target Artifact     |
| :------------------------- | :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :------------------ |
| **Boundary & Input**       | Zero, negative, max limits, empty payloads, malformed data         | _"What happens when payload is empty, max integer, or contains unexpected fields?"_            | `EDGE-1..N` table   |
| **Concurrency & State**    | Race conditions, duplicate retries, out-of-order events, deadlocks | _"What if two identical requests arrive in the exact same millisecond?"_                       | `ADV-1..N` matrix   |
| **Failure & Partitions**   | DB connection drops, third-party 5xx, timeout mid-write            | _"If network drops during DB commit, does state rollback 100% or remain partially committed?"_ | Fail-safe rules     |
| **Adversarial & Security** | Injection, replay attacks, unauthorized role escalation            | _"Can a tenant spoof or manipulate resource IDs across boundary?"_                             | Security invariants |
