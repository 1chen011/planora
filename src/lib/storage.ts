import {
  DEFAULT_POMODORO_SETTINGS,
  type PomodoroSession,
  type PomodoroSettings,
  type Task,
} from "@/types/task";

const KEYS = {
  tasks: "planora:tasks",
  sessions: "planora:pomodoro-sessions",
  settings: "planora:pomodoro-settings",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Planora: failed to read localStorage key "${key}"`, err);
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Planora: failed to write localStorage key "${key}"`, err);
  }
}

export const taskStorage = {
  load(): Task[] {
    return readJSON<Task[]>(KEYS.tasks, []);
  },
  save(tasks: Task[]) {
    writeJSON(KEYS.tasks, tasks);
  },
};

export const sessionStorage_ = {
  load(): PomodoroSession[] {
    return readJSON<PomodoroSession[]>(KEYS.sessions, []);
  },
  save(sessions: PomodoroSession[]) {
    writeJSON(KEYS.sessions, sessions);
  },
};

export const settingsStorage = {
  load(): PomodoroSettings {
    return readJSON<PomodoroSettings>(KEYS.settings, DEFAULT_POMODORO_SETTINGS);
  },
  save(settings: PomodoroSettings) {
    writeJSON(KEYS.settings, settings);
  },
};

export function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
