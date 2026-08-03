"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { TaskList } from "@/components/task-list";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { useTasks } from "@/hooks/use-tasks";
import { usePomodoro } from "@/hooks/use-pomodoro";
import type { Task, TaskFilter } from "@/types/task";

export default function Home() {
  const {
    tasks,
    hydrated,
    counts,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    filterTasks,
  } = useTasks();

  const pomodoro = usePomodoro(tasks);

  const [filter, setFilter] = useState<TaskFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // toast on natural phase completion (distinct from manual stop)
  useEffect(() => {
    if (!pomodoro.lastEvent || pomodoro.lastEvent.type !== "completed") return;
    const justFinishedFocus = pomodoro.lastEvent.phase === "focus";
    toast.success(
      justFinishedFocus ? "专注时段结束，去休息一下吧" : "休息结束，可以开始下一段专注了",
      { description: justFinishedFocus ? "本次投入已记录到任务" : undefined }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoro.lastEvent]);

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
      toast.success("任务已更新");
    } else {
      addTask(values);
      toast.success("任务已创建");
    }
  }

  function handleDelete(id: string) {
    deleteTask(id);
    if (pomodoro.selectedTaskId === id) {
      pomodoro.selectTask(null);
    }
    toast("任务已删除");
  }

  const activeTasks = tasks.filter((t) => !t.completed);

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        正在加载本地数据…
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <AppSidebar
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        todayFocusMinutes={Math.round(
          pomodoro.todaySessions
            .filter((s) => s.phase === "focus")
            .reduce((sum, s) => sum + s.elapsedSeconds, 0) / 60
        )}
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
