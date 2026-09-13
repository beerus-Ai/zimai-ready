import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ChevronLeft, ChevronRight, CircleCheck, Eye, Lock, RefreshCw, UserCheck } from 'lucide-react';
import { Button, Icon } from '../../components/ui';
import { DeckSection, GhostBubbles, Marquee, Reveal, Typewriter, useInView, useScrollProgress } from '../../components/motion';
import type { GhostBubble } from '../../components/motion';
import {
  FarmerPhone,
  GhostMascot,
  LaptopWorker,
  RocketChart,
  ShieldHands,
  Sparkle,
  Squiggle,
  TeacherBoard,
  TeamIdeas,
} from '../../components/illustrations';
import { DOMAINS } from '../../data/catalog';
import { INDUSTRIES } from '../../data/industries';
import { cn } from '../../lib/utils';
import HowShowcase from './HowShowcase';
import PlatformSection, { levelColour } from './PlatformSection';
import { delay, img } from './assets';
import { Headline, Intro, SpinStamp } from './parts';

/* ───────────────────────────── Content (kept deliberately short) ───────────────────────────── */

const QUESTIONS = [
  { q: 'How exposed is my role to AI?', a: 'AI Exposure score', who: 'Farai' },
  { q: 'Am I prepared?', a: 'Readiness score', who: 'Chipo' },
  { q: 'Which AI skills matter for my job?', a: 'Skills map', who: 'Tapiwa' },
  { q: 'What should I learn first?', a: 'Skills Prescription', who: 'Rudo' },
  { q: 'Upskill or reskill?', a: 'Career transition', who: 'Tinashe' },
  { q: 'How do I prove it?', a: 'Verifiable certificate', who: 'Kudzai' },
];

const QUESTION_BUBBLES: GhostBubble[] = QUESTIONS.map((x, i) => ({
  name: x.who,
  text: x.q,
  x: ['2%', '40%', '76%', '4%', '42%', '74%'][i],
  y: ['2%', '0%', '4%', '86%', '90%', '84%'][i],
  tone: (['dark', 'lilac', 'dark', 'light', 'dark', 'lilac'] as const)[i],
  nameColor: i % 3 === 1 ? '#c8f0dc' : undefined,
}));

const LOOP = ['Assess', 'Analyse', 'Recommend', 'Learn', 'Practise', 'Assess', 'Certify', 'Continuously upskill'];

const DEPARTMENTS = [
  { name: 'Marketing', value: 84 },
  { name: 'Finance', value: 72 },
  { name: 'HR', value: 61 },
  { name: 'Operations', value: 39 },
];

const AUDIENCES = [
  { title: 'Employees', line: 'Prove your skills.', art: LaptopWorker, cls: 'bg-lilac-200', tilt: '-rotate-2' },
  { title: 'Employers', line: 'See team readiness.', art: TeamIdeas, cls: 'bg-blush-200', tilt: 'rotate-2' },
  { title: 'Universities', line: 'Graduate AI-ready.', art: TeacherBoard, cls: 'bg-gold-300', tilt: '-rotate-1' },
  { title: 'Training teams', line: 'Measure real gains.', art: RocketChart, cls: 'bg-sand-300', tilt: 'rotate-[2.5deg]' },
];

const RESPONSIBLE = [
  { icon: Lock, title: 'Privacy first' },
  { icon: Eye, title: 'Verify outputs' },
  { icon: UserCheck, title: 'Human oversight' },
  { icon: RefreshCw, title: 'Renewed yearly' },
];

const PHOTOS = [
  { file: 'scene-nurse.webp', domain: 'Healthcare', line: 'Notes drafted. Doses checked.', alt: 'A fictional Zimbabwean nurse using a tablet' },
  { file: 'scene-farmer.webp', domain: 'Agriculture', line: 'Forecasts in hand.', alt: 'A fictional Zimbabwean farmer checking a phone in a field' },
  { file: 'scene-teacher.webp', domain: 'Education', line: 'Lessons in minutes.', alt: 'A fictional Zimbabwean teacher in a classroom' },
  { file: 'scene-developer.webp', domain: 'Software', line: 'Faster, safer code.', alt: 'A fictional Zimbabwean software developer at a laptop' },
  { file: 'scene-contact-centre.webp', domain: 'Service', line: 'Replies, reviewed.', alt: 'A fictional Zimbabwean contact-centre agent wearing a headset' },
  { file: 'scene-team.webp', domain: 'Leadership', line: 'Sharper decisions.', alt: 'A fictional Zimbabwean leadership team meeting' },
];

const PILL_TINTS = ['bg-lilac-200', 'bg-blush-200', 'bg-gold-300', 'bg-brand-100', 'bg-clay-200', 'bg-sand-300'];

/* ───────────────────────────── Page ───────────────────────────── */

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <PhotoStory first />
      <Hero />
      <EmployersSection />
      <AudienceSection />
      <ResponsibleSection />
      <SectorsSection />
      <FinalCta />
      <NumbersSlab />
      <WhySection />
      <HowSection />
      <PlatformSection />
    </div>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero() {
  return (
    <section className="relative isolate -mt-10 overflow-hidden rounded-t-[2.5rem] bg-paper pb-32 pt-24 shadow-[0_-1px_0_rgba(26,26,26,0.08)] sm:-mt-16 sm:rounded-t-[4rem] sm:pb-48 sm:pt-36">
      <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-lilac-200/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-[45%] h-[380px] w-[380px] rounded-full bg-blush-200/35 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="inline-flex animate-ghost-in items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
            <Sparkle className="h-3.5 w-3.5" color="#ff6c4c" />
            ZimAI Ready
          </p>

          <h1 className="mt-6 text-balance text-[2.9rem] leading-[0.92] text-ink-950 sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
            <span className="sr-only">Prepare for the future of work — before it arrives.</span>
            <span aria-hidden>
              <GhostWords text="Prepare for the future of work —" delay={120} />{' '}
              <span className="relative inline-block pb-3 sm:pb-5">
                <GhostWords text="*before it arrives.*" delay={620} accent="text-brand-800" />
                <Squiggle className="absolute -bottom-1 left-0 h-4 w-full sm:h-6" color="#ff6c4c" />
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-md animate-ghost-in text-balance text-lg text-ink-600 sm:text-xl" style={delay(900)}>
            Know where you stand. Learn what matters.
          </p>

          <div className="mt-10 flex animate-ghost-in flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={delay(1050)}>
            <Button to="/login?role=employee&mode=signup" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
              Check your readiness
            </Button>
            <Button to="/for-employers" size="lg" variant="outline">
              For employers
            </Button>
          </div>
          <div className="mt-5 animate-ghost-in" style={delay(1150)}>
            <Link to="/demo" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-ink-950">
              Try the demo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <ul className="mt-10 flex animate-ghost-in flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-500" style={delay(1300)}>
          {['2-minute assessment', `${DOMAINS.length} domains`, 'Verifiable certificates'].map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <CircleCheck className="h-4 w-4 text-brand-800" /> {t}
            </li>
          ))}
        </ul>

        <div className="mt-24 sm:mt-32">
          <HowShowcase />
        </div>
      </div>
    </section>
  );
}

/** Word-by-word ghost text inside an already-labelled heading. */
function GhostWords({ text, delay: d = 0, accent }: { text: string; delay?: number; accent?: string }) {
  const tokens = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let i = 0;
  return (
    <>
      {tokens.map((tok, ti) => {
        const isAccent = tok.startsWith('*') && tok.endsWith('*');
        return (isAccent ? tok.slice(1, -1) : tok).split(/(\s+)/).map((w, wi) => {
          if (!w.trim()) return w ? ' ' : null;
          const ms = d + i++ * 80;
          return (
            <span key={`${ti}-${wi}`} className={cn('inline-block animate-ghost-in', isAccent && cn('italic font-normal', accent))} style={delay(ms)}>
              {w}
            </span>
          );
        });
      })}
    </>
  );
}

/* ───────────────────────────── Numbers + quote (ink) ───────────────────────────── */

function NumbersSlab() {
  const stats = [
    { big: '2', unit: 'min', label: 'Assessment' },
    { big: String(DOMAINS.length), unit: '', label: 'Domains' },
    { big: '3', unit: '', label: 'Certificate levels' },
  ];
  return (
    <DeckSection tone="ink" className="isolate overflow-hidden pb-32 pt-24 sm:pb-48 sm:pt-36">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 text-center sm:gap-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 140}>
              <p className="font-condensed text-7xl leading-none text-canvas sm:text-[9rem] lg:text-[12rem]">
                {s.big}
                {s.unit && <span className="text-2xl uppercase text-gold-400 sm:text-5xl">{s.unit}</span>}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-canvas/50 sm:text-sm">{s.label}</p>
            </Reveal>
          ))}
        </div>

        <figure className="mx-auto mt-32 max-w-4xl text-center sm:mt-48">
          <blockquote>
            <Headline
              as="p"
              text="“We needed to know who was ready — *and what to teach next.*”"
              className="text-balance font-display text-4xl font-medium leading-[1.02] tracking-tight text-canvas sm:text-6xl"
              accentClassName="text-lilac-200"
            />
          </blockquote>
          <Reveal delay={400}>
            <figcaption className="mt-8 text-sm text-canvas/50">
              <span className="font-condensed text-base uppercase tracking-wider text-canvas">Chiedza M.</span> · HR Director, Savanna Crest Bank · fictional
            </figcaption>
          </Reveal>
        </figure>
      </div>
    </DeckSection>
  );
}

/* ───────────────────────────── Why (teal) ───────────────────────────── */

function WhySection() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % QUESTIONS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const cur = QUESTIONS[i];
  return (
    <DeckSection tone="teal" className="isolate overflow-hidden pb-32 pt-24 sm:pb-48 sm:pt-36">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Intro light eyebrow="Why it matters" title="Everyone is told to *learn AI.*" accentClassName="text-gold-300" description="Few know where to start." />

        <div className="relative mt-16 flex min-h-[280px] items-center justify-center sm:mt-20 lg:min-h-[520px]">
          <div className="absolute inset-0 hidden lg:block">
            <GhostBubbles bubbles={QUESTION_BUBBLES} cycle={6000} />
          </div>
          <ul className="sr-only">
            {QUESTIONS.map((x) => (
              <li key={x.q}>
                {x.q} Answered by your {x.a}.
              </li>
            ))}
          </ul>
          <div key={i} className="relative max-w-2xl animate-ghost-in text-center" aria-hidden>
            <p className="text-balance font-display text-4xl italic leading-[1.05] text-canvas sm:text-6xl">{cur.q}</p>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-lilac-200 px-5 py-2.5 text-sm font-bold text-ink-950 animate-ghost-in" style={delay(500)}>
              <ArrowRight className="h-4 w-4" /> {cur.a}
            </p>
          </div>
        </div>
      </div>
    </DeckSection>
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
    <DeckSection id="loop" tone="cream" className="isolate overflow-hidden pb-32 pt-24 sm:pb-48 sm:pt-36">
      {/* Continuous loop */}
      <div>
        <Headline text="Reassess. Relearn. *Renew.*" className="px-4 text-center text-4xl leading-none text-ink-950 sm:text-6xl" accentClassName="text-brand-800" />
        <ol className="sr-only" aria-label="Continuous readiness loop">
          {LOOP.map((s, i) => (
            <li key={`${s}-${i}`}>{s}</li>
          ))}
        </ol>
        <div className="mt-12 -rotate-1 border-y border-ink-950 bg-paper py-4 sm:py-5" aria-hidden>
          <Marquee speed={40}>
            {[...LOOP, ...LOOP].map((stage, i) => (
              <span key={`${stage}-${i}`} className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    'whitespace-nowrap rounded-full border px-5 py-1.5 font-condensed text-2xl uppercase tracking-wide transition-all duration-500 sm:text-4xl',
                    i % LOOP.length === active ? 'border-ink-950 bg-lilac-200 text-ink-950 shadow-ink-sm' : 'border-transparent text-ink-300',
                  )}
                >
                  {stage}
                </span>
                <Sparkle className="h-5 w-5 shrink-0" color={i % 2 ? '#ffa946' : '#ff6c4c'} animated={false} />
              </span>
            ))}
          </Marquee>
        </div>
      </div>

    </DeckSection>
  );
}

/* ───────────────────────────── Photo story ───────────────────────────── */

/** Distance between the first card and its duplicate — the exact length of one loop. */
const loopWidth = (el: HTMLUListElement) => {
  const n = el.children.length / 2;
  const a = el.children[0] as HTMLElement | undefined;
  const b = el.children[n] as HTMLElement | undefined;
  return a && b ? b.offsetLeft - a.offsetLeft : el.scrollWidth / 2;
};

function PhotoStory({ first = false }: { first?: boolean }) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const scroller = useRef<HTMLUListElement>(null);
  const paused = useRef(false);
  const shift = (progress - 0.5) * 60;

  // Auto-moving carousel: the list is rendered twice and scrolls continuously, wrapping seamlessly at the halfway point.
  useEffect(() => {
    const el = scroller.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    const tick = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      const half = loopWidth(el);
      if (!paused.current && half > el.clientWidth * 0.5) {
        pos += dt * 0.045; // px per ms
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    paused.current = true;
    const half = loopWidth(el);
    let target = el.scrollLeft + dir * Math.min(420, el.clientWidth * 0.8);
    if (target < 0) target += half;
    el.scrollTo({ left: target % half, behavior: 'smooth' });
    window.setTimeout(() => (paused.current = false), 1600);
  };
  const hold = () => (paused.current = true);
  const release = () => (paused.current = false);

  return (
    <DeckSection tone="cream" overlap={!first} className={cn('isolate overflow-hidden', first ? 'rounded-t-none pb-28 pt-32 sm:rounded-t-none sm:pb-40 sm:pt-44' : 'pb-32 pt-24 sm:pb-48 sm:pt-36')}>
      <div ref={ref}>
        <Intro eyebrow="In every profession" title="AI at work. *Everywhere.*" />

        <ul
          ref={scroller}
          onPointerEnter={hold}
          onPointerLeave={release}
          onTouchStart={hold}
          onTouchEnd={() => window.setTimeout(release, 1800)}
          onFocus={hold}
          onBlur={release}
          className="no-scrollbar mt-16 flex gap-5 overflow-x-auto px-4 pb-10 pt-4 sm:mt-24 sm:gap-8 sm:px-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
          aria-label="AI in different professions"
        >
          {[...PHOTOS, ...PHOTOS].map((p, i) => (
            <PhotoCard key={`${p.file}-${i}`} photo={p} index={i} shift={shift} eager={first && i < 3} hidden={i >= PHOTOS.length} />
          ))}
        </ul>

        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={() => nudge(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-950 bg-paper transition hover:-translate-y-px hover:bg-lilac-200 hover:shadow-ink-sm" aria-label="Previous photos">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => nudge(1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-950 bg-lilac-200 transition hover:-translate-y-px hover:shadow-ink-sm" aria-label="Next photos">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </DeckSection>
  );
}

function PhotoCard({ photo, index, shift, eager, hidden }: { photo: (typeof PHOTOS)[number]; index: number; shift: number; eager?: boolean; hidden?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <Reveal as="li" delay={Math.min(index, 5) * 90} className={cn('w-[78%] shrink-0 sm:w-[340px] lg:w-[380px]', index % 2 === 1 && 'sm:mt-16')}>
      <figure className="group" aria-hidden={hidden || undefined}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-4xl bg-sand-200 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-ink">
          {failed ? (
            <div className="flex h-full w-full items-center justify-center bg-gold-100 p-10">
              <FarmerPhone className="h-full w-full" />
            </div>
          ) : (
            <img
              src={img(photo.file)}
              alt={photo.alt}
              loading={eager ? 'eager' : 'lazy'}
              onError={() => setFailed(true)}
              className="h-[112%] w-full object-cover will-change-transform"
              style={{ transform: `translateY(${-6 + shift * (index % 2 ? 0.09 : -0.09)}%)` }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-6 text-canvas">
            <p className="font-condensed text-4xl uppercase leading-none tracking-wide">{photo.domain}</p>
            <p className="mt-2 font-display text-xl italic text-canvas/90">{photo.line}</p>
          </figcaption>
        </div>
      </figure>
    </Reveal>
  );
}

/* ───────────────────────────── Employers ───────────────────────────── */

function EmployersSection() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const split = [
    { label: 'Ready', value: 31, cls: 'bg-brand-700' },
    { label: 'Upskilling', value: 46, cls: 'bg-gold-400' },
    { label: 'Reskilling', value: 23, cls: 'bg-clay-400' },
  ];
  return (
    <DeckSection id="employers" tone="teal" className="isolate overflow-hidden pb-32 pt-24 sm:pb-48 sm:pt-36">
      <div className="pointer-events-none absolute -right-40 top-20 h-[460px] w-[460px] rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Intro light align="left" eyebrow="For employers" title="Your workforce, *at a glance.*" accentClassName="text-gold-300" description="Readiness by team. Reskilling where it matters." />
          <Reveal delay={240} className="mt-10 flex flex-wrap gap-3">
            <Button to="/for-employers" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
              Explore
            </Button>
            <Button to="/login?role=employer&mode=signup" size="lg" variant="white">
              Get started
            </Button>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="relative pt-16 sm:pt-20">
            <div className="absolute right-0 top-0 z-10 h-28 w-28 animate-float sm:right-4 sm:h-40 sm:w-40" style={{ animationDuration: '6s' }} aria-hidden>
              <RocketChart className="h-full w-full" />
            </div>
            <div ref={ref} className="relative -rotate-1 rounded-4xl border border-ink-950 bg-paper p-6 text-ink-950 shadow-[6px_6px_0_0_#1a1a1a] transition-transform duration-500 hover:rotate-0 sm:p-8">
              <p className="pr-24 font-display text-3xl leading-tight sm:pr-32">Savanna Crest Bank</p>

              <div className="mt-8 space-y-4">
                {DEPARTMENTS.map((d, i) => (
                  <div key={d.name} className="grid grid-cols-[88px_1fr_44px] items-center gap-3">
                    <span className="truncate text-sm font-semibold text-ink-600">{d.name}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-sand-200">
                      <div className={cn('h-full rounded-full transition-[width] duration-1000 ease-out', levelColour(d.value))} style={{ width: inView ? `${d.value}%` : '0%', transitionDelay: `${i * 120}ms` }} />
                    </div>
                    <span className="text-right font-condensed text-lg tabular-nums">{d.value}%</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex h-4 overflow-hidden rounded-full bg-sand-200">
                {split.map((s, i) => (
                  <div key={s.label} className={cn('h-full transition-[width] duration-1000 ease-out', s.cls)} style={{ width: inView ? `${s.value}%` : '0%', transitionDelay: `${300 + i * 120}ms` }} />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
                {split.map((s) => (
                  <li key={s.label} className="flex items-center gap-1.5">
                    <span className={cn('h-2.5 w-2.5 rounded-full', s.cls)} />
                    <span className="font-bold tabular-nums text-ink-950">{s.value}%</span> {s.label}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-center gap-3 rounded-3xl bg-ink-950 p-4 text-canvas">
                <GhostMascot mood="thinking" className="h-10 w-10 shrink-0" />
                <p className="min-h-[20px] text-sm">
                  <Typewriter start={inView} speed={30} text="Start Operations on AI fundamentals." />
                </p>
              </div>
              <p className="mt-3 text-[11px] text-ink-400">Fictional organisation · illustrative data</p>
            </div>
          </div>
        </Reveal>
      </div>
    </DeckSection>
  );
}

/* ───────────────────────────── Audiences ───────────────────────────── */

function AudienceSection() {
  return (
    <DeckSection tone="cream" className="isolate overflow-hidden pb-32 pt-24 sm:pb-48 sm:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Intro eyebrow="Who it’s for" title="Made for *everyone at work.*" />
        <div className="mt-16 grid gap-6 sm:mt-24 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={i * 100} className={cn(i % 2 === 1 && 'lg:mt-12')}>
              <div className={cn('group h-full rounded-4xl border border-ink-950 p-7 text-center shadow-ink transition duration-500 hover:-translate-y-2 hover:rotate-0 hover:shadow-[6px_6px_0_0_#1a1a1a]', a.cls, a.tilt)}>
                <div className="mx-auto h-36 w-36 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
                  <a.art className="h-full w-full" />
                </div>
                <h3 className="mt-6 font-display text-3xl leading-tight text-ink-950">{a.title}</h3>
                <p className="mt-1 text-sm text-ink-700">{a.line}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </DeckSection>
  );
}

/* ───────────────────────────── Responsible AI ───────────────────────────── */

function ResponsibleSection() {
  return (
    <DeckSection tone="lilac" className="isolate overflow-hidden pb-32 pt-24 sm:pb-48 sm:pt-36">
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <Intro eyebrow="Responsible AI" title="People stay *in charge.*" accentClassName="text-clay-800" />
        <Reveal delay={200}>
          <div className="mx-auto mt-14 h-60 w-60 sm:h-80 sm:w-80">
            <div className="h-full w-full animate-float" style={{ animationDuration: '7s' }}>
              <ShieldHands className="h-full w-full" />
            </div>
          </div>
        </Reveal>
        <ul className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {RESPONSIBLE.map((r, i) => (
            <Reveal as="li" key={r.title} delay={i * 90} className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-950 bg-paper text-ink-950 shadow-ink-sm">
                <r.icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-ink-950">{r.title}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </DeckSection>
  );
}

/* ───────────────────────────── Sectors ───────────────────────────── */

function SectorsSection() {
  const sectors = INDUSTRIES.filter((i) => i.id !== 'other');
  const half = Math.ceil(sectors.length / 2);
  const pill = (s: (typeof sectors)[number], i: number, k: string) => (
    <span key={k} className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-ink-950/15 bg-paper py-2 pl-2 pr-5 text-base font-semibold text-ink-900 sm:text-lg">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-full border border-ink-950', PILL_TINTS[i % PILL_TINTS.length])}>
        <Icon name={s.icon} className="h-4 w-4 text-ink-950" />
      </span>
      {s.name}
    </span>
  );
  return (
    <DeckSection tone="cream" className="isolate overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-36">
      <Intro eyebrow="Key sectors" title="Built for *Zimbabwe.*" className="px-4" accentClassName="text-brand-800" />
      <ul className="sr-only">
        {sectors.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
      <div className="mt-16 space-y-4 sm:mt-20" aria-hidden>
        <Marquee speed={45}>{[...sectors.slice(0, half), ...sectors.slice(0, half)].map((s, i) => pill(s, i, `a${i}`))}</Marquee>
        <Marquee speed={52} reverse>
          {[...sectors.slice(half), ...sectors.slice(half)].map((s, i) => pill(s, i + 3, `b${i}`))}
        </Marquee>
      </div>
    </DeckSection>
  );
}

/* ───────────────────────────── Final CTA ───────────────────────────── */

function FinalCta() {
  return (
    <section className="relative isolate px-4 pb-20 pt-10 sm:px-6 sm:pb-24 lg:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink-950 px-6 py-24 text-center text-canvas sm:rounded-[3.5rem] sm:px-12 sm:py-36">
          <img src={img('scene-certified.webp')} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/55 to-brand-950/90" aria-hidden />
          <SpinStamp id="cta-stamp" text="TWO MINUTES · FREE · AI READY ·" className="absolute right-6 top-6 hidden h-28 w-28 sm:block lg:right-12 lg:top-12" fill="#c8f0dc">
            <Sparkle className="h-7 w-7" color="#1a1a1a" animated={false} />
          </SpinStamp>

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto mb-8 h-24 w-24 animate-ghost-float sm:h-28 sm:w-28">
              <GhostMascot mood="wave" className="h-full w-full" />
            </div>
            <h2 className="text-balance text-[2.75rem] leading-[0.95] text-canvas sm:text-7xl lg:text-8xl">
              Find out where you stand{' '}
              <span className="relative inline-block pb-3">
                <em className="text-gold-300">in two minutes.</em>
                <Squiggle className="absolute -bottom-1 left-0 h-4 w-full sm:h-5" color="#ffa946" />
              </span>
            </h2>
            <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button to="/login?role=employee&mode=signup" size="lg" variant="gold" iconRight={<ArrowRight className="h-5 w-5" />}>
                Check your readiness
              </Button>
              <Button to="/for-employers" size="lg" variant="white" icon={<Building2 className="h-5 w-5" />}>
                For employers
              </Button>
            </div>
            <p className="mt-12 text-xs text-canvas/50">All organisations and people shown are fictional.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
