# Docs

Living docs, one per flow. Each explains how something works in this repo and why it was set up that way.

**Rule:** when a PR changes a flow, it updates that flow's doc in the same PR. A new flow gets a new file here and a row in the table.

| Flow                                        | Covers                                                                            | Last updated |
| ------------------------------------------- | --------------------------------------------------------------------------------- | ------------ |
| [Git and GitHub](flows/git-and-github.md)   | Repo dotfiles, branches, protection rules, merge methods, commits, issues and PRs | Week 1       |
| [Workspace and tooling](flows/workspace.md) | pnpm workspace and catalog, Turborepo tasks, shared configs, hooks, UI foundation | Week 2       |

Planned as we reach them: contracts, API and database, auth and RBAC, payments ledger, deploy.

Decision records (why we chose X over Y) live in [`decisions/`](decisions/).

| Decision                                                         | Summary                                                   |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| [0001: Monorepo shell](decisions/0001-monorepo-shell.md)         | Workspace, task runner, app and package boundaries        |
| [0002: TypeScript version](decisions/0002-typescript-version.md) | TypeScript 6 compatibility with typescript-eslint         |
| [0003: UI theme tokens](decisions/0003-ui-theme-tokens.md)       | Semantic slate and emerald tokens with `data-mode` themes |
