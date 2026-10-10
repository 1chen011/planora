"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useLanguage } from "@/i18n/language-context";

import type {
  Task,
  TaskFormValues,
} from "@/types/task";

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

function createDefaultForm(): TaskFormValues {
  return {
    title: "",
    note: "",
    deadline:
      getLocalDateKey(),
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  editingTask,
  onSubmit,
}: {
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;

  editingTask:
    | Task
    | null;

  onSubmit: (
    values: TaskFormValues,
  ) => void;
}) {
  const { t } =
    useLanguage();

  const [
    values,
    setValues,
  ] =
    useState<TaskFormValues>(
      createDefaultForm,
    );

  const [
    titleError,
    setTitleError,
  ] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(
      editingTask
        ? {
            title:
              editingTask.title,

            note:
              editingTask.note,

            deadline:
              editingTask.deadline,
          }
        : createDefaultForm(),
    );

    setTitleError(false);
  }, [
    open,
    editingTask,
  ]);

  function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    const title =
      values.title.trim();

    if (!title) {
      setTitleError(true);

      return;
    }

    onSubmit({
      ...values,
      title,
    });

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent>
        <form
          onSubmit={
            handleSubmit
          }
        >
          {/* Header */}
          <DialogHeader>
            <DialogTitle>
              {editingTask
                ? t.dialog
                    .editTask
                : t.dialog
                    .newTask}
            </DialogTitle>

            <DialogDescription>
              {editingTask
                ? t.dialog
                    .editDescription
                : t.dialog
                    .createDescription}
            </DialogDescription>
          </DialogHeader>

          {/* Main fields */}
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-1.5">
              <Label htmlFor="task-title">
                {
                  t.dialog
                    .title
                }{" "}

                <span className="text-destructive">
                  *
                </span>
              </Label>

              <Input
                id="task-title"
                autoFocus
                placeholder={
                  t.dialog
                    .titlePlaceholder
                }
                value={
                  values.title
                }
                onChange={(
                  event,
                ) => {
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,

                      title:
                        event
                          .target
                          .value,
                    }),
                  );

                  if (
                    titleError
                  ) {
                    setTitleError(
                      false,
                    );
                  }
                }}
              />

              {titleError && (
                <p className="text-xs text-destructive">
                  {
                    t.dialog
                      .titleRequired
                  }
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-1.5">
              <Label htmlFor="task-note">
                {
                  t.dialog
                    .note
                }
              </Label>

              <Textarea
                id="task-note"
                placeholder={
                  t.dialog
                    .notePlaceholder
                }
                value={
                  values.note
                }
                onChange={(
                  event,
                ) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,

                      note:
                        event
                          .target
                          .value,
                    }),
                  )
                }
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-row items-end justify-between sm:justify-between">
            {/* Due date */}
            <div className="grid gap-1">
              <Label
                htmlFor="task-deadline"
                className="text-[11px] text-muted-foreground"
              >
                {
                  t.dialog
                    .deadline
                }
              </Label>

              <Input
                id="task-deadline"
                type="date"
                value={
                  values.deadline
                }
                onChange={(
                  event,
                ) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,

                      deadline:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                className="h-9 w-[156px] px-3 py-0 text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex h-9 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  onOpenChange(
                    false,
                  )
                }
                className="h-9 px-4 py-0"
              >
                {
                  t.dialog
                    .cancel
                }
              </Button>

              <Button
                type="submit"
                className="h-9 px-4 py-0 shadow-none"
              >
                {editingTask
                  ? t.dialog.save
                  : t.dialog
                      .create}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}