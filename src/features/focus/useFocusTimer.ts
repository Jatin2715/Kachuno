import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerState, FocusSession } from '../../types/focus';
import { focusSessionService } from './focusSessionService';

export interface UseFocusTimerReturn {
  timerState: TimerState;
  elapsedSeconds: number;
  formattedTime: string;
  selectedTaskId: string | null;
  errorMessage: string | null;
  lastSavedSession: FocusSession | null;
  setSelectedTaskId: (taskId: string | null) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  complete: () => Promise<void>;
  reset: () => void;
  retrySave: () => Promise<void>;
  discardError: () => void;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatTimerDisplay(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function useFocusTimer(): UseFocusTimerReturn {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedSession, setLastSavedSession] = useState<FocusSession | null>(null);

  // High precision timestamp references
  const sessionStartedAtRef = useRef<string | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const currentSegmentStartRef = useRef<number | null>(null);

  // Tick state to force UI re-render while running
  const [, setTick] = useState<number>(0);

  // Calculate true wall-clock elapsed milliseconds
  const getElapsedMs = useCallback((): number => {
    let ms = accumulatedMsRef.current;
    if (timerState === 'running' && currentSegmentStartRef.current !== null) {
      ms += Date.now() - currentSegmentStartRef.current;
    }
    return Math.max(0, ms);
  }, [timerState]);

  const elapsedSeconds = Math.floor(getElapsedMs() / 1000);

  // Background-resilient tick timer
  useEffect(() => {
    if (timerState !== 'running') return;

    const intervalId = setInterval(() => {
      setTick(Date.now());
    }, 250);

    return () => clearInterval(intervalId);
  }, [timerState]);

  // Start timer
  const start = useCallback(() => {
    if (timerState !== 'idle') return;
    const now = Date.now();
    sessionStartedAtRef.current = new Date(now).toISOString();
    accumulatedMsRef.current = 0;
    currentSegmentStartRef.current = now;
    setErrorMessage(null);
    setTimerState('running');
  }, [timerState]);

  // Pause timer
  const pause = useCallback(() => {
    if (timerState !== 'running') return;
    if (currentSegmentStartRef.current !== null) {
      accumulatedMsRef.current += Date.now() - currentSegmentStartRef.current;
      currentSegmentStartRef.current = null;
    }
    setTimerState('paused');
  }, [timerState]);

  // Resume timer
  const resume = useCallback(() => {
    if (timerState !== 'paused') return;
    currentSegmentStartRef.current = Date.now();
    setTimerState('running');
  }, [timerState]);

  // Save session internally
  const saveCurrentSession = useCallback(async () => {
    // Commit current running segment if any
    if (currentSegmentStartRef.current !== null) {
      accumulatedMsRef.current += Date.now() - currentSegmentStartRef.current;
      currentSegmentStartRef.current = null;
    }

    const durationSeconds = Math.floor(accumulatedMsRef.current / 1000);
    if (durationSeconds < 1) {
      setErrorMessage('Focus sessions shorter than 1 second cannot be saved.');
      setTimerState('error');
      return;
    }

    const startedAt = sessionStartedAtRef.current || new Date().toISOString();
    const endedAt = new Date().toISOString();

    setTimerState('saving');
    setErrorMessage(null);

    try {
      const saved = await focusSessionService.saveFocusSession({
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        task_id: selectedTaskId,
        status: 'completed',
      });

      setLastSavedSession(saved);
      // Reset state on successful save
      accumulatedMsRef.current = 0;
      sessionStartedAtRef.current = null;
      currentSegmentStartRef.current = null;
      setTimerState('idle');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save focus session';
      setErrorMessage(message);
      setTimerState('error');
    }
  }, [selectedTaskId]);

  const isCompletingRef = useRef(false);

  // Complete session (available from running or paused)
  const complete = useCallback(async () => {
    if (timerState !== 'running' && timerState !== 'paused') return;
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    try {
      await saveCurrentSession();
    } finally {
      isCompletingRef.current = false;
    }
  }, [timerState, saveCurrentSession]);

  // Retry save when in error state
  const retrySave = useCallback(async () => {
    if (timerState !== 'error') return;
    await saveCurrentSession();
  }, [timerState, saveCurrentSession]);

  // Reset session to idle
  const reset = useCallback(() => {
    if (timerState === 'saving') return;
    currentSegmentStartRef.current = null;
    accumulatedMsRef.current = 0;
    sessionStartedAtRef.current = null;
    setErrorMessage(null);
    setTimerState('idle');
  }, [timerState]);

  // Discard error and reset
  const discardError = useCallback(() => {
    reset();
  }, [reset]);

  return {
    timerState,
    elapsedSeconds,
    formattedTime: formatTimerDisplay(elapsedSeconds),
    selectedTaskId,
    errorMessage,
    lastSavedSession,
    setSelectedTaskId,
    start,
    pause,
    resume,
    complete,
    reset,
    retrySave,
    discardError,
  };
}
