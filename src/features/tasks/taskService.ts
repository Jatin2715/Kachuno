/**
 * Kachuno Task Service (Temporary Local Storage Adapter)
 * =======================================================
 * Step 2.2: Local adapter implementing the standard task interface.
 * This file will be replaced by the Supabase adapter on Day 4.
 */

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../../types/task';
import { getLocalToday, isOverdue, isDueToday, isDueThisWeek } from '../../lib/dates';

const STORAGE_KEY = 'kachuno_tasks_v1';
const LISTENERS_KEY = 'kachuno_tasks_updated';

// Seed tasks provided once on fresh install so the app feels alive
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

// Helper to notify active views that tasks have changed
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

export const taskService = {
  /**
   * Retrieve tasks with optional multi-criterion filtering (AND semantics)
   */
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const all = loadTasksFromStorage();
    if (!filters) return all;

    return all.filter((task) => {
      // 1. Status Filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'completed' && !task.is_completed) return false;
        if (filters.status === 'incomplete' && task.is_completed) return false;
      }

      // 2. Priority Filter
      if (filters.priority && filters.priority !== 'all') {
        if (task.priority !== filters.priority) return false;
      }

      // 3. Category Filter
      if (filters.category && filters.category !== 'all') {
        if (task.category !== filters.category) return false;
      }

      // 4. Due Date Filter
      if (filters.dueDate && filters.dueDate !== 'all') {
        if (filters.dueDate === 'today' && !isDueToday(task.due_date)) return false;
        if (filters.dueDate === 'overdue' && (!isOverdue(task.due_date) || task.is_completed)) return false;
        if (filters.dueDate === 'this_week' && !isDueThisWeek(task.due_date)) return false;
        if (filters.dueDate === 'no_date' && task.due_date !== null) return false;
      }

      // 5. Search Query
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  },

  /**
   * Create a new task with validation & timestamps
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    const title = input.title.trim();
    if (!title) {
      throw new Error('Task title cannot be empty.');
    }
    if (title.length > 160) {
      throw new Error('Task title exceeds maximum 160 characters.');
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

  /**
   * Update fields of an existing task
   */
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
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

  /**
   * Toggle task completion status
   */
  async toggleComplete(id: string): Promise<Task> {
    const tasks = loadTasksFromStorage();
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task with id ${id} not found.`);
    return this.updateTask(id, { is_completed: !task.is_completed });
  },

  /**
   * Permanently delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const tasks = loadTasksFromStorage();
    const filtered = tasks.filter((t) => t.id !== id);
    saveTasksToStorage(filtered);
  },
};
