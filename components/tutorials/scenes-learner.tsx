import { useRef } from 'react';
import { BarChart3, Check, ChevronRight, FileText, GraduationCap, HeartPulse, Landmark, Lightbulb, PenLine, Pickaxe, Search, ShoppingBag, Sprout, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { ScoreRing } from '../ui';
import { Typewriter } from '../motion';
import { CertificateRibbon, Sparkle } from '../illustrations';
import { cn } from '../../lib/utils';
import { DemoCursor, Eyebrow, FauxQR, Ghost, Mascot, Panel, SparkleBurst, Speech, TypingDots, useCycle, useTimeline } from './primitives';

/* ════════════════════════ Assess ════════════════════════ */

export function AssessScene() {
  const root = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const step = useTimeline([650, 1500, 1750, 2500]);
  const options = ['Daily', 'Weekly', 'Occasionally', 'Never'];
  return (
    <div ref={root} className="relative h-full w-full">
      <Panel className="absolute left-3 top-3 w-[292px] p-3.5">
        <div className="flex items-center justify-between">
          <Eyebrow>Your AI use</Eyebrow>
          <span key={step >= 3 ? 'q7' : 'q6'} className="animate-ghost-in font-display text-[13px] text-ink-700">
            Question {step >= 3 ? 7 : 6} of 9
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-lilac-100">
          <div className="h-full rounded-full bg-ink-950 transition-[width] duration-700 ease-out" style={{ width: step >= 3 ? '78%' : '67%' }} />
        </div>
        <p className="mt-3 font-display text-[22px] leading-[1.1]">
          How often do you use <em>AI</em> at work?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {options.map((o, i) => {
            const on = i === 1 && step >= 2;
            return (
              <Ghost key={o} delay={150 + i * 110}>
                <div
                  ref={i === 1 ? target : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-xl border-2 px-2.5 py-2 text-[13px] font-semibold transition-all duration-300',
                    on ? 'border-ink-950 bg-lilac-100 shadow-ink-sm' : 'border-ink-950/10 bg-paper',
                  )}
                >
                  {o}
                  <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border-2', on ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/25')}>{on && <Check className="h-2.5 w-2.5" strokeWidth={4} />}</span>
                </div>
              </Ghost>
            );
          })}
        </div>
      </Panel>
      <DemoCursor root={root} target={step >= 1 ? target : null} clicks={step >= 2 ? 1 : 0} />
      <Mascot mood="thinking" className="bottom-1 right-3 h-24 w-24" />
      <Speech show={step >= 3} className="right-24 top-24" tail="right">
        Three to go!
      </Speech>
    </div>
  );
}

/* ════════════════════════ Discover ════════════════════════ */

export function ExposureGauge({ to = 48, label = 'High' }: { to?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="104" height="62" viewBox="0 0 100 60" className="overflow-visible">
        <path d="M10 55 A40 40 0 0 1 30 20.36" stroke="#ebebd8" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M30 20.36 A40 40 0 0 1 70 20.36" stroke="#ffa946" strokeWidth="9" fill="none" />
        <path d="M70 20.36 A40 40 0 0 1 90 55" stroke="#ff6c4c" strokeWidth="9" fill="none" strokeLinecap="round" />
        <g className="tut-sweep" style={{ transformOrigin: '50px 55px', '--to': `${to}deg`, animationDelay: '300ms' } as CSSProperties}>
          <line x1="50" y1="55" x2="50" y2="22" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="55" r="5" fill="#1a1a1a" />
      </svg>
      <span className="mt-1 font-condensed text-[20px] uppercase leading-none tracking-wide text-clay-600">{label}</span>
    </div>
  );
}

export function DiscoverScene() {
  const rx = [
    { t: 'Prompting for reports', p: 'Priority' },
    { t: 'Verifying AI output', p: 'Priority' },
    { t: 'Data privacy with AI', p: 'Next' },
  ];
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-3 px-2">
      <Ghost delay={0}>
        <Panel className="flex h-[176px] w-[118px] flex-col items-center justify-center p-2 text-center">
          <ScoreRing value={64} size={88} stroke={9} />
          <Eyebrow className="mt-2 leading-tight tracking-[0.12em]">AI readiness</Eyebrow>
        </Panel>
      </Ghost>
      <Ghost delay={250}>
        <Panel className="flex h-[176px] w-[118px] flex-col items-center justify-center p-2 text-center">
          <ExposureGauge />
          <Eyebrow className="mt-2 leading-tight tracking-[0.12em]">Workplace exposure</Eyebrow>
        </Panel>
      </Ghost>
      <Ghost delay={500}>
        <Panel className="relative h-[176px] w-[168px] bg-brand-800 p-3 text-canvas">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-canvas/60">Your prescription</p>
          <p className="font-display text-[18px] leading-tight">
            AI Skills <em>Rx</em>
          </p>
          <ul className="mt-2 space-y-1.5">
            {rx.map((r, i) => (
              <Ghost key={r.t} delay={1000 + i * 380}>
                <li className="flex items-center gap-2 rounded-lg bg-canvas/10 px-2 py-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold-400 text-[9px] font-bold text-ink-950">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{r.t}</span>
                </li>
              </Ghost>
            ))}
          </ul>
        </Panel>
      </Ghost>
      <Mascot mood="happy" className="-right-1 -top-3 h-16 w-16" delay={1600} />
    </div>
  );
}

/* ════════════════════════ Learn ════════════════════════ */

export function LearnScene({ role = 'Accounts Clerk', example, start = 900 }: { role?: string; example?: string; start?: number }) {
  const step = useTimeline([start]);
  const text = example ?? `As ${/^[aeiou]/i.test(role) ? 'an' : 'a'} ${role} , ask AI to flag ledger mismatches — then re-check every total.`;
  return (
    <div className="relative h-full w-full">
      <Panel className="absolute left-3 top-2 w-[318px] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>Lesson 2 of 4 · Prompting</Eyebrow>
          <div className="flex w-20 gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={cn('h-1 flex-1 rounded-full', i < 2 ? 'bg-ink-950' : i === 2 ? 'animate-ghost-pulse bg-ink-950/50' : 'bg-ink-950/10')} />
            ))}
          </div>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-lilac-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lilac-800 ring-1 ring-inset ring-lilac-300/60">
          <Sparkle className="h-3 w-3" color="#1a1a1a" /> Personalised example
        </span>
        <p className="mt-1.5 font-display text-[22px] leading-[1.1]">
          Write prompts that <em>work for you</em>
        </p>
        <div className="mt-2.5 min-h-[92px] rounded-xl border border-ink-950/10 bg-sand-200/60 p-2.5 text-[12.5px] leading-snug text-ink-800">
          {step >= 1 ? <Typewriter text={text} speed={24} /> : <TypingDots />}
        </div>
      </Panel>
      <Mascot mood="wave" className="bottom-0 right-3 h-24 w-24" />
      <Speech className="right-6 top-5" delay={600} tail="left">
        For <em className="font-display text-[14px]">your</em> job
      </Speech>
    </div>
  );
}

/* ════════════════════════ Practise ════════════════════════ */

export function Rubric({ rows, delay = 300 }: { rows: { label: string; score: number; max: number }[]; delay?: number }) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const ratio = r.score / r.max;
        return (
          <Ghost key={r.label} delay={delay + i * 220}>
            <div className="flex items-center justify-between text-[11.5px] font-semibold">
              <span>{r.label}</span>
              <span className="tabular-nums">
                {r.score}
                <span className="text-ink-400">/{r.max}</span>
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-sand-200">
              <div className={cn('tut-grow h-full rounded-full', ratio >= 0.75 ? 'bg-brand-800' : ratio >= 0.5 ? 'bg-gold-400' : 'bg-clay-400')} style={{ width: `${ratio * 100}%`, animationDelay: `${delay + 200 + i * 220}ms` }} />
            </div>
          </Ghost>
        );
      })}
    </div>
  );
}

export function PractiseScene() {
  const step = useTimeline([1700, 2300]);
  return (
    <div className="relative h-full w-full">
      <Panel className="absolute left-3 top-3 w-[248px] p-3.5">
        <div className="flex items-center justify-between">
          <Eyebrow>Practical activity</Eyebrow>
          {step >= 1 && <span className="tut-pop rounded-full border border-ink-950 bg-gold-400 px-2 py-0.5 font-condensed text-[15px] leading-none text-ink-950">82%</span>}
        </div>
        <p className="mb-2.5 mt-1 font-display text-[18px] leading-tight">Reconcile the supplier ledger</p>
        <Rubric
          rows={[
            { label: 'Prompt quality', score: 18, max: 20 },
            { label: 'Verification', score: 16, max: 20 },
            { label: 'Privacy & safeguards', score: 6, max: 10 },
          ]}
        />
      </Panel>
      <div className="absolute bottom-3 right-3 w-[170px]">
        <Ghost delay={900}>
          <Panel className="rounded-bl-md p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">AI feedback</p>
            {step >= 2 ? (
              <p className="mt-1 animate-ghost-in text-[12px] leading-snug">Strong checks. Remove client IDs first.</p>
            ) : (
              <TypingDots className="mt-2" />
            )}
          </Panel>
        </Ghost>
      </div>
      <Mascot mood={step >= 2 ? 'happy' : 'thinking'} className="right-8 top-1 h-20 w-20" />
    </div>
  );
}

/* ════════════════════════ Certify ════════════════════════ */

export function Certificate({ name = 'Tendai Moyo', field = 'Accounts & Finance', delay = 0 }: { name?: string; field?: string; delay?: number }) {
  return (
    <div className="tut-slide relative w-[286px] rounded-2xl border-2 border-ink-950 bg-paper p-4 text-ink-950 shadow-ink" style={{ animationDelay: `${delay}ms` }}>
      <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-dashed border-ink-950/20" />
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-ink-500">ZimAI Ready · Certificate</p>
      <p className="mt-1 font-display text-[25px] leading-none">
        AI-Ready <em>Professional</em>
      </p>
      <p className="mt-2 text-[11px] text-ink-500">Awarded to</p>
      <p className="font-display text-[17px] leading-tight">{name}</p>
      <p className="text-[11px] font-semibold text-brand-800">{field} · Level 2</p>
      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div className="text-[9px] leading-tight text-ink-500">
          <p className="font-mono">ZR-4F9K-22</p>
          <p>Scan to verify</p>
        </div>
        <FauxQR seed={name} size={42} className="rounded-sm ring-1 ring-ink-950/10" />
      </div>
      <div className="tut-pop absolute -right-7 -top-8 h-20 w-20" style={{ animationDelay: `${delay + 800}ms` }}>
        <CertificateRibbon className="h-full w-full" animated />
      </div>
    </div>
  );
}

export function CertifyScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Certificate />
      <SparkleBurst className="left-1/2 top-1/2" delay={1000} count={18} radius={150} />
      <Mascot mood="happy" className="bottom-0 left-2 h-20 w-20" delay={1300} />
      <Ghost delay={1800} className="absolute right-2 top-2">
        <Sparkle className="h-8 w-8 animate-spin-slow" color="#ffa946" animated />
      </Ghost>
    </div>
  );
}

/* ════════════════════════ Keep ready ════════════════════════ */

export function LoopScene() {
  const active = useCycle(4, 950, 500);
  const stages = [
    { label: 'Assess', x: 220, y: 30 },
    { label: 'Learn', x: 372, y: 125 },
    { label: 'Practise', x: 220, y: 220 },
    { label: 'Reassess', x: 68, y: 125 },
  ];
  const scores = [64, 70, 76, 81];
  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 440 250" fill="none">
        <ellipse cx="220" cy="125" rx="152" ry="95" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" strokeDasharray="6 8" />
      </svg>
      {stages.map((s, i) => (
        <div key={s.label} className="absolute" style={{ left: s.x, top: s.y, transform: 'translate(-50%, -50%)' }}>
          <Ghost delay={i * 120}>
            <span
              className={cn(
                'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-500',
                active === i ? 'scale-110 border-ink-950 bg-lilac-200 text-ink-950 shadow-ink-sm' : 'border-ink-950/15 bg-paper text-ink-700',
              )}
            >
              {active === i && <Sparkle className="h-3 w-3" color="#1a1a1a" />}
              {s.label}
            </span>
          </Ghost>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 h-24 w-24" style={{ transform: 'translate(-50%, -54%)' }}>
        <Mascot mood="happy" className="inset-0 h-24 w-24" />
      </div>
      <Ghost delay={400} className="absolute left-2 top-2">
        <Panel className="px-2.5 py-1.5">
          <Eyebrow className="tracking-[0.12em]">Readiness</Eyebrow>
          <p key={active} className="animate-ghost-in font-condensed text-[24px] leading-none tabular-nums text-brand-800">{scores[active]}</p>
        </Panel>
      </Ghost>
    </div>
  );
}

/* ════════════════════════ Assessment tutorial scenes ════════════════════════ */

export function IndustryScene() {
  const root = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const step = useTimeline([700, 1550, 1800]);
  const tiles: { label: string; icon: ReactNode }[] = [
    { label: 'Finance', icon: <Landmark className="h-4 w-4" /> },
    { label: 'Health', icon: <HeartPulse className="h-4 w-4" /> },
    { label: 'Agriculture', icon: <Sprout className="h-4 w-4" /> },
    { label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Mining', icon: <Pickaxe className="h-4 w-4" /> },
    { label: 'Retail', icon: <ShoppingBag className="h-4 w-4" /> },
  ];
  return (
    <div ref={root} className="relative h-full w-full">
      <Panel className="absolute left-3 top-3 w-[300px] p-3.5">
        <div className="flex items-center justify-between">
          <Eyebrow>About your work</Eyebrow>
          <span className="font-display text-[13px] text-ink-700">Question 1 of 9</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-lilac-100">
          <div className="tut-grow h-full w-[11%] rounded-full bg-ink-950" />
        </div>
        <p className="mt-2.5 font-display text-[21px] leading-[1.1]">
          Which <em>industry</em> do you work in?
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {tiles.map((t, i) => {
            const on = i === 2 && step >= 2;
            return (
              <Ghost key={t.label} delay={120 + i * 90}>
                <div
                  ref={i === 2 ? target : undefined}
                  className={cn('flex flex-col items-start gap-1 rounded-xl border-2 p-2 text-[11.5px] font-semibold transition-all duration-300', on ? 'border-ink-950 bg-lilac-100 shadow-ink-sm' : 'border-ink-950/10 bg-paper')}
                >
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-lg transition-colors', on ? 'bg-ink-950 text-canvas' : 'bg-sand-200 text-ink-700')}>{t.icon}</span>
                  {t.label}
                </div>
              </Ghost>
            );
          })}
        </div>
      </Panel>
      <DemoCursor root={root} target={step >= 1 ? target : null} clicks={step >= 2 ? 1 : 0} />
      <Mascot mood="wave" className="bottom-1 right-4 h-24 w-24" />
      <Speech show={step >= 3} className="right-10 top-10" tail="left">
        2 minutes
      </Speech>
    </div>
  );
}

export function UseCaseScene() {
  const root = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const step = useTimeline([600, 1350, 1900, 2650]);
  const chips = [
    { label: 'Writing', icon: <PenLine className="h-3.5 w-3.5" /> },
    { label: 'Research', icon: <Search className="h-3.5 w-3.5" /> },
    { label: 'Data analysis', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { label: 'Reporting', icon: <FileText className="h-3.5 w-3.5" /> },
    { label: 'Brainstorming', icon: <Lightbulb className="h-3.5 w-3.5" /> },
  ];
  const selected = (i: number) => (i === 0 && step >= 2) || (i === 3 && step >= 4);
  const count = (step >= 2 ? 1 : 0) + (step >= 4 ? 1 : 0);
  return (
    <div ref={root} className="relative h-full w-full">
      <Panel className="absolute left-3 top-4 w-[306px] p-3.5">
        <Eyebrow>Your AI use</Eyebrow>
        <p className="mt-1.5 font-display text-[21px] leading-[1.1]">
          What do you use <em>AI</em> for?
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <Ghost key={c.label} delay={100 + i * 90}>
              <span
                ref={i === 0 ? a : i === 3 ? b : undefined}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[12px] font-medium transition-all duration-300',
                  selected(i) ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/15 bg-paper text-ink-700',
                )}
              >
                {c.icon}
                {c.label}
              </span>
            </Ghost>
          ))}
        </div>
        <p key={count} className="mt-3 animate-ghost-in text-[12px] text-ink-500">
          {count ? `${count} selected` : 'Select all that apply'}
        </p>
      </Panel>
      <DemoCursor root={root} target={step >= 3 ? b : step >= 1 ? a : null} clicks={step >= 4 ? 2 : step >= 2 ? 1 : 0} />
      <Mascot mood="thinking" className="bottom-2 right-3 h-24 w-24" />
    </div>
  );
}

export function ConfidenceScene() {
  const root = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const step = useTimeline([600, 1400, 1650]);
  const levels = ['Beginner', 'Explorer', 'Practitioner', 'Confident', 'Advanced'];
  const chosen = step >= 2 ? 3 : 0;
  return (
    <div ref={root} className="relative h-full w-full">
      <Panel className="absolute left-3 top-3 w-[322px] p-3.5">
        <Eyebrow>No wrong answers</Eyebrow>
        <p className="mt-1.5 font-display text-[21px] leading-[1.1]">
          How <em>confident</em> are you with AI?
        </p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {levels.map((l, i) => {
            const id = i + 1;
            const on = chosen === id;
            return (
              <Ghost key={l} delay={100 + i * 90}>
                <div ref={id === 3 ? target : undefined} className={cn('flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 transition-all duration-300', on ? 'border-ink-950 bg-lilac-100 shadow-ink-sm' : 'border-ink-950/10 bg-paper')}>
                  <span className="flex h-6 items-end gap-[2px]">
                    {[1, 2, 3, 4, 5].map((b) => (
                      <span key={b} className={cn('w-1 rounded-full transition-colors duration-500', b <= id ? (chosen && id <= chosen ? 'bg-brand-800' : 'bg-ink-950/30') : 'bg-ink-950/10')} style={{ height: 4 + b * 4 }} />
                    ))}
                  </span>
                  <span className="font-condensed text-[15px] leading-none">{id}</span>
                </div>
              </Ghost>
            );
          })}
        </div>
        <div className="mt-2.5 min-h-[44px] rounded-xl border border-dashed border-ink-950/15 px-2.5 py-2">
          {step >= 3 ? (
            <div className="animate-ghost-in">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-800">Level 3 · Practitioner</p>
              <p className="font-display text-[15px] leading-tight">“I use AI for simple tasks”</p>
            </div>
          ) : (
            <p className="text-[11.5px] text-ink-500">Tap a level</p>
          )}
        </div>
      </Panel>
      <DemoCursor root={root} target={step >= 1 ? target : null} clicks={step >= 2 ? 1 : 0} />
      <Mascot mood="wave" className="bottom-0 right-2 h-20 w-20" />
    </div>
  );
}

export function AnalysingScene() {
  const step = useTimeline([700, 1400, 2100, 2500]);
  const stages = ['Scoring your readiness', 'Mapping AI exposure', 'Finding skills gaps'];
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-4">
      <Panel className="w-[196px] p-3">
        <div className="flex items-center gap-2">
          <div className="relative h-12 w-12 shrink-0">
            <span className="absolute inset-1 animate-ghost-pulse rounded-full bg-lilac-300/70 blur-md" />
            <Mascot mood={step >= 4 ? 'happy' : 'thinking'} className="inset-0 h-12 w-12" delay={0} />
          </div>
          <p className="font-display text-[16px] leading-tight">
            Analysing <em>you</em>
          </p>
        </div>
        <ul className="mt-2.5 space-y-1.5">
          {stages.map((s, i) => {
            const done = step > i;
            return (
              <li key={s} className={cn('flex items-center gap-2 text-[11.5px] font-medium transition-opacity duration-300', step < i && 'opacity-40')}>
                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors duration-300', done ? 'bg-brand-800 text-canvas' : 'bg-sand-200 text-ink-500')}>
                  {done ? <Check className="tut-pop h-3 w-3" strokeWidth={3} /> : <TypingDots dot="bg-ink-500" className="scale-50" />}
                </span>
                {s}
              </li>
            );
          })}
        </ul>
      </Panel>
      <div className="w-[170px]">
        {step >= 4 ? (
          <Panel className="flex animate-ghost-in flex-col items-center p-3 text-center">
            <ScoreRing value={68} size={92} stroke={9} />
            <p className="mt-1.5 font-display text-[15px] leading-tight">
              Personal AI <em>readiness</em>
            </p>
            <span className="mt-1 rounded-full bg-clay-100 px-2 py-0.5 text-[10px] font-bold text-clay-700">Exposure: High</span>
          </Panel>
        ) : (
          <div className="flex h-[160px] animate-ghost-pulse flex-col items-center justify-center rounded-2xl border border-dashed border-current opacity-40">
            <span className="text-[11px] font-semibold">Your profile…</span>
          </div>
        )}
      </div>
      {step >= 4 && <SparkleBurst className="right-[118px] top-1/2" count={12} radius={90} />}
    </div>
  );
}

/* ════════════════════════ Lesson tutorial scenes ════════════════════════ */

export function StepsScene() {
  const root = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLSpanElement>(null);
  const step = useTimeline([500, 1300, 1550, 2500, 2750]);
  const idx = step >= 5 ? 2 : step >= 3 ? 1 : 0;
  const cards = [
    { label: 'Concept', title: 'What a *prompt* is', bullets: ['Role', 'Task', 'Format'] },
    { label: 'Example', title: 'A *month-end* summary', bullets: ['Remove names', 'Ask for a table', 'Check totals'] },
    { label: 'Quick check', title: 'Which is *safest*?', bullets: ['Paste everything', 'Anonymise first', 'Skip the check'] },
  ];
  const c = cards[idx];
  return (
    <div ref={root} className="relative h-full w-full">
      <div className="absolute left-3 top-2 w-[300px]">
        <div className="mb-2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(127,127,127,.25)' }}>
              <span className={cn('block h-full rounded-full bg-lilac-400 transition-[width] duration-700')} style={{ width: i < idx ? '100%' : i === idx ? '50%' : '0%' }} />
            </span>
          ))}
        </div>
        <Panel key={idx} className="animate-ghost-in p-3.5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700">{c.label}</span>
            <span className="text-[11px] font-semibold tabular-nums text-ink-400">{idx + 1} / 5</span>
          </div>
          <p className="mt-2 font-display text-[21px] leading-[1.1]">
            {c.title.split(/(\*[^*]+\*)/).map((t, i) => (t.startsWith('*') ? <em key={i}>{t.slice(1, -1)}</em> : t))}
          </p>
          <ul className="mt-2 space-y-1">
            {c.bullets.map((b, i) => (
              <Ghost key={b} delay={250 + i * 150}>
                <li className="flex items-center gap-2 rounded-lg bg-sand-200/60 px-2 py-1 text-[12px]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-canvas">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              </Ghost>
            ))}
          </ul>
          <div className="mt-2.5 flex justify-end">
            <span ref={next} className="inline-flex items-center gap-1 rounded-lg border border-ink-950 bg-lilac-200 px-2.5 py-1 text-[12px] font-semibold">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Panel>
      </div>
      <DemoCursor root={root} target={step >= 1 ? next : null} clicks={step >= 5 ? 2 : step >= 3 ? 1 : 0} />
      <Mascot mood="happy" className="bottom-3 right-4 h-24 w-24" />
      <Speech className="right-8 top-8" delay={500} tail="left">
        Bite-sized
      </Speech>
    </div>
  );
}

export function QuizScene() {
  const root = useRef<HTMLDivElement>(null);
  const wrong = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const step = useTimeline([600, 1350, 2400, 3150]);
  const opts = ['Paste the full client list', 'Anonymise, then ask', 'Trust the first answer'];
  const isWrong = (i: number) => i === 0 && step >= 2;
  const isRight = (i: number) => i === 1 && step >= 4;
  return (
    <div ref={root} className="relative h-full w-full">
      <Panel className="absolute left-3 top-2 w-[300px] p-3.5">
        <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700">Quick check</span>
        <p className="mt-2 font-display text-[19px] leading-[1.12]">
          Summarising client feedback with AI. <em>First</em> step?
        </p>
        <div className="mt-2.5 space-y-1.5">
          {opts.map((o, i) => (
            <Ghost key={o} delay={100 + i * 100}>
              <div
                ref={i === 0 ? wrong : i === 1 ? right : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 text-[12px] font-semibold transition-all duration-300',
                  isRight(i) ? 'border-brand-800 bg-brand-50' : isWrong(i) ? 'border-clay-300 bg-clay-50 text-clay-800 line-through decoration-clay-300' : 'border-ink-950/10 bg-paper',
                )}
              >
                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold', isRight(i) ? 'bg-brand-800 text-canvas' : isWrong(i) ? 'bg-clay-400 text-canvas' : 'bg-sand-200')}>
                  {isRight(i) ? <Check className="h-3 w-3" strokeWidth={3} /> : isWrong(i) ? <X className="h-3 w-3" strokeWidth={3} /> : 'ABC'[i]}
                </span>
                {o}
              </div>
            </Ghost>
          ))}
        </div>
      </Panel>
      <DemoCursor root={root} target={step >= 3 ? right : step >= 1 ? wrong : null} clicks={step >= 4 ? 2 : step >= 2 ? 1 : 0} />
      <div className="absolute right-3 top-6 w-[118px]">
        {step >= 4 ? (
          <Panel key="ok" className="animate-ghost-in border-brand-800/30 bg-brand-50 p-2 text-[11.5px] font-semibold leading-snug text-brand-900">
            Correct!
          </Panel>
        ) : step >= 2 ? (
          <Panel key="no" className="animate-ghost-in border-clay-300/60 bg-clay-50 p-2 text-[11.5px] leading-snug">
            <span className="font-bold text-clay-700">Not quite.</span> Names are personal data.
          </Panel>
        ) : null}
      </div>
      <Mascot mood={step >= 4 ? 'happy' : 'thinking'} className="bottom-1 right-4 h-20 w-20" />
      {step >= 4 && <SparkleBurst className="right-16 top-10" count={10} radius={60} />}
    </div>
  );
}

export function LessonDoneScene() {
  const skills = [
    { name: 'Prompting', from: 'Developing', to: 'Proficient' },
    { name: 'Verification', from: 'Aware', to: 'Developing' },
  ];
  const step = useTimeline([1500]);
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Panel className="relative w-[320px] p-4 text-center">
        <div className="tut-pop absolute -top-10 left-1/2 h-20 w-20" style={{ marginLeft: -40 }}>
          <CertificateRibbon className="h-full w-full" animated />
        </div>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">Module complete</p>
        <p className="font-display text-[22px] leading-tight">
          Prompting for <em>finance</em>
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <ScoreRing value={90} size={70} stroke={7} />
          <div className="space-y-1.5 text-left">
            {skills.map((s, i) => (
              <Ghost key={s.name} delay={500 + i * 250}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{s.name}</p>
                <p key={step} className="animate-ghost-in text-[12.5px] font-semibold">
                  {step >= 1 ? <span className="text-brand-800">{s.to} ↑</span> : s.from}
                </p>
              </Ghost>
            ))}
          </div>
        </div>
      </Panel>
      <SparkleBurst className="left-1/2 top-[30%]" count={18} radius={140} delay={300} />
      <Mascot mood="wave" className="bottom-0 left-3 h-20 w-20" delay={900} />
    </div>
  );
}
