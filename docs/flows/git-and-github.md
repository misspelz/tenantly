# Git and GitHub

How code moves from a local branch to `main`, and the repo settings that enforce it.

## The flow

1. Open an **issue** with a checklist and a *Done when* line.
2. Branch from `dev`: `git switch dev && git pull && git switch -c type/short-description`
   (e.g. `chore/workspace-shell`, `feat/tenant-list`).
3. Commit with Conventional Commits: `type(scope): subject`, with a lowercase, imperative subject.
   Scope is the app or package name (`admin`, `api`, `ui`, `contracts`, …), or none for workspace-wide changes.
4. Push the branch and open a PR into **`dev`** with `Closes #<issue>` in the description.
5. **Squash-merge** into `dev`.
6. To release, open a PR from `dev` → `main` and **merge-commit** it (never squash, see below).

| Commit type | Use for |
| ----------- | ------- |
| `feat` / `fix` | User-facing features and bug fixes |
| `build` | Build system and dependencies (pnpm, turbo, package.json) |
| `ci` | GitHub Actions |
| `docs` | Docs only |
| `refactor` / `perf` / `test` / `style` | As named |
| `chore` | Housekeeping that fits nothing else |

## Repo dotfiles

| File | Contents | Why |
| ---- | -------- | --- |
| `.gitattributes` | `* text=auto eol=lf` | Git on Windows converts files to CRLF on checkout. Prettier would then flag every file, and Linux CI would disagree with local. This keeps every file LF, in the repo and on disk. |
| `.editorconfig` | utf-8, LF, 2-space indent, final newline, trim trailing whitespace (off for `.md`) | Every editor formats new edits the same way. Markdown keeps trailing whitespace because two trailing spaces are a line break. |
| `.nvmrc` | `24` | Read by version managers and `actions/setup-node`. Major version only, so Node patch releases don't need a commit. |
| `.gitignore` | dependencies, build output, tool caches, `.env*` (except `.env.example`), logs, OS files, most of `.vscode/` | Keeps generated files and secrets out of git. `.vscode/settings.json` and `extensions.json` are kept so shared editor setup is committed. |
| `CLAUDE.md` | Working agreement, stack, roadmap, habits, boundaries | Read by Claude Code at the start of every session. |

`.editorconfig` alone isn't enough: it controls how an editor writes files, not what git does on checkout. `.gitattributes` covers the checkout side.

## Branches

| Branch | Role | Protected |
| ------ | ---- | --------- |
| `main` | What's released | Yes |
| `dev` | Integration branch, and GitHub's **default branch** | Yes |
| `type/…` | One per issue, short-lived | No |

`dev` is the default branch, so new PRs and clones target it automatically. The very first commit (`chore: initialise repository`) went straight onto `main`, because there was nothing to branch from yet. It's the only direct commit.

## Protection (ruleset `protect-main-and-dev`)

Enforcement **Active**, no bypass list, targets `main` and `dev` by pattern. ("Default branch" as a target would only cover `dev`.)

| Rule | Setting | Why |
| ---- | ------- | --- |
| Restrict deletions | On | The long-lived branches can't be deleted. |
| Block force pushes | On | Their history can't be rewritten. |
| Require a pull request | On, **0 approvals** | Solo developer: GitHub doesn't let you approve your own PR, so 1 approval would block every merge. |
| Require conversation resolution | On | Review comments must be resolved before merging. |
| Allowed merge methods | Merge, Squash (no Rebase) | One method per PR direction, below. |
| Require status checks | **Off for now** | Turned on in week 8, once CI has checks to require. |

**Why two merge methods:**
- feature → `dev`: **squash**. One clean commit per feature, titled with the PR's Conventional Commit title. The "wip" commits disappear.
- `dev` → `main`: **merge commit**. A squash would create a commit on `main` that `dev` doesn't have, so the branches drift apart and every later release PR would show old changes or conflict.

## Secret Protection

Secret Protection and **Push protection** are on. A push containing a known secret format (database URLs, API keys) is rejected before it reaches GitHub. The repo is public, and deleting a leaked key in a later commit doesn't remove it from history, so blocking the push is the only real fix. `.env*` is also git-ignored.

## Setting up a new repo like this

1. Create the GitHub repo **empty**: no README, `.gitignore` or licence. Otherwise GitHub makes its own first commit, and the first push is rejected because the histories don't match.
2. Locally: `git init -b main`, add the dotfiles, then make the first commit.
3. `git switch -c dev`
4. `git remote add origin https://github.com/<user>/<repo>.git`
5. `git push -u origin main` and `git push -u origin dev`. `-u` sets tracking, so a plain `git push` works afterwards.
6. On GitHub: default branch → `dev`, add the ruleset, turn on Secret Protection.

## Troubleshooting

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| `git init -b main` → `re-init: ignored --initial-branch` | The folder was already a repo | Check `git symbolic-ref HEAD`. Here it was already `main`. |
| `error: src refspec main does not match any` | Pushing before the first commit. A branch only exists once it has a commit. | Commit, then push |
| Push fails with no remote, after the refspec error is fixed | `origin` was never added. The refspec error appeared first and hid it. | `git remote add origin …` |
| `git branch -u origin/main` → upstream does not exist | That branch was never pushed | `git push -u origin main` |
| GitHub picked an unexpected default branch | It uses the first branch pushed | Settings → General → Default branch |

`git ls-remote --heads origin` shows which branches actually exist on GitHub.
