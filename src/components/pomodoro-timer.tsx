"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Coffee, Flame, Pause, Play, Settings2, Square } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { usePomodoro } from "@/hooks/use-pomodoro";
import type { Task } from "@/types/task";

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PomodoroTimer({
  pomodoro,
  activeTasks,
}: {
  pomodoro: ReturnType<typeof usePomodoro>;
  activeTasks: Task[];
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        ? 1 - remainingSeconds / phaseDurationSeconds
        : 0,
    [remainingSeconds, phaseDurationSeconds]
  );

  const phaseColor = phase === "focus" ? "var(--color-focus)" : "var(--color-rest)";
  const canStart = Boolean(selectedTaskId);

  function handleStart() {
    if (!canStart) {
      toast.warning("请先选择一条任务再开始计时");
      return;
    }
    start();
  }

  function handleStop() {
    if (status === "idle") return;
    stopEarly();
    toast.info("已停止并记录本次投入时长");
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto scrollbar-thin border-l border-border bg-card/40 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">番茄计时器</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setSettingsOpen((v) => !v)}
          title="计时设置"
        >
          <Settings2 className="size-3.5" />
        </Button>
      </div>

      {settingsOpen && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/30 p-3">
          <div className="grid gap-1">
            <Label htmlFor="focus-minutes" className="text-xs">
              专注时长（分钟）
            </Label>
            <Input
              id="focus-minutes"
              type="number"
              min={1}
              max={180}
              value={settings.focusMinutes}
              disabled={status !== "idle"}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  focusMinutes: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="break-minutes" className="text-xs">
              休息时长（分钟）
            </Label>
            <Input
              id="break-minutes"
              type="number"
              min={1}
              max={60}
              value={settings.breakMinutes}
              disabled={status !== "idle"}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  breakMinutes: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </div>
        </div>
      )}

      {/* task binding */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">计时绑定任务</Label>
        <Select
          value={selectedTaskId ?? undefined}
          onValueChange={(id) => selectTask(id)}
          disabled={status === "running"}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择一条待完成任务" />
          </SelectTrigger>
          <SelectContent>
            {activeTasks.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                暂无待完成任务
              </div>
            ) : (
              activeTasks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* phase switch */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary/40 p-1">
        <button
          type="button"
          disabled={status !== "idle"}
          onClick={() => switchPhase("focus")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed",
            phase === "focus"
              ? "bg-focus/20 text-focus"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Flame className="size-3.5" />
          专注
        </button>
        <button
          type="button"
          disabled={status !== "idle"}
          onClick={() => switchPhase("break")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed",
            phase === "break"
              ? "bg-rest/20 text-rest"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Coffee className="size-3.5" />
          休息
        </button>
      </div>

      {/* timer ring */}
      <div className="flex flex-col items-center py-2">
        <div className="relative flex size-44 items-center justify-center">
          <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
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
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              className={cn(status === "running" && "transition-[stroke-dashoffset] duration-1000 ease-linear")}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-4xl font-semibold tabular-nums">
              {formatClock(remainingSeconds)}
            </span>
            <span
              className={cn(
                "mt-1 text-[11px] font-medium",
                phase === "focus" ? "text-focus" : "text-rest"
              )}
            >
              {status === "running"
                ? phase === "focus"
                  ? "专注进行中"
                  : "休息进行中"
                : status === "paused"
                ? "已暂停"
                : "待开始"}
            </span>
          </div>
        </div>

        {selectedTask ? (
          <p className="mt-3 max-w-full truncate text-xs text-muted-foreground">
            绑定任务：
            <span className="font-medium text-foreground">{selectedTask.title}</span>
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">请先选择一条任务</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          {status === "running" ? (
            <Button onClick={pause} size="sm" variant="secondary">
              <Pause className="size-3.5" />
              暂停
            </Button>
          ) : (
            <Button onClick={handleStart} size="sm" disabled={!canStart}>
              <Play className="size-3.5" />
              {status === "paused" ? "继续" : "开始"}
            </Button>
          )}
          <Button
            onClick={handleStop}
            size="sm"
            variant="outline"
            disabled={status === "idle"}
          >
            <Square className="size-3.5" />
            停止
          </Button>
        </div>
      </div>

      <Separator />

      {/* today's log */}
      <div className="flex-1">
        <p className="mb-2 text-xs font-medium text-muted-foreground">今日记录</p>
        {todaySessions.length === 0 ? (
          <p className="text-xs text-muted-foreground">今天还没有计时记录。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todaySessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-border bg-secondary/20 px-2.5 py-1.5 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.taskTitle}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatTime(s.startedAt)} · {s.phase === "focus" ? "专注" : "休息"}
                    {!s.completedFully && " · 提前结束"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono tabular-nums",
                    s.phase === "focus" ? "text-focus" : "text-rest"
                  )}
                >
                  {Math.round(s.elapsedSeconds / 60)} 分
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
