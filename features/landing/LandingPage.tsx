import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowRight,
  Award,
  BadgeCheck,
  Bot,
  Briefcase,
  Building2,
  CircleCheck,
  ClipboardCheck,
  Compass,
  Eye,
  Gauge,
  GraduationCap,
  Layers,
  ListOrdered,
  Lock,
  Radar,
  Repeat,
  Route,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { Button, Icon } from '../../components/ui';
import { AccentBar, ChevronPattern } from '../../components/brand';
import { DOMAINS, getModule, moduleTitle } from '../../data/catalog';
import type { Domain } from '../../data/catalog';
import { INDUSTRIES } from '../../data/industries';
import { DEMO_CERTIFICATE_ID } from '../../data/demo/seed';
import { cn } from '../../lib/utils';
import HeroMockup from './HeroMockup';
import { Reveal, SectionHeading, useInView } from './Reveal';

/* ───────────────────────────── Content ───────────────────────────── */

const QUESTIONS = [
  { icon: Gauge, q: 'How exposed is my role to AI?', a: 'Workplace AI Exposure score', tone: 'gold' },
  { icon: UserCheck, q: 'Am I prepared?', a: 'Personal AI Readiness score', tone: 'brand' },
  { icon: Layers, q: 'Which AI skills matter in my profession?', a: 'Domain-specific skills map', tone: 'sky' },
  { icon: ListOrdered, q: 'What should I learn first?', a: 'AI Skills Prescription, in priority order', tone: 'violet' },
  { icon: ArrowLeftRight, q: 'Should I upskill or reskill?', a: 'Career transition analysis', tone: 'clay' },
  { icon: BadgeCheck, q: "How do I prove I'm AI-ready?", a: 'Verifiable AI Ready certification', tone: 'brand' },
] as const;

const TONE_TILE: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-700',
  gold: 'bg-gold-50 text-gold-700',
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
  clay: 'bg-clay-50 text-clay-600',
};

const STEPS = [
  { icon: ClipboardCheck, title: 'Assess', body: 'A 2-minute assessment of your role, sector, AI usage and confidence.' },
  { icon: ScanSearch, title: 'Discover your gaps', body: 'See your readiness, your role’s AI exposure and a personalised AI Skills Prescription.' },
  { icon: Route, title: 'Follow your pathway', body: 'Short micro-lessons tailored to your profession, with an AI Tutor on hand.' },
  { icon: Wrench, title: 'Practise', body: 'Work through realistic workplace scenarios and get rubric-based AI feedback.' },
  { icon: Award, title: 'Get certified', body: 'Pass a knowledge assessment and practical capstone to earn a verifiable certificate.' },
];

const LOOP = ['Assess', 'Analyse', 'Recommend', 'Learn', 'Practise', 'Assess', 'Certify', 'Continuously upskill'];

const GEMINI_STEPS = [
  { stage: 'Assess', does: 'Interprets your answers against your role and sector' },
  { stage: 'Analyse', does: 'Explains how AI is changing the tasks in your job' },
  { stage: 'Recommend', does: 'Prescribes modules in priority order, with reasons' },
  { stage: 'Learn', does: 'Personalises every example to your profession' },
  { stage: 'Practise', does: 'Evaluates your work against a transparent rubric' },
  { stage: 'Certify', does: 'Scores your capstone as evidence of capability' },
];

const DEPARTMENTS = [
  { name: 'Marketing', value: 84 },
  { name: 'Finance', value: 72 },
  { name: 'HR', value: 61 },
  { name: 'Operations', value: 39 },
];

const AUDIENCES = [
  { icon: Users, title: 'Employees', body: 'Understand how AI affects your role, close the right skills gaps and prove your capability.' },
  { icon: Building2, title: 'Employers', body: 'See workforce readiness by department and target reskilling where it matters most.' },
  { icon: GraduationCap, title: 'Universities', body: 'Prepare graduates for AI-augmented roles with domain pathways and verifiable credentials.' },
  { icon: Briefcase, title: 'Corporate training', body: 'Replace generic courses with role-specific pathways and measurable readiness gains.' },
];

const RESPONSIBLE = [
  { icon: Lock, title: 'Privacy first', body: 'Learners are coached never to share confidential data. Employers see minimal readiness data only.' },
  { icon: Eye, title: 'Verify before you trust', body: 'Every AI output is labelled, and verification is a core, assessed skill.' },
  { icon: UserCheck, title: 'Human oversight', body: 'AI supports decisions — people stay accountable for them.' },
  { icon: ShieldCheck, title: 'Verifiable & renewable', body: 'Certificates can be checked publicly and are renewed annually as AI evolves.' },
];

const levelColour = (v: number) => (v >= 70 ? 'bg-brand-500' : v >= 50 ? 'bg-gold-400' : 'bg-clay-500');

/* ───────────────────────────── Page ───────────────────────────── */

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <WhySection />
      <HowSection />
      <PlatformSection />
      <EmployersSection />
      <AudienceSection />
      <ResponsibleSection />
      <SectorsStrip />
      <FinalCta />
    </div>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero() {
  return (
    <section className="relative -mt-16 overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden />
      <ChevronPattern className="text-brand-700 [mask-image:linear-gradient(to_bottom,transparent,black_60%,transparent)]" opacity={0.06} />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-300/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-gold-300/25 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="text-center lg:text-left">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 py-1 pl-1 pr-3.5 text-xs font-semibold text-slate-700 shadow-card backdrop-blur">
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">ZimAI Ready</span>
              AI workforce readiness · reskilling · certification
            </span>
          </div>
          <h1 className="mt-6 animate-fade-up text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl" style={{ animationDelay: '80ms' }}>
            Prepare for the <span className="shimmer-text">Future of Work.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl animate-fade-up text-balance text-lg leading-relaxed text-slate-600 sm:text-xl lg:mx-0" style={{ animationDelay: '160ms' }}>
            Discover where you stand, learn what matters, and become AI Ready in your profession.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start" style={{ animationDelay: '240ms' }}>
            <Button to="/login?role=employee&mode=signup" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
              Check My AI Readiness
            </Button>
            <Button to="/for-employers" size="lg" variant="outline" icon={<Building2 className="h-5 w-5 text-brand-600" />}>
              For Employers
            </Button>
          </div>
          <div className="mt-5 animate-fade-up" style={{ animationDelay: '320ms' }}>
            <Link to="/demo" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
              <Sparkles className="h-4 w-4 text-gold-500" />
              Try the interactive demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="mt-10 flex animate-fade-up flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 lg:justify-start" style={{ animationDelay: '400ms' }}>
            {['2-minute assessment', `${DOMAINS.length} professional domains`, 'Verifiable certificates'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CircleCheck className="h-4 w-4 text-brand-600" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up px-2 sm:px-8 lg:px-0" style={{ animationDelay: '200ms' }}>
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Why ───────────────────────────── */

function WhySection() {
  return (
    <section className="relative border-t border-slate-200/70 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why AI readiness matters"
          title="Everyone is told to “learn AI”. Few know where to start."
          description="AI is already reshaping everyday tasks in finance, HR, customer service and beyond. Most professionals are left with questions nobody has answered for them — ZimAI Ready answers each one with evidence."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUESTIONS.map((item, i) => (
            <Reveal key={item.q} delay={i * 70}>
              <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', TONE_TILE[item.tone])}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-lg font-bold leading-snug tracking-tight text-ink-950">{item.q}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-dashed border-slate-200 pt-4 text-sm text-slate-500">
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5" />
                  <span>
                    Answered by your <span className="font-semibold text-ink-900">{item.a}</span>
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── How it works ───────────────────────────── */

function HowSection() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % LOOP.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="how" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From “Where do I stand?” to certified in five steps"
          description="A guided, personalised journey — not a course catalogue. Every step builds on what the platform has learned about you."
        />

        <div role="list" aria-label="How ZimAI Ready works" className="relative mt-14 grid gap-4 lg:grid-cols-5 lg:gap-5">
          <div className="pointer-events-none absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-brand-300 via-gold-300 to-brand-300 lg:left-8 lg:right-8 lg:top-[27px] lg:bottom-auto lg:h-px lg:w-auto lg:bg-gradient-to-r" aria-hidden />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div role="listitem" className="relative flex gap-4 lg:flex-col lg:gap-0">
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-200 bg-white text-brand-700 shadow-card">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-[11px] font-extrabold text-white ring-4 ring-canvas">{i + 1}</span>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card lg:mt-5 lg:h-full">
                  <p className="text-[15px] font-bold text-ink-950">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-grid-dark" aria-hidden />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-sm">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
                  <Repeat className="h-4 w-4" /> The continuous readiness loop
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Readiness isn’t a one-off course. As AI changes your role, you reassess, relearn and renew your certificate each year.
                </p>
              </div>
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="Continuous readiness loop">
                {LOOP.map((stage, i) => (
                  <li key={`${stage}-${i}`} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all duration-500 sm:text-xs',
                        i === active ? 'bg-brand-500 text-white shadow-[0_0_24px_rgba(21,174,124,0.55)]' : 'bg-white/5 text-slate-300 ring-1 ring-inset ring-white/10',
                      )}
                    >
                      {stage}
                    </span>
                    {i < LOOP.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />}
                  </li>
                ))}
                <li aria-hidden>
                  <Repeat className="h-4 w-4 text-gold-300" />
                </li>
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Platform ───────────────────────────── */

function BentoCard({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-7">{children}</div>
    </Reveal>
  );
}

function CardHead({ icon, eyebrow, title, body }: { icon: ReactNode; eyebrow: string; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{eyebrow}</span>
      </div>
      <h3 className="mt-4 text-xl font-extrabold tracking-tight text-ink-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

function PlatformSection() {
  return (
    <section id="features" className="relative scroll-mt-20 border-t border-slate-200/70 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The platform"
          title="An AI workforce-intelligence engine, built around you"
          description="Every screen adapts to your role, sector, readiness and goals — so you spend time only on the skills that move you forward."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-6 lg:gap-5">
          {/* Personalised learning */}
          <BentoCard className="lg:col-span-4">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" aria-hidden />
            <div className="relative">
              <CardHead
                icon={<Sparkles className="h-5 w-5" />}
                eyebrow="Personalised AI learning"
                title="Gemini at the core of every step"
                body="Google Gemini analyses, recommends, teaches and evaluates — and a built-in ZimAI engine keeps everything working even offline."
              />
              <ol className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {GEMINI_STEPS.map((s, i) => (
                  <li key={s.stage} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-brand-700 shadow-card">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-950">{s.stage}</p>
                      <p className="text-[13px] leading-snug text-slate-500">{s.does}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </BentoCard>

          {/* AI Tutor */}
          <BentoCard className="lg:col-span-2" delay={80}>
            <CardHead icon={<Bot className="h-5 w-5" />} eyebrow="AI Tutor" title="A tutor that knows your role" body="Ask anything, any time. It knows your profession, progress and gaps." />
            <div className="mt-6 space-y-2.5 text-[13px] leading-snug">
              <div className="ml-6 rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2.5 text-white">How can I use AI to shortlist candidates fairly?</div>
              <div className="mr-4 rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 text-slate-700">
                As an HR Officer, use AI to structure criteria and summarise CVs — remove names first, check for bias, and keep the final decision with your panel.
              </div>
              <p className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-400">
                <Sparkles className="h-3 w-3 text-brand-500" /> Personalised to HR · Banking &amp; Finance
              </p>
            </div>
          </BentoCard>

          {/* Career transition */}
          <BentoCard className="lg:col-span-3" delay={60}>
            <CardHead
              icon={<ArrowLeftRight className="h-5 w-5" />}
              eyebrow="Career transition support"
              title="Upskill where you are — or reskill for what’s next"
              body="Compare your current role with a target career to see what transfers, what’s missing and the pathway between them."
            />
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-2 text-sm font-bold text-ink-950">
                <span className="truncate">Accounts Clerk</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-card">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span className="truncate text-right">Data Analyst</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">Transferable</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {['Spreadsheet modelling', 'Reconciliation', 'Attention to detail'].map((s) => (
                      <li key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200/70">{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-clay-700">To build</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {['SQL querying', 'Data visualisation', 'Statistics'].map((s) => (
                      <li key={s} className="rounded-full bg-clay-50 px-2.5 py-1 text-xs font-semibold text-clay-700 ring-1 ring-inset ring-clay-200/70">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Transition readiness</span>
                  <span className="tabular-nums text-ink-950">58%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-brand-500 to-gold-400" />
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Practical challenges */}
          <BentoCard className="lg:col-span-3" delay={120}>
            <CardHead
              icon={<Target className="h-5 w-5" />}
              eyebrow="Practical workplace challenges"
              title="Practise on realistic work — get AI feedback"
              body="Fictional Zimbabwean workplace scenarios, assessed against a transparent rubric with specific strengths and improvements."
            />
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-950">Month-end variance commentary</p>
                  <p className="text-xs text-slate-500">AI feedback · Good</p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white">82</span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {[
                  { c: 'Accuracy & verification', v: 90 },
                  { c: 'Prompt quality', v: 80 },
                  { c: 'Responsible AI use', v: 75 },
                ].map((r) => (
                  <li key={r.c}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                      <span>{r.c}</span>
                      <span className="tabular-nums">{r.v}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white">
                      <div className={cn('h-full rounded-full', levelColour(r.v))} style={{ width: `${r.v}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </BentoCard>

          {/* Domains */}
          <BentoCard className="lg:col-span-4" delay={60}>
            <DomainExplorer />
          </BentoCard>

          {/* Certification */}
          <BentoCard className="lg:col-span-2" delay={120}>
            <CardHead icon={<BadgeCheck className="h-5 w-5" />} eyebrow="Certification" title="Verifiable AI Ready certification" body="Earned through assessed evidence — never just by watching content." />
            <ol className="mt-6 space-y-2">
              {[
                { name: 'AI Aware', note: 'Understands AI and its risks', cls: 'bg-sky-50 text-sky-700 ring-sky-200/70' },
                { name: 'AI Capable', note: 'Applies AI in everyday work', cls: 'bg-gold-50 text-gold-800 ring-gold-200' },
                { name: 'AI Ready', note: 'Proven, responsible practitioner', cls: 'bg-brand-50 text-brand-700 ring-brand-200/70' },
              ].map((l, i) => (
                <li key={l.name} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', l.cls)}>
                    <Award className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-950">
                      {l.name} <span className="ml-1 text-[11px] font-semibold text-slate-400">Level {i + 1}</span>
                    </p>
                    <p className="truncate text-xs text-slate-500">{l.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
              <Link to="/verify" className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800">
                Verify a certificate <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to={`/verify/${DEMO_CERTIFICATE_ID}`} className="text-slate-500 hover:text-ink-950">
                See a sample
              </Link>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function DomainExplorer() {
  const [selected, setSelected] = useState<Domain>(DOMAINS[0]);
  const modules = selected.moduleIds.slice(0, 3).map((id) => {
    const m = getModule(id);
    return m ? moduleTitle(m, selected.id) : null;
  });
  return (
    <div>
      <CardHead
        icon={<Compass className="h-5 w-5" />}
        eyebrow="Domain-specific training"
        title="AI skills for your profession, not generic AI"
        body="Shared foundations — fundamentals, prompting, verification and responsible AI — plus a pathway designed for your field. Select a domain to explore."
      />
      <div className="mt-5 flex flex-wrap gap-2" role="listbox" aria-label="Professional domains">
        {DOMAINS.map((d) => {
          const on = d.id === selected.id;
          return (
            <button
              key={d.id}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => setSelected(d)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.97]',
                on ? 'border-ink-950 bg-ink-950 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50',
              )}
            >
              <span style={{ color: on ? undefined : d.color }}>
                <Icon name={d.icon} className="h-4 w-4" />
              </span>
              {d.shortName}
            </button>
          );
        })}
      </div>
      <div key={selected.id} className="mt-5 animate-fade-in rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: selected.color }}>
            <Icon name={selected.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-950">{selected.name}</p>
            <p className="text-[13px] text-slate-500">{selected.description}</p>
          </div>
        </div>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
          {modules.map(
            (t, i) =>
              t && (
                <li key={t} className="rounded-xl bg-white px-3 py-2 text-[12.5px] font-semibold leading-snug text-slate-700 shadow-card">
                  <span className="mr-1 text-slate-400">{i + 1}.</span>
                  {t}
                </li>
              ),
          )}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Certificate competency: <span className="font-semibold text-ink-900">{selected.competency}</span>
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────── Employers ───────────────────────────── */

function EmployersSection() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const split = [
    { label: 'AI Ready', value: 31, cls: 'bg-brand-500' },
    { label: 'Upskilling', value: 46, cls: 'bg-gold-400' },
    { label: 'Priority Reskilling', value: 23, cls: 'bg-clay-500' },
  ];
  const points = [
    { icon: Radar, title: 'Workforce readiness dashboard', body: 'Readiness and AI exposure by department, role and person — updated as people learn.' },
    { icon: Gauge, title: 'Organisational AI maturity', body: 'A maturity score across strategy, adoption, skills, data and governance.' },
    { icon: Target, title: 'Employer-defined competencies', body: 'Set the AI competencies your organisation needs and track the gap to them.' },
    { icon: Bot, title: 'AI Workforce Advisor', body: 'Ask where to invest in reskilling next and get a reasoned, data-grounded plan.' },
  ];
  return (
    <section id="employers" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/70 via-canvas to-canvas" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <SectionHeading
            align="left"
            eyebrow="For employers"
            title="See your organisation’s AI readiness — and act on it"
            description="Turn individual assessments into workforce intelligence. Know which teams are ready, which need upskilling and where reskilling is a priority."
          />
          <div role="list" className="mt-8 grid gap-4 sm:grid-cols-2">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div role="listitem" className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card ring-1 ring-slate-200/80">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-950">{p.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to="/for-employers" iconRight={<ArrowRight className="h-4 w-4" />}>
              Explore workforce intelligence
            </Button>
            <Button to="/login?role=employer&mode=signup" variant="outline">
              Set up your organisation
            </Button>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div ref={ref} className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-lift sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Workforce AI readiness</p>
                <p className="mt-1 text-lg font-extrabold tracking-tight text-ink-950">Savanna Crest Bank</p>
                <p className="text-xs text-slate-500">Fictional organisation · 148 employees</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-2.5 py-1 text-xs font-bold text-gold-800 ring-1 ring-inset ring-gold-200">
                <Gauge className="h-3.5 w-3.5" /> AI maturity: Developing
              </span>
            </div>

            <div className="mt-6 space-y-3.5">
              <p className="text-xs font-bold text-slate-600">Readiness by department</p>
              {DEPARTMENTS.map((d, i) => (
                <div key={d.name} className="grid grid-cols-[88px_1fr_40px] items-center gap-3">
                  <span className="truncate text-sm font-semibold text-slate-700">{d.name}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full transition-[width] duration-1000 ease-out', levelColour(d.value))}
                      style={{ width: inView ? `${d.value}%` : '0%', transitionDelay: `${i * 120}ms` }}
                    />
                  </div>
                  <span className="text-right text-sm font-bold tabular-nums text-ink-950">{d.value}%</span>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <p className="mb-2 text-xs font-bold text-slate-600">Workforce status</p>
              <div className="flex h-3.5 overflow-hidden rounded-full bg-slate-100">
                {split.map((s, i) => (
                  <div key={s.label} className={cn('h-full transition-[width] duration-1000 ease-out', s.cls)} style={{ width: inView ? `${s.value}%` : '0%', transitionDelay: `${300 + i * 120}ms` }} />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                {split.map((s) => (
                  <li key={s.label} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className={cn('h-2.5 w-2.5 rounded-full', s.cls)} />
                    <span className="font-bold tabular-nums text-ink-950">{s.value}%</span> {s.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex gap-3 rounded-2xl bg-ink-950 p-4 text-white">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-gold-300">AI Workforce Advisor</p>
                <p className="mt-0.5 text-[13px] leading-snug text-slate-200">
                  Operations is furthest behind. Start supervisors on AI fundamentals and safety-focused modules, then pair them with Marketing’s AI champions.
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">Illustrative sample data.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Audience / responsible / sectors ───────────────────────────── */

function AudienceSection() {
  return (
    <section className="border-t border-slate-200/70 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Who it’s for" title="Built for everyone preparing for an AI-augmented workplace" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={i * 70}>
              <div className="h-full rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-white">
                  <a.icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-base font-bold text-ink-950">{a.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{a.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResponsibleSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-brand-200/70 bg-brand-50/60 p-6 sm:p-10">
            <ChevronPattern className="text-brand-700" opacity={0.07} />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                  <ShieldCheck className="h-4 w-4" /> Responsible AI
                </p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">AI that augments people — with people in charge</h2>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2">
                {RESPONSIBLE.map((r) => (
                  <li key={r.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                      <r.icon className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink-950">{r.title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{r.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectorsStrip() {
  const sectors = INDUSTRIES.filter((i) => i.id !== 'other');
  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Designed for Zimbabwe’s key sectors</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
            {sectors.map((s) => (
              <li key={s.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-card">
                <Icon name={s.icon} className="h-4 w-4 text-brand-600" />
                {s.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Final CTA ───────────────────────────── */

function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" aria-hidden />
          <ChevronPattern className="text-white" opacity={0.04} />
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <AccentBar className="mx-auto mb-8 w-24" />
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">Find out where you stand in two minutes.</h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-base text-slate-300 sm:text-lg">
              Get your Personal AI Readiness, your role’s AI exposure and a personalised AI Skills Prescription — free.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button to="/login?role=employee&mode=signup" size="lg" variant="gold" iconRight={<ArrowRight className="h-5 w-5" />}>
                Check My AI Readiness
              </Button>
              <Button to="/for-employers" size="lg" variant="white" icon={<Building2 className="h-5 w-5" />}>
                For Employers
              </Button>
            </div>
            <p className="mt-8 text-xs text-slate-500">All organisations and people shown are fictional.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
