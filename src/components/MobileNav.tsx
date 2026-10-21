import type { FC } from 'react';
import { Sun, CheckSquare, Calendar, Clock, BarChart3 } from 'lucide-react';
import { NAV_ITEMS, useNavigation } from '../app/AppRouter';
import type { AppRoute } from '../app/AppRouter';

export const MobileNav: FC = () => {
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
    <nav className="mobile-nav" aria-label="Mobile bottom navigation">
      <ul className="mobile-nav-list">
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <li key={item.route} className="mobile-nav-item">
              <button
                type="button"
                onClick={() => navigate(item.route as AppRoute)}
                className={`mobile-nav-button ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label} page`}
              >
                {renderIcon(item.iconName, 'mobile-nav-icon')}
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
