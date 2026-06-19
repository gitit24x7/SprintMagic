import { motion } from 'framer-motion'
import type { Board, Column } from '../types'
import { cardMatches } from '../lib/filter'
import { NO_EPIC, epicColor } from '../lib/ui'
import { CardBody } from './CardItem'

interface Props {
  columns: Column[]
  mode: Board['mode']
  query: string
  priorityStyle?: Board['priorityStyle']
  onToggleDone: (cardId: string) => void
  onOpenCard: (cardId: string) => void
}

export function EpicSwimlanes({
  columns,
  mode,
  query,
  priorityStyle,
  onToggleDone,
  onOpenCard,
}: Props) {
  // Collect epics in first-seen order; cards with no epic go last.
  const order: string[] = []
  const seen = new Set<string>()
  for (const col of columns) {
    for (const card of col.cards) {
      const e = card.epic || NO_EPIC
      if (!seen.has(e)) {
        seen.add(e)
        order.push(e)
      }
    }
  }
  order.sort((a, b) => (a === NO_EPIC ? 1 : b === NO_EPIC ? -1 : 0))

  const lanes = order
    .map((epic) => {
      const cells = columns.map((col) => ({
        col,
        cards: col.cards.filter(
          (c) => (c.epic || NO_EPIC) === epic && cardMatches(c, query),
        ),
      }))
      const total = cells.reduce((n, c) => n + c.cards.length, 0)
      return { epic, cells, total }
    })
    .filter((lane) => lane.total > 0)

  if (lanes.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-[13px] text-zinc-400">
        No cards match your search.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {lanes.map(({ epic, cells, total }) => {
        const color = epicColor(epic)
        return (
          <motion.div
            key={epic}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-line bg-white/50"
          >
            <div className={`flex items-center gap-2 px-4 py-2.5 ${color.soft}`}>
              <span className={`h-2 w-2 rounded-full ${color.dot}`} />
              <h3 className={`text-[13px] font-semibold ${color.text}`}>
                {epic}
              </h3>
              <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
                {total}
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto p-4">
              {cells.map(({ col, cards }) => (
                <div key={col.id} className="flex w-64 flex-none flex-col">
                  <div className="mb-2 flex items-center gap-1.5 px-1">
                    <span className="text-[11.5px] font-medium text-zinc-500">
                      {col.name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {cards.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {cards.map((card) => (
                      <CardBody
                        key={card.id}
                        card={card}
                        mode={mode}
                        priorityStyle={priorityStyle}
                        onToggleDone={() => onToggleDone(card.id)}
                        onOpen={() => onOpenCard(card.id)}
                      />
                    ))}
                    {cards.length === 0 && (
                      <div className="rounded-lg border border-dashed border-line py-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
