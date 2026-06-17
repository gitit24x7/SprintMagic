import { readFile, writeFile } from 'node:fs/promises'
import { parseMarkdown } from '../../src/lib/parser'
import { boardToMarkdown } from '../../src/lib/serialize'
import { parseSignals, syncIssuesWithGit } from '../../src/lib/gitSync'
import { gatherSignals } from './signals'

interface SyncOptions {
  file: string
  simulate?: string
  dryRun?: boolean
}

export async function runSync(opts: SyncOptions): Promise<void> {
  let text: string
  try {
    text = await readFile(opts.file, 'utf8')
  } catch {
    console.error(
      `✗ Couldn't read "${opts.file}". Run \`sprintmagic init\` first, or pass --file.`,
    )
    process.exit(1)
  }

  const { board } = parseMarkdown(text)

  // --simulate "SM-1 pr; SM-5 merged" lets you try it without real git.
  const signals = opts.simulate
    ? parseSignals(opts.simulate.replace(/\\n|;/g, '\n'))
    : await gatherSignals()

  const { board: next, changes } = syncIssuesWithGit(board, signals)

  if (changes.length === 0) {
    console.log('✓ Board already up to date with git.')
    return
  }

  for (const c of changes) {
    console.log(`  ${c.key.padEnd(8)} ${c.from}  →  ${c.to}`)
  }

  if (opts.dryRun) {
    console.log(`\n(dry run) ${changes.length} change(s) — nothing written.`)
    return
  }

  await writeFile(opts.file, boardToMarkdown(next))
  console.log(`\n✓ Updated ${opts.file} — ${changes.length} issue(s) moved.`)
}
