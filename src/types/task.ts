export type Priority = 'low' | 'medium' | 'high';
export type Category = 'study' | 'work' | 'personal' | 'projects';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null; // 'YYYY-MM-DD' date-only format
  priority: Priority;
  category: Category;
  is_completed: boolean;
  completed_at: string | null; // ISO timestamptz string
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: Priority;
  category?: Category;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: Priority;
  category?: Category;
  is_completed?: boolean;
}

export type StatusFilter = 'all' | 'incomplete' | 'completed';
export type PriorityFilter = 'all' | Priority;
export type CategoryFilter = 'all' | Category;
export type DueDateFilter = 'all' | 'today' | 'overdue' | 'this_week' | 'no_date';

export interface TaskFilters {
  status?: StatusFilter;
  priority?: PriorityFilter;
  category?: CategoryFilter;
  dueDate?: DueDateFilter;
  searchQuery?: string;
}
