# 0002: TypeScript version

## Context

The workspace uses strict, type-aware ESLint rules through `typescript-eslint`. The TypeScript version must be supported by that parser and its rules.

## Decision

Use TypeScript 6.0.3 in the shared pnpm catalog. This stays below TypeScript 6.1, the supported upper bound for the selected `typescript-eslint` release.

## Alternatives

- Use TypeScript 7: rejected because the selected `typescript-eslint` version does not support it.
- Pin TypeScript separately in each package: rejected because it permits version drift across the workspace.

## Consequences

- Apps and packages use one compatible TypeScript version.
- Revisit this pin when `typescript-eslint` adds support for a later TypeScript release.
