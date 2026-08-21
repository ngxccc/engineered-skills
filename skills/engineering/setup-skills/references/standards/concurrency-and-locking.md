# Concurrency & Locking Standards

## 1. Locking Tier Decision Matrix

| Concurrency Tier              | Mechanism               | When to Apply                              | Failure Mode                              |
| :---------------------------- | :---------------------- | :----------------------------------------- | :---------------------------------------- |
| **Tier 1 (DB Constraint)**    | `EXCLUDE USING gist`    | Show scheduling, hall slot allocation.     | PostgreSQL error `23P01`.                 |
| **Tier 2 (Pessimistic Lock)** | `SELECT ... FOR UPDATE` | Seat reservation in single DB transaction. | Blocks until lock acquired or timeout.    |
| **Tier 3 (Distributed Lock)** | `Redlock` via Redis     | Cross-instance critical sections.          | Throws 409 Conflict if lock unobtainable. |

---

## 2. Deadlock Prevention: Mandatory Lock Ordering

When locking multiple resources simultaneously (e.g. 5 seats in 1 order):

- **RULE**: Sort resource IDs in **ascending lexicographical order** before acquiring locks.

---

## 3. Redlock Configuration & Safety Protocols

- **Key Pattern**: `lock:<domain>:<resourceId>` (e.g. `lock:show_seats:${showId}`).
- **TTL Formula**: $\text{TTL} = \text{Max Expected Execution Time} + \text{Clock Drift Buffer (500ms)}$.
- **Release Invariant**: Always release locks in a `finally` block.

---

## 4. Resilience: Fail-Open vs Fail-Closed Policies

- **Rate Limiter / Metrics**: **Fail-Open** — If Redis rate limiter blips, allow request through.
- **Seat Booking / Financial Debits**: **Fail-Closed** — If lock/DB transaction fails, reject with 409/500 to prevent overselling.
