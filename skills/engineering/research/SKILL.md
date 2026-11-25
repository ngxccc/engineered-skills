---
trigger_keywords: research, primary-sources, investigation, documentation-sweep
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Spin up a **background agent** to do the research, so you keep working while it reads. Start it with a fresh context window.

Its job:

1. **External / technical questions**: investigate against **primary sources** — official docs, source code, specs, first-party APIs — not a secondary write-up of them. Follow every claim back to the source that owns it.
2. **Repo decision & history questions ("why was X built this way?")**: answer from the **record, not by guessing from current code** — read the commits (`git log -S`, `git log -p`) and PR/issue discussions that introduced the target and each later change. Cite what the authors wrote, explicitly mark any inference as an inference, and state what the record does not answer.
3. Write the findings to a single Markdown file, citing each claim's source (URL, commit SHA, PR/issue number, or `file:line`).
4. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.
