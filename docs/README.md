# Docs

Living docs, one per flow. Each explains how something works in this repo and why it was set up that way.

**Rule:** when a PR changes a flow, it updates that flow's doc in the same PR. A new flow gets a new file here and a row in the table.

| Flow | Covers | Last updated |
| ---- | ------ | ------------ |
| [Git and GitHub](flows/git-and-github.md) | Repo dotfiles, branches, protection rules, merge methods, commits, issues and PRs | Week 1 |
| [Workspace and tooling](flows/workspace.md) | pnpm workspace and catalog, Turborepo tasks, shared configs, hooks | Week 1 |

Planned as we reach them: design system and Storybook, contracts, API and database, auth and RBAC, payments ledger, deploy.

Decision records (why we chose X over Y) live in [`decisions/`](decisions/).
