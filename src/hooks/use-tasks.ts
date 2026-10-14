"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  genId,
  taskStorage,
} from "@/lib/storage";

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

function normalizeTask(
  task: Task,
): Task {
  return {
    ...task,

    plannedDate:
      typeof task.plannedDate ===
      "string"
        ? task.plannedDate
        : "",

    completedAt:
      typeof task.completedAt ===
      "string"
        ? task.completedAt
        : null,

    priority:
      task.priority === "high" ||
      task.priority === "low" ||
      task.priority === "medium"
        ? task.priority
        : "medium",
  };
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

  useEffect(() => {
    const storedTasks =
      taskStorage.load();

    setTasks(
      storedTasks.map(
        normalizeTask,
      ),
    );

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    taskStorage.save(tasks);
  }, [
    tasks,
    hydrated,
  ]);

  const addTask =
    useCallback(
      (
        values: TaskFormValues,
        options?: {
          addToToday?: boolean;
        },
      ) => {
        const task: Task = {
          id: genId("task"),

          ...values,

          /**
           * Priority remains in the data model
           * for backward compatibility, but is
           * no longer a required user decision.
           */
          priority: "medium",

          completed: false,

          completedAt: null,

          createdAt:
            new Date().toISOString(),

          plannedDate:
            options?.addToToday
              ? getLocalDateKey()
              : "",
        };

        setTasks((prev) => [
          task,
          ...prev,
        ]);

        return task;
      },
      [],
    );

  const updateTask =
    useCallback(
      (
        id: string,
        values: TaskFormValues,
      ) => {
        setTasks((prev) =>
          prev.map(
            (task) =>
              task.id === id
                ? {
                    ...task,

                    /**
                     * Only form-editable fields
                     * are updated here.
                     *
                     * Existing priority remains
                     * untouched.
                     */
                    ...values,
                  }
                : task,
          ),
        );
      },
      [],
    );

  const deleteTask =
    useCallback(
      (id: string) => {
        setTasks((prev) =>
          prev.filter(
            (task) =>
              task.id !== id,
          ),
        );
      },
      [],
    );

  const toggleComplete =
    useCallback(
      (id: string) => {
        setTasks((prev) =>
          prev.map((task) => {
            if (
              task.id !== id
            ) {
              return task;
            }

            const nextCompleted =
              !task.completed;

            return {
              ...task,

              completed:
                nextCompleted,

              completedAt:
                nextCompleted
                  ? new Date().toISOString()
                  : null,
            };
          }),
        );
      },
      [],
    );

  const toggleToday =
    useCallback(
      (id: string) => {
        const today =
          getLocalDateKey();

        setTasks((prev) =>
          prev.map(
            (task) =>
              task.id === id
                ? {
                    ...task,

                    plannedDate:
                      task.plannedDate ===
                      today
                        ? ""
                        : today,
                  }
                : task,
          ),
        );
      },
      [],
    );

  const getTask =
    useCallback(
      (id: string | null) =>
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

        all: tasks.length,

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
         * Keep sorting simple:
         * active work first, then newest first.
         *
         * Priority no longer influences task order.
         */
        const sorted = [
          ...tasks,
        ].sort((a, b) => {
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
        });

        if (
          filter === "today"
        ) {
          return sorted.filter(
            (task) =>
              task.plannedDate ===
                today &&
              !task.completed,
          );
        }

        if (
          filter === "active"
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