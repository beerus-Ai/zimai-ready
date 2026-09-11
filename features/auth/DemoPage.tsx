import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleCheck,
  CirclePlay,
  ClipboardCheck,
  ExternalLink,
  Info,
  Presentation,
  RotateCcw,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Avatar, Badge, Button, useToast } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { AccentBar, ChevronPattern } from '../../components/brand';
import { useApp } from '../../services/store';
import { DEMO_CERTIFICATE_ID, DEMO_PERSONAS } from '../../data/demo/seed';
import type { DemoKey } from '../../types';
import { cn } from '../../lib/utils';

const PERSONA_ORDER: DemoKey[] = ['employee', 'transition', 'employer'];

const PERSONA_META: Record<DemoKey, { label: string; tone: Tone; accent: string; stats: { label: string; value: string }[]; shows: string[] }> = {
  employee: {
    label: 'Employee journey',
    tone: 'brand',
    accent: 'from-brand-500 to-brand-700',
    stats: [
      { label: 'Workplace AI exposure', value: 'Moderate' },
      { label: 'Personal readiness', value: 'Low' },
    ],
    shows: [
      'Moderate workplace AI exposure with low personal readiness',
      'A personalised AI Skills Prescription in priority order',
      'Learning path with progress already under way',
      'The AI Tutor answering role-specific questions',
      'Reassessment showing measurable improvement',
    ],
  },
  transition: {
    label: 'Career transition',
    tone: 'gold',
    accent: 'from-gold-400 to-clay-500',
    stats: [
      { label: 'Current role', value: 'Accounts Clerk' },
      { label: 'Target role', value: 'Data Analyst' },
    ],
    shows: [
      'Accounts Clerk → Data Analyst role comparison',
      'Transferable skills and missing skills',
      'Career transition readiness score',
      'A step-by-step transition pathway',
    ],
  },
  employer: {
    label: 'Employer view',
    tone: 'sky',
    accent: 'from-sky-500 to-ink-800',
    stats: [
      { label: 'Employees', value: '148' },
      { label: 'Organisation', value: 'Fictional bank' },
    ],
    shows: [
      'A 148-employee fictional bank',
      'Readiness by department',
      'Organisation-wide skills gaps',
      'Employer-defined AI competencies',
      'The AI Workforce Advisor',
    ],
  },
};

type Launch = { key: DemoKey; path: string };

interface ScriptStep {
  title: string;
  persona: string;
  body: ReactNode;
  where: string;
  action?: { label: string; launch?: Launch; to?: string };
}

const SCRIPT: ScriptStep[] = [
  {
    title: 'Landing page',
    persona: 'Public',
    body: 'Open with the problem: professionals don’t know how exposed their role is or what to learn first. Point out the readiness profile in the hero and the continuous readiness loop.',
    where: '/',
    action: { label: 'Open landing page', to: '/' },
  },
  {
    title: 'Employee assessment',
    persona: 'Rutendo',
    body: 'Walk through the 2-minute assessment: industry, role, AI adoption, personal usage, confidence and career goal.',
    where: '/onboarding',
    action: { label: 'Start as Rutendo', launch: { key: 'employee', path: '/onboarding?retake=1' } },
  },
  {
    title: 'Readiness results & AI Skills Prescription',
    persona: 'Rutendo',
    body: 'Show Personal AI Readiness vs Workplace AI Exposure, the priority state, how AI is transforming the role and the prescription with reasons.',
    where: '/app/readiness',
    action: { label: 'Open as Rutendo', launch: { key: 'employee', path: '/app/readiness' } },
  },
  {
    title: 'Learning path, micro-lesson & AI Tutor',
    persona: 'Rutendo',
    body: 'Open the pathway, complete a short lesson with a Gemini-personalised example, then ask the AI Tutor a role-specific question.',
    where: '/app/learning · /app/tutor',
    action: { label: 'Open as Rutendo', launch: { key: 'employee', path: '/app/learning' } },
  },
  {
    title: 'Practical activity with AI feedback',
    persona: 'Rutendo',
    body: 'Submit an answer to a fictional workplace scenario and walk through the rubric-based feedback, strengths and improvements.',
    where: '/app/learning → activity',
    action: { label: 'Open as Rutendo', launch: { key: 'employee', path: '/app/learning' } },
  },
  {
    title: 'Reassessment',
    persona: 'Rutendo',
    body: 'Retake the readiness assessment and explain what drove the improvement since the first assessment.',
    where: '/app/reassess',
    action: { label: 'Open as Rutendo', launch: { key: 'employee', path: '/app/reassess' } },
  },
  {
    title: 'Final assessment, capstone & certificate',
    persona: 'Rutendo',
    body: 'Show the certification rules: knowledge assessment, practical capstone and responsible AI threshold — then the issued certificate.',
    where: '/app/assessments · /app/certificates',
    action: { label: 'Open as Rutendo', launch: { key: 'employee', path: '/app/assessments' } },
  },
  {
    title: 'Verify a certificate',
    persona: 'Public',
    body: (
      <>
        Verify the sample certificate <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-ink-900">{DEMO_CERTIFICATE_ID}</span> as an employer would —
        via its ID or QR code.
      </>
    ),
    where: `/verify/${DEMO_CERTIFICATE_ID}`,
    action: { label: 'Verify certificate', to: `/verify/${DEMO_CERTIFICATE_ID}` },
  },
  {
    title: 'Career transition demo',
    persona: 'Farai',
    body: 'Switch persona to show the Accounts Clerk → Data Analyst comparison, transferable and missing skills, transition readiness and pathway.',
    where: '/app/career',
    action: { label: 'Open as Farai', launch: { key: 'transition', path: '/app/career' } },
  },
  {
    title: 'Employer dashboard, skills gap & AI Workforce Advisor',
    persona: 'Nyasha',
    body: 'Finish with the employer view: department readiness, workforce status split, skills gaps against employer competencies, and a question to the AI Workforce Advisor.',
    where: '/employer · /employer/skills · /employer/advisor',
    action: { label: 'Open as Nyasha', launch: { key: 'employer', path: '/employer' } },
  },
];

export default function DemoPage() {
  const { user, signInDemo } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [launching, setLaunching] = useState<string | null>(null);
  const [scriptOpen, setScriptOpen] = useState(false);

  const launch = async ({ key, path }: Launch, id: string) => {
    setLaunching(id);
    try {
      await signInDemo(key);
      toast.success(`Demo started as ${DEMO_PERSONAS[key].name}`, 'All people and organisations are fictional.');
      navigate(path);
    } catch (e) {
      toast.error('Could not start the demo', e instanceof Error ? e.message : 'Please try again.');
      setLaunching(null);
    }
  };

  const busy = launching !== null;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full bg-brand-300/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-10 h-[360px] w-[360px] rounded-full bg-gold-300/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-800">
            <Presentation className="h-3.5 w-3.5" /> Demonstration mode
          </span>
          <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold tracking-tight text-ink-950 sm:text-5xl" style={{ animationDelay: '80ms' }}>
            See ZimAI Ready in action
          </h1>
          <p className="mx-auto mt-4 max-w-2xl animate-fade-up text-balance text-base leading-relaxed text-slate-500 sm:text-lg" style={{ animationDelay: '160ms' }}>
            Launch a ready-made profile to explore the full journey — assessment, AI Skills Prescription, learning, certification and workforce intelligence — in minutes.
          </p>
          {user && (
            <p className="mx-auto mt-5 inline-flex max-w-full animate-fade-in items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs text-slate-600 shadow-card ring-1 ring-slate-200/80">
              <Info className="h-3.5 w-3.5 shrink-0 text-sky-600" />
              <span className="truncate">
                Signed in as <span className="font-semibold text-ink-950">{user.name}</span> — launching a demo switches profile.
              </span>
            </p>
          )}
        </header>

        {/* Personas */}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PERSONA_ORDER.map((key, i) => {
            const p = DEMO_PERSONAS[key];
            const meta = PERSONA_META[key];
            const home = key === 'employer' ? '/employer' : '/app';
            const isCurrent = user?.demoKey === key;
            return (
              <article
                key={key}
                className="group relative flex animate-fade-up flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <div className={cn('relative h-24 bg-gradient-to-br', meta.accent)}>
                  <ChevronPattern className="text-white" opacity={0.18} />
                  <div className="absolute left-5 top-4 flex items-center gap-2">
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ring-1 ring-inset ring-white/25 backdrop-blur">{meta.label}</span>
                    {isCurrent && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink-950">Current</span>}
                  </div>
                </div>
                <div className="relative flex flex-1 flex-col px-5 pb-6 sm:px-6">
                  <div className="-mt-9 flex items-end gap-3">
                    <span className="rounded-full bg-white p-1 shadow-card">
                      <Avatar name={p.name} size={64} />
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-extrabold tracking-tight text-ink-950">{p.name}</h2>
                  <p className="text-sm font-semibold text-slate-600">{p.title}</p>
                  <div className="mt-3">
                    <Badge tone={meta.tone}>{p.headline}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{p.description}</p>

                  <dl className="mt-4 grid grid-cols-2 gap-2">
                    {meta.stats.map((s) => (
                      <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                        <dt className="text-[11px] font-semibold text-slate-500">{s.label}</dt>
                        <dd className="truncate text-sm font-bold text-ink-950">{s.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">What this demo shows</p>
                  <ul className="mt-2.5 space-y-2">
                    {meta.shows.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-slate-700">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        {s}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto space-y-2 pt-6">
                    <Button
                      full
                      variant={key === 'employer' ? 'dark' : 'primary'}
                      loading={launching === key}
                      disabled={busy && launching !== key}
                      onClick={() => launch({ key, path: home }, key)}
                      icon={launching === key ? undefined : <CirclePlay className="h-4 w-4" />}
                    >
                      {launching === key ? 'Preparing demo…' : 'Launch demo'}
                    </Button>
                    {key === 'employee' && (
                      <Button
                        full
                        variant="outline"
                        loading={launching === 'walkthrough'}
                        disabled={busy && launching !== 'walkthrough'}
                        onClick={() => launch({ key: 'employee', path: '/onboarding?retake=1' }, 'walkthrough')}
                        icon={launching === 'walkthrough' ? undefined : <ClipboardCheck className="h-4 w-4" />}
                      >
                        Walk through the 2-minute assessment
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Start fresh */}
        <section className="mt-6 animate-fade-up rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6" style={{ animationDelay: '480ms' }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-bold text-ink-950">Prefer to start from scratch?</p>
              <p className="mt-0.5 text-sm text-slate-500">Create your own profile and experience the platform with your real role and goals.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button to="/login?role=employee&mode=signup" variant="secondary" icon={<UserPlus className="h-4 w-4" />}>
                Start fresh as a new employee
              </Button>
              <Button to="/login?role=employer&mode=signup" variant="outline" icon={<Building2 className="h-4 w-4" />}>
                Set up a new organisation
              </Button>
            </div>
          </div>
        </section>

        {/* Demo script */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
          <button
            type="button"
            onClick={() => setScriptOpen((o) => !o)}
            aria-expanded={scriptOpen}
            aria-controls="demo-script"
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50/70 sm:px-6"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-white">
                <Presentation className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-base font-bold text-ink-950">Suggested 10-minute demo script</span>
                <span className="block text-sm text-slate-500">A presenter’s running order — each step opens the right persona and screen.</span>
              </span>
            </span>
            <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200', scriptOpen && 'rotate-180')} />
          </button>
          {scriptOpen && (
            <div id="demo-script" className="animate-fade-in border-t border-slate-100 px-5 pb-6 pt-2 sm:px-6">
              <ol className="relative">
                {SCRIPT.map((s, i) => {
                  const id = `step-${i}`;
                  return (
                    <li key={s.title} className="relative flex gap-4 py-4">
                      {i < SCRIPT.length - 1 && <span className="absolute left-[15px] top-12 bottom-0 w-px bg-slate-200" aria-hidden />}
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700 ring-1 ring-inset ring-brand-200">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[15px] font-bold text-ink-950">{s.title}</p>
                              <Badge tone={s.persona === 'Public' ? 'neutral' : s.persona === 'Rutendo' ? 'brand' : s.persona === 'Farai' ? 'gold' : 'sky'}>{s.persona}</Badge>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.body}</p>
                            <p className="mt-1.5 break-all font-mono text-[11px] text-slate-400">{s.where}</p>
                          </div>
                          {s.action && (
                            <div className="shrink-0">
                              {s.action.to ? (
                                <Button to={s.action.to} size="sm" variant="outline" iconRight={<ExternalLink className="h-3.5 w-3.5" />}>
                                  {s.action.label}
                                </Button>
                              ) : s.action.launch ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  loading={launching === id}
                                  disabled={busy && launching !== id}
                                  onClick={() => launch(s.action!.launch!, id)}
                                  iconRight={launching === id ? undefined : <ArrowRight className="h-3.5 w-3.5" />}
                                >
                                  {s.action.label}
                                </Button>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-ink-950">
                  <Sparkles className="h-4 w-4 text-gold-500" /> Presenter tip
                </p>
                <p className="mt-1">
                  Every AI feature works without an API key using the built-in ZimAI engine. With a Gemini key configured, responses are generated live and labelled “Gemini AI”.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Notes */}
        <footer className="mx-auto mt-10 max-w-2xl text-center">
          <AccentBar className="mx-auto mb-5 w-16" />
          <p className="flex items-start justify-center gap-2 text-sm text-slate-500">
            <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Demo data is stored in this browser and can be reset at any time from <span className="font-semibold text-slate-700">Settings</span>. All people and organisations are fictional.
            </span>
          </p>
          <p className="mt-3 text-sm">
            <Link to="/" className="font-semibold text-brand-700 hover:text-brand-800">
              ← Back to home
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
