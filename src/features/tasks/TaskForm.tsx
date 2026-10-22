import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import type { Task, CreateTaskInput, UpdateTaskInput, Priority, Category } from '../../types/task';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  initialTask?: Task | null;
  defaultDueDate?: string | null;
}

export const TaskForm: FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultDueDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial state when modal opens or initialTask changes
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        setDueDate(initialTask.due_date || '');
        setPriority(initialTask.priority);
        setCategory(initialTask.category);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(defaultDueDate || '');
        setPriority('medium');
        setCategory('work');
      }
      setTitleError(null);
      setDescError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialTask, defaultDueDate]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    let isValid = true;
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError('Task title is required and cannot be empty.');
      isValid = false;
    } else if (trimmedTitle.length > 160) {
      setTitleError(`Title exceeds 160 characters (currently ${trimmedTitle.length}).`);
      isValid = false;
    } else {
      setTitleError(null);
    }

    if (description.length > 2000) {
      setDescError(`Description exceeds 2000 characters (currently ${description.length}).`);
      isValid = false;
    } else {
      setDescError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate.trim() || null,
        priority,
        category,
      });
      onClose();
    } catch (err) {
      setTitleError(err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="task-form-title" className="modal-title">
            {initialTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close form modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-field">
              <label htmlFor="task-title-input" className="form-label">
                <span>Title <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                <span className="char-counter">{title.length} / 160</span>
              </label>
              <input
                id="task-title-input"
                type="text"
                className={`form-input ${titleError ? 'has-error' : ''}`}
                placeholder="What deliberate action will you take?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                maxLength={160}
                required
                autoFocus
              />
              {titleError && (
                <div className="form-error-msg" role="alert">
                  <AlertCircle size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  {titleError}
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="form-field">
              <label htmlFor="task-desc-input" className="form-label">
                <span>Description (Optional)</span>
                <span className="char-counter">{description.length} / 2000</span>
              </label>
              <textarea
                id="task-desc-input"
                className={`form-textarea ${descError ? 'has-error' : ''}`}
                placeholder="Add context, acceptance notes, or sub-points..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (descError) setDescError(null);
                }}
                maxLength={2000}
                rows={3}
              />
              {descError && (
                <div className="form-error-msg" role="alert">
                  <AlertCircle size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  {descError}
                </div>
              )}
            </div>

            {/* Row: Priority & Category */}
            <div className="form-row-2col">
              <div className="form-field">
                <label htmlFor="task-priority-select" className="form-label">
                  Priority
                </label>
                <select
                  id="task-priority-select"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="task-category-select" className="form-label">
                  Category
                </label>
                <select
                  id="task-category-select"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
            </div>

            {/* Due Date Field */}
            <div className="form-field">
              <label htmlFor="task-duedate-input" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> Due Date (Optional)
                </span>
                {dueDate && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '0 4px', fontSize: '11px', height: 'auto' }}
                    onClick={() => setDueDate('')}
                  >
                    Clear date
                  </button>
                )}
              </label>
              <input
                id="task-duedate-input"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
