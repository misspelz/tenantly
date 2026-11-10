# Tenantly

A property-management dashboard for Nigerian landlords: properties, units, tenants, leases, rent tracking and a payments ledger, in one place.

> **Status:** in progress, week 1 of 8. The apps are scaffolds; product features are not implemented yet. See the [roadmap](#roadmap).

## What it does

- **Portfolio:** properties and their units, with occupancy at a glance
- **Tenants and leases:** who lives where, lease terms, renewals
- **Rent:** what's due, what's overdue, and from whom
- **Payments ledger:** every payment recorded in kobo (₦1 = 100 kobo), never floating-point naira
- **Maintenance:** requests logged against a unit and tracked to completion
- **Roles:** owner, property manager and accountant, each seeing and doing only what their role allows

## Stack

| Area           | Choice                                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Monorepo       | pnpm workspaces with a version catalog, Turborepo                                  |
| Language       | TypeScript (strict)                                                                |
| Marketing site | Next.js (`apps/web`)                                                               |
| Dashboard      | Next.js App Router (`apps/admin`)                                                  |
| API            | Hono, Drizzle ORM, Postgres (Docker locally, Neon hosted) (`apps/api`)             |
| Design system  | Tailwind CSS v4, Storybook with accessibility checks (`packages/ui`)               |
| Shared schemas | Zod, used by both the API and the dashboard (`packages/contracts`)                 |
| Auth           | Email and password; session in an httpOnly cookie; role checks enforced in the API |
| Quality        | ESLint, Prettier, husky, commitlint, GitHub Actions                                |

## Repository layout

```txt
apps/
  web/        marketing site
  admin/      landlord dashboard
  api/        REST API
packages/
  ui/                  design system and Storybook
  contracts/           Zod schemas shared by api and admin
  typescript-config/   shared tsconfig presets
  eslint-config/       shared lint rules
docs/
  flows/      how each part of the repo works, and why
  decisions/  decision records
```

Most of this is still to be built. The roadmap shows when each part arrives.

## Getting started

Requires **Node 24+** and **pnpm 11** (the exact version is pinned in `package.json`).

```sh
git clone https://github.com/misspelz/tenantly.git
cd tenantly
pnpm install
pnpm build
```

| Command             | Does                                                |
| ------------------- | --------------------------------------------------- |
| `pnpm dev`          | Run every app in development                        |
| `pnpm build`        | Build everything, in dependency order, with caching |
| `pnpm lint`         | Lint every package                                  |
| `pnpm check-types`  | Type-check every package                            |
| `pnpm test`         | Run tests                                           |
| `pnpm format`       | Format supported files with Prettier                |
| `pnpm format:check` | Check formatting without changing files             |

## Roadmap

| Week | Focus                                                               | Status      |
| ---- | ------------------------------------------------------------------- | ----------- |
| 1    | Monorepo shell: workspaces, Turborepo, shared configs, git hooks    | In progress |
| 2    | Design system, tokens, dark mode, Storybook; shared schemas         |             |
| 3    | API and database: schema, migrations, seed data, errors, pagination |             |
| 4    | Authentication and role-based access, end to end                    |             |
| 5    | Dashboard: properties, units, tenants                               |             |
| 6    | Money: leases, rent, payments ledger, overview charts               |             |
| 7    | Photo uploads, rent reminder emails, live updates                   |             |
| 8    | Tests, CI, deployment                                               |             |

## Docs

- [How the repo works](docs/README.md): one doc per flow (git, workspace, and more as they're built)
- Decision records: [`docs/decisions/`](docs/decisions/) (coming in week 1)

## Contributing

This is a personal portfolio project, so outside contributions aren't being taken. Issues and suggestions are welcome.
