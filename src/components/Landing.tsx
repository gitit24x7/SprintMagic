import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'

interface Props {
  onStart: () => void
  onAbout: () => void
}

const STATS = [
  { value: '100%', label: 'Local-first, always' },
  { value: '0ms', label: 'Server latency' },
  { value: '∞', label: 'Boards you can create' },
  { value: '1 file', label: 'Your entire sprint' },
]

const FEATURES = [
  {
    id: 'markdown',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
          d="M4 6h16M4 10h16M4 14h8M4 18h8" />
      </svg>
    ),
    label: 'Markdown Board',
    title: 'Write Markdown, get a board',
    description:
      'A `## Column` heading and `- [ ] task` lines become a drag-and-drop board instantly. Edit the text or the board — they stay perfectly in sync.',
    color: 'text-orange-500',
    accent: 'bg-orange-50',
    border: 'border-orange-500',
  },
  {
    id: 'git',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
          d="M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM19 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 7v4m0 0-4.5 3.5M12 11l4.5 3.5" />
      </svg>
    ),
    label: 'Git Sync',
    title: 'Auto-updates from git activity',
    description:
      'Open a PR and the card slides to Review on its own. Your board stays honest because it reads what you actually did — no manual status updates.',
    color: 'text-emerald-600',
    accent: 'bg-emerald-50',
    border: 'border-emerald-500',
  },
  {
    id: 'epics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
          d="M3 5h18M3 10h18M3 15h10M3 20h10M17 15l2 2 4-4" />
      </svg>
    ),
    label: 'Sprints & Epics',
    title: 'Full Jira vocabulary, zero bloat',
    description:
      'Issues, keys like SM-3, epics, story points, sprints, WIP limits. All the structure you need from a professional tool — none of the setup cost.',
    color: 'text-amber-600',
    accent: 'bg-amber-50',
    border: 'border-amber-500',
  },
  {
    id: 'local',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: 'Privacy First',
    title: 'Your data never leaves your browser',
    description:
      'No account, no server, no surveillance. Everything lives in your browser\'s local storage and in Markdown files that you own and control.',
    color: 'text-rose-600',
    accent: 'bg-rose-50',
    border: 'border-rose-500',
  },
]

function MiniBoard() {
  const col = (name: string, children: React.ReactNode) => (
    <div className="flex w-full flex-col gap-2">
      <div className="px-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-stone-400">
        {name}
      </div>
      {children}
    </div>
  )
  const card = (
    fill: string,
    key: string,
    title: string,
    chips: { c: string; t: string }[],
  ) => (
    <div className="flex flex-col gap-1.5 rounded-lg border border-stone-200 bg-stone-50 p-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 flex-none rounded-[3px] ${fill}`} />
        <span className="text-[11px] leading-snug text-stone-800">{title}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[9px] font-semibold text-stone-400">{key}</span>
        {chips.map((ch, i) => (
          <span key={i} className={`rounded-full px-1.5 py-0.5 text-[8px] font-mono font-semibold uppercase ${ch.c}`}>
            {ch.t}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-stone-200 bg-white p-4">
      {col(
        'In Progress',
        <>
          {card('bg-amber-500', 'SM-5', 'Build login form', [
            { c: 'bg-rose-50 text-rose-600', t: 'High' },
            { c: 'bg-stone-100 text-stone-600', t: '5pts' },
          ])}
          {card('bg-sky-500', 'SM-6', 'Session refresh', [
            { c: 'bg-amber-50 text-amber-600', t: 'Login' },
          ])}
        </>,
      )}
      {col(
        'Review',
        <>
          {card('bg-emerald-500', 'SM-8', 'Sign-up validation', [
            { c: 'bg-sky-50 text-sky-700', t: '#auth' },
          ])}
        </>,
      )}
      {col(
        'Done',
        <>
          {card('bg-rose-400', 'SM-2', 'Fix CSV export', [
            { c: 'bg-emerald-50 text-emerald-700', t: 'merged' },
          ])}
        </>,
      )}
    </div>
  )
}

export function Landing({ onStart, onAbout }: Props) {
  const [activeFeature, setActiveFeature] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const content = containerRef.current.firstElementChild as HTMLElement
    if (!content) return

    const lenis = new Lenis({
      wrapper: containerRef.current,
      content: content,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-gradient-to-br from-[#FDFBF7] to-[#F3EFE6] font-sans">
      <div className="min-h-full flex flex-col">
        {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 flex w-full justify-center backdrop-blur-lg bg-[#FDFBF7]/60 border-b border-stone-200/80">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-3 h-14 items-center px-6 gap-4">

            {/* Left — logo wordmark */}
            <div className="flex items-center">
              <a href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <img src="/logo.png" alt="SprintMagic" width="24" height="24" className="h-6 w-6 object-contain" />
                <span className="font-mono text-sm font-semibold uppercase tracking-wide text-stone-800">
                  SprintMagic
                </span>
              </a>
            </div>

            {/* Center — nav links */}
            <nav className="hidden lg:flex items-center justify-center gap-1">
              <button
                className="flex items-center px-3 py-1 rounded-lg font-mono text-sm font-semibold uppercase text-amber-600 bg-amber-50 transition-colors duration-200"
              >
                Home
              </button>
              <button
                onClick={onAbout}
                className="flex items-center px-3 py-1 rounded-lg font-mono text-sm font-semibold uppercase text-stone-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200"
              >
                About
              </button>
              <button
                onClick={onStart}
                className="flex items-center px-3 py-1 rounded-lg font-mono text-sm font-semibold uppercase text-stone-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200"
              >
                App
              </button>
            </nav>

            {/* Right — CTA */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onAbout}
                className="hidden lg:inline-flex cursor-pointer items-center justify-center font-mono font-semibold uppercase text-sm rounded-xl px-4 py-1.5 h-8 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-all active:scale-95"
              >
                About
              </button>
              <button
                onClick={onStart}
                className="inline-flex cursor-pointer items-center justify-center font-mono font-semibold uppercase text-sm rounded-xl px-4 py-1.5 h-8 text-stone-50 bg-amber-500 border border-amber-600 hover:bg-amber-600 transition-all active:scale-95"
              >
                Open app
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center w-full">
        <div className="max-w-6xl w-full px-4 md:px-6">

          {/* Hero content — 2-column: text LEFT, illustration RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-16 pb-10 md:pb-20">

            {/* ━━━ LEFT: Headline text ━━━ */}
            <div className="flex flex-col gap-6 text-left">
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Markdown-native · Local-first · No signup
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[40px] lg:text-[64px] xl:text-[72px] leading-[1.08] font-display tracking-tight text-stone-900"
              >
                Your sprint board is just a{' '}
                <em className="not-italic bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Markdown file.
                </em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-stone-500 text-base md:text-lg leading-relaxed max-w-md"
              >
                Plan in plain text, get a beautiful Jira-style board that updates itself from your git activity.
                Your data never leaves your browser.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-4 flex-wrap"
              >
                <button
                  onClick={onStart}
                  className="cursor-pointer inline-flex w-full sm:w-auto items-center justify-center gap-2 font-mono font-semibold uppercase border transition-all ease-in duration-75 active:scale-95 text-sm rounded-xl px-5 py-2.5 h-11 border-stone-200 hover:bg-stone-100 hover:border-stone-300 bg-white"
                >
                  Book a demo
                </button>
                <button
                  onClick={onStart}
                  className="cursor-pointer inline-flex w-full sm:w-auto items-center justify-center gap-2 font-mono font-semibold uppercase border transition-all ease-in duration-75 active:scale-95 text-sm rounded-xl px-5 py-2.5 h-11 text-stone-50 bg-amber-500 border-amber-600 hover:bg-amber-600"
                >
                  Open the board
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            </div>

            {/* ━━━ RIGHT: Logo Showcase Illustration ━━━ */}
            <div className="w-full flex items-center justify-center overflow-hidden sm:overflow-visible">
              <div className="scale-[0.6] sm:scale-75 lg:scale-100 origin-center h-[300px] sm:h-[400px] lg:h-auto flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex items-center justify-center mx-auto"
                  style={{ width: 480, height: 480 }}
                >
              {/* Outermost glow blob */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.08) 50%, transparent 75%)',
                  filter: 'blur(2px)',
                }}
              />

              {/* Animated ring 1 — slow spin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 450, height: 450 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-full rounded-full relative"
                  style={{
                    border: '1.5px dashed rgba(245,158,11,0.3)',
                  }}
                >
                  {/* Orbit dot on ring 1 */}
                  <span
                    className="absolute"
                    style={{ top: -5, left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_2px_rgba(245,158,11,0.5)]" />
                  </span>
                </motion.div>
              </div>

              {/* Animated ring 2 — counter-spin, slightly smaller */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 350, height: 350 }}>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-full rounded-full relative"
                  style={{
                    border: '1px solid rgba(249,115,22,0.2)',
                  }}
                >
                  {/* Orbit dot on ring 2 */}
                  <span
                    className="absolute"
                    style={{ bottom: -5, left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <span className="flex h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_5px_2px_rgba(249,115,22,0.45)]" />
                  </span>
                </motion.div>
              </div>

              {/* Animated ring 3 — innermost, fast spin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 270, height: 270 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-full rounded-full relative"
                  style={{
                    border: '1px dotted rgba(245,158,11,0.2)',
                  }}
                >
                  <span
                    className="absolute"
                    style={{ top: -4, right: '20%' }}
                  >
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_1px_rgba(52,211,153,0.5)]" />
                  </span>
                </motion.div>
              </div>

              {/* ── Floating feature chips ── */}
              {/* Top-left chip */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute"
                style={{ top: 40, left: 10 }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-mono font-semibold text-amber-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Markdown
                </span>
              </motion.div>

              {/* Top-right chip */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute"
                style={{ top: 30, right: 10 }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-mono font-semibold text-emerald-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Git sync
                </span>
              </motion.div>

              {/* Right chip */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute"
                style={{ top: '50%', right: 0, transform: 'translateY(-50%)' }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-mono font-semibold text-orange-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  No signup
                </span>
              </motion.div>

              {/* Bottom chip */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="absolute"
                style={{ bottom: 36, left: '50%', transform: 'translateX(-50%)' }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-mono font-semibold text-rose-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Local-first
                </span>
              </motion.div>

              {/* Left chip */}
              <motion.div
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute"
                style={{ top: '50%', left: 0, transform: 'translateY(-50%)' }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-mono font-semibold text-sky-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  Free
                </span>
              </motion.div>

              {/* ── Logo itself — centered ── */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex items-center justify-center"
              >
                {/* Glow halo behind logo */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 230, height: 230,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(139,92,246,0.12) 60%, transparent 80%)',
                    filter: 'blur(20px)',
                  }}
                />
                {/* Logo image — 2.5× bigger */}
                <img
                  src="/logo.png"
                  alt="SprintMagic"
                  width="240"
                  height="240"
                  className="relative drop-shadow-[0_12px_36px_rgba(99,102,241,0.35)]"
                  style={{ width: 240, height: 240, objectFit: 'contain' }}
                />
              </motion.div>

              {/* ── Sparkle dots scattered ── */}
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
                className="absolute"
                style={{ top: 80, right: 60 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </motion.span>

              <motion.span
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.7, 1.2, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute"
                style={{ bottom: 70, right: 50 }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </motion.span>

              <motion.span
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.4, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute"
                style={{ top: 100, left: 55 }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </motion.span>
            </motion.div>
              </div>
            </div>
          </div>

          {/* ── Feature grid (3-col with border-lines, autosend style) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 md:mb-20 border-x border-stone-200"
          >
            <ul className="grid grid-cols-1 sm:grid-cols-3 border-t border-b border-stone-200">
              {[
                {
                  heading: 'Markdown Board',
                  body: 'Write `## Column` + `- [ ] tasks` and watch a drag-and-drop sprint board appear instantly.',
                },
                {
                  heading: 'Git Sync',
                  body: 'Open a PR, watch the card move to Review automatically. No manual status updates ever.',
                },
                {
                  heading: 'Local-first',
                  body: 'No account. No server. Your board lives in your browser — export it as a .md file anytime.',
                },
              ].map((f, i) => (
                <li
                  key={i}
                  className={`flex flex-col border-b border-stone-200 sm:border-b-0 ${i < 2 ? 'sm:border-r border-stone-200' : ''}`}
                >
                  <div className="flex flex-col gap-2 px-4 sm:px-6 py-6 flex-1 bg-white">
                    <p className="text-stone-800 font-mono font-medium text-sm uppercase">{f.heading}</p>
                    <p className="text-stone-500 font-normal text-sm leading-relaxed">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-10 md:my-20 border-x border-stone-200"
          >
            <div className="border-t border-b border-stone-200">
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-stone-200">
                {STATS.map((s, i) => (
                  <div
                    key={i}
                    className={`flex flex-col justify-center gap-2 px-4 sm:px-6 py-6 border-stone-200
                      ${i % 2 === 0 && i < 3 ? 'border-r' : ''}
                      ${i < 2 ? 'border-b md:border-b-0' : ''}
                      ${i === 2 ? 'md:border-r' : ''}
                    `}
                  >
                    <p className="text-stone-900 font-mono font-normal text-2xl text-center">{s.value}</p>
                    <p className="text-stone-500 font-normal text-sm leading-5 text-center">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center px-6 py-4 bg-white border-b border-stone-200">
                <p className="text-stone-700 font-mono font-medium text-xs uppercase leading-5 text-center tracking-wide">
                  Used by solo devs and teams who ship fast
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Features showcase — accordion + mini board ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            className="my-10 md:my-20 flex flex-col gap-20"
          >
            <div className="flex flex-col border-x border-t border-stone-200">
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-stone-200 px-4 md:px-6 py-6">
                <div className="flex flex-col gap-2 md:gap-4">
                  <p className="text-amber-500 font-mono font-medium text-sm uppercase leading-4">
                    #01 — Core Features
                  </p>
                  <h2 className="font-display text-[28px] md:text-[36px] leading-[1.2] text-stone-900">
                    Everything you need,{' '}
                    <em className="not-italic text-stone-400">nothing you don't.</em>
                  </h2>
                </div>
              </div>

              {/* Desktop: tabs left, mini board right */}
              <div className="hidden md:grid md:grid-cols-2 md:h-[460px] overflow-hidden border-b border-stone-200">
                <div className="md:border-r border-stone-200 flex flex-col divide-y divide-stone-200">
                  {FEATURES.map((f, i) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFeature(i)}
                      className={`relative isolate flex items-start gap-4 p-6 text-left cursor-pointer flex-grow transition-colors ${
                        activeFeature === i ? 'bg-white' : 'bg-stone-50 hover:bg-stone-100'
                      }`}
                    >
                      {activeFeature === i && (
                        <div className="absolute left-0 inset-y-0 w-[3px] bg-amber-500 rounded-r" />
                      )}
                      <span className={`shrink-0 mt-0.5 ${activeFeature === i ? 'text-amber-600' : 'text-stone-400'}`}>
                        {f.icon}
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className={`font-mono font-medium text-sm uppercase leading-4 ${activeFeature === i ? 'text-stone-900' : 'text-stone-600'}`}>
                          {f.label}
                        </p>
                        {activeFeature === i && (
                          <motion.p
                            key={f.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-stone-500 font-normal text-sm leading-relaxed"
                          >
                            {f.description}
                          </motion.p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right: live mini board preview */}
                <div className="flex flex-col bg-stone-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeFeature}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                      >
                        <MiniBoard />
                        <div className="mt-4 text-center">
                          <p className={`font-display text-lg font-semibold ${FEATURES[activeFeature].color}`}>
                            {FEATURES[activeFeature].title}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Mobile: stacked accordion */}
              <div className="flex md:hidden flex-col divide-y divide-stone-200 border-b border-stone-200">
                {FEATURES.map((f, i) => (
                  <div key={f.id}>
                    <button
                      onClick={() => setActiveFeature(activeFeature === i ? -1 : i)}
                      className={`flex items-center gap-3 w-full px-4 py-4 text-left transition-colors ${
                        activeFeature === i ? 'bg-white' : 'bg-stone-50'
                      }`}
                    >
                      <span className={activeFeature === i ? 'text-amber-600' : 'text-stone-400'}>
                        {f.icon}
                      </span>
                      <p className="font-mono font-medium text-sm uppercase flex-1">
                        {f.label}
                      </p>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`h-4 w-4 text-stone-500 transition-transform ${activeFeature === i ? 'rotate-180' : ''}`}
                      >
                        <path d="M18 9C18 9 13.58 15 12 15C10.42 15 6 9 6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {activeFeature === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-4 py-4 bg-white"
                      >
                        <p className="text-stone-500 text-sm leading-relaxed">{f.description}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── CTA Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            className="my-10 md:my-20 border border-stone-200"
          >
            <div className="grid md:grid-cols-2 border-b border-stone-200">
              <div className="px-6 py-10 md:py-16 border-b md:border-b-0 md:border-r border-stone-200 bg-white">
                <p className="font-mono text-xs font-semibold uppercase text-amber-500 mb-3 tracking-wide">
                  Get started free
                </p>
                <h2 className="font-display text-[28px] md:text-[36px] leading-[1.2] text-stone-900">
                  Plan your next sprint{' '}
                  <em className="not-italic text-stone-400">in plain text.</em>
                </h2>
                <p className="mt-4 text-stone-500 text-base leading-relaxed max-w-sm">
                  No account, no install. Open it, edit the sample, or drop your own Markdown — export it back anytime.
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <button
                    onClick={onStart}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase text-sm rounded-xl px-5 py-2.5 text-stone-50 bg-amber-500 border border-amber-600 hover:bg-amber-600 transition-all active:scale-95"
                  >
                    Open the board — it's free
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right column: Logo + product card centered */}
              <div className="flex flex-col items-center justify-center px-6 py-10 bg-stone-100 gap-6">
                <div className="flex flex-col items-center gap-4">
                  {/* Big logo with glow */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 140, height: 140,
                        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.08) 60%, transparent 80%)',
                        filter: 'blur(16px)',
                      }}
                    />
                    <img
                      src="/logo.png"
                      alt="SprintMagic"
                      width="120"
                      height="120"
                      className="relative drop-shadow-[0_8px_20px_rgba(99,102,241,0.28)]"
                      style={{ width: 120, height: 120, objectFit: 'contain' }}
                    />
                  </div>
                  <p className="font-mono font-bold text-base uppercase tracking-wide text-stone-800">SprintMagic</p>
                  <p className="font-normal text-sm text-stone-500 text-center max-w-xs">
                    Markdown-native sprint boards that sync with git. Runs entirely in your browser.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['No signup', 'Local-first', 'Export anytime', 'Git sync'].map((tag) => (
                    <span key={tag} className="rounded-full border border-stone-200 bg-white px-3 py-1 font-mono text-[10px] font-semibold uppercase text-stone-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── AI Agents Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            className="mb-10 md:mb-20 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 px-8 py-10 md:px-12 md:py-12">
              <div className="flex-1 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 w-fit shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-orange-500" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-orange-600">Built for the AI era</span>
                </div>
                <h2 className="font-display text-[28px] md:text-[32px] leading-[1.2] text-stone-900 tracking-tight">
                  Coding with AI / AI Agents?
                  <br />
                  <span className="text-stone-500">Plan, Track and Manage with SprintMagic.</span>
                </h2>
                <p className="text-stone-600 text-base leading-relaxed">
                  Ask your AI to create a <code className="rounded bg-white px-1.5 py-0.5 border border-stone-200 font-mono text-sm text-orange-600">.md</code> file and provide it the template to follow from SprintMagic. The AI can manage your tasks directly in the board source code!
                </p>
              </div>
              <div className="flex-none flex items-center justify-center p-6 bg-white rounded-xl border border-orange-100 shadow-sm transform md:rotate-2">
                <pre className="text-left font-mono text-[11px] leading-5 text-stone-600">
                  <span className="text-emerald-500">## In Progress</span><br/>
                  <span className="text-stone-400">- [ ] SM-12 Let AI fix styling</span><br/>
                  <span className="text-stone-400">- [ ] SM-13 Optimize the loop</span><br/>
                  <br/>
                  <span className="text-emerald-500">## Done</span><br/>
                  <span className="text-stone-400">- [x] SM-10 Set up DB schemas</span>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-stone-200 bg-white mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SprintMagic" width="18" height="18" className="h-[18px] w-[18px] object-contain opacity-60" />
            <span className="font-mono text-xs font-semibold uppercase text-stone-400 tracking-wide">SprintMagic</span>
          </div>
          <p className="text-stone-400 text-xs font-mono text-center">
            Runs entirely in your browser · Your board is always a file you own
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onAbout}
              className="font-mono text-xs font-semibold uppercase text-stone-400 hover:text-stone-600 transition-colors"
            >
              About
            </button>
            <button
              onClick={onStart}
              className="font-mono text-xs font-semibold uppercase text-amber-500 hover:text-amber-700 transition-colors"
            >
              Open app →
            </button>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
