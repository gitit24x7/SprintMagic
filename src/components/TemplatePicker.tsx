import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TEMPLATES } from '../lib/templates'
import type { Template } from '../lib/templates'

interface Props {
  onPick: (template: Template) => void
  onClose: () => void
}

export function TemplatePicker({ onPick, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-900/20 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.96, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">
              Start a new board
            </h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">
              Pick a template — you can edit everything, or drop your own
              Markdown later.
            </p>
          </div>
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

        <div className="grid max-h-[60vh] grid-cols-1 gap-2.5 overflow-y-auto p-5 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onPick(t)}
              className="group flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 text-left transition hover:border-orange-300 hover:bg-orange-50/40 hover:shadow-sm"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-zinc-50 text-[18px] ring-1 ring-line group-hover:bg-white">
                {t.emoji}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-semibold text-ink">
                    {t.name}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ${
                      t.mode === 'sprint'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-sky-50 text-sky-600'
                    }`}
                  >
                    {t.mode}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">
                  {t.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
