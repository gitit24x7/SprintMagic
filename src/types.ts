// Domain model: a Markdown file describes one Board.
// `type: sprint` renders the Scrum face (dates, goal); `type: kanban`
// renders the continuous-flow face. The file declares which.

export type BoardMode = 'sprint' | 'kanban'

export type Priority = 'high' | 'med' | 'low'

// Jira-style issue types. Epic is intentionally NOT here — it stays a grouping
// link (the `epic` field) rather than a board issue, matching Jira's Epic Link.
export type IssueType = 'story' | 'task' | 'bug'

export interface SubTask {
  id: string
  title: string
  done: boolean
}

// An Issue (Jira terminology). The board tile is casually a "card", but the
// entity is an Issue with a stable, human-friendly key (e.g. "SM-3").
export interface Card {
  id: string // internal, regenerated each parse
  key?: string // stable issue key, e.g. "SM-3" — persisted in the markdown
  type?: IssueType // defaults to "story" when omitted
  title: string
  done: boolean
  assignees: string[]
  due?: string // ISO date string, e.g. "2026-06-15"
  priority?: Priority
  tags: string[] // "Labels" in the UI
  epic?: string
  points?: number // story points
  description?: string // markdown notes body
  subtasks: SubTask[]
}

export interface Column {
  id: string
  name: string
  cards: Card[]
  wipLimit?: number // kanban only
}

export interface Board {
  mode: BoardMode
  title: string
  start?: string
  end?: string
  keyPrefix: string // issue-key prefix, e.g. "SM"
  columns: Column[]
}

export interface ParseWarning {
  message: string
}

export interface ParseResult {
  board: Board
  warnings: ParseWarning[]
}
