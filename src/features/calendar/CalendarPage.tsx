import type { FC } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export const CalendarPage: FC = () => {
  return (
    <div className="page-container placeholder-view">
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
          Visualize your commitments across month, week, and day horizons with timezone-aware deadlines and task heatmaps.
        </p>
      </section>

      <section className="placeholder-card" aria-label="Calendar Coming Soon">
        <div className="placeholder-icon-wrap">
          <CalendarIcon size={28} aria-hidden="true" />
        </div>
        <h2 className="placeholder-heading">Calendar Engine</h2>
        <p className="placeholder-body">
          Monthly grid, 7-day schedule view, and single-day breakdown will be linked with your tasks during Day 3 implementation.
        </p>
        <div className="placeholder-status-tag">
          <span className="status-dot"></span>
          <span>Day 3 Target: Custom Month/Week/Day calendar grids & timezone safety</span>
        </div>
      </section>

      <div className="feature-spec-grid">
        <div className="spec-item">
          <div className="spec-title">
            <Layers size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Month & Week Modes</span>
          </div>
          <p className="spec-desc">
            Toggle between bird's-eye monthly density and focused weekly hourly commitments.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <Clock size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Timezone Resilience</span>
          </div>
          <p className="spec-desc">
            Local date formatting that avoids off-by-one UTC traps across DST boundaries.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <div style={{ display: 'flex', gap: '4px' }}>
              <ChevronLeft size={16} />
              <ChevronRight size={16} />
            </div>
            <span>Fast Date Navigation</span>
          </div>
          <p className="spec-desc">
            Jump to "Today" with one click, or step month-by-month and year-by-year effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
};
