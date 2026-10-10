"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Home,
  Languages,
  ListTodo,
  Moon,
  Sun,
  TimerIcon,
} from "lucide-react";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/language-context";

import type { Language } from "@/i18n/translation";
import type { AppView, TaskFilter } from "@/types/task";

const TASK_NAV_ITEMS: {
  key: Exclude<TaskFilter, "today">;
  icon: React.ElementType;
}[] = [
  {
    key: "all",
    icon: ListTodo,
  },
  {
    key: "active",
    icon: CircleDashed,
  },
  {
    key: "completed",
    icon: CheckCircle2,
  },
];

export function AppSidebar({
  view,
  onViewChange,
  counts,
  todayFocusMinutes,
}: {
  view: AppView;

  onViewChange: (view: AppView) => void;

  counts: Record<TaskFilter, number>;

  todayFocusMinutes: number;
}) {
  const { language, setLanguage, t } = useLanguage();

  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const taskLabels: Record<Exclude<TaskFilter, "today">, string> = {
    all: t.sidebar.allTasks,
    active: t.sidebar.active,
    completed: t.sidebar.completed,
  };

  function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setLanguage(event.target.value as Language);
  }

  function handleThemeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setTheme(event.target.value);
  }

  const homeActive = view === "home";
  const todayActive = view === "today";

  const currentTheme = mounted ? (theme ?? "dark") : "dark";

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card/40 px-3 py-4">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <TimerIcon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">{t.app.name}</p>

          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {t.app.subtitle}
          </p>
        </div>
      </div>

      {/* Workspace */}
      <nav className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onViewChange("home")}
          className={cn(
            "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
            homeActive
              ? "bg-primary/15 font-medium text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2">
            <Home className="size-4" />
            {t.sidebar.home}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange("today")}
          className={cn(
            "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
            todayActive
              ? "bg-primary/15 font-medium text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {t.sidebar.today}
          </span>

          <span
            className={cn(
              "rounded-full px-1.5 text-xs tabular-nums",
              todayActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            {counts.today}
          </span>
        </button>
      </nav>

      {/* Task repository */}
      <div className="mt-5">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
          {t.sidebar.tasksSection}
        </p>

        <nav className="flex flex-col gap-1">
          {TASK_NAV_ITEMS.map(({ key, icon: Icon }) => {
            const active = view === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onViewChange(key)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {taskLabels[key]}
                </span>

                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom controls */}
      <div className="mt-auto space-y-3">
        <div className="rounded-lg border border-border bg-secondary/40 p-3">
          <p className="text-[11px] text-muted-foreground">
            {t.sidebar.todayFocus}
          </p>

          <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
            {todayFocusMinutes}

            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {t.sidebar.minutesShort}
            </span>
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
            {currentTheme === "light" ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}

            <span>{t.sidebar.appearance}</span>
          </div>

          <select
            value={currentTheme}
            onChange={handleThemeChange}
            disabled={!mounted}
            className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none transition-colors hover:bg-accent focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="dark">{t.sidebar.dark}</option>
            <option value="light">{t.sidebar.light}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
            <Languages className="size-3.5" />
            <span>{t.sidebar.language}</span>
          </div>

          <select
            value={language}
            onChange={handleLanguageChange}
            className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none transition-colors hover:bg-accent focus:ring-2 focus:ring-ring"
          >
            <option value="en">{t.sidebar.english}</option>
            <option value="zh">{t.sidebar.chinese}</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
