import type { FC } from 'react';
import type { Task } from '../../types/task';
import { getMonthGridCells, type CalendarGridCell } from '../../lib/dates';

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: string;
  tasks: Task[];
  onSelectDate: (dateStr: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarGrid: FC<CalendarGridProps> = ({
  year,
  month,
  selectedDate,
  tasks,
  onSelectDate,
}) => {
  const cells = getMonthGridCells(year, month);

  // Index tasks by due_date for fast lookup
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach((task) => {
    if (task.due_date) {
      const list = tasksByDate.get(task.due_date) || [];
      list.push(task);
      tasksByDate.set(task.due_date, list);
    }
  });

  return (
    <div className="calendar-month-card" role="region" aria-label="Month View Calendar Grid">
      <div className="calendar-weekday-header" role="row">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday-label" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid" role="grid" aria-label="Days of the month">
        {cells.map((cell: CalendarGridCell) => {
          const isSelected = cell.dateStr === selectedDate;
          const dayTasks = tasksByDate.get(cell.dateStr) || [];

          let cellClass = 'calendar-day-cell';
          if (!cell.isCurrentMonth) cellClass += ' other-month';
          if (cell.isToday) cellClass += ' is-today';
          if (isSelected) cellClass += ' is-selected';

          return (
            <button
              key={cell.dateStr}
              type="button"
              role="gridcell"
              tabIndex={0}
              className={cellClass}
              onClick={() => onSelectDate(cell.dateStr)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDate(cell.dateStr);
                }
              }}
              aria-label={`${cell.dateStr}${cell.isToday ? ', today' : ''}${
                dayTasks.length > 0 ? `, ${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}` : ''
              }`}
              aria-selected={isSelected}
            >
              <span className="calendar-day-number">{cell.dayNumber}</span>

              {dayTasks.length > 0 && (
                <div className="calendar-day-tasks" aria-hidden="true">
                  {/* Task dots for quick status glance */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '2px' }}>
                    {dayTasks.slice(0, 4).map((t) => (
                      <span
                        key={t.id}
                        className={`task-dot priority-${t.priority}`}
                        title={`${t.title} (${t.priority})`}
                      />
                    ))}
                    {dayTasks.length > 4 && (
                      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', lineHeight: '7px' }}>
                        +{dayTasks.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Task chips on desktop */}
                  {dayTasks.slice(0, 2).map((t) => (
                    <span
                      key={t.id}
                      className={`calendar-task-chip ${t.is_completed ? 'completed' : ''}`}
                    >
                      {t.title}
                    </span>
                  ))}
                  {dayTasks.length > 2 && (
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
