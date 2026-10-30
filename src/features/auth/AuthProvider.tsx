import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FC, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig } from '../../lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  enableDemoMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const formatAuthError = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login') || normalized.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before signing in.';
  }
  if (normalized.includes('email')) {
    return 'Please enter a valid email address.';
  }
  if (normalized.includes('password') && normalized.includes('6')) {
    return 'Password must be at least 6 characters long.';
  }
  if (normalized.includes('already registered') || normalized.includes('user already exists')) {
    return 'An account with this email is already registered. Please sign in instead.';
  }

  return message || 'Authentication failed. Please try again.';
};

const DEMO_USER: User = {
  id: 'local-demo-user',
  app_metadata: {},
  user_metadata: { name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'demo@kachuno.local',
};

const DEMO_SESSION: Session = {
  access_token: 'local-demo-token',
  refresh_token: 'local-demo-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: DEMO_USER,
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('kachuno_demo_mode') === 'true';
  });

  useEffect(() => {
    const client = supabase;
    if (!hasSupabaseConfig || !client) {
      if (isDemoMode) {
        setSession(DEMO_SESSION);
        setUser(DEMO_USER);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
      return;
    }

    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { data, error } = await client.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.error('Unable to restore Supabase session:', error);
          setSession(null);
          setUser(null);
        } else {
          setSession(data.session ?? null);
          setUser(data.session?.user ?? null);
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void restoreSession();

    const { data: authListener } = client.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const enableDemoMode = () => {
    localStorage.setItem('kachuno_demo_mode', 'true');
    setIsDemoMode(true);
    setSession(DEMO_SESSION);
    setUser(DEMO_USER);
  };

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseConfig || !supabase) {
      throw new Error(
        'Supabase is not configured yet. Copy .env.example to .env.local and add your project values.'
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(formatAuthError(error.message));
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!hasSupabaseConfig || !supabase) {
      throw new Error(
        'Supabase is not configured yet. Copy .env.example to .env.local and add your project values.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(formatAuthError(error.message));
    }

    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('kachuno_demo_mode');
      setIsDemoMode(false);
      setSession(null);
      setUser(null);
      return;
    }

    if (!supabase) {
      setSession(null);
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Unable to sign out right now. Please try again.');
    }
    setSession(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      isConfigured: hasSupabaseConfig,
      isDemoMode,
      enableDemoMode,
      signIn,
      signUp,
      signOut,
    }),
    [session, user, loading, isDemoMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
