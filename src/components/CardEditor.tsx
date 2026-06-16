import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Card, IssueType, Priority } from '../types'
import { ISSUE_TYPES, ISSUE_TYPE_META, PRIORITY_META } from '../lib/ui'

interface Props {
  card: Card
  onPatch: (patch: Partial<Card>) => void
  onDelete: () => void
  onClose: () => void
  onAddSubtask: (title: string) => void
  onToggleSubtask: (subId: string) => void
  onDeleteSubtask: (subId: string) => void
}

const PRIORITIES: Priority[] = ['high', 'med', 'low']

export function CardEditor({
  card,
  onPatch,
  onDelete,
  onClose,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: Props) {
  const [newSub, setNewSub] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const commitList = (value: string): string[] =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-900/20 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.96, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {card.key && (
          <div className="flex items-center gap-2 px-5 pt-4">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-[4px] text-white ${
                ISSUE_TYPE_META[card.type ?? 'story'].fill
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-[1px] bg-white" />
            </span>
            <span className="font-mono text-[12px] font-semibold tracking-tight text-zinc-400">
              {card.key}
            </span>
          </div>
        )}
        <div className="flex items-start gap-2 px-5 pt-3">
          <button
            type="button"
            onClick={() => onPatch({ done: !card.done })}
            className={`mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-md border text-white transition-colors ${
              card.done
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-zinc-300 bg-white hover:border-emerald-400'
            }`}
          >
            {card.done && (
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M2.5 6.2l2.2 2.3L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <textarea
            value={card.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent text-[16px] font-semibold leading-snug text-ink outline-none"
            placeholder="Task title"
          />
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Issue type */}
          <Field label="Issue type">
            <div className="flex gap-1.5">
              {ISSUE_TYPES.map((t) => {
                const meta = ISSUE_TYPE_META[t]
                const active = (card.type ?? 'story') === t
                return (
                  <button
                    key={t}
                    onClick={() => onPatch({ type: t as IssueType })}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium ring-1 transition ${
                      active
                        ? 'bg-zinc-900 text-white ring-transparent'
                        : 'bg-white text-zinc-500 ring-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-[3px] ${meta.fill}`}
                    />
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Priority */}
          <Field label="Priority">
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    onPatch({ priority: card.priority === p ? undefined : p })
                  }
                  className={`rounded-lg px-2.5 py-1 text-[12px] font-medium ring-1 transition ${
                    card.priority === p
                      ? PRIORITY_META[p].chip + ' ring-transparent'
                      : 'bg-white text-zinc-500 ring-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Description">
            <textarea
              value={card.description ?? ''}
              onChange={(e) =>
                onPatch({ description: e.target.value || undefined })
              }
              rows={3}
              placeholder="Add details, acceptance criteria, links…"
              className="w-full resize-y rounded-lg border border-zinc-200 px-2.5 py-2 text-[13px] leading-relaxed text-ink outline-none placeholder:text-zinc-400 focus:border-orange-300"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Due date">
              <input
                type="date"
                value={card.due ?? ''}
                onChange={(e) => onPatch({ due: e.target.value || undefined })}
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-orange-300"
              />
            </Field>
            <Field label="Epic">
              <input
                value={card.epic ?? ''}
                onChange={(e) => onPatch({ epic: e.target.value || undefined })}
                placeholder="Onboarding"
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-orange-300"
              />
            </Field>
            <Field label="Story points">
              <input
                type="number"
                min={0}
                value={card.points ?? ''}
                onChange={(e) =>
                  onPatch({
                    points:
                      e.target.value === ''
                        ? undefined
                        : Math.max(0, Number(e.target.value)),
                  })
                }
                placeholder="—"
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-orange-300"
              />
            </Field>
          </div>

          <Field label="Assignees (comma-separated)">
            <input
              defaultValue={card.assignees.join(', ')}
              onChange={(e) => onPatch({ assignees: commitList(e.target.value) })}
              placeholder="alice, bob"
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-orange-300"
            />
          </Field>

          <Field label="Labels (comma-separated)">
            <input
              defaultValue={card.tags.join(', ')}
              onChange={(e) => onPatch({ tags: commitList(e.target.value) })}
              placeholder="auth, security"
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-orange-300"
            />
          </Field>

          {/* Sub-tasks */}
          <Field label={`Sub-tasks (${card.subtasks.filter((s) => s.done).length}/${card.subtasks.length})`}>
            <div className="space-y-1.5">
              {card.subtasks.map((s) => (
                <div key={s.id} className="group flex items-center gap-2">
                  <button
                    onClick={() => onToggleSubtask(s.id)}
                    className={`flex h-4 w-4 flex-none items-center justify-center rounded border text-white ${
                      s.done
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-300 bg-white hover:border-emerald-400'
                    }`}
                  >
                    {s.done && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                        <path
                          d="M2.5 6.2l2.2 2.3L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-[13px] ${
                      s.done ? 'text-zinc-400 line-through' : 'text-ink'
                    }`}
                  >
                    {s.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask(s.id)}
                    className="text-zinc-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                    aria-label="Delete sub-task"
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSub.trim()) {
                    onAddSubtask(newSub)
                    setNewSub('')
                  }
                }}
                placeholder="+ Add sub-task, press Enter"
                className="w-full rounded-lg border border-dashed border-zinc-200 px-2.5 py-1.5 text-[13px] text-ink outline-none placeholder:text-zinc-400 focus:border-orange-300"
              />
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <button
            onClick={onDelete}
            className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-rose-500 transition hover:bg-rose-50"
          >
            Delete task
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-zinc-700"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  )
}
