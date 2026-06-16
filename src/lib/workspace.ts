import type { Board } from '../types'
import { parseMarkdown } from './parser'
import { uid } from './boardActions'
import { SAMPLE_SPRINT } from './sample'

// A workspace is just several boards kept in the browser, plus which one is
// active. Each board still round-trips to its own Markdown — the workspace is
// only the thin wrapper that lets you keep more than one.

export interface StoredBoard {
  id: string
  board: Board
}

export interface Workspace {
  boards: StoredBoard[]
  activeId: string
}

const KEY = 'sprintmagic.workspace.v1'

export function newBoardId(): string {
  return uid('board')
}

const BLANK_BOARD_MD = `---
type: kanban
title: "Untitled board"
phases: [To Do, In Progress, Done]
---
`

export function blankBoard(): Board {
  return parseMarkdown(BLANK_BOARD_MD).board
}

export function createInitialWorkspace(): Workspace {
  const id = newBoardId()
  return { boards: [{ id, board: parseMarkdown(SAMPLE_SPRINT).board }], activeId: id }
}

export function loadWorkspace(): Workspace | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const ws = JSON.parse(raw) as Workspace
    if (!ws?.boards?.length) return null
    // Repair a dangling activeId.
    if (!ws.boards.some((b) => b.id === ws.activeId)) ws.activeId = ws.boards[0].id
    return ws
  } catch {
    return null
  }
}

export function saveWorkspace(ws: Workspace): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ws))
  } catch {
    /* storage full/unavailable — non-fatal */
  }
}
