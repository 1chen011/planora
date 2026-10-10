"use client";

import {
  useEffect,
} from "react";

import {
  Coffee,
  Flame,
  Minimize2,
  Pause,
  PictureInPicture2,
  Play,
  Square,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useLanguage } from "@/i18n/language-context";

import { cn } from "@/lib/utils";

import type { usePomodoro } from "@/hooks/use-pomodoro";

function formatClock(
  totalSeconds: number,
) {
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

export function FocusMode({
  pomodoro,
  onExit,
  onEnterMiniFocus,
  miniFocusSupported,
}: {
  pomodoro: ReturnType<
    typeof usePomodoro
  >;

  onExit: () => void;

  onEnterMiniFocus:
    () => void;

  miniFocusSupported: boolean;
}) {
  const { t } =
    useLanguage();

  const {
    selectedTask,
    phase,
    status,
    remainingSeconds,
    start,
    pause,
    stopEarly,
  } = pomodoro;

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onExit();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onExit]);

  function handleStart() {
    if (!selectedTask) {
      toast.warning(
        t.pomodoro
          .chooseTaskWarning,
      );

      return;
    }

    start();
  }

  function handleStop() {
    if (
      status === "idle"
    ) {
      return;
    }

    stopEarly();

    toast.info(
      t.pomodoro
        .stoppedMessage,
    );
  }

  const phaseLabel =
    phase === "focus"
      ? t.focusMode.focusPhase
      : t.focusMode.breakPhase;

  const statusLabel =
    status === "running"
      ? phase === "focus"
        ? t.pomodoro
            .runningFocus
        : t.pomodoro
            .runningBreak
      : status === "paused"
        ? t.pomodoro.paused
        : t.pomodoro.ready;

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      {/* Reserved visual layer for future wallpaper */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[42%] size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-5 md:px-8 md:py-6">
        <div>
          <p className="text-sm font-semibold">
            {t.app.name}
          </p>

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t.focusMode.title}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={
              onEnterMiniFocus
            }
            disabled={
              !miniFocusSupported
            }
            title={
              miniFocusSupported
                ? t.miniFocus.enter
                : t.miniFocus
                    .unsupported
            }
          >
            <PictureInPicture2 className="size-4" />

            {
              t.miniFocus.enter
            }
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            title={
              t.focusMode.exit
            }
          >
            <Minimize2 className="size-4" />

            {
              t.focusMode.exit
            }
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="relative flex flex-1 items-center justify-center px-6 pb-16 pt-4">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
              phase === "focus"
                ? "border-focus/25 bg-focus/10 text-focus"
                : "border-rest/25 bg-rest/10 text-rest",
            )}
          >
            {phase ===
            "focus" ? (
              <Flame className="size-3.5" />
            ) : (
              <Coffee className="size-3.5" />
            )}

            {phaseLabel}
          </div>

          <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/55">
            {
              t.focusMode
                .currentTask
            }
          </p>

          <h1 className="mt-2 max-w-2xl text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            {selectedTask?.title ??
              t.focusMode.noTask}
          </h1>

          <div className="mt-10 font-mono text-7xl font-semibold tracking-[-0.06em] tabular-nums sm:text-8xl md:text-9xl">
            {formatClock(
              remainingSeconds,
            )}
          </div>

          {status !== "running" && (
            <p
              className={cn(
                "mt-4 text-sm font-medium",
                phase === "focus"
                  ? "text-focus"
                  : "text-rest",
              )}
            >
              {statusLabel}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {status ===
            "running" ? (
              <Button
                size="lg"
                variant="secondary"
                onClick={pause}
              >
                <Pause className="size-4" />

                {
                  t.pomodoro
                    .pause
                }
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={
                  handleStart
                }
                disabled={
                  !selectedTask
                }
              >
                <Play className="size-4" />

                {status ===
                "paused"
                  ? t.pomodoro
                      .resume
                  : t.pomodoro
                      .start}
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              onClick={
                handleStop
              }
              disabled={
                status === "idle"
              }
            >
              <Square className="size-4" />

              {
                t.focusMode
                  .stopSession
              }
            </Button>
          </div>

          <p className="mt-8 max-w-lg text-xs leading-relaxed text-muted-foreground/60">
            {
              t.focusMode
                .exitHint
            }
          </p>
        </div>
      </main>
    </div>
  );
}