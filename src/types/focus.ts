export type TimerState = 'idle' | 'running' | 'paused' | 'saving' | 'error';

export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;       // ISO timestamptz
  ended_at: string | null;  // ISO timestamptz
  duration_seconds: number;
  task_id: string | null;
  status: 'completed' | 'cancelled';
  created_at: string;
}

export interface CreateFocusSessionInput {
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  task_id?: string | null;
  status: 'completed' | 'cancelled';
}
