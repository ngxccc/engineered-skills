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

## 5. Database Isolation

- **`beforeEach`**: Run `truncateAllTables(db)` to clear transactional state.
- **`afterAll`**: Close all background timers and Redis connections.
