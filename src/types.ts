export type StudyTask = { id: string; title: string; subject: string; kind: 'Lecture' | 'Practice' | 'Revision' | 'Test'; minutes: number; date: string; done: boolean }
export type Subject = { id: string; name: string; color: string; total: number; completed: number }
export type Workspace = { exam: string; targetDate: string; tasks: StudyTask[]; subjects: Subject[] }
