import type { Board, Column } from '../types'
import { moveCard } from './boardActions'

// ---------------------------------------------------------------------------
// Git-sync engine (Stage A)
// ---------------------------------------------------------------------------
// The whole feature in one pure function: given the board and a list of git
// signals (one per issue key), advance each issue to the column that matches
// its furthest git status. Forward-only — git never drags an issue backward,
// so a human can still pull something back without the bot fighting them.
//
// This exact function is reused verbatim by the future GitHub Action; only the
// source of `signals` changes (a mock panel now, real git/PR state later).
// ---------------------------------------------------------------------------

export type SyncStatus = 'in_progress' | 'in_review' | 'done'

export interface GitSignal {
  key: string
  status: SyncStatus
}

export interface SyncChange {
  key: string
  title: string
  from: string
  to: string
}

const RANK: Record<SyncStatus, number> = {
  in_progress: 1,
  in_review: 2,
  done: 3,
}

// Map a semantic status to one of the board's actual columns by name.
const NAME_PATTERNS: Record<SyncStatus, RegExp> = {
  in_progress: /in[\s_-]?progress|doing|working|wip|started/i,
  in_review: /review|qa|testing/i,
  done: /done|shipped|complete|merged|closed/i,
}

function resolveColumn(board: Board, status: SyncStatus): Column | undefined {
  const direct = board.columns.find((c) => NAME_PATTERNS[status].test(c.name))
  if (direct) return direct
  // Fallbacks for boards missing a column (e.g. Kanban with no "Review").
  if (status === 'in_review') return resolveColumn(board, 'in_progress')
  if (status === 'done') return board.columns[board.columns.length - 1]
  return undefined
}

// Friendly git words → a semantic status, so the mock panel accepts natural
// input like "branch", "pr", "merged" as well as the canonical names.
export function wordToStatus(word: string): SyncStatus | null {
  const w = word.toLowerCase().replace(/[\s_-]/g, '')
  if (/^(inprogress|branch|wip|doing|started|push)$/.test(w)) return 'in_progress'
  if (/^(inreview|review|pr|openpr|open|ready)$/.test(w)) return 'in_review'
  if (/^(done|merged|closed|shipped|complete)$/.test(w)) return 'done'
  return null
}

// Parse the mock panel's text ("SM-5 pr") into signals.
export function parseSignals(text: string): GitSignal[] {
  const signals: GitSignal[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim() // strip trailing comments
    if (!line) continue
    const m = line.match(/^([A-Za-z][A-Za-z0-9]*-\d+)\s+(\S+)/)
    if (!m) continue
    const status = wordToStatus(m[2])
    if (status) signals.push({ key: m[1].toUpperCase(), status })
  }
  return signals
}

export function syncIssuesWithGit(
  board: Board,
  signals: GitSignal[],
): { board: Board; changes: SyncChange[] } {
  // Collapse to the furthest status per key (merged beats PR beats branch).
  const byKey = new Map<string, SyncStatus>()
  for (const s of signals) {
    const prev = byKey.get(s.key)
    if (!prev || RANK[s.status] > RANK[prev]) byKey.set(s.key, s.status)
  }

  let result = board
  const changes: SyncChange[] = []

  for (const [key, status] of byKey) {
    const fromIdx = result.columns.findIndex((c) =>
      c.cards.some((cd) => cd.key === key),
    )
    if (fromIdx < 0) continue // unknown / untracked key — leave it

    const fromCol = result.columns[fromIdx]
    const card = fromCol.cards.find((cd) => cd.key === key)!
    const target = resolveColumn(result, status)
    if (!target) continue

    const toIdx = result.columns.findIndex((c) => c.id === target.id)
    if (toIdx <= fromIdx) continue // forward-only

    result = moveCard(result, card.id, target.id) // append to target
    changes.push({ key, title: card.title, from: fromCol.name, to: target.name })
  }

  return { board: result, changes }
}

// Pre-fill the panel with a realistic scenario built from the user's own
// issues, so "Run sync" immediately moves cards across the board.
export function suggestSignals(board: Board): string {
  const lines: string[] = []
  const lastIdx = board.columns.length - 1

  const pick = (status: SyncStatus, word: string, comment: string) => {
    const target = resolveColumn(board, status)
    if (!target) return
    const targetIdx = board.columns.findIndex((c) => c.id === target.id)
    // find an issue sitting in a column *before* the target, with a key
    for (let i = 0; i < targetIdx; i++) {
      const issue = board.columns[i].cards.find((c) => c.key)
      if (issue && !lines.some((l) => l.startsWith(issue.key!))) {
        lines.push(`${issue.key} ${word}`.padEnd(16) + `# ${comment}`)
        return
      }
    }
  }

  pick('in_progress', 'branch', 'started work → In Progress')
  pick('in_review', 'pr', 'opened a PR → Review')
  if (lastIdx > 0) pick('done', 'merged', 'PR merged → Done')

  return lines.length
    ? lines.join('\n')
    : '# e.g.  SM-1 branch   |   SM-2 pr   |   SM-3 merged'
}
