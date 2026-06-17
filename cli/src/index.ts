import { runInit } from './init'
import { runSync } from './sync'

const VERSION = '0.1.0'
const args = process.argv.slice(2)
const cmd = args[0]

function opt(name: string): string | undefined {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const flag = (name: string) => args.includes(`--${name}`)

function printHelp(): void {
  console.log(`
SprintMagic — keep your board.md in sync with git.

Usage:
  sprintmagic init                 Add the GitHub Action + a starter board.md
  sprintmagic sync                 Update board.md from current git activity
  sprintmagic sync --dry-run       Show what would change, write nothing
  sprintmagic sync --simulate "SM-1 pr; SM-5 merged"   Try it without real git

Options:
  --file <path>     Board file (default: board.md)
  --version         Print version
  --help            Show this help

Signals:  branch → In Progress   ·   pr → Review   ·   merged → Done
`)
}

async function main(): Promise<void> {
  switch (cmd) {
    case 'init':
      await runInit({ file: opt('file') ?? 'board.md' })
      break
    case 'sync':
      await runSync({
        file: opt('file') ?? 'board.md',
        simulate: opt('simulate'),
        dryRun: flag('dry-run'),
      })
      break
    case '--version':
    case '-v':
      console.log(`sprintmagic ${VERSION}`)
      break
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      printHelp()
      break
    default:
      console.error(`Unknown command: ${cmd}\n`)
      printHelp()
      process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
