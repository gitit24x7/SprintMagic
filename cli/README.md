# sprintmagic

Keep your [SprintMagic](https://sprintmagic.app) board in sync with your git activity.
Your board is a plain `board.md` file in your repo — and issues move themselves as
branches and pull requests happen. No accounts, no servers, nothing leaves your repo.

```
branch  →  In Progress      pr  →  Review      merged  →  Done
```

## Quick start

```bash
# In your repo:
npx sprintmagic init
```

That adds two things to your project:

- `.github/workflows/sprintmagic.yml` — a GitHub Action that runs the sync
- `board.md` — a starter board (skip if you already have one)

Then reference an issue key in your branch or PR:

```bash
git switch -c feat/SM-3-login    # SM-3 → In Progress
# open a PR                       → SM-3 moves to Review
# merge it                        → SM-3 moves to Done
```

The Action commits the updated `board.md` back to your repo, so the change shows
up right in the diff. View the board anytime at https://sprintmagic.app (or open
`board.md` in any editor).

## Commands

| Command | What it does |
| --- | --- |
| `sprintmagic init` | Scaffold the GitHub Action + a starter `board.md` |
| `sprintmagic sync` | Update `board.md` from current git activity |
| `sprintmagic sync --dry-run` | Show what would change, write nothing |
| `sprintmagic sync --simulate "SM-1 pr; SM-5 merged"` | Try it without real git |

Options: `--file <path>` (default `board.md`), `--version`, `--help`.

## How it works

`sync` reads `board.md`, looks at your git activity (open PRs → Review, merged PRs
→ Done, branches → In Progress), and moves each issue to the matching column. It
only ever moves issues **forward**, so anything you dragged back by hand stays put.

Inside a GitHub Action it uses the API for the full picture; run locally it reads
your git branches. Issues are matched by their key (e.g. `SM-3`) appearing in the
branch name or PR title.

## License

MIT
