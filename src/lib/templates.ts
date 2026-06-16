import type { BoardMode } from '../types'
import { SAMPLE_KANBAN, SAMPLE_SPRINT } from './sample'

// Ready-made boards so a new user starts somewhere useful instead of a blank
// page. Each is just SprintMagic Markdown — picking one creates a new board.

export interface Template {
  id: string
  name: string
  emoji: string
  description: string
  mode: BoardMode
  markdown: string
}

const BLANK = `---
type: kanban
title: "Untitled board"
phases: [To Do, In Progress, Done]
---
`

const PERSONAL = `---
type: kanban
title: "My Tasks"
key: T
phases: [Today, This Week, Later, Done]
---

## Today
- [ ] Reply to important emails !high
- [ ] 30-minute walk

## This Week
- [ ] Book dentist appointment ~2026-06-20
- [ ] Draft blog post #writing

## Later
- [ ] Plan weekend trip
- [ ] Tidy up photo library

## Done
- [x] Pay rent
`

const BUGS = `---
type: kanban
title: "Bug Triage"
key: BUG
phases: [Reported, Triaged, In Progress, Fixed]
---

## Reported
- [ ] Login button unresponsive on Safari %bug !high #frontend
- [ ] CSV export drops the last row %bug #data

## Triaged
- [ ] Avatar upload fails over 5 MB %bug !med @sam

## In Progress
- [ ] Wrong timezone offset in reports %bug @priya #backend

## Fixed
- [x] Crash on empty search query %bug
`

const ROADMAP = `---
type: kanban
title: "Product Roadmap"
key: RM
phases: [Now, Next, Later, Shipped]
---

## Now
- [ ] Realtime collaboration ^Collab !high *8
- [ ] Mobile-responsive board ^Mobile *5

## Next
- [ ] Slack integration ^Integrations *5
- [ ] Dark mode ^Polish *3

## Later
- [ ] Public API ^Integrations
- [ ] Custom fields ^Power-users

## Shipped
- [x] Markdown import ^Core
`

const CONTENT = `---
type: kanban
title: "Content Calendar"
key: POST
phases: [Ideas, Drafting, Review, Published]
---

## Ideas
- [ ] "Why we went Markdown-native" #blog
- [ ] Tutorial: a board from your PRD #blog @lee

## Drafting
- [ ] Launch announcement ~2026-06-22 @priya !high

## Review
- [ ] Newsletter #6 @sam ~2026-06-19

## Published
- [x] Changelog v0.3 #release
`

export const TEMPLATES: Template[] = [
  {
    id: 'sprint',
    name: 'Sprint planning',
    emoji: '🏃',
    description: 'Scrum sprint with backlog, story points, epics & dates.',
    mode: 'sprint',
    markdown: SAMPLE_SPRINT,
  },
  {
    id: 'kanban',
    name: 'Kanban flow',
    emoji: '🧊',
    description: 'Continuous flow for support, ops, or small teams.',
    mode: 'kanban',
    markdown: SAMPLE_KANBAN,
  },
  {
    id: 'personal',
    name: 'Personal to-do',
    emoji: '✅',
    description: 'A simple Today / This Week / Later task list.',
    mode: 'kanban',
    markdown: PERSONAL,
  },
  {
    id: 'bugs',
    name: 'Bug triage',
    emoji: '🐛',
    description: 'Report, triage, and squash bugs by status.',
    mode: 'kanban',
    markdown: BUGS,
  },
  {
    id: 'roadmap',
    name: 'Product roadmap',
    emoji: '🗺️',
    description: 'Plan what’s coming: Now / Next / Later / Shipped.',
    mode: 'kanban',
    markdown: ROADMAP,
  },
  {
    id: 'content',
    name: 'Content calendar',
    emoji: '✍️',
    description: 'Take posts from idea to published.',
    mode: 'kanban',
    markdown: CONTENT,
  },
  {
    id: 'blank',
    name: 'Blank board',
    emoji: '⬜',
    description: 'Start from scratch with three empty columns.',
    mode: 'kanban',
    markdown: BLANK,
  },
]
