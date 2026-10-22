import { useState } from 'react';
import type { FC } from 'react';
import { CheckSquare, Plus, Filter } from 'lucide-react';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters as TaskFiltersType } from '../../types/task';
import { useTasks } from './useTasks';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';

const DEFAULT_FILTERS: TaskFiltersType = {
  status: 'all',
  priority: 'all',
  category: 'all',
  dueDate: 'all',
  searchQuery: '',
};

export const TasksPage: FC = () => {
  const [filters, setFilters] = useState<TaskFiltersType>(DEFAULT_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    loading,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
  } = useTasks(filters);

  const hasActiveFilters =
    (filters.status !== 'all' && Boolean(filters.status)) ||
    (filters.priority !== 'all' && Boolean(filters.priority)) ||
    (filters.category !== 'all' && Boolean(filters.category)) ||
    (filters.dueDate !== 'all' && Boolean(filters.dueDate)) ||
    Boolean(filters.searchQuery?.trim());

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, data as UpdateTaskInput);
    } else {
      await createTask(data as CreateTaskInput);
    }
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="page-container tasks-container">
      {/* Page Header */}
      <section className="hero-card" aria-labelledby="tasks-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <CheckSquare size={20} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deliberate Action
          </span>
        </div>
        <h1 id="tasks-heading" className="hero-title">
          All Tasks
        </h1>
        <p className="hero-subtitle">
          Organize your responsibilities across Study, Work, Personal, and Projects. Steady execution without overwhelm.
        </p>
      </section>

      {/* Toolbar */}
      <div className="tasks-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenCreate}
            id="create-task-btn"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add New Task</span>
          </button>

          <button
            type="button"
            className={`btn-secondary ${showFilterPanel ? 'active' : ''}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            aria-expanded={showFilterPanel}
            aria-label="Toggle filter panel"
          >
            <Filter size={16} aria-hidden="true" />
            <span>{showFilterPanel ? 'Hide Filters' : 'Filters'}</span>
            {hasActiveFilters && (
              <span className="filter-active-count" style={{ marginLeft: '4px' }}>
                Active
              </span>
            )}
          </button>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-ghost"
            onClick={handleClearFilters}
            style={{ fontSize: 'var(--font-size-xs)' }}
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Collapsible Filter Panel */}
      {showFilterPanel && (
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />
      )}

      {/* Task List */}
      <TaskList
        tasks={tasks}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onToggleComplete={async (id) => {
          await toggleComplete(id);
        }}
        onEdit={handleOpenEdit}
        onDelete={async (id) => {
          await deleteTask(id);
        }}
        onOpenCreateForm={handleOpenCreate}
        onClearFilters={handleClearFilters}
      />

      {/* Create / Edit Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
      />
    </div>
  );
};
