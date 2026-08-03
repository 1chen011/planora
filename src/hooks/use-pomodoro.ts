"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { genId, sessionStorage_, settingsStorage } from "@/lib/storage";
import {
  DEFAULT_POMODORO_SETTINGS,
  type PomodoroPhase,
  type PomodoroSession,
  type PomodoroSettings,
  type Task,
} from "@/types/task";

type TimerStatus = "idle" | "running" | "paused";

export function usePomodoro(tasks: Task[]) {
  const [settings, setSettingsState] = useState<PomodoroSettings>(
    DEFAULT_POMODORO_SETTINGS
  );
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(
    DEFAULT_POMODORO_SETTINGS.focusMinutes * 60
  );
  const [hydrated, setHydrated] = useState(false);

  const deadlineRef = useRef<number | null>(null); // ms epoch, set while running
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseStartRef = useRef<string | null>(null); // ISO, when current run segment started

  type TimerEvent = {
    id: number;
    type: "completed" | "stopped";
    phase: PomodoroPhase;
    nextPhase: PomodoroPhase;
  };
  const [lastEvent, setLastEvent] = useState<TimerEvent | null>(null);
  const eventIdRef = useRef(0);

  // hydrate
  useEffect(() => {
    const s = settingsStorage.load();
    setSettingsState(s);
    setSessions(sessionStorage_.load());
    setRemainingSeconds(s.focusMinutes * 60);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    settingsStorage.save(settings);
  }, [settings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage_.save(sessions);
  }, [sessions, hydrated]);

  const phaseDurationSeconds = useCallback(
    (p: PomodoroPhase, s: PomodoroSettings = settings) =>
      (p === "focus" ? s.focusMinutes : s.breakMinutes) * 60,
    [settings]
  );

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const recordSession = useCallback(
    (elapsedSeconds: number, completedFully: boolean, endPhase: PomodoroPhase) => {
      if (!selectedTaskId || elapsedSeconds < 1) return;
      const task = tasks.find((t) => t.id === selectedTaskId);
      const session: PomodoroSession = {
        id: genId("session"),
        taskId: selectedTaskId,
        taskTitle: task?.title ?? "已删除的任务",
        phase: endPhase,
        durationSeconds: phaseDurationSeconds(endPhase),
        elapsedSeconds,
        completedFully,
        startedAt: phaseStartRef.current ?? new Date().toISOString(),
        endedAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev]);
    },
    [selectedTaskId, tasks, phaseDurationSeconds]
  );

  const tick = useCallback(() => {
    if (!deadlineRef.current) return;
    const remaining = Math.round((deadlineRef.current - Date.now()) / 1000);
    if (remaining <= 0) {
      clearTick();
      const finishedPhase = phase;
      const duration = phaseDurationSeconds(finishedPhase);
      recordSession(duration, true, finishedPhase);
      const nextPhase: PomodoroPhase = finishedPhase === "focus" ? "break" : "focus";
      setPhase(nextPhase);
      setRemainingSeconds(phaseDurationSeconds(nextPhase));
      setStatus("idle");
      deadlineRef.current = null;
      phaseStartRef.current = null;
      eventIdRef.current += 1;
      setLastEvent({
        id: eventIdRef.current,
        type: "completed",
        phase: finishedPhase,
        nextPhase,
      });
    } else {
      setRemainingSeconds(remaining);
    }
  }, [clearTick, phase, phaseDurationSeconds, recordSession]);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(tick, 250);
    } else {
      clearTick();
    }
    return clearTick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const start = useCallback(() => {
    if (!selectedTaskId || status === "running") return;
    if (!phaseStartRef.current) {
      phaseStartRef.current = new Date().toISOString();
    }
    deadlineRef.current = Date.now() + remainingSeconds * 1000;
    setStatus("running");
  }, [selectedTaskId, status, remainingSeconds]);

  const pause = useCallback(() => {
    if (status !== "running") return;
    if (deadlineRef.current) {
      const remaining = Math.max(
        0,
        Math.round((deadlineRef.current - Date.now()) / 1000)
      );
      setRemainingSeconds(remaining);
    }
    deadlineRef.current = null;
    setStatus("paused");
  }, [status]);

  /** Stop the current run early (before it reaches 0:00), logging the partial time. */
  const stopEarly = useCallback(() => {
    if (status === "idle") return;
    let remaining = remainingSeconds;
    if (status === "running" && deadlineRef.current) {
      remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
    }
    const duration = phaseDurationSeconds(phase);
    const elapsed = duration - remaining;
    recordSession(elapsed, false, phase);
    clearTick();
    deadlineRef.current = null;
    phaseStartRef.current = null;
    setStatus("idle");
    setRemainingSeconds(duration);
    eventIdRef.current += 1;
    setLastEvent({ id: eventIdRef.current, type: "stopped", phase, nextPhase: phase });
  }, [status, remainingSeconds, phase, phaseDurationSeconds, recordSession, clearTick]);

  /** Manually switch phase without logging (only allowed while idle). */
  const switchPhase = useCallback(
    (next: PomodoroPhase) => {
      if (status !== "idle") return;
      setPhase(next);
      setRemainingSeconds(phaseDurationSeconds(next));
    },
    [status, phaseDurationSeconds]
  );

  const selectTask = useCallback(
    (taskId: string | null) => {
      if (status === "running") return; // avoid switching mid-run
      setSelectedTaskId(taskId);
    },
    [status]
  );

  const updateSettings = useCallback(
    (next: PomodoroSettings) => {
      setSettingsState(next);
      if (status === "idle") {
        setRemainingSeconds(phaseDurationSeconds(phase, next));
      }
    },
    [status, phase, phaseDurationSeconds]
  );

  const totalSecondsForTask = useCallback(
    (taskId: string) =>
      sessions
        .filter((s) => s.taskId === taskId && s.phase === "focus")
        .reduce((sum, s) => sum + s.elapsedSeconds, 0),
    [sessions]
  );

  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();
    return sessions.filter((s) => new Date(s.startedAt).toDateString() === today);
  }, [sessions]);

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
    phaseDurationSeconds: phaseDurationSeconds(phase),
    start,
    pause,
    stopEarly,
    totalSecondsForTask,
  };
}
