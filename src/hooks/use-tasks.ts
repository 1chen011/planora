"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createTask as createTaskInCloud,
  deleteTask as deleteTaskFromCloud,
  loadTasks,
  updateTask as updateTaskInCloud,
  updateTaskCompletion,
  updateTaskPlannedDate,
} from "@/lib/task-repository";

import type {
  Task,
  TaskFilter,
  TaskFormValues,
} from "@/types/task";

function getLocalDateKey(
  date = new Date(),
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useTasks() {
  const [
    tasks,
    setTasks,
  ] = useState<Task[]>([]);

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  /**
   * Load tasks from Supabase
   * when the workspace mounts.
   */
  useEffect(() => {
    let cancelled = false;

    async function hydrateTasks() {
      try {
        const cloudTasks =
          await loadTasks();

        if (!cancelled) {
          setTasks(
            cloudTasks,
          );
        }
      } catch (error) {
        console.error(
          "Planora: failed to load tasks from Supabase",
          error,
        );
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    }

    void hydrateTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Create a task in Supabase,
   * then add the returned row
   * to local React state.
   */
  const addTask =
    useCallback(
      async (
        values: TaskFormValues,
        options?: {
          addToToday?: boolean;
        },
      ) => {
        const plannedDate =
          options?.addToToday
            ? getLocalDateKey()
            : "";

        const task =
          await createTaskInCloud(
            values,
            plannedDate,
          );

        setTasks((prev) => [
          task,
          ...prev,
        ]);

        return task;
      },
      [],
    );

  /**
   * Update editable task fields
   * in Supabase.
   */
  const updateTask =
    useCallback(
      async (
        id: string,
        values: TaskFormValues,
      ) => {
        const updatedTask =
          await updateTaskInCloud(
            id,
            values,
          );

        setTasks((prev) =>
          prev.map(
            (task) =>
              task.id === id
                ? updatedTask
                : task,
          ),
        );

        return updatedTask;
      },
      [],
    );

  /**
   * Delete from Supabase first,
   * then remove from local state.
   */
  const deleteTask =
    useCallback(
      async (
        id: string,
      ) => {
        await deleteTaskFromCloud(
          id,
        );

        setTasks((prev) =>
          prev.filter(
            (task) =>
              task.id !== id,
          ),
        );
      },
      [],
    );

  /**
   * Complete / reopen a task.
   */
  const toggleComplete =
    useCallback(
      async (
        id: string,
      ) => {
        const task =
          tasks.find(
            (item) =>
              item.id === id,
          );

        if (!task) {
          return;
        }

        const updatedTask =
          await updateTaskCompletion(
            id,
            !task.completed,
          );

        setTasks((prev) =>
          prev.map(
            (item) =>
              item.id === id
                ? updatedTask
                : item,
          ),
        );

        return updatedTask;
      },
      [tasks],
    );

  /**
   * Add / remove a task
   * from Today.
   */
  const toggleToday =
    useCallback(
      async (
        id: string,
      ) => {
        const task =
          tasks.find(
            (item) =>
              item.id === id,
          );

        if (!task) {
          return;
        }

        const today =
          getLocalDateKey();

        const nextPlannedDate =
          task.plannedDate ===
          today
            ? ""
            : today;

        const updatedTask =
          await updateTaskPlannedDate(
            id,
            nextPlannedDate,
          );

        setTasks((prev) =>
          prev.map(
            (item) =>
              item.id === id
                ? updatedTask
                : item,
          ),
        );

        return updatedTask;
      },
      [tasks],
    );

  const getTask =
    useCallback(
      (
        id: string | null,
      ) =>
        id
          ? tasks.find(
              (task) =>
                task.id === id,
            ) ?? null
          : null,
      [tasks],
    );

  const counts =
    useMemo(() => {
      const today =
        getLocalDateKey();

      return {
        today: tasks.filter(
          (task) =>
            task.plannedDate ===
              today &&
            !task.completed,
        ).length,

        all:
          tasks.length,

        active:
          tasks.filter(
            (task) =>
              !task.completed,
          ).length,

        completed:
          tasks.filter(
            (task) =>
              task.completed,
          ).length,
      };
    }, [tasks]);

  const filterTasks =
    useCallback(
      (
        filter: TaskFilter,
      ) => {
        const today =
          getLocalDateKey();

        /**
         * Active work first,
         * then newest first.
         */
        const sorted = [
          ...tasks,
        ].sort(
          (
            a,
            b,
          ) => {
            if (
              a.completed !==
              b.completed
            ) {
              return a.completed
                ? 1
                : -1;
            }

            return b.createdAt.localeCompare(
              a.createdAt,
            );
          },
        );

        if (
          filter ===
          "today"
        ) {
          return sorted.filter(
            (task) =>
              task.plannedDate ===
                today &&
              !task.completed,
          );
        }

        if (
          filter ===
          "active"
        ) {
          return sorted.filter(
            (task) =>
              !task.completed,
          );
        }

        if (
          filter ===
          "completed"
        ) {
          return sorted.filter(
            (task) =>
              task.completed,
          );
        }

        return sorted;
      },
      [tasks],
    );

  return {
    tasks,

    hydrated,

    counts,

    addTask,

    updateTask,

    deleteTask,

    toggleComplete,

    toggleToday,

    getTask,

    filterTasks,
  };
}