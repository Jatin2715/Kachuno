import type { FC } from 'react';
import { BarChart3, TrendingUp, Award, Activity } from 'lucide-react';

export const ProgressPage: FC = () => {
  return (
    <div className="page-container placeholder-view">
      <section className="hero-card" aria-labelledby="progress-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <BarChart3 size={20} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Analytics & Momentum
          </span>
        </div>
        <h1 id="progress-heading" className="hero-title">
          Progress & Metrics
        </h1>
        <p className="hero-subtitle">
          Transparent metrics without artificial gamification. See completion rates, focus minutes, and historical consistency calculated from verified records.
        </p>
      </section>

      <section className="placeholder-card" aria-label="Progress Analytics Coming Soon">
        <div className="placeholder-icon-wrap">
          <BarChart3 size={28} aria-hidden="true" />
        </div>
        <h2 className="placeholder-heading">No Historical Data Recorded Yet</h2>
        <p className="placeholder-body">
          In keeping with Kachuno’s design philosophy, no artificial numbers or mock statistics are displayed. Real mathematical analytics will render once tasks and focus sessions are tracked.
        </p>
        <div className="placeholder-status-tag">
          <span className="status-dot"></span>
          <span>Day 5 Target: Real-data calculation engine & zero-state safety</span>
        </div>
      </section>

      <div className="feature-spec-grid">
        <div className="spec-item">
          <div className="spec-title">
            <TrendingUp size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Completion Rate</span>
          </div>
          <p className="spec-desc">
            Calculated as (Completed Tasks / Total Tasks) × 100 with safe division-by-zero handling.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <Activity size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Focus Minutes Log</span>
          </div>
          <p className="spec-desc">
            Accumulated productive minutes aggregated across days, weeks, and months.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <Award size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Consistency Streak</span>
          </div>
          <p className="spec-desc">
            Recognizes calm, steady daily engagement without punishing genuine rest days.
          </p>
        </div>
      </div>
    </div>
  );
};
