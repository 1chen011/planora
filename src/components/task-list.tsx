"use client";

import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/task-card";
import type { Task, TaskFilter } from "@/types/task";

const FILTER_TITLE: Record<TaskFilter, string> = {
  all: "全部任务",
  active: "待完成",
  completed: "已完成",
};

const EMPTY_HINT: Record<TaskFilter, string> = {
  all: "还没有任务，创建第一条待办开始今天的工作吧。",
  active: "没有待完成的任务，喘口气或者去规划下一步。",
  completed: "还没有已完成的任务，完成后会出现在这里。",
};

export function TaskList({
  filter,
  tasks,
  timerTaskId,
  totalSecondsForTask,
  onAddClick,
  onEdit,
  onDelete,
  onToggleComplete,
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
  onSelectForTimer: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-base font-semibold">{FILTER_TITLE[filter]}</h1>
          <p className="text-xs text-muted-foreground">
            {tasks.length} 项{filter === "active" ? "待处理" : "记录"}
          </p>
        </div>
        <Button onClick={onAddClick} size="sm">
          <Plus className="size-4" />
          新增任务
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        {tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ClipboardList className="size-8 opacity-40" />
            <p className="max-w-xs text-sm">{EMPTY_HINT[filter]}</p>
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
