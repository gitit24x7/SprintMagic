import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import type { GitSignal } from '../../src/lib/gitSync'

// Pull issue keys (SM-3, BUG-12, …) out of any text.
const KEY_RE = /\b[A-Z][A-Z0-9]*-\d+\b/g
function keysIn(text: string): string[] {
  return text.toUpperCase().match(KEY_RE) ?? []
}

/**
 * Work out the git signals for this run. Inside a GitHub Action we ask the
 * GitHub API for the full picture (open PRs, merged PRs, branches) so the sync
 * is the same no matter what triggered it. Locally we fall back to git branches
 * (handy for trying it out).
 */
export async function gatherSignals(): Promise<GitSignal[]> {
  if (process.env.GITHUB_ACTIONS === 'true') {
    const fromApi = await gatherFromActions()
    if (fromApi.length) return fromApi
    return gatherFromEventPayload()
  }
  return gatherFromLocalGit()
}

async function gh(path: string, token: string): Promise<any[]> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'sprintmagic-cli',
      },
    })
    if (!res.ok) return []
    return (await res.json()) as any[]
  } catch {
    return []
  }
}

async function gatherFromActions(): Promise<GitSignal[]> {
  const repo = process.env.GITHUB_REPOSITORY
  const token = process.env.GITHUB_TOKEN
  if (!repo || !token) return []

  const signals: GitSignal[] = []

  // Open PRs → In Review
  for (const pr of await gh(`/repos/${repo}/pulls?state=open&per_page=100`, token)) {
    for (const k of keysIn(`${pr.head?.ref ?? ''} ${pr.title ?? ''}`))
      signals.push({ key: k, status: 'in_review' })
  }
  // Merged PRs → Done
  for (const pr of await gh(`/repos/${repo}/pulls?state=closed&per_page=100`, token)) {
    if (!pr.merged_at) continue
    for (const k of keysIn(`${pr.head?.ref ?? ''} ${pr.title ?? ''}`))
      signals.push({ key: k, status: 'done' })
  }
  // Branches → In Progress
  for (const b of await gh(`/repos/${repo}/branches?per_page=100`, token)) {
    for (const k of keysIn(b.name ?? '')) signals.push({ key: k, status: 'in_progress' })
  }

  return signals
}

// Minimal fallback: read keys from the triggering event payload.
function gatherFromEventPayload(): GitSignal[] {
  const p = process.env.GITHUB_EVENT_PATH
  const eventName = process.env.GITHUB_EVENT_NAME
  if (!p) return []
  let payload: any
  try {
    payload = JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return []
  }
  const signals: GitSignal[] = []
  if (eventName === 'pull_request' && payload.pull_request) {
    const pr = payload.pull_request
    const text = `${pr.head?.ref ?? ''} ${pr.title ?? ''}`
    const status = pr.merged ? 'done' : 'in_review'
    for (const k of keysIn(text)) signals.push({ key: k, status })
  } else if (eventName === 'push') {
    const ref = (process.env.GITHUB_REF ?? '').replace('refs/heads/', '')
    for (const k of keysIn(ref)) signals.push({ key: k, status: 'in_progress' })
  }
  return signals
}

function gatherFromLocalGit(): GitSignal[] {
  const signals: GitSignal[] = []
  try {
    const out = execFileSync(
      'git',
      ['for-each-ref', '--format=%(refname:short)', 'refs/heads'],
      { encoding: 'utf8' },
    )
    for (const line of out.split('\n')) {
      for (const k of keysIn(line)) signals.push({ key: k, status: 'in_progress' })
    }
  } catch {
    /* not a git repo — nothing to do */
  }
  return signals
}
