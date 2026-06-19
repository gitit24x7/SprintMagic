<div align="center">
  <img src="public/logo.png" width="120" alt="SprintMagic Logo" />
  <h1>SprintMagic</h1>
  <p><strong>Jira is bloated. Linear is overkill. SprintMagic is a lightning-fast, zero-backend, Git-synced sprint board powered entirely by a single Markdown file.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/sprintmagic"><img src="https://img.shields.io/npm/v/sprintmagic?color=emerald&style=flat-square" alt="NPM Version" /></a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  </p>

  <p>
    <code>#markdown</code> <code>#kanban</code> <code>#project-management</code> <code>#git-sync</code> <code>#zero-backend</code> <code>#local-first</code>
  </p>
</div>

## ✨ Why SprintMagic?
Stop wrestling with complex tracking tools. Plan your sprints in plain text and get a beautiful, premium drag-and-drop board that stays perfectly in sync with your GitHub workflow. Your data never leaves your repository, and your absolute source of truth is always just a `.md` file you own. 

Perfect for indie hackers, small teams, and open-source projects looking for maximum velocity with zero friction.

## 🚀 Quick Start (One Command)

Drop this command into your repository terminal to initialize SprintMagic:

```bash
npx sprintmagic init
```

**What this does:**
1. **Creates `board.md`**: Generates a standard SprintMagic markdown file in your repo.
2. **Sets up Git Sync**: Installs a GitHub Action workflow (`.github/workflows/sprintmagic.yml`) to automatically sync PRs and branch activity to your board.

That's it. Your branch merges and pull requests will now automatically move your tasks across columns.

## 🌟 Features

*   📝 **Markdown-Native Board:** Write `## Column` + `- [ ] task` and watch a beautiful drag-and-drop Kanban board parse instantly.
*   🔄 **GitHub Auto-Sync:** Open a PR? The card moves to "In Review". PR merged? The card moves to "Done". Complete automation.
*   🔥 **Premium Design:** Beautiful micro-animations, customizable P0-P2 priority tags, dynamic swimlanes, and smooth hover states.
*   🔒 **100% Privacy & Local-First:** No accounts, no database, no servers. Your board is parsed completely locally in your browser.
*   🤖 **AI-Agent Native:** Built for the AI coding era. Ask Cursor, Copilot, or Antigravity to manage your tasks simply by editing the `board.md` file.
*   🎟️ **Agile Without Bloat:** Epics, Sprints, Sub-tasks, Story points, Assignees, and Due Dates (with overdue highlighting!) natively supported.

## 💻 Running the UI Locally

If you want to run the standalone SprintMagic Web UI locally:

```bash
# Clone the repository
git clone https://github.com/gitit24x7/SprintMagic.git
cd SprintMagic

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 🛠️ Built With
- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- dnd-kit

## 👨‍💻 Author
Built with ❤️ by **Aditya Ojha**.

## 📄 License
This project is open-source under the MIT License.
