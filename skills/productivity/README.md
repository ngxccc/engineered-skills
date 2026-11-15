# Productivity

General workflow tools, not code-specific.

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[grill-me](./grill-me/SKILL.md)** — Relentlessly stress-test and sharpen a plan, decision, or wild idea through interview until every branch of the design tree is resolved.
- **[teach](./teach/SKILL.md)** — Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[docs](./docs/SKILL.md)** — Documentation, ADR (Simple & Formal), RFC, System Design, and Operational Workflow management with automated validation.
- **[grilling](./grilling/SKILL.md)** — Stress-test a plan, decision, or idea relentlessly by interview until every branch of the design tree is resolved.
- **[dashboard-ui](./dashboard-ui/SKILL.md)** — In-app UI and design system for dashboards, data tables, forms, modals, and settings screens.
- **[writing-for-agents](./writing-for-agents/SKILL.md)** — Writing documents for agents: skills, AGENTS.md/CLAUDE.md, and any doc an agent reaches by a pointer.
