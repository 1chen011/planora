"use client";

import { ClipboardList, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TaskCard } from "@/components/task-card";

import { useLanguage } from "@/i18n/language-context";

import type { Task, TaskFilter } from "@/types/task";

export function TaskList({
  filter,
  tasks,
  timerTaskId,
  totalSecondsForTask,
  onAddClick,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleToday,
  onSelectForTimer,
}: {
  filter: TaskFilter;

  tasks: Task[];

  timerTaskId: string | null;

  totalSecondsForTask: (taskId: string) => number;

  onAddClick: () => void;

  onEdit: (task: Task) => void;

  onDelete: (id: string) => void;

  onToggleComplete: (id: string) => void;

  onToggleToday: (task: Task) => void;

  onSelectForTimer: (id: string) => void;
}) {
  const { t } = useLanguage();

  const filterTitle: Record<TaskFilter, string> = {
    today: t.taskList.titles.today,
    all: t.taskList.titles.all,
    active: t.taskList.titles.active,
    completed: t.taskList.titles.completed,
  };

  const emptyHint: Record<TaskFilter, string> = {
    today: t.taskList.empty.today,
    all: t.taskList.empty.all,
    active: t.taskList.empty.active,
    completed: t.taskList.empty.completed,
  };

  function getSubtitle() {
    if (filter === "today") {
      return `${tasks.length} ${t.taskList.todaySubtitle}`;
    }

    if (filter === "active") {
      return `${tasks.length} ${t.taskList.activeSubtitle}`;
    }

    return `${tasks.length} ${t.taskList.recordSubtitle}`;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-base font-semibold">{filterTitle[filter]}</h1>

          <p className="text-xs text-muted-foreground">{getSubtitle()}</p>
        </div>

        <Button onClick={onAddClick} size="sm">
          <Plus className="size-4" />

          {t.taskList.addTask}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        {tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ClipboardList className="size-8 opacity-40" />

            <p className="max-w-xs text-sm">{emptyHint[filter]}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isTimerTarget={task.id === timerTaskId}
                focusedSeconds={totalSecondsForTask(task.id)}
                onToggleComplete={onToggleComplete}
                onToggleToday={onToggleToday}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelectForTimer={onSelectForTimer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
