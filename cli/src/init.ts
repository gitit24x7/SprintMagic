import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const WORKFLOW = `name: SprintMagic sync

# Move issues on your board automatically as branches and PRs happen.
on:
  push:
  pull_request:
    types: [opened, reopened, synchronize, closed]

permissions:
  contents: write
  pull-requests: read

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Sync board from git
        run: npx sprintmagic@latest sync --file board.md
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      - name: Commit the board if it changed
        run: |
          if [ -n "$(git status --porcelain board.md)" ]; then
            git config user.name "sprintmagic[bot]"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git add board.md
            git commit -m "chore: sync board [skip ci]"
            git push
          fi
`

const STARTER_BOARD = `---
type: kanban
title: "My Board"
key: SM
phases: [Backlog, In Progress, Review, Done]
---

## Backlog
- [ ] Set up the project

## In Progress

## Review

## Done
`

interface InitOptions {
  file: string
}

export async function runInit(opts: InitOptions): Promise<void> {
  const workflowDir = path.join('.github', 'workflows')
  const workflowPath = path.join(workflowDir, 'sprintmagic.yml')

  await mkdir(workflowDir, { recursive: true })

  if (existsSync(workflowPath)) {
    console.log(`• ${workflowPath} already exists — left as-is.`)
  } else {
    await writeFile(workflowPath, WORKFLOW)
    console.log(`✓ Created ${workflowPath}`)
  }

  if (existsSync(opts.file)) {
    console.log(`• ${opts.file} already exists — left as-is.`)
  } else {
    await writeFile(opts.file, STARTER_BOARD)
    console.log(`✓ Created ${opts.file}`)
  }

  console.log(
    [
      '',
      'Done! Your board now updates itself from git.',
      '',
      'Next steps:',
      '  1. Edit board.md (or design it at https://sprintmagic.app and export).',
      '  2. Reference an issue key in your branch or PR, e.g.  feat/SM-3-login',
      '  3. Commit & push — open a PR and watch the card move to Review,',
      '     merge it and watch it move to Done.',
      '',
      'Try it locally first:  npx sprintmagic sync --simulate "SM-1 pr" --dry-run',
      '',
    ].join('\n'),
  )
}
