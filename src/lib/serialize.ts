import type { Board, Card } from '../types'

// Turn a Board back into SprintMagic-flavoured Markdown. This is the inverse
// of parseMarkdown — the board is the source of truth, this regenerates the
// file for export and for the source panel.

function cardLine(card: Card): string {
  const box = card.done ? '[x]' : '[ ]'
  // Leading key, then title; "story" is the default type so it stays implicit.
  const head = card.key ? `${card.key} ${card.title.trim()}` : card.title.trim()
  const parts: string[] = [head]

  if (card.type && card.type !== 'story') parts.push(`%${card.type}`)
  for (const a of card.assignees) parts.push(`@${a}`)
  if (card.due) parts.push(`~${card.due}`)
  if (card.priority) parts.push(`!${card.priority}`)
  if (typeof card.points === 'number') parts.push(`*${card.points}`)
  for (const t of card.tags) parts.push(`#${t}`)
  if (card.epic) {
    parts.push(/\s/.test(card.epic) ? `^"${card.epic}"` : `^${card.epic}`)
  }

  return `- ${box} ${parts.join(' ')}`.trimEnd()
}

export function boardToMarkdown(board: Board): string {
  const fm: string[] = ['---', `type: ${board.mode}`, `title: "${board.title}"`]
  if (board.start) fm.push(`start: ${board.start}`)
  if (board.end) fm.push(`end: ${board.end}`)
  if (board.keyPrefix && board.keyPrefix !== 'SM') fm.push(`key: ${board.keyPrefix}`)
  if (board.priorityStyle && board.priorityStyle !== 'default') fm.push(`priorityStyle: ${board.priorityStyle}`)
  fm.push(`phases: [${board.columns.map((c) => c.name).join(', ')}]`)
  fm.push('---', '')

  const body: string[] = []
  for (const col of board.columns) {
    const heading =
      typeof col.wipLimit === 'number'
        ? `## ${col.name} (${col.wipLimit})`
        : `## ${col.name}`
    body.push(heading)
    for (const card of col.cards) {
      body.push(cardLine(card))
      if (card.description) {
        for (const line of card.description.split('\n')) {
          body.push(line.trim() ? `  ${line.trim()}` : '')
        }
      }
      for (const sub of card.subtasks) {
        body.push(`  - ${sub.done ? '[x]' : '[ ]'} ${sub.title.trim()}`)
      }
    }
    body.push('')
  }

  return [...fm, ...body].join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}
