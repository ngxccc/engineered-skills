---
name: implement
description: "Implement a spec, ticket, or request in this repository. Use when asked to build a feature, fix a bug, refactor, or otherwise change behavior."
---

# Implement

Turn a ticket, spec, or request into reviewed, verified code.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

## 1. Standards gate

Read the repository's standards before writing code, tests, or commit messages. Start at `AGENTS.md` and follow its map from the planned change to the standard that governs it. When no map exists, read every file under `docs/standards/`.

Done when you can name each standard that binds this change and the rule it imposes. Read the glossary entry point (`GLOSSARY.md` or `GLOSSARY-MAP.md`) and the ADRs for the affected area in the same pass.

## 2. Slice

Work one vertical slice at a time: failing test at the public seam, minimal code, refactor. Test observable behavior, not internal call order.

Done when every acceptance criterion has a test that fails without the change.

## 3. Verify

Run typechecking and the touched test files continuously; run the full suite once before review.

Done when the repository's own gates pass from a clean state, including build and generated contracts where the project has them. Report a failing gate instead of routing around it.

## 4. Review

Run `/code-review` along both axes: standards compliance, and completeness against the ticket or spec without scope creep.

Done when every finding is fixed or recorded as a follow-up.

## 5. Commit

Format atomic Conventional Commits through `/git-flow`, one logical change per commit.

Done when each commit stands on its own and the branch is ready for review.
