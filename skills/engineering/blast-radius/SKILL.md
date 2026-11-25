---
trigger_keywords: blast-radius, breaking-change, impact-analysis, safety-proof
name: blast-radius
description: Find what a change could break somewhere else beyond the diff, and prove the one fact it is safe because of by running real code instead of asserting it. Use for "blast radius of X", "what could this break", reviewing a risky diff, or verifying modified shared interfaces and contracts.
---

# Blast Radius

Find what a change breaks somewhere else before it ships.

Listing the callers is not the job — grep does that in a second. The job is finding the breakage grep will not show you and proving safety by running real code.

## Don't trust your own writeup

A blast-radius writeup that sounds right is worthless: it reads convincingly whether or not it is true. Find the one or two facts the change's safety depends on and prove them by running code.

### How sure are you

For each fact the change's safety depends on, push it as far down this scale as is cheap, and report where it stopped:

1. **You said so.** Worthless on its own.
2. **You pointed at the line.** A real `file:line`, or the dependency's own source.
3. **You showed the bad case can't happen.** You walked the failure path step by step and it does not reach.
4. **You ran it.** A script or test that calls the real code and fails loudly if you are wrong.
5. **You reproduced it in the running app.**

Step 4 is usually one small script that imports the exact module or library the app ships and calls the function in question.

## Steps

1. **Read the change.** Inspect the diff, the symbols added/changed/deleted, and what behaves differently — including what the diff does not spell out.
2. **Find the one fact it is safe because of.** Most changes that look risky are safe because of a single invariant (e.g., "this call only drops already-dead cache entries and does nothing else"). Find that fact first; if it holds, most speculative risks clear at once.
3. **Look where grep stops.** Check dependency source and pinned versions, execution timing (microtasks, teardown/unmount, hooks), and non-symbol boundaries (API JSON payloads, DB columns, wire formats, feature flags, code three hops downstream).
4. **Be honest about each risk.** Give each confirmed risk a real likelihood and impact. Keep confirmed risks separate from items you checked and cleared. Cite real `file:line` paths; never invent callers or APIs.
5. **Prove the one fact.** Write and run a script or test against the real code, and record the exact command and output.
6. **For wide changes**, split independent failure surfaces across parallel subagents and merge only verified findings.

## Output

- **What it does**: what changed, including non-obvious behavioral shifts.
- **The one fact it is safe because of**: state it, report which confidence level (1–5) it reached, and paste the proof (or mark `unproven`).
- **Risks**: how each breaks, `file:line`, likelihood/impact, and repro proof.
- **Cleared**: what you checked and why it is safe.
- **Before you merge**: the cheapest test or repro script that catches the real bug.
