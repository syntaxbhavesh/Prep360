import { describe, expect, it } from 'vitest'
import type { StudyTask } from '../types'
import { estimateDays, getCompletion, getRemainingMinutes, getStudyMinutes, minutesToLabel } from './planner'

const tasks: StudyTask[] = [
  { id: 'a', title: 'Lecture', subject: 'Physics', kind: 'Lecture', minutes: 75, date: '2026-10-30', done: true },
  { id: 'b', title: 'Practice', subject: 'Maths', kind: 'Practice', minutes: 45, date: '2026-10-30', done: false },
]

describe('Prep360 planning utilities', () => {
  it('formats real task durations', () => {
    expect(minutesToLabel(75)).toBe('1h 15m')
    expect(minutesToLabel(45)).toBe('45m')
    expect(minutesToLabel(0)).toBe('0m')
  })
  it('counts only completed study time', () => {
    expect(getStudyMinutes(tasks)).toBe(75)
    expect(getRemainingMinutes(tasks)).toBe(45)
  })
  it('calculates task completion and empty states safely', () => {
    expect(getCompletion(tasks)).toBe(50)
    expect(getCompletion([])).toBe(0)
  })
  it('estimates backlog days without assuming equal durations', () => {
    expect(estimateDays(11, 3)).toBe(4)
    expect(estimateDays(0, 3)).toBe(0)
    expect(estimateDays(5, 0)).toBeNull()
  })
})
