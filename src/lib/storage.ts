import type { Workspace } from '../types'
const KEY = 'prep360-workspace-v1'
export const emptyWorkspace: Workspace = { exam: '', targetDate: '', tasks: [], subjects: [] }
export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyWorkspace
    const parsed = JSON.parse(raw) as Workspace
    return { ...emptyWorkspace, ...parsed, tasks: parsed.tasks ?? [], subjects: parsed.subjects ?? [] }
  } catch { return emptyWorkspace }
}
export function saveWorkspace(value: Workspace) { localStorage.setItem(KEY, JSON.stringify(value)) }
