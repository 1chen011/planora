import { cn } from "@/lib/utils";
import { PRIORITY_LABEL, type Priority } from "@/types/task";

const DOT_COLOR: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
};

const TEXT_COLOR: Record<Priority, string> = {
  high: "text-priority-high",
  medium: "text-priority-medium",
  low: "text-priority-low",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        TEXT_COLOR[priority],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_COLOR[priority])} />
      {PRIORITY_LABEL[priority]}优先级
    </span>
  );
}
