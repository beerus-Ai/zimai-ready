import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, CircleCheck, HardDrive, LogOut, Mail, Sparkles, User as UserIcon } from 'lucide-react';
import { Avatar, Button, Card, LoadingState, useToast } from '../../components/ui';
import { AccentBar, ChevronPattern, Logo } from '../../components/brand';
import { useApp } from '../../services/store';
import type { User, UserRole } from '../../types';
import { cn } from '../../lib/utils';

type Mode = 'signup' | 'signin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "tendai.moyo92@example.com" → "Tendai Moyo" */
function nameFromEmail(email: string) {
  const prefix = email.split('@')[0] ?? '';
  const words = prefix
    .replace(/\d+/g, ' ')
    .split(/[._\-+\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.join(' ') || 'ZimAI Ready member';
}

/** Where to go after authentication. */
function destinationFor(user: User, next: string | null) {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  if (user.role === 'employer') return user.organisationId ? '/employer' : '/employer/onboarding';
  return '/app';
}

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : typeof e === 'string' ? e : 'Please try again.';
}

function errorCode(e: unknown) {
  const code = (e as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : '';
}

const COPY: Record<UserRole, { heading: string; sub: string; points: string[]; steps: string[] }> = {
  employee: {
    heading: 'Become AI Ready in your profession',
    sub: 'A personalised readiness profile, a clear learning pathway and a certificate employers can verify.',
    points: [
      'See how exposed your role is to AI — and how ready you are',
      'Get an AI Skills Prescription in priority order',
      'Learn with an AI Tutor that knows your job',
      'Earn a verifiable AI Ready certificate',
    ],
    steps: ['2-minute readiness assessment', 'Your readiness profile & prescription', 'Your personalised learning pathway'],
  },
  employer: {
    heading: 'Build an AI-ready workforce',
    sub: 'Workforce intelligence that shows where your organisation stands and where to invest in skills next.',
    points: [
      'Readiness and AI exposure by department',
      'Organisational AI maturity assessment',
      'Employer-defined AI competencies and skills gaps',
      'An AI Workforce Advisor for reskilling decisions',
    ],
    steps: ['Set up your organisation profile', 'See your workforce readiness dashboard', 'Plan reskilling with the AI Workforce Advisor'],
  },
};

export default function LoginPage() {
  const { ready, user, supportsGoogle, signInWithGoogle, signInLocal, signOut } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const role: UserRole = params.get('role') === 'employer' ? 'employer' : 'employee';
  const mode: Mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const next = params.get('next');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState<'google' | 'email' | 'signout' | null>(null);

  const setParam = (key: 'role' | 'mode', value: string) => {
    const p = new URLSearchParams(params);
    p.set(key, value);
    setParams(p, { replace: true });
  };

  const nameError = mode === 'signup' && name.trim().length < 2 ? (name.trim() ? 'Please enter your full name.' : 'Your name is required to create an account.') : '';
  const emailError = !email.trim() ? 'Please enter your work email.' : !EMAIL_RE.test(email.trim()) ? 'That doesn’t look like a valid email address.' : '';
  const showName = (touched.name || submitted) && nameError;
  const showEmail = (touched.email || submitted) && emailError;

  const finish = (u: User) => {
    if (u.role !== role) {
      toast.info(`Signed in to your ${u.role} account`, `This email is already registered as an ${u.role} account.`);
    } else {
      toast.success(mode === 'signup' ? 'Welcome to ZimAI Ready' : `Welcome back, ${u.name.split(' ')[0]}`);
    }
    navigate(destinationFor(u, next), { replace: true });
  };

  const onGoogle = async () => {
    setBusy('google');
    try {
      const u = await signInWithGoogle(role);
      finish(u);
    } catch (e) {
      const code = errorCode(e);
      if (code.includes('popup-closed') || code.includes('cancelled-popup')) toast.info('Google sign-in cancelled', 'You can try again or continue with email.');
      else if (code.includes('popup-blocked')) toast.error('Pop-up blocked', 'Please allow pop-ups for this site, or continue with email.');
      else toast.error('Google sign-in failed', errorMessage(e));
      setBusy(null);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || emailError) return;
    setBusy('email');
    try {
      const cleanEmail = email.trim().toLowerCase();
      const displayName = name.trim() || nameFromEmail(cleanEmail);
      const u = await signInLocal({ name: displayName, email: cleanEmail, role });
      finish(u);
    } catch (err) {
      toast.error('Could not sign you in', errorMessage(err));
      setBusy(null);
    }
  };

  const onSignOut = async () => {
    setBusy('signout');
    try {
      await signOut();
      toast.success('Signed out');
    } catch (err) {
      toast.error('Could not sign out', errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const copy = COPY[role];

  let panel: ReactNode;
  if (!ready) {
    panel = <LoadingState title="Checking your session…" />;
  } else if (user && busy !== 'google' && busy !== 'email') {
    panel = (
      <div className="animate-fade-up text-center">
        <Avatar name={user.name} photoURL={user.photoURL} size={64} className="mx-auto" />
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-950">You’re signed in as {user.name}</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {user.email} · {user.role === 'employer' ? 'Employer' : 'Employee'} account{user.isDemo ? ' (demo)' : ''}
        </p>
        <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
          <Button full onClick={() => navigate(destinationFor(user, next), { replace: true })} iconRight={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
          <Button full variant="outline" loading={busy === 'signout'} onClick={onSignOut} icon={<LogOut className="h-4 w-4" />}>
            Sign out
          </Button>
        </div>
        <p className="mt-5 text-xs text-slate-500">Sign out to switch to a different account or role.</p>
      </div>
    );
  } else {
    panel = (
      <div className="animate-fade-up">
        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1" role="radiogroup" aria-label="Account type">
          {(
            [
              { id: 'employee', label: 'Employee', icon: <UserIcon className="h-4 w-4" /> },
              { id: 'employer', label: 'Employer', icon: <Building2 className="h-4 w-4" /> },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={role === r.id}
              onClick={() => setParam('role', r.id)}
              className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all',
                role === r.id ? 'bg-white text-ink-950 shadow-sm' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-7">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[28px]">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {mode === 'signup'
              ? role === 'employee'
                ? 'Start with a 2-minute AI readiness assessment.'
                : 'Set up your organisation and see your workforce’s AI readiness.'
              : role === 'employee'
                ? 'Sign in to continue your AI readiness journey.'
                : 'Sign in to your workforce intelligence dashboard.'}
          </p>
        </div>

        {supportsGoogle && (
          <>
            <Button variant="outline" size="lg" full className="mt-6" loading={busy === 'google'} disabled={!!busy} onClick={onGoogle} icon={busy === 'google' ? undefined : <GoogleMark />}>
              Continue with Google
            </Button>
            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> or use email <span className="h-px flex-1 bg-slate-200" />
            </div>
          </>
        )}

        <form onSubmit={onSubmit} noValidate className={cn('space-y-4', !supportsGoogle && 'mt-6')}>
          {mode === 'signup' && (
            <Field id="name" label="Full name" error={showName ? nameError : ''}>
              <input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="e.g. Tendai Moyo"
                aria-invalid={!!showName}
                aria-describedby={showName ? 'name-error' : undefined}
                className={inputCls(!!showName)}
              />
            </Field>
          )}
          <Field id="email" label="Work email" error={showEmail ? emailError : ''} icon={<Mail className="h-4 w-4" />}>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@organisation.co.zw"
              aria-invalid={!!showEmail}
              aria-describedby={showEmail ? 'email-error' : undefined}
              className={cn(inputCls(!!showEmail), 'pl-10')}
            />
          </Field>
          {mode === 'signin' && <p className="-mt-1 text-xs text-slate-500">Signing in on a new device? Your display name is taken from your email.</p>}
          <Button type="submit" size="lg" full loading={busy === 'email'} disabled={!!busy} variant={supportsGoogle ? 'dark' : 'primary'} iconRight={<ArrowRight className="h-4 w-4" />}>
            {mode === 'signup' ? 'Create account' : 'Sign in with email'}
          </Button>
        </form>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
          <HardDrive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>
            {supportsGoogle
              ? 'Email accounts keep your data on this device only. Continue with Google to sync securely across devices.'
              : 'Google sign-in isn’t enabled in this version, so your account and progress stay on this device only.'}
          </span>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === 'signup' ? 'Already have an account?' : 'New to ZimAI Ready?'}{' '}
          <button type="button" onClick={() => setParam('mode', mode === 'signup' ? 'signin' : 'signup')} className="font-semibold text-brand-700 hover:text-brand-800">
            {mode === 'signup' ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <Link to="/demo" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-ink-950">
            <Sparkles className="h-4 w-4 text-gold-500" />
            Explore with a demo profile
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-lift lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-ink-950 p-10 text-white lg:flex lg:flex-col xl:p-12">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark" aria-hidden />
          <ChevronPattern className="text-white" opacity={0.04} />
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" aria-hidden />
          <div className="relative flex flex-1 flex-col">
            <Logo light />
            <div key={role} className="mt-14 animate-fade-up">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-300">{role === 'employee' ? 'For employees' : 'For employers'}</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">{copy.heading}</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">{copy.sub}</p>
              <ul className="mt-8 space-y-3">
                {copy.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-slate-200">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">What happens next</p>
                <ol className="mt-3 space-y-3">
                  {copy.steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm text-slate-200">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300 ring-1 ring-inset ring-brand-400/30">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="mt-auto pt-10">
              <AccentBar className="w-20" />
              <p className="mt-3 text-xs text-slate-500">Prepare for the Future of Work.</p>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-14">
          <div className="w-full max-w-md">{panel}</div>
        </div>
      </div>
    </div>
  );
}

function inputCls(invalid: boolean) {
  return cn(
    'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink-950 placeholder:text-slate-400 transition focus:outline-none focus:ring-4',
    invalid ? 'border-clay-400 focus:border-clay-500 focus:ring-clay-100' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100',
  );
}

function Field({ id, label, error, icon, children }: { id: string; label: string; error?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 animate-fade-in text-[13px] font-medium text-clay-600">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
