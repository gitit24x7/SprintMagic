import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Board } from '../types'
import { parseSignals, suggestSignals } from '../lib/gitSync'
import type { GitSignal } from '../lib/gitSync'

interface Props {
  board: Board
  onRun: (signals: GitSignal[]) => void
  onClose: () => void
}

export function GitSyncPanel({ board, onRun, onClose }: Props) {
  const [text, setText] = useState(() => suggestSignals(board))

  const run = () => {
    onRun(parseSignals(text))
    onClose()
  }

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
        <div className="flex items-start gap-3 px-5 pt-5">
          <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-zinc-900 text-white">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
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
          </span>
          <div className="flex-1">
            <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">
              Sync from git
            </h2>
            <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">
              Issues move themselves based on git activity. This is a local
              simulation — type what happened and watch the board update.
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

        <div className="px-5 py-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            rows={5}
            className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50/60 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-ink outline-none focus:border-orange-300"
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-500">One per line:</span>
            <span>
              <code className="text-zinc-500">branch</code> → In Progress
            </span>
            <span>
              <code className="text-zinc-500">pr</code> → Review
            </span>
            <span>
              <code className="text-zinc-500">merged</code> → Done
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <span className="text-[11.5px] text-zinc-400">
            Forward-only · furthest status wins
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-ink-soft hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={run}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-zinc-700"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Run sync
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
