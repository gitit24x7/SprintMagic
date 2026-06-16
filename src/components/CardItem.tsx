import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import type { Board, Card } from '../types'
import {
  ISSUE_TYPE_META,
  PRIORITY_META,
  avatarClasses,
  formatDate,
  initials,
} from '../lib/ui'
import type { IssueType } from '../types'

function IssueTypeIcon({ type }: { type: IssueType }) {
  const meta = ISSUE_TYPE_META[type]
  return (
    <span
      title={meta.label}
      className={`flex h-5 w-5 flex-none items-center justify-center rounded-[6px] text-white ${meta.fill}`}
    >
      {meta.icon === 'check' && (
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
          <path
            d="M2.5 6.2l2.2 2.3L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {meta.icon === 'square' && (
        <span className="h-2 w-2 rounded-[2px] bg-white" />
      )}
      {meta.icon === 'dot' && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
  )
}

interface BodyProps {
  card: Card
  mode: Board['mode']
  onToggleDone?: () => void
  onOpen?: () => void
  dragging?: boolean
  dimmed?: boolean
}

export function CardBody({
  card,
  mode,
  onToggleDone,
  onOpen,
  dragging,
  dimmed,
}: BodyProps) {
  const priority = card.priority ? PRIORITY_META[card.priority] : null
  const subDone = card.subtasks.filter((s) => s.done).length
  const subTotal = card.subtasks.length

  const hasMeta =
    card.epic ||
    typeof card.points === 'number' ||
    card.tags.length > 0 ||
    card.due ||
    (mode === 'sprint' && !card.due && !card.done)

  return (
    <div
      onClick={onOpen}
      title="Open card details"
      className={`group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-lg border border-stone-200 bg-white p-4 transition-all duration-200 hover:border-stone-300 ${
        dimmed ? 'opacity-40 grayscale' : ''
      } ${
        dragging
          ? 'shadow-[0_16px_32px_-8px_rgba(0,0,0,0.15)] ring-1 ring-stone-200 scale-[1.02] z-10'
          : 'shadow-sm hover:shadow-md'
      }`}
    >
      {priority && (
        <span
          title={`Priority: ${priority.label}`}
          className={`absolute inset-y-0 left-0 w-[3px] ${priority.bar}`}
          aria-hidden
        />
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div title={`Issue Type: ${card.type ?? 'Story'}`}>
            <IssueTypeIcon type={card.type ?? 'story'} />
          </div>
          {card.key && (
            <span title={`Issue Key: ${card.key}`} className="text-[13px] font-medium text-stone-500">
              {card.key}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {priority && (
            <span
              title={`Priority: ${priority.label}`}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${priority.chip}`}
            >
              {priority.label}
            </span>
          )}
          <span className="flex items-center -space-x-1" title="Assignees">
            {card.assignees.map((name) => (
              <span
                key={name}
                title={`Assigned to: ${name}`}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-white ${avatarClasses(
                  name,
                )}`}
              >
                {initials(name)}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* --- BODY (Checkbox + Title) --- */}
      <div className="flex items-start gap-3 mt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleDone?.()
          }}
          title={card.done ? 'Mark task as incomplete' : 'Mark task as complete'}
          className={`mt-[2px] flex h-5 w-5 flex-none items-center justify-center rounded-[6px] border transition-colors ${
            card.done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-stone-300 bg-transparent hover:border-emerald-500'
          }`}
          aria-label={card.done ? 'Mark not done' : 'Mark done'}
        >
          {card.done && (
            <svg viewBox="0 0 12 12" className="h-[11px] w-[11px]" fill="none">
              <path
                d="M2.5 6.2l2.2 2.3L9.5 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <div className="flex flex-col flex-1 gap-1">
          <p
            title={`Task Title: ${card.title}`}
            className={`text-[15px] font-medium leading-snug text-stone-800 ${
              card.done ? 'text-stone-400 line-through' : ''
            }`}
          >
            {card.title}
          </p>
          {card.description && (
            <span
              title="This task has a description or notes"
              className="inline-flex items-center text-stone-400"
            >
              <svg viewBox="0 0 14 14" className="h-4 w-4" fill="none">
                <path
                  d="M3 3h8M3 6h8M3 9h5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}
        </div>
        
        {subTotal > 0 && (
          <div title="Has subtasks" className="mt-1 flex-none text-stone-300">
             <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
               <path d="M2 4H12M2 7H12M2 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
             </svg>
          </div>
        )}
      </div>

      {/* --- SUBTASKS PROGRESS BAR --- */}
      {subTotal > 0 && (
        <div className="flex items-center gap-3 w-full mt-1" title={`${subDone} out of ${subTotal} subtasks completed`}>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-stone-300 transition-all"
              style={{ width: `${(subDone / subTotal) * 100}%` }}
            />
          </div>
          <span className="text-[12px] font-medium text-stone-500">
            {subDone}/{subTotal}
          </span>
        </div>
      )}

      {/* --- FOOTER (Metadata) --- */}
      {hasMeta && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {(() => {
            const items = []

            if (card.epic) {
              items.push(
                <span key="epic" title={`Epic: ${card.epic}`} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  {card.epic}
                </span>
              )
            }

            if (typeof card.points === 'number') {
              items.push(
                <span key="points" title={`Story Points: ${card.points}`} className="text-[12px] font-medium text-stone-500">
                  {card.points} pt{card.points === 1 ? '' : 's'}
                </span>
              )
            }

            card.tags.forEach((tag) => {
              items.push(
                <span key={`tag-${tag}`} title={`Tag: #${tag}`} className="text-[12px] font-medium text-stone-500">
                  #{tag}
                </span>
              )
            })

            if (card.due) {
              items.push(
                <span key="due" title={`Due Date: ${formatDate(card.due)}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-stone-500">
                  <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-stone-400" fill="none">
                    <rect x="2" y="3" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 5.5h10M4.5 1.5v2M9.5 1.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {formatDate(card.due)}
                </span>
              )
            }

            if (mode === 'sprint' && !card.due && !card.done) {
              items.push(
                <span key="set-due" title="Click to set a due date" className="inline-flex items-center gap-1 border border-dashed border-stone-300 rounded px-1.5 py-0.5 text-[11px] font-medium text-stone-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  + set date
                </span>
              )
            }

            return items.map((item, index) => (
              <div key={item.key} className="flex items-center gap-2">
                {item}
                {index < items.length - 1 && (
                  <span className="text-stone-300 select-none">|</span>
                )}
              </div>
            ))
          })()}
        </div>
      )}
    </div>
  )
}

interface SortableProps {
  card: Card
  mode: Board['mode']
  onToggleDone: () => void
  onOpen: () => void
  dimmed?: boolean
}

export function SortableCard({
  card,
  mode,
  onToggleDone,
  onOpen,
  dimmed,
}: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <CardBody
        card={card}
        mode={mode}
        onToggleDone={onToggleDone}
        onOpen={onOpen}
        dimmed={dimmed}
      />
    </motion.div>
  )
}
