import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { Logo } from '../brand';
import { Button } from '../ui';
import { GhostMascot } from '../illustrations';
import { useApp } from '../../services/store';
import { cn } from '../../lib/utils';

/**
 * Layout for public pages. Section links use `/?s=<id>` (HashRouter-safe);
 * the layout scrolls to the element with that id after navigation.
 */
const ML_CODE_URL = 'https://github.com/beerus-Ai/ml-practical-code/releases/download/v1.0/cheeseballs.ipynb';
const EXAM_PREP_URL = 'https://github.com/beerus-Ai/ml-practical-code/releases/download/v1.0/exam-prep.zip';

const NAV = [
  { to: '/?s=how', label: 'How it works' },
  { to: '/?s=features', label: 'Platform' },
  { to: '/for-employers', label: 'For Employers' },
  { to: '/verify', label: 'Verify' },
];

export function useScrollToSection() {
  const { search, pathname } = useLocation();
  useEffect(() => {
    const s = new URLSearchParams(search).get('s');
    if (!s) {
      window.scrollTo({ top: 0 });
      return;
    }
    const t = setTimeout(() => document.getElementById(s)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, [search, pathname]);
}

/** Floating pill navigation (wisprflow.ai style): a cream capsule with a segmented audience switch. */
export function PublicHeader() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const home = user ? (user.role === 'employer' ? '/employer' : '/app') : null;
  const employers = location.pathname.startsWith('/for-employers');

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={cn(
          'pointer-events-auto mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 pl-4 transition-all duration-500 sm:px-4 sm:pl-5',
          scrolled ? 'border-ink-950/15 bg-canvas/90 shadow-lift backdrop-blur-xl' : 'border-ink-950/10 bg-canvas/70 backdrop-blur-md',
        )}
      >
        <div className="flex items-center gap-4">
          <Logo />
          {/* Audience switch */}
          <div className="hidden items-center rounded-xl border border-ink-950/10 bg-sand-300/60 p-1 md:flex" role="tablist" aria-label="Audience">
            <Link to="/" role="tab" aria-selected={!employers} className={cn('rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-300', !employers ? 'bg-canvas text-ink-950 shadow-card ring-1 ring-ink-950/10' : 'text-ink-600 hover:text-ink-950')}>
              Employees
            </Link>
            <Link to="/for-employers" role="tab" aria-selected={employers} className={cn('rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-300', employers ? 'bg-canvas text-ink-950 shadow-card ring-1 ring-ink-950/10' : 'text-ink-600 hover:text-ink-950')}>
              Employers
            </Link>
          </div>
        </div>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.filter((n) => n.to !== '/for-employers').map((n) => (
            <NavLink key={n.label} to={n.to} className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-medium text-ink-600 transition hover:text-ink-950">
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/demo" className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-medium text-ink-600 transition hover:text-ink-950">
            Demo
          </NavLink>
          <a
            href={ML_CODE_URL}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-medium text-ink-600 transition hover:text-ink-950"
          >
            Code
          </a>
          <a
            href={EXAM_PREP_URL}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-medium text-ink-600 transition hover:text-ink-950"
          >
            Exam Prep
          </a>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {home ? (
            <Button to={home} size="md" iconRight={<ArrowRight className="h-4 w-4" />}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="md">
                Sign in
              </Button>
              <Button to="/login?role=employee&mode=signup" size="md">
                Check my AI readiness
              </Button>
            </>
          )}
        </div>

        <button className="rounded-xl border border-ink-950/10 p-2 text-ink-900 hover:bg-ink-950/5 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-6xl animate-ghost-in rounded-2xl border border-ink-950/15 bg-canvas p-4 shadow-lift lg:hidden">
          <nav className="flex flex-col">
            {[...NAV, { to: '/demo', label: 'Interactive demo' }].map((n) => (
              <Link key={n.label} to={n.to} className="flex items-center justify-between rounded-xl px-3 py-3 font-display text-2xl text-ink-900 hover:bg-sand-200/60">
                {n.label}
                <ArrowUpRight className="h-5 w-5 text-ink-400" />
              </Link>
            ))}
            <a
              href={ML_CODE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-3 font-display text-2xl text-ink-900 hover:bg-sand-200/60"
            >
              Code
              <ArrowUpRight className="h-5 w-5 text-ink-400" />
            </a>
            <a
              href={EXAM_PREP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-3 font-display text-2xl text-ink-900 hover:bg-sand-200/60"
            >
              Exam Prep
              <ArrowUpRight className="h-5 w-5 text-ink-400" />
            </a>
          </nav>
          <div className="mt-3 grid gap-2">
            {home ? (
              <Button to={home} full>
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button to="/login?role=employee&mode=signup" full size="lg">
                  Check my AI readiness
                </Button>
                <Button to="/login" variant="outline" full>
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden rounded-t-[2.5rem] bg-ink-950 text-canvas/60 sm:rounded-t-[4rem]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-md font-display text-3xl leading-tight text-canvas sm:text-4xl">
              Prepare for the future of work — <em className="text-gold-300">one skill at a time.</em>
            </p>
            <div className="mt-6 flex items-center gap-3">
              <GhostMascot mood="wave" className="h-14 w-14" />
              <p className="text-sm text-canvas/60">Personalised by Google Gemini.<br />Human oversight, always.</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/40">Employees</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li><Link className="transition hover:text-canvas" to="/login?role=employee&mode=signup">AI readiness assessment</Link></li>
              <li><Link className="transition hover:text-canvas" to="/?s=features">Personalised learning</Link></li>
              <li><Link className="transition hover:text-canvas" to="/?s=how">Certification</Link></li>
              <li><Link className="transition hover:text-canvas" to="/verify">Verify a certificate</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/40">Organisations</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li><Link className="transition hover:text-canvas" to="/for-employers">Workforce intelligence</Link></li>
              <li><Link className="transition hover:text-canvas" to="/login?role=employer&mode=signup">Employer sign-up</Link></li>
              <li><Link className="transition hover:text-canvas" to="/demo">Interactive demo</Link></li>
            </ul>
          </div>
        </div>

        {/* Oversized wordmark */}
        <p className="pointer-events-none mt-16 select-none text-center font-condensed text-[18vw] uppercase leading-[0.8] tracking-tight text-canvas/[0.06] sm:text-[15vw]" aria-hidden>
          ZimAI Ready
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-canvas/10 pt-6 text-xs md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} ZimAI Ready · Prototype for demonstration purposes. ·{' '}
            <a
              className="transition hover:text-canvas"
              href={ML_CODE_URL}
              target="_blank"
              rel="noreferrer"
            >
              Code
            </a>{' · '}
            <a
              className="transition hover:text-canvas"
              href={EXAM_PREP_URL}
              target="_blank"
              rel="noreferrer"
            >
              Exam Prep
            </a>
          </p>
          <p>All organisations, people and scenarios shown are fictional. AI-generated guidance should be verified.</p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  useScrollToSection();
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <PublicHeader />
      <main className="-mt-[76px] flex-1 sm:-mt-20">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
