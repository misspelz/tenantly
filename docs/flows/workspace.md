# Workspace and tooling

How the monorepo is wired: pnpm finds and links the packages, the catalog keeps versions in sync, and Turborepo runs tasks in dependency order with caching.

## Layout

```txt
tenantly/
├── apps/          # deployable: web, admin, api (week 1, step 7)
├── packages/      # shared: typescript-config, eslint-config, ui, contracts
├── docs/
├── package.json   # root: scripts that call turbo, root-only dev tools
├── pnpm-workspace.yaml
└── turbo.json
```

## Day-to-day commands

| Command | Does |
| ------- | ---- |
| `pnpm install` | Install everything and link workspace packages |
| `pnpm build` / `lint` / `check-types` / `test` | `turbo run <task>` across every package that defines it |
| `pnpm dev` | Every dev server, in turbo's terminal UI |
| `pnpm --filter @tenantly/<name> <script>` | Run a script in one package |
| `pnpm add <dep> --filter @tenantly/<name>` | Add a dependency to one package |
| `pnpm add -D -w <dep>` | Add a dev tool to the root |

## Root `package.json`

| Field | Value | Why |
| ----- | ----- | --- |
| `name` | `@tenantly/root` | Every package uses the `@tenantly/` scope, so imports show where code comes from. |
| `private` | `true` | `pnpm publish` can never push the root to npm. |
| `type` | `module` | Root `.js` config files use `import`/`export`. |
| `packageManager` | `pnpm@11.23.0` | pnpm switches to this exact version, so local machines and CI install identically. |
| `engines.node` | `>=24` | Enforced at install time via `engineStrict`. |
| `scripts` | `turbo run <task>` | Thin wrappers. Each package owns its real commands. |
| `devDependencies` | `turbo` (exact) | Root-only tools are pinned here, not in the catalog. |

## `pnpm-workspace.yaml`

| Setting | Value | Why |
| ------- | ----- | --- |
| `packages` | `apps/*`, `packages/*` | Where the workspace packages live. |
| `catalog` | grows as needed | One version per **shared** dependency, used as `"react": "catalog:"`. Upgrading means changing one line. Entries are added when a package first needs them, so nothing unused is listed. |
| `engineStrict` | `true` | The wrong Node version fails at install time, not later with a confusing runtime error. |
| `minimumReleaseAge` | `1440` (minutes) | Versions less than a day old aren't installed. Most npm supply-chain attacks are caught and pulled within hours. |
| `allowBuilds` | grows as needed | Dependencies can't run install scripts unless listed. Install scripts are the most common way malicious packages run code. |

pnpm settings live in this file, not `.npmrc`, because that's where pnpm 10+ reads them. `.npmrc` is left for registry and auth config.

**Catalog or not?** Use the catalog if more than one package uses the dependency (React, TypeScript, Zod, Tailwind). Pin the exact version where it's used if only one package does (Turbo at the root, Hono in `api`).

## Turborepo (`turbo.json`)

| Key | Meaning |
| --- | ------- |
| `"dependsOn": ["^build"]` | Run `build` in this package's **dependencies** first. `admin` won't build until `contracts` and `ui` have. |
| `inputs` | What turbo hashes to decide if a package changed: `$TURBO_DEFAULT$` (git-tracked files) plus `.env*`, so changing an env value triggers a rebuild. |
| `outputs` | Cached and restored on a hit: `dist/`, `.next/` (minus `.next/cache`), `storybook-static/`, `coverage/`. |
| `lint` / `check-types` → `^build` | Apps import types from built packages (`contracts/dist`), so those must be built first. |
| `dev` | `cache: false` (nothing worth caching), `persistent: true` (never exits, so nothing should wait for it). |
| `"ui": "tui"` | Interactive terminal view with one pane per task. |

`lint` and `check-types` deliberately **don't** depend on `^lint` / `^check-types`. Linting a dependency first doesn't change a package's own result, and leaving those out lets turbo run more in parallel.

A `pnpm build` that reports "0 tasks" means no package defines that script yet.

## Shared TypeScript config

_To do (week 1, step 4)._

## Linting and formatting

_To do (week 1, step 5)._

## Git hooks

_To do (week 1, step 6)._

## Open questions

- pnpm 12 is out. We're on 11 to match the brief. If we upgrade, earlier is cheaper.
