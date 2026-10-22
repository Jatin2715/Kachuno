import { useState } from 'react';
import type { FC } from 'react';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  AlertTriangle,
  FolderKanban,
  GraduationCap,
  Briefcase,
  User,
} from 'lucide-react';
import type { Task, Category } from '../../types/task';
import { isOverdue, isDueToday, formatDisplayDate } from '../../lib/dates';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
}

const CategoryIcon: FC<{ category: Category }> = ({ category }) => {
  switch (category) {
    case 'study':
      return <GraduationCap size={13} aria-hidden="true" />;
    case 'work':
      return <Briefcase size={13} aria-hidden="true" />;
    case 'personal':
      return <User size={13} aria-hidden="true" />;
    case 'projects':
      return <FolderKanban size={13} aria-hidden="true" />;
  }
};

export const TaskCard: FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const overdue = !task.is_completed && isOverdue(task.due_date);
  const dueToday = !task.is_completed && isDueToday(task.due_date);
  const dateFormatted = formatDisplayDate(task.due_date);

  const handleToggle = async () => {
    if (isToggling) return;
    try {
      setIsToggling(true);
      await onToggleComplete(task.id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(task.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <li className={`task-card ${task.is_completed ? 'is-completed' : ''}`}>
        {/* Accessible Checkbox */}
        <div className="task-checkbox-wrap">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.is_completed}
            onChange={handleToggle}
            disabled={isToggling}
            aria-label={`Mark "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
          />
        </div>

        {/* Task Content */}
        <div className="task-main">
          <div className="task-header-row">
            <h3 className="task-title">{task.title}</h3>

            {/* Quick Actions */}
            <div className="task-actions">
              <button
                type="button"
                className="task-action-btn"
                onClick={() => onEdit(task)}
                aria-label={`Edit task "${task.title}"`}
                title="Edit task"
              >
                <Edit2 size={15} />
              </button>
              <button
                type="button"
                className="task-action-btn delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label={`Delete task "${task.title}"`}
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {/* Badges metadata row */}
          <div className="task-meta-row">
            {/* Priority */}
            <span className={`badge-priority ${task.priority}`} title={`Priority: ${task.priority}`}>
              {task.priority}
            </span>

            {/* Category */}
            <span className={`badge-category ${task.category}`} title={`Category: ${task.category}`}>
              <CategoryIcon category={task.category} />
              <span>{task.category}</span>
            </span>

            {/* Due date indicator */}
            {task.due_date && (
              <span
                className={`badge-due-date ${overdue ? 'is-overdue' : dueToday ? 'is-today' : ''}`}
                title={overdue ? 'Overdue task' : dueToday ? 'Due today' : `Due: ${task.due_date}`}
              >
                {overdue ? (
                  <AlertTriangle size={12} aria-hidden="true" />
                ) : (
                  <Calendar size={12} aria-hidden="true" />
                )}
                <span>{dateFormatted}</span>
              </span>
            )}

            {/* Completed timestamp if complete */}
            {task.is_completed && task.completed_at && (
              <span className="badge-due-date" style={{ color: 'var(--color-primary)' }}>
                <Clock size={12} />
                <span>Done</span>
              </span>
            )}
          </div>
        </div>
      </li>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-title-${task.id}`}
        >
          <div className="modal-card confirm-dialog">
            <div className="modal-header">
              <h3 id={`delete-title-${task.id}`} className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} />
                Confirm Deletion
              </h3>
            </div>
            <div className="confirm-body">
              <p className="confirm-text">
                Are you sure you want to delete <strong>"{task.title}"</strong>?
              </p>
              <p className="confirm-text" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                This action cannot be undone. Any linked focus sessions will be preserved.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
