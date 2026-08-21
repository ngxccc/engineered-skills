# Database & Migration Standards

## 1. Schema Conventions

- **Database Columns**: MUST be `snake_case` in PostgreSQL.
- **TypeScript Properties**: MUST be `camelCase`.
- **Primary Keys**: UUIDv7 generated via `primaryKeyUuid`.
- **Timestamps**: Every base entity MUST include timezone-aware `created_at` and `updated_at`.

---

## 2. Indexing Strategy & Performance Rules

- **B-Tree Index**: Standard equality and range lookups (`id`, `email`, `user_id`).
- **Composite Index**: Place high-cardinality columns first (`(hall_id, start_time)`).
- **Partial Index**: Use `WHERE` clauses for sparse states (`WHERE status = 'pending'`).
- **Exclusion Constraints**: Use `EXCLUDE USING gist` for time-range collision protection.

---

## 3. Query Optimization: YAGNI Selective Projections

- **PROHIBITION**: Never execute `SELECT *` in production hot-paths.
- **MANDATORY**: Explicitly project only required columns (`.select({ id: shows.id, status: shows.status })`).

---

## 4. Transaction Boundaries & Concurrency Safety

- **Atomic Consistency**: Combine interdependent mutations in a single `db.transaction(async (tx) => { ... })`.
- **Short-Lived**: Never perform external HTTP requests or heavy hashing inside an active DB transaction.

---

## 5. Zero-Downtime Migration Policy (Expand & Contract)

1. **Step 1 (Expand)**: Add nullable columns or tables. Deploy code writing to both old and new columns.
2. **Step 2 (Backfill)**: Run background migration to populate existing records.
3. **Step 3 (Contract)**: Deploy code reading from new columns only. Drop old columns in Phase 2.
