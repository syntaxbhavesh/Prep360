import type { Workspace, Subject, Chapter, Topic } from '../types'
const KEY = 'prep360-workspace-v1'
export const emptyWorkspace: Workspace = { exam: '', targetDate: '', tasks: [], subjects: [] }
const validStatus = (value: unknown): Topic['lectureStatus'] => value === 'Completed' || value === 'In progress' ? value : 'Not started'
function normalizeTopic(value: unknown, index: number): Topic {
  const item = (value && typeof value === 'object' ? value : {}) as Partial<Topic>
  return { id: typeof item.id === 'string' ? item.id : `topic-${index}`, name: typeof item.name === 'string' ? item.name : 'Untitled topic', lectureStatus: validStatus(item.lectureStatus), dppStatus: validStatus(item.dppStatus), moduleStatus: validStatus(item.moduleStatus), revisionStatus: validStatus(item.revisionStatus) }
}
function normalizeChapter(value: unknown, index: number): Chapter {
  const item = (value && typeof value === 'object' ? value : {}) as Partial<Chapter>
  return { id: typeof item.id === 'string' ? item.id : `chapter-${index}`, name: typeof item.name === 'string' ? item.name : 'Untitled chapter', topics: Array.isArray(item.topics) ? item.topics.map(normalizeTopic) : [] }
}
function normalizeSubject(value: unknown, index: number): Subject {
  const item = (value && typeof value === 'object' ? value : {}) as Partial<Subject>
  const chapters = Array.isArray(item.chapters) ? item.chapters.map(normalizeChapter) : []
  const topicCount = chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0)
  const lectureDone = chapters.reduce((sum, chapter) => sum + chapter.topics.filter(topic => topic.lectureStatus === 'Completed').length, 0)
  return { id: typeof item.id === 'string' ? item.id : `subject-${index}`, name: typeof item.name === 'string' ? item.name : 'Untitled subject', color: typeof item.color === 'string' ? item.color : '#7867f7', total: topicCount || Math.max(0, Number(item.total) || 0), completed: topicCount ? lectureDone : Math.max(0, Number(item.completed) || 0), chapters }
}
export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyWorkspace
    const parsed = JSON.parse(raw) as Partial<Workspace>
    return { ...emptyWorkspace, ...parsed, tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [], subjects: Array.isArray(parsed.subjects) ? parsed.subjects.map(normalizeSubject) : [] }
  } catch { return emptyWorkspace }
}
export function saveWorkspace(value: Workspace) { try { localStorage.setItem(KEY, JSON.stringify(value)) } catch { /* storage may be unavailable or full */ } }
