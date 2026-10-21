import type { FC, ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { useNavigation, NAV_ITEMS } from './AppRouter';
import { Shield } from 'lucide-react';

export const AppShell: FC<{ children: ReactNode }> = ({ children }) => {
  const { currentRoute } = useNavigation();
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

          {/* Status Badge */}
          <div className="header-actions">
            <span className="header-badge">Day 1: Shell</span>
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
