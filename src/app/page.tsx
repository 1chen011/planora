"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { FocusMode } from "@/components/focus-mode";
import { HomeDashboard } from "@/components/home-dashboard";
import { MiniFocus } from "@/components/mini-focus";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskList } from "@/components/task-list";

import { useMiniFocus } from "@/hooks/use-mini-focus";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useTasks } from "@/hooks/use-tasks";

import { useLanguage } from "@/i18n/language-context";

import type { AppView, Task, TaskFilter } from "@/types/task";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isLocalDate(iso: string | null, target: Date) {
  if (!iso) {
    return false;
  }

  const date = new Date(iso);

  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

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

  const miniFocus = useMiniFocus();

  const [view, setView] = useState<AppView>("home");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [focusModeOpen, setFocusModeOpen] = useState(false);

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
      addToToday: view === "today",
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
    const todayKey = getLocalDateKey();

    const isPlannedToday = task.plannedDate === todayKey;

    toggleToday(task.id);

    toast(isPlannedToday ? t.toast.removedFromToday : t.toast.addedToToday);
  }

  function handleStartFocusFromHome() {
    if (pomodoro.selectedTask) {
      setFocusModeOpen(true);

      return;
    }

    setView("today");
  }

  async function handleEnterMiniFocus() {
    const result = await miniFocus.open();

    if (result === "unsupported") {
      toast.warning(t.miniFocus.unsupported);

      return;
    }

    if (result === "failed") {
      toast.warning(t.miniFocus.openFailed);

      return;
    }

    setFocusModeOpen(false);
  }

  function handleReturnToFocusMode() {
    miniFocus.focusMainWindow();

    setFocusModeOpen(true);

    miniFocus.close();
  }

  const now = new Date();

  const yesterday = new Date(now);

  yesterday.setDate(yesterday.getDate() - 1);

  const todayKey = getLocalDateKey(now);

  const activeTasks = tasks.filter((task) => !task.completed);

  const todayFocusSessions = pomodoro.sessions.filter(
    (session) =>
      session.phase === "focus" && isLocalDate(session.startedAt, now),
  );

  const yesterdayFocusSessions = pomodoro.sessions.filter(
    (session) =>
      session.phase === "focus" && isLocalDate(session.startedAt, yesterday),
  );

  const todayFocusMinutes = Math.round(
    todayFocusSessions.reduce(
      (sum, session) => sum + session.elapsedSeconds,
      0,
    ) / 60,
  );

  const todayCompletedTasks = tasks.filter((task) =>
    isLocalDate(task.completedAt, now),
  ).length;

  const yesterdayCompletedTasks = tasks.filter((task) =>
    isLocalDate(task.completedAt, yesterday),
  ).length;

  const todayPlannedTasks = tasks.filter(
    (task) => task.plannedDate === todayKey,
  ).length;

  if (!hydrated || !pomodoro.hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        {t.app.loading}
      </div>
    );
  }

  const isTaskView = view !== "home";

  const taskFilter = isTaskView ? (view as TaskFilter) : null;

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <AppSidebar
        view={view}
        onViewChange={setView}
        counts={counts}
        todayFocusMinutes={todayFocusMinutes}
      />

      <main className="min-w-0 flex-1">
        {view === "home" ? (
          <HomeDashboard
            currentFocusTask={pomodoro.selectedTask}
            timerStatus={pomodoro.status}
            remainingSeconds={pomodoro.remainingSeconds}
            today={{
              planned: todayPlannedTasks,

              completed: todayCompletedTasks,

              focusSessions: todayFocusSessions.length,
            }}
            yesterday={{
              completed: yesterdayCompletedTasks,

              focusSessions: yesterdayFocusSessions.length,
            }}
            onPlanDay={() => setView("today")}
            onStartFocus={handleStartFocusFromHome}
          />
        ) : (
          taskFilter && (
            <TaskList
              filter={taskFilter}
              tasks={filterTasks(taskFilter)}
              timerTaskId={pomodoro.selectedTaskId}
              totalSecondsForTask={pomodoro.totalSecondsForTask}
              onAddClick={openAddDialog}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onToggleComplete={toggleComplete}
              onToggleToday={handleToggleToday}
              onSelectForTimer={pomodoro.selectTask}
              todayProgress={{
                focusMinutes: todayFocusMinutes,

                focusSessions: todayFocusSessions.length,

                completedTasks: todayCompletedTasks,
              }}
            />
          )
        )}
      </main>

      {view !== "home" && (
        <PomodoroTimer
          pomodoro={pomodoro}
          activeTasks={activeTasks}
          onEnterFocusMode={() => setFocusModeOpen(true)}
        />
      )}

      {focusModeOpen && pomodoro.selectedTask && (
        <FocusMode
          pomodoro={pomodoro}
          miniFocusSupported={miniFocus.supported}
          onEnterMiniFocus={handleEnterMiniFocus}
          onExit={() => setFocusModeOpen(false)}
        />
      )}

      <MiniFocus
        portalRoot={miniFocus.portalRoot}
        pomodoro={pomodoro}
        onReturnToFocusMode={handleReturnToFocusMode}
      />

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTask={editingTask}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
