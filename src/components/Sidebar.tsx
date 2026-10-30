import type { FC } from 'react';
import { Sun, CheckSquare, Calendar, Clock, BarChart3, Shield, User as UserIcon, LogOut } from 'lucide-react';
import { NAV_ITEMS, useNavigation } from '../app/AppRouter';
import type { AppRoute } from '../app/AppRouter';
import { useAuth } from '../features/auth/AuthProvider';

export const Sidebar: FC = () => {
  const { currentRoute, navigate } = useNavigation();
  const { user, signOut, isDemoMode } = useAuth();

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

      {/* User Profile & Footer Callout */}
      <div className="sidebar-footer">
        {user?.email && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'var(--color-bg-subtle)',
              border: '1px solid rgba(27,67,50,0.1)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <UserIcon size={14} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={user.email}
                >
                  {user.email}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  {isDemoMode ? 'Offline Demo' : 'Cloud Synchronized'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void signOut()}
              title="Sign out"
              aria-label="Sign out"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                padding: '4px',
                borderRadius: '6px',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        <p className="sidebar-footer-quote">
          “The turtle moves forward with calm intention, never hurried, always arriving.”
        </p>
        <div className="sidebar-footer-meta">
          <span>Day 4 · Supabase Auth</span>
          <span>v0.4.0</span>
        </div>
      </div>
    </aside>
  );
};
