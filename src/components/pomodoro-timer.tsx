"use client";

import {
  useMemo,
  useState,
} from "react";

import { toast } from "sonner";

import {
  Coffee,
  Flame,
  Pause,
  Play,
  Settings2,
  Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { useLanguage } from "@/i18n/language-context";

import { cn } from "@/lib/utils";

import type { Language } from "@/i18n/translation";
import type { usePomodoro } from "@/hooks/use-pomodoro";
import type { Task } from "@/types/task";

const RADIUS = 78;
const CIRCUMFERENCE =
  2 * Math.PI * RADIUS;

function formatClock(
  totalSeconds: number
) {
  const minutes = Math.floor(
    totalSeconds / 60
  )
    .toString()
    .padStart(2, "0");

  const seconds = Math.floor(
    totalSeconds % 60
  )
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function formatTime(
  iso: string,
  language: Language
) {
  return new Date(
    iso
  ).toLocaleTimeString(
    language === "zh"
      ? "zh-CN"
      : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function PomodoroTimer({
  pomodoro,
  activeTasks,
}: {
  pomodoro: ReturnType<
    typeof usePomodoro
  >;
  activeTasks: Task[];
}) {
  const {
    language,
    t,
  } = useLanguage();

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const {
    settings,
    updateSettings,
    todaySessions,
    selectedTaskId,
    selectedTask,
    selectTask,
    phase,
    switchPhase,
    status,
    remainingSeconds,
    phaseDurationSeconds,
    start,
    pause,
    stopEarly,
  } = pomodoro;

  const progress = useMemo(
    () =>
      phaseDurationSeconds > 0
        ? 1 -
          remainingSeconds /
            phaseDurationSeconds
        : 0,
    [
      remainingSeconds,
      phaseDurationSeconds,
    ]
  );

  const phaseColor =
    phase === "focus"
      ? "var(--color-focus)"
      : "var(--color-rest)";

  const canStart =
    Boolean(selectedTaskId);

  function handleStart() {
    if (!canStart) {
      toast.warning(
        t.pomodoro.chooseTaskWarning
      );

      return;
    }

    start();
  }

  function handleStop() {
    if (status === "idle") {
      return;
    }

    stopEarly();

    toast.info(
      t.pomodoro.stoppedMessage
    );
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto scrollbar-thin border-l border-border bg-card/40 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {t.pomodoro.title}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() =>
            setSettingsOpen(
              (current) => !current
            )
          }
          title={t.pomodoro.settings}
        >
          <Settings2 className="size-3.5" />
        </Button>
      </div>

      {settingsOpen && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/30 p-3">
          <div className="grid gap-1">
            <Label
              htmlFor="focus-minutes"
              className="text-xs"
            >
              {t.pomodoro.focusMinutes}
            </Label>

            <Input
              id="focus-minutes"
              type="number"
              min={1}
              max={180}
              value={
                settings.focusMinutes
              }
              disabled={
                status !== "idle"
              }
              onChange={(event) =>
                updateSettings({
                  ...settings,
                  focusMinutes:
                    Math.max(
                      1,
                      Number(
                        event.target
                          .value
                      ) || 1
                    ),
                })
              }
            />
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="break-minutes"
              className="text-xs"
            >
              {t.pomodoro.breakMinutes}
            </Label>

            <Input
              id="break-minutes"
              type="number"
              min={1}
              max={60}
              value={
                settings.breakMinutes
              }
              disabled={
                status !== "idle"
              }
              onChange={(event) =>
                updateSettings({
                  ...settings,
                  breakMinutes:
                    Math.max(
                      1,
                      Number(
                        event.target
                          .value
                      ) || 1
                    ),
                })
              }
            />
          </div>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">
          {t.pomodoro.taskLabel}
        </Label>

        <Select
          value={
            selectedTaskId ??
            undefined
          }
          onValueChange={(id) =>
            selectTask(id)
          }
          disabled={
            status === "running"
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                t.pomodoro
                  .chooseTask
              }
            />
          </SelectTrigger>

          <SelectContent>
            {activeTasks.length ===
            0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {
                  t.pomodoro
                    .noTasks
                }
              </div>
            ) : (
              activeTasks.map(
                (task) => (
                  <SelectItem
                    key={task.id}
                    value={task.id}
                  >
                    {task.title}
                  </SelectItem>
                )
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary/40 p-1">
        <button
          type="button"
          disabled={
            status !== "idle"
          }
          onClick={() =>
            switchPhase("focus")
          }
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed",
            phase === "focus"
              ? "bg-focus/20 text-focus"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Flame className="size-3.5" />

          {t.pomodoro.focus}
        </button>

        <button
          type="button"
          disabled={
            status !== "idle"
          }
          onClick={() =>
            switchPhase("break")
          }
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed",
            phase === "break"
              ? "bg-rest/20 text-rest"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Coffee className="size-3.5" />

          {t.pomodoro.break}
        </button>
      </div>

      <div className="flex flex-col items-center py-2">
        <div className="relative flex size-44 items-center justify-center">
          <svg
            width="176"
            height="176"
            viewBox="0 0 176 176"
            className="-rotate-90"
          >
            <circle
              cx="88"
              cy="88"
              r={RADIUS}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="8"
            />

            <circle
              cx="88"
              cy="88"
              r={RADIUS}
              fill="none"
              stroke={phaseColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={
                CIRCUMFERENCE
              }
              strokeDashoffset={
                CIRCUMFERENCE *
                (1 - progress)
              }
              className={cn(
                status ===
                  "running" &&
                  "transition-[stroke-dashoffset] duration-1000 ease-linear"
              )}
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-4xl font-semibold tabular-nums">
              {formatClock(
                remainingSeconds
              )}
            </span>

            <span
              className={cn(
                "mt-1 text-[11px] font-medium",
                phase === "focus"
                  ? "text-focus"
                  : "text-rest"
              )}
            >
              {status === "running"
                ? phase ===
                  "focus"
                  ? t.pomodoro
                      .runningFocus
                  : t.pomodoro
                      .runningBreak
                : status ===
                    "paused"
                  ? t.pomodoro.paused
                  : t.pomodoro.ready}
            </span>
          </div>
        </div>

        {selectedTask ? (
          <p className="mt-3 max-w-full truncate text-xs text-muted-foreground">
            {t.pomodoro.taskPrefix}{" "}
            <span className="font-medium text-foreground">
              {selectedTask.title}
            </span>
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            {
              t.pomodoro
                .chooseFirst
            }
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          {status === "running" ? (
            <Button
              onClick={pause}
              size="sm"
              variant="secondary"
            >
              <Pause className="size-3.5" />

              {t.pomodoro.pause}
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              size="sm"
              disabled={!canStart}
            >
              <Play className="size-3.5" />

              {status === "paused"
                ? t.pomodoro.resume
                : t.pomodoro.start}
            </Button>
          )}

          <Button
            onClick={handleStop}
            size="sm"
            variant="outline"
            disabled={
              status === "idle"
            }
          >
            <Square className="size-3.5" />

            {t.pomodoro.stop}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {t.pomodoro.todayLog}
        </p>

        {todaySessions.length ===
        0 ? (
          <p className="text-xs text-muted-foreground">
            {
              t.pomodoro
                .noRecords
            }
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todaySessions.map(
              (session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-md border border-border bg-secondary/20 px-2.5 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {
                        session.taskTitle
                      }
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {formatTime(
                        session.startedAt,
                        language
                      )}{" "}
                      ·{" "}
                      {session.phase ===
                      "focus"
                        ? t.pomodoro
                            .focus
                        : t.pomodoro
                            .break}

                      {!session.completedFully &&
                        ` · ${t.pomodoro.endedEarly}`}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 font-mono tabular-nums",
                      session.phase ===
                        "focus"
                        ? "text-focus"
                        : "text-rest"
                    )}
                  >
                    {Math.round(
                      session.elapsedSeconds /
                        60
                    )}{" "}
                    {language === "zh"
                      ? "分"
                      : "min"}
                  </span>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </aside>
  );
}