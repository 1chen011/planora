"use client";

import { CheckCircle2, CircleDashed, ListTodo, TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskFilter } from "@/types/task";

const NAV_ITEMS: { key: TaskFilter; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "全部任务", icon: ListTodo },
  { key: "active", label: "待完成", icon: CircleDashed },
  { key: "completed", label: "已完成", icon: CheckCircle2 },
];

export function AppSidebar({
  filter,
  onFilterChange,
  counts,
  todayFocusMinutes,
}: {
  filter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
  counts: Record<TaskFilter, number>;
  todayFocusMinutes: number;
}) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card/40 px-3 py-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <TimerIcon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Planora</p>
          <p className="text-[11px] leading-tight text-muted-foreground">
            工作追踪工作台
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              className={cn(
                "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-[11px] text-muted-foreground">今日专注</p>
        <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
          {todayFocusMinutes}
          <span className="ml-1 text-xs font-normal text-muted-foreground">分钟</span>
        </p>
      </div>
    </aside>
  );
}
