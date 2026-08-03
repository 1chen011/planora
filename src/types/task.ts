export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  note: string;
  deadline: string; // ISO date string, "" if not set
  priority: Priority;
  completed: boolean;
  createdAt: string; // ISO datetime string
};

export type TaskFormValues = Omit<Task, "id" | "completed" | "createdAt">;

export type TaskFilter = "all" | "active" | "completed";

export type PomodoroPhase = "focus" | "break";

/** A single completed (or manually stopped) timer run, bound to a task. */
export type PomodoroSession = {
  id: string;
  taskId: string;
  taskTitle: string;
  phase: PomodoroPhase;
  durationSeconds: number; // planned duration
  elapsedSeconds: number; // actual time spent before it ended/was stopped
  completedFully: boolean; // reached 0:00 naturally
  startedAt: string; // ISO datetime
  endedAt: string; // ISO datetime
};

export type PomodoroSettings = {
  focusMinutes: number;
  breakMinutes: number;
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};
