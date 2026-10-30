import { useState } from 'react';
import type { FormEvent } from 'react';
import { Shield, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface SignUpPageProps {
  onSwitchToSignIn: () => void;
  onContinueDemo?: () => void;
}

export const SignUpPage = ({ onSwitchToSignIn, onContinueDemo }: SignUpPageProps) => {
  const { signUp, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(trimmedEmail, password);
      setSuccess('Account created! Please check your email to confirm your account and sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '420px',
          background: 'var(--color-surface)',
          border: '1px solid rgba(27,67,50,0.12)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          padding: '32px 28px',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div className="brand-icon-wrapper" aria-hidden="true" style={{ width: 44, height: 44 }}>
            <Shield size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                fontWeight: 700,
              }}
            >
              Kachuno
            </div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
              Create Account
            </h1>
          </div>
        </div>

        {/* Warning if env vars are missing */}
        {!isConfigured && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#854d0e',
              background: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '12px',
              padding: '12px',
              fontSize: 'var(--font-size-xs)',
              marginBottom: '16px',
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Supabase not configured:</strong> Add <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to enable cloud sign-up.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '6px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            Password (min. 6 characters)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
          </label>

          {error && (
            <div
              role="alert"
              style={{
                color: '#991b1b',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: 'var(--font-size-xs)',
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                color: 'var(--color-primary)',
                background: 'var(--color-bg-subtle)',
                border: '1px solid rgba(27,67,50,0.2)',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: 'var(--font-size-xs)',
                lineHeight: 1.5,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{success}</div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ justifyContent: 'center', width: '100%', padding: '12px', marginTop: '4px' }}
          >
            <UserPlus size={16} aria-hidden="true" />
            <span>{isSubmitting ? 'Creating account…' : 'Create Account'}</span>
          </button>
        </form>

        {onContinueDemo && (
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onContinueDemo}
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              <Sparkles size={14} />
              <span>Continue in Offline / Demo Mode</span>
            </button>
          </div>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Already have an account?{' '}
          <button
            type="button"
            className="btn-ghost"
            onClick={onSwitchToSignIn}
            style={{ padding: '0 4px', fontWeight: 600, textDecoration: 'underline' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
