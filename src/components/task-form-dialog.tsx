"use client";

import { useEffect, useState } from "react";
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
import type { Priority, Task, TaskFormValues } from "@/types/task";
import { PRIORITY_LABEL } from "@/types/task";

const EMPTY_FORM: TaskFormValues = {
  title: "",
  note: "",
  deadline: "",
  priority: "medium",
};

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
  const [values, setValues] = useState<TaskFormValues>(EMPTY_FORM);
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    if (open) {
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
    }
  }, [open, editingTask]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = values.title.trim();
    if (!title) {
      setTitleError(true);
      return;
    }
    onSubmit({ ...values, title });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingTask ? "编辑任务" : "新增任务"}</DialogTitle>
            <DialogDescription>
              {editingTask
                ? "更新任务信息，修改会立即保存到本地。"
                : "填写待办信息，创建后可在任务列表中开始计时。"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="task-title">
                任务标题 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                autoFocus
                placeholder="例如：修复登录页样式错位"
                value={values.title}
                onChange={(e) => {
                  setValues((v) => ({ ...v, title: e.target.value }));
                  if (titleError) setTitleError(false);
                }}
              />
              {titleError && (
                <p className="text-xs text-destructive">请输入任务标题</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="task-note">备注</Label>
              <Textarea
                id="task-note"
                placeholder="补充说明、上下文链接或验收标准（可选）"
                value={values.note}
                onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="task-deadline">截止日期</Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={values.deadline}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, deadline: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="task-priority">优先级</Label>
                <Select
                  value={values.priority}
                  onValueChange={(val: Priority) =>
                    setValues((v) => ({ ...v, priority: val }))
                  }
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{editingTask ? "保存修改" : "创建任务"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
