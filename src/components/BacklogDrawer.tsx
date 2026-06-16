import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import type { Board, Column } from '../types'
import { cardMatches } from '../lib/filter'
import { CardBody, SortableCard } from './CardItem'

interface Props {
  column: Column
  mode: Board['mode']
  query: string
  onAddCard: (title: string) => void
  onToggleDone: (cardId: string) => void
  onOpenCard: (cardId: string) => void
  onClose: () => void
}

function Shell({
  column,
  onClose,
  onAddCard,
  children,
}: {
  column: Column
  onClose: () => void
  onAddCard: (title: string) => void
  children: React.ReactNode
}) {
  const [title, setTitle] = useState('')
  const commit = () => {
    if (title.trim()) onAddCard(title)
    setTitle('')
  }

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      className="flex-none overflow-hidden border-l border-line bg-white/60"
    >
      <div className="flex h-full w-80 flex-col">
        <div className="flex items-center gap-2 px-4 py-3">
          <h2 className="text-[13px] font-semibold tracking-tight text-ink">
            Backlog
          </h2>
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
            {column.cards.length}
          </span>
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Collapse backlog"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">{children}</div>

        <div className="border-t border-line p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') setTitle('')
            }}
            placeholder="+ Add to backlog…"
            className="w-full rounded-lg border border-dashed border-zinc-200 bg-white px-3 py-2 text-[13px] text-ink outline-none placeholder:text-zinc-400 focus:border-orange-300"
          />
        </div>
      </div>
    </motion.aside>
  )
}

export function BacklogDrawerDnd(props: Props) {
  const { column, mode, query, onToggleDone, onOpenCard } = props
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <Shell {...props}>
      <div
        ref={setNodeRef}
        className={`flex min-h-full flex-col gap-2 rounded-xl p-1 transition-colors ${
          isOver ? 'bg-orange-50/60' : ''
        }`}
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              mode={mode}
              dimmed={!cardMatches(card, query)}
              onToggleDone={() => onToggleDone(card.id)}
              onOpen={() => onOpenCard(card.id)}
            />
          ))}
        </SortableContext>
        {column.cards.length === 0 && (
          <p className="px-2 py-6 text-center text-[12px] text-zinc-400">
            Drag cards here to defer them
          </p>
        )}
      </div>
    </Shell>
  )
}

export function BacklogDrawerStatic(props: Props) {
  const { column, mode, query, onToggleDone, onOpenCard } = props
  return (
    <Shell {...props}>
      <div className="flex flex-col gap-2 p-1">
        {column.cards.map((card) => (
          <CardBody
            key={card.id}
            card={card}
            mode={mode}
            dimmed={!cardMatches(card, query)}
            onToggleDone={() => onToggleDone(card.id)}
            onOpen={() => onOpenCard(card.id)}
          />
        ))}
        {column.cards.length === 0 && (
          <p className="px-2 py-6 text-center text-[12px] text-zinc-400">
            Backlog is empty
          </p>
        )}
      </div>
    </Shell>
  )
}
