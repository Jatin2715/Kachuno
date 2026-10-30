import type { FocusSession, CreateFocusSessionInput } from '../../types/focus';
import { supabase } from '../../lib/supabase';

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

let isSavingInProgress = false;

const normalizeSession = (session: Record<string, unknown>): FocusSession => ({
  id: String(session.id ?? ''),
  user_id: String(session.user_id ?? 'local-user'),
  started_at: String(session.started_at ?? new Date().toISOString()),
  ended_at: session.ended_at ? String(session.ended_at) : null,
  duration_seconds: Number(session.duration_seconds ?? 0),
  task_id: session.task_id ? String(session.task_id) : null,
  status: (session.status as FocusSession['status']) ?? 'completed',
  created_at: String(session.created_at ?? new Date().toISOString()),
});

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) {
    return 'local-user';
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  return data.user.id;
}

export const focusSessionService = {
  async getFocusSessions(): Promise<FocusSession[]> {
    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Unable to load focus sessions.');
      }

      return (data ?? []).map((item) => normalizeSession(item as Record<string, unknown>));
    }

    const sessions = getStoredSessions();
    return sessions.sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  },

  async saveFocusSession(input: CreateFocusSessionInput): Promise<FocusSession> {
    if (isSavingInProgress) {
      throw new Error('Save already in progress. Please wait.');
    }

    if (!input.duration_seconds || input.duration_seconds < 1) {
      throw new Error('Focus session duration must be at least 1 second.');
    }

    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('You must be signed in to save focus sessions.');
      }

      isSavingInProgress = true;
      try {
        const payload = {
          user_id: userId,
          started_at: input.started_at,
          ended_at: input.ended_at,
          duration_seconds: Math.floor(input.duration_seconds),
          task_id: input.task_id || null,
          status: input.status,
        };

        const { data, error } = await supabase.from('focus_sessions').insert(payload).select().single();
        if (error) {
          throw new Error(error.message || 'Unable to save focus session.');
        }

        window.dispatchEvent(new CustomEvent(LISTENERS_KEY));
        return normalizeSession(data as Record<string, unknown>);
      } finally {
        isSavingInProgress = false;
      }
    }

    isSavingInProgress = true;
    try {
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

  async deleteFocusSession(id: string): Promise<void> {
    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('You must be signed in to delete focus sessions.');
      }

      const { error } = await supabase.from('focus_sessions').delete().eq('id', id).eq('user_id', userId);
      if (error) {
        throw new Error(error.message || 'Unable to delete focus session.');
      }
      window.dispatchEvent(new CustomEvent(LISTENERS_KEY));
      return;
    }

    const existing = getStoredSessions();
    const filtered = existing.filter((s) => s.id !== id);
    persistSessions(filtered);
  },

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(LISTENERS_KEY, handler);
    return () => window.removeEventListener(LISTENERS_KEY, handler);
  },
};
