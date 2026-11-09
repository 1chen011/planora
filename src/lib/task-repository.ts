import { createClient } from "@/lib/supabase/client";

import type {
  Task,
  TaskFormValues,
} from "@/types/task";

type TaskRow = {
  id: string;

  user_id: string;

  title: string;

  note: string;

  deadline: string | null;

  completed: boolean;

  completed_at: string | null;

  planned_date: string | null;

  created_at: string;

  updated_at: string;
};

const TASK_COLUMNS = `
  id,
  user_id,
  title,
  note,
  deadline,
  completed,
  completed_at,
  planned_date,
  created_at,
  updated_at
`;

function mapTaskRow(
  row: TaskRow,
): Task {
  return {
    id: row.id,

    title: row.title,

    note: row.note,

    deadline:
      row.deadline ?? "",

    /**
     * Priority no longer exists
     * in the cloud database.
     *
     * Keep this legacy value until
     * it is removed from the frontend
     * Task type completely.
     */
    priority: "medium",

    completed:
      row.completed,

    completedAt:
      row.completed_at,

    createdAt:
      row.created_at,

    plannedDate:
      row.planned_date ?? "",
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

/**
 * Load all tasks belonging to
 * the currently authenticated user.
 *
 * RLS ensures users can only
 * access their own rows.
 */
export async function loadTasks(): Promise<
  Task[]
> {
  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select(
      TASK_COLUMNS,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    );

  if (error) {
    throw error;
  }

  return (
    (data as TaskRow[] | null) ??
    []
  ).map(
    mapTaskRow,
  );
}

/**
 * Create a new cloud task.
 *
 * plannedDate uses an empty string
 * in the frontend and NULL
 * in PostgreSQL.
 */
export async function createTask(
  values: TaskFormValues,
  plannedDate = "",
): Promise<Task> {
  const supabase =
    createClient();

  const userId =
    await getAuthenticatedUserId();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .insert({
      user_id:
        userId,

      title:
        values.title,

      note:
        values.note,

      deadline:
        values.deadline ||
        null,

      completed:
        false,

      completed_at:
        null,

      planned_date:
        plannedDate ||
        null,
    })
    .select(
      TASK_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTaskRow(
    data as TaskRow,
  );
}

/**
 * Update the fields that are editable
 * from the Task form.
 */
export async function updateTask(
  id: string,
  values: TaskFormValues,
): Promise<Task> {
  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .update({
      title:
        values.title,

      note:
        values.note,

      deadline:
        values.deadline ||
        null,
    })
    .eq(
      "id",
      id,
    )
    .select(
      TASK_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTaskRow(
    data as TaskRow,
  );
}

/**
 * Complete or reopen a task.
 */
export async function updateTaskCompletion(
  id: string,
  completed: boolean,
): Promise<Task> {
  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .update({
      completed,

      completed_at:
        completed
          ? new Date().toISOString()
          : null,
    })
    .eq(
      "id",
      id,
    )
    .select(
      TASK_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTaskRow(
    data as TaskRow,
  );
}

/**
 * Add or remove a task
 * from Today.
 *
 * Frontend:
 * ""
 *
 * PostgreSQL:
 * NULL
 */
export async function updateTaskPlannedDate(
  id: string,
  plannedDate: string,
): Promise<Task> {
  const supabase =
    createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .update({
      planned_date:
        plannedDate ||
        null,
    })
    .eq(
      "id",
      id,
    )
    .select(
      TASK_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return mapTaskRow(
    data as TaskRow,
  );
}

/**
 * Permanently delete a task.
 *
 * Existing focus history will remain
 * because focus_sessions.task_id
 * uses ON DELETE SET NULL.
 */
export async function deleteTask(
  id: string,
): Promise<void> {
  const supabase =
    createClient();

  const {
    error,
  } = await supabase
    .from("tasks")
    .delete()
    .eq(
      "id",
      id,
    );

  if (error) {
    throw error;
  }
}