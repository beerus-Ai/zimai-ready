import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award, BadgeCheck, Bot, ChevronDown, ClipboardCheck, Gauge, Layers, LayoutDashboard, LogOut, Map, Menu, Radar,
  RefreshCw, Route, Settings, Sparkles, Target, Users, X, MoreHorizontal, FlaskConical,
} from 'lucide-react';
import { Logo } from '../brand';
import { Avatar, Badge } from '../ui';
import { useApp } from '../../services/store';
import { useAIStatus } from '../../services/gemini';
import { cn } from '../../lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const EMPLOYEE_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Readiness',
    items: [
      { to: '/app', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" />, end: true },
      { to: '/app/readiness', label: 'AI Readiness', icon: <Gauge className="h-[18px] w-[18px]" /> },
      { to: '/app/career', label: 'Career Path', icon: <Route className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    group: 'Learn',
    items: [
      { to: '/app/learning', label: 'My Learning Path', icon: <Map className="h-[18px] w-[18px]" /> },
      { to: '/app/skills', label: 'Skills', icon: <Layers className="h-[18px] w-[18px]" /> },
      { to: '/app/tutor', label: 'AI Tutor', icon: <Bot className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    group: 'Certify',
    items: [
      { to: '/app/assessments', label: 'Assessments', icon: <ClipboardCheck className="h-[18px] w-[18px]" /> },
      { to: '/app/certificates', label: 'Certificates', icon: <Award className="h-[18px] w-[18px]" /> },
      { to: '/app/profile', label: 'Skills Profile', icon: <BadgeCheck className="h-[18px] w-[18px]" /> },
      { to: '/app/maintain', label: 'Maintain Readiness', icon: <RefreshCw className="h-[18px] w-[18px]" /> },
    ],
  },
];

const EMPLOYER_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Workforce intelligence',
    items: [
      { to: '/employer', label: 'Overview', icon: <LayoutDashboard className="h-[18px] w-[18px]" />, end: true },
      { to: '/employer/workforce', label: 'Employees', icon: <Users className="h-[18px] w-[18px]" /> },
      { to: '/employer/skills', label: 'Skills Gap', icon: <Radar className="h-[18px] w-[18px]" /> },
      { to: '/employer/advisor', label: 'AI Workforce Advisor', icon: <Sparkles className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    group: 'Organisation',
    items: [
      { to: '/employer/maturity', label: 'AI Maturity', icon: <Gauge className="h-[18px] w-[18px]" /> },
      { to: '/employer/competencies', label: 'Required Competencies', icon: <Target className="h-[18px] w-[18px]" /> },
      { to: '/employer/certification', label: 'Certification', icon: <Award className="h-[18px] w-[18px]" /> },
    ],
  },
];

const EMPLOYEE_TABS: NavItem[] = [
  { to: '/app', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
  { to: '/app/readiness', label: 'Readiness', icon: <Gauge className="h-5 w-5" /> },
  { to: '/app/learning', label: 'Learn', icon: <Map className="h-5 w-5" /> },
  { to: '/app/tutor', label: 'Tutor', icon: <Bot className="h-5 w-5" /> },
];
const EMPLOYER_TABS: NavItem[] = [
  { to: '/employer', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
  { to: '/employer/workforce', label: 'Employees', icon: <Users className="h-5 w-5" /> },
  { to: '/employer/skills', label: 'Skills', icon: <Radar className="h-5 w-5" /> },
  { to: '/employer/advisor', label: 'Advisor', icon: <Sparkles className="h-5 w-5" /> },
];

export function AIStatusPill({ className }: { className?: string }) {
  const status = useAIStatus();
  const { user } = useApp();
  const settingsPath = user?.role === 'employer' ? '/employer/settings' : '/app/settings';
  const meta = {
    ready: { dot: 'bg-brand-500', label: 'Gemini ready' },
    connected: { dot: 'bg-brand-500', label: 'Gemini connected' },
    degraded: { dot: 'bg-gold-500', label: 'Gemini limited' },
    offline: { dot: 'bg-ink-400', label: 'Offline AI engine' },
  }[status];
  return (
    <Link
      to={settingsPath}
      title="AI engine status — open settings"
      className={cn('inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-paper px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-950/30 hover:bg-lilac-50', className)}
    >
      <span className="relative flex h-2 w-2">
        {status === 'connected' && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', meta.dot)} />}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', meta.dot)} />
      </span>
      {meta.label}
    </Link>
  );
}

function SideNav({ groups, onNavigate }: { groups: { group: string; items: NavItem[] }[]; onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      {groups.map((g) => (
        <div key={g.group}>
          <p className="mb-2 px-3 font-display text-[15px] italic text-ink-400">{g.group}</p>
          <div className="space-y-0.5">
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[14px] font-semibold transition-all duration-300',
                    isActive ? 'border-ink-950 bg-lilac-200 text-ink-950 shadow-ink-sm' : 'border-transparent text-ink-600 hover:translate-x-0.5 hover:bg-sand-200/60 hover:text-ink-950',
                  )
                }
              >
                {it.icon}
                {it.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserMenu({ compact }: { compact?: boolean }) {
  const { user, signOut, organisation } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const base = user?.role === 'employer' ? '/employer' : '/app';
  useEffect(() => {
    const on = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', on);
    return () => document.removeEventListener('mousedown', on);
  }, []);
  if (!user) return null;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className={cn('flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-sand-200/60', compact && 'p-1')} aria-haspopup="menu" aria-expanded={open}>
        <Avatar name={user.name} photoURL={user.photoURL} size={compact ? 32 : 36} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink-950">{user.name}</span>
              <span className="block truncate text-xs text-ink-500">{user.role === 'employer' ? organisation?.name ?? 'Employer' : user.email}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </>
        )}
      </button>
      {open && (
        <div role="menu" className={cn('absolute z-50 w-56 animate-ghost-in rounded-2xl border border-ink-950 bg-paper p-1.5 shadow-ink', compact ? 'right-0 top-12' : 'bottom-14 left-0')}>
          <button role="menuitem" onClick={() => { setOpen(false); navigate(`${base}/settings`); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <Settings className="h-4 w-4" /> Settings
          </button>
          {user.isDemo && (
            <button role="menuitem" onClick={() => { setOpen(false); navigate('/demo'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <FlaskConical className="h-4 w-4" /> Switch demo profile
            </button>
          )}
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate('/');
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-clay-700 hover:bg-clay-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ role }: { role: 'employee' | 'employer' }) {
  const { user } = useApp();
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const groups = role === 'employer' ? EMPLOYER_NAV : EMPLOYEE_NAV;
  const tabs = role === 'employer' ? EMPLOYER_TABS : EMPLOYEE_TABS;
  const home = role === 'employer' ? '/employer' : '/app';

  useEffect(() => {
    setDrawer(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-3 left-3 z-40 hidden w-64 flex-col overflow-hidden rounded-3xl border border-ink-950/10 bg-paper shadow-card lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo to={home} />
        </div>
        {user?.isDemo && (
          <div className="mx-4 mb-2">
            <Link to="/demo" className="flex items-center justify-between rounded-xl border border-ink-950/10 bg-gold-100 px-3 py-2 text-xs font-semibold text-ink-900 hover:bg-gold-200">
              <span className="inline-flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5" /> Demo mode
              </span>
              <span className="underline decoration-dotted underline-offset-2">Switch</span>
            </Link>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SideNav groups={groups} />
        </div>
        <div className="border-t border-ink-950/5 p-3">
          <AIStatusPill className="mb-2 w-full justify-center" />
          <UserMenu />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink-950/10 bg-canvas/90 px-4 backdrop-blur-xl lg:hidden">
        <button onClick={() => setDrawer(true)} className="-ml-1 rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <Logo to={home} className="scale-90" />
        <UserMenu compact />
      </header>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs animate-slide-right flex-col rounded-r-3xl bg-paper shadow-2xl">
            <div className="flex h-14 items-center justify-between px-4">
              <Logo to={home} />
              <button onClick={() => setDrawer(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {user?.isDemo && (
              <div className="px-4">
                <Badge tone="gold" icon={<FlaskConical className="h-3 w-3" />}>
                  Demo mode · {user.name}
                </Badge>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SideNav groups={groups} onNavigate={() => setDrawer(false)} />
            </div>
            <div className="border-t border-ink-950/5 p-3">
              <AIStatusPill className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-[17rem]">
        <div className="hidden h-14 items-center justify-end gap-3 px-8 lg:flex">
          <AIStatusPill />
        </div>
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-ink-950/15 bg-canvas/95 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur-xl lg:hidden">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition', isActive ? 'text-ink-950 [&>svg]:rounded-lg [&>svg]:bg-lilac-200 [&>svg]:p-0.5' : 'text-ink-500')}>
            {t.icon}
            {t.label}
          </NavLink>
        ))}
        <button onClick={() => setDrawer(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-ink-500">
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>
    </div>
  );
}
