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