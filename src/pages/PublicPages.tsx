import { ArrowRight, Check, ShieldCheck, Sparkles, UsersRound, AlertCircle, Mail, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { useDemo } from '../state';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function LandingPage() {
  const { user, role } = useDemo();

  return (
    <main className="public-page landing-page">
      <div className="public-top">
        <BrandMark />
        {user ? (
          <Link
            className="text-link"
            to={role === 'admin' ? '/admin/dashboard' : '/app/dashboard'}
          >
            Go to workspace <ArrowRight size={15} />
          </Link>
        ) : (
          <Link className="text-link" to="/login">
            Log in <ArrowRight size={15} />
          </Link>
        )}
      </div>
      <section className="landing-card">
        <div className="landing-kicker">
          <span className="kicker-dot" /> PEOPLE OPERATIONS WORKSPACE
        </div>
        <h1>
          Onboarding,
          <br />
          <em>made clear.</em>
        </h1>
        <p className="landing-copy">
          Your checklist, the documents you need, and trusted policy guidance—all in one place.
        </p>
        <ul className="feature-list">
          <li>
            <span className="feature-check">
              <Check size={14} />
            </span>
            Know what to do next
          </li>
          <li>
            <span className="feature-check">
              <Check size={14} />
            </span>
            Keep your onboarding documents together
          </li>
          <li>
            <span className="feature-check">
              <Check size={14} />
            </span>
            Find answers with policy sources attached
          </li>
        </ul>
        <Link
          className="button button-primary landing-cta"
          to={user ? (role === 'admin' ? '/admin/dashboard' : '/app/dashboard') : '/login'}
        >
          {user ? 'Open ComplyPilot' : 'Log in to ComplyPilot'} <ArrowRight size={16} />
        </Link>
        <p className="landing-footnote">Enterprise People Operations · Postgres + RLS Enforced</p>
      </section>
      <div className="landing-footer">
        <span>ComplyPilot</span>
        <span>People, policy, and progress in sync.</span>
      </div>
    </main>
  );
}

function BrandMark() {
  return (
    <Link to="/" className="brand-mark" aria-label="ComplyPilot home">
      <span className="brand-word">
        Comply<span>Pilot</span>
      </span>
      <span className="brand-caption">PEOPLE OPERATIONS</span>
    </Link>
  );
}

export function AuthPage({ signup = false }: { signup?: boolean }) {
  const { role } = useDemo();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isConfigured = isSupabaseConfigured();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (!isConfigured) {
        // Fallback demo mode if Supabase env vars not set yet
        setLoading(false);
        navigate(role === 'admin' ? '/admin/dashboard' : '/app/dashboard');
        return;
      }

      if (signup) {
        // Real Supabase Signup: default role is assigned by DB trigger on public.profiles
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || 'New Team Member',
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        // Check if session exists immediately or email confirmation required
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          navigate('/app/dashboard');
        } else {
          setMagicSent(true);
        }
      } else if (useMagicLink) {
        // Real Supabase Magic Link
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        setMagicSent(true);
      } else {
        // Real Supabase Email/Password Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        // Fetch user's role from public.profiles to determine correct landing redirect
        if (data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profileData?.role === 'hr_admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/app/dashboard');
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="public-page auth-page">
      <div className="public-top">
        <BrandMark />
        <Link className="text-link" to="/">
          Back to home
        </Link>
      </div>
      <section className="auth-card">
        <div className="auth-emblem">
          <ShieldCheck size={22} strokeWidth={1.8} />
        </div>
        <div className="eyebrow">{signup ? 'CREATE YOUR ACCOUNT' : 'SECURE SIGN IN'}</div>
        <h1>{signup ? 'Create your account' : 'Welcome back.'}</h1>
        <p className="auth-subtitle">
          {signup
            ? 'Set up your authenticated profile with corporate SSO or password.'
            : 'Sign in to access your onboarding plan or People Operations console.'}
        </p>

        {errorMessage && (
          <div className="inline-error auth-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {magicSent ? (
          <div className="success-notice">
            <span className="success-notice-icon">
              <Check size={16} />
            </span>
            <div>
              <strong>Check your inbox</strong>
              <p>
                We sent a secure sign-in link to <strong>{email}</strong>. Click the link in the
                email to proceed.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {signup && (
              <>
                <label className="field-label" htmlFor="full-name">
                  Full name
                </label>
                <input
                  className="field-input"
                  id="full-name"
                  type="text"
                  placeholder="e.g. Maya Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </>
            )}

            <label className="field-label" htmlFor="work-email">
              Work email
            </label>
            <input
              className="field-input"
              id="work-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            {!useMagicLink && (
              <>
                <label className="field-label" htmlFor="password">
                  {signup ? 'Create password' : 'Password'}
                </label>
                <input
                  className="field-input"
                  id="password"
                  type="password"
                  placeholder={signup ? 'At least 8 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={signup ? 8 : undefined}
                  required
                  autoComplete={signup ? 'new-password' : 'current-password'}
                />
              </>
            )}

            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                'Connecting to Supabase...'
              ) : signup ? (
                <>
                  Create account <ArrowRight size={16} />
                </>
              ) : useMagicLink ? (
                <>
                  <Mail size={15} /> Send magic link
                </>
              ) : (
                <>
                  <KeyRound size={15} /> Sign in
                </>
              )}
            </button>
          </form>
        )}

        {!signup && (
          <button
            className="auth-switch"
            type="button"
            onClick={() => {
              setUseMagicLink((current) => !current);
              setMagicSent(false);
              setErrorMessage('');
            }}
          >
            {useMagicLink ? 'Use password instead' : 'Use a magic link instead'}
          </button>
        )}

        <div className="auth-demo-note">
          <Sparkles size={14} />
          <span>
            Role is securely determined by Postgres RLS on <code>profiles.role</code>.
          </span>
        </div>

        <div className="auth-divider">
          <span />
          or
          <span />
        </div>

        <Link className="text-link auth-signup" to={signup ? '/login' : '/signup'}>
          {signup ? 'Already have an account? Sign in' : "Don't have an account yet? Sign up"}
        </Link>
      </section>

      <div className="auth-side-note">
        <UsersRound size={15} /> Secure workspace protected by Row-Level Security.
      </div>
    </main>
  );
}
