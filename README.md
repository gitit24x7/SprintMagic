<div align="center">
  <img src="public/logo.png" width="120" alt="SprintMagic Logo" />
  <h1>SprintMagic</h1>
  <p><strong>Your sprint board is just a Markdown file.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/sprintmagic"><img src="https://img.shields.io/npm/v/sprintmagic?color=emerald&style=flat-square" alt="NPM Version" /></a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  </p>
</div>

## ✨ Why SprintMagic?
Plan in plain text, get a beautiful Jira-style drag-and-drop board that updates itself from your git activity. Your data never leaves your browser, and your source of truth is always a single `.md` file you own.

## 🚀 Quick Start (One Command)

Your board updates itself from git. Run one command in your repo. From then on, your branches, pull requests and merges move issues on their own — no backend, nothing leaves your repo.

```bash
npx sprintmagic init
```

**What this does:**
1. Creates a `board.md` file in your repository.
2. Sets up a GitHub Workflow (`.github/workflows/sprintmagic.yml`) to automatically sync PRs and branch activity to your board.

That's it. Your board now updates itself.

## 🌟 Features

*   📝 **Markdown-Native Board:** Write `## Column` + `- [ ] task` and watch a drag-and-drop sprint board appear instantly.
*   🔄 **Git Sync Auto-Updates:** Open a PR, watch the card move to "In Review" automatically. Merged PRs move to "Done". No manual status updates ever.
*   🔒 **Privacy First & Local:** No account. No server. Your board lives in your browser or your local repo.
*   🤖 **AI-Agent Friendly:** Built for the AI era. Ask your AI coding assistant to create and manage your tasks directly by editing the `board.md` source code!
*   ⚡ **Zero Latency:** Runs entirely in your browser with zero server latency.
*   🎟️ **Epics & Sprints:** Full project management vocabulary (Issues, Epics, Sprints, Story points) without the enterprise bloat.

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
