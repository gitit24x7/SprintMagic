import type { Board, Card, Column, Priority, SubTask } from '../types'

export const uid = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`

// Next free issue key for the board's prefix, e.g. "SM-7".
export function nextKey(board: Board): string {
  const prefix = board.keyPrefix || 'SM'
  const re = new RegExp(`^${prefix}-(\\d+)$`)
  let max = 0
  for (const col of board.columns) {
    for (const card of col.cards) {
      const m = card.key?.match(re)
      if (m) max = Math.max(max, Number(m[1]))
    }
  }
  return `${prefix}-${max + 1}`
}

function mapColumns(
  board: Board,
  fn: (col: Column) => Column,
): Board {
  return { ...board, columns: board.columns.map(fn) }
}

function mapCardInColumn(col: Column, cardId: string, fn: (c: Card) => Card): Column {
  return { ...col, cards: col.cards.map((c) => (c.id === cardId ? fn(c) : c)) }
}

export function updateCard(
  board: Board,
  cardId: string,
  patch: Partial<Card>,
): Board {
  return mapColumns(board, (col) =>
    mapCardInColumn(col, cardId, (c) => ({ ...c, ...patch })),
  )
}

export function toggleCardDone(board: Board, cardId: string): Board {
  return mapColumns(board, (col) =>
    mapCardInColumn(col, cardId, (c) => ({ ...c, done: !c.done })),
  )
}

export function deleteCard(board: Board, cardId: string): Board {
  return mapColumns(board, (col) => ({
    ...col,
    cards: col.cards.filter((c) => c.id !== cardId),
  }))
}

export function addCard(board: Board, columnId: string, title: string): Board {
  const card: Card = {
    id: uid('card'),
    key: nextKey(board),
    type: 'story',
    title: title.trim() || 'New task',
    done: false,
    assignees: [],
    tags: [],
    subtasks: [],
  }
  return mapColumns(board, (col) =>
    col.id === columnId ? { ...col, cards: [...col.cards, card] } : col,
  )
}

export function setPriority(
  board: Board,
  cardId: string,
  priority?: Priority,
): Board {
  return updateCard(board, cardId, { priority })
}

// --- sub-tasks --------------------------------------------------------------

export function addSubtask(board: Board, cardId: string, title: string): Board {
  const sub: SubTask = { id: uid('sub'), title: title.trim(), done: false }
  return mapColumns(board, (col) =>
    mapCardInColumn(col, cardId, (c) => ({
      ...c,
      subtasks: [...c.subtasks, sub],
    })),
  )
}

export function toggleSubtask(
  board: Board,
  cardId: string,
  subId: string,
): Board {
  return mapColumns(board, (col) =>
    mapCardInColumn(col, cardId, (c) => ({
      ...c,
      subtasks: c.subtasks.map((s) =>
        s.id === subId ? { ...s, done: !s.done } : s,
      ),
    })),
  )
}

export function deleteSubtask(
  board: Board,
  cardId: string,
  subId: string,
): Board {
  return mapColumns(board, (col) =>
    mapCardInColumn(col, cardId, (c) => ({
      ...c,
      subtasks: c.subtasks.filter((s) => s.id !== subId),
    })),
  )
}

// --- columns ----------------------------------------------------------------

export function addColumn(board: Board, name: string): Board {
  const col: Column = { id: uid('col'), name: name.trim() || 'New column', cards: [] }
  return { ...board, columns: [...board.columns, col] }
}

export function renameColumn(board: Board, columnId: string, name: string): Board {
  return mapColumns(board, (col) =>
    col.id === columnId ? { ...col, name } : col,
  )
}

export function deleteColumn(board: Board, columnId: string): Board {
  return { ...board, columns: board.columns.filter((c) => c.id !== columnId) }
}

// --- drag + drop ------------------------------------------------------------

export function findCardColumn(board: Board, cardId: string): Column | undefined {
  return board.columns.find((col) => col.cards.some((c) => c.id === cardId))
}

/**
 * Move `cardId` so it lands in `toColumnId` at `toIndex`. Used by the dnd-kit
 * handlers. If toIndex is omitted, appends to the end of the target column.
 */
export function moveCard(
  board: Board,
  cardId: string,
  toColumnId: string,
  toIndex?: number,
): Board {
  const from = findCardColumn(board, cardId)
  if (!from) return board
  const card = from.cards.find((c) => c.id === cardId)
  if (!card) return board

  return {
    ...board,
    columns: board.columns.map((col) => {
      if (col.id === from.id && col.id === toColumnId) {
        // reorder within the same column
        const without = col.cards.filter((c) => c.id !== cardId)
        const idx = toIndex ?? without.length
        without.splice(idx, 0, card)
        return { ...col, cards: without }
      }
      if (col.id === from.id) {
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
      }
      if (col.id === toColumnId) {
        const next = [...col.cards]
        const idx = toIndex ?? next.length
        next.splice(idx, 0, card)
        return { ...col, cards: next }
      }
      return col
    }),
  }
}
