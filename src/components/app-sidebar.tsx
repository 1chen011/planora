"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Home,
  Languages,
  ListTodo,
  LogOut,
  Moon,
  Sun,
  TimerIcon,
  UserRound,
} from "lucide-react";

import { useTheme } from "next-themes";

import { DataControls } from "@/components/data-controls";

import { useLanguage } from "@/i18n/language-context";

import {
  createClient,
} from "@/lib/supabase/client";

import { cn } from "@/lib/utils";

import type { Language } from "@/i18n/translation";
import type {
  AppView,
  TaskFilter,
} from "@/types/task";

const TASK_NAV_ITEMS: {
  key: Exclude<TaskFilter, "today">;
  icon: React.ElementType;
}[] = [
  {
    key: "all",
    icon: ListTodo,
  },
  {
    key: "active",
    icon: CircleDashed,
  },
  {
    key: "completed",
    icon: CheckCircle2,
  },
];

export function AppSidebar({
  view,
  onViewChange,
  counts,
  todayFocusMinutes,
}: {
  view: AppView;

  onViewChange: (
    view: AppView,
  ) => void;

  counts: Record<
    TaskFilter,
    number
  >;

  todayFocusMinutes: number;
}) {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const {
    theme,
    setTheme,
  } = useTheme();

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    userEmail,
    setUserEmail,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);

    let active = true;

    async function loadCurrentUser() {
      const supabase =
        createClient();

      const {
        data: {
          user,
        },
        error,
      } =
        await supabase.auth.getUser();

      if (error) {
        console.error(
          "Planora: failed to load current user",
          error,
        );

        return;
      }

      if (active) {
        setUserEmail(
          user?.email ?? null,
        );
      }
    }

    void loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const taskLabels: Record<
    Exclude<TaskFilter, "today">,
    string
  > = {
    all:
      t.sidebar.allTasks,

    active:
      t.sidebar.active,

    completed:
      t.sidebar.completed,
  };

  function handleLanguageChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setLanguage(
      event.target
        .value as Language,
    );
  }

  function handleThemeChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setTheme(
      event.target.value,
    );
  }

  const homeActive =
    view === "home";

  const todayActive =
    view === "today";

  const currentTheme =
    mounted
      ? (theme ?? "dark")
      : "dark";

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-card/40 px-3 py-4">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <TimerIcon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {t.app.name}
          </p>

          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {t.app.subtitle}
          </p>
        </div>
      </div>

      {/* Workspace */}
      <nav className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() =>
            onViewChange(
              "home",
            )
          }
          className={cn(
            "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
            homeActive
              ? "bg-primary/15 font-medium text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2">
            <Home className="size-4" />

            {t.sidebar.home}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            onViewChange(
              "today",
            )
          }
          className={cn(
            "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
            todayActive
              ? "bg-primary/15 font-medium text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />

            {t.sidebar.today}
          </span>

          <span
            className={cn(
              "rounded-full px-1.5 text-xs tabular-nums",
              todayActive
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            {counts.today}
          </span>
        </button>
      </nav>

      {/* Task repository */}
      <div className="mt-5">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
          {
            t.sidebar
              .tasksSection
          }
        </p>

        <nav className="flex flex-col gap-1">
          {TASK_NAV_ITEMS.map(
            ({
              key,
              icon: Icon,
            }) => {
              const active =
                view === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    onViewChange(
                      key,
                    )
                  }
                  className={cn(
                    "flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" />

                    {
                      taskLabels[
                        key
                      ]
                    }
                  </span>

                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      active
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {
                      counts[
                        key
                      ]
                    }
                  </span>
                </button>
              );
            },
          )}
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-5">
        {/* Today's Focus */}
        <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              {
                t.sidebar
                  .todayFocus
              }
            </p>

            <p className="font-mono text-sm font-semibold tabular-nums">
              {
                todayFocusMinutes
              }

              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                {
                  t.sidebar
                    .minutesShort
                }
              </span>
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="mt-3 border-t border-border/70 pt-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
            {
              t.sidebar
                .settingsSection
            }
          </p>

          <div className="space-y-1">
            {/* Appearance */}
            <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1">
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                {currentTheme ===
                "light" ? (
                  <Sun className="size-3.5 shrink-0" />
                ) : (
                  <Moon className="size-3.5 shrink-0" />
                )}

                <span>
                  {
                    t.sidebar
                      .appearance
                  }
                </span>
              </div>

              <select
                value={
                  currentTheme
                }
                onChange={
                  handleThemeChange
                }
                disabled={
                  !mounted
                }
                className="h-8 w-[96px] rounded-md border border-border/70 bg-background/60 px-2.5 text-[11px] text-foreground outline-none transition-colors hover:bg-accent/50 focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="dark">
                  {
                    t.sidebar
                      .dark
                  }
                </option>

                <option value="light">
                  {
                    t.sidebar
                      .light
                  }
                </option>
              </select>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1">
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <Languages className="size-3.5 shrink-0" />

                <span>
                  {
                    t.sidebar
                      .language
                  }
                </span>
              </div>

              <select
                value={
                  language
                }
                onChange={
                  handleLanguageChange
                }
                className="h-8 w-[96px] rounded-md border border-border/70 bg-background/60 px-2.5 text-[11px] text-foreground outline-none transition-colors hover:bg-accent/50 focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="en">
                  {
                    t.sidebar
                      .english
                  }
                </option>

                <option value="zh">
                  {
                    t.sidebar
                      .chinese
                  }
                </option>
              </select>
            </div>

            {/* Data & Backup */}
            <DataControls />
          </div>
        </div>

        {/* Account */}
        <div className="mt-3 border-t border-border/70 pt-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
            {
              t.sidebar
                .account
            }
          </p>

          <div className="rounded-lg border border-border bg-background/60 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {userEmail ??
                    t.sidebar
                      .signedIn}
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {
                    t.sidebar
                      .signedIn
                  }
                </p>
              </div>
            </div>

            <form
              action="/auth/signout"
              method="post"
              className="mt-2"
            >
              <button
                type="submit"
                className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-3.5" />

                {
                  t.sidebar
                    .logOut
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}