# ADR Guidelines & Rules

Location: `docs/adr/NNNN-slug.md` (4-digit prefix).

## When to Offer an ADR

Offer an ADR only when **all three** conditions are met:

1. **Hard to reverse** — meaningfully expensive to undo later.
2. **Surprising without context** — a future reader will ask "why was this done this way?".
3. **Real trade-off** — chosen over genuine, non-obvious alternatives.

If any condition is missing, skip the ADR.

---

## Layout Formats (SSOT)

For complete layout specifications (Simple vs Formal ADRs), layout selection matrix, and automated validation scripts, consult **[`adr-layout.md`](../../productivity/docs/references/adr-layout.md)** in the [`docs`](../../productivity/docs/SKILL.md) skill.

## Deciders & Author Attribution

When recording an ADR with `Deciders:`, default to the user's local GitHub username (via `gh api user --jq .login` or `git config user.name`). Never use generic placeholders (`Team`, `Core Architecture`) or AI names (`Agent`, `Claude`).
