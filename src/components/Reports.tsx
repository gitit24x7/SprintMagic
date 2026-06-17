import { useMemo } from 'react'
import type { Board } from '../types'
import { getBoardHistory } from '../lib/history'
import { loadWorkspace } from '../lib/workspace'
import {
  boardStats,
  burndown,
  daysBetween,
  daysLeft,
  statusDistribution,
  velocity,
  type Burndown,
} from '../lib/reports'

interface Props {
  board: Board
  boardId: string
}

const shortDate = (s: string) => {
  const d = new Date(s + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function Reports({ board, boardId }: Props) {
  const stats = useMemo(() => boardStats(board), [board])
  const bd = useMemo(() => burndown(board, getBoardHistory(boardId)), [board, boardId])
  const vel = useMemo(() => velocity(loadWorkspace()?.boards ?? []), [board])
  const dist = useMemo(() => statusDistribution(board), [board])
  const left = daysLeft(board.end)
  const sprintLen =
    board.start && board.end ? daysBetween(board.start, board.end) : null
  const unitLabel = stats.unit === 'points' ? 'pts' : 'issues'

  return (
    <div className="h-full overflow-y-auto px-6 pb-10 pt-4">
      <div className="mx-auto max-w-4xl">
        {stats.total === 0 ? (
          <div className="mt-16 text-center text-[13px] text-stone-400">
            Add issues (with story points) to this board to see reports.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Completed" value={`${stats.done}`} sub={`of ${stats.total} ${unitLabel}`} accent />
              <Stat label="Remaining" value={`${stats.remaining}`} sub={unitLabel} />
              <Stat label="Progress" value={`${stats.pct}%`} sub={`${stats.doneCount}/${stats.totalCount} issues`} />
              <Stat
                label={board.mode === 'sprint' ? 'Days left' : 'Throughput'}
                value={
                  board.mode === 'sprint'
                    ? left != null
                      ? `${left}`
                      : '—'
                    : `${stats.doneCount}`
                }
                sub={
                  board.mode === 'sprint'
                    ? sprintLen != null
                      ? `of ${sprintLen}-day sprint`
                      : 'sprint'
                    : 'issues done'
                }
              />
            </div>

            {/* ── Burndown ── */}
            <Panel title="Burndown" subtitle={bd ? `Work remaining (${bd.unit})` : undefined}>
              {bd ? (
                <BurndownChart bd={bd} />
              ) : (
                <div className="py-10 text-center text-[12.5px] text-stone-400">
                  Burndown needs a sprint with <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px] text-stone-600">start</code> and{' '}
                  <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px] text-stone-600">end</code> dates.
                  This board is {board.mode}.
                </div>
              )}
            </Panel>

            {/* ── Velocity ── */}
            {vel.length > 0 && (
              <Panel title="Velocity" subtitle="Completed story points per sprint board">
                <VelocityChart bars={vel} activeId={boardId} />
              </Panel>
            )}

            {/* ── Status distribution ── */}
            <Panel title="By status" subtitle="Issues per column">
              <StatusBars
                dist={dist}
                unit={stats.unit}
                max={Math.max(
                  1,
                  ...dist.map((d) => (stats.unit === 'points' ? d.points : d.count)),
                )}
              />
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-semibold tracking-tight ${
          accent ? 'text-orange-600' : 'text-stone-900'
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] text-stone-400">{sub}</p>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="flex items-baseline justify-between border-b border-stone-100 px-4 py-3">
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-stone-900">
          {title}
        </h3>
        {subtitle && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
            {subtitle}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function BurndownChart({ bd }: { bd: Burndown }) {
  const W = 640
  const H = 260
  const padL = 36
  const padR = 16
  const padT = 14
  const padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = bd.points.length - 1
  const total = bd.total || 1

  const x = (i: number) => padL + (n === 0 ? 0 : (i / n) * plotW)
  const y = (v: number) => padT + (1 - v / total) * plotH

  const idealPts = bd.points.map((p, i) => `${x(i)},${y(p.ideal)}`).join(' ')
  const actualPts = bd.points
    .map((p, i) => (p.actual == null ? null : `${x(i)},${y(p.actual)}`))
    .filter(Boolean)
    .join(' ')
  const todayIdx = bd.points.findIndex((p) => p.isToday)

  // y gridlines at 0, half, total
  const yTicks = [0, total / 2, total]
  // x labels: first, today (if any), last
  const xLabelIdx = Array.from(
    new Set([0, todayIdx >= 0 ? todayIdx : -1, n].filter((i) => i >= 0)),
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Burndown chart">
      {/* gridlines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} className="stroke-stone-100" strokeWidth="1" />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" className="fill-stone-400 font-mono text-[9px]">
            {Math.round(t)}
          </text>
        </g>
      ))}

      {/* today marker */}
      {todayIdx >= 0 && (
        <line
          x1={x(todayIdx)}
          y1={padT}
          x2={x(todayIdx)}
          y2={padT + plotH}
          className="stroke-orange-200"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}

      {/* ideal */}
      <polyline points={idealPts} fill="none" className="stroke-stone-300" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* actual */}
      {actualPts && (
        <polyline points={actualPts} fill="none" className="stroke-orange-500" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {/* actual dots */}
      {bd.points.map((p, i) =>
        p.actual == null ? null : (
          <circle key={i} cx={x(i)} cy={y(p.actual)} r={p.isToday ? 3.5 : 2.5} className="fill-orange-500" />
        ),
      )}

      {/* x labels */}
      {xLabelIdx.map((i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-stone-400 font-mono text-[9px]">
          {bd.points[i].isToday ? 'today' : shortDate(bd.points[i].date)}
        </text>
      ))}

      {/* legend */}
      <g transform={`translate(${padL + 4}, ${padT + 2})`}>
        <line x1="0" y1="0" x2="14" y2="0" className="stroke-orange-500" strokeWidth="2.5" />
        <text x="18" y="3" className="fill-stone-500 font-mono text-[9px]">actual</text>
        <line x1="64" y1="0" x2="78" y2="0" className="stroke-stone-300" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="82" y="3" className="fill-stone-500 font-mono text-[9px]">ideal</text>
      </g>
    </svg>
  )
}

function VelocityChart({
  bars,
  activeId,
}: {
  bars: { id: string; title: string; committed: number; completed: number }[]
  activeId: string
}) {
  const max = Math.max(1, ...bars.map((b) => b.committed))
  return (
    <div className="flex items-end gap-4 overflow-x-auto pb-1" style={{ minHeight: 160 }}>
      {bars.map((b) => {
        const h = (v: number) => `${(v / max) * 120}px`
        return (
          <div key={b.id} className="flex w-16 flex-none flex-col items-center gap-1.5">
            <span className="font-mono text-[11px] font-semibold text-stone-600">{b.completed}</span>
            <div className="relative flex h-[120px] w-9 items-end justify-center rounded-md bg-stone-100">
              {/* committed (faint) */}
              <div className="absolute bottom-0 w-full rounded-md bg-stone-200" style={{ height: h(b.committed) }} />
              {/* completed (orange) */}
              <div
                className={`absolute bottom-0 w-full rounded-md ${b.id === activeId ? 'bg-orange-500' : 'bg-orange-400/70'}`}
                style={{ height: h(b.completed) }}
              />
            </div>
            <span className="line-clamp-2 text-center text-[10px] leading-tight text-stone-500" title={b.title}>
              {b.title}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function StatusBars({
  dist,
  unit,
  max,
}: {
  dist: { name: string; count: number; points: number }[]
  unit: 'points' | 'issues'
  max: number
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {dist.map((d) => {
        const v = unit === 'points' ? d.points : d.count
        return (
          <div key={d.name} className="flex items-center gap-3">
            <span className="w-28 flex-none truncate text-[12px] font-medium text-stone-600">
              {d.name}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-orange-400"
                style={{ width: `${(v / max) * 100}%` }}
              />
            </div>
            <span className="w-16 flex-none text-right font-mono text-[11px] text-stone-500">
              {d.count} · {d.points}pt
            </span>
          </div>
        )
      })}
    </div>
  )
}
