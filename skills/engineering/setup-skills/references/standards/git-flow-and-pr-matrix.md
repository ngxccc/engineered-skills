# Git Flow & Pull Request Standards

## 1. Branch Naming Conventions

- `feature/<kebab-case-name>` — New feature.
- `fix/<kebab-case-name>` — Bugfix.
- `hotfix/<kebab-case-name>` — Production patch.
- `core/<kebab-case-name>` — Major architecture or DB schema refactor (Tier 3).

---

## 2. Conventional Commits Standard

**Format**: `<type>(<scope>): <summary>` — header length $\le 72\text{ characters}$.

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
**Scope**: Lowercase module name (`shows`, `auth`, `booking`, `factories`).

---

## 3. Adaptive 3-Tier PR Matrix

| Tier                    | Scope & Risk                                   | Requirements                                            |
| :---------------------- | :--------------------------------------------- | :------------------------------------------------------ |
| **Tier 1 (Patch)**      | Typos, minor docs, deps.                       | Single-sentence PR summary.                             |
| **Tier 2 (Standard)**   | Feature, bugfix, refactor.                     | Conventional Commits, 5-section PR body, passing tests. |
| **Tier 3 (Enterprise)** | Core architecture, DB schema, breaking change. | Atomic commits, ADR/RFC link, human audit evidence.     |

---

## 4. Human Audit & Verification Protocol

1. **Inspection & Proposal Only**: When committing, check `git status` / `git diff`, propose atomic commit slicing plan, display formatted Conventional Commit message.
2. **Explicit Confirmation Required**: NEVER execute `git commit` until human confirms with explicit approval.
