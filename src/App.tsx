import { NavigationProvider, AppRouter } from './app/AppRouter';
import { AppShell } from './app/AppShell';

export function App() {
  return (
    <NavigationProvider>
      <AppShell>
        <AppRouter />
      </AppShell>
    </NavigationProvider>
  );
}

export default App;
