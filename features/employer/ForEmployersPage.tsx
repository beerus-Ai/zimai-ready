import { useMemo, useState } from 'react';
import { ArrowRight, Bot, Building2, Globe2, Play } from 'lucide-react';
import { AIDisclaimer, Badge, Button, Icon, RichText } from '../../components/ui';
import { DeckSection, GhostBubbles, GhostText, Marquee, Reveal } from '../../components/motion';
import type { GhostBubble } from '../../components/motion';
import { GhostMascot, RocketChart, ShieldHands, Sparkle, Squiggle, TeamIdeas } from '../../components/illustrations';
import { EmployerTutorial } from '../../components/tutorials';
import { buildDemoOrganisation } from '../../data/demo/organisation';
import { CERT_TYPE_META } from '../../lib/certification';
import { LEVEL_COLORS, WORKFORCE_STATUS_META } from '../../lib/readiness';
import { cn } from '../../lib/utils';
import { competencyHeatmap, departmentStats, mostVulnerableSkills, orgAverages, STATUS_ORDER, statusSplit } from './analytics';
import { Heatmap, HorizontalBarList, StackedBar } from './charts';
import { answerOffline, SUGGESTED_QUESTIONS } from './advisorEngine';
import { COMPETENCY_TEMPLATES, PRIORITY_META } from './competencyTemplates';
import { BigStat, FloatChip, GrowBar, ReplayOnView } from './public/bits';

const hex = (v: number) => {
  const l = v <= 25 ? 'AI Beginner' : v <= 50 ? 'Developing' : v <= 75 ? 'AI Capable' : 'AI Ready';
  return LEVEL_COLORS[l].hex;
};

const img = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

const INDUSTRY_STRIP = [
  { label: 'Financial services', icon: 'Landmark' },
  { label: 'Mining', icon: 'Pickaxe' },
  { label: 'Agriculture', icon: 'Sprout' },
  { label: 'Telecoms', icon: 'RadioTower' },
  { label: 'Retail', icon: 'ShoppingBag' },
  { label: 'Tourism', icon: 'Palmtree' },
  { label: 'Manufacturing', icon: 'Factory' },
  { label: 'Education', icon: 'GraduationCap' },
  { label: 'Healthcare', icon: 'HeartPulse' },
  { label: 'Public sector', icon: 'Building2' },
  { label: 'Technology', icon: 'Cpu' },
];

/** Manager questions drifting over the hero photo. */
const MANAGER_BUBBLES: GhostBubble[] = [
  { name: 'Chief People Officer', text: 'Who’s ready?', x: '6%', y: '10%', tone: 'dark', nameColor: '#ffa946' },
  { name: 'Head of Operations', text: 'Where do we reskill first?', x: '58%', y: '8%', tone: 'lilac', nameColor: '#fffeeb' },
  { name: 'Finance Director', text: 'What’s missing?', x: '62%', y: '66%', tone: 'light', nameColor: '#fffeeb' },
];

/** One headline, one line. */
function Headline({ title, line, light, className }: { title: string; line?: string; light?: boolean; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-4xl text-center', className)}>
      <GhostText
        as="h2"
        text={title}
        className={cn('block text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-8xl', light ? 'text-canvas' : 'text-ink-950')}
        accentClassName={cn('italic', light ? 'text-gold-300' : 'text-brand-800')}
        stagger={60}
      />
      {line && (
        <Reveal delay={250}>
          <p className={cn('mx-auto mt-6 max-w-xl text-lg sm:text-xl', light ? 'text-canvas/70' : 'text-ink-500')}>{line}</p>
        </Reveal>
      )}
    </div>
  );
}

const SLAB = 'pb-32 pt-24 sm:pb-44 sm:pt-36';

export default function ForEmployersPage() {
  // Live figures from the fictional demo bank — the same data the demo dashboard uses.
  const demo = useMemo(() => {
    const { organisation: org, workforce: members } = buildDemoOrganisation('preview');
    return {
      org,
      members,
      split: statusSplit(members),
      avg: orgAverages(members),
      depts: departmentStats(members, org),
      heat: competencyHeatmap(members, org),
      vulnerable: mostVulnerableSkills(members, org, 3),
    };
  }, []);
  const { org, members, split, avg, depts, heat, vulnerable } = demo;
  const [question, setQuestion] = useState(SUGGESTED_QUESTIONS[0]);
  const answer = useMemo(() => answerOffline(question, org, members), [question, org, members]);
  const maturity = org.maturity!;
  const bank = COMPETENCY_TEMPLATES.find((t) => t.id === 'banking')!;
  const mining = COMPETENCY_TEMPLATES.find((t) => t.id === 'mining')!;
  const statusSegments = STATUS_ORDER.map((s) => ({ label: WORKFORCE_STATUS_META[s].label, value: split.counts[s], color: WORKFORCE_STATUS_META[s].hex }));

  return (
    <div className="overflow-x-clip">
      {/* ───────── Hero ───────── */}
      <section className="relative pb-32 pt-28 sm:pb-44 sm:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <Reveal>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                <Building2 className="h-3.5 w-3.5 text-brand-800" /> For employers
              </p>
            </Reveal>

            <h1 className="relative mt-6 text-balance text-[3.25rem] leading-[0.92] text-ink-950 sm:text-8xl lg:text-[8.5rem]">
              <span className="sr-only">Is your workforce AI ready?</span>
              <span aria-hidden>
                <GhostText text="Is your workforce" stagger={70} startOnView={false} />{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <GhostText text="*AI ready?*" accentClassName="italic text-brand-800" delay={300} stagger={140} startOnView={false} />
                  <Squiggle className="absolute -bottom-3 left-0 h-4 w-full sm:-bottom-5 sm:h-6" color="#ff6c4c" animated />
                </span>
              </span>
              <span className="pointer-events-none absolute -right-2 -top-8 hidden sm:block" aria-hidden>
                <Sparkle className="h-12 w-12 lg:h-16 lg:w-16" color="#ffa946" animated />
              </span>
            </h1>

            <Reveal delay={300}>
              <p className="mx-auto mt-10 max-w-xl text-lg text-ink-500 sm:text-xl">Measure it. Find the gaps. Reskill with confidence.</p>
            </Reveal>
            <Reveal delay={400} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" to="/login?role=employer&mode=signup" iconRight={<ArrowRight className="h-5 w-5" />}>
                Start assessment
              </Button>
              <Button size="lg" variant="outline" to="/demo" icon={<Play className="h-4 w-4" />}>
                See the demo
              </Button>
            </Reveal>
          </div>

          {/* Photo with floating numbers */}
          <Reveal delay={150} className="relative mx-auto mt-20 max-w-5xl sm:mt-28">
            <div className="relative overflow-hidden rounded-4xl shadow-lift">
              <img src={img('scene-team.webp')} alt="A fictional Zimbabwean leadership team reviewing workforce readiness" className="aspect-[4/5] w-full object-cover sm:aspect-[16/9]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" aria-hidden />
              <GhostBubbles bubbles={MANAGER_BUBBLES} />
            </div>
            <FloatChip className="-top-5 right-4 sm:-right-6" delay={600}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">AI Ready</p>
              <p className="font-condensed text-4xl leading-none" style={{ color: WORKFORCE_STATUS_META['ai-ready'].hex }}>
                {split.pct['ai-ready']}%
              </p>
            </FloatChip>
            <FloatChip className="-bottom-6 left-4 sm:-left-6" delay={900}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">Avg readiness</p>
              <p className="font-condensed text-4xl leading-none text-brand-800">{avg.readiness}%</p>
            </FloatChip>
          </Reveal>
        </div>
      </section>

      {/* ───────── Readiness by department (ink) ───────── */}
      <DeckSection tone="ink" className={SLAB}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Headline light title="Every team. *At a glance.*" />
          <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-3 gap-4 text-center sm:mt-24">
            <BigStat value={split.total} label="Employees" numberClassName="text-5xl text-canvas sm:text-8xl lg:text-9xl" labelClassName="text-[10px] text-canvas/50 sm:text-xs" />
            <BigStat value={split.pct.upskilling} suffix="%" label="Upskilling" numberClassName="text-5xl text-gold-300 sm:text-8xl lg:text-9xl" labelClassName="text-[10px] text-canvas/50 sm:text-xs" />
            <BigStat value={split.pct['priority-reskilling']} suffix="%" label="Priority reskilling" numberClassName="text-5xl text-clay-400 sm:text-8xl lg:text-9xl" labelClassName="text-[10px] text-canvas/50 sm:text-xs" />
          </dl>
          <Reveal delay={150} className="mx-auto mt-16 max-w-4xl sm:mt-24">
            <div className="rounded-4xl bg-paper p-5 text-ink-950 sm:p-10">
              <ReplayOnView>
                <StackedBar segments={statusSegments} height={12} />
                <div className="mt-8">
                  <HorizontalBarList
                    items={[...depts].sort((a, b) => b.readiness - a.readiness).map((d) => ({ label: d.department, value: d.readiness, display: `${d.readiness}%`, color: hex(d.readiness), marker: d.exposure, markerLabel: 'AI exposure' }))}
                    ariaLabel="AI readiness by department"
                  />
                </div>
              </ReplayOnView>
            </div>
          </Reveal>
        </div>
      </DeckSection>

      {/* ───────── Maturity (teal) ───────── */}
      <DeckSection tone="teal" className={cn(SLAB, 'overflow-hidden')}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Headline light title="Know where you *stand.*" line="AI maturity, scored across five dimensions." />
          <div className="mt-16 grid items-end gap-12 sm:mt-24 md:grid-cols-[1fr_1.2fr]">
            <Reveal className="text-center md:text-left">
              <dl>
                <BigStat value={maturity.score} label={`${maturity.level} · out of 100`} numberClassName="text-[9rem] text-canvas sm:text-[13rem]" labelClassName="text-canvas/60" />
              </dl>
              <div className="mt-8 hidden md:block">
                <RocketChart className="h-40 w-40" animated />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="grid h-72 grid-cols-5 items-end gap-3 sm:h-96 sm:gap-5">
                {maturity.dimensions.map((d, i) => (
                  <div key={d.name} className="flex h-full flex-col justify-end text-center">
                    <p className="font-condensed text-2xl leading-none tabular-nums text-canvas sm:text-4xl">{d.score}</p>
                    <div className="mt-2 flex flex-1 items-end overflow-hidden rounded-2xl bg-canvas/10">
                      <GrowBar vertical pct={d.score} delay={i * 120} className={cn('w-full rounded-2xl', i % 2 ? 'bg-lilac-200' : 'bg-gold-400')} />
                    </div>
                    <p className="mt-3 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-canvas/60">{d.name}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </DeckSection>

      {/* ───────── Skills gap (cream) ───────── */}
      <DeckSection tone="cream" className={SLAB}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Headline title="See the *gaps.*" line="Coverage of every competency, by department." />
          <dl className="mx-auto mt-16 grid max-w-4xl gap-8 text-center sm:mt-24 sm:grid-cols-3">
            {vulnerable.map((s) => (
              <BigStat key={s.skillId} value={s.belowPct} suffix="%" label={`below target · ${s.name}`} numberClassName="text-7xl text-clay-500 sm:text-8xl" labelClassName="mx-auto max-w-[14rem] text-ink-500" />
            ))}
          </dl>
          <Reveal delay={150} className="mt-16 sm:mt-24">
            <div className="rounded-4xl border border-ink-950/10 bg-paper p-4 shadow-card sm:p-8">
              <ReplayOnView>
                <Heatmap rows={heat.rows.map((r) => ({ id: r.id, label: r.label }))} cols={heat.cols.map((c) => ({ id: c.id, label: c.label }))} values={heat.values} />
              </ReplayOnView>
            </div>
          </Reveal>
        </div>
      </DeckSection>

      {/* ───────── Competencies (lilac) ───────── */}
      <DeckSection tone="lilac" className={cn(SLAB, 'overflow-hidden')}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Headline title="Your framework. *Your rules.*" line="A bank and a mine need different skills." />
          <div className="mt-16 grid gap-8 sm:mt-24 md:grid-cols-2">
            {[
              { tpl: bank, icon: 'Landmark', title: 'Bank', tilt: 'md:-rotate-2' },
              { tpl: mining, icon: 'Pickaxe', title: 'Mine', tilt: 'md:rotate-2' },
            ].map(({ tpl, icon, title, tilt }, i) => (
              <Reveal key={tpl.id} delay={i * 140}>
                <div className={cn('rounded-4xl border border-ink-950 bg-paper p-6 shadow-ink transition duration-500 sm:p-8 md:hover:rotate-0', tilt)}>
                  <div className="flex items-center justify-between">
                    <p className="font-condensed text-5xl uppercase leading-none text-ink-950 sm:text-6xl">{title}</p>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-950 text-canvas">
                      <Icon name={icon} className="h-5 w-5" />
                    </span>
                  </div>
                  <ul className="mt-6 divide-y divide-ink-950/10">
                    {tpl.competencies.slice(0, 4).map(([name, , , , priority]) => (
                      <li key={name} className="flex items-center justify-between gap-3 py-3">
                        <span className="truncate font-display text-lg text-ink-950">{name}</span>
                        <Badge tone={PRIORITY_META[priority].tone}>{PRIORITY_META[priority].label}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </DeckSection>

      {/* ───────── Certification (ink) ───────── */}
      <DeckSection tone="ink" className={cn(SLAB, 'overflow-hidden')}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 flex justify-center">
            <ShieldHands className="h-36 w-36 sm:h-48 sm:w-48" animated />
          </Reveal>
          <Headline light title="Proof, *not promises.*" line="Two certificates employers can verify in seconds." />
          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:mt-24 md:grid-cols-2">
            {[
              { meta: CERT_TYPE_META.domain, icon: <Globe2 className="h-5 w-5" />, word: 'Portable', c: 'bg-gold-400' },
              { meta: CERT_TYPE_META.employer, icon: <Building2 className="h-5 w-5" />, word: 'Yours', c: 'bg-lilac-200' },
            ].map((x, i) => (
              <Reveal key={x.meta.label} delay={i * 140}>
                <div className="rounded-4xl border border-canvas/10 p-8 text-center transition duration-300 hover:border-canvas/30 sm:p-10">
                  <span className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-950 text-ink-950', x.c)}>{x.icon}</span>
                  <p className="mt-6 font-condensed text-6xl uppercase leading-none text-canvas sm:text-7xl">{x.word}</p>
                  <p className="mt-3 font-display text-xl text-canvas/70">{x.meta.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </DeckSection>

      {/* ───────── Advisor (cream) ───────── */}
      <DeckSection tone="cream" className={SLAB}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Headline title="Ask. *Get answers.*" line="An AI Workforce Advisor grounded in your data." />
          <Reveal delay={150} className="mt-14 flex flex-wrap justify-center gap-2 sm:mt-20">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuestion(q)}
                aria-pressed={question === q}
                className={cn(
                  'rounded-full border px-4 py-2 text-left text-sm font-medium transition active:scale-[0.98]',
                  question === q ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/15 bg-paper text-ink-700 hover:border-ink-950/40',
                )}
              >
                {q}
              </button>
            ))}
          </Reveal>
          <Reveal delay={250} className="relative mt-10">
            <div className="pointer-events-none absolute -right-2 -top-12 z-10 sm:-right-10" aria-hidden>
              <GhostMascot mood="thinking" className="h-20 w-20 animate-ghost-float sm:h-24 sm:w-24" animated />
            </div>
            <div className="rounded-4xl border border-ink-950/10 bg-paper p-5 shadow-lift sm:p-8">
              <div className="flex justify-end">
                <p key={`q-${question}`} className="max-w-[85%] animate-ghost-in rounded-2xl rounded-br-md bg-ink-950 px-4 py-2.5 text-[15px] text-canvas">
                  {question}
                </p>
              </div>
              <div key={question} className="mt-5 flex animate-ghost-in gap-3" style={{ animationDelay: '200ms' }}>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-ink-950 bg-lilac-200 text-ink-950">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="min-w-0 rounded-2xl rounded-tl-md bg-canvas px-4 py-3">
                  <RichText text={answer} className="text-[14px] text-ink-700" />
                </div>
              </div>
              <AIDisclaimer className="mt-5">Sample answer from the fictional Savanna Crest Bank.</AIDisclaimer>
            </div>
          </Reveal>
        </div>
      </DeckSection>

      {/* ───────── See it in action (teal) ───────── */}
      <DeckSection tone="teal" className={cn(SLAB, 'overflow-hidden')}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Headline light title="See it *in action.*" />
          <Reveal delay={150} className="relative mt-14 sm:mt-20">
            <div className="pointer-events-none absolute -left-4 -top-8 z-10 hidden sm:block" aria-hidden>
              <Sparkle className="h-10 w-10" color="#ffa946" animated />
            </div>
            <EmployerTutorial dark className="shadow-lift" />
          </Reveal>
        </div>
      </DeckSection>

      {/* ───────── Industries (cream) ───────── */}
      <DeckSection tone="cream" className="pb-28 pt-20 sm:pb-36 sm:pt-28">
        <Reveal className="flex justify-center px-4">
          <TeamIdeas className="h-32 w-32 sm:h-40 sm:w-40" animated />
        </Reveal>
        <p className="mt-6 px-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Built for Zimbabwean industries</p>
        <ul className="sr-only">
          {INDUSTRY_STRIP.map((i) => (
            <li key={i.label}>{i.label}</li>
          ))}
        </ul>
        <div aria-hidden className="mt-10">
          <Marquee speed={55}>
            {INDUSTRY_STRIP.map((i) => (
              <span key={i.label} className="inline-flex shrink-0 items-center gap-4 px-3 font-condensed text-5xl uppercase leading-none text-ink-950 sm:text-7xl">
                {i.label}
                <Icon name={i.icon} className="h-8 w-8 text-clay-400 sm:h-10 sm:w-10" />
              </span>
            ))}
          </Marquee>
        </div>
      </DeckSection>

      {/* ───────── CTA (lilac) ───────── */}
      <DeckSection tone="lilac" className="-mb-12 overflow-hidden pb-40 pt-24 sm:-mb-16 sm:pb-52 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal className="flex justify-center">
            <GhostMascot mood="wave" className="h-24 w-24 animate-ghost-float sm:h-32 sm:w-32" animated />
          </Reveal>
          <GhostText
            as="h2"
            text="Ready when *you* are."
            className="mx-auto mt-8 block text-balance text-5xl leading-[0.95] text-ink-950 sm:text-8xl"
            accentClassName="italic text-brand-800"
            stagger={80}
          />
          <Reveal delay={250} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="dark" to="/login?role=employer&mode=signup" iconRight={<ArrowRight className="h-5 w-5" />}>
              Start assessment
            </Button>
            <Button size="lg" variant="outline" to="/demo">
              See the demo
            </Button>
          </Reveal>
          <p className="mt-10 text-xs text-ink-600">Savanna Crest Bank and all people shown are fictional.</p>
        </div>
      </DeckSection>
    </div>
  );
}
