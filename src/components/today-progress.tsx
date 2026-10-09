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
  const { language, t } = useLanguage();

  const hasProgress =
    focusMinutes > 0 || focusSessions > 0 || completedTasks > 0;

  const focusSessionLabel =
    language === "en"
      ? focusSessions === 1
        ? t.progress.session
        : t.progress.sessions
      : t.progress.sessions;

  const items = [
    {
      label: t.progress.focused,
      value: `${focusMinutes} ${t.sidebar.minutesShort}`,
      icon: Flame,
    },
    {
      label: focusSessionLabel,
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
    <section className="mb-5 border-b border-border pb-5">
      <div className="mb-2 flex min-h-4 items-center justify-between">
        <h2 className="text-xs font-medium text-muted-foreground">
          {t.progress.title}
        </h2>

        {!hasProgress && (
          <p className="max-w-sm text-right text-[11px] text-muted-foreground/60">
            {t.progress.noProgress}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-card/30">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 px-3 py-3"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary/50 text-muted-foreground">
              <Icon className="size-3.5" />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[15px] font-semibold leading-none tabular-nums">
                {value}
              </p>

              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
