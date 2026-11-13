"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createFocusSession,
  loadFocusSessions,
} from "@/lib/focus-session-repository";

import {
  settingsStorage,
} from "@/lib/storage";

import {
  DEFAULT_POMODORO_SETTINGS,
  type PomodoroPhase,
  type PomodoroSession,
  type PomodoroSettings,
  type Task,
} from "@/types/task";

type TimerStatus =
  | "idle"
  | "running"
  | "paused";

type TimerEvent = {
  id: number;

  type:
    | "completed"
    | "stopped";

  phase: PomodoroPhase;

  nextPhase: PomodoroPhase;
};

export function usePomodoro(
  tasks: Task[],
) {
  const [
    settings,
    setSettingsState,
  ] =
    useState<PomodoroSettings>(
      DEFAULT_POMODORO_SETTINGS,
    );

  const [
    sessions,
    setSessions,
  ] =
    useState<
      PomodoroSession[]
    >([]);

  const [
    selectedTaskId,
    setSelectedTaskId,
  ] =
    useState<
      string | null
    >(null);

  const [
    phase,
    setPhase,
  ] =
    useState<PomodoroPhase>(
      "focus",
    );

  const [
    status,
    setStatus,
  ] =
    useState<TimerStatus>(
      "idle",
    );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] =
    useState(
      DEFAULT_POMODORO_SETTINGS
        .focusMinutes *
        60,
    );

  const [
    hydrated,
    setHydrated,
  ] =
    useState(false);

  const [
    lastEvent,
    setLastEvent,
  ] =
    useState<TimerEvent | null>(
      null,
    );

  /*
   * Millisecond epoch used while
   * the timer is actively running.
   */
  const deadlineRef =
    useRef<number | null>(
      null,
    );

  const intervalRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  /*
   * ISO timestamp representing
   * when the current Pomodoro
   * session originally started.
   *
   * Pausing does not reset it.
   */
  const phaseStartRef =
    useRef<string | null>(
      null,
    );

  const eventIdRef =
    useRef(0);

  /*
   * Hydrate:
   *
   * Settings remain browser-local
   * for now.
   *
   * Focus sessions now come from
   * Supabase.
   */
  useEffect(() => {
    let cancelled = false;

    const storedSettings =
      settingsStorage.load();

    setSettingsState(
      storedSettings,
    );

    setRemainingSeconds(
      storedSettings
        .focusMinutes *
        60,
    );

    async function hydrateSessions() {
      try {
        const cloudSessions =
          await loadFocusSessions();

        if (
          !cancelled
        ) {
          setSessions(
            cloudSessions,
          );
        }
      } catch (error) {
        console.error(
          "Planora: failed to load focus sessions from Supabase",
          error,
        );
      } finally {
        if (
          !cancelled
        ) {
          setHydrated(
            true,
          );
        }
      }
    }

    void hydrateSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Settings are intentionally
   * still localStorage-backed.
   *
   * They will move to Supabase
   * in the cloud-settings branch.
   */
  useEffect(() => {
    if (
      !hydrated
    ) {
      return;
    }

    settingsStorage.save(
      settings,
    );
  }, [
    settings,
    hydrated,
  ]);

  const phaseDurationSeconds =
    useCallback(
      (
        targetPhase:
          PomodoroPhase,
        targetSettings:
          PomodoroSettings =
          settings,
      ) =>
        (
          targetPhase ===
          "focus"
            ? targetSettings
                .focusMinutes
            : targetSettings
                .breakMinutes
        ) * 60,
      [
        settings,
      ],
    );

  const clearTick =
    useCallback(
      () => {
        if (
          intervalRef.current
        ) {
          clearInterval(
            intervalRef.current,
          );

          intervalRef.current =
            null;
        }
      },
      [],
    );

  const selectedTask =
    useMemo(
      () =>
        tasks.find(
          (
            task,
          ) =>
            task.id ===
            selectedTaskId,
        ) ?? null,
      [
        tasks,
        selectedTaskId,
      ],
    );

  /*
   * Persist a completed or partial
   * session to Supabase.
   *
   * React state is updated using the
   * row returned by PostgreSQL.
   */
  const recordSession =
    useCallback(
      async (
        elapsedSeconds: number,
        completedFully: boolean,
        endPhase: PomodoroPhase,
      ) => {
        if (
          !selectedTaskId ||
          elapsedSeconds < 1
        ) {
          return;
        }

        const task =
          tasks.find(
            (
              item,
            ) =>
              item.id ===
              selectedTaskId,
          );

        const sessionData: Omit<
          PomodoroSession,
          "id"
        > = {
          taskId:
            selectedTaskId,

          taskTitle:
            task?.title ??
            "Deleted task",

          phase:
            endPhase,

          durationSeconds:
            phaseDurationSeconds(
              endPhase,
            ),

          elapsedSeconds,

          completedFully,

          startedAt:
            phaseStartRef
              .current ??
            new Date().toISOString(),

          endedAt:
            new Date().toISOString(),
        };

        try {
          const cloudSession =
            await createFocusSession(
              sessionData,
            );

          setSessions(
            (
              previous,
            ) => [
              cloudSession,
              ...previous,
            ],
          );
        } catch (error) {
          console.error(
            "Planora: failed to save focus session to Supabase",
            error,
          );
        }
      },
      [
        selectedTaskId,
        tasks,
        phaseDurationSeconds,
      ],
    );

  const tick =
    useCallback(
      () => {
        if (
          !deadlineRef.current
        ) {
          return;
        }

        const remaining =
          Math.round(
            (
              deadlineRef.current -
              Date.now()
            ) /
              1000,
          );

        if (
          remaining <= 0
        ) {
          clearTick();

          const finishedPhase =
            phase;

          const duration =
            phaseDurationSeconds(
              finishedPhase,
            );

          /*
           * Persist asynchronously.
           *
           * The timer itself does not
           * need to wait for the network
           * request before transitioning.
           */
          void recordSession(
            duration,
            true,
            finishedPhase,
          );

          const nextPhase:
            PomodoroPhase =
            finishedPhase ===
            "focus"
              ? "break"
              : "focus";

          setPhase(
            nextPhase,
          );

          setRemainingSeconds(
            phaseDurationSeconds(
              nextPhase,
            ),
          );

          setStatus(
            "idle",
          );

          deadlineRef.current =
            null;

          phaseStartRef.current =
            null;

          eventIdRef.current +=
            1;

          setLastEvent({
            id:
              eventIdRef.current,

            type:
              "completed",

            phase:
              finishedPhase,

            nextPhase,
          });
        } else {
          setRemainingSeconds(
            remaining,
          );
        }
      },
      [
        clearTick,
        phase,
        phaseDurationSeconds,
        recordSession,
      ],
    );

  useEffect(() => {
    if (
      status ===
      "running"
    ) {
      intervalRef.current =
        setInterval(
          tick,
          250,
        );
    } else {
      clearTick();
    }

    return clearTick;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    status,
  ]);

  const start =
    useCallback(
      () => {
        if (
          !selectedTaskId ||
          status ===
            "running"
        ) {
          return;
        }

        if (
          !phaseStartRef.current
        ) {
          phaseStartRef.current =
            new Date().toISOString();
        }

        deadlineRef.current =
          Date.now() +
          remainingSeconds *
            1000;

        setStatus(
          "running",
        );
      },
      [
        selectedTaskId,
        status,
        remainingSeconds,
      ],
    );

  const pause =
    useCallback(
      () => {
        if (
          status !==
          "running"
        ) {
          return;
        }

        if (
          deadlineRef.current
        ) {
          const remaining =
            Math.max(
              0,
              Math.round(
                (
                  deadlineRef.current -
                  Date.now()
                ) /
                  1000,
              ),
            );

          setRemainingSeconds(
            remaining,
          );
        }

        deadlineRef.current =
          null;

        setStatus(
          "paused",
        );
      },
      [
        status,
      ],
    );

  /*
   * Stop the current run before
   * it reaches zero and persist
   * the partial session.
   */
  const stopEarly =
    useCallback(
      () => {
        if (
          status ===
          "idle"
        ) {
          return;
        }

        let remaining =
          remainingSeconds;

        if (
          status ===
            "running" &&
          deadlineRef.current
        ) {
          remaining =
            Math.max(
              0,
              Math.round(
                (
                  deadlineRef.current -
                  Date.now()
                ) /
                  1000,
              ),
            );
        }

        const duration =
          phaseDurationSeconds(
            phase,
          );

        const elapsed =
          duration -
          remaining;

        void recordSession(
          elapsed,
          false,
          phase,
        );

        clearTick();

        deadlineRef.current =
          null;

        phaseStartRef.current =
          null;

        setStatus(
          "idle",
        );

        setRemainingSeconds(
          duration,
        );

        eventIdRef.current +=
          1;

        setLastEvent({
          id:
            eventIdRef.current,

          type:
            "stopped",

          phase,

          nextPhase:
            phase,
        });
      },
      [
        status,
        remainingSeconds,
        phase,
        phaseDurationSeconds,
        recordSession,
        clearTick,
      ],
    );

  /*
   * Switch Focus / Break manually.
   *
   * No session is recorded when
   * switching while idle.
   */
  const switchPhase =
    useCallback(
      (
        next:
          PomodoroPhase,
      ) => {
        if (
          status !==
          "idle"
        ) {
          return;
        }

        setPhase(
          next,
        );

        setRemainingSeconds(
          phaseDurationSeconds(
            next,
          ),
        );
      },
      [
        status,
        phaseDurationSeconds,
      ],
    );

  const selectTask =
    useCallback(
      (
        taskId:
          string | null,
      ) => {
        if (
          status ===
          "running"
        ) {
          return;
        }

        setSelectedTaskId(
          taskId,
        );
      },
      [
        status,
      ],
    );

  const updateSettings =
    useCallback(
      (
        next:
          PomodoroSettings,
      ) => {
        setSettingsState(
          next,
        );

        if (
          status ===
          "idle"
        ) {
          setRemainingSeconds(
            phaseDurationSeconds(
              phase,
              next,
            ),
          );
        }
      },
      [
        status,
        phase,
        phaseDurationSeconds,
      ],
    );

  const totalSecondsForTask =
    useCallback(
      (
        taskId:
          string,
      ) =>
        sessions
          .filter(
            (
              session,
            ) =>
              session.taskId ===
                taskId &&
              session.phase ===
                "focus",
          )
          .reduce(
            (
              sum,
              session,
            ) =>
              sum +
              session.elapsedSeconds,
            0,
          ),
      [
        sessions,
      ],
    );

  const todaySessions =
    useMemo(
      () => {
        const today =
          new Date().toDateString();

        return sessions.filter(
          (
            session,
          ) =>
            new Date(
              session.startedAt,
            ).toDateString() ===
            today,
        );
      },
      [
        sessions,
      ],
    );

  return {
    hydrated,

    settings,

    updateSettings,

    sessions,

    todaySessions,

    lastEvent,

    selectedTaskId,

    selectedTask,

    selectTask,

    phase,

    switchPhase,

    status,

    remainingSeconds,

    phaseDurationSeconds:
      phaseDurationSeconds(
        phase,
      ),

    start,

    pause,

    stopEarly,

    totalSecondsForTask,
  };
}