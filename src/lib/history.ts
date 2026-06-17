import type { Board } from '../types'
import { boardStats } from './reports'

// A burndown needs day-by-day history of remaining work, which a snapshot of
// the board can't give us. So we quietly record one snapshot per sprint board
// per day — the real burndown then builds itself as the sprint progresses.

export interface Snapshot {
  date: string // YYYY-MM-DD
  remainingPoints: number
  remainingCount: number
  totalPoints: number
  doneCount: number
}

type HistoryStore = Record<string, Snapshot[]> // boardId -> snapshots

const KEY = 'sprintmagic.history.v1'

function load(): HistoryStore {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as HistoryStore
  } catch {
    return {}
  }
}

function save(store: HistoryStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* storage full — non-fatal */
  }
}

export function getBoardHistory(boardId: string): Snapshot[] {
  return load()[boardId] ?? []
}

// Upsert today's snapshot for a sprint board (overwrites today's entry so it
// always reflects the latest state of the day).
export function recordSnapshot(boardId: string, board: Board): void {
  if (board.mode !== 'sprint' || !board.start || !board.end) return
  const stats = boardStats(board)
  const date = new Date().toISOString().slice(0, 10)

  const store = load()
  const existing = (store[boardId] ?? []).filter((s) => s.date !== date)
  existing.push({
    date,
    remainingPoints: Math.max(0, stats.totalPoints - stats.donePoints),
    remainingCount: Math.max(0, stats.totalCount - stats.doneCount),
    totalPoints: stats.totalPoints,
    doneCount: stats.doneCount,
  })
  existing.sort((a, b) => a.date.localeCompare(b.date))
  store[boardId] = existing
  save(store)
}
