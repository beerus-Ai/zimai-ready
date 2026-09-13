import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Award, Check, ClipboardCheck, Clock, Route, ScanSearch, Sparkles, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GhostText } from '../../components/motion';
import { SceneCanvas } from '../../components/tutorials/primitives';
import { AnalysingScene, CertifyScene, ConfidenceScene, DiscoverScene, IndustryScene, LearnScene, PractiseScene, QuizScene, StepsScene, UseCaseScene } from '../../components/tutorials/scenes-learner';
import { AnswerScene, CapstoneScene, FinalScene, VerifyScene } from '../../components/tutorials/scenes-work';
import { cn } from '../../lib/utils';

interface Clip {
  name: string;
  scene: ReactNode;
  ms?: number;
}

interface Stage {
  id: string;
  label: string;
  icon: LucideIcon;
  tint: string;
  title: string;
  lead: string;
  description: string;
  points: string[];
  meta: string;
  clips: Clip[];
}

/** The five stages, each demonstrated by a looping animated clip and explained in full. */
const STAGES: Stage[] = [
  {
    id: 'assess',
    label: 'Assess',
    icon: ClipboardCheck,
    tint: 'bg-lilac-100',
    title: 'Assess *where you are.*',
    lead: 'A two-minute check-in on how you work today.',
    description:
      'Answer nine quick questions, one per screen, about your industry, your role, the tasks you do and how often you already use AI. There are no right or wrong answers — Gemini reads your answers against your profession to build an honest starting point.',
    points: ['Pick your industry and role', 'Tick the tasks where you already use AI', 'Rate your confidence, honestly', 'Scored and mapped in seconds'],
    meta: '2 minutes · 9 questions',
    clips: [
      { name: 'industry', scene: <IndustryScene />, ms: 4000 },
      { name: 'ai-use', scene: <UseCaseScene />, ms: 4200 },
      { name: 'confidence', scene: <ConfidenceScene />, ms: 4000 },
      { name: 'analysing', scene: <AnalysingScene />, ms: 4400 },
    ],
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: ScanSearch,
    tint: 'bg-blush-100',
    title: 'Discover *your gaps.*',
    lead: 'See exactly where you stand — and why.',
    description:
      'Your results bring three things together: your Personal AI Readiness score, how exposed your role is to AI, and an AI Skills Prescription — the skills that matter most in your job, in priority order, each with the reason it was chosen for you.',
    points: ['Readiness score out of 100', 'AI exposure for your specific role', 'Skills gaps ranked by impact', 'Upskill or reskill recommendation'],
    meta: 'Instant results · Gemini insight',
    clips: [
      { name: 'results', scene: <DiscoverScene />, ms: 5200 },
      { name: 'results-again', scene: <DiscoverScene />, ms: 5200 },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: Route,
    tint: 'bg-gold-100',
    title: 'Learn *for your job.*',
    lead: 'A pathway written around your real work.',
    description:
      'Your prescription becomes a learning path of short micro-lessons. Every example is personalised to your profession, quick checks confirm each idea has landed, and an AI Tutor that knows your role and progress is on hand whenever you get stuck.',
    points: ['Short, focused micro-lessons', 'Examples from your own profession', 'Quick checks after every idea', 'An AI Tutor that knows your role'],
    meta: '5–10 min lessons · AI Tutor',
    clips: [
      { name: 'steps', scene: <StepsScene />, ms: 3800 },
      { name: 'examples', scene: <LearnScene start={700} />, ms: 4400 },
      { name: 'check', scene: <QuizScene />, ms: 4600 },
      { name: 'tutor', scene: <AnswerScene />, ms: 4400 },
    ],
  },
  {
    id: 'practise',
    label: 'Practise',
    icon: Wrench,
    tint: 'bg-brand-50',
    title: 'Practise *on real work.*',
    lead: 'Do the task. Get specific feedback.',
    description:
      'Apply what you learned to realistic Zimbabwean workplace scenarios — a variance commentary, a customer reply, a shortlisting brief. Submit your work and Gemini scores it against a transparent rubric, then shows your strengths and exactly what to improve.',
    points: ['Realistic workplace scenarios', 'Scored on a transparent rubric', 'Accuracy, prompting and responsible use', 'Strengths and next improvements'],
    meta: 'Rubric-based AI feedback',
    clips: [
      { name: 'feedback', scene: <PractiseScene />, ms: 5200 },
      { name: 'feedback-again', scene: <PractiseScene />, ms: 5200 },
    ],
  },
  {
    id: 'certify',
    label: 'Certify',
    icon: Award,
    tint: 'bg-sand-300',
    title: 'Get *certified.*',
    lead: 'Prove it with evidence, not attendance.',
    description:
      'Pass a knowledge assessment and a practical capstone to earn AI Aware, AI Capable or AI Ready. Every certificate carries a QR code and ID that employers can check publicly, and it is renewed each year as AI keeps changing.',
    points: ['Knowledge assessment', 'Practical capstone project', 'Three levels: Aware, Capable, Ready', 'Publicly verifiable, renewed yearly'],
    meta: 'Verifiable · QR + certificate ID',
    clips: [
      { name: 'final', scene: <FinalScene />, ms: 4200 },
      { name: 'capstone', scene: <CapstoneScene />, ms: 4200 },
      { name: 'certificate', scene: <CertifyScene />, ms: 4400 },
      { name: 'verify', scene: <VerifyScene />, ms: 4200 },
    ],
  },
];

const clipMs = (c: Clip) => c.ms ?? 4400;
const stageMs = (s: Stage) => s.clips.reduce((n, c) => n + clipMs(c), 0);

export default function HowShowcase() {
  const [stage, setStage] = useState(0);
  const [clip, setClip] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [run, setRun] = useState(0);
  const paused = useRef(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const current = STAGES[stage];

  // Keep the active tab visible when the tab row scrolls sideways (phones), without scrolling the page.
  useEffect(() => {
    const row = tabsRef.current;
    const tab = row?.querySelector<HTMLElement>(`#how-tab-${STAGES[stage].id}`);
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
  }, [stage]);

  const select = (i: number) => {
    setStage(i);
    setClip(0);
    setElapsed(0);
    setRun((r) => r + 1);
  };

  // One clock drives the clip loop, the progress bar and the stage auto-advance, so they stay in sync.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const s = STAGES[stage];
    let last = performance.now();
    let spent = 0;
    const t = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      spent += dt;
      if (spent >= stageMs(s)) {
        // While the visitor is hovering or focused, keep looping this stage's clips instead of moving on.
        if (paused.current) {
          spent = 0;
        } else {
          window.clearInterval(t);
          select((stage + 1) % STAGES.length);
          return;
        }
      }
      let acc = 0;
      let idx = 0;
      for (; idx < s.clips.length - 1; idx++) {
        acc += clipMs(s.clips[idx]);
        if (spent < acc) break;
      }
      setElapsed(spent);
      setClip(idx);
    }, 100);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, run]);

  const progress = Math.min(100, (elapsed / stageMs(current)) * 100);
  const active = current.clips[clip] ?? current.clips[0];

  return (
    <div
      id="how"
      className="scroll-mt-28"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">How it works</p>
        <h2 className="mt-3 text-4xl leading-none text-ink-950 sm:text-6xl">
          Five steps. <em className="text-brand-800">One pathway.</em>
        </h2>
      </div>

      {/* Stage tabs */}
      <div ref={tabsRef} className="no-scrollbar relative -mx-4 mt-10 overflow-x-auto px-4 sm:mt-14">
        <div role="tablist" aria-label="How it works stages" className="mx-auto flex w-max gap-2 rounded-2xl border border-ink-950/10 bg-sand-200/60 p-1.5">
          {STAGES.map((s, i) => {
            const on = i === stage;
            return (
              <button
                key={s.id}
                role="tab"
                id={`how-tab-${s.id}`}
                aria-selected={on}
                aria-controls="how-panel"
                onClick={() => select(i)}
                className={cn(
                  'relative flex items-center gap-2 overflow-hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-5',
                  on ? 'border border-ink-950 bg-paper text-ink-950 shadow-ink-sm' : 'border border-transparent text-ink-500 hover:text-ink-950',
                )}
              >
                <span className={cn('font-condensed text-base leading-none', on ? 'text-clay-400' : 'text-ink-300')}>0{i + 1}</span>
                <s.icon className="h-4 w-4" />
                {s.label}
                {on && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-lilac-400" style={{ width: `${progress}%` }} aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div id="how-panel" role="tabpanel" aria-labelledby={`how-tab-${current.id}`} className="mt-10 grid items-center gap-8 sm:mt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* GIF window */}
        <div key={`gif-${current.id}-${run}`} className="animate-ghost-in">
          <div className={cn('overflow-hidden rounded-4xl border border-ink-950 shadow-ink', current.tint)}>
            <div className="flex items-center justify-between gap-3 border-b border-ink-950/15 bg-paper/70 px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-clay-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-lilac-400" />
              </div>
              <p className="truncate font-mono text-[11px] text-ink-500">
                {current.id}-{active.name}.gif
              </p>
              <span className="flex items-center gap-1.5 rounded-full border border-ink-950/15 bg-canvas px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-400" /> Loop
              </span>
            </div>
            <div className="relative aspect-[440/250] w-full">
              <div key={`${current.id}-${clip}-${run}`} className="absolute inset-0 animate-ghost-in">
                <SceneCanvas>{active.scene}</SceneCanvas>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 pb-3" aria-hidden>
              {current.clips.map((c, i) => (
                <span key={c.name} className={cn('h-1.5 rounded-full transition-all duration-500', i === clip ? 'w-6 bg-ink-950' : 'w-1.5 bg-ink-950/20')} />
              ))}
            </div>
          </div>
        </div>

        {/* Animated explanation */}
        <div key={`copy-${current.id}-${run}`} className="text-left">
          <div className="flex items-baseline gap-4">
            <span className="animate-ghost-in font-condensed text-6xl leading-none text-ink-950/10 sm:text-7xl">0{stage + 1}</span>
            <GhostText as="h3" startOnView={false} text={current.title} className="font-display text-4xl leading-[1.02] text-ink-950 sm:text-5xl" accentClassName="italic text-brand-800" stagger={90} />
          </div>
          <GhostText as="p" startOnView={false} text={current.lead} delay={350} stagger={45} className="mt-4 block font-display text-2xl italic leading-snug text-ink-700" />
          <GhostText as="p" startOnView={false} text={current.description} delay={800} stagger={16} className="mt-4 block text-[15px] leading-relaxed text-ink-600 sm:text-base" />
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {current.points.map((p, i) => (
              <li key={p} className="flex animate-ghost-in items-start gap-2.5 rounded-2xl border border-ink-950/10 bg-paper px-3.5 py-2.5 text-sm font-medium text-ink-800" style={{ animationDelay: `${1700 + i * 160}ms` }}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lilac-200 text-ink-950">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex animate-ghost-in flex-wrap items-center gap-2 text-xs font-semibold text-ink-600" style={{ animationDelay: '2400ms' }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-200 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" /> {current.meta}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-200 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Personalised by Gemini
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
