import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, HardDrive, LogOut, Mail, Sparkles, User as UserIcon } from 'lucide-react';
import { Avatar, Button, LoadingState, useToast } from '../../components/ui';
import { Logo } from '../../components/brand';
import { GhostBubbles } from '../../components/motion';
import type { GhostBubble } from '../../components/motion';
import { GhostMascot, Sparkle, Squiggle } from '../../components/illustrations';
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

/* ───────── Decorative panel content (visual only) ───────── */

const img = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

const PANEL: Record<UserRole, { photo: string; alt: string; bubbles: GhostBubble[]; lines: { quote: string }[] }> = {
  employee: {
    photo: 'scene-accountant.webp',
    alt: 'A fictional Zimbabwean accountant working confidently with AI tools',
    bubbles: [
      { name: 'You', text: 'Will AI change my job?', x: '4%', y: '6%', tone: 'dark', nameColor: '#ffa946' },
      { name: 'ZimAI Ready', text: 'Let’s find out.', x: '38%', y: '40%', tone: 'lilac', nameColor: '#fffeeb' },
      { name: 'AI Tutor', text: 'Start here.', x: '8%', y: '72%', tone: 'light', nameColor: '#ffbcf2' },
    ],
    lines: [{ quote: 'Know your exposure.' }, { quote: 'Learn what matters.' }, { quote: 'Get certified.' }],
  },
  employer: {
    photo: 'scene-certified.webp',
    alt: 'A fictional Zimbabwean team celebrating their AI Ready certification',
    bubbles: [
      { name: 'Chief People Officer', text: 'Who’s ready?', x: '4%', y: '6%', tone: 'dark', nameColor: '#ffa946' },
      { name: 'Workforce Advisor', text: 'Here’s where to start.', x: '36%', y: '40%', tone: 'lilac', nameColor: '#fffeeb' },
      { name: 'Head of L&D', text: 'Show me the gaps.', x: '8%', y: '72%', tone: 'light', nameColor: '#ffbcf2' },
    ],
    lines: [{ quote: 'See who’s ready.' }, { quote: 'Find the gaps.' }, { quote: 'Reskill with confidence.' }],
  },
};

function useRotatingIndex(length: number, ms = 4200) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms]);
  return i;
}

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
  const deco = PANEL[role];
  const lineIndex = useRotatingIndex(deco.lines.length);
  const line = deco.lines[lineIndex % deco.lines.length];

  let panel: ReactNode;
  if (!ready) {
    panel = <LoadingState variant="ai" title="Checking your session…" />;
  } else if (user && busy !== 'google' && busy !== 'email') {
    panel = (
      <div className="animate-ghost-in text-center">
        <div className="relative mx-auto w-fit">
          <Avatar name={user.name} photoURL={user.photoURL} size={72} className="mx-auto ring-2 ring-ink-950 ring-offset-4 ring-offset-paper" />
          <GhostMascot mood="wave" className="absolute -right-10 -top-6 h-12 w-12 animate-ghost-float" animated />
        </div>
        <h1 className="mt-6 text-balance text-3xl leading-[1.05] text-ink-950 sm:text-4xl">
          You’re signed in as <em>{user.name}</em>
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {user.email} · {user.role === 'employer' ? 'Employer' : 'Employee'} account{user.isDemo ? ' (demo)' : ''}
        </p>
        <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
          <Button full size="lg" onClick={() => navigate(destinationFor(user, next), { replace: true })} iconRight={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
          <Button full size="lg" variant="outline" loading={busy === 'signout'} onClick={onSignOut} icon={<LogOut className="h-4 w-4" />}>
            Sign out
          </Button>
        </div>
        <p className="mt-5 text-xs text-ink-500">Sign out to switch to a different account or role.</p>
      </div>
    );
  } else {
    panel = (
      <div className="animate-ghost-in">
        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-full border border-ink-950/10 bg-sand-200/70 p-1" role="radiogroup" aria-label="Account type">
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
                'inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac-400',
                role === r.id ? 'bg-ink-950 text-canvas shadow-card' : 'text-ink-600 hover:text-ink-950',
              )}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        <div key={`${mode}-${role}`} className="mt-8 animate-ghost-in">
          <h1 className="text-balance text-4xl leading-[1] text-ink-950 sm:text-5xl">
            {mode === 'signup' ? (
              <>
                Create your <em className="text-brand-800">account</em>
              </>
            ) : (
              <>
                Welcome <em className="text-brand-800">back</em>
              </>
            )}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
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
            <Button
              variant="ghost"
              size="lg"
              full
              className="mt-7 border border-ink-950 bg-paper text-ink-950 hover:-translate-y-px hover:shadow-ink-sm"
              loading={busy === 'google'}
              disabled={!!busy}
              onClick={onGoogle}
              icon={busy === 'google' ? undefined : <GoogleMark />}
            >
              Continue with Google
            </Button>
            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
              <span className="h-px flex-1 bg-ink-950/10" /> or use email <span className="h-px flex-1 bg-ink-950/10" />
            </div>
          </>
        )}

        <form onSubmit={onSubmit} noValidate className={cn('space-y-4', !supportsGoogle && 'mt-7')}>
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
          {mode === 'signin' && <p className="-mt-1 text-xs text-ink-500">Signing in on a new device? Your display name is taken from your email.</p>}
          <Button type="submit" size="lg" full loading={busy === 'email'} disabled={!!busy} variant="primary" iconRight={<ArrowRight className="h-4 w-4" />}>
            {mode === 'signup' ? 'Create account' : 'Sign in with email'}
          </Button>
        </form>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-sand-200/60 px-3.5 py-3 text-xs leading-relaxed text-ink-600">
          <HardDrive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
          <span>
            {supportsGoogle
              ? 'Email accounts keep your data on this device only. Continue with Google to sync securely across devices.'
              : 'Google sign-in isn’t enabled in this version, so your account and progress stay on this device only.'}
          </span>
        </div>

        <p className="mt-6 text-center text-sm text-ink-600">
          {mode === 'signup' ? 'Already have an account?' : 'New to ZimAI Ready?'}{' '}
          <button type="button" onClick={() => setParam('mode', mode === 'signup' ? 'signin' : 'signup')} className="font-semibold text-ink-950 underline decoration-clay-400 decoration-2 underline-offset-4 hover:decoration-ink-950">
            {mode === 'signup' ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        <div className="mt-6 border-t border-ink-950/10 pt-5 text-center">
          <Link to="/demo" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-ink-950">
            <Sparkles className="h-4 w-4 text-gold-500" />
            Explore with a demo profile
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:gap-6">
          {/* Form card */}
          <div className="relative rounded-4xl border border-ink-950/10 bg-paper shadow-lift">
            {/* Mobile decorative header */}
            <div className="relative overflow-hidden rounded-t-4xl bg-brand-800 px-5 py-4 text-canvas lg:hidden">
              <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
              <div className="relative flex items-center gap-3">
                <GhostMascot mood="wave" className="h-12 w-12 shrink-0 animate-ghost-float" animated />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">{role === 'employee' ? 'For employees' : 'For employers'}</p>
                  <p key={`m-${role}-${lineIndex}`} className="animate-ghost-in font-display text-lg leading-snug">
                    {line.quote}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center px-5 py-9 sm:px-10 sm:py-12 lg:min-h-[44rem] lg:py-14">
              <div className="w-full max-w-md">{panel}</div>
            </div>
          </div>

          {/* Visual panel */}
          <aside className="relative hidden min-h-[44rem] overflow-hidden rounded-4xl bg-brand-900 text-canvas lg:flex lg:flex-col">
            <img key={deco.photo} src={img(deco.photo)} alt={deco.alt} className="absolute inset-0 h-full w-full animate-ghost-in object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-brand-950/55 to-ink-950/90" aria-hidden />
            <div className="bg-paper-noise pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" aria-hidden />

            <div className="relative flex flex-1 flex-col p-10 xl:p-12">
              <div className="flex items-center justify-between">
                <Logo light />
                <Sparkle className="h-8 w-8" color="#ffa946" animated />
              </div>

              <div key={role} className="mt-16 animate-ghost-in">
                <h2 className="max-w-lg text-balance text-5xl leading-[0.95] xl:text-6xl">{copy.heading}</h2>
                <Squiggle className="mt-4 h-4 w-36" color="#ff6c4c" animated />
              </div>

              {/* Drifting chat + mascot */}
              <div className="relative my-8 min-h-[12rem] flex-1">
                <GhostBubbles key={`b-${role}`} bubbles={deco.bubbles} mobile />
                <div className="absolute bottom-0 right-0">
                  <GhostMascot mood="wave" className="h-24 w-24 animate-ghost-float xl:h-28 xl:w-28" animated />
                </div>
              </div>

              {/* Rotating benefit line */}
              <div className="flex items-end justify-between gap-6">
                <p key={`${role}-${lineIndex}`} className="animate-ghost-in font-display text-3xl italic leading-tight text-canvas xl:text-4xl">
                  {line.quote}
                </p>
                <span className="mb-2 flex shrink-0 gap-1" aria-hidden>
                  {deco.lines.map((_, i) => (
                    <span key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i === lineIndex ? 'w-5 bg-canvas' : 'w-1.5 bg-canvas/30')} />
                  ))}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function inputCls(invalid: boolean) {
  return cn(
    'h-12 w-full rounded-xl border bg-canvas/60 px-3.5 text-[15px] text-ink-950 placeholder:text-ink-400 transition-colors focus:bg-paper focus:outline-none focus:ring-4',
    invalid ? 'border-clay-400 focus:border-clay-500 focus:ring-clay-100' : 'border-ink-950/15 hover:border-ink-950/30 focus:border-ink-950 focus:ring-lilac-200',
  );
}

function Field({ id, label, error, icon, children }: { id: string; label: string; error?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-800">
        {label}
      </label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>}
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
