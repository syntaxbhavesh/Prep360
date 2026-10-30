export type ProgressStatus = 'Not started' | 'In progress' | 'Completed'
export type Topic = { id: string; name: string; lectureStatus: ProgressStatus; dppStatus: ProgressStatus; moduleStatus: ProgressStatus; revisionStatus: ProgressStatus; revisionCount?: number; lastRevisedAt?: string; nextRevisionDate?: string }
export type Chapter = { id: string; name: string; topics: Topic[] }
export type StudyTask = { id: string; title: string; subject: string; kind: 'Lecture' | 'Practice' | 'Revision' | 'Test'; minutes: number; date: string; done: boolean }
export type Subject = { id: string; name: string; color: string; total: number; completed: number; chapters?: Chapter[] }
export type PracticeRecord = { id: string; title: string; subject: string; chapter: string; source: 'DPP' | 'Module' | 'PYQ' | 'Mock test' | 'Other'; totalQuestions: number; attempted: number; correct: number; mistakes: number; date: string; notes: string }
export type Workspace = { exam: string; targetDate: string; tasks: StudyTask[]; subjects: Subject[]; practiceLogs?: PracticeRecord[] }
