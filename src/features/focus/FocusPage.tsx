import type { FC } from 'react';
import { Clock, Play, Pause, RotateCcw, ShieldCheck } from 'lucide-react';

export const FocusPage: FC = () => {
  return (
    <div className="page-container placeholder-view">
      <section className="hero-card" aria-labelledby="focus-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <Clock size={20} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deep Work Timer
          </span>
        </div>
        <h1 id="focus-heading" className="hero-title">
          Focus Session
        </h1>
        <p className="hero-subtitle">
          Deliberate single-task execution inspired by the turtle’s steady pace. Minimize context switching and build enduring attention.
        </p>
      </section>

      <section className="placeholder-card" aria-label="Focus Timer Coming Soon">
        <div className="placeholder-icon-wrap">
          <Clock size={28} aria-hidden="true" />
        </div>
        <h2 className="placeholder-heading">Timestamp-Based Focus Timer</h2>
        <p className="placeholder-body">
          Wall-clock timestamp calculation, sleep/tab-switching resilience, audio alerts, and completed session logging are scheduled for Day 5.
        </p>
        <div className="placeholder-status-tag">
          <span className="status-dot"></span>
          <span>Day 5 Target: Wall-clock timing engine & persistence</span>
        </div>
      </section>

      <div className="feature-spec-grid">
        <div className="spec-item">
          <div className="spec-title">
            <ShieldCheck size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Background Drift Proof</span>
          </div>
          <p className="spec-desc">
            Uses real wall-clock timestamps (`Date.now()`) so timers never drift when devices sleep or tabs hide.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <div style={{ display: 'flex', gap: '4px' }}>
              <Play size={16} />
              <Pause size={16} />
              <RotateCcw size={16} />
            </div>
            <span>Flexible Modes</span>
          </div>
          <p className="spec-desc">
            Preset intervals (25m Pomodoro, 50m Deep Work, custom countdowns) with clean pause/resume controls.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <Clock size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Task Association</span>
          </div>
          <p className="spec-desc">
            Attach any focus session directly to a specific task to record actual time spent vs estimated.
          </p>
        </div>
      </div>
    </div>
  );
};
