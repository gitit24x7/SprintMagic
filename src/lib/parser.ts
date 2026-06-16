import type {
  Board,
  BoardMode,
  Card,
  Column,
  IssueType,
  ParseResult,
  ParseWarning,
  Priority,
} from '../types'

// ---------------------------------------------------------------------------
// SprintMagic Markdown spec
// ---------------------------------------------------------------------------
// Optional frontmatter (between `---` fences):
//   type:   sprint | kanban        (missing -> defaults to kanban)
//   title:  "My Sprint"
//   start:  2026-06-12             (sprint only)
//   end:    2026-06-26             (sprint only)
//   phases: [Backlog, In Progress, Review, Done]   -> column order
//
// Body:
//   ## Column Name                 -> a column
//   - [ ] task text                -> a card (unchecked)
//   - [x] task text                -> a card (done)
//     - [ ] subtask                -> indented -> a sub-task of the card above
//
// Inline tokens inside a card line:
//   @name           -> assignee (repeatable)
//   ~2026-06-15     -> due date
//   !high|!med|!low -> priority
//   #tag            -> label (repeatable)
//   ^Epic           -> epic (use ^"Two words" for multi-word)
//   *3              -> story-point estimate
//
//   Indented prose under a card (not a checkbox) -> the card's description.
//   ## Working (3)  -> column "Working" with a WIP limit of 3.
// ---------------------------------------------------------------------------

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${idCounter++}`

interface Frontmatter {
  type?: string
  title?: string
  start?: string
  end?: string
  key?: string
  phases?: string[]
}

function stripQuotes(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const match = raw.match(/^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/)
  if (!match) return { fm: {}, body: raw }

  const fm: Frontmatter = {}
  const lines = match[1].split(/\r?\n/)
  for (const line of lines) {
    const kv = line.match(/^\s*([a-zA-Z_]+)\s*:\s*(.*)$/)
    if (!kv) continue
    const key = kv[1].toLowerCase()
    const value = kv[2].trim()
    if (!value) continue

    if (key === 'phases') {
      const inner = value.replace(/^\[/, '').replace(/\]$/, '')
      fm.phases = inner
        .split(',')
        .map((p) => stripQuotes(p))
        .filter(Boolean)
    } else if (key === 'type') {
      fm.type = stripQuotes(value).toLowerCase()
    } else if (key === 'key') {
      fm.key = stripQuotes(value)
    } else if (key === 'title') {
      fm.title = stripQuotes(value)
    } else if (key === 'start') {
      fm.start = stripQuotes(value)
    } else if (key === 'end') {
      fm.end = stripQuotes(value)
    }
  }

  return { fm, body: raw.slice(match[0].length) }
}

const PRIORITIES: Priority[] = ['high', 'med', 'low']
const ISSUE_TYPES: IssueType[] = ['story', 'task', 'bug']

type CardFields = Pick<
  Card,
  'key' | 'type' | 'title' | 'assignees' | 'due' | 'priority' | 'tags' | 'epic' | 'points'
>

function parseCardLine(text: string): CardFields {
  const assignees: string[] = []
  const tags: string[] = []
  let key: string | undefined
  let type: IssueType | undefined
  let due: string | undefined
  let priority: Priority | undefined
  let epic: string | undefined
  let points: number | undefined

  let title = text

  // Leading issue key, e.g. "SM-3 Build login form".
  const keyMatch = title.match(/^\s*([A-Z][A-Z0-9]*-\d+)\s+/)
  if (keyMatch) {
    key = keyMatch[1]
    title = title.slice(keyMatch[0].length)
  }

  // %story | %task | %bug  (issue type)
  title = title.replace(/(?:^|\s)%(story|task|bug)\b/gi, (_, t) => {
    const lowered = t.toLowerCase() as IssueType
    if (ISSUE_TYPES.includes(lowered)) type = lowered
    return ' '
  })

  // *3  (story points)
  title = title.replace(/(?:^|\s)\*(\d+)\b/g, (_, n) => {
    points = Number(n)
    return ' '
  })

  // ^"Multi word epic" or ^EpicSlug
  title = title.replace(
    /(?:^|\s)\^(?:"([^"]+)"|([\w-]+))/g,
    (_, quoted, slug) => {
      epic = quoted ?? slug
      return ' '
    },
  )

  // ~YYYY-MM-DD  (due date)
  title = title.replace(/(?:^|\s)~(\d{4}-\d{2}-\d{2})\b/g, (_, d) => {
    due = d
    return ' '
  })

  // !high | !med | !low  (priority)
  title = title.replace(/(?:^|\s)!(high|med|low)\b/gi, (_, p) => {
    const lowered = p.toLowerCase() as Priority
    if (PRIORITIES.includes(lowered)) priority = lowered
    return ' '
  })

  // @assignee
  title = title.replace(/(?:^|\s)@([\w.-]+)/g, (_, name) => {
    assignees.push(name)
    return ' '
  })

  // #tag
  title = title.replace(/(?:^|\s)#([\w-]+)/g, (_, tag) => {
    tags.push(tag)
    return ' '
  })

  title = title.replace(/\s{2,}/g, ' ').trim()

  return { key, type, title, assignees, due, priority, tags, epic, points }
}

// Matches a checkbox list item, capturing leading indent so we can tell
// top-level cards (no/low indent) from nested sub-tasks (deeper indent).
const ITEM_RE = /^(\s*)[-*]\s+\[([ xX])\]\s+(.*)$/

export function parseMarkdown(raw: string): ParseResult {
  idCounter = 0
  const warnings: ParseWarning[] = []
  const { fm, body } = parseFrontmatter(raw)

  let mode: BoardMode = 'kanban'
  if (fm.type === 'sprint' || fm.type === 'kanban') {
    mode = fm.type
  } else if (fm.type) {
    warnings.push({
      message: `Unknown type "${fm.type}" — defaulting to kanban.`,
    })
  }

  const columns: Column[] = []
  const columnByName = new Map<string, Column>()
  const ensureColumn = (name: string): Column => {
    const key = name.toLowerCase()
    let col = columnByName.get(key)
    if (!col) {
      col = { id: nextId('col'), name, cards: [] }
      columnByName.set(key, col)
      columns.push(col)
    }
    return col
  }

  if (fm.phases) {
    for (const phase of fm.phases) ensureColumn(phase)
  }

  let current: Column | null = null
  let lastCard: Card | null = null
  let cardIndent = 0
  let descLines: string[] = []

  const finalizeDesc = () => {
    if (lastCard && descLines.length) {
      const text = descLines.join('\n').trim()
      if (text) lastCard.description = text
    }
    descLines = []
  }

  const indentOf = (s: string) =>
    (s.match(/^(\s*)/)?.[1] ?? '').replace(/\t/g, '  ').length

  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      finalizeDesc()
      let name = heading[1]
      let wip: number | undefined
      const wm = name.match(/^(.*?)\s*\((\d+)\)\s*$/)
      if (wm) {
        name = wm[1].trim()
        wip = Number(wm[2])
      }
      current = ensureColumn(name)
      if (wip !== undefined) current.wipLimit = wip
      lastCard = null
      continue
    }

    const item = line.match(ITEM_RE)
    if (item) {
      const indent = item[1].replace(/\t/g, '  ').length
      const done = item[2].toLowerCase() === 'x'
      const text = item[3]

      // Deeper-indented checkbox under an existing card -> sub-task.
      if (lastCard && indent > cardIndent) {
        lastCard.subtasks.push({
          id: nextId('sub'),
          title: parseCardLine(text).title,
          done,
        })
        continue
      }

      // New top-level card.
      finalizeDesc()
      if (!current) current = ensureColumn('Tasks')
      const card: Card = {
        id: nextId('card'),
        done,
        subtasks: [],
        ...parseCardLine(text),
      }
      current.cards.push(card)
      lastCard = card
      cardIndent = indent
      continue
    }

    // Non-item line.
    if (line.trim() === '') {
      if (lastCard) descLines.push('')
      continue
    }
    // Indented prose under a card -> description; otherwise it ends the card.
    if (lastCard && indentOf(line) > cardIndent) {
      descLines.push(line.trim())
    } else {
      finalizeDesc()
      lastCard = null
    }
  }
  finalizeDesc()

  if (columns.length === 0) {
    warnings.push({
      message:
        'No columns found. Add `## Column Name` headings with `- [ ]` tasks.',
    })
  }

  // Every issue gets a stable key. Honour any keys already in the file, then
  // stamp keyless issues with the next free number for the prefix.
  const keyPrefix = (fm.key || 'SM').trim() || 'SM'
  const keyRe = new RegExp(`^${keyPrefix}-(\\d+)$`)
  let maxNum = 0
  for (const col of columns) {
    for (const card of col.cards) {
      const m = card.key?.match(keyRe)
      if (m) maxNum = Math.max(maxNum, Number(m[1]))
    }
  }
  for (const col of columns) {
    for (const card of col.cards) {
      if (!card.key) card.key = `${keyPrefix}-${++maxNum}`
    }
  }

  const board: Board = {
    mode,
    title: fm.title || 'Untitled board',
    start: fm.start,
    end: fm.end,
    keyPrefix,
    columns,
  }

  return { board, warnings }
}
