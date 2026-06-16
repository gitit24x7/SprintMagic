import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { BoardMode } from '../types'

interface BoardItem {
  id: string
  title: string
  mode: BoardMode
}

interface Props {
  boards: BoardItem[]
  activeId: string
  onSelect: (id: string) => void
  onNewBoard: () => void
  onDelete: (id: string) => void
}

function ModeDot({ mode }: { mode: BoardMode }) {
  return (
    <span
      className={`h-1.5 w-1.5 flex-none rounded-full ${
        mode === 'sprint' ? 'bg-orange-500' : 'bg-sky-500'
      }`}
    />
  )
}

export function BoardSwitcher({
  boards,
  activeId,
  onSelect,
  onNewBoard,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false)
  const active = boards.find((b) => b.id === activeId) ?? boards[0]

  const close = () => setOpen(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[220px] items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] font-medium text-ink transition hover:bg-zinc-100"
      >
        <ModeDot mode={active.mode} />
        <span className="truncate">{active.title}</span>
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 flex-none text-zinc-400" fill="none">
          <path
            d="M4 6.5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-xl"
            >
              <div className="max-h-72 overflow-y-auto py-1.5">
                <p className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">
                  Boards
                </p>
                {boards.map((b) => (
                  <div
                    key={b.id}
                    className={`group flex items-center gap-2 px-2 ${
                      b.id === activeId ? 'bg-orange-50/60' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelect(b.id)
                        close()
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1.5 text-left text-[13px] text-ink hover:bg-zinc-50"
                    >
                      <ModeDot mode={b.mode} />
                      <span className="truncate">{b.title}</span>
                      {b.id === activeId && (
                        <svg viewBox="0 0 12 12" className="ml-auto h-3 w-3 flex-none text-orange-500" fill="none">
                          <path
                            d="M2.5 6.2l2.2 2.3L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
                      className="flex-none rounded p-1 text-zinc-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                      aria-label={`Delete ${b.title}`}
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
              </div>

              <div className="border-t border-line py-1.5">
                <MenuItem
                  label="New board from template…"
                  onClick={() => {
                    onNewBoard()
                    close()
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  label,
  dot,
  onClick,
}: {
  label: string
  dot?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-ink-soft transition hover:bg-zinc-50 hover:text-ink"
    >
      {dot ? (
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      ) : (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-zinc-400" fill="none">
          <path
            d="M8 3.5v9M3.5 8h9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
      {label}
    </button>
  )
}
