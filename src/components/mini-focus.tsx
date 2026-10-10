"use client";

import {
  Maximize2,
  Pause,
  Play,
} from "lucide-react";

import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

import { useLanguage } from "@/i18n/language-context";

import { cn } from "@/lib/utils";

import type { usePomodoro } from "@/hooks/use-pomodoro";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(
    totalSeconds / 60,
  )
    .toString()
    .padStart(2, "0");

  const seconds = Math.floor(
    totalSeconds % 60,
  )
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function MiniFocus({
  portalRoot,
  pomodoro,
  onReturnToFocusMode,
}: {
  portalRoot: HTMLElement | null;

  pomodoro: ReturnType<
    typeof usePomodoro
  >;

  onReturnToFocusMode: () => void;
}) {
  const { t } = useLanguage();

  if (!portalRoot) {
    return null;
  }

  const {
    selectedTask,
    phase,
    status,
    remainingSeconds,
    start,
    pause,
  } = pomodoro;

  function handlePrimaryAction() {
    if (status === "running") {
      pause();

      return;
    }

    start();
  }

  const primaryLabel =
    status === "running"
      ? t.pomodoro.pause
      : status === "paused"
        ? t.pomodoro.resume
        : t.pomodoro.start;

  const phaseLabel =
    phase === "focus"
      ? t.focusMode.focusPhase
      : t.focusMode.breakPhase;

  return createPortal(
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background px-4 py-3 text-foreground">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            phase === "focus"
              ? "bg-focus"
              : "bg-rest",
          )}
        />

        <span className="text-xs font-semibold">
          {t.app.name}
        </span>
      </div>

      {/* Current task */}
      <div className="mt-3 min-w-0">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.16em]",
            phase === "focus"
              ? "text-focus"
              : "text-rest",
          )}
        >
          {phaseLabel}
        </p>

        <p className="mt-1 truncate text-[15px] font-medium leading-snug">
          {selectedTask?.title ??
            t.focusMode.noTask}
        </p>
      </div>

      {/* Timer */}
      <div className="flex flex-1 items-center justify-center py-2">
        <span className="font-mono text-5xl font-semibold tracking-[-0.055em] tabular-nums">
          {formatClock(
            remainingSeconds,
          )}
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant={
            status === "running"
              ? "secondary"
              : "default"
          }
          disabled={!selectedTask}
          onClick={
            handlePrimaryAction
          }
        >
          {status === "running" ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}

          {primaryLabel}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={
            onReturnToFocusMode
          }
        >
          <Maximize2 className="size-3.5" />

          {
            t.miniFocus
              .returnToFocus
          }
        </Button>
      </div>
    </div>,
    portalRoot,
  );
}