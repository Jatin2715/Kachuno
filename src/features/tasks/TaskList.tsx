import type { FC } from 'react';
import { CheckSquare, FilterX, Plus } from 'lucide-react';
import type { Task } from '../../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  hasActiveFilters: boolean;
  onToggleComplete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenCreateForm: () => void;
  onClearFilters: () => void;
}

export const TaskList: FC<TaskListProps> = ({
  tasks,
  loading,
  hasActiveFilters,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenCreateForm,
  onClearFilters,
}) => {
  if (loading) {
    return (
      <div className="tasks-empty-card" style={{ padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Loading your deliberate task list...
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="tasks-empty-card">
          <div className="tasks-empty-icon" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
            <FilterX size={26} aria-hidden="true" />
          </div>
          <h3 className="tasks-empty-title">No tasks match your filters</h3>
          <p className="tasks-empty-desc">
            Try loosening your category, priority, or due date criteria to reveal more tasks.
          </p>
          <button type="button" className="btn-secondary" onClick={onClearFilters}>
            Clear all filters
          </button>
        </div>
      );
    }

    return (
      <div className="tasks-empty-card">
        <div className="tasks-empty-icon">
          <CheckSquare size={28} aria-hidden="true" />
        </div>
        <h3 className="tasks-empty-title">No tasks recorded yet</h3>
        <p className="tasks-empty-desc">
          Capture your deliberate goals for study, work, personal reflection, and projects. One steady step at a time.
        </p>
        <button type="button" className="btn-primary" onClick={onOpenCreateForm}>
          <Plus size={16} />
          <span>Create your first task</span>
        </button>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* List Header Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {completedCount} of {tasks.length} completed ({tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%)
        </span>
      </div>

      {/* List of cards */}
      <ul className="task-list" role="list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};
