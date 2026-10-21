import type { FC } from 'react';
import { Sun, CheckSquare, Calendar, Clock, BarChart3, Shield } from 'lucide-react';
import { NAV_ITEMS, useNavigation } from '../app/AppRouter';
import type { AppRoute } from '../app/AppRouter';

export const Sidebar: FC = () => {
  const { currentRoute, navigate } = useNavigation();

  const renderIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={className} size={20} aria-hidden="true" />;
      case 'CheckSquare':
        return <CheckSquare className={className} size={20} aria-hidden="true" />;
      case 'Calendar':
        return <Calendar className={className} size={20} aria-hidden="true" />;
      case 'Clock':
        return <Clock className={className} size={20} aria-hidden="true" />;
      case 'BarChart3':
        return <BarChart3 className={className} size={20} aria-hidden="true" />;
      default:
        return <Sun className={className} size={20} aria-hidden="true" />;
    }
  };

  return (
    <aside className="sidebar" aria-label="Desktop primary navigation">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-icon-wrapper" aria-hidden="true">
          <Shield size={22} strokeWidth={2.2} />
        </div>
        <div className="brand-details">
          <span className="brand-title">Kachuno</span>
          <span className="brand-subtitle">Slow & Deliberate</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav aria-label="Main menu">
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <li key={item.route}>
                <button
                  type="button"
                  onClick={() => navigate(item.route as AppRoute)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${item.label}: ${item.description}`}
                >
                  {renderIcon(item.iconName, 'nav-icon')}
                  <span>{item.label}</span>
                  {isActive && <span className="nav-badge">Active</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Philosophy Callout */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-quote">
          “The turtle moves forward with calm intention, never hurried, always arriving.”
        </p>
        <div className="sidebar-footer-meta">
          <span>Day 1 Build</span>
          <span>v0.1.0</span>
        </div>
      </div>
    </aside>
  );
};
