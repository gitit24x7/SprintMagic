import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import type { Board } from '../types'
import { findCardColumn } from '../lib/boardActions'
import { cardMatches } from '../lib/filter'
import { formatRange } from '../lib/ui'
import { ColumnView } from './ColumnView'
import { CardBody } from './CardItem'
import { ListView } from './ListView'
import { EpicSwimlanes } from './EpicSwimlanes'
import { Reports } from './Reports'
import { BacklogDrawerDnd, BacklogDrawerStatic } from './BacklogDrawer'

type GroupBy = 'status' | 'list' | 'epic' | 'reports'

interface Props {
  board: Board
  boardId: string
  query: string
  onAddCard: (columnId: string, title: string) => void
  onToggleDone: (cardId: string) => void
  onOpenCard: (cardId: string) => void
  onApplyMove: (cardId: string, toColumnId: string, toIndex: number) => void
  onAddColumn: (name: string) => void
  onOpenGitSync: () => void
  onRenameBoard: (title: string) => void
}

export function BoardView({
  board,
  boardId,
  query,
  onAddCard,
  onToggleDone,
  onOpenCard,
  onApplyMove,
  onAddColumn,
  onOpenGitSync,
  onRenameBoard,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newCol, setNewCol] = useState('')
  const [addingCol, setAddingCol] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [groupBy, setGroupBy] = useState<GroupBy>('status')
  const [backlogOpen, setBacklogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const backlogCol = board.columns.find((c) => /^backlog$/i.test(c.name))
  const activeColumns = backlogCol
    ? board.columns.filter((c) => c.id !== backlogCol.id)
    : board.columns

  const activeCards = activeColumns.flatMap((c) => c.cards)
  const total = activeCards.length
  const done = activeCards.filter((c) => c.done).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const totalPts = activeCards.reduce((n, c) => n + (c.points ?? 0), 0)
  const donePts = activeCards
    .filter((c) => c.done)
    .reduce((n, c) => n + (c.points ?? 0), 0)
  const matchCount = query
    ? board.columns.flatMap((c) => c.cards).filter((c) => cardMatches(c, query)).length
    : 0
  const range = formatRange(board.start, board.end)
  const isSprint = board.mode === 'sprint'
  const activeCard = activeId
    ? board.columns.flatMap((c) => c.cards).find((c) => c.id === activeId)
    : undefined

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const columnOf = (id: string) =>
    board.columns.find((c) => c.id === id) ?? findCardColumn(board, id)

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const applyTo = (activeIdStr: string, overId: string) => {
    const activeCol = findCardColumn(board, activeIdStr)
    const overCol = columnOf(overId)
    if (!activeCol || !overCol) return
    const overCardIdx = overCol.cards.findIndex((c) => c.id === overId)
    const index = overCardIdx >= 0 ? overCardIdx : overCol.cards.length
    onApplyMove(activeIdStr, overCol.id, index)
  }

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const activeCol = findCardColumn(board, String(active.id))
    const overCol = columnOf(String(over.id))
    if (!activeCol || !overCol || activeCol.id === overCol.id) return
    applyTo(String(active.id), String(over.id))
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (over) applyTo(String(active.id), String(over.id))
  }

  const commitCol = () => {
    if (newCol.trim()) onAddColumn(newCol)
    setNewCol('')
    setAddingCol(false)
  }

  const backlogProps = backlogCol && {
    column: backlogCol,
    mode: board.mode,
    query,
    onAddCard: (title: string) => onAddCard(backlogCol.id, title),
    onToggleDone,
    onOpenCard,
    onClose: () => setBacklogOpen(false),
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-4 pt-8 border-b border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-white z-10">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                isSprint ? 'bg-orange-50 text-orange-600' : 'bg-sky-50 text-sky-600'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isSprint ? 'bg-orange-500' : 'bg-sky-500'
                }`}
              />
              {isSprint ? 'Sprint' : 'Kanban'}
            </span>
            {isSprint && range && (
              <span className="text-[12.5px] font-medium text-ink-soft">{range}</span>
            )}
          </div>
          {editingTitle ? (
            <input
              autoFocus
              defaultValue={board.title}
              onBlur={(e) => {
                onRenameBoard(e.target.value.trim() || board.title)
                setEditingTitle(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRenameBoard(e.currentTarget.value.trim() || board.title)
                  setEditingTitle(false)
                }
                if (e.key === 'Escape') setEditingTitle(false)
              }}
              className="w-full max-w-md border-b border-orange-300 bg-transparent font-display text-2xl font-semibold tracking-tight text-ink outline-none"
            />
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              title="Click to rename"
              className="cursor-text rounded font-display text-2xl font-semibold tracking-tight text-ink transition hover:opacity-60"
            >
              {board.title}
            </h1>
          )}
        </div>

        {isSprint && total > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[13px] font-semibold text-ink">
                {done} of {total} done
              </span>
              <span className="text-[11px] font-medium text-stone-500">
                {totalPts > 0 ? `${donePts}/${totalPts} pts` : `${pct}% complete`}
              </span>
            </div>
            <div className="relative h-12 w-12 flex-none">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-stone-100"
                  strokeWidth="4"
                  fill="none"
                />
                <motion.circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-orange-500"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  style={{ strokeDasharray: circumference }}
                  transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-6 pb-3 pt-3">
        <div className="flex rounded-lg bg-zinc-100 p-0.5">
          {(['status', 'list', 'epic', 'reports'] as GroupBy[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium capitalize transition ${
                groupBy === g
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-zinc-500 hover:text-ink'
              }`}
            >
              {g === 'status'
                ? 'Board'
                : g === 'list'
                  ? 'List'
                  : g === 'epic'
                    ? 'By epic'
                    : 'Reports'}
            </button>
          ))}
        </div>

        {query && (
          <span className="text-[12px] text-ink-soft">
            {matchCount} match{matchCount === 1 ? '' : 'es'}
          </span>
        )}

        <button
          onClick={onOpenGitSync}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[12px] font-semibold text-orange-700 transition hover:bg-orange-100"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M4 6v4M6 4h2a2 2 0 012 2v0"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          Sync from git
        </button>

        {backlogCol && !backlogOpen && (
          <button
            onClick={() => setBacklogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink-soft transition hover:bg-zinc-50 hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <path
                d="M10 4l-4 4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Backlog
            <span className="rounded-full bg-zinc-100 px-1.5 text-[11px]">
              {backlogCol.cards.length}
            </span>
          </button>
        )}
      </div>

      {/* Board body */}
      <div className="min-h-0 flex-1 board-bg-grid">
        {groupBy === 'status' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex h-full">
              <div className="min-w-0 flex-1 overflow-x-auto snap-x snap-mandatory px-6 pb-8">
                <div className="flex items-start gap-4">
                  {activeColumns.map((column) => (
                    <ColumnView
                      key={column.id}
                      column={column}
                      mode={board.mode}
                      query={query}
                      onAddCard={(title) => onAddCard(column.id, title)}
                      onToggleDone={onToggleDone}
                      onOpenCard={onOpenCard}
                    />
                  ))}

                  <div className="w-60 flex-none snap-center pt-7">
                    {addingCol ? (
                      <input
                        autoFocus
                        value={newCol}
                        onChange={(e) => setNewCol(e.target.value)}
                        onBlur={commitCol}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitCol()
                          if (e.key === 'Escape') {
                            setNewCol('')
                            setAddingCol(false)
                          }
                        }}
                        placeholder="Column name…"
                        className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-[13px] text-ink shadow-sm outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => setAddingCol(true)}
                        className="w-full rounded-xl border border-dashed border-line px-3 py-2 text-[12.5px] font-medium text-zinc-400 transition hover:border-zinc-300 hover:text-zinc-600"
                      >
                        + Add column
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {backlogOpen && backlogProps && <BacklogDrawerDnd {...backlogProps} />}
              </AnimatePresence>
            </div>

            <DragOverlay>
              {activeCard && (
                <div className="w-72 rotate-2">
                  <CardBody card={activeCard} mode={board.mode} dragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : groupBy === 'list' ? (
          <div className="h-full overflow-y-auto px-6">
            <ListView
              columns={activeColumns}
              query={query}
              onOpenCard={onOpenCard}
              onToggleDone={onToggleDone}
            />
          </div>
        ) : groupBy === 'reports' ? (
          <Reports board={board} boardId={boardId} />
        ) : (
          <div className="flex h-full">
            <div className="min-w-0 flex-1 overflow-auto px-6 pb-8">
              <EpicSwimlanes
                columns={activeColumns}
                mode={board.mode}
                query={query}
                onToggleDone={onToggleDone}
                onOpenCard={onOpenCard}
              />
            </div>
            <AnimatePresence>
              {backlogOpen && backlogProps && <BacklogDrawerStatic {...backlogProps} />}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
