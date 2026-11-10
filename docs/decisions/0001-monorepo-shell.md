# 0001: Monorepo shell

## Context

The project needs a maintainable foundation for its web app, admin dashboard, API and shared packages before product features are added.

## Decision

Use pnpm 11 workspaces with a shared version catalog, Turborepo for task orchestration, and separate `apps/` and `packages/` directories. Keep common TypeScript and ESLint configuration in dedicated workspace packages, and use root-level Prettier and Git hooks for consistent quality checks.

## Alternatives

- Keep all projects and configuration in a single package: simpler initially, but boundaries and shared configuration would become harder to establish as the project grows.
- Use a different workspace manager or task runner: viable, but inconsistent with the project requirements and planned tooling.

## Consequences

- Apps and packages can be built and checked independently while sharing pinned tooling and configuration.
- Changes to shared packages can be ordered before dependent tasks by Turborepo.
- Workspace tools and hooks add initial setup, and dependency install scripts must be explicitly reviewed.
