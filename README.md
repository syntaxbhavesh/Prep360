# Prep360

**Your exam. Your plan. Your progress.**

Prep360 is a universal exam-preparation workspace for planning syllabi, managing lecture backlogs, building realistic daily schedules, tracking practice, and reviewing progress across competitive and school examinations.

## Current implementation

The repository now contains the first responsive application foundation:

- React + TypeScript + Vite
- Tailwind CSS setup with a custom responsive SaaS interface
- Overview dashboard with study-time, task, and completion summaries
- Universal exam workspace setup with target date
- Subject and lecture-count tracker
- Daily study task planner with task types and duration-aware estimates
- Backlog list, search, and completion controls
- Practice and test task grouping
- Basic task analytics
- Local browser persistence (no account or cloud sync yet)
- Unit tests for planning calculations

The app starts with an empty workspace rather than fabricated student activity. Your entries are stored in the current browser/device.

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run test
npm run build
```

## Product principles

- Support any exam, not just one examination category.
- Keep scheduling deterministic, transparent, and editable.
- Account for actual lecture durations instead of assuming every lecture is equal.
- Make recovery plans realistic when study days are missed.
- Never present demo data as a user's real progress.

## Roadmap

The first implementation establishes the UI and local-first planning core. Next phases can add the full scheduling engine, missed-day recovery, spaced revision, richer syllabus structures, mock-test score analytics, Supabase authentication and persistence with row-level security, import/export, reminders, and deployment automation. These are not represented as completed until implemented and tested.
