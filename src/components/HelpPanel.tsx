import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onClose: () => void
}

const TOKENS: { syntax: string; meaning: string }[] = [
  { syntax: '## In Progress', meaning: 'A column (a status)' },
  { syntax: '- [ ] Task title', meaning: 'An issue · `[x]` means done' },
  { syntax: '⇥ - [ ] Subtask', meaning: 'Indent under an issue → sub-task' },
  { syntax: '⇥ Some notes…', meaning: 'Indented text → description' },
  { syntax: '@alice', meaning: 'Assignee (repeatable)' },
  { syntax: '~2026-06-15', meaning: 'Due date' },
  { syntax: '!high  !med  !low', meaning: 'Priority' },
  { syntax: '*5', meaning: 'Story points' },
  { syntax: '#label', meaning: 'Label (repeatable)' },
  { syntax: '^Epic', meaning: 'Epic group · `^"Two words"`' },
  { syntax: '%story %task %bug', meaning: 'Issue type (default story)' },
  { syntax: 'SM-3 Title', meaning: 'Issue key (auto-assigned)' },
  { syntax: '## Working (3)', meaning: 'Column with a WIP limit of 3' },
]

const SHORTCUTS: { keys: string; what: string }[] = [
  { keys: '/', what: 'Focus search' },
  { keys: 'Esc', what: 'Close a dialog / clear search' },
  { keys: 'Ctrl / ⌘ + B', what: 'Toggle the Markdown source panel' },
]

export function HelpPanel({ onClose }: Props) {
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
        className="flex max-h-[86vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.96, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">
            Quick guide
          </h2>
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

        <div className="space-y-6 overflow-y-auto px-5 py-5">
          {/* Getting started */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              In 30 seconds
            </h3>
            <ol className="space-y-1.5 text-[13px] text-ink">
              {[
                'Drag cards between columns, or click one to edit its details.',
                'Toggle “Source” to write Markdown — it stays in sync with the board, both ways.',
                'Everything saves to your browser automatically. Export to a .md file anytime.',
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-ink-soft">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Markdown cheat sheet */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Markdown cheat sheet
            </h3>
            <div className="overflow-hidden rounded-xl border border-line">
              {TOKENS.map((t, i) => (
                <div
                  key={t.syntax}
                  className={`flex items-center gap-3 px-3 py-1.5 ${
                    i % 2 ? 'bg-zinc-50/60' : 'bg-white'
                  }`}
                >
                  <code className="w-40 flex-none whitespace-nowrap font-mono text-[11.5px] text-orange-700">
                    {t.syntax}
                  </code>
                  <span
                    className="text-[12.5px] text-ink-soft"
                    dangerouslySetInnerHTML={{
                      __html: t.meaning.replace(
                        /`([^`]+)`/g,
                        '<code class="font-mono text-[11px] text-zinc-500">$1</code>',
                      ),
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-snug text-ink-soft">
              Tokens combine on one line, e.g.{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-ink">
                - [ ] Build login form @alice ~2026-06-15 !high *5 ^Login
              </code>
            </p>
          </section>

          {/* Git-sync */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Sync from git
            </h3>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Open <b className="text-ink">Sync from git</b> to move issues by
              their key based on git activity:{' '}
              <code className="font-mono text-[11.5px] text-orange-700">
                branch
              </code>{' '}
              → In Progress,{' '}
              <code className="font-mono text-[11.5px] text-orange-700">pr</code>{' '}
              → Review,{' '}
              <code className="font-mono text-[11.5px] text-orange-700">
                merged
              </code>{' '}
              → Done. It only ever moves issues <b className="text-ink">forward</b>.
            </p>
          </section>

          {/* Shortcuts */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Keyboard shortcuts
            </h3>
            <div className="space-y-1">
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="flex items-center gap-3 text-[13px]">
                  <kbd className="min-w-[88px] rounded-md border border-line bg-zinc-50 px-2 py-0.5 text-center font-mono text-[11.5px] text-ink">
                    {s.keys}
                  </kbd>
                  <span className="text-ink-soft">{s.what}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}
