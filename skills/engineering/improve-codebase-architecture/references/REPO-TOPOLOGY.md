# Repo Topology

Module-level friction is not the only kind. Some of the worst friction is one level up: the
boundaries between apps, lockfiles, and packages. Scan topology before scanning modules — a
duplicated module rarely gets fixed well until you know whether the two copies are supposed to
be the same thing.

## Monorepo, workspaces, and task runners are three different decisions

| Thing                       | What it is                                                                                    | What it buys                                                           |
| :-------------------------- | :-------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| Monorepo                    | One git repo holding several deployables                                                      | Atomic changes, one history, one PR per cross-app change               |
| Workspaces                  | A dependency graph over folders, one lockfile, symlinked internal deps (Bun, pnpm, npm, yarn) | One install, one resolved version per dep, `workspace:*` internal deps |
| Task runner (Turborepo, Nx) | Caching + task graph + affected-target selection on top of workspaces                         | Faster CI once builds are slow and repeated                            |

They are not a package deal. Recommend them in order, and only advance when the previous step
is already painful:

- "Should this be a monorepo?" — about coupling and release cadence.
- "Should it use workspaces?" — about installs and dependency resolution.
- "Should it adopt Turborepo?" — about time-to-green in CI. It **requires** workspaces first,
  and it pays only when you run the same expensive task across several apps. A repo with three
  small apps and a warm cache gets little from it.

## Monorepo vs polyrepo: four questions

Ask these before recommending anything. Sources agree on the shape even when they disagree on
thresholds:

1. **Must a change to one app ship with a change to another?** If a contract (OpenAPI, shared
   types, event schema) crosses them, a feature is incomplete until both deploy. → monorepo.
2. **Is there one deploy unit or one release cadence?** One product, one version, one rollback
   story → monorepo. Independent release cadences → polyrepo.
3. **Do the apps need separate access control, licensing, or open-source boundaries?** →
   polyrepo (or at minimum a split, not a merge).
4. **Team size and ownership.** Small teams (roughly under 20 engineers) spend more on
   cross-repo coordination than they save on isolation. Large, independently-owned services
   reverse the trade.

If answers 1–2 are yes and 3 is no, the repo is a monorepo whether or not it has workspaces.
The remaining work is mechanical.

## Measure before you recommend

Opinions about topology are cheap; these numbers are not. Collect them first, then quote them
in the report:

- **Lockfile count** — `find . -name 'bun.lock*' -not -path '*/node_modules/*'`. More than one
  means installs are not shared and versions can drift per app.
- **Install count in CI** — grep the workflows for install steps. Four installs for three apps
  means the layout is polyrepo-with-a-common-repo.
- **Duplicated files** — hash or `diff` every app against the others. Then **diff the
  duplicates**: byte-identical means accidental duplication (share it); diverged means either
  drift (fix, then share) or intentional difference (leave it).
- **Version drift** — the same dependency declared with different ranges across manifests.
- **Dead configuration** — `.github/` inside an app directory, `.turbo/` with no `turbo.json`,
  release configs whose tool no longer runs, per-app lockfiles nobody installs. Zero references
  is the test.
- **Runtime readers of `version`** — search for code that reads a package version. Usually
  none, which settles the versioning question below.

## Share vs keep apart

Share a module when **all** of these hold:

- It is identical in two or more apps, or divergent only by accident.
- At least two apps really consume it.
- Its interface is stable — no app needs to change it independently.
- It carries no per-app domain meaning.

Keep it apart when the divergence **is** the design: admin and customer sessions model
different actors; i18n copy differs per product; shadcn components are vendored and edited
locally.

Sequence matters. Start with the constant/utility seam — routing, constants, validation glue,
pure hooks, static data. Never open with the UI layer or auth: those are where intentional
divergence lives, and a first move that forces convergence there will be reverted.

A shared package needs a written rule for what may enter it. Without one, it becomes the place
where every awkward module goes to avoid a decision.

## Move mechanics (Bun workspaces, no publish)

- Root `workspaces: ["app1", "app2", "packages/*"]`, one root lockfile. Delete app lockfiles —
  a stale one silently shadows the workspace install.
- Internal deps use `workspace:*`, never a range.
- Ship TypeScript source: an `exports` map pointing at `./src/*.ts`, plus `transpilePackages`
  in each Next.js consumer. No build step, no publish step.
- Move the test with the module. A test left behind still passes and no longer covers anything.
- Frameworks that resolve raw TS badly (NestJS with decorators, for example) can stay out of
  the shared package and simply share the lockfile.
- Keep deployable app directories where the hosting provider expects them. Moving apps into
  `apps/` breaks Vercel/Render root-directory settings for cosmetic gain.

## Version model

Ask in this order; the first "yes" changes the answer:

1. Does anything read a package version at runtime? (Serve it, log it, gate a migration on it.)
2. Is a package published to a registry?
3. Do the apps deploy on independent schedules, with independent consumers?

If all three are no: **one product version for every manifest.** The git tag is the record of
truth; manifests mirror it through a single script; CI fails when they disagree. Per-app
versions would produce several tags and changelogs for one user-visible change, verified by no
tool, since internal deps use `workspace:*`.

If 3 is yes: per-app versions, and consider independent repos rather than independent numbers
in one repo.

Skip automated release PR tools (release-please and friends) in the one-version case. They open
a standing PR on every push and rewrite the changelog from commits — process cost with no
external consumer, plus a second writer fighting the bump script. `version:bump` → `git tag` →
`gh release create --generate-notes` covers it.

## Topology candidates worth reporting

Treat these as first-class candidates in the HTML report, with a directory-tree before/after
instead of a module diagram:

- **Duplicated modules across apps** — the biggest and usually the first win.
- **Multiple lockfiles / repeated installs** — invisible cost paid on every CI run and every
  fresh clone.
- **Dead configuration** — files that describe a process nobody runs. Deleting them is
  deepening: it removes interface the reader must consider.
- **Deploy workflows that miss shared packages** — path filters that do not include the shared
  package mean a shared change deploys only some consumers.
- **Version drift** — the same dependency at different ranges, where the difference is
  accidental.
- **A shared package that swallowed per-app divergence** — the reverse smell: modules that
  should have stayed apart, now with flags and branches to keep two behaviours in one place.
