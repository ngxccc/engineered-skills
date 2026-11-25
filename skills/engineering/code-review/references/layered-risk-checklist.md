# Layered Risk & Contract Checklist

Inspect modified layers **bottom-up** in dependency order. Skip items already enforced by formatting, lint, or typechecking unless a semantic or boundary gap remains.

## Layer 1 — Data, Schema & Projections

- **Migrations vs Schema**: Verify migration SQL matches schema definitions (`INDEX`, foreign keys `onDelete`, partial unique indexes on soft-deletable records, check constraints, and immutability triggers).
- **Additive Safety**: Check destructive drops, non-null additions without defaults, or lock-heavy alterations.
- **Closed Projections**: Confirm queries and `.returning()` clauses use explicit closed projections rather than selecting full rows and stripping fields in memory.

## Layer 2 — Trust Boundaries (Shared Contracts, DTOs, Guards, Filters)

- **Single Source of Truth**: Domain enums, roles, error codes, and shared contracts live in one authoritative package/module rather than duplicated in apps.
- **DTO Strictness**: Request schemas reject unknown fields (`.strict()` or equivalent); response DTO enums match actual output bounds rather than overly broad domain enums.
- **Auth & Error Shape**: Guards, filters, and service throws emit structured error codes and safe detail strings without leaking secrets, tokens, SQL fragments, or PII.

## Layer 3 — Controller / Transport Contracts

- **Auth & RBAC Decorators**: Route guards, public markers, and role metadata match the spec's authorization matrix.
- **Status & Rate Limits**: Mutating endpoints declare accurate HTTP status codes, throttling decorators/docs, and every error status the handler or service can actually throw.
- **Response Decorator Parity**: Success schema decorators match the actual runtime envelope (`null` vs entity vs paginated list).

## Layer 4 — Service Logic & Runtime Failure Modes

- **Write Ownership**: Sensitive columns (credentials, tokens, roles, status) mutate only through their designated owning service or transaction helpers.
- **Transaction Atomicity**: Primary state changes, audit logs, and session/token updates share one database transaction when atomicity is required; failure rolls back all writes.
- **Concurrency & Locks**: Every _check-then-act_ path (counting active privileged users, uniqueness checks, inventory/quota decrements) uses row locks (`FOR UPDATE`), atomic conditional updates, or deterministic constraint conflict handling.
- **Side-Effect Ordering**: External side effects (cache/session revocation, email/queue dispatch) run only at safe boundaries (after commit, or explicit outbox/failure handling) with clear fail-open vs fail-closed semantics.
- **No-op & Anti-enumeration**: Unchanged patches short-circuit without spurious audit rows or revocations; public recovery/verification endpoints stay silent across missing, suspended, and inactive states.

## Layer 5 — Tests & Failure Modes

- **No Tautologies**: Tests assert real behavior and invariants rather than mirroring constants or mocking away the behavior under test.
- **Failure-Mode Coverage**: Verify tests cover the full RBAC matrix, invalid boundary inputs and error codes, concurrent races (`Promise.all`), trigger/rollback behavior, and unauthenticated/revoked states.

## Frontend / UI Layers (UI-1..UI-5)

Inspect modified UI files **bottom-up** in dependency order when a diff touches frontend apps or shared UI packages.

### UI-1 — Design Tokens, Typography & Assets

- **Semantic Tokens**: Styling uses the shared theme tokens and typography utilities rather than hardcoded hex colors or duplicate icon CDNs.
- **Approved Assets**: Images use approved remote hosts or local assets; prototype or temporary third-party asset URLs are replaced before merge.

### UI-2 — Component Primitives & Layout Shells

- **Shared Primitives**: Interactive controls, inputs, cards, badges, and overlays compose from the shared UI package instead of duplicating raw styled elements.
- **Shell Parity**: Pages render inside the root layout shell without duplicating shared headers/footers (except standalone root error fallbacks) and strip prototype preview/QA switchers.

### UI-3 — Rendering, Data & Trust Boundaries

- **Client/Server Isolation**: Server-only API clients, secrets, and raw tokens remain outside client bundles; authorization is enforced at server/proxy boundaries rather than UI hiding.
- **Hydration & Caching Safety**: Dynamic request reads, clocks, and locale formatting respect framework caching/hydration boundaries (isolated inside suspense or post-mount effects).

### UI-4 — Error Recovery, Navigation & Accessibility

- **Sanitized Error Boundaries**: Error fallbacks never expose raw `error.message`, stack traces, or internal URLs.
- **Verified Links & A11y**: Links and anchors resolve to existing routes/section IDs; decorative icons are `aria-hidden` and interactive controls expose accessible labels and focus states.

### UI-5 — UI & Boundary Tests

- **Invariant Verification**: Component, proxy, and boundary tests assert security, navigation, and state-handling invariants rather than brittle snapshot tautologies.

## Generated Contract Spot-Check

Instead of reading raw OpenAPI JSON or huge snapshot diffs line-by-line, inspect the generated TypeScript schema types for:

- Unexpected optional response fields (`data?:`) or broken empty object unions on `null` endpoints.
- Schema breakage yielding `unknown` (such as `password: unknown`) or `Record<string, never>` on generic metadata maps.
- Accurate enum unions, required/optional flags, and error status codes matching controllers.
