## What it does

`blast-radius` finds what a change can break outside the diff before it ships, and proves the key safety invariant by running real code rather than asserting it. Listing callers with grep is the baseline; the actual job is tracing non-symbol boundaries (API JSON shapes, DB columns, wire formats, feature flags, dependency source, and async/teardown timing) and pushing safety claims down a 5-level proof scale from assertion (`1`) to executed script/test (`4`) or running-app repro (`5`).

## When to reach for it

Invoke `blast-radius` directly when reviewing a risky change or asking "what could this break?", or let [code-review](https://aihero.dev/skills-code-review) invoke it in Step 5 when a diff modifies shared interfaces, schemas, DTOs, or cross-layer contracts.

## Common questions

**Why isn't listing callers with grep enough?**

Grep catches direct symbol renames, not semantic or runtime breakage: an optional field turning required in JSON, a Drizzle projection dropping a column expected downstream, or a teardown hook running before a microtask flushes.

**What if I can't prove the safety invariant with a runnable script?**

Report where it stopped on the 1–5 scale and mark the invariant `unproven`. Making the gap explicit prevents a confident-sounding writeup from masking an unverified assumption.

## It's working if

- The report names the single safety invariant ("the one fact it's safe because of"), its confidence level (1–5), and the exact command + output that proved it (or explicitly marks it `unproven`).
- Confirmed risks are separated from checked-and-cleared paths, each citing real `file:line` locations.
- You get a minimal repro script or test you can run before merging.
