import type { StudyTask, Subject } from '../types'

export function minutesToLabel(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safeMinutes / 60), mins = safeMinutes % 60
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

export type BacklogEstimate = {
  pendingLectures: number; lectureMinutes: number; practiceMinutes: number; totalMinutes: number;
  dailyCapacityMinutes: number; weeklyCapacityMinutes: number; studyDays: number; calendarDays: number;
  weeks: number; completionDate: string; lecturesPerWeek: number
}

export function estimateBacklog(subjects: Subject[], tasks: StudyTask[], averageLectureMinutes: number, practiceBufferPercent: number, hoursPerDay: number, studyDaysPerWeek: number, startDate = new Date()) : BacklogEstimate {
  const safeDuration = Math.max(1, averageLectureMinutes)
  const pendingLectures = subjects.reduce((sum, subject) => sum + Math.max(0, subject.total - subject.completed), 0)
  const lectureMinutes = pendingLectures * safeDuration
  const openTaskMinutes = getRemainingMinutes(tasks)
  const practiceMinutes = Math.ceil((lectureMinutes + openTaskMinutes) * Math.max(0, practiceBufferPercent) / 100)
  const totalMinutes = lectureMinutes + openTaskMinutes + practiceMinutes
  const dailyCapacityMinutes = Math.max(0, hoursPerDay) * 60
  const studyDays = dailyCapacityMinutes > 0 ? Math.ceil(totalMinutes / dailyCapacityMinutes) : 0
  const weeklyCapacityMinutes = dailyCapacityMinutes * Math.max(0, Math.min(7, Math.floor(studyDaysPerWeek)))
  const weeks = totalMinutes === 0 ? 0 : weeklyCapacityMinutes > 0 ? Math.ceil(totalMinutes / weeklyCapacityMinutes) : 0
  const calendarDays = totalMinutes === 0 ? 0 : weeklyCapacityMinutes > 0 ? Math.ceil(studyDays / Math.max(1, Math.min(7, Math.floor(studyDaysPerWeek)))) * 7 : 0
  const completion = new Date(startDate)
  completion.setDate(completion.getDate() + calendarDays)
  return { pendingLectures, lectureMinutes, practiceMinutes, totalMinutes, dailyCapacityMinutes, weeklyCapacityMinutes, studyDays, calendarDays, weeks, completionDate: completion.toISOString().slice(0, 10), lecturesPerWeek: pendingLectures && weeks ? Math.ceil(pendingLectures / weeks) : 0 }
}

export function buildWeeklyCapacity(hoursPerDay: number, studyDaysPerWeek: number) {
  const days = Math.max(0, Math.min(7, Math.floor(studyDaysPerWeek)))
  return Array.from({ length: 7 }, (_, index) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index], available: index < days, minutes: index < days ? Math.max(0, hoursPerDay) * 60 : 0 }))
}
export type ScheduleResult = { tasks: StudyTask[]; scheduledCount: number; overloadedCount: number; unscheduledCount: number; totalMinutes: number; }

function addDays(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next }
function dateKey(date: Date) { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}` }

/** Assigns all unfinished tasks to the earliest available study days. Completed tasks are never moved. Tasks stay whole; an item longer than a daily limit is flagged as overloaded. */
export function generateStudySchedule(tasks: StudyTask[], hoursPerDay: number, studyDaysPerWeek: number, startDate = new Date()): ScheduleResult {
  const capacity = Math.max(0, hoursPerDay) * 60
  const activeDays = Math.max(0, Math.min(7, Math.floor(studyDaysPerWeek)))
  const updated = tasks.map(task => ({ ...task }))
  const pending = updated.map((task, index) => ({ task, index })).filter(item => !item.task.done).sort((a, b) => a.task.date.localeCompare(b.task.date) || a.index - b.index)
  const totalMinutes = pending.reduce((sum, item) => sum + Math.max(0, item.task.minutes), 0)
  if (!pending.length) return { tasks: updated, scheduledCount: 0, overloadedCount: 0, unscheduledCount: 0, totalMinutes: 0 }
  if (capacity <= 0 || activeDays === 0) return { tasks: updated, scheduledCount: 0, overloadedCount: 0, unscheduledCount: pending.length, totalMinutes }
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  let used = 0, scheduledCount = 0, overloadedCount = 0
  for (const item of pending) {
    let guard = 0
    while (guard < 370) {
      const weekday = (cursor.getDay() + 6) % 7
      const available = weekday < activeDays
      if (!available) { cursor = addDays(cursor, 1); used = 0; guard++; continue }
      const duration = Math.max(0, item.task.minutes)
      if (used > 0 && used + duration > capacity) { cursor = addDays(cursor, 1); used = 0; guard++; continue }
      updated[item.index] = { ...item.task, date: dateKey(cursor) }
      used += duration
      if (duration > capacity) overloadedCount++
      scheduledCount++
      break
    }
  }
  return { tasks: updated, scheduledCount, overloadedCount, unscheduledCount: pending.length - scheduledCount, totalMinutes }
}

export function getOverdueTasks(tasks: StudyTask[], today = dateKey(new Date())) { return tasks.filter(task => !task.done && task.date < today) }
export function getPracticeTotals(logs: import('../types').PracticeRecord[]) {
  const totalQuestions = logs.reduce((sum, log) => sum + log.totalQuestions, 0)
  const attempted = logs.reduce((sum, log) => sum + log.attempted, 0)
  const correct = logs.reduce((sum, log) => sum + log.correct, 0)
  const mistakes = logs.reduce((sum, log) => sum + log.mistakes, 0)
  return { totalQuestions, attempted, correct, mistakes, accuracy: attempted > 0 ? Math.round(correct / attempted * 100) : 0, completion: totalQuestions > 0 ? Math.min(100, Math.round(attempted / totalQuestions * 100)) : 0 }
}

export type ChapterPerformance = {
  subject: string; chapter: string; topicCount: number; lecturesDone: number;
  dppDone: number; modulesDone: number; revisionDone: number;
  attempted: number; correct: number; mistakes: number; accuracy: number;
  practiceSets: number; priority: 'High' | 'Medium' | 'On track' | 'No data'
}
export function getChapterPerformance(subjects: Subject[], logs: import('../types').PracticeRecord[]): ChapterPerformance[] {
  const normalize = (value: string) => value.trim().toLocaleLowerCase()
  return subjects.flatMap(subject => (subject.chapters ?? []).map(chapter => {
    const topics = chapter.topics ?? []
    const matching = logs.filter(log => normalize(log.subject) === normalize(subject.name) && normalize(log.chapter) === normalize(chapter.name))
    const attempted = matching.reduce((sum, log) => sum + log.attempted, 0)
    const correct = matching.reduce((sum, log) => sum + log.correct, 0)
    const mistakes = matching.reduce((sum, log) => sum + log.mistakes, 0)
    const accuracy = attempted ? Math.round(correct / attempted * 100) : 0
    const lecturesDone = topics.filter(topic => topic.lectureStatus === 'Completed').length
    const dppDone = topics.filter(topic => topic.dppStatus === 'Completed').length
    const modulesDone = topics.filter(topic => topic.moduleStatus === 'Completed').length
    const revisionDone = topics.filter(topic => topic.revisionStatus === 'Completed').length
    return { subject: subject.name, chapter: chapter.name, topicCount: topics.length, lecturesDone, dppDone, modulesDone, revisionDone, attempted, correct, mistakes, accuracy, practiceSets: matching.length, priority: attempted === 0 ? 'No data' : accuracy < 60 ? 'High' : accuracy < 80 ? 'Medium' : 'On track' }
  }))
}


export type RevisionQueueItem = { subjectId: string; subject: string; chapterId: string; chapter: string; topicId: string; topic: string; dueDate: string; revisionCount: number; lastRevisedAt?: string; status: 'Overdue' | 'Due today' | 'Upcoming' }
export function getRevisionQueue(subjects: Subject[], today = dateKey(new Date())): RevisionQueueItem[] {
  return subjects.flatMap(subject => (subject.chapters ?? []).flatMap(chapter => chapter.topics.flatMap(topic => {
    if (topic.lectureStatus !== 'Completed' || !topic.nextRevisionDate) return []
    const dueDate = topic.nextRevisionDate
    const status = dueDate < today ? 'Overdue' as const : dueDate === today ? 'Due today' as const : 'Upcoming' as const
    return [{ subjectId: subject.id, subject: subject.name, chapterId: chapter.id, chapter: chapter.name, topicId: topic.id, topic: topic.name, dueDate, revisionCount: topic.revisionCount ?? 0, lastRevisedAt: topic.lastRevisedAt, status }]
  }))).sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.subject.localeCompare(b.subject) || a.topic.localeCompare(b.topic))
}
export function getNextRevisionDate(revisionCount: number, fromDate: string): string {
  const intervals = [1, 3, 7, 14, 30]
  const days = intervals[Math.min(Math.max(0, revisionCount), intervals.length - 1)]
  const [year, month, day] = fromDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}
