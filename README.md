# Planora
**A Desktop-First Developer Work Tracking Workbench**

Planora is a lightweight, browser-based personal productivity tool built for developers.
It bridges the gap between simple task planning and real work execution by combining structured task management with a task-bound Pomodoro focus timer.

Traditional todo tools only record plans, and standalone Pomodoro apps have no task context.
Planora solves this problem by binding every focus session to a specific work item, helping developers track real time investment, record daily work trajectories, and complete efficient work review with fully private local storage.

## ✨ Core Features
- **Structured Task Management**
  Create, edit, delete and complete work tasks with title, notes, deadline, and three-level priority (Low / Medium / High) with visual color distinction.

- **Task-Bound Pomodoro Timer (Core Highlight)**
  Start focus timing only after selecting a specific task. All focus records are bound to the corresponding task to track real work cost.

- **Customizable Focus Mode**
  Default 25min focus + 5min break, supports freely adjustable duration.

- **Task Filter System**
  Sidebar navigation for quick filtering: All Tasks / Pending / Completed.

- **Private Local Persistence**
  All tasks and timing records saved in browser LocalStorage, no login required, fully private data.

- **Modern Desktop-First UI**
  Built with shadcn/ui Nova dark theme, clean minimalist interface with basic responsive adaptation.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui (Nova Theme) + Lucide Icons
- **Storage**: Browser LocalStorage
- **Deployment**: Vercel

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev