import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { Logo, AccentBar } from '../brand';
import { Button } from '../ui';
import { useApp } from '../../services/store';
import { cn } from '../../lib/utils';

/**
 * Layout for public pages. Section links use `/?s=<id>` (HashRouter-safe);
 * the layout scrolls to the element with that id after navigation.
 */
const NAV = [
  { to: '/?s=how', label: 'How it works' },
  { to: '/?s=features', label: 'Platform' },
  { to: '/for-employers', label: 'For Employers' },
  { to: '/verify', label: 'Verify a certificate' },
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

export function PublicHeader() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const home = user ? (user.role === 'employer' ? '/employer' : '/app') : null;
  return (
    <header className={cn('sticky top-0 z-50 transition-all', scrolled ? 'border-b border-slate-200/70 bg-white/85 backdrop-blur-xl' : 'bg-transparent')}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.label} to={n.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink-950">
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {home ? (
            <Button to={home} size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button to="/demo" variant="ghost" size="sm" icon={<Sparkles className="h-4 w-4 text-gold-500" />}>
                Try a demo
              </Button>
              <Button to="/login" variant="outline" size="sm">
                Sign in
              </Button>
              <Button to="/login?role=employee&mode=signup" size="sm">
                Check My AI Readiness
              </Button>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-4 pb-6 pt-3 shadow-lg lg:hidden">
          <nav className="flex flex-col">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} className="rounded-lg px-3 py-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-50">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid gap-2">
            {home ? (
              <Button to={home} full>
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button to="/login?role=employee&mode=signup" full>
                  Check My AI Readiness
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button to="/login" variant="outline" full>
                    Sign in
                  </Button>
                  <Button to="/demo" variant="secondary" full>
                    Try a demo
                  </Button>
                </div>
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
    <footer className="relative bg-ink-950 text-slate-400">
      <AccentBar className="rounded-none" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Prepare for the Future of Work. Discover where you stand, learn what matters, and become AI Ready in your profession.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-300" /> Personalised by Google Gemini
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Employees</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/login?role=employee&mode=signup">AI readiness assessment</Link></li>
            <li><Link className="hover:text-white" to="/?s=features">Personalised learning</Link></li>
            <li><Link className="hover:text-white" to="/?s=how">Certification</Link></li>
            <li><Link className="hover:text-white" to="/verify">Verify a certificate</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Organisations</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/for-employers">Workforce intelligence</Link></li>
            <li><Link className="hover:text-white" to="/login?role=employer&mode=signup">Employer sign-up</Link></li>
            <li><Link className="hover:text-white" to="/demo">Interactive demo</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs sm:px-6 md:flex-row md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} ZimAI Ready · Prototype for demonstration purposes.</p>
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
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
