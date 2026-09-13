import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import { Icon } from '../../components/ui';
import { DeckSection, Reveal, Typewriter, useInView } from '../../components/motion';
import { CertificateRibbon, GhostMascot } from '../../components/illustrations';
import { DOMAINS, getModule, moduleTitle } from '../../data/catalog';
import type { Domain } from '../../data/catalog';
import { DEMO_CERTIFICATE_ID } from '../../data/demo/seed';
import { cn } from '../../lib/utils';
import { Intro } from './parts';

const GEMINI_STAGES = ['Assess', 'Analyse', 'Recommend', 'Learn', 'Practise', 'Certify'];

const RUBRIC = [
  { c: 'Accuracy', v: 90 },
  { c: 'Prompting', v: 80 },
  { c: 'Responsible use', v: 75 },
];

const LEVELS = [
  { name: 'AI Aware', cls: 'bg-blush-100' },
  { name: 'AI Capable', cls: 'bg-gold-100' },
  { name: 'AI Ready', cls: 'bg-lilac-200' },
];

export const levelColour = (v: number) => (v >= 70 ? 'bg-brand-700' : v >= 50 ? 'bg-gold-400' : 'bg-clay-400');

/** A tile: one short headline, then a visual. No body copy. */
function Tile({ title, eyebrow, children, className, delay = 0, dark }: { title: ReactNode; eyebrow: string; children: ReactNode; className?: string; delay?: number; dark?: boolean }) {
  return (
    <Reveal delay={delay} className={className}>
      <div
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-[2.25rem] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-ink sm:p-10',
          dark ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/10 bg-paper hover:border-ink-950',
        )}
      >
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', dark ? 'text-canvas/50' : 'text-ink-400')}>{eyebrow}</p>
        <h3 className={cn('mt-3 font-display text-4xl leading-[1] tracking-tight sm:text-5xl', dark ? 'text-canvas' : 'text-ink-950')}>{title}</h3>
        <div className="mt-10 flex flex-1 flex-col justify-end">{children}</div>
      </div>
    </Reveal>
  );
}

export default function PlatformSection() {
  return (
    <DeckSection id="features" tone="sand" className="isolate pb-32 pt-24 sm:pb-48 sm:pt-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Intro eyebrow="The platform" title="Built around *you.*" />

        <div className="mt-16 grid gap-5 sm:mt-24 md:grid-cols-2">
          <GeminiTile />
          <TutorTile />
          <PractiseTile />
          <CareerTile />
          <Tile className="md:col-span-2" eyebrow={`${DOMAINS.length} domains`} title={<>Made for <em>your profession.</em></>}>
            <DomainExplorer />
          </Tile>
          <CertTile />
        </div>
      </div>
    </DeckSection>
  );
}

/* Gemini: the six stages light up in turn. */
function GeminiTile() {
  const [on, setOn] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setOn((x) => (x + 1) % GEMINI_STAGES.length), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <Tile dark eyebrow="Google Gemini" title={<>AI at <em className="text-lilac-200">every step.</em></>}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
      <ol className="relative flex flex-wrap gap-2" aria-label="Gemini supports every stage">
        {GEMINI_STAGES.map((s, i) => (
          <li
            key={s}
            className={cn(
              'rounded-full border px-4 py-2 font-condensed text-lg uppercase tracking-wide transition-all duration-500',
              i === on ? 'border-lilac-200 bg-lilac-200 text-ink-950' : 'border-canvas/15 text-canvas/40',
            )}
          >
            {s}
          </li>
        ))}
      </ol>
    </Tile>
  );
}

function TutorTile() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tile delay={80} eyebrow="AI Tutor" title={<>Knows <em>your role.</em></>}>
      <div ref={ref} className="space-y-3 text-[14px] leading-snug">
        <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md border border-ink-950 bg-lilac-200 px-4 py-2.5 text-ink-950">How do I shortlist fairly with AI?</div>
        <div className="flex items-end gap-2">
          <GhostMascot mood="thinking" className="h-10 w-10 shrink-0" />
          <div className="min-h-[66px] max-w-[85%] rounded-2xl rounded-bl-md bg-ink-950 px-4 py-2.5 text-canvas/90">
            <Typewriter start={inView} speed={28} text="Remove names first. Check for bias. Your panel decides." />
          </div>
        </div>
      </div>
    </Tile>
  );
}

function PractiseTile() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tile delay={60} eyebrow="Practical challenges" title={<>Real work. <em>Real feedback.</em></>}>
      <div ref={ref} className="flex items-end gap-6">
        <span className="flex h-24 w-24 shrink-0 rotate-6 items-center justify-center rounded-full border-2 border-ink-950 bg-gold-400 font-condensed text-5xl text-ink-950 shadow-ink transition-transform duration-500 group-hover:-rotate-6">
          82
        </span>
        <ul className="min-w-0 flex-1 space-y-3">
          {RUBRIC.map((r, i) => (
            <li key={r.c}>
              <p className="mb-1 text-xs font-semibold text-ink-500">{r.c}</p>
              <div className="h-2 overflow-hidden rounded-full bg-sand-200">
                <div className={cn('h-full rounded-full transition-[width] duration-1000 ease-out', levelColour(r.v))} style={{ width: inView ? `${r.v}%` : '0%', transitionDelay: `${200 + i * 150}ms` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Tile>
  );
}

function CareerTile() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tile delay={120} eyebrow="Career transition" title={<>Upskill <em>or reskill.</em></>}>
      <div ref={ref}>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-full border border-ink-950/15 bg-canvas px-3.5 py-1.5 text-sm font-bold text-ink-950">Accounts Clerk</span>
          <ArrowRight className="h-5 w-5 shrink-0 animate-wiggle text-ink-950" />
          <span className="truncate rounded-full border border-ink-950 bg-lilac-200 px-3.5 py-1.5 text-sm font-bold text-ink-950">Data Analyst</span>
        </div>
        <p className="mt-6 font-condensed text-6xl leading-none text-ink-950">
          58<span className="text-2xl text-ink-400">%</span>
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-sand-200">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-800 via-brand-500 to-gold-400 transition-[width] duration-[1400ms] ease-out" style={{ width: inView ? '58%' : '0%' }} />
        </div>
      </div>
    </Tile>
  );
}

function DomainExplorer() {
  const [selected, setSelected] = useState<Domain>(DOMAINS[0]);
  const modules = selected.moduleIds
    .slice(0, 3)
    .map((id) => {
      const m = getModule(id);
      return m ? moduleTitle(m, selected.id) : null;
    })
    .filter((t): t is string => !!t);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Professional domains">
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
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97]',
                on ? 'border-ink-950 bg-ink-950 text-canvas shadow-ink-sm' : 'border-ink-950/15 bg-canvas text-ink-700 hover:-translate-y-px hover:border-ink-950/50',
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
      <div key={selected.id} className="animate-ghost-in">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-ink-950 text-white shadow-ink-sm" style={{ background: selected.color }}>
            <Icon name={selected.icon} className="h-6 w-6" />
          </span>
          <p className="font-display text-3xl leading-tight text-ink-950">{selected.name}</p>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {modules.map((t, i) => (
            <li key={t} className="animate-ghost-in rounded-full bg-sand-200 px-3 py-1.5 text-[12.5px] font-semibold text-ink-700" style={{ animationDelay: `${100 + i * 90}ms` }}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CertTile() {
  return (
    <Tile className="md:col-span-2" eyebrow="Certification" title={<>Certified. <em>Verifiable.</em></>}>
      <div className="pointer-events-none absolute right-6 top-6 h-24 w-24 rotate-12 transition-transform duration-500 group-hover:rotate-0 sm:right-10 sm:top-8 sm:h-32 sm:w-32" aria-hidden>
        <CertificateRibbon className="h-full w-full" />
      </div>
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <ol className="flex flex-wrap gap-3">
          {LEVELS.map((l, i) => (
            <Reveal as="li" key={l.name} delay={120 + i * 100} className={cn('flex items-center gap-2 rounded-full border border-ink-950 py-1.5 pl-1.5 pr-4', l.cls)}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper">
                <Award className="h-4 w-4 text-ink-950" />
              </span>
              <span className="text-sm font-bold text-ink-950">{l.name}</span>
            </Reveal>
          ))}
        </ol>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link to="/verify" className="group/link inline-flex items-center gap-1 text-ink-950 underline decoration-clay-400 decoration-2 underline-offset-4 hover:decoration-ink-950">
            Verify <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
          <Link to={`/verify/${DEMO_CERTIFICATE_ID}`} className="text-ink-500 hover:text-ink-950">
            See a sample
          </Link>
        </div>
      </div>
    </Tile>
  );
}
