import type { FC } from 'react';
import { CheckSquare, Filter, Plus, Tag } from 'lucide-react';

export const TasksPage: FC = () => {
  return (
    <div className="page-container placeholder-view">
      <section className="hero-card" aria-labelledby="tasks-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
          <CheckSquare size={20} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Task Organizer
          </span>
        </div>
        <h1 id="tasks-heading" className="hero-title">
          All Tasks
        </h1>
        <p className="hero-subtitle">
          Manage your master inventory of responsibilities across Study, Work, Personal, and Projects with clear priorities and due dates.
        </p>
      </section>

      <section className="placeholder-card" aria-label="Tasks Coming Soon">
        <div className="placeholder-icon-wrap">
          <CheckSquare size={28} aria-hidden="true" />
        </div>
        <h2 className="placeholder-heading">Task Management Pipeline</h2>
        <p className="placeholder-body">
          Complete task CRUD, validation rules, category filters, and sorting controls will be connected during Day 2 implementation.
        </p>
        <div className="placeholder-status-tag">
          <span className="status-dot"></span>
          <span>Day 2 Target: Validation, categorization, and local state layer</span>
        </div>
      </section>

      <div className="feature-spec-grid">
        <div className="spec-item">
          <div className="spec-title">
            <Plus size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Structured Input</span>
          </div>
          <p className="spec-desc">
            Title (max 160 chars), optional description (max 2000 chars), priority badge, and category selector.
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <Filter size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>Multi-Filter Views</span>
          </div>
          <p className="spec-desc">
            Filter smoothly by category (Study, Work, Personal, Projects) and status (Pending, Completed).
          </p>
        </div>

        <div className="spec-item">
          <div className="spec-title">
            <Tag size={18} color="var(--color-primary)" aria-hidden="true" />
            <span>4-Tier Categories</span>
          </div>
          <p className="spec-desc">
            Dedicated color accents and tags for clear visual distinction without cognitive clutter.
          </p>
        </div>
      </div>
    </div>
  );
};
