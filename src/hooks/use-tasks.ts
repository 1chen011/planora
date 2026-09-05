"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { genId, taskStorage } from "@/lib/storage";

import type { Task, TaskFilter, TaskFormValues } from "@/types/task";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeTask(task: Task): Task {
  return {
    ...task,

    plannedDate: typeof task.plannedDate === "string" ? task.plannedDate : "",
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedTasks = taskStorage.load();

    setTasks(storedTasks.map(normalizeTask));

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    taskStorage.save(tasks);
  }, [tasks, hydrated]);

  const addTask = useCallback(
    (
      values: TaskFormValues,
      options?: {
        addToToday?: boolean;
      },
    ) => {
      const task: Task = {
        id: genId("task"),

        ...values,

        completed: false,

        createdAt: new Date().toISOString(),

        plannedDate: options?.addToToday ? getLocalDateKey() : "",
      };

      setTasks((prev) => [task, ...prev]);

      return task;
    },
    [],
  );

  const updateTask = useCallback((id: string, values: TaskFormValues) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...values,
            }
          : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    );
  }, []);

  const toggleToday = useCallback((id: string) => {
    const today = getLocalDateKey();

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,

              plannedDate: task.plannedDate === today ? "" : today,
            }
          : task,
      ),
    );
  }, []);

  const getTask = useCallback(
    (id: string | null) =>
      id ? (tasks.find((task) => task.id === id) ?? null) : null,
    [tasks],
  );

  const counts = useMemo(() => {
    const today = getLocalDateKey();

    return {
      today: tasks.filter(
        (task) => task.plannedDate === today && !task.completed,
      ).length,

      all: tasks.length,

      active: tasks.filter((task) => !task.completed).length,

      completed: tasks.filter((task) => task.completed).length,
    };
  }, [tasks]);

  const filterTasks = useCallback(
    (filter: TaskFilter) => {
      const today = getLocalDateKey();

      const sorted = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        const rank = {
          high: 0,
          medium: 1,
          low: 2,
        } as const;

        if (rank[a.priority] !== rank[b.priority]) {
          return rank[a.priority] - rank[b.priority];
        }

        return b.createdAt.localeCompare(a.createdAt);
      });

      if (filter === "today") {
        return sorted.filter(
          (task) => task.plannedDate === today && !task.completed,
        );
      }

      if (filter === "active") {
        return sorted.filter((task) => !task.completed);
      }

      if (filter === "completed") {
        return sorted.filter((task) => task.completed);
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
