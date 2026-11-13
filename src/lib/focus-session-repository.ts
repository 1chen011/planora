import {
  createClient,
} from "@/lib/supabase/client";

import type {
  PomodoroPhase,
  PomodoroSession,
} from "@/types/task";

type FocusSessionRow = {
  id: string;

  user_id: string;

  task_id: string | null;

  task_title: string;

  phase: PomodoroPhase;

  duration_seconds: number;

  elapsed_seconds: number;

  completed_fully: boolean;

  started_at: string;

  ended_at: string;

  created_at: string;
};

const FOCUS_SESSION_COLUMNS = `
  id,
  user_id,
  task_id,
  task_title,
  phase,
  duration_seconds,
  elapsed_seconds,
  completed_fully,
  started_at,
  ended_at,
  created_at
`;

function mapFocusSessionRow(
  row: FocusSessionRow,
): PomodoroSession {
  return {
    id:
      row.id,

    taskId:
      row.task_id,

    taskTitle:
      row.task_title,

    phase:
      row.phase,

    durationSeconds:
      row.duration_seconds,

    elapsedSeconds:
      row.elapsed_seconds,

    completedFully:
      row.completed_fully,

    startedAt:
      row.started_at,

    endedAt:
      row.ended_at,
  };
}

async function getAuthenticatedUserId() {
  const supabase =
    createClient();

  const {
    data: {
      user,
    },
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      "Planora: no authenticated user found.",
    );
  }

  return user.id;
}

export async function loadFocusSessions(): Promise<
  PomodoroSession[]
> {
  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "focus_sessions",
    )
    .select(
      FOCUS_SESSION_COLUMNS,
    )
    .order(
      "started_at",
      {
        ascending: false,
      },
    );

  if (error) {
    throw error;
  }

  return (
    (data as
      | FocusSessionRow[]
      | null) ?? []
  ).map(
    mapFocusSessionRow,
  );
}

export async function createFocusSession(
  session: Omit<
    PomodoroSession,
    "id"
  >,
): Promise<PomodoroSession> {
  const supabase =
    createClient();

  const userId =
    await getAuthenticatedUserId();

  const {
    data,
    error,
  } = await supabase
    .from(
      "focus_sessions",
    )
    .insert({
      user_id:
        userId,

      task_id:
        session.taskId,

      task_title:
        session.taskTitle,

      phase:
        session.phase,

      duration_seconds:
        session.durationSeconds,

      elapsed_seconds:
        session.elapsedSeconds,

      completed_fully:
        session.completedFully,

      started_at:
        session.startedAt,

      ended_at:
        session.endedAt,
    })
    .select(
      FOCUS_SESSION_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapFocusSessionRow(
    data as FocusSessionRow,
  );
}