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

| Command                                        | Does                                                    |
| ---------------------------------------------- | ------------------------------------------------------- |
| `pnpm install`                                 | Install everything and link workspace packages          |
| `pnpm build` / `lint` / `check-types` / `test` | `turbo run <task>` across every package that defines it |
| `pnpm dev`                                     | Every dev server, in turbo's terminal UI                |
| `pnpm --filter @tenantly/<name> <script>`      | Run a script in one package                             |
| `pnpm add <dep> --filter @tenantly/<name>`     | Add a dependency to one package                         |
| `pnpm add -D -w <dep>`                         | Add a dev tool to the root                              |

## Root `package.json`

| Field             | Value                                                      | Why                                                                                            |
| ----------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `name`            | `@tenantly/root`                                           | Every package uses the `@tenantly/` scope, so imports show where code comes from.              |
| `private`         | `true`                                                     | `pnpm publish` can never push the root to npm.                                                 |
| `type`            | `module`                                                   | Root `.js` config files use `import`/`export`.                                                 |
| `packageManager`  | `pnpm@11.23.0`                                             | pnpm switches to this exact version, so local machines and CI install identically.             |
| `engines.node`    | `>=24`                                                     | Enforced at install time via `engineStrict`.                                                   |
| `scripts`         | `turbo run <task>`                                         | Thin wrappers. Each package owns its real commands.                                            |
| `devDependencies` | Turborepo, TypeScript, ESLint, Prettier and commit tooling | Root-only tools are pinned here. Shared tool versions come from the catalog where appropriate. |

## `pnpm-workspace.yaml`

| Setting             | Value                  | Why                                                                                                                                                                                      |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages`          | `apps/*`, `packages/*` | Where the workspace packages live.                                                                                                                                                       |
| `catalog`           | grows as needed        | One version per **shared** dependency, used as `"react": "catalog:"`. Upgrading means changing one line. Entries are added when a package first needs them, so nothing unused is listed. |
| `engineStrict`      | `true`                 | The wrong Node version fails at install time, not later with a confusing runtime error.                                                                                                  |
| `minimumReleaseAge` | `1440` (minutes)       | Versions less than a day old aren't installed. Most npm supply-chain attacks are caught and pulled within hours.                                                                         |
| `allowBuilds`       | grows as needed        | Dependencies can't run install scripts unless listed. Install scripts are the most common way malicious packages run code.                                                               |

`esbuild` is explicitly allowed because it is needed by the toolchain. pnpm blocks dependency install scripts by default; review any new package that needs an entry before allowing it.

pnpm settings live in this file, not `.npmrc`, because that's where pnpm 10+ reads them. `.npmrc` is left for registry and auth config.

**Catalog or not?** Use the catalog if more than one package uses the dependency (React, TypeScript, Zod, Tailwind). Pin the exact version where it's used if only one package does (Turbo at the root, Hono in `api`).

## Turborepo (`turbo.json`)

| Key                               | Meaning                                                                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"dependsOn": ["^build"]`         | Run `build` in this package's **dependencies** first. `admin` won't build until `contracts` and `ui` have.                                         |
| `inputs`                          | What turbo hashes to decide if a package changed: `$TURBO_DEFAULT$` (git-tracked files) plus `.env*`, so changing an env value triggers a rebuild. |
| `outputs`                         | Cached and restored on a hit: `dist/`, `.next/` (minus `.next/cache`), `storybook-static/`, `coverage/`.                                           |
| `lint` / `check-types` → `^build` | Apps import types from built packages (`contracts/dist`), so those must be built first.                                                            |
| `dev`                             | `cache: false` (nothing worth caching), `persistent: true` (never exits, so nothing should wait for it).                                           |
| `"ui": "tui"`                     | Interactive terminal view with one pane per task.                                                                                                  |

`lint` and `check-types` deliberately **don't** depend on `^lint` / `^check-types`. Linting a dependency first doesn't change a package's own result, and leaving those out lets turbo run more in parallel.

A `pnpm build` that reports "0 tasks" means no package defines that script yet.

## Shared TypeScript config

`packages/typescript-config` holds presets that every package's `tsconfig.json` extends, so strictness is set once and can't drift between packages. TypeScript itself is in the catalog (`typescript: catalog:`) and also installed at the root, so the editor uses the workspace version.

| Preset         | For                                     | Adds to base                                                                                |
| -------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `base.json`    | Everything (via the others)             | Target ES2024 and the strictness flags below                                                |
| `nextjs.json`  | `apps/web`, `apps/admin`                | DOM libs, `Bundler` resolution, `react-jsx`, `noEmit` (Next.js compiles), the `next` plugin |
| `node.json`    | `apps/api`                              | `NodeNext` resolution, Node types                                                           |
| `library.json` | Packages built to `dist/` (`contracts`) | `NodeNext`, `.d.ts` declarations + declaration maps, source maps                            |

A package uses one like this:

```jsonc
// package.json
"devDependencies": { "@tenantly/typescript-config": "workspace:*", "typescript": "catalog:" }

// tsconfig.json
{ "extends": "@tenantly/typescript-config/nextjs.json", "include": ["src"] }
```

`workspace:*` links the local package instead of looking for it on npm. Paths like `outDir`, `rootDir` and `include` always go in the **package's** tsconfig, never in a preset, because TypeScript resolves them relative to the file that declares them, which would be `packages/typescript-config/`.

**Strictness beyond `strict`:**

| Flag                                 | Catches                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `noUncheckedIndexedAccess`           | `rows[0]` and `record[key]` are typed `T \| undefined`, so a missing item must be handled                    |
| `noPropertyAccessFromIndexSignature` | Dynamic keys must use `obj["key"]`, which makes it visible that the key may not exist                        |
| `noImplicitOverride`                 | Overriding a class method needs the `override` keyword                                                       |
| `noFallthroughCasesInSwitch`         | A `case` that runs into the next one by accident                                                             |
| `verbatimModuleSyntax`               | Type-only imports must say `import type`, so they're removed from the output and never cause runtime imports |
| `isolatedModules`                    | Each file can be compiled alone, which is how Next.js, Vite and esbuild work                                 |

`exactOptionalPropertyTypes` was left off. It's stricter still, but clashes with many libraries' types (React Hook Form, some Zod patterns).

**Why `NodeNext` for libraries and not `Bundler`:** `contracts` is imported by the API, which runs on plain Node with no bundler. `NodeNext` follows Node's real rules (relative imports need a `.js` extension), so anything that compiles also runs. Bundled Next.js apps can use the looser `Bundler` mode.

Check what a preset resolves to with `pnpm exec tsc --showConfig -p <tsconfig>`.

## Linting and formatting

`packages/eslint-config` exports shared flat configs:

- `base.js` applies recommended JavaScript rules and strict, type-aware TypeScript rules.
- `next.js` adds Next.js, React Hooks and browser globals for the web and admin apps.
- `node.js` adds Node globals for the API and Node-based packages.

Each app has an `eslint.config.js` that points the shared config at its own TypeScript project. The root `lint` script runs each package's lint task through Turborepo.

Prettier is configured at the root. `pnpm format` writes formatting changes and `pnpm format:check` verifies them. `pnpm-lock.yaml` is excluded because pnpm owns its formatting.

## Git hooks

Husky runs two checks:

- `pre-commit` runs `lint-staged`; staged source files are formatted with Prettier and app/package JavaScript and TypeScript files are linted with ESLint.
- `commit-msg` runs commitlint with the Conventional Commits preset.

These are fast, staged-file checks. The full workspace lint and type checks remain available as `pnpm lint` and `pnpm check-types`.

## Open questions

- pnpm 12 is out. We're on 11 to match the brief. If we upgrade, earlier is cheaper.
