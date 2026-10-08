"use client";

import { CheckCircle2, Clock3, Flame } from "lucide-react";

import { useLanguage } from "@/i18n/language-context";

export type TodayProgressSummary = {
  focusMinutes: number;
  focusSessions: number;
  completedTasks: number;
};

export function TodayProgress({
  focusMinutes,
  focusSessions,
  completedTasks,
}: TodayProgressSummary) {
  const { t } = useLanguage();

  const hasProgress =
    focusMinutes > 0 || focusSessions > 0 || completedTasks > 0;

  const items = [
    {
      label: t.progress.focused,
      value: `${focusMinutes} ${t.sidebar.minutesShort}`,
      icon: Flame,
    },
    {
      label: t.progress.sessions,
      value: focusSessions.toString(),
      icon: Clock3,
    },
    {
      label: t.progress.completed,
      value: completedTasks.toString(),
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="mb-4 border-b border-border pb-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-medium text-muted-foreground">
          {t.progress.title}
        </h2>

        {!hasProgress && (
          <p className="max-w-sm text-right text-[11px] text-muted-foreground/70">
            {t.progress.noProgress}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-card/30">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary/50 text-muted-foreground">
              <Icon className="size-3.5" />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold tabular-nums">
                {value}
              </p>

              <p className="truncate text-[11px] text-muted-foreground">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
