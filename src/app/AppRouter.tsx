import { createContext, useContext, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { MyDayPage } from '../features/my-day/MyDayPage';
import { TasksPage } from '../features/tasks/TasksPage';
import { CalendarPage } from '../features/calendar/CalendarPage';
import { FocusPage } from '../features/focus/FocusPage';
import { ProgressPage } from '../features/progress/ProgressPage';

export type AppRoute = '/' | '/tasks' | '/calendar' | '/focus' | '/progress';

export interface RouteMeta {
  route: AppRoute;
  label: string;
  iconName: 'Sun' | 'CheckSquare' | 'Calendar' | 'Clock' | 'BarChart3';
  description: string;
}

export const NAV_ITEMS: RouteMeta[] = [
  {
    route: '/',
    label: 'My Day',
    iconName: 'Sun',
    description: 'Daily priorities and today focus',
  },
  {
    route: '/tasks',
    label: 'Tasks',
    iconName: 'CheckSquare',
    description: 'Master task inventory and filters',
  },
  {
    route: '/calendar',
    label: 'Calendar',
    iconName: 'Calendar',
    description: 'Monthly, weekly, and daily timeline',
  },
  {
    route: '/focus',
    label: 'Focus',
    iconName: 'Clock',
    description: 'Deliberate work sessions and timer',
  },
  {
    route: '/progress',
    label: 'Progress',
    iconName: 'BarChart3',
    description: 'Completion metrics and momentum',
  },
];

interface NavigationContextType {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentRoute: '/',
  navigate: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

const parseRouteFromLocation = (): AppRoute => {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === '/tasks' || hash === 'tasks') return '/tasks';
  if (hash === '/calendar' || hash === 'calendar') return '/calendar';
  if (hash === '/focus' || hash === 'focus') return '/focus';
  if (hash === '/progress' || hash === 'progress') return '/progress';
  if (hash === '/' || hash === '') {
    const path = window.location.pathname;
    if (path === '/tasks') return '/tasks';
    if (path === '/calendar') return '/calendar';
    if (path === '/focus') return '/focus';
    if (path === '/progress') return '/progress';
    return '/';
  }
  return '/';
};

export const NavigationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(parseRouteFromLocation());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRouteFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (route: AppRoute) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const AppRouter: FC = () => {
  const { currentRoute } = useNavigation();

  switch (currentRoute) {
    case '/':
      return <MyDayPage />;
    case '/tasks':
      return <TasksPage />;
    case '/calendar':
      return <CalendarPage />;
    case '/focus':
      return <FocusPage />;
    case '/progress':
      return <ProgressPage />;
    default:
      return <MyDayPage />;
  }
};
