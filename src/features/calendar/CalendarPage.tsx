import { useState } from 'react';
import type { FC } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Columns,
  Info,
} from 'lucide-react';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../types/task';
import {
  getLocalToday,
  formatMonthYear,
  shiftMonth,
  getStartOfWeek,
  shiftDate,
  formatDisplayDate,
} from '../../lib/dates';
import { useTasks } from '../tasks/useTasks';
import { CalendarGrid } from './CalendarGrid';
import { WeekView } from './WeekView';
import { TaskCard } from '../tasks/TaskCard';
import { TaskForm } from '../tasks/TaskForm';

export const CalendarPage: FC = () => {
  const todayStr = getLocalToday();
  const todayDate = new Date();

  // Navigation states
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth() + 1); // 1-12
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(getStartOfWeek(todayStr));
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Tasks hook
  const {
    tasks,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
  } = useTasks();

  // Filter tasks due on selectedDate
  const selectedDateTasks = tasks.filter((t) => t.due_date === selectedDate);
  const unscheduledTasks = tasks.filter((t) => !t.due_date);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      const { year, month } = shiftMonth(currentYear, currentMonth, -1);
      setCurrentYear(year);
      setCurrentMonth(month);
    } else {
      const prevWeekStart = shiftDate(currentWeekStart, -7);
      setCurrentWeekStart(prevWeekStart);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      const { year, month } = shiftMonth(currentYear, currentMonth, 1);
      setCurrentYear(year);
      setCurrentMonth(month);
    } else {
      const nextWeekStart = shiftDate(currentWeekStart, 7);
      setCurrentWeekStart(nextWeekStart);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setCurrentWeekStart(getStartOfWeek(todayStr));
    setSelectedDate(todayStr);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    // If selecting a date outside current month, optionally sync the month view
    const parts = dateStr.split('-');
    const cellYear = parseInt(parts[0], 10);
    const cellMonth = parseInt(parts[1], 10);
    if (cellYear !== currentYear || cellMonth !== currentMonth) {
      setCurrentYear(cellYear);
      setCurrentMonth(cellMonth);
    }
  };

  const handleOpenCreateForDate = () => {
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
        due_date: createData.due_date || selectedDate,
      });
    }
  };

  // Formatted header string
  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return formatMonthYear(currentYear, currentMonth);
    } else {
      const weekEnd = shiftDate(currentWeekStart, 6);
      return `${formatDisplayDate(currentWeekStart)} – ${formatDisplayDate(weekEnd)}`;
    }
  };

  return (
    <div className="page-container calendar-container">
      {/* Hero Header */}
      <section className="hero-card" aria-labelledby="calendar-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <CalendarIcon size={20} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Schedule & Timeline
          </span>
        </div>
        <h1 id="calendar-heading" className="hero-title">
          Calendar Views
        </h1>
        <p className="hero-subtitle">
          Visualize your commitments across month and 7-day horizons with timezone-aware deadlines and deliberate pacing.
        </p>
      </section>

      {/* Calendar Toolbar */}
      <div className="calendar-toolbar">
        <div className="calendar-nav-group">
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={handlePrev}
            aria-label="Previous period"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            className="calendar-today-btn"
            onClick={handleToday}
          >
            Today
          </button>

          <button
            type="button"
            className="calendar-nav-btn"
            onClick={handleNext}
            aria-label="Next period"
          >
            <ChevronRight size={18} />
          </button>

          <h2 className="calendar-heading-title" style={{ marginLeft: 'var(--space-2)' }}>
            {getHeaderTitle()}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="calendar-view-toggle" role="group" aria-label="Calendar view switcher">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              <CalendarDays size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Month
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              <Columns size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Week
            </button>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenCreateForDate}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === 'month' ? (
        <CalendarGrid
          year={currentYear}
          month={currentMonth}
          selectedDate={selectedDate}
          tasks={tasks}
          onSelectDate={handleSelectDate}
        />
      ) : (
        <WeekView
          startOfWeek={currentWeekStart}
          selectedDate={selectedDate}
          tasks={tasks}
          onSelectDate={handleSelectDate}
        />
      )}

      {/* Selected Date Detail Section */}
      <section className="calendar-detail-section" aria-labelledby="selected-date-heading">
        <div className="calendar-detail-header">
          <div className="calendar-detail-title">
            <CalendarIcon size={20} color="var(--color-primary)" />
            <h2 id="selected-date-heading" style={{ fontSize: 'var(--font-size-lg)' }}>
              Tasks for {selectedDate === todayStr ? 'Today' : selectedDate}
            </h2>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
              }}
            >
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleOpenCreateForDate}
          >
            <Plus size={14} />
            <span>Schedule for this day</span>
          </button>
        </div>

        {selectedDateTasks.length === 0 ? (
          <div className="tasks-empty-card" style={{ padding: 'var(--space-6)' }}>
            <p className="tasks-empty-title" style={{ fontSize: 'var(--font-size-base)' }}>
              No tasks due on this date
            </p>
            <p className="tasks-empty-desc">
              Enjoy the open space or click below to schedule a deliberate task for {selectedDate}.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={handleOpenCreateForDate}
              style={{ marginTop: 'var(--space-2)' }}
            >
              <Plus size={14} />
              <span>Add task for {selectedDate}</span>
            </button>
          </div>
        ) : (
          <ul className="task-list" role="list">
            {selectedDateTasks.map((task) => (
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

        {/* Notice for unscheduled tasks */}
        {unscheduledTasks.length > 0 && (
          <div
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} color="var(--color-primary-light)" />
              <span>
                <strong>{unscheduledTasks.length}</strong> {unscheduledTasks.length === 1 ? 'task has' : 'tasks have'} no due date and will not appear on calendar days.
              </span>
            </div>
            <a href="#/tasks" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              View in Tasks
            </a>
          </div>
        )}
      </section>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        defaultDueDate={selectedDate}
      />
    </div>
  );
};
