# Update Workflow

## Phase 1: Codebase Scouting

1. Scan the codebase and calculate the number of files with LOC in each directory (skip `.claude`, `.git`, `tests`, `node_modules`, `__pycache__`, `secrets`, etc.).
2. Target directories that actually exist in the project.

## Phase 2: Documentation Update

Perform a docs-only update in the current agent, without changing implementation code.

Pass the gathered context to update the relevant documentation:

- `README.md`: Update README (keep it under 300 lines)
- `docs/adr/`, `docs/rfc/`, `docs/design/`, `docs/formal-specs/`: Update architectural decision records, proposals, design documents, and formal specifications.

## Phase 3: Size Check (Post-Update)

After documentation updates complete, check LOC of updated doc files.

## Phase 4: Documentation Validation (Post-Update)

Run validation suite: `bun run skills/productivity/docs/scripts/validate-docs.mjs`.
