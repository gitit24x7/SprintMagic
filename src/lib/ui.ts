import type { IssueType, Priority } from '../types'

const AVATAR_PALETTE = [
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-orange-100 text-orange-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
]

export function avatarClasses(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function initials(name: string): string {
  const parts = name.replace(/[._-]/g, ' ').trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const NO_EPIC = '— No epic'

const EPIC_PALETTE = [
  { dot: 'bg-orange-400', text: 'text-orange-600', soft: 'bg-orange-50', bar: 'bg-orange-300' },
  { dot: 'bg-sky-400', text: 'text-sky-600', soft: 'bg-sky-50', bar: 'bg-sky-300' },
  { dot: 'bg-emerald-400', text: 'text-emerald-600', soft: 'bg-emerald-50', bar: 'bg-emerald-300' },
  { dot: 'bg-amber-400', text: 'text-amber-600', soft: 'bg-amber-50', bar: 'bg-amber-300' },
  { dot: 'bg-rose-400', text: 'text-rose-600', soft: 'bg-rose-50', bar: 'bg-rose-300' },
  { dot: 'bg-fuchsia-400', text: 'text-fuchsia-600', soft: 'bg-fuchsia-50', bar: 'bg-fuchsia-300' },
  { dot: 'bg-teal-400', text: 'text-teal-600', soft: 'bg-teal-50', bar: 'bg-teal-300' },
]

const NEUTRAL_EPIC = {
  dot: 'bg-zinc-300',
  text: 'text-zinc-500',
  soft: 'bg-zinc-50',
  bar: 'bg-zinc-200',
}

export function epicColor(name: string) {
  if (name === NO_EPIC) return NEUTRAL_EPIC
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return EPIC_PALETTE[hash % EPIC_PALETTE.length]
}

const TAG_PALETTE = [
  'bg-rose-50 text-rose-600',
  'bg-amber-50 text-amber-700',
  'bg-emerald-50 text-emerald-600',
  'bg-sky-50 text-sky-600',
  'bg-orange-50 text-orange-600',
  'bg-fuchsia-50 text-fuchsia-600',
  'bg-teal-50 text-teal-600',
  'bg-amber-50 text-amber-600',
]

export function tagColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return TAG_PALETTE[hash % TAG_PALETTE.length]
}

// Jira-style issue types with Jira's colour language.
export const ISSUE_TYPE_META: Record<
  IssueType,
  { label: string; icon: string; fill: string }
> = {
  story: { label: 'Story', icon: 'square', fill: 'bg-emerald-500' },
  task: { label: 'Task', icon: 'check', fill: 'bg-sky-500' },
  bug: { label: 'Bug', icon: 'dot', fill: 'bg-rose-500' },
}

export const ISSUE_TYPES: IssueType[] = ['story', 'task', 'bug']

export const PRIORITY_META: Record<
  Priority,
  { label: string; bar: string; chip: string }
> = {
  high: {
    label: 'High',
    bar: 'bg-rose-400',
    chip: 'bg-rose-50 text-rose-600 ring-rose-100',
  },
  med: {
    label: 'Medium',
    bar: 'bg-amber-400',
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  low: {
    label: 'Low',
    bar: 'bg-slate-300',
    chip: 'bg-slate-50 text-slate-500 ring-slate-100',
  },
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  const month = MONTHS[Number(m[2]) - 1] ?? m[2]
  return `${month} ${Number(m[3])}`
}

export function formatRange(start?: string, end?: string): string | null {
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  if (start) return `from ${formatDate(start)}`
  if (end) return `until ${formatDate(end)}`
  return null
}
