export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;

  title: string;

  note: string;

  deadline: string;

  priority: Priority;

  completed: boolean;

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

export type TaskFormValues = Pick<
  Task,
  "title" | "note" | "deadline" | "priority"
>;

export type TaskFilter = "today" | "all" | "active" | "completed";

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
