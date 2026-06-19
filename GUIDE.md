# SprintMagic — User Guide

**Your sprint board is just a Markdown file.** Plan in plain text, get a
beautiful Jira-style board — that can update itself from your git activity. No
signup, and your data never leaves your browser.

This guide gets you productive in a few minutes. (Inside the app, click the
**?** in the top bar for the same cheat sheet at any time.)

---

## 1. The 30-second version

1. **Pick a template** from the board switcher (top-left) — Sprint, Kanban,
   Personal to-do, Bug triage, Roadmap, Content calendar, or Blank.
2. **Drag cards** between columns, or **click a card** to edit its details.
3. Toggle **Source** to write Markdown instead — the board and the text stay in
   sync, both ways.
4. Everything **saves to your browser** automatically. **Export** to a `.md`
   file whenever you want — you always own your data.

That's the whole loop. The rest of this guide is reference.

---

## 2. Writing a board in Markdown

A board is a Markdown file. Here's a tiny but complete one:

```markdown
---
type: sprint
title: "Auth & Onboarding"
start: 2026-06-12
end: 2026-06-26
phases: [Backlog, In Progress, Review, Done]
---

## In Progress
- [ ] Build login form @alice ~2026-06-15 !high *5 ^Login
  Standard email + password form with inline validation.
  - [ ] Email + password fields
  - [ ] "Remember me" checkbox

## Done
- [x] Set up DB schema %task @bob *3 ^Infra
```

### Frontmatter (the `---` block)

| Key | Meaning |
| --- | --- |
| `type` | `sprint` (shows dates + goal) or `kanban` (continuous flow) |
| `title` | The board name |
| `start` / `end` | Sprint dates (sprint boards) |
| `phases` | The column order, e.g. `[Backlog, In Progress, Done]` |
| `key` | Issue-key prefix, e.g. `SM` → issues become `SM-1`, `SM-2`… |

### Columns and issues

- `## Column Name` — a column (a status).
- `- [ ] Task title` — an **issue**. `- [x]` marks it done.
- Indent a checkbox under an issue → a **sub-task**.
- Indent plain text under an issue → its **description**.

### Inline tokens (all optional, combine freely on one line)

| Token | Meaning |
| --- | --- |
| `@alice` | Assignee (repeatable) |
| `~YYYY-MM-DD` | Delivery date |
| `!high` `!med` `!low` | Priority |
| `*5` | Story points |
| `#label` | Label (repeatable) |
| `^Epic` | Epic group — use `^"Two words"` for multi-word |
| `%story` `%task` `%bug` | Issue type (defaults to **story**) |
| `SM-3` (at the start) | Issue key — auto-assigned if you omit it |
| `## Working (3)` | A WIP limit of 3 on that column |

Example combining several:

```markdown
- [ ] SM-7 Fix CSV export %bug @sam ~2026-06-20 !high *3 #data ^Exports
```

Don't worry about memorizing these — edit cards in the UI and the Markdown is
written for you.

---

## 3. Working on the board

- **Drag & drop** cards across columns or reorder within one.
- **Click a card** to edit everything: title, type, priority, due date, epic,
  story points, assignees, labels, description, and sub-tasks.
- **Add** cards with the `+` on a column; **add columns** at the end.
- **Group by epic** to see colored swimlanes instead of status columns.
- **Backlog** lives in a collapsible drawer — drag issues in to defer them.
- **Search** (press `/`) filters by text, `@assignee`, `#label`, `!priority`,
  or `^epic`.
- **WIP limits** turn a column red when you exceed them.

---

## 4. Multiple boards

Use the **board switcher** (top-left) to keep several boards — Work, a
side-project, personal tasks. Each is its own Markdown file. Create new ones
from a template, rename by clicking the board title, and delete from the
switcher. All boards are saved in your browser.

---

## 5. Sync from git (the magic part)

Issues can move themselves based on what you do in git. Each issue has a key
(like `SM-3`); reference it in a branch or PR, and the board follows:

| Git activity | The issue moves to |
| --- | --- |
| a **branch** exists | In Progress |
| an **open PR** | Review |
| a **merged PR** | Done |

Click **Sync from git** to try it — it's a local simulation today (type
`SM-3 pr` and watch the card move). It only ever moves issues **forward**, so a
card you pulled back by hand won't get yanked around. The same logic is designed
to run as a GitHub Action that keeps your board file updated automatically.

---

## 6. Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus search |
| `Esc` | Close a dialog / clear search |
| `Ctrl` / `⌘` + `B` | Toggle the Markdown source panel |

---

## 7. Your data

SprintMagic runs entirely in your browser. Boards are saved to local storage,
and you can **Export** any board to a `.md` file (or **Upload** one) at any
time. Your board is always a plain-text file you own — version it in git, share
it, or open it in any editor.
