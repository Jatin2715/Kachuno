import type { FC, ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { useNavigation, NAV_ITEMS } from './AppRouter';
import { Shield, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';

export const AppShell: FC<{ children: ReactNode }> = ({ children }) => {
  const { currentRoute } = useNavigation();
  const { user, signOut, isDemoMode } = useAuth();
  const currentItem = NAV_ITEMS.find((item) => item.route === currentRoute) || NAV_ITEMS[0];

  return (
    <div className="app-shell">
      {/* Desktop Sidebar (>= 768px) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="app-header">
          {/* Mobile brand insignia (< 768px) */}
          <div className="header-mobile-brand">
            <div className="brand-icon-wrapper" style={{ width: 34, height: 34 }}>
              <Shield size={18} strokeWidth={2.2} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>
              Kachuno
            </span>
          </div>

          {/* Current Page Title */}
          <div className="header-title-section">
            <span className="header-page-title">{currentItem.label}</span>
          </div>

          {/* Status & User Actions */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isDemoMode ? (
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: '#92400e',
                  background: '#fef3c7',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid #fde68a',
                }}
              >
                Offline / Demo
              </span>
            ) : (
              <span className="header-badge">Day 4: Cloud Sync</span>
            )}

            {user?.email && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={`Signed in as ${user.email}`}
              >
                <UserIcon size={14} />
                <span>{user.email}</span>
              </span>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                try {
                  await signOut();
                } catch (error) {
                  console.error('Failed to sign out:', error);
                }
              }}
              style={{ fontSize: 'var(--font-size-xs)', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label="Sign out"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileNav />
    </div>
  );
};
