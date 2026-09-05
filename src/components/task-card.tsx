"use client";

import {
  CalendarClock,
  CalendarPlus,
  CalendarX2,
  Pencil,
  Timer,
  Trash2,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";

import { useLanguage } from "@/i18n/language-context";

import { cn } from "@/lib/utils";

import type { Language } from "@/i18n/translation";
import type { Task } from "@/types/task";

function formatDeadline(deadline: string, language: Language) {
  if (!deadline) return null;

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const overdue = date < today;

  return {
    label: date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
    }),
    overdue,
  };
}

function formatFocusedTime(totalSeconds: number, language: Language) {
  const minutes = Math.round(totalSeconds / 60);

  if (minutes < 60) {
    return language === "zh" ? `${minutes} 分钟` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (language === "zh") {
    return remainingMinutes === 0
      ? `${hours} 小时`
      : `${hours} 小时 ${remainingMinutes} 分钟`;
  }

  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function TaskCard({
  task,
  isTimerTarget,
  focusedSeconds,
  onToggleComplete,
  onToggleToday,
  onEdit,
  onDelete,
  onSelectForTimer,
}: {
  task: Task;
  isTimerTarget: boolean;
  focusedSeconds: number;
  onToggleComplete: (id: string) => void;
  onToggleToday: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSelectForTimer: (id: string) => void;
}) {
  const { language, t } = useLanguage();

  const deadline = formatDeadline(task.deadline, language);

  const todayKey = getLocalDateKey();

  const isPlannedToday = task.plannedDate === todayKey;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-card px-3.5 py-3 transition-colors",
        isTimerTarget && "border-primary/50 ring-1 ring-primary/30",
        task.completed && "opacity-60",
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="mt-1"
        aria-label={t.task.toggleComplete}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>

          <PriorityBadge priority={task.priority} />

          {isPlannedToday && !task.completed && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {t.task.today}
            </span>
          )}

          {isTimerTarget && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
              {t.task.timerTarget}
            </span>
          )}
        </div>

        {task.note && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {task.note}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {deadline && (
            <span
              className={cn(
                "flex items-center gap-1",
                deadline.overdue && !task.completed && "text-destructive",
              )}
            >
              <CalendarClock className="size-3" />

              {deadline.label}

              {deadline.overdue && !task.completed && (
                <span>· {t.task.overdue}</span>
              )}
            </span>
          )}

          {focusedSeconds > 0 && (
            <span className="flex items-center gap-1">
              <Timer className="size-3" />
              {t.task.focused} {formatFocusedTime(focusedSeconds, language)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onToggleToday(task)}
          disabled={task.completed}
          title={isPlannedToday ? t.task.removeFromToday : t.task.addToToday}
        >
          {isPlannedToday ? (
            <CalendarX2 className="size-3.5" />
          ) : (
            <CalendarPlus className="size-3.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-primary hover:text-primary"
          onClick={() => onSelectForTimer(task.id)}
          disabled={task.completed}
          title={t.task.setFocusTask}
        >
          <Timer className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onEdit(task)}
          title={t.task.edit}
        >
          <Pencil className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(task.id)}
          title={t.task.delete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
