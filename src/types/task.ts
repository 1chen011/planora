export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;

  title: string;

  note: string;

  /**
   * Local calendar date in YYYY-MM-DD format.
   *
   * This value should be treated as a date-only value,
   * not as a UTC timestamp.
   */
  deadline: string;

  /**
   * Kept for backward compatibility with existing task data.
   *
   * Priority is no longer part of the primary task creation UX.
   * New tasks currently default to "medium".
   */
  priority: Priority;

  completed: boolean;

  completedAt: string | null;

  createdAt: string;

  /**
   * YYYY-MM-DD when this task has been
   * intentionally selected for that day.
   *
   * Empty string means the task is not
   * currently planned for a specific day.
   */
  plannedDate: string;
};

export type TaskFormValues = Pick<Task, "title" | "note" | "deadline">;

export type TaskFilter = "today" | "all" | "active" | "completed";

export type AppView = "home" | TaskFilter;

export type PomodoroPhase = "focus" | "break";

export type PomodoroSession = {
  id: string;

  taskId: string;

  taskTitle: string;

  phase: PomodoroPhase;

  durationSeconds: number;

  elapsedSeconds: number;

  completedFully: boolean;

  startedAt: string;

  endedAt: string;
};

export type PomodoroSettings = {
  focusMinutes: number;

  breakMinutes: number;
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
};
