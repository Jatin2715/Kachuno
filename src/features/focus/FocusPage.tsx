import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  History,
  Check,
  RotateCw,
  X,
  Target,
} from 'lucide-react';
import type { FocusSession } from '../../types/focus';
import { useFocusTimer, formatTimerDisplay } from './useFocusTimer';
import { focusSessionService } from './focusSessionService';
import { useTasks } from '../tasks/useTasks';

export const FocusPage: FC = () => {
  const {
    timerState,
    elapsedSeconds,
    formattedTime,
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
  } = useFocusTimer();

  const { tasks } = useTasks();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load session history
  const loadSessions = useCallback(async () => {
    try {
      const data = await focusSessionService.getFocusSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load focus history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    const unsubscribe = focusSessionService.subscribe(() => {
      loadSessions();
    });
    return () => unsubscribe();
  }, [loadSessions]);

  // Handle reset with confirmation
  const handleResetClick = () => {
    if (elapsedSeconds > 0) {
      setShowResetConfirm(true);
    } else {
      reset();
    }
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    reset();
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  // Find linked task title
  const getTaskTitle = (taskId: string | null) => {
    if (!taskId) return 'General Focus (Unlinked)';
    const found = tasks.find((t) => t.id === taskId);
    return found ? found.title : 'Task';
  };

  return (
    <div className="page-container focus-container">
      {/* Hero Header */}
      <section className="hero-card" aria-labelledby="focus-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <Clock size={20} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deep Work Engine
          </span>
        </div>
        <h1 id="focus-heading" className="hero-title">
          Focus Session
        </h1>
        <p className="hero-subtitle">
          Deliberate single-task execution inspired by the turtle’s steady pace. Minimize context switching and build enduring attention.
        </p>
      </section>

      {/* Main Timer Display Card */}
      <div className="timer-hero-card" role="region" aria-label="Focus Timer">
        {/* Status Badge */}
        <div className={`timer-status-badge ${timerState}`} aria-live="polite">
          <span className="status-pulse-dot" />
          <span>
            {timerState === 'idle' && 'Ready to Focus'}
            {timerState === 'running' && 'Focusing in Progress'}
            {timerState === 'paused' && 'Timer Paused'}
            {timerState === 'saving' && 'Saving Session...'}
            {timerState === 'error' && 'Save Error'}
          </span>
        </div>

        {/* Big Monospace Clock Display */}
        <div className="timer-clock-display" aria-label={`Elapsed time: ${formattedTime}`}>
          {formattedTime}
        </div>

        {/* Task Selector Dropdown */}
        <div className="timer-task-selector">
          <label htmlFor="task-select">
            <Target size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
            Link to a Task (Optional)
          </label>
          <select
            id="task-select"
            className="timer-task-select"
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value ? e.target.value : null)}
            disabled={timerState === 'saving'}
          >
            <option value="">General Focus (No linked task)</option>
            {tasks
              .filter((t) => !t.is_completed)
              .map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.priority})
                </option>
              ))}
          </select>
        </div>

        {/* Timer Control Buttons */}
        <div className="timer-actions">
          {timerState === 'idle' && (
            <button
              type="button"
              className="btn-timer-primary"
              onClick={start}
              aria-label="Start focus session"
            >
              <Play size={20} />
              <span>Start Focus</span>
            </button>
          )}

          {timerState === 'running' && (
            <>
              <button
                type="button"
                className="btn-timer-secondary"
                onClick={pause}
                aria-label="Pause focus timer"
              >
                <Pause size={18} />
                <span>Pause</span>
              </button>

              <button
                type="button"
                className="btn-timer-complete"
                onClick={complete}
                aria-label="Complete session"
              >
                <Check size={18} />
                <span>Complete</span>
              </button>

              <button
                type="button"
                className="btn-timer-danger"
                onClick={handleResetClick}
                aria-label="Reset timer"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </>
          )}

          {timerState === 'paused' && (
            <>
              <button
                type="button"
                className="btn-timer-primary"
                onClick={resume}
                aria-label="Resume focus timer"
              >
                <Play size={18} />
                <span>Resume</span>
              </button>

              <button
                type="button"
                className="btn-timer-complete"
                onClick={complete}
                aria-label="Complete session"
              >
                <Check size={18} />
                <span>Complete</span>
              </button>

              <button
                type="button"
                className="btn-timer-danger"
                onClick={handleResetClick}
                aria-label="Reset timer"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </>
          )}

          {timerState === 'saving' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600 }}>
              <RotateCw size={18} className="spin-animation" />
              <span>Saving focus session to storage...</span>
            </div>
          )}

          {timerState === 'error' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-timer-primary"
                onClick={retrySave}
              >
                <RotateCw size={16} />
                <span>Retry Save</span>
              </button>
              <button
                type="button"
                className="btn-timer-secondary"
                onClick={discardError}
              >
                <X size={16} />
                <span>Discard</span>
              </button>
            </div>
          )}
        </div>

        {/* Reset Confirmation Prompt */}
        {showResetConfirm && (
          <div
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning)',
              textAlign: 'center',
              width: '100%',
              maxWidth: '440px',
            }}
          >
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Reset this focus session? ({formattedTime} will not be saved)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn-danger"
                style={{ padding: '6px 16px', fontSize: 'var(--font-size-xs)' }}
                onClick={confirmReset}
              >
                Yes, Discard
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 16px', fontSize: 'var(--font-size-xs)' }}
                onClick={cancelReset}
              >
                Keep Going
              </button>
            </div>
          </div>
        )}

        {/* Success Feedback Banner */}
        {timerState === 'idle' && lastSavedSession && (
          <div className="timer-feedback-banner success" role="status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>
                Session recorded! Completed <strong>{formatTimerDisplay(lastSavedSession.duration_seconds)}</strong> of deep work.
              </span>
            </div>
          </div>
        )}

        {/* Error Feedback Banner */}
        {errorMessage && timerState === 'error' && (
          <div className="timer-feedback-banner error" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Session History Foundation (Step 3.9) */}
      <section className="focus-history-card" aria-labelledby="history-heading">
        <div className="focus-history-header">
          <div className="focus-history-title">
            <History size={18} color="var(--color-primary)" />
            <h2 id="history-heading" style={{ fontSize: 'var(--font-size-base)' }}>
              Recent Focus Sessions
            </h2>
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        {loadingHistory ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-4) 0' }}>
            Loading session history...
          </p>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--color-text-muted)' }}>
            <Clock size={28} style={{ opacity: 0.4, marginBottom: 'var(--space-2)' }} />
            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>No focus sessions recorded yet</p>
            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
              Complete your first focus session above to begin building steady attention momentum.
            </p>
          </div>
        ) : (
          <ul className="focus-history-list" role="list">
            {sessions.slice(0, 10).map((session) => {
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(session.started_at));

              return (
                <li key={session.id} className="focus-history-item">
                  <div className="focus-item-details">
                    <span className="focus-item-task">
                      {getTaskTitle(session.task_id)}
                    </span>
                    <span className="focus-item-time">
                      {formattedDate}
                    </span>
                  </div>
                  <span className="focus-item-duration">
                    {formatTimerDisplay(session.duration_seconds)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
