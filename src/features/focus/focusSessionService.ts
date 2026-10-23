/**
 * Kachuno Focus Session Service (Temporary Local Storage Adapter)
 * ===============================================================
 * Step 3.8: Local adapter implementing focus session persistence.
 * Replaced by Supabase PostgreSQL adapter on Day 4.
 */

import type { FocusSession, CreateFocusSessionInput } from '../../types/focus';

const STORAGE_KEY = 'kachuno_focus_sessions_v1';
const LISTENERS_KEY = 'kachuno_focus_updated';

function getStoredSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FocusSession[];
  } catch (err) {
    console.error('Failed to parse stored focus sessions:', err);
    return [];
  }
}

function persistSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent(LISTENERS_KEY));
  } catch (err) {
    console.error('Failed to save focus sessions to localStorage:', err);
    throw new Error('Local storage write failed');
  }
}

// In-memory guard against concurrent duplicate writes
let isSavingInProgress = false;

export const focusSessionService = {
  /**
   * Fetches all recorded focus sessions, sorted descending by started_at.
   */
  async getFocusSessions(): Promise<FocusSession[]> {
    // Artificial slight tick to emulate async contract
    await new Promise((resolve) => setTimeout(resolve, 50));
    const sessions = getStoredSessions();
    return sessions.sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  },

  /**
   * Saves a newly completed focus session.
   * Rejects sessions < 1 second. Guards against concurrent duplicate saves.
   */
  async saveFocusSession(input: CreateFocusSessionInput): Promise<FocusSession> {
    if (isSavingInProgress) {
      throw new Error('Save already in progress. Please wait.');
    }

    if (!input.duration_seconds || input.duration_seconds < 1) {
      throw new Error('Focus session duration must be at least 1 second.');
    }

    isSavingInProgress = true;
    try {
      // Simulate real persistence delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newSession: FocusSession = {
        id: `focus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user_id: 'local-user',
        started_at: input.started_at,
        ended_at: input.ended_at,
        duration_seconds: Math.floor(input.duration_seconds),
        task_id: input.task_id || null,
        status: input.status,
        created_at: new Date().toISOString(),
      };

      const existing = getStoredSessions();
      persistSessions([newSession, ...existing]);

      return newSession;
    } finally {
      isSavingInProgress = false;
    }
  },

  /**
   * Clears or deletes a session (useful for history management).
   */
  async deleteFocusSession(id: string): Promise<void> {
    const existing = getStoredSessions();
    const filtered = existing.filter((s) => s.id !== id);
    persistSessions(filtered);
  },

  /**
   * Subscribes to focus updates.
   */
  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(LISTENERS_KEY, handler);
    return () => window.removeEventListener(LISTENERS_KEY, handler);
  },
};
