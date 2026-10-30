import { NavigationProvider, AppRouter } from './app/AppRouter';
import { AppShell } from './app/AppShell';
import { AuthProvider } from './features/auth/AuthProvider';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <NavigationProvider>
          <AppShell>
            <AppRouter />
          </AppShell>
        </NavigationProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
