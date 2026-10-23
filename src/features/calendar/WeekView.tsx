import type { FC } from 'react';
import type { Task } from '../../types/task';
import { getWeekDays, getLocalToday } from '../../lib/dates';

interface WeekViewProps {
  startOfWeek: string;
  selectedDate: string;
  tasks: Task[];
  onSelectDate: (dateStr: string) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeekView: FC<WeekViewProps> = ({
  startOfWeek,
  selectedDate,
  tasks,
  onSelectDate,
}) => {
  const weekDays = getWeekDays(startOfWeek);
  const todayStr = getLocalToday();

  // Group tasks by due date
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach((task) => {
    if (task.due_date) {
      const list = tasksByDate.get(task.due_date) || [];
      list.push(task);
      tasksByDate.set(task.due_date, list);
    }
  });

  return (
    <div className="week-view-container" role="region" aria-label="7-Day Week Schedule View">
      {weekDays.map((dateStr, index) => {
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === todayStr;
        const dayTasks = tasksByDate.get(dateStr) || [];
        const parts = dateStr.split('-');
        const dayNumber = parseInt(parts[2], 10);

        let colClass = 'week-day-column';
        if (isToday) colClass += ' is-today';
        if (isSelected) colClass += ' is-selected';

        return (
          <div
            key={dateStr}
            className={colClass}
            role="button"
            tabIndex={0}
            onClick={() => onSelectDate(dateStr)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectDate(dateStr);
              }
            }}
            aria-selected={isSelected}
            aria-label={`${DAY_NAMES[index]} ${dateStr}${isToday ? ', Today' : ''}`}
          >
            <div className="week-day-header">
              <span className="week-day-name">{DAY_NAMES[index]}</span>
              <span className="week-day-badge">{dayNumber}</span>
            </div>

            <div className="week-task-list">
              {dayTasks.length === 0 ? (
                <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  No tasks
                </div>
              ) : (
                dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`week-task-item priority-${t.priority} ${t.is_completed ? 'is-completed' : ''}`}
                    title={`${t.title} (${t.priority} · ${t.category})`}
                  >
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '2px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{t.category}</span>
                      {t.is_completed && <span>✓ Done</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
