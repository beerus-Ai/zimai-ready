import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ChevronDown,
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
import { GhostText } from '../../components/motion';
import { FarmerPhone, GhostMascot, LaptopWorker, NurseTablet, RocketChart, Sparkle, Squiggle, TeacherBoard, TeamIdeas } from '../../components/illustrations';
import { useApp } from '../../services/store';
import { DEMO_CERTIFICATE_ID, DEMO_PERSONAS } from '../../data/demo/seed';
import type { DemoKey } from '../../types';
import { cn } from '../../lib/utils';

/** Picks a sticker illustration from the persona's role / domain text (visual only). */
function PersonaIllustration({ role, title, className }: { role: string; title: string; className?: string }) {
  const t = title.toLowerCase();
  const props = { className, animated: true };
  if (role === 'employer' || /people officer|chief|director|manager|workforce/.test(t)) return <TeamIdeas {...props} />;
  if (/nurse|health|clinic|medical/.test(t)) return <NurseTablet {...props} />;
  if (/farm|agri|crop/.test(t)) return <FarmerPhone {...props} />;
  if (/teach|educat|school|lectur/.test(t)) return <TeacherBoard {...props} />;
  if (/analyst|data|→|transition/.test(t)) return <RocketChart {...props} />;
  if (/officer|clerk|bank|finance|account|developer|hr\b/.test(t)) return <LaptopWorker {...props} />;
  return <GhostMascot mood="happy" {...props} />;
}

const TILTS = ['lg:-rotate-2', 'lg:rotate-1', 'lg:-rotate-1'];
const MOBILE_TILTS = ['-rotate-1', 'rotate-1', '-rotate-1'];

const PERSONA_ORDER: DemoKey[] = ['employee', 'transition', 'employer'];

const PERSONA_META: Record<DemoKey, { label: string; tone: Tone; accent: string; stats: { label: string; value: string }[]; shows: string[] }> = {
  employee: {
    label: 'Employee journey',
    tone: 'brand',
    accent: 'bg-brand-800',
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
    accent: 'bg-gold-400',
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
    accent: 'bg-lilac-200',
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
        Verify the sample certificate <span className="rounded-md bg-sand-200 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-ink-900">{DEMO_CERTIFICATE_ID}</span> as an employer would —
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
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_72%)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        {/* Header */}
        <header className="relative mx-auto max-w-4xl text-center">
          <div className="pointer-events-none absolute -left-2 top-16 hidden md:block" aria-hidden>
            <Sparkle className="h-10 w-10" color="#ffa946" animated />
          </div>
          <div className="pointer-events-none absolute -right-4 -top-4 hidden md:block" aria-hidden>
            <GhostMascot mood="wave" className="h-24 w-24 animate-ghost-float" animated />
          </div>
          <span className="inline-flex animate-ghost-in items-center gap-2 rounded-full border border-ink-950 bg-gold-400 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-950 shadow-ink-sm">
            <Presentation className="h-3.5 w-3.5" /> Demonstration mode
          </span>
          <h1 className="mt-7 text-balance text-5xl leading-[0.95] text-ink-950 sm:text-7xl lg:text-8xl">
            <span className="sr-only">See ZimAI Ready in action</span>
            <span aria-hidden>
              <GhostText text="See ZimAI Ready" startOnView={false} stagger={80} />{' '}
              <span className="relative inline-block whitespace-nowrap">
                <GhostText text="*in action*" accentClassName="italic text-brand-800" startOnView={false} delay={280} stagger={120} />
                <Squiggle className="absolute -bottom-2 left-0 h-4 w-full sm:-bottom-4 sm:h-5" color="#ff6c4c" animated />
              </span>
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl animate-ghost-in text-balance text-base leading-relaxed text-ink-600 sm:text-lg" style={{ animationDelay: '360ms' }}>
            Pick a persona. Explore in minutes.
          </p>
          {user && (
            <p className="mx-auto mt-6 inline-flex max-w-full animate-ghost-in items-center gap-2 rounded-full border border-ink-950/10 bg-paper px-3.5 py-1.5 text-xs text-ink-600 shadow-card" style={{ animationDelay: '440ms' }}>
              <Info className="h-3.5 w-3.5 shrink-0 text-brand-800" />
              <span className="truncate">
                Signed in as <span className="font-semibold text-ink-950">{user.name}</span> — launching a demo switches profile.
              </span>
            </p>
          )}
        </header>

        {/* Personas — tilted sticker cards */}
        <div className="mt-20 grid gap-10 sm:mt-28 lg:grid-cols-3 lg:gap-8">
          {PERSONA_ORDER.map((key, i) => {
            const p = DEMO_PERSONAS[key];
            const meta = PERSONA_META[key];
            const home = key === 'employer' ? '/employer' : '/app';
            const isCurrent = user?.demoKey === key;
            const dark = key === 'employee';
            return (
              <div key={key} className="animate-ghost-in" style={{ animationDelay: `${260 + i * 140}ms` }}>
                <article
                  className={cn(
                    'group relative flex h-full flex-col rounded-4xl border border-ink-950 bg-paper shadow-ink-sm transition duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:shadow-ink lg:hover:rotate-0',
                    MOBILE_TILTS[i],
                    TILTS[i],
                    'sm:rotate-0',
                  )}
                >
                  {/* Sticker band with illustration */}
                  <div className={cn('relative h-52 overflow-hidden rounded-t-[calc(2rem-1px)] border-b border-ink-950', meta.accent, dark ? 'text-canvas' : 'text-ink-950')}>
                    <div className={cn('pointer-events-none absolute inset-0', dark ? 'bg-grid-dark' : 'bg-grid')} aria-hidden />
                    <span className={cn('pointer-events-none absolute -bottom-4 left-3 select-none font-condensed text-8xl leading-none', dark ? 'text-canvas/10' : 'text-ink-950/10')} aria-hidden>
                      0{i + 1}
                    </span>
                    <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                      <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]', dark ? 'border-canvas/30 bg-canvas/10' : 'border-ink-950/20 bg-paper/60')}>{meta.label}</span>
                      {isCurrent && <span className="rounded-full border border-ink-950 bg-paper px-2.5 py-1 text-[11px] font-bold text-ink-950">Current</span>}
                    </div>
                    <div className="absolute -bottom-2 right-2 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3" aria-hidden>
                      <PersonaIllustration role={p.role} title={p.title} className="h-48 w-48" />
                    </div>
                  </div>

                  <div className="relative flex flex-1 flex-col px-5 pb-6 sm:px-6">
                    <div className="-mt-8 flex items-end gap-3">
                      <span className="rounded-full border border-ink-950 bg-paper p-1">
                        <Avatar name={p.name} size={60} />
                      </span>
                    </div>
                    <h2 className="mt-4 text-4xl leading-[1.02] text-ink-950">{p.name}</h2>
                    <p className="text-sm font-semibold text-ink-600">{p.title}</p>
                    <div className="mt-3">
                      <Badge tone={meta.tone}>{p.headline}</Badge>
                    </div>

                    <dl className="mt-5 grid grid-cols-2 gap-2">
                      {meta.stats.map((s) => (
                        <div key={s.label} className="rounded-2xl bg-sand-200/70 px-3 py-2">
                          <dt className="text-[11px] font-semibold text-ink-500">{s.label}</dt>
                          <dd className="truncate font-display text-lg leading-snug text-ink-950">{s.value}</dd>
                        </div>
                      ))}
                    </dl>


                    <div className="mt-auto space-y-2 pt-6">
                      <Button
                        full
                        size="lg"
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
                          className="h-auto min-h-11 whitespace-normal py-2"
                          loading={launching === 'walkthrough'}
                          disabled={busy && launching !== 'walkthrough'}
                          onClick={() => launch({ key: 'employee', path: '/onboarding?retake=1' }, 'walkthrough')}
                          icon={launching === 'walkthrough' ? undefined : <ClipboardCheck className="h-4 w-4 shrink-0" />}
                        >
                          Walk through the 2-minute assessment
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* Start fresh */}
        <section className="mt-20 animate-ghost-in rounded-4xl border border-dashed border-ink-950/25 bg-paper/70 p-5 sm:p-7" style={{ animationDelay: '700ms' }}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <GhostMascot mood="happy" className="hidden h-14 w-14 shrink-0 sm:block" animated />
              <div>
                <p className="font-display text-2xl leading-tight text-ink-950">
                  Prefer to start <em>from scratch?</em>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button to="/login?role=employee&mode=signup" variant="primary" icon={<UserPlus className="h-4 w-4" />}>
                Start fresh as a new employee
              </Button>
              <Button to="/login?role=employer&mode=signup" variant="outline" icon={<Building2 className="h-4 w-4" />}>
                Set up a new organisation
              </Button>
            </div>
          </div>
        </section>

        {/* Demo script */}
        <section className="mt-6 overflow-hidden rounded-4xl border border-ink-950/10 bg-paper shadow-card">
          <button
            type="button"
            onClick={() => setScriptOpen((o) => !o)}
            aria-expanded={scriptOpen}
            aria-controls="demo-script"
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-sand-200/40 sm:px-7 sm:py-6"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-950 text-canvas">
                <Presentation className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-2xl leading-tight text-ink-950">Suggested 10-minute demo script</span>
                <span className="block text-sm text-ink-500">A presenter’s running order — each step opens the right persona and screen.</span>
              </span>
            </span>
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-950/15 transition-transform duration-300', scriptOpen && 'rotate-180 border-ink-950 bg-lilac-200')}>
              <ChevronDown className="h-5 w-5 text-ink-700" />
            </span>
          </button>
          {scriptOpen && (
            <div id="demo-script" className="animate-ghost-in border-t border-ink-950/10 px-5 pb-6 pt-2 sm:px-7">
              <ol className="relative">
                {SCRIPT.map((s, i) => {
                  const id = `step-${i}`;
                  return (
                    <li key={s.title} className="relative flex gap-4 py-4">
                      {i < SCRIPT.length - 1 && <span className="absolute bottom-0 left-[17px] top-14 w-px border-l border-dashed border-ink-950/20" aria-hidden />}
                      <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-950 bg-lilac-200 font-condensed text-base text-ink-950">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-display text-xl leading-tight text-ink-950">{s.title}</p>
                              <Badge tone={s.persona === 'Public' ? 'neutral' : s.persona === 'Rutendo' ? 'brand' : s.persona === 'Farai' ? 'gold' : 'violet'}>{s.persona}</Badge>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-ink-600">{s.body}</p>
                            <p className="mt-1.5 break-all font-mono text-[11px] text-ink-400">{s.where}</p>
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
              <div className="mt-2 rounded-3xl bg-ink-950 p-5 text-sm text-canvas/80">
                <p className="flex items-center gap-2 font-semibold text-canvas">
                  <Sparkles className="h-4 w-4 text-gold-300" /> Presenter tip
                </p>
                <p className="mt-1">
                  Every AI feature works without an API key using the built-in ZimAI engine. With a Gemini key configured, responses are generated live and labelled “Gemini AI”.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Notes */}
        <footer className="mx-auto mt-14 max-w-2xl text-center">
          <Squiggle className="mx-auto mb-5 h-4 w-24" color="#ff6c4c" animated />
          <p className="flex items-start justify-center gap-2 text-sm text-ink-500">
            <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Demo data is stored in this browser and can be reset at any time from <span className="font-semibold text-ink-700">Settings</span>. All people and organisations are fictional.
            </span>
          </p>
          <p className="mt-4 text-sm">
            <Link to="/" className="font-semibold text-ink-950 underline decoration-clay-400 decoration-2 underline-offset-4 hover:decoration-ink-950">
              ← Back to home
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
