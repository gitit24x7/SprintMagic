import { type Column, type Board } from '../types'
import { cardMatches } from '../lib/filter'
import { getPriorityMeta } from '../lib/ui'

interface Props {
  columns: Column[]
  query: string
  priorityStyle?: Board['priorityStyle']
  onOpenCard: (cardId: string) => void
  onToggleDone: (cardId: string) => void
}

export function ListView({ columns, query, priorityStyle, onOpenCard, onToggleDone }: Props) {
  const cards = columns.flatMap((c) => 
    c.cards.map((card) => ({ card, columnId: c.id, columnName: c.name }))
  )
  const visibleCards = query ? cards.filter((c) => cardMatches(c.card, query)) : cards

  if (visibleCards.length === 0) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <p className="text-[13px] text-zinc-400">No cards match your search.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-stone-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px] text-stone-800">
          <thead className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3 w-20">Key</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 w-28">Priority</th>
              <th className="px-4 py-3 w-24">Assignee</th>
              <th className="px-4 py-3 w-24 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visibleCards.map(({ card, columnName }) => {
              const p = card.priority
              return (
                <tr 
                  key={card.id} 
                  className="group hover:bg-stone-50/50 transition-colors cursor-pointer"
                  onClick={() => onOpenCard(card.id)}
                >
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleDone(card.id)}
                      className="group/check flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 border-stone-300 hover:border-emerald-500 hover:bg-emerald-50 bg-white"
                    >
                      {card.done && (
                        <svg viewBox="0 0 14 14" className="h-3 w-3 text-emerald-500" fill="none">
                          <path d="M3.5 7.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-stone-500">{card.key || '-'}</td>
                  <td className="px-4 py-3 font-medium text-stone-800">
                    <span className={card.done ? 'line-through text-stone-400' : ''}>{card.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                      {columnName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p && (() => {
                      const meta = getPriorityMeta(p, priorityStyle)
                      return (
                        <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${meta.chip}`}>
                          {meta.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {card.assignees.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-400" />
                        {card.assignees[0]}
                        {card.assignees.length > 1 && ` +${card.assignees.length - 1}`}
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] text-stone-500">
                    {card.points ? `${card.points} pts` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
