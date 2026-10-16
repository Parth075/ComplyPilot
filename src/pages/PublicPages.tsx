import { ArrowRight, Check, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { useDemo } from '../state';
import type { Role } from '../data';

export function LandingPage() {
  return <main className="public-page landing-page">
    <div className="public-top"><BrandMark /><Link className="text-link" to="/login">Log in <ArrowRight size={15} /></Link></div>
    <section className="landing-card">
      <div className="landing-kicker"><span className="kicker-dot" /> PEOPLE OPERATIONS WORKSPACE</div>
      <h1>Onboarding,<br /><em>made clear.</em></h1>
      <p className="landing-copy">Your checklist, the documents you need, and trusted policy guidance—all in one place.</p>
      <ul className="feature-list">
        <li><span className="feature-check"><Check size={14} /></span>Know what to do next</li>
        <li><span className="feature-check"><Check size={14} /></span>Keep your onboarding documents together</li>
        <li><span className="feature-check"><Check size={14} /></span>Find answers with policy sources attached</li>
      </ul>
      <Link className="button button-primary landing-cta" to="/login">Log in to ComplyPilot <ArrowRight size={16} /></Link>
      <p className="landing-footnote">Internal workspace · Demo environment</p>
    </section>
    <div className="landing-footer"><span>ComplyPilot</span><span>People, policy, and progress in sync.</span></div>
  </main>;
}

function BrandMark() {
  return <Link to="/" className="brand-mark" aria-label="ComplyPilot home"><span className="brand-word">Comply<span>Pilot</span></span><span className="brand-caption">PEOPLE OPERATIONS</span></Link>;
}

export function AuthPage({ signup = false }: { signup?: boolean }) {
  const { setRole } = useDemo();
  const navigate = useNavigate();
  const [roleChoice, setRoleChoice] = useState<Role>('employee');
  const [magicSent, setMagicSent] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (useMagicLink && !signup) {
      setMagicSent(true);
      return;
    }
    setRole(roleChoice);
    navigate(roleChoice === 'admin' ? '/admin/dashboard' : '/app/dashboard');
  }

  return <main className="public-page auth-page">
    <div className="public-top"><BrandMark /><Link className="text-link" to="/">Back to home</Link></div>
    <section className="auth-card">
      <div className="auth-emblem"><ShieldCheck size={22} strokeWidth={1.8} /></div>
      <div className="eyebrow">{signup ? 'CREATE YOUR ACCOUNT' : 'INTERNAL WORKSPACE'}</div>
      <h1>{signup ? 'Start your workspace' : 'Good to have you here.'}</h1>
      <p className="auth-subtitle">{signup ? 'Set up your demo profile to explore ComplyPilot.' : 'Sign in to continue your onboarding or open the HR workspace.'}</p>
      {magicSent ? <div className="success-notice"><span className="success-notice-icon"><Check size={16} /></span><div><strong>Magic link sent</strong><p>Check your inbox to continue. This is a local demo; no email was sent.</p></div></div> : <form onSubmit={submit} className="auth-form">
        <label className="field-label" htmlFor="work-email">Work email</label>
        <input className="field-input" id="work-email" type="email" placeholder="you@example.test" required autoComplete="email" />
        {!useMagicLink && <><label className="field-label" htmlFor="password">{signup ? 'Create password' : 'Password'}</label><input className="field-input" id="password" type="password" placeholder={signup ? 'At least 8 characters' : 'Enter any demo password'} minLength={signup ? 8 : undefined} required autoComplete={signup ? 'new-password' : 'current-password'} /></>}
        <label className="field-label" htmlFor="demo-role">Preview this experience as</label>
        <div className="select-shell"><select id="demo-role" className="field-input" value={roleChoice} onChange={(event) => setRoleChoice(event.target.value as Role)}><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">HR Admin</option></select></div>
        <button className="button button-primary auth-submit" type="submit">{signup ? 'Create demo profile' : useMagicLink ? 'Send magic link' : 'Continue'} <ArrowRight size={16} /></button>
      </form>}
      {!signup && <button className="auth-switch" onClick={() => { setUseMagicLink((current) => !current); setMagicSent(false); }}>{useMagicLink ? 'Use password instead' : 'Use a magic link instead'}</button>}
      <div className="auth-demo-note"><Sparkles size={14} /><span>Demo only. Form values stay in this browser and are not sent to a server.</span></div>
      <div className="auth-divider"><span />or<span /></div>
      <Link className="text-link auth-signup" to={signup ? '/login' : '/signup'}>{signup ? 'Already have an account? Log in' : 'New to ComplyPilot? Create a demo account'}</Link>
    </section>
    <div className="auth-side-note"><UsersRound size={15} /> A shared space for people, policies, and progress.</div>
  </main>;
}
