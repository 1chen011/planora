"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { genId, taskStorage } from "@/lib/storage";
import type { Task, TaskFilter, TaskFormValues } from "@/types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage on mount (client only)
  useEffect(() => {
    setTasks(taskStorage.load());
    setHydrated(true);
  }, []);

  // persist on every change, once hydrated
  useEffect(() => {
    if (!hydrated) return;
    taskStorage.save(tasks);
  }, [tasks, hydrated]);

  const addTask = useCallback((values: TaskFormValues) => {
    const task: Task = {
      id: genId("task"),
      ...values,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, values: TaskFormValues) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...values } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const getTask = useCallback(
    (id: string | null) => (id ? tasks.find((t) => t.id === id) ?? null : null),
    [tasks]
  );

  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
    }),
    [tasks]
  );

  const filterTasks = useCallback(
    (filter: TaskFilter) => {
      const sorted = [...tasks].sort((a, b) => {
        // incomplete first, then by priority, then newest first
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const rank = { high: 0, medium: 1, low: 2 } as const;
        if (rank[a.priority] !== rank[b.priority]) {
          return rank[a.priority] - rank[b.priority];
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
      if (filter === "active") return sorted.filter((t) => !t.completed);
      if (filter === "completed") return sorted.filter((t) => t.completed);
      return sorted;
    },
    [tasks]
  );

  return {
    tasks,
    hydrated,
    counts,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    getTask,
    filterTasks,
  };
}
