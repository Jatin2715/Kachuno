import type { FC } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type {
  TaskFilters as TaskFiltersType,
  StatusFilter,
  PriorityFilter,
  CategoryFilter,
  DueDateFilter,
} from '../../types/task';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
  onClear: () => void;
}

export const TaskFilters: FC<TaskFiltersProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  // Count active non-default filters
  let activeCount = 0;
  if (filters.status && filters.status !== 'all') activeCount++;
  if (filters.priority && filters.priority !== 'all') activeCount++;
  if (filters.category && filters.category !== 'all') activeCount++;
  if (filters.dueDate && filters.dueDate !== 'all') activeCount++;
  if (filters.searchQuery && filters.searchQuery.trim() !== '') activeCount++;

  const setStatus = (status: StatusFilter) => onChange({ ...filters, status });
  const setPriority = (priority: PriorityFilter) => onChange({ ...filters, priority });
  const setCategory = (category: CategoryFilter) => onChange({ ...filters, category });
  const setDueDate = (dueDate: DueDateFilter) => onChange({ ...filters, dueDate });
  const setSearch = (query: string) => onChange({ ...filters, searchQuery: query });

  return (
    <div className="filter-panel" aria-label="Task Filters">
      <div className="filter-panel-header">
        <div className="filter-heading-group">
          <span>Filter & Search</span>
          {activeCount > 0 && (
            <span className="filter-active-count" title={`${activeCount} filters applied`}>
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={onClear}
            style={{ fontSize: 'var(--font-size-xs)', gap: '4px', padding: '4px 8px' }}
          >
            <RotateCcw size={12} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="filter-search-input-wrap">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          className="filter-search-input"
          placeholder="Search tasks by title or description..."
          value={filters.searchQuery || ''}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      {/* Multi-criteria filter chips grid */}
      <div className="filter-groups-grid">
        {/* Status Filter */}
        <div>
          <div className="filter-group-label">Status</div>
          <div className="filter-chips">
            {(['all', 'incomplete', 'completed'] as StatusFilter[]).map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-chip ${(filters.status || 'all') === st ? 'active' : ''}`}
                onClick={() => setStatus(st)}
              >
                {st === 'all' ? 'All' : st === 'incomplete' ? 'Incomplete' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <div className="filter-group-label">Priority</div>
          <div className="filter-chips">
            {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((pr) => (
              <button
                key={pr}
                type="button"
                className={`filter-chip ${(filters.priority || 'all') === pr ? 'active' : ''}`}
                onClick={() => setPriority(pr)}
              >
                {pr === 'all' ? 'All' : pr.charAt(0).toUpperCase() + pr.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <div className="filter-group-label">Category</div>
          <div className="filter-chips">
            {(['all', 'study', 'work', 'personal', 'projects'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${(filters.category || 'all') === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date Filter */}
        <div>
          <div className="filter-group-label">Due Date</div>
          <div className="filter-chips">
            {(['all', 'today', 'overdue', 'this_week', 'no_date'] as DueDateFilter[]).map((dd) => (
              <button
                key={dd}
                type="button"
                className={`filter-chip ${(filters.dueDate || 'all') === dd ? 'active' : ''}`}
                onClick={() => setDueDate(dd)}
              >
                {dd === 'all'
                  ? 'All'
                  : dd === 'today'
                  ? 'Today'
                  : dd === 'overdue'
                  ? 'Overdue'
                  : dd === 'this_week'
                  ? 'This Week'
                  : 'No Date'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
