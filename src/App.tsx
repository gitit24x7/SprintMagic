import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Board, Card } from './types'
import { parseMarkdown } from './lib/parser'
import { boardToMarkdown } from './lib/serialize'
import {
  blankBoard,
  createInitialWorkspace,
  loadWorkspace,
  newBoardId,
  saveWorkspace,
} from './lib/workspace'
import type { Workspace } from './lib/workspace'
import {
  addCard,
  addColumn,
  addSubtask,
  deleteCard,
  deleteSubtask,
  moveCard,
  toggleCardDone,
  toggleSubtask,
  updateCard,
} from './lib/boardActions'
import { syncIssuesWithGit } from './lib/gitSync'
import type { GitSignal, SyncChange } from './lib/gitSync'
import { BoardView } from './components/BoardView'
import { BoardSwitcher } from './components/BoardSwitcher'
import { CardEditor } from './components/CardEditor'
import { GitSyncPanel } from './components/GitSyncPanel'
import { Landing } from './components/Landing'
import { About } from './components/About'
import { TemplatePicker } from './components/TemplatePicker'
import { HelpPanel } from './components/HelpPanel'

const initialWorkspace: Workspace = loadWorkspace() ?? createInitialWorkspace()

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace)

  // The active board, plus a setBoard that updates it in place — so every
  // existing call site (setBoard(b => ...) / setBoard(value)) keeps working.
  const activeEntry =
    workspace.boards.find((b) => b.id === workspace.activeId) ?? workspace.boards[0]
  const board = activeEntry.board

  const setBoard = useCallback(
    (updater: Board | ((b: Board) => Board)) => {
      setWorkspace((ws) => ({
        ...ws,
        boards: ws.boards.map((sb) =>
          sb.id === ws.activeId
            ? {
                ...sb,
                board:
                  typeof updater === 'function'
                    ? (updater as (b: Board) => Board)(sb.board)
                    : updater,
              }
            : sb,
        ),
      }))
    },
    [],
  )

  const [draft, setDraft] = useState(() => boardToMarkdown(board))
  const [warnings, setWarnings] = useState<{ message: string }[]>([])
  const [editorOpen, setEditorOpen] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [gitPanelOpen, setGitPanelOpen] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncChange[] | null>(null)
  const [view, setView] = useState<'landing' | 'about' | 'app'>(() =>
    localStorage.getItem('sprintmagic.launched') ? 'app' : 'landing',
  )
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)

  // Persist the whole workspace whenever anything changes.
  useEffect(() => {
    saveWorkspace(workspace)
  }, [workspace])

  // Keep the source panel mirrored to the active board (also fires on switch,
  // since `board` is a fresh object reference then).
  useEffect(() => {
    setDraft(boardToMarkdown(board))
  }, [board])

  // Global keyboard shortcuts: "/" focuses search, Cmd/Ctrl+B toggles source.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = /^(INPUT|TEXTAREA)$/.test(target.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchInput.current?.focus()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setEditorOpen((v) => !v)
      } else if (e.key === 'Escape' && document.activeElement === searchInput.current) {
        setQuery('')
        searchInput.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Re-parse Markdown into the *active* board (the source panel's "Apply").
  const applyToActive = useCallback(
    (text: string) => {
      const { board: parsed, warnings: w } = parseMarkdown(text)
      setBoard(parsed)
      setWarnings(w)
      setOpenCardId(null)
    },
    [setBoard],
  )

  // Add a brand-new board to the workspace and switch to it.
  const addBoard = useCallback((b: Board) => {
    const id = newBoardId()
    setWarnings([])
    setOpenCardId(null)
    setWorkspace((ws) => ({
      boards: [...ws.boards, { id, board: b }],
      activeId: id,
    }))
  }, [])

  const addBoardFromMarkdown = useCallback(
    (text: string) => {
      const { board: parsed, warnings: w } = parseMarkdown(text)
      addBoard(parsed)
      setWarnings(w)
    },
    [addBoard],
  )

  // --- board management ---
  const selectBoard = useCallback((id: string) => {
    setOpenCardId(null)
    setWarnings([])
    setWorkspace((ws) => ({ ...ws, activeId: id }))
  }, [])

  const renameBoard = useCallback(
    (title: string) => setBoard((b) => ({ ...b, title })),
    [setBoard],
  )

  const deleteBoard = useCallback((id: string) => {
    setOpenCardId(null)
    setWorkspace((ws) => {
      const remaining = ws.boards.filter((b) => b.id !== id)
      if (remaining.length === 0) {
        const fresh = { id: newBoardId(), board: blankBoard() }
        return { boards: [fresh], activeId: fresh.id }
      }
      const activeId =
        ws.activeId === id ? remaining[0].id : ws.activeId
      return { boards: remaining, activeId }
    })
  }, [])

  const loadFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => addBoardFromMarkdown(String(reader.result ?? ''))
      reader.readAsText(file)
    },
    [addBoardFromMarkdown],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) loadFile(file)
    },
    [loadFile],
  )

  const download = useCallback(() => {
    const blob = new Blob([boardToMarkdown(board)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${board.title.replace(/\s+/g, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [board])

  const runGitSync = useCallback((signals: GitSignal[]) => {
    setBoard((b) => {
      const { board: next, changes } = syncIssuesWithGit(b, signals)
      setSyncResult(changes)
      return next
    })
  }, [])

  // Auto-dismiss the sync toast.
  useEffect(() => {
    if (!syncResult) return
    const t = setTimeout(() => setSyncResult(null), 4500)
    return () => clearTimeout(t)
  }, [syncResult])

  const openCard: Card | undefined = useMemo(() => {
    if (!openCardId) return undefined
    for (const col of board.columns) {
      const found = col.cards.find((c) => c.id === openCardId)
      if (found) return found
    }
    return undefined
  }, [board, openCardId])

  if (view === 'landing') {
    return (
      <Landing
        onStart={() => {
          localStorage.setItem('sprintmagic.launched', '1')
          setView('app')
        }}
        onAbout={() => setView('about')}
      />
    )
  }

  if (view === 'about') {
    return (
      <About
        onHome={() => setView('landing')}
        onStart={() => {
          localStorage.setItem('sprintmagic.launched', '1')
          setView('app')
        }}
      />
    )
  }

  return (
    <div
      className="relative flex h-full flex-col"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          setDragging(true)
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={onDrop}
    >
      {/* Top bar */}
      <header className="relative z-20 flex flex-wrap flex-none items-center gap-3 border-b border-line bg-white/70 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          {/* Home icon — always visible, returns to landing */}
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-zinc-100"
            title="Back to home"
            aria-label="Go to home page"
          >
            <img
              src="/logo.png"
              alt="SprintMagic logo"
              width="28"
              height="28"
              className="h-7 w-7 object-contain"
            />
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
              SprintMagic
            </span>
          </button>
        </div>

        <span className="h-5 w-px bg-line" />

        <BoardSwitcher
          boards={workspace.boards.map((b) => ({
            id: b.id,
            title: b.board.title,
            mode: b.board.mode,
          }))}
          activeId={workspace.activeId}
          onSelect={selectBoard}
          onNewBoard={() => setTemplatePickerOpen(true)}
          onDelete={deleteBoard}
        />

        <div className="relative ml-2 hidden sm:block">
          <svg
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
            fill="none"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.5 10.5L14 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…  (press /)"
            className="w-56 rounded-lg border border-line bg-white/60 py-1.5 pl-8 pr-7 text-[12.5px] text-ink outline-none transition focus:w-64 focus:border-orange-300"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-600"
              aria-label="Clear search"
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
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setHelpOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition hover:bg-zinc-100 hover:text-ink"
            title="Help & Markdown guide"
            aria-label="Help"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M6.3 6.2c0-1 .8-1.6 1.7-1.6s1.6.6 1.6 1.5c0 1.4-1.6 1.3-1.6 2.6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle cx="8" cy="11.4" r="0.7" fill="currentColor" />
            </svg>
          </button>
          <TopButton label="Upload .md" onClick={() => fileInput.current?.click()} />
          <TopButton label="Export" onClick={download} />
          <button
            onClick={() => setEditorOpen((v) => !v)}
            className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              editorOpen
                ? 'bg-zinc-900 text-white hover:bg-zinc-700'
                : 'text-ink-soft hover:bg-zinc-100 hover:text-ink'
            }`}
          >
            Source
          </button>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept=".md,.markdown,text/markdown,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) loadFile(file)
            e.target.value = ''
          }}
        />
      </header>

      {/* Body: source panel + board */}
      <div className="flex min-h-0 flex-1">
        <AnimatePresence initial={false}>
          {editorOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 36 }}
                className="absolute inset-y-0 left-0 z-40 sm:relative sm:inset-auto sm:z-auto flex-none overflow-hidden border-r border-line bg-white shadow-2xl sm:shadow-none"
              >
                <div className="flex h-full w-full sm:w-[360px] flex-col">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    Markdown source
                  </span>
                  <button
                    onClick={() => applyToActive(draft)}
                    className="rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-600 transition hover:bg-orange-100"
                  >
                    Apply → board
                  </button>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  spellCheck={false}
                  className="flex-1 resize-none border-0 bg-transparent px-4 pb-4 font-mono text-[12.5px] leading-relaxed text-zinc-700 outline-none"
                />
                {warnings.length > 0 && (
                  <div className="border-t border-line bg-amber-50/50 px-4 py-2.5">
                    {warnings.map((w, i) => (
                      <p key={i} className="text-[11.5px] text-amber-700">
                        {w.message}
                      </p>
                    ))}
                  </div>
                )}
                <p className="border-t border-line px-4 py-2 text-[10.5px] text-zinc-400">
                  Drag cards, click to edit — the board is the source of truth.
                  Edit here and hit Apply to re-import.
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 overflow-hidden">
          <BoardView
            board={board}
            query={query}
            onAddCard={(colId, title) => setBoard((b) => addCard(b, colId, title))}
            onToggleDone={(id) => setBoard((b) => toggleCardDone(b, id))}
            onOpenCard={(id) => setOpenCardId(id)}
            onApplyMove={(id, toCol, toIdx) =>
              setBoard((b) => moveCard(b, id, toCol, toIdx))
            }
            onAddColumn={(name) => setBoard((b) => addColumn(b, name))}
            onOpenGitSync={() => setGitPanelOpen(true)}
            onRenameBoard={renameBoard}
          />
        </main>
      </div>

      {/* Git-sync panel */}
      <AnimatePresence>
        {gitPanelOpen && (
          <GitSyncPanel
            board={board}
            onRun={runGitSync}
            onClose={() => setGitPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Template picker */}
      <AnimatePresence>
        {templatePickerOpen && (
          <TemplatePicker
            onPick={(t) => {
              addBoardFromMarkdown(t.markdown)
              setTemplatePickerOpen(false)
            }}
            onClose={() => setTemplatePickerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Help / guide */}
      <AnimatePresence>
        {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} />}
      </AnimatePresence>

      {/* Sync result toast */}
      <AnimatePresence>
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-5 left-1/2 z-50 w-[320px] overflow-hidden rounded-xl border border-line bg-white shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                  <path
                    d="M2.5 6.2l2.2 2.3L9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[13px] font-semibold text-ink">
                {syncResult.length > 0
                  ? `Synced ${syncResult.length} issue${syncResult.length === 1 ? '' : 's'} from git`
                  : 'Already up to date'}
              </span>
            </div>
            {syncResult.length > 0 && (
              <div className="max-h-40 overflow-y-auto px-4 py-2.5">
                {syncResult.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center gap-1.5 py-0.5 text-[12px]"
                  >
                    <span className="font-mono font-semibold text-zinc-400">
                      {c.key}
                    </span>
                    <span className="truncate text-ink-soft">{c.from}</span>
                    <svg viewBox="0 0 16 16" className="h-3 w-3 flex-none text-zinc-300" fill="none">
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-medium text-emerald-600">{c.to}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card editor */}
      <AnimatePresence>
        {openCard && (
          <CardEditor
            card={openCard}
            onPatch={(patch) => setBoard((b) => updateCard(b, openCard.id, patch))}
            onDelete={() => {
              setBoard((b) => deleteCard(b, openCard.id))
              setOpenCardId(null)
            }}
            onClose={() => setOpenCardId(null)}
            onAddSubtask={(t) => setBoard((b) => addSubtask(b, openCard.id, t))}
            onToggleSubtask={(sid) =>
              setBoard((b) => toggleSubtask(b, openCard.id, sid))
            }
            onDeleteSubtask={(sid) =>
              setBoard((b) => deleteSubtask(b, openCard.id, sid))
            }
          />
        )}
      </AnimatePresence>

      {/* Drag-to-drop overlay */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-orange-500/5 backdrop-blur-sm"
          >
            <div className="rounded-2xl border-2 border-dashed border-orange-300 bg-white/90 px-8 py-6 text-center shadow-xl">
              <p className="font-display text-lg font-semibold text-ink">
                Drop your .md file
              </p>
              <p className="mt-1 text-[13px] text-ink-soft">
                It’ll become a board instantly
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TopButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-zinc-100 hover:text-ink"
    >
      {label}
    </button>
  )
}
