# CLAUDE.md — Tenantly

A property-management dashboard for Nigerian landlords, built as a portfolio project over
8 weeks. The goal is to learn how to set up a production monorepo from scratch.

## How we work (read first)

- **Guide, don't build.** The developer types the code and runs the commands. Claude explains
  each step and why it's done that way, then reviews what was written. Don't write or edit
  project files unless asked to. CLAUDE.md is the exception (see below).
- **Never commit or push** unless asked first. The developer commits and pushes.
- **Reference project:** `C:\Users\HP\Desktop\e-tigo` is a client project set up by a senior
  dev. Read its `AGENTS.md`, configs and structure to explain patterns and compare approaches.
  **Never copy its code into this repo**, because it belongs to the client.
- **British English** in code, comments, copy and docs (colour, organisation, licence as a noun).
- When explaining, give the reason as well as the step, and the trade-off when there's a
  real alternative. Review against senior/lead standards.

## Product

- **Domain:** properties → units → tenants → leases. Rent due/overdue, a payments ledger,
  maintenance requests.
- **Money:** stored as integer **kobo** (₦1 = 100 kobo). Never floats. Format at the edge.
- **Roles:** `owner`, `property_manager`, `accountant`. RBAC is enforced in the API, and the UI
  only hides what a role can't use.

## Stack (planned; mark each part as built when it lands)

| Area                 | Choice                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| Workspace            | pnpm 11 workspaces + `catalog:` versions, Turborepo, Node 24               |
| Language             | TypeScript, `strict` everywhere                                            |
| `apps/web`           | Next.js marketing site                                                     |
| `apps/admin`         | Next.js App Router dashboard                                               |
| `apps/api`           | Hono + Postgres via Drizzle (Docker locally, Neon hosted)                  |
| `packages/ui`        | Tailwind v4 design system + Storybook (a11y addon)                         |
| `packages/contracts` | Zod schemas shared by api and admin, built to `dist/`                      |
| Shared config        | `packages/typescript-config`, `packages/eslint-config`, Prettier           |
| Quality              | husky + lint-staged + commitlint (Conventional Commits), GitHub Actions CI |
| Auth                 | Email + password; session token in an httpOnly cookie                      |

## Roadmap

1. **Shell:** workspaces, catalog, Turborepo, shared configs, hooks, empty apps
2. **Foundations:** ui package, tokens, dark mode, Storybook + a11y; contracts package
3. **API + database:** Hono, Drizzle schema, migrations, seed, error shape, pagination
4. **Auth + RBAC**, end to end
5. **Core dashboard:** properties, units, tenants (URL-kept lists, drawers, forms)
6. **Money:** leases, rent, payments ledger, overview charts
7. **Extras:** photo uploads, rent reminder emails, live updates
8. **Ship:** unit + Playwright tests, CI with caching, deploy, README, decision log

**Current:** week 2 (UI foundation complete; shared contracts in progress).

## Habits

- One GitHub issue and one branch per feature. PRs go into `dev`, and `dev` merges into `main`.
- Branch names: `type/short-description` (e.g. `feat/workspace-shell`).
- Commits: Conventional Commits, `type(scope): subject`, lowercase imperative subject.
  Scopes are app/package names (`web`, `admin`, `api`, `ui`, `contracts`, …) or none for
  workspace-wide changes.
- Every notable choice gets a short record in `docs/decisions/NNNN-title.md`
  (context → decision → alternatives → consequences).
- README and this file are updated in the same PR as the change they describe.
- `docs/flows/` holds one living doc per flow (git and GitHub, workspace, later auth, payments, …).
  A PR that changes a flow updates its doc, and a new flow gets a new file plus a row in
  `docs/README.md`.

## Commands

| Command             | Does                                       |
| ------------------- | ------------------------------------------ |
| `pnpm install`      | Install workspace dependencies             |
| `pnpm dev`          | Run app development servers                |
| `pnpm build`        | Build all packages and apps with Turborepo |
| `pnpm lint`         | Lint all packages and apps                 |
| `pnpm check-types`  | Type-check all packages and apps           |
| `pnpm test`         | Run tests (none are defined yet)           |
| `pnpm format`       | Format supported files with Prettier       |
| `pnpm format:check` | Check formatting without changing files    |

## Boundaries

- Never commit secrets or `.env*` files (only `.env.example`).
- Never hand-edit `pnpm-lock.yaml`, and never use npm or yarn.
- Never loosen TypeScript strict mode or disable lint rules to make something pass.
- Never delete or skip failing tests. Fix them.
- Never push straight to `dev` or `main`.
