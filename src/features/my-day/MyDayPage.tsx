import type { FC } from 'react';
import { Sun, CheckCircle2, Calendar, Target } from 'lucide-react';

export const MyDayPage: FC = () => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="page-container placeholder-view">
      {/* Welcome Banner */}
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
          Start each morning with deliberate intention. Select today’s essential priorities and make steady, focused progress without overwhelm.
        </p>
      </section>

      {/* Honest Empty State */}
      <section className="placeholder-card" aria-label="Day 1 Status">
        <div className="placeholder-icon-wrap">
          <Sun size={28} aria-hidden="true" />
        </div>
        <h2 className="placeholder-heading">No Tasks Scheduled for Today Yet</h2>
        <p className="placeholder-body">
          You haven't added any tasks to your day. The task management engine and daily planning system are scheduled for integration in Day 2.
        </p>
        <div className="placeholder-status-tag">
          <span className="status-dot"></span>
          <span>Day 1 Status: App shell ready · Task layer arriving in Day 2</span>
        </div>
      </section>

      {/* Roadmap Spec Cards (Honest disclosure of planned capabilities, zero fake stats) */}
      <div className="feature-spec-grid">
        <div className="spec-item">
          <div className="spec-title">
            <Target size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Daily Focus Queue</span>
          </div>
          <p className="spec-desc">
            Pick 3 to 5 critical outcomes for today. Real-time status toggles and auto-sort by priority.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <CheckCircle2 size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Quick Task Entry</span>
          </div>
          <p className="spec-desc">
            Instantly capture tasks with validated titles (1-160 chars), categories, and due dates.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <Calendar size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Daily Rollover</span>
          </div>
          <p className="spec-desc">
            Incomplete tasks gently stay visible or reschedule with zero friction when midnight rolls over.
          </p>
        </div>
      </div>
    </div>
  );
};
