## What it does

`dashboard-ui` is a structured UI/UX design and component engineering system specifically crafted for **in-app dashboard screens**: dashboards, data tables, form layouts, settings panels, modals, and list pickers.

It operates with designer discipline:

- **Default branch (Branch U):** Generates a structured brief, defines primary user jobs per screen, presents 2–3 concrete wireframes with realistic content, and waits for human selection before implementing code.
- **Strict token system:** Enforces standardized CSS tokens (`tokens.css`) for borders, surfaces, text contrast, and active states.
- **Anti-AI-Slop rules (`references/anti-slop-rules.md`):** Systematically rejects generic AI aesthetics (default purple-to-blue gradients, floating shadows on every card, bento-grid mosaic overuse, meaningless sparkle icons, and universal pill shapes).
- **Locked design rules (`references/locked-rules.md`):** Enforces 18 hard project decisions (e.g., height-based border radii, strict modal transitions, and focus indicator handling).
- **State-complete specifications:** Every component explicitly covers empty, loading, error, and selected states without hallucinating premature backend logic.

## When to reach for it

Reach for `/dashboard-ui` whenever building, auditing, or refactoring in-app interfaces:

| What you want                                          | What to reach for                                          |
| :----------------------------------------------------- | :--------------------------------------------------------- |
| Build in-app dashboards, tables, forms, or settings    | `/dashboard-ui`                                            |
| Audit whole UI & copy against 38 general AI-slop rules | [anti-slop](https://aihero.dev/skills-anti-slop)           |
| Polish human text, strip corporate buzzwords           | [writing-polish](https://aihero.dev/skills-writing-polish) |
| Review code changes or PR before merge                 | [code-review](https://aihero.dev/skills-code-review)       |

## Common questions

**Does `dashboard-ui` build landing pages or e-commerce storefronts?**  
No. Its scope is strictly **in-app screens** (dashboards, tables, forms, settings, pricing tables). If invoked for marketing landing pages or storefronts, it announces a one-line disclaimer and defaults to general design flow.

**Why does `dashboard-ui` leave interactive handlers empty?**  
The skill focuses strictly on visual presentation, component tokens, and state rendering. It deliberately leaves event handlers empty (`onPageChange`, `onConfirm`) for developers to attach real backend logic, avoiding speculative API integration.

**How does it avoid generic AI aesthetics?**  
Through `references/anti-slop-rules.md`: it prohibits the default AI purple-blue gradient, restricts glassmorphism to at most 1–2 accents, forbids unneeded bento-grids, avoids soft floating shadows everywhere, and mandates structured tokens over arbitrary colors.

## It's working if

- The agent walks through brief and wireframes before writing implementation code.
- Components use `tokens.css` variables instead of raw hex values or arbitrary Tailwind utilities.
- States are visually demonstrated (empty, loading, error, active) rather than assuming happy paths.
- Buttons, inputs, and cards conform to systematic radius scales ($8\text{px}$ for $<40\text{px}$, $\ge 12\text{px}$ for $\ge 40\text{px}$).
- Giao diện dashboard trông chuyên nghiệp, có chiều sâu dữ liệu và sạch bóng dấu vết AI sinh ngẫu nhiên.
