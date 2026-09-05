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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLanguage } from "@/i18n/language-context";

import type {
  Priority,
  Task,
  TaskFormValues,
} from "@/types/task";

const EMPTY_FORM: TaskFormValues = {
  title: "",
  note: "",
  deadline: "",
  priority: "medium",
};

const PRIORITIES: Priority[] = [
  "high",
  "medium",
  "low",
];

export function TaskFormDialog({
  open,
  onOpenChange,
  editingTask,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: Task | null;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const { t } = useLanguage();

  const [values, setValues] =
    useState<TaskFormValues>(EMPTY_FORM);

  const [titleError, setTitleError] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    setValues(
      editingTask
        ? {
            title: editingTask.title,
            note: editingTask.note,
            deadline: editingTask.deadline,
            priority: editingTask.priority,
          }
        : EMPTY_FORM
    );

    setTitleError(false);
  }, [open, editingTask]);

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const title = values.title.trim();

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

  const priorityLabels: Record<
    Priority,
    string
  > = {
    high: t.task.priority.high,
    medium: t.task.priority.medium,
    low: t.task.priority.low,
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingTask
                ? t.dialog.editTask
                : t.dialog.newTask}
            </DialogTitle>

            <DialogDescription>
              {editingTask
                ? t.dialog.editDescription
                : t.dialog.createDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="task-title">
                {t.dialog.title}{" "}
                <span className="text-destructive">
                  *
                </span>
              </Label>

              <Input
                id="task-title"
                autoFocus
                placeholder={
                  t.dialog.titlePlaceholder
                }
                value={values.title}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }));

                  if (titleError) {
                    setTitleError(false);
                  }
                }}
              />

              {titleError && (
                <p className="text-xs text-destructive">
                  {t.dialog.titleRequired}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="task-note">
                {t.dialog.note}
              </Label>

              <Textarea
                id="task-note"
                placeholder={
                  t.dialog.notePlaceholder
                }
                value={values.note}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    note:
                      event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="task-deadline">
                  {t.dialog.deadline}
                </Label>

                <Input
                  id="task-deadline"
                  type="date"
                  value={values.deadline}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      deadline:
                        event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="task-priority">
                  {t.dialog.priority}
                </Label>

                <Select
                  value={values.priority}
                  onValueChange={(
                    priority: Priority
                  ) =>
                    setValues((current) => ({
                      ...current,
                      priority,
                    }))
                  }
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {PRIORITIES.map(
                      (priority) => (
                        <SelectItem
                          key={priority}
                          value={priority}
                        >
                          {
                            priorityLabels[
                              priority
                            ]
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
            >
              {t.dialog.cancel}
            </Button>

            <Button type="submit">
              {editingTask
                ? t.dialog.save
                : t.dialog.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}