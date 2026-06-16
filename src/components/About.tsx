import { motion } from 'framer-motion'

interface Props {
  onHome: () => void
  onStart: () => void
}

const PRINCIPLES = [
  {
    number: '01',
    title: 'Markdown is the source of truth',
    body: 'Every board is a plain .md file. Write it in any editor, commit it to git, share it with a link. The board renders from the text — never the other way around.',
    color: 'text-amber-500',
  },
  {
    number: '02',
    title: 'Local-first means you own your data',
    body: "Nothing is sent to a server. Your workspace lives in your browser's localStorage and in files you download. Disconnect from the internet — it still works.",
    color: 'text-emerald-600',
  },
  {
    number: '03',
    title: 'Git is the real project tracker',
    body: 'PRs, branches, commits — your board listens to all of it. When a developer opens a PR, the card moves itself. The board reflects reality, not intention.',
    color: 'text-orange-500',
  },
  {
    number: '04',
    title: 'No bloat, no lock-in',
    body: 'SprintMagic does one thing: turn Markdown into a sprint board. No accounts to manage, no pricing tiers, no enterprise sales calls. Just open and start.',
    color: 'text-rose-500',
  },
]

const STACK = [
  { name: 'React', desc: 'UI framework' },
  { name: 'TypeScript', desc: 'Type safety' },
  { name: 'Vite', desc: 'Build tool' },
  { name: 'Framer Motion', desc: 'Animations' },
  { name: 'Tailwind CSS', desc: 'Styling' },
  { name: 'localStorage', desc: 'Persistence' },
]

export function About({ onHome, onStart }: Props) {
  return (
    <div className="h-full overflow-y-auto bg-stone-50 font-sans">

      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 flex w-full justify-center backdrop-blur-lg bg-stone-50/80 border-b border-stone-200">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-3 h-14 items-center px-6 gap-4">

            {/* Left — logo wordmark */}
            <div className="flex items-center">
              <button
                onClick={onHome}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                aria-label="Go to home"
              >
                <img src="/logo.png" alt="SprintMagic" width="24" height="24" className="h-6 w-6 object-contain" />
                <span className="font-mono text-sm font-semibold uppercase tracking-wide text-stone-800">
                  SprintMagic
                </span>
              </button>
            </div>

            {/* Center — nav links */}
            <nav className="hidden lg:flex items-center justify-center gap-1">
              <button
                onClick={onHome}
                className="flex items-center px-3 py-1 rounded-lg font-mono text-sm font-semibold uppercase text-stone-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200"
              >
                Home
              </button>
              <button
                className="flex items-center px-3 py-1 rounded-lg font-mono text-sm font-semibold uppercase text-amber-600 bg-amber-50 transition-colors duration-200"
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
              {/* Home icon (always visible) */}
              <button
                onClick={onHome}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors lg:hidden"
                aria-label="Home"
                title="Go to home"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 pt-20 pb-12 text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              About SprintMagic
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[36px] lg:text-[60px] leading-[1.1] font-display tracking-tight text-stone-900 max-w-3xl"
            >
              Built for developers who{' '}
              <em className="not-italic bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                hate project management tools.
              </em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-stone-500 text-base md:text-lg max-w-2xl leading-relaxed"
            >
              SprintMagic is a zero-friction sprint board that lives entirely in your browser.
              No signup, no server, no nonsense — just Markdown that becomes a beautiful Jira-style board.
            </motion.p>
          </motion.div>

          {/* ── Principles ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-10 md:my-16 border-x border-stone-200"
          >
            <div className="border-t border-b border-stone-200">
              <div className="flex justify-center items-center px-6 py-4 bg-white border-b border-stone-200">
                <p className="text-stone-700 font-mono font-medium text-xs uppercase leading-5 text-center tracking-wide">
                  Our Core Principles
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 border-stone-200">
                {PRINCIPLES.map((p, i) => (
                  <motion.div
                    key={p.number}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className={`flex flex-col gap-3 px-6 py-8 border-stone-200
                      ${i % 2 === 0 ? 'md:border-r' : ''}
                      ${i < 2 ? 'border-b' : ''}
                    `}
                  >
                    <span className={`font-mono text-xs font-bold uppercase tracking-widest ${p.color}`}>
                      {p.number}
                    </span>
                    <h3 className="font-display text-[18px] font-semibold text-stone-900 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{p.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Tech Stack ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-10 md:my-16 border-x border-stone-200"
          >
            <div className="border-t border-b border-stone-200">
              <div className="flex justify-center items-center px-6 py-4 bg-white border-b border-stone-200">
                <p className="text-stone-700 font-mono font-medium text-xs uppercase leading-5 text-center tracking-wide">
                  Built With
                </p>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border-stone-200">
                {STACK.map((s, i) => (
                  <li
                    key={s.name}
                    className={`flex flex-col items-center gap-1 py-6 px-4 border-stone-200
                      ${i < 5 ? 'border-r' : ''}
                    `}
                  >
                    <p className="font-mono font-semibold text-sm text-stone-800 uppercase">{s.name}</p>
                    <p className="text-stone-400 text-xs">{s.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* ── Philosophy statement ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-10 md:my-16 border border-stone-200"
          >
            <div className="grid md:grid-cols-2 border-b border-stone-200">
              <div className="px-6 py-10 md:py-14 border-b md:border-b-0 md:border-r border-stone-200 bg-white">
                <p className="font-mono text-xs font-semibold uppercase text-amber-500 mb-4 tracking-wide">
                  Philosophy
                </p>
                <blockquote className="font-display text-[22px] md:text-[28px] leading-[1.3] text-stone-800">
                  "The best project management tool is the one your team actually uses."
                </blockquote>
                <p className="mt-6 text-stone-500 text-sm leading-relaxed">
                  SprintMagic exists because great developers hate context-switching into heavyweight tools.
                  If your board is a Markdown file, it lives where your code lives.
                </p>
              </div>
              <div className="px-6 py-10 md:py-14 bg-stone-50">
                <p className="font-mono text-xs font-semibold uppercase text-stone-400 mb-6 tracking-wide">
                  Who it's for
                </p>
                <ul className="flex flex-col gap-4">
                  {[
                    'Solo developers who want sprint structure without Jira',
                    'Small teams that already use git as their source of truth',
                    'Anyone who believes plain text outlasts every SaaS tool',
                    'Developers tired of paying per-seat for a board',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-amber-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      </span>
                      <span className="text-stone-600 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* ── CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-10 md:my-16 border border-stone-200 bg-white"
          >
            <div className="flex flex-col items-center text-center px-6 py-12 gap-6">
              <p className="font-mono text-xs font-semibold uppercase text-amber-500 tracking-wide">
                Ready?
              </p>
              <h2 className="font-display text-[28px] md:text-[36px] leading-[1.2] text-stone-900">
                Open your first board in{' '}
                <em className="not-italic text-stone-400">30 seconds.</em>
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                No sign-up, no install, no credit card. Just open the app, edit the sample board,
                and start shipping your sprint.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={onHome}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase text-sm rounded-xl px-5 py-2.5 border border-stone-200 hover:bg-stone-100 transition-all active:scale-95"
                >
                  ← Back to home
                </button>
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
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-stone-200 bg-white mt-4">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SprintMagic" width="18" height="18" className="h-[18px] w-[18px] object-contain opacity-60" />
            <span className="font-mono text-xs font-semibold uppercase text-stone-400 tracking-wide">SprintMagic</span>
          </div>
          <p className="text-stone-400 text-xs font-mono text-center">
            Runs entirely in your browser · Your board is always a file you own
          </p>
          <button
            onClick={onStart}
            className="font-mono text-xs font-semibold uppercase text-amber-500 hover:text-amber-700 transition-colors"
          >
            Open app →
          </button>
        </div>
      </footer>
    </div>
  )
}
