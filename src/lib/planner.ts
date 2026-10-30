import type { StudyTask } from '../types'
export function minutesToLabel(minutes: number) {
  const hours = Math.floor(minutes / 60), mins = minutes % 60
  return [hours ? hours + 'h' : '', mins ? mins + 'm' : ''].filter(Boolean).join(' ') || '0m'
}
export function getStudyMinutes(tasks: StudyTask[]) { return tasks.filter(t => t.done).reduce((sum, task) => sum + task.minutes, 0) }
export function getCompletion(tasks: StudyTask[]) { return tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0 }
export function getRemainingMinutes(tasks: StudyTask[]) { return tasks.filter(t => !t.done).reduce((sum, task) => sum + task.minutes, 0) }
export function estimateDays(lectureCount: number, lecturesPerDay: number) {
  if (lectureCount <= 0) return 0
  if (lecturesPerDay <= 0) return null
  return Math.ceil(lectureCount / lecturesPerDay)
}
