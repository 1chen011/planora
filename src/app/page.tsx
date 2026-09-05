"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { TaskList } from "@/components/task-list";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { PomodoroTimer } from "@/components/pomodoro-timer";

import { useTasks } from "@/hooks/use-tasks";
import { usePomodoro } from "@/hooks/use-pomodoro";

import { useLanguage } from "@/i18n/language-context";

import type { Task, TaskFilter } from "@/types/task";

export default function Home() {
  const { t } = useLanguage();

  const {
    tasks,
    hydrated,
    counts,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    toggleToday,
    filterTasks,
  } = useTasks();

  const pomodoro = usePomodoro(tasks);

  const [filter, setFilter] = useState<TaskFilter>("today");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!pomodoro.lastEvent || pomodoro.lastEvent.type !== "completed") {
      return;
    }

    const justFinishedFocus = pomodoro.lastEvent.phase === "focus";

    toast.success(
      justFinishedFocus ? t.pomodoro.focusFinished : t.pomodoro.breakFinished,
      {
        description: justFinishedFocus ? t.pomodoro.focusRecorded : undefined,
      },
    );
  }, [pomodoro.lastEvent, t]);

  function openAddDialog() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleSubmit(values: Parameters<typeof addTask>[0]) {
    if (editingTask) {
      updateTask(editingTask.id, values);

      toast.success(t.toast.updated);

      return;
    }

    addTask(values, {
      addToToday: filter === "today",
    });

    toast.success(t.toast.created);
  }

  function handleDelete(id: string) {
    deleteTask(id);

    if (pomodoro.selectedTaskId === id) {
      pomodoro.selectTask(null);
    }

    toast(t.toast.deleted);
  }

  function handleToggleToday(task: Task) {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    const todayKey = `${year}-${month}-${day}`;

    const isPlannedToday = task.plannedDate === todayKey;

    toggleToday(task.id);

    toast(isPlannedToday ? t.toast.removedFromToday : t.toast.addedToToday);
  }

  const activeTasks = tasks.filter((task) => !task.completed);

  const todayFocusMinutes = Math.round(
    pomodoro.todaySessions
      .filter((session) => session.phase === "focus")
      .reduce((sum, session) => sum + session.elapsedSeconds, 0) / 60,
  );

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        {t.app.loading}
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <AppSidebar
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        todayFocusMinutes={todayFocusMinutes}
      />

      <main className="min-w-0 flex-1">
        <TaskList
          filter={filter}
          tasks={filterTasks(filter)}
          timerTaskId={pomodoro.selectedTaskId}
          totalSecondsForTask={pomodoro.totalSecondsForTask}
          onAddClick={openAddDialog}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onToggleComplete={toggleComplete}
          onToggleToday={handleToggleToday}
          onSelectForTimer={pomodoro.selectTask}
        />
      </main>

      <PomodoroTimer pomodoro={pomodoro} activeTasks={activeTasks} />

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTask={editingTask}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
