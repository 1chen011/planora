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

const EXPORT_VERSION = 1;

export type PlanoraExportData = {
  version: typeof EXPORT_VERSION;
  exportedAt: string;

  data: {
    tasks: Task[];
    sessions: PomodoroSession[];
    settings: PomodoroSettings;
  };
};

export type ImportResult =
  | {
      success: true;
      data: PlanoraExportData;
    }
  | {
      success: false;
      error: string;
    };

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(
  key: string,
  fallback: T,
): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw =
      window.localStorage.getItem(
        key,
      );

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(
      `Planora: failed to read localStorage key "${key}"`,
      error,
    );

    return fallback;
  }
}

function writeJSON<T>(
  key: string,
  value: T,
) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value),
    );
  } catch (error) {
    console.error(
      `Planora: failed to write localStorage key "${key}"`,
      error,
    );
  }
}

function removeKey(
  key: string,
) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(
      key,
    );
  } catch (error) {
    console.error(
      `Planora: failed to remove localStorage key "${key}"`,
      error,
    );
  }
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isString(
  value: unknown,
): value is string {
  return typeof value === "string";
}

function isNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isBoolean(
  value: unknown,
): value is boolean {
  return typeof value === "boolean";
}

function isNullableString(
  value: unknown,
): value is string | null {
  return (
    value === null ||
    typeof value === "string"
  );
}

function isValidPriority(
  value: unknown,
): value is Task["priority"] {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

function isValidTask(
  value: unknown,
): value is Task {
  if (!isObject(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.title) &&
    isString(value.note) &&
    isString(value.deadline) &&
    isValidPriority(
      value.priority,
    ) &&
    isBoolean(value.completed) &&
    isNullableString(
      value.completedAt,
    ) &&
    isString(value.createdAt) &&
    isString(value.plannedDate)
  );
}

function isValidSession(
  value: unknown,
): value is PomodoroSession {
  if (!isObject(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.taskId) &&
    isString(value.taskTitle) &&
    (
      value.phase === "focus" ||
      value.phase === "break"
    ) &&
    isNumber(
      value.durationSeconds,
    ) &&
    isNumber(
      value.elapsedSeconds,
    ) &&
    isBoolean(
      value.completedFully,
    ) &&
    isString(value.startedAt) &&
    isString(value.endedAt)
  );
}

function isValidSettings(
  value: unknown,
): value is PomodoroSettings {
  if (!isObject(value)) {
    return false;
  }

  return (
    isNumber(value.focusMinutes) &&
    value.focusMinutes > 0 &&
    isNumber(value.breakMinutes) &&
    value.breakMinutes > 0
  );
}

function isValidExportData(
  value: unknown,
): value is PlanoraExportData {
  if (!isObject(value)) {
    return false;
  }

  if (
    value.version !==
    EXPORT_VERSION
  ) {
    return false;
  }

  if (
    !isString(
      value.exportedAt,
    )
  ) {
    return false;
  }

  if (!isObject(value.data)) {
    return false;
  }

  const {
    tasks,
    sessions,
    settings,
  } = value.data;

  if (!Array.isArray(tasks)) {
    return false;
  }

  if (!Array.isArray(sessions)) {
    return false;
  }

  if (
    !tasks.every(
      isValidTask,
    )
  ) {
    return false;
  }

  if (
    !sessions.every(
      isValidSession,
    )
  ) {
    return false;
  }

  if (
    !isValidSettings(
      settings,
    )
  ) {
    return false;
  }

  return true;
}

export const taskStorage = {
  load(): Task[] {
    return readJSON<Task[]>(
      KEYS.tasks,
      [],
    );
  },

  save(
    tasks: Task[],
  ) {
    writeJSON(
      KEYS.tasks,
      tasks,
    );
  },
};

export const sessionStorage_ = {
  load(): PomodoroSession[] {
    return readJSON<
      PomodoroSession[]
    >(
      KEYS.sessions,
      [],
    );
  },

  save(
    sessions: PomodoroSession[],
  ) {
    writeJSON(
      KEYS.sessions,
      sessions,
    );
  },
};

export const settingsStorage = {
  load(): PomodoroSettings {
    return readJSON<PomodoroSettings>(
      KEYS.settings,
      DEFAULT_POMODORO_SETTINGS,
    );
  },

  save(
    settings: PomodoroSettings,
  ) {
    writeJSON(
      KEYS.settings,
      settings,
    );
  },
};

export const planoraDataStorage = {
  exportData(): PlanoraExportData {
    return {
      version:
        EXPORT_VERSION,

      exportedAt:
        new Date().toISOString(),

      data: {
        tasks:
          taskStorage.load(),

        sessions:
          sessionStorage_.load(),

        settings:
          settingsStorage.load(),
      },
    };
  },

  stringifyExport(
    data?: PlanoraExportData,
  ) {
    const exportData =
      data ??
      this.exportData();

    return JSON.stringify(
      exportData,
      null,
      2,
    );
  },

  importData(
    rawData: string,
  ): ImportResult {
    let parsed: unknown;

    try {
      parsed =
        JSON.parse(rawData);
    } catch {
      return {
        success: false,
        error:
          "The selected file is not valid JSON.",
      };
    }

    if (
      !isValidExportData(
        parsed,
      )
    ) {
      return {
        success: false,
        error:
          "This file is not a valid Planora backup or uses an unsupported version.",
      };
    }

    taskStorage.save(
      parsed.data.tasks,
    );

    sessionStorage_.save(
      parsed.data.sessions,
    );

    settingsStorage.save(
      parsed.data.settings,
    );

    return {
      success: true,
      data: parsed,
    };
  },

  resetData() {
    removeKey(KEYS.tasks);

    removeKey(
      KEYS.sessions,
    );

    removeKey(
      KEYS.settings,
    );
  },
};

export function genId(
  prefix: string,
) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}