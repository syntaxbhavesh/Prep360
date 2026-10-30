import { describe, expect, it } from 'vitest'
import type { PracticeRecord, StudyTask, Subject } from '../types'
import { estimateBacklog, estimateDays, generateStudySchedule, getCompletion, getRemainingMinutes, getStudyMinutes, getPracticeTotals, getChapterPerformance, getRevisionQueue, getNextRevisionDate, minutesToLabel } from './planner'

const tasks: StudyTask[] = [
  { id: 'a', title: 'Lecture', subject: 'Physics', kind: 'Lecture', minutes: 75, date: '2026-10-30', done: true },
  { id: 'b', title: 'Practice', subject: 'Maths', kind: 'Practice', minutes: 45, date: '2026-10-30', done: false },
]
const subjects: Subject[] = [
  { id: 'physics', name: 'Physics', color: '#7867f7', total: 20, completed: 8 },
  { id: 'maths', name: 'Maths', color: '#20a889', total: 10, completed: 5 },
]

describe('Prep360 planning utilities', () => {
  it('formats real task durations', () => { expect(minutesToLabel(75)).toBe('1h 15m'); expect(minutesToLabel(45)).toBe('45m'); expect(minutesToLabel(0)).toBe('0m') })
  it('counts only completed study time', () => { expect(getStudyMinutes(tasks)).toBe(75); expect(getRemainingMinutes(tasks)).toBe(45) })
  it('calculates task completion and empty states safely', () => { expect(getCompletion(tasks)).toBe(50); expect(getCompletion([])).toBe(0) })
  it('estimates backlog days', () => { expect(estimateDays(11, 3)).toBe(4); expect(estimateDays(0, 3)).toBe(0); expect(estimateDays(5, 0)).toBeNull() })
  it('calculates a duration-aware backlog and weekly target', () => {
    const result = estimateBacklog(subjects, tasks, 75, 20, 3, 6, new Date('2026-10-30T00:00:00Z'))
    expect(result.pendingLectures).toBe(17)
    expect(result.lectureMinutes).toBe(1275)
    expect(result.practiceMinutes).toBe(264)
    expect(result.totalMinutes).toBe(1584)
    expect(result.weeklyCapacityMinutes).toBe(1080)
    expect(result.weeks).toBe(2)
    expect(result.lecturesPerWeek).toBe(9)
  })
  it('does not invent a completion date when there is no study capacity', () => {
    const result = estimateBacklog(subjects, [], 60, 0, 0, 0, new Date('2026-10-30T00:00:00Z'))
    expect(result.weeks).toBe(0); expect(result.calendarDays).toBe(0)
  })

  it('schedules pending tasks within capacity and preserves completed tasks', () => {
    const source: StudyTask[] = [
      { id: 'done', title: 'Finished', subject: 'Physics', kind: 'Lecture', minutes: 60, date: '2026-10-20', done: true },
      { id: 'one', title: 'One', subject: 'Physics', kind: 'Lecture', minutes: 90, date: '2026-10-20', done: false },
      { id: 'two', title: 'Two', subject: 'Maths', kind: 'Practice', minutes: 60, date: '2026-10-21', done: false },
      { id: 'three', title: 'Three', subject: 'Chemistry', kind: 'Revision', minutes: 60, date: '2026-10-21', done: false },
    ]
    const result = generateStudySchedule(source, 2, 5, new Date(2026, 9, 30))
    expect(result.scheduledCount).toBe(3)
    expect(result.overloadedCount).toBe(0)
    expect(result.tasks[0].date).toBe('2026-10-20')
    expect(result.tasks[1].date).toBe('2026-10-30')
    expect(result.tasks[2].date).toBe('2026-11-02')
    expect(result.tasks[3].date).toBe('2026-11-02')
  })
  it('flags tasks that exceed daily capacity and leaves tasks unscheduled when capacity is zero', () => {
    const source: StudyTask[] = [{ id: 'long', title: 'Long', subject: 'Physics', kind: 'Lecture', minutes: 180, date: '2026-10-20', done: false }]
    const result = generateStudySchedule(source, 2, 6, new Date(2026, 9, 30))
    expect(result.overloadedCount).toBe(1)
    expect(result.tasks[0].date).toBe('2026-10-30')
    const paused = generateStudySchedule(source, 0, 6, new Date(2026, 9, 30))
    expect(paused.unscheduledCount).toBe(1)
  })
  it('calculates practice totals and accuracy safely', () => {
    const logs: PracticeRecord[] = [
      { id: 'p1', title: 'DPP 1', subject: 'Physics', chapter: 'Kinematics', source: 'DPP', totalQuestions: 30, attempted: 20, correct: 15, mistakes: 5, date: '2026-10-30', notes: '' },
      { id: 'p2', title: 'PYQ set', subject: 'Maths', chapter: 'Algebra', source: 'PYQ', totalQuestions: 10, attempted: 10, correct: 8, mistakes: 2, date: '2026-10-30', notes: '' },
    ]
    expect(getPracticeTotals(logs)).toEqual({ totalQuestions: 40, attempted: 30, correct: 23, mistakes: 7, accuracy: 77, completion: 75 })
    expect(getPracticeTotals([]).accuracy).toBe(0)
  })

  it('ranks chapters using matching subject and chapter practice data', () => {
    const curriculum: Subject[] = [{
      id: 'physics', name: 'Physics', color: '#7867f7', total: 2, completed: 1,
      chapters: [{ id: 'kinematics', name: 'Kinematics', topics: [
        { id: 't1', name: 'Motion', lectureStatus: 'Completed', dppStatus: 'Completed', moduleStatus: 'Not started', revisionStatus: 'In progress' },
        { id: 't2', name: 'Graphs', lectureStatus: 'Not started', dppStatus: 'Not started', moduleStatus: 'Not started', revisionStatus: 'Not started' },
      ] }]
    }]
    const logs: PracticeRecord[] = [
      { id: 'p1', title: 'DPP', subject: ' physics ', chapter: 'kinematics', source: 'DPP', totalQuestions: 20, attempted: 10, correct: 5, mistakes: 5, date: '2026-10-30', notes: '' },
    ]
    const result = getChapterPerformance(curriculum, logs)
    expect(result[0]).toMatchObject({ topicCount: 2, lecturesDone: 1, dppDone: 1, modulesDone: 0, revisionDone: 0, attempted: 10, correct: 5, mistakes: 5, accuracy: 50, practiceSets: 1, priority: 'High' })
    expect(getChapterPerformance(curriculum, [])[0].priority).toBe('No data')
  })
  it('builds a spaced revision queue and advances the interval after each revision', () => {
    const curriculum: Subject[] = [{ id: 's', name: 'Physics', color: '#7867f7', total: 1, completed: 1, chapters: [{ id: 'c', name: 'Motion', topics: [{ id: 't', name: 'Velocity', lectureStatus: 'Completed', dppStatus: 'Not started', moduleStatus: 'Not started', revisionStatus: 'Not started', nextRevisionDate: '2026-10-30' }] }] }]
    expect(getRevisionQueue(curriculum, '2026-10-30')[0].status).toBe('Due today')
    expect(getRevisionQueue(curriculum, '2026-10-31')[0].status).toBe('Overdue')
    expect(getNextRevisionDate(0, '2026-10-30')).toBe('2026-10-31')
    expect(getNextRevisionDate(1, '2026-10-30')).toBe('2026-11-02')
    expect(getNextRevisionDate(5, '2026-10-30')).toBe('2026-11-29')
  })

})
