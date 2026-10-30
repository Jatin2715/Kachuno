import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../../types/task';
import { getLocalToday, isOverdue, isDueToday, isDueThisWeek } from '../../lib/dates';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'kachuno_tasks_v1';
const LISTENERS_KEY = 'kachuno_tasks_updated';

const SEED_TASKS: Task[] = [
  {
    id: 'seed-task-1',
    user_id: 'local-user',
    title: 'Review Day 2 task management features',
    description: 'Verify task creation, editing, category filters, and state transitions in Kachuno.',
    due_date: getLocalToday(),
    priority: 'high',
    category: 'projects',
    is_completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'seed-task-2',
    user_id: 'local-user',
    title: 'Deep work on systems architecture',
    description: 'Read blueprint docs and prepare calendar and focus timer integration.',
    due_date: getLocalToday(),
    priority: 'medium',
    category: 'study',
    is_completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'seed-task-3',
    user_id: 'local-user',
    title: 'Deliberate evening walk & reflection',
    description: 'Slow down, step away from screens, and observe the surroundings.',
    due_date: null,
    priority: 'low',
    category: 'personal',
    is_completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function notifySubscribers() {
  window.dispatchEvent(new CustomEvent(LISTENERS_KEY));
}

export function subscribeToTaskChanges(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(LISTENERS_KEY, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(LISTENERS_KEY, handler);
    window.removeEventListener('storage', handler);
  };
}

function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TASKS));
      return SEED_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse tasks from localStorage, falling back to seed tasks:', err);
    return SEED_TASKS;
  }
}

function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    notifySubscribers();
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

const normalizeTask = (task: Record<string, unknown>): Task => ({
  id: String(task.id ?? ''),
  user_id: String(task.user_id ?? 'local-user'),
  title: String(task.title ?? ''),
  description: task.description ? String(task.description) : null,
  due_date: task.due_date ? String(task.due_date) : null,
  priority: (task.priority as Task['priority']) ?? 'medium',
  category: (task.category as Task['category']) ?? 'work',
  is_completed: Boolean(task.is_completed),
  completed_at: task.completed_at ? String(task.completed_at) : null,
  created_at: String(task.created_at ?? new Date().toISOString()),
  updated_at: String(task.updated_at ?? new Date().toISOString()),
});

const applyTaskFilters = (all: Task[], filters?: TaskFilters): Task[] => {
  if (!filters) return all;

  return all.filter((task) => {
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'completed' && !task.is_completed) return false;
      if (filters.status === 'incomplete' && task.is_completed) return false;
    }

    if (filters.priority && filters.priority !== 'all') {
      if (task.priority !== filters.priority) return false;
    }

    if (filters.category && filters.category !== 'all') {
      if (task.category !== filters.category) return false;
    }

    if (filters.dueDate && filters.dueDate !== 'all') {
      if (filters.dueDate === 'today' && !isDueToday(task.due_date)) return false;
      if (filters.dueDate === 'overdue' && (!isOverdue(task.due_date) || task.is_completed)) return false;
      if (filters.dueDate === 'this_week' && !isDueThisWeek(task.due_date)) return false;
      if (filters.dueDate === 'no_date' && task.due_date !== null) return false;
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = task.description?.toLowerCase().includes(q) ?? false;
      if (!matchesTitle && !matchesDesc) return false;
    }

    return true;
  });
};

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

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Unable to load tasks.');
      }

      return applyTaskFilters((data ?? []).map((item) => normalizeTask(item as Record<string, unknown>)), filters);
    }

    const all = loadTasksFromStorage();
    return applyTaskFilters(all, filters);
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const title = input.title.trim();
    if (!title) {
      throw new Error('Task title cannot be empty.');
    }
    if (title.length > 160) {
      throw new Error('Task title exceeds maximum 160 characters.');
    }

    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('You must be signed in to create tasks.');
      }

      const payload = {
        user_id: userId,
        title,
        description: input.description?.trim() ? input.description.trim() : null,
        due_date: input.due_date?.trim() ? input.due_date.trim() : null,
        priority: input.priority ?? 'medium',
        category: input.category ?? 'work',
        is_completed: false,
        completed_at: null,
      };

      const { data, error } = await supabase.from('tasks').insert(payload).select().single();
      if (error) {
        throw new Error(error.message || 'Unable to create task.');
      }

      notifySubscribers();
      return normalizeTask(data as Record<string, unknown>);
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      user_id: 'local-user',
      title,
      description: input.description?.trim() ? input.description.trim() : null,
      due_date: input.due_date?.trim() ? input.due_date.trim() : null,
      priority: input.priority || 'medium',
      category: input.category || 'work',
      is_completed: false,
      completed_at: null,
      created_at: now,
      updated_at: now,
    };

    const tasks = loadTasksFromStorage();
    tasks.unshift(newTask);
    saveTasksToStorage(tasks);
    return newTask;
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('You must be signed in to update tasks.');
      }

      const currentTask = (await supabase.from('tasks').select('*').eq('id', id).eq('user_id', userId).maybeSingle()).data;
      if (!currentTask) {
        throw new Error(`Task with id ${id} not found.`);
      }

      const nextTitle = input.title !== undefined ? input.title.trim() : currentTask.title;
      if (!nextTitle) {
        throw new Error('Task title cannot be empty.');
      }
      if (nextTitle.length > 160) {
        throw new Error('Task title exceeds maximum 160 characters.');
      }

      const payload = {
        title: nextTitle,
        description: input.description !== undefined ? (input.description?.trim() || null) : currentTask.description,
        due_date: input.due_date !== undefined ? (input.due_date?.trim() || null) : currentTask.due_date,
        priority: input.priority ?? currentTask.priority,
        category: input.category ?? currentTask.category,
        is_completed: input.is_completed ?? currentTask.is_completed,
        completed_at:
          input.is_completed !== undefined
            ? input.is_completed
              ? new Date().toISOString()
              : null
            : currentTask.completed_at,
      };

      const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).eq('user_id', userId).select().single();
      if (error) {
        throw new Error(error.message || 'Unable to update task.');
      }

      notifySubscribers();
      return normalizeTask(data as Record<string, unknown>);
    }

    const tasks = loadTasksFromStorage();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`Task with id ${id} not found.`);
    }

    const current = tasks[idx];
    const now = new Date().toISOString();
    let updatedTitle = current.title;

    if (input.title !== undefined) {
      const trimmed = input.title.trim();
      if (!trimmed) throw new Error('Task title cannot be empty.');
      if (trimmed.length > 160) throw new Error('Task title exceeds 160 characters.');
      updatedTitle = trimmed;
    }

    let updatedCompleted = current.is_completed;
    let updatedCompletedAt = current.completed_at;

    if (input.is_completed !== undefined && input.is_completed !== current.is_completed) {
      updatedCompleted = input.is_completed;
      updatedCompletedAt = input.is_completed ? now : null;
    }

    const updatedTask: Task = {
      ...current,
      title: updatedTitle,
      description: input.description !== undefined ? (input.description?.trim() || null) : current.description,
      due_date: input.due_date !== undefined ? (input.due_date?.trim() || null) : current.due_date,
      priority: input.priority !== undefined ? input.priority : current.priority,
      category: input.category !== undefined ? input.category : current.category,
      is_completed: updatedCompleted,
      completed_at: updatedCompletedAt,
      updated_at: now,
    };

    tasks[idx] = updatedTask;
    saveTasksToStorage(tasks);
    return updatedTask;
  },

  async toggleComplete(id: string): Promise<Task> {
    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('You must be signed in to update tasks.');
      }

      const { data: currentTask, error: findError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (findError || !currentTask) {
        throw new Error(`Task with id ${id} not found.`);
      }

      return this.updateTask(id, { is_completed: !currentTask.is_completed });
    }

    const tasks = loadTasksFromStorage();
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task with id ${id} not found.`);
    return this.updateTask(id, { is_completed: !task.is_completed });
  },

  async deleteTask(id: string): Promise<void> {
    if (supabase) {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('You must be signed in to delete tasks.');
      }

      const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
      if (error) {
        throw new Error(error.message || 'Unable to delete task.');
      }
      notifySubscribers();
      return;
    }

    const tasks = loadTasksFromStorage();
    const filtered = tasks.filter((t) => t.id !== id);
    saveTasksToStorage(filtered);
  },
};
