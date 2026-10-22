import { useState } from 'react';
import type { FC } from 'react';
import {
  Sun,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../types/task';
import { getLocalToday, isDueToday, isOverdue, isCompletedToday } from '../../lib/dates';
import { useTasks } from '../tasks/useTasks';
import { TaskCard } from '../tasks/TaskCard';
import { TaskForm } from '../tasks/TaskForm';
import { useNavigation } from '../../app/AppRouter';

export const MyDayPage: FC = () => {
  const { navigate } = useNavigation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    loading,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
  } = useTasks();

  const todayStr = getLocalToday();

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Derive real task groups
  const dueTodayIncomplete = tasks.filter(
    (t) => !t.is_completed && isDueToday(t.due_date)
  );

  const overdueIncomplete = tasks.filter(
    (t) => !t.is_completed && isOverdue(t.due_date)
  );

  const completedToday = tasks.filter(
    (t) => t.is_completed && isCompletedToday(t.completed_at)
  );

  const handleOpenCreateForToday = () => {
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
      const createData = data as CreateTaskInput;
      await createTask({
        ...createData,
        due_date: createData.due_date || todayStr,
      });
    }
  };

  return (
    <div className="page-container tasks-container">
      {/* Welcome Header */}
      <section className="hero-card" aria-labelledby="my-day-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <Sun size={20} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {todayFormatted}
          </span>
        </div>
        <h1 id="my-day-heading" className="hero-title">
          My Day
        </h1>
        <p className="hero-subtitle">
          Focus on what truly matters today. Clear what's overdue, honor today's commitments, and move with steady momentum.
        </p>
      </section>

      {/* Dynamic Summary Cards derived from real data */}
      <div className="my-day-stats-banner">
        <div className="stat-metric-card">
          <span className="stat-metric-value">{dueTodayIncomplete.length}</span>
          <span className="stat-metric-label">Due Today</span>
        </div>

        <div className="stat-metric-card">
          <span
            className="stat-metric-value"
            style={{ color: overdueIncomplete.length > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}
          >
            {overdueIncomplete.length}
          </span>
          <span className="stat-metric-label">Overdue</span>
        </div>

        <div className="stat-metric-card">
          <span className="stat-metric-value" style={{ color: 'var(--color-success)' }}>
            {completedToday.length}
          </span>
          <span className="stat-metric-label">Completed Today</span>
        </div>

        <div className="stat-metric-card" style={{ background: 'var(--color-bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
            <Clock size={14} />
            <span>Day 3 Preview</span>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Focus timer arriving next
          </span>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="tasks-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenCreateForToday}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add Task for Today</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/tasks')}
          >
            <span>View All Tasks</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="tasks-empty-card" style={{ padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Syncing today's deliberate schedule...
          </p>
        </div>
      )}

      {/* Section 1: Overdue Tasks (if any) */}
      {!loading && overdueIncomplete.length > 0 && (
        <section className="my-day-section" aria-labelledby="overdue-heading">
          <div className="my-day-section-header">
            <h2 id="overdue-heading" className="my-day-section-title" style={{ color: 'var(--color-danger)' }}>
              <AlertTriangle size={18} />
              <span>Needs Attention (Overdue)</span>
            </h2>
            <span className="my-day-section-count alert">
              {overdueIncomplete.length}
            </span>
          </div>
          <ul className="task-list" role="list">
            {overdueIncomplete.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={async (id) => {
                  await toggleComplete(id);
                }}
                onEdit={handleOpenEdit}
                onDelete={async (id) => {
                  await deleteTask(id);
                }}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Section 2: Due Today */}
      {!loading && (
        <section className="my-day-section" aria-labelledby="today-heading">
          <div className="my-day-section-header">
            <h2 id="today-heading" className="my-day-section-title">
              <Calendar size={18} color="var(--color-primary)" />
              <span>Due Today</span>
            </h2>
            <span className="my-day-section-count">
              {dueTodayIncomplete.length}
            </span>
          </div>

          {dueTodayIncomplete.length === 0 ? (
            <div className="tasks-empty-card" style={{ padding: 'var(--space-8)' }}>
              <div className="tasks-empty-icon" style={{ background: 'var(--color-bg-subtle)' }}>
                <Sun size={24} color="var(--color-primary-light)" />
              </div>
              <h3 className="tasks-empty-title">All caught up for today</h3>
              <p className="tasks-empty-desc">
                No incomplete tasks scheduled for today. Take a mindful break or plan your next priorities.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleOpenCreateForToday}
              >
                <Plus size={14} />
                <span>Add task for today</span>
              </button>
            </div>
          ) : (
            <ul className="task-list" role="list">
              {dueTodayIncomplete.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={async (id) => {
                    await toggleComplete(id);
                  }}
                  onEdit={handleOpenEdit}
                  onDelete={async (id) => {
                    await deleteTask(id);
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Section 3: Completed Today */}
      {!loading && completedToday.length > 0 && (
        <section className="my-day-section" aria-labelledby="completed-heading">
          <div className="my-day-section-header">
            <h2 id="completed-heading" className="my-day-section-title" style={{ color: 'var(--color-success)' }}>
              <CheckCircle2 size={18} />
              <span>Completed Today</span>
            </h2>
            <span className="my-day-section-count">
              {completedToday.length}
            </span>
          </div>
          <ul className="task-list" role="list">
            {completedToday.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={async (id) => {
                  await toggleComplete(id);
                }}
                onEdit={handleOpenEdit}
                onDelete={async (id) => {
                  await deleteTask(id);
                }}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Create / Edit Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        defaultDueDate={todayStr}
      />
    </div>
  );
};
