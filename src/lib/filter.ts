import type { Card } from '../types'

// Lightweight free-text filter across a card's searchable fields. Supports
// bare substrings plus the same token prefixes used in the markdown:
//   @alice   -> assignee   #auth -> tag   !high -> priority   ^epic -> epic
export function cardMatches(card: Card, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return true

  const terms = q.split(/\s+/)
  return terms.every((term) => {
    if (term.startsWith('@')) {
      const n = term.slice(1)
      return card.assignees.some((a) => a.toLowerCase().includes(n))
    }
    if (term.startsWith('#')) {
      const n = term.slice(1)
      return card.tags.some((t) => t.toLowerCase().includes(n))
    }
    if (term.startsWith('!')) {
      return (card.priority ?? '').toLowerCase().includes(term.slice(1))
    }
    if (term.startsWith('^')) {
      return (card.epic ?? '').toLowerCase().includes(term.slice(1))
    }
    const haystack = [
      card.title,
      card.epic ?? '',
      ...card.assignees,
      ...card.tags,
      ...card.subtasks.map((s) => s.title),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(term)
  })
}
