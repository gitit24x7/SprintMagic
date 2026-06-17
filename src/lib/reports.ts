import type { Board, Card } from '../types'
import type { Snapshot } from './history'

// Pure report math. A board gives us status (where things are); these turn it
// into insight over time — completion, a burndown series, and velocity.

const DONE_COL = /done|shipped|complete|completed|merged|closed/i
const BACKLOG_COL = /^backlog$/i

// The sprint's working scope = every column except the Backlog.
export function scopeColumns(board: Board) {
  return board.columns.filter((c) => !BACKLOG_COL.test(c.name))
}

// An issue counts as complete if its checkbox is ticked OR it sits in a
// "Done"-style column.
export function isComplete(card: Card, columnName: string): boolean {
  return card.done || DONE_COL.test(columnName)
}

export interface BoardStats {
  unit: 'points' | 'issues'
  total: number
  done: number
  remaining: number
  pct: number
  totalCount: number
  doneCount: number
  totalPoints: number
  donePoints: number
}

export function boardStats(board: Board): BoardStats {
  let totalCount = 0
  let doneCount = 0
  let totalPoints = 0
  let donePoints = 0
  for (const col of scopeColumns(board)) {
    for (const card of col.cards) {
      totalCount++
      totalPoints += card.points ?? 0
      if (isComplete(card, col.name)) {
        doneCount++
        donePoints += card.points ?? 0
      }
    }
  }
  const unit: 'points' | 'issues' = totalPoints > 0 ? 'points' : 'issues'
  const total = unit === 'points' ? totalPoints : totalCount
  const done = unit === 'points' ? donePoints : doneCount
  return {
    unit,
    total,
    done,
    remaining: Math.max(0, total - done),
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
    totalCount,
    doneCount,
    totalPoints,
    donePoints,
  }
}

// --- dates ------------------------------------------------------------------

const iso = (d: Date) => d.toISOString().slice(0, 10)
export const todayISO = () => iso(new Date())

function eachDay(start: string, end: string): string[] {
  const out: string[] = []
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return out
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) out.push(iso(d))
  return out
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime()
  const db = new Date(b + 'T00:00:00').getTime()
  return Math.round((db - da) / 86400000)
}

export function daysLeft(end?: string): number | null {
  if (!end) return null
  return Math.max(0, daysBetween(todayISO(), end))
}

// --- burndown ---------------------------------------------------------------

export interface BurndownPoint {
  date: string
  ideal: number
  actual: number | null
  isToday: boolean
}

export interface Burndown {
  unit: 'points' | 'issues'
  total: number
  points: BurndownPoint[]
}

export function burndown(board: Board, history: Snapshot[]): Burndown | null {
  if (board.mode !== 'sprint' || !board.start || !board.end) return null
  const days = eachDay(board.start, board.end)
  if (days.length < 2) return null

  const stats = boardStats(board)
  const total = stats.total
  const today = todayISO()

  // Remaining work per date: day 0 anchors at full scope, snapshots fill the
  // middle, today's live value caps it off.
  const remainingBy = new Map<string, number>()
  remainingBy.set(board.start, total)
  for (const s of history) {
    remainingBy.set(s.date, stats.unit === 'points' ? s.remainingPoints : s.remainingCount)
  }
  if (today >= board.start && today <= board.end) {
    remainingBy.set(today, stats.remaining)
  }

  const n = days.length - 1
  const points = days.map((d, i) => ({
    date: d,
    ideal: Math.max(0, total * (1 - i / n)),
    actual: d <= today ? (remainingBy.get(d) ?? null) : null,
    isToday: d === today,
  }))

  return { unit: stats.unit, total, points }
}

// --- velocity ---------------------------------------------------------------

export interface VelocityBar {
  id: string
  title: string
  committed: number
  completed: number
}

export function velocity(boards: { id: string; board: Board }[]): VelocityBar[] {
  return boards
    .filter((b) => b.board.mode === 'sprint')
    .map((b) => {
      const s = boardStats(b.board)
      return {
        id: b.id,
        title: b.board.title,
        committed: s.totalPoints,
        completed: s.donePoints,
      }
    })
}

// --- status distribution ----------------------------------------------------

export interface StatusBar {
  name: string
  count: number
  points: number
}

export function statusDistribution(board: Board): StatusBar[] {
  return scopeColumns(board).map((c) => ({
    name: c.name,
    count: c.cards.length,
    points: c.cards.reduce((n, x) => n + (x.points ?? 0), 0),
  }))
}
