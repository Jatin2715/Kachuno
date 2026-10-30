import type { FC, ReactNode } from 'react';
import { Shield, Database, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { SignInPage } from './SignInPage';
import { SignUpPage } from './SignUpPage';
import { useState } from 'react';

export const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { session, loading, isConfigured, isDemoMode, enableDemoMode } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--color-background)',
          color: 'var(--color-primary)',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={20} className="animate-spin" />
          <span style={{ fontSize: 'var(--font-size-base)' }}>Loading your deliberate workspace…</span>
        </div>
      </div>
    );
  }

  // If Supabase is not configured yet and user hasn't explicitly entered demo mode
  if (!isConfigured && !isDemoMode && !session) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--color-background)',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--color-surface)',
            border: '1px solid rgba(27,67,50,0.14)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-lg)',
            padding: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div className="brand-icon-wrapper" aria-hidden="true" style={{ width: 44, height: 44 }}>
              <Database size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 700 }}>
                Kachuno · Day 4 Backend & Auth
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>
                Connect Supabase Cloud
              </h1>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '20px' }}>
            Kachuno uses <strong>Supabase Auth & PostgreSQL</strong> with Row-Level Security for strict multi-tenant data privacy. To connect your cloud database:
          </p>

          <div
            style={{
              background: 'var(--color-bg-subtle)',
              border: '1px solid rgba(27,67,50,0.1)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: 'var(--font-size-xs)',
              lineHeight: 1.7,
              marginBottom: '24px',
              color: 'var(--color-text-primary)',
            }}
          >
            <strong>Quick Setup:</strong>
            <ol style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
              <li>Create or open your project at <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>supabase.com</a>.</li>
              <li>Copy <code>.env.example</code> to <code>.env.local</code> in the project root.</li>
              <li>Paste your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</li>
              <li>Run the SQL migration in <code>supabase/schema.sql</code> in the Supabase SQL editor.</li>
              <li>Restart the dev server (<code>npm run dev</code>).</li>
            </ol>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={enableDemoMode}
              style={{ justifyContent: 'center', width: '100%', padding: '12px' }}
            >
              <Sparkles size={16} />
              <span>Continue in Offline / Demo Mode</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (mode === 'signin') {
                  setMode('signup');
                } else {
                  setMode('signin');
                }
              }}
              style={{ justifyContent: 'center', width: '100%', padding: '10px' }}
            >
              <span>{mode === 'signin' ? 'View Sign In Form' : 'View Sign Up Form'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    if (mode === 'signin') {
      return (
        <SignInPage
          onSwitchToSignUp={() => setMode('signup')}
          onContinueDemo={!isConfigured ? enableDemoMode : undefined}
        />
      );
    }

    return (
      <SignUpPage
        onSwitchToSignIn={() => setMode('signin')}
        onContinueDemo={!isConfigured ? enableDemoMode : undefined}
      />
    );
  }

  return <>{children}</>;
};
