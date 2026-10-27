"use client";

import {
  CalendarDays,
  CirclePlay,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { useLanguage } from "@/i18n/language-context";

import type { Task } from "@/types/task";

function getLocalDateKey(
  date = new Date(),
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function FocusTaskDialog({
  open,
  onOpenChange,
  tasks,
  onSelectTask,
  onPlanDay,
}: {
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;

  tasks: Task[];

  onSelectTask: (
    taskId: string,
  ) => void;

  onPlanDay: () => void;
}) {
  const { t } =
    useLanguage();

  const todayKey =
    getLocalDateKey();

  const sortedTasks = [
    ...tasks,
  ].sort((a, b) => {
    const aToday =
      a.plannedDate ===
      todayKey;

    const bToday =
      b.plannedDate ===
      todayKey;

    if (
      aToday !==
      bToday
    ) {
      return aToday
        ? -1
        : 1;
    }

    return (
      new Date(
        b.createdAt,
      ).getTime() -
      new Date(
        a.createdAt,
      ).getTime()
    );
  });

  function handlePlanDay() {
    onOpenChange(false);

    onPlanDay();
  }

  function handleSelectTask(
    taskId: string,
  ) {
    onSelectTask(taskId);

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {
              t.home
                .chooseTask
            }
          </DialogTitle>

          <DialogDescription>
            {
              t.pomodoro
                .chooseTask
            }
          </DialogDescription>
        </DialogHeader>

        {sortedTasks.length >
        0 ? (
          <div className="grid max-h-[360px] gap-2 overflow-y-auto py-2 pr-1 scrollbar-thin">
            {sortedTasks.map(
              (task) => {
                const isToday =
                  task.plannedDate ===
                  todayKey;

                return (
                  <button
                    key={
                      task.id
                    }
                    type="button"
                    onClick={() =>
                      handleSelectTask(
                        task.id,
                      )
                    }
                    className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {
                          task.title
                        }
                      </p>

                      {isToday && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-primary">
                          <CalendarDays className="size-3" />

                          {
                            t.task
                              .today
                          }
                        </div>
                      )}
                    </div>

                    <CirclePlay className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </button>
                );
              },
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm font-medium">
              {
                t.pomodoro
                  .noTasks
              }
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {
                t.taskList
                  .empty
                  .active
              }
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={
                handlePlanDay
              }
              className="mt-4"
            >
              <CalendarDays className="size-4" />

              {
                t.home
                  .planDay
              }
            </Button>
          </div>
        )}

        {sortedTasks.length >
          0 && (
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                onOpenChange(
                  false,
                )
              }
            >
              {
                t.dialog
                  .cancel
              }
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}