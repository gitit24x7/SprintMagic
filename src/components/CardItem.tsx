import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import type { Board, Card } from '../types'
import {
  ISSUE_TYPE_META,
  getPriorityMeta,
  avatarClasses,
  epicColor,
  formatDate,
  initials,
  tagColor,
} from '../lib/ui'
import type { IssueType } from '../types'

// ─── Priority left-edge colours ───────────────────────────────────────────────
const PRIORITY_EDGE: Record<string, string> = {
  high: 'bg-rose-400',
  med:  'bg-amber-400',
  low:  'bg-slate-300',
  p0:   'bg-rose-400',
  p1:   'bg-amber-400',
  p2:   'bg-slate-300',
  p3:   'bg-stone-200',
}

// Subtle tinted border that bleeds in on hover
const PRIORITY_BORDER_HOVER: Record<string, string> = {
  high: 'group-hover:border-rose-200',
  med:  'group-hover:border-amber-200',
  low:  'group-hover:border-slate-200',
  p0:   'group-hover:border-rose-200',
  p1:   'group-hover:border-amber-200',
  p2:   'group-hover:border-slate-200',
  p3:   'group-hover:border-stone-200',
}

// ─── Issue type icon ──────────────────────────────────────────────────────────
function IssueTypeIcon({ type }: { type: IssueType }) {
  const meta = ISSUE_TYPE_META[type]
  return (
    <span
      title={meta.label}
      className={`flex h-[17px] w-[17px] flex-none items-center justify-center rounded-[4px] text-white ${meta.fill}`}
    >
      {meta.icon === 'check' && (
        <svg viewBox="0 0 10 10" className="h-[9px] w-[9px]" fill="none">
          <path d="M1.8 5l2 2.1L8.2 2.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {meta.icon === 'square' && <span className="h-[6px] w-[6px] rounded-[1px] bg-white" />}
      {meta.icon === 'dot'    && <span className="h-[6px] w-[6px] rounded-full bg-white" />}
    </span>
  )
}

// ─── Done toggle ──────────────────────────────────────────────────────────────
function DoneCheckbox({ done, onToggle }: { done: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle?.() }}
      title={done ? 'Mark incomplete' : 'Mark complete'}
      aria-label={done ? 'Mark not done' : 'Mark done'}
      className={`
        relative mt-[1px] flex h-[17px] w-[17px] flex-none shrink-0 items-center justify-center
        rounded-[4px] border outline-none
        transition-all duration-150 ease-out
        focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1
        ${done
          ? 'border-emerald-400 bg-emerald-500 text-white shadow-[0_0_0_2.5px_rgba(52,211,153,0.15)]'
          : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/60 hover:shadow-[0_0_0_2.5px_rgba(52,211,153,0.10)]'
        }
      `}
    >
      {done && (
        <svg viewBox="0 0 10 10" className="h-[9px] w-[9px]" fill="none">
          <path d="M1.8 5l2 2.1L8.2 2.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ─── Card Body ────────────────────────────────────────────────────────────────
interface BodyProps {
  card: Card
  mode: Board['mode']
  priorityStyle?: Board['priorityStyle']
  onToggleDone?: () => void
  onOpen?: () => void
  dragging?: boolean
  dimmed?: boolean
}

export function CardBody({ card, mode, priorityStyle, onToggleDone, onOpen, dragging, dimmed }: BodyProps) {
  const priority  = card.priority ? getPriorityMeta(card.priority, priorityStyle) : null
  const epicMeta  = card.epic ? epicColor(card.epic) : null
  const subDone   = card.subtasks.filter((s) => s.done).length
  const subTotal  = card.subtasks.length
  const today     = new Date().toISOString().slice(0, 10)
  const isOverdue = !!(card.due && !card.done && card.due < today)

  const hasMeta =
    card.epic ||
    typeof card.points === 'number' ||
    card.tags.length > 0 ||
    card.due ||
    (mode === 'sprint' && !card.due && !card.done)

  const priorityBorderHover = card.priority ? PRIORITY_BORDER_HOVER[card.priority] : ''

  return (
    <div
      onClick={onOpen}
      title="Open card details"
      className={`
        group relative flex cursor-pointer flex-col overflow-hidden rounded-xl
        border bg-white
        outline-none transition-all duration-200 ease-out
        ${dimmed ? 'opacity-25 saturate-0' : ''}
        ${dragging
          ? 'border-stone-300/80 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.16),0_4px_10px_-2px_rgba(0,0,0,0.07)] scale-[1.015] rotate-[0.4deg] z-20'
          : `border-stone-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_0.5px_rgba(0,0,0,0.03)]
             hover:-translate-y-[2px]
             hover:shadow-[0_6px_18px_-4px_rgba(0,0,0,0.10),0_2px_6px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]
             ${priorityBorderHover}`
        }
      `}
    >
      {/* Priority left edge — 2.5px, sits flush */}
      {priority && (
        <span
          title={`Priority: ${priority.label}`}
          className={`absolute inset-y-0 left-0 w-[2.5px] rounded-l-xl ${PRIORITY_EDGE[card.priority!]}`}
          aria-hidden
        />
      )}

      {/* ── Content ── */}
      <div className={`flex flex-col gap-2.5 p-3.5 ${priority ? 'pl-[14px]' : ''}`}>

        {/* HEADER */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-[7px]">
            <IssueTypeIcon type={card.type ?? 'story'} />

            {card.key && (
              <span
                title={`Issue: ${card.key}`}
                className="shrink-0 font-mono text-[10.5px] font-medium tracking-[0.01em] text-stone-400/90"
              >
                {card.key}
              </span>
            )}

            {/* Epic — shown in header as a muted small pill */}
            {card.epic && epicMeta && (
              <span
                title={`Epic: ${card.epic}`}
                className={`hidden sm:inline-flex shrink-0 items-center gap-[5px] rounded-[5px] px-[7px] py-[2px] text-[10px] leading-none tracking-[0.02em] ${epicMeta.soft} ${epicMeta.text}`}
              >
                <span className={`h-[5px] w-[5px] rounded-full ${epicMeta.dot}`} />
                {card.epic}
              </span>
            )}
          </div>

          <div className="flex flex-none items-center gap-[6px]">
            {/* Priority pill — understated, no uppercase shouting */}
            {priority && (
              <span
                title={`Priority: ${priority.label}`}
                className={`rounded-[5px] px-[7px] py-[2px] text-[10px] leading-none tracking-[0.015em] ring-1 ${priority.chip}`}
              >
                {priority.label}
              </span>
            )}

            {/* Assignees */}
            {card.assignees.length > 0 && (
              <span className="flex items-center -space-x-[5px]" title="Assignees">
                {card.assignees.slice(0, 3).map((name) => (
                  <span
                    key={name}
                    title={name}
                    className={`flex h-[21px] w-[21px] items-center justify-center rounded-full text-[9px] font-semibold ring-[1.5px] ring-white ${avatarClasses(name)}`}
                  >
                    {initials(name)}
                  </span>
                ))}
                {card.assignees.length > 3 && (
                  <span className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-stone-100 text-[9px] font-semibold text-stone-500 ring-[1.5px] ring-white">
                    +{card.assignees.length - 3}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* TITLE + DESCRIPTION */}
        <div className="flex items-start gap-[10px]">
          <DoneCheckbox done={card.done} onToggle={onToggleDone} />
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <p
              title={card.title}
              style={{ fontVariationSettings: "'opsz' 20" }}
              className={`
                text-[13px] leading-[1.45] tracking-[-0.008em]
                transition-colors duration-150
                ${card.done
                  ? 'text-stone-350 line-through decoration-stone-300/70'
                  : 'text-stone-800 group-hover:text-stone-900'
                }
              `}
            >
              {card.title}
            </p>
            {card.description && (
              <p className="line-clamp-1 text-[11px] leading-relaxed tracking-[0.005em] text-stone-400/80">
                {card.description}
              </p>
            )}
          </div>
        </div>

        {/* SUBTASK PROGRESS */}
        {subTotal > 0 && (
          <div
            className="flex items-center gap-2.5"
            title={`${subDone} of ${subTotal} sub-tasks done`}
          >
            <div className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${(subDone / subTotal) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-stone-400">
              {subDone}/{subTotal}
            </span>
          </div>
        )}

        {/* FOOTER CHIPS */}
        {hasMeta && (
          <div className="flex flex-wrap items-center gap-[5px] pt-[1px]">

            {/* Tags */}
            {card.tags.map((tag) => (
              <span
                key={`tag-${tag}`}
                title={`#${tag}`}
                className={`
                  inline-flex items-center rounded-[5px] px-[7px] py-[2px]
                  text-[10px] leading-none tracking-[0.02em]
                  ${tagColor(tag)}
                `}
              >
                #{tag}
              </span>
            ))}

            {/* Points */}
            {typeof card.points === 'number' && (
              <span
                title={`${card.points} story points`}
                className="inline-flex items-center gap-[4px] rounded-[5px] bg-stone-100/80 px-[7px] py-[2px] font-mono text-[10px] tabular-nums leading-none text-stone-500"
              >
                {/* diamond icon — not a star (too generic) */}
                <svg viewBox="0 0 8 8" className="h-2 w-2 text-stone-400" fill="currentColor">
                  <path d="M4 0L7.5 4 4 8 .5 4z" />
                </svg>
                {card.points}
              </span>
            )}

            {/* Delivery date */}
            {card.due && (
              <span
                title={`Delivery: ${formatDate(card.due)}${isOverdue ? ' — Overdue' : ''}`}
                className={`
                  inline-flex items-center gap-[4px] rounded-[5px] px-[7px] py-[2px]
                  font-mono text-[10px] leading-none tabular-nums
                  ${isOverdue
                    ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200/80'
                    : 'bg-stone-100/80 text-stone-500'
                  }
                `}
              >
                {isOverdue && (
                  <svg viewBox="0 0 8 8" className="h-2 w-2 flex-none" fill="currentColor">
                    <path d="M4 .5a.5.5 0 0 0-.5.5V4a.5.5 0 0 0 1 0V1A.5.5 0 0 0 4 .5zm0 6a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                  </svg>
                )}
                <svg viewBox="0 0 12 12" className="h-[10px] w-[10px] flex-none" fill="none">
                  <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M1 5h10M4 .5v3M8 .5v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
                {formatDate(card.due)}
              </span>
            )}

            {/* Ghost "set date" */}
            {mode === 'sprint' && !card.due && !card.done && (
              <span
                title="Click card to set a delivery date"
                className="inline-flex items-center gap-[3px] rounded-[5px] border border-dashed border-stone-200 px-[7px] py-[2px] text-[10px] leading-none text-stone-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              >
                + date
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover accent line — slides in and fades in, colour matches priority */}
      <div
        className={`
          absolute inset-x-0 bottom-0 h-[2.5px]
          translate-x-[-100%] opacity-0 transition-all duration-500 ease-out
          group-hover:translate-x-0 group-hover:opacity-100
          ${card.priority === 'high' || card.priority === 'p0' ? 'bg-gradient-to-r from-rose-400/0 via-rose-500 to-rose-400/0'
          : card.priority === 'med'  || card.priority === 'p1'  ? 'bg-gradient-to-r from-amber-400/0 via-amber-500 to-amber-400/0'
          : card.priority === 'low'  || card.priority === 'p2'  ? 'bg-gradient-to-r from-slate-300/0 via-slate-400 to-slate-300/0'
          : card.priority === 'p3'                               ? 'bg-gradient-to-r from-stone-200/0 via-stone-300 to-stone-200/0'
          : 'bg-gradient-to-r from-stone-300/0 via-stone-400 to-stone-300/0'}`}
        aria-hidden
      />
    </div>
  )
}

// ─── Sortable wrapper ─────────────────────────────────────────────────────────
interface SortableProps {
  card: Card
  mode: Board['mode']
  priorityStyle?: Board['priorityStyle']
  onToggleDone: () => void
  onOpen: () => void
  dimmed?: boolean
}

export function SortableCard({ card, mode, priorityStyle, onToggleDone, onOpen, dimmed }: SortableProps) {
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
        priorityStyle={priorityStyle}
        onToggleDone={onToggleDone}
        onOpen={onOpen}
        dimmed={dimmed}
        dragging={isDragging}
      />
    </motion.div>
  )
}
