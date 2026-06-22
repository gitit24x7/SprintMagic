import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import type { Board, Column } from '../types'
import { cardMatches } from '../lib/filter'
import { SortableCard } from './CardItem'

interface Props {
  column: Column
  mode: Board['mode']
  query: string
  priorityStyle?: Board['priorityStyle']
  onAddCard: (title: string) => void
  onToggleDone: (cardId: string) => void
  onOpenCard: (cardId: string) => void
}

export function ColumnView({
  column,
  mode,
  query,
  priorityStyle,
  onAddCard,
  onToggleDone,
  onOpenCard,
}: Props) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const done = column.cards.filter((c) => c.done).length
  const total = column.cards.length
  const points = column.cards.reduce((n, c) => n + (c.points ?? 0), 0)
  const overWip =
    typeof column.wipLimit === 'number' && total > column.wipLimit

  const commit = () => {
    if (title.trim()) onAddCard(title)
    setTitle('')
    setAdding(false)
  }

  const colLower = column.name.toLowerCase()
  const isProgress = colLower.includes('progress') || colLower.includes('doing')
  const isReview = colLower.includes('review') || colLower.includes('qa')
  const isDone = colLower.includes('done') || colLower.includes('complete')

  const topStripColor = isProgress ? 'border-t-orange-400 bg-orange-50/50' :
                        isReview ? 'border-t-amber-400 bg-amber-50/50' :
                        isDone ? 'border-t-emerald-400 bg-emerald-50/50' :
                        'border-t-stone-300 bg-stone-50/50'
  
  const dotColor = isProgress ? 'bg-orange-400' :
                   isReview ? 'bg-amber-400' :
                   isDone ? 'bg-emerald-400' :
                   'bg-stone-300'

  const status: 'todo' | 'progress' | 'review' | 'done' =
    isDone ? 'done' : isReview ? 'review' : isProgress ? 'progress' : 'todo'

  return (
    <div className="flex w-72 flex-none snap-center flex-col">
      <div className={`mb-3 flex items-center gap-2 rounded-t-xl border-t-[3px] border-x border-b border-stone-200 px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${topStripColor}`}>
        <div className={`h-2 w-2 flex-none rounded-full ${dotColor}`} />
        <h2 className="text-[13.5px] font-semibold tracking-tight text-ink truncate">
          {column.name}
        </h2>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
              overWip ? 'bg-rose-100 text-rose-600' : 'bg-white border border-stone-200/60 text-stone-500 shadow-sm'
            }`}
          >
            {typeof column.wipLimit === 'number'
              ? `${total}/${column.wipLimit}`
              : mode === 'sprint' && total > 0
                ? `${done}/${total}`
                : total}
          </span>
          {points > 0 && (
            <span className="rounded-full bg-white border border-stone-200/60 px-1.5 py-0.5 text-[11px] font-medium text-stone-500 shadow-sm">
              {points} pts
            </span>
          )}
          <button
            onClick={() => setAdding(true)}
            className="rounded-md p-1 text-stone-400 transition hover:bg-white hover:text-stone-700 shadow-sm border border-transparent hover:border-stone-200"
            aria-label="Add card"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <path
                d="M8 3.5v9M3.5 8h9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[60px] flex-col gap-1.5 rounded-xl px-0.5 py-0.5 transition-colors duration-150 ${
          isOver ? 'bg-orange-50/70 ring-1 ring-inset ring-orange-200/60' : ''
        } ${overWip ? 'ring-1 ring-inset ring-rose-200' : ''}`}
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
              status={status}
              priorityStyle={priorityStyle}
              dimmed={!cardMatches(card, query)}
              onToggleDone={() => onToggleDone(card.id)}
              onOpen={() => onOpenCard(card.id)}
            />
          ))}
        </SortableContext>

        {adding ? (
          <motion.input
            autoFocus
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setTitle('')
                setAdding(false)
              }
            }}
            placeholder="Task title…"
            className="rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-[13.5px] text-ink shadow-sm outline-none placeholder:text-zinc-400"
          />
        ) : (
          total === 0 && (
            <button
              onClick={() => setAdding(true)}
              className="rounded-xl border border-dashed border-line bg-white/40 px-3 py-6 text-center text-[12px] text-zinc-400 transition hover:border-zinc-300 hover:text-zinc-500"
            >
              + Add a card
            </button>
          )
        )}
      </div>
    </div>
  )
}
