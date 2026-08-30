# Testing & Fixture Standards

## 1. 3-Tier Integration Test Hierarchy

- **Level 1**: `describe("<Domain> Module Integration")`
- **Level 2**: `describe("<HTTP_METHOD> <route> [(<Scope>)]")` or `describe("Database Invariants: <Topic>")`
- **Level 3**: `it("should <expected outcome> when <condition>")`

---

## 2. Test Data Factory & Object Mother Patterns

- **Factory Pattern**: `create<Entity>(db, overrides)` with `Partial<TNewEntity>` — auto-resolves Foreign Key DAG.
- **Object Mother Pattern**: Domain presets (`MovieMother.standard()`, `UserMother.admin()`).
- **Auth Helper**: `createAuthenticatedUser(db, jwtService)` returns `{ user, token, authHeader }`.

---

## 3. SUT Boundary & Cross-Module Test Isolation

- **Auth Module**: Call HTTP endpoints directly (`/auth/register`, `/auth/login`) — Auth API is the SUT.
- **Other Modules**: DO NOT call `/auth/register` over HTTP. Seed via `UserMother` / `createAuthenticatedUser` to eliminate coupling.

---

## 4. OpenAPI Contract-First Type Assertions

- **PROHIBITION**: Never declare local inline response interfaces.
- **MANDATORY**: Import types from `test/generated/api-schema.d.ts` (`components["schemas"]`).

---

## 5. Database & State Isolation (Schema-per-Worker Pattern)

- **Dynamic Schema Virtualization**: When executing tests in parallel, each worker thread/process MUST bind to a dynamically provisioned database schema (e.g. `test_<timestamp>_<uuid>`) via connection-level search path routing to eliminate cross-worker deadlocks.
- **Extension & Global Catalog Resolution**: Ensure shared database extensions, functions, and public catalogs remain resolvable in the search path hierarchy.
- **Isolated State Truncation**: Test case reset hooks (`beforeEach` / teardown) MUST only truncate tables within the worker's active schema (e.g. querying `current_schema()` and safely quoting table identifiers using the ORM/driver-provided AST escaping), never wiping shared or peer schemas.
- **Cache & Queue Namespace Isolation**: Integration tests running against shared cache or message brokers (Redis, RabbitMQ, Kafka) MUST prefix all keys, mutexes, and queue names with the worker's unique ID to prevent cross-worker lock deletion or job theft.
- **Background Worker & Scheduler Guardrails**: Suppress or isolate background cron schedulers and asynchronous queue consumers during standard integration tests to prevent background queries against terminating test connections.
- **Deterministic Lifecycle Teardown**: Clean up provisioned schemas (e.g. `DROP SCHEMA IF EXISTS <worker_schema> CASCADE;`) and close open broker/database connections upon test suite completion.

---

## 6. Performance Benchmarks & Stress Testing

- **Location & Layout**: Dedicated directory for micro-benchmarks and load tests (e.g. `benchmarks/` or `test/benchmarks/`).
- **Execution**: Standardized test command with optional domain filtering (e.g. filter by subsystem or endpoint).
- **Structure**: Benchmark routines MUST return deterministic, standardized metrics (`task`, `iterations`, `minMs`, `avgMs`, `p50Ms`, `p95Ms`, `p99Ms`, `opsPerSec`).
- **Output Standards**: Structured console tables or machine-readable JSON only — zero emojis, zero decorative ASCII banners, strictly CI/CD and telemetry-friendly.
