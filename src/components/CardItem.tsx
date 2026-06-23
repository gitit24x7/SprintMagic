import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import type { Board, Card, IssueType } from '../types'
import {
  avatarClasses,
  epicColor,
  formatDate,
  getPriorityMeta,
  initials,
} from '../lib/ui'

export type CardStatus = 'todo' | 'progress' | 'review' | 'done'
type LampState = 'red' | 'amber' | 'green' | 'idle'

const LAMP: Record<'red' | 'amber' | 'green', string> = {
  red: '#f43f5e',
  amber: '#f59e0b',
  green: '#10b981',
}

const PRIORITY_TEXT: Record<string, string> = {
  high: 'text-rose-500', med: 'text-amber-600', low: 'text-stone-400',
  p0: 'text-rose-500', p1: 'text-amber-600', p2: 'text-stone-400', p3: 'text-stone-300',
}

// ─── Status lamp — the three "terminal dots", repurposed as a semaphore ───────
function StatusLamp({ state }: { state: LampState }) {
  return (
    <div className="flex flex-col items-center gap-[5px]" title={`Status: ${state}`} aria-label={`Status: ${state}`}>
      {(['red', 'amber', 'green'] as const).map((slot) => {
        const lit = state === slot
        return lit ? (
          <span key={slot} className="relative flex h-[8px] w-[8px] items-center justify-center">
            <span className="absolute h-[15px] w-[15px] rounded-full" style={{ backgroundColor: LAMP[slot], opacity: 0.18 }} />
            <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: LAMP[slot] }} />
          </span>
        ) : (
          <span key={slot} className="h-[8px] w-[8px] rounded-full border-[1.4px] border-stone-300 bg-white" />
        )
      })}
    </div>
  )
}

// ─── Issue-type glyph (option B: a distinct shape per type) ───────────────────
function TypeGlyph({ type }: { type: IssueType }) {
  if (type === 'task')
    return (
      <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="none" aria-label="Task">
        <path d="M3.4 8.4l3 3 6.2-6.6" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  if (type === 'bug')
    return (
      <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" aria-label="Bug">
        <circle cx="8" cy="8" r="6.2" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.35" />
        <circle cx="8" cy="8" r="3.4" fill="#f43f5e" />
      </svg>
    )
  return (
    <svg viewBox="0 0 16 16" className="h-[15px] w-[15px]" aria-label="Story">
      <rect x="4.4" y="4.4" width="7.2" height="7.2" rx="1.4" transform="rotate(45 8 8)" fill="#10b981" />
    </svg>
  )
}

function Assignees({ card }: { card: Card }) {
  if (card.assignees.length === 0) return null
  return (
    <span className="flex flex-none items-center -space-x-[5px]" title="Assignees">
      {card.assignees.slice(0, 3).map((name) => (
        <span key={name} title={name} className={`flex h-[20px] w-[20px] items-center justify-center rounded-full text-[9px] font-semibold ring-[1.5px] ring-white ${avatarClasses(name)}`}>
          {initials(name)}
        </span>
      ))}
      {card.assignees.length > 3 && (
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-stone-100 text-[9px] font-semibold text-stone-500 ring-[1.5px] ring-white">
          +{card.assignees.length - 3}
        </span>
      )}
    </span>
  )
}

// ─── Ticket notch ─────────────────────────────────────────────────────────────
// A pure arc (the curve only — no straight segment) plus a canvas-coloured fill
// that erases the card's straight border exactly across the notch opening.
function Notch({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <svg
      aria-hidden
      width="18"
      height="11"
      viewBox="0 0 18 11"
      style={{
        position: 'absolute',
        left: '43px',
        overflow: 'visible',
        ...(edge === 'top'
          ? { top: '-2px' }
          : { bottom: '-2px', transform: 'rotate(180deg)' }),
      }}
    >
      {/* erase the straight card border across the notch + fill the bowl */}
      <path d="M0 2 A9 9 0 0 0 18 2 L18 -5 L0 -5 Z" fill="var(--color-canvas)" />
      {/* the notch curve only — no straight line */}
      <path d="M0 2 A9 9 0 0 0 18 2" fill="none" stroke="#1c1917" strokeWidth="1" />
    </svg>
  )
}

// ─── Card Body ────────────────────────────────────────────────────────────────
interface BodyProps {
  card: Card
  mode: Board['mode']
  status?: CardStatus
  priorityStyle?: Board['priorityStyle']
  onToggleDone?: () => void
  onOpen?: () => void
  dragging?: boolean
  dimmed?: boolean
}

export function CardBody({ card, mode, status, priorityStyle, onToggleDone, onOpen, dragging, dimmed }: BodyProps) {
  const priority = card.priority ? getPriorityMeta(card.priority, priorityStyle) : null
  const epicMeta = card.epic ? epicColor(card.epic) : null
  const subDone = card.subtasks.filter((s) => s.done).length
  const subTotal = card.subtasks.length
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = !!(card.due && !card.done && card.due < today)
  const blocked = card.tags.some((t) => /^blocked$/i.test(t))

  const lamp: LampState =
    isOverdue || blocked ? 'red'
      : card.done || status === 'done' ? 'green'
        : status === 'progress' || status === 'review' ? 'amber'
          : 'idle'

  const hasMeta =
    priority || typeof card.points === 'number' || card.due || subTotal > 0 ||
    card.tags.length > 0 || (mode === 'sprint' && !card.due && !card.done)

  return (
    <div
      onClick={onOpen}
      title="Open card details"
      className={`
        group relative flex cursor-pointer rounded-xl border border-stone-900 bg-white
        outline-none transition-all duration-200 ease-out
        ${dimmed ? 'opacity-25 saturate-0' : ''}
        ${dragging
          ? 'shadow-[0_20px_40px_-8px_rgba(0,0,0,0.22),0_4px_12px_-2px_rgba(0,0,0,0.10)] scale-[1.015] rotate-[0.4deg] z-20'
          : 'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_16px_-8px_rgba(0,0,0,0.13),0_18px_26px_-14px_rgba(234,88,12,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)] hover:-translate-y-[2px] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_14px_26px_-8px_rgba(0,0,0,0.16),0_28px_40px_-16px_rgba(234,88,12,0.20),0_0_0_0.5px_rgba(0,0,0,0.05)]'
        }
      `}
    >
      {/* ── Ticket stub ── */}
      <div className="relative flex w-[52px] flex-none flex-col items-center gap-2.5 py-3">
        <StatusLamp state={lamp} />
        <TypeGlyph type={card.type ?? 'story'} />
        {card.key && (
          <span
            className="mt-auto font-mono text-[10px] tracking-[0.18em] text-stone-400"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            title={`Issue ${card.key}`}
          >
            {card.key}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 border-l border-dashed border-stone-300 py-3 pl-3.5 pr-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleDone?.() }}
              title={card.done ? 'Mark incomplete' : 'Mark complete'}
              aria-label={card.done ? 'Mark not done' : 'Mark done'}
              className="mt-[1px] shrink-0 font-mono text-[13px] leading-[1.4] text-stone-300 transition-colors hover:text-stone-500"
            >
              {card.done ? <span className="text-emerald-500">[x]</span> : '[ ]'}
            </button>
            <p
              title={card.title}
              className={`font-mono text-[13px] leading-[1.4] tracking-[-0.005em] ${card.done ? 'text-stone-400 line-through decoration-stone-300/70' : 'text-stone-800 group-hover:text-stone-900'
                }`}
            >
              {card.title}
              <span
                aria-hidden
                className="ml-[3px] inline-block h-[11px] w-[5px] translate-y-[1px] rounded-[1px] bg-orange-500 align-baseline opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              />
            </p>
          </div>
          <Assignees card={card} />
        </div>

        {card.epic && epicMeta && (
          <p className={`pl-[26px] font-mono text-[11px] leading-snug ${epicMeta.text}`}>// {card.epic}</p>
        )}

        {subTotal > 0 && (
          <div className="flex items-center gap-2 pl-[26px]" title={`${subDone} of ${subTotal} sub-tasks`}>
            <div className="h-[2.5px] w-20 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${(subDone / subTotal) * 100}%` }} />
            </div>
          </div>
        )}

        {hasMeta && (
          <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 pl-[26px] font-mono text-[10.5px] leading-none text-stone-500">
            {priority && <span className={PRIORITY_TEXT[card.priority!] ?? 'text-stone-500'}>{priority.label.toLowerCase()}</span>}
            {typeof card.points === 'number' && <span className="tabular-nums">{card.points}pt</span>}
            {card.due && (
              <span className={`tabular-nums ${isOverdue ? 'text-rose-500' : ''}`}>
                {formatDate(card.due)}{isOverdue ? ' ⚠' : ''}
              </span>
            )}
            {subTotal > 0 && <span className="tabular-nums text-stone-400">{subDone}/{subTotal}</span>}
            {card.tags.map((tag) => (
              <span key={tag} className="text-stone-400/90">#{tag}</span>
            ))}
            {mode === 'sprint' && !card.due && !card.done && (
              <span className="text-stone-300 opacity-0 transition-opacity group-hover:opacity-100">+ date</span>
            )}
          </div>
        )}
      </div>

      {/* ── Ticket notches ── */}
      <Notch edge="top" />
      <Notch edge="bottom" />
    </div>
  )
}

// ─── Sortable wrapper ─────────────────────────────────────────────────────────
interface SortableProps {
  card: Card
  mode: Board['mode']
  status?: CardStatus
  priorityStyle?: Board['priorityStyle']
  onToggleDone: () => void
  onOpen: () => void
  dimmed?: boolean
}

export function SortableCard({ card, mode, status, priorityStyle, onToggleDone, onOpen, dimmed }: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <CardBody
        card={card}
        mode={mode}
        status={status}
        priorityStyle={priorityStyle}
        onToggleDone={onToggleDone}
        onOpen={onOpen}
        dimmed={dimmed}
        dragging={isDragging}
      />
    </motion.div>
  )
}
