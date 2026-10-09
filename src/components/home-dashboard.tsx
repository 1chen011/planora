"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CirclePlay,
  Clock3,
  Focus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-context";

import type { Task } from "@/types/task";

type TimerStatus = "idle" | "running" | "paused";

type DaySnapshot = {
  planned: number;
  completed: number;
  focusSessions: number;
};

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function HomeDashboard({
  currentFocusTask,
  timerStatus,
  remainingSeconds,
  today,
  yesterday,
  onPlanDay,
  onStartFocus,
}: {
  currentFocusTask: Task | null;
  timerStatus: TimerStatus;
  remainingSeconds: number;
  today: DaySnapshot;
  yesterday: Pick<DaySnapshot, "completed" | "focusSessions">;
  onPlanDay: () => void;
  onStartFocus: () => void;
}) {
  const { language, t } = useLanguage();

  const now = new Date();
  const hour = now.getHours();

  const greeting =
    hour < 12
      ? t.home.greeting.morning
      : hour < 18
        ? t.home.greeting.afternoon
        : t.home.greeting.evening;

  const dateLabel = new Intl.DateTimeFormat(
    language === "zh" ? "zh-CN" : "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  ).format(now);

  const todayFocusLabel =
    today.focusSessions === 1 ? t.home.focusSession : t.home.focusSessions;

  const yesterdayFocusLabel =
    yesterday.focusSessions === 1
      ? t.home.focusSession
      : t.home.focusSessions;

  const todayCompletedLabel =
    today.completed === 1 ? t.home.taskCompleted : t.home.tasksCompleted;

  const yesterdayCompletedLabel =
    yesterday.completed === 1
      ? t.home.taskCompleted
      : t.home.tasksCompleted;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-8 py-8 lg:px-10 lg:py-10">
        <header className="max-w-2xl">
          <p className="text-xs font-medium text-muted-foreground">
            {dateLabel}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {greeting}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {t.home.prompt}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button onClick={onPlanDay}>
              <CalendarDays className="size-4" />
              {t.home.planDay}
            </Button>

            <Button variant="outline" onClick={onStartFocus}>
              <CirclePlay className="size-4" />
              {t.home.startFocusing}
            </Button>
          </div>
        </header>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-xl border border-border bg-card/35 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                  {t.home.currentFocus}
                </p>

                {currentFocusTask ? (
                  <>
                    <h2 className="mt-3 text-lg font-semibold">
                      {currentFocusTask.title}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.home.currentFocusSelected}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-3 text-lg font-semibold">
                      {t.home.currentFocusEmpty}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.home.currentFocusEmptyHint}
                    </p>
                  </>
                )}
              </div>

              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Focus className="size-5" />
              </div>
            </div>

            {currentFocusTask && (
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />

                <span className="font-mono tabular-nums text-foreground">
                  {formatTimer(remainingSeconds)}
                </span>

                <span>
                  {timerStatus === "running"
                    ? t.home.running
                    : timerStatus === "paused"
                      ? t.home.paused
                      : t.home.ready}
                </span>
              </div>
            )}

            <Button
              className="mt-5"
              size="sm"
              variant={currentFocusTask ? "default" : "outline"}
              onClick={onStartFocus}
            >
              {currentFocusTask ? t.home.continueFocus : t.home.chooseTask}
              <ArrowRight className="size-4" />
            </Button>
          </section>

          <section className="rounded-xl border border-border bg-card/35 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {t.home.today}
            </p>

            <div className="mt-4 grid grid-cols-3 divide-x divide-border">
              <div className="pr-3">
                <p className="font-mono text-xl font-semibold tabular-nums">
                  {today.planned}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t.home.planned}
                </p>
              </div>

              <div className="px-3">
                <p className="font-mono text-xl font-semibold tabular-nums">
                  {today.completed}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t.home.completed}
                </p>
              </div>

              <div className="pl-3">
                <p className="font-mono text-xl font-semibold tabular-nums">
                  {today.focusSessions}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t.home.focusSessionsShort}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-border bg-card/20">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-xs font-medium text-muted-foreground">
              {t.home.comparison}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 md:divide-x md:divide-border">
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="size-4 text-primary" />
                {t.home.today}
              </div>

              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>{todayFocusLabel}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {today.focusSessions}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>{todayCompletedLabel}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {today.completed}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border px-5 py-4 md:border-t-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4 text-muted-foreground" />
                {t.home.yesterday}
              </div>

              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>{yesterdayFocusLabel}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {yesterday.focusSessions}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>{yesterdayCompletedLabel}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {yesterday.completed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
