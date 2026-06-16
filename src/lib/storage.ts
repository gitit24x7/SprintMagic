import type { Board } from '../types'

const KEY = 'sprintmagic.board.v2'

export function loadBoard(): Board | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const board = JSON.parse(raw) as Board
    if (!board || !Array.isArray(board.columns)) return null
    return board
  } catch {
    return null
  }
}

export function saveBoard(board: Board): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(board))
  } catch {
    // storage full or unavailable — non-fatal for an MVP
  }
}

export function clearBoard(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
