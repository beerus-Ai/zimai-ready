import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Compass, LayoutDashboard, Lightbulb, RefreshCw } from 'lucide-react';
import { AIDisclaimer, AISourceBadge, Badge, Button, Card, CardTitle, EmptyState, Icon, PageHeader, RichText, ScoreRing } from '../../components/ui';
import { useApp } from '../../services/store';
import { getIndustry } from '../../data/industries';
import { skillName } from '../../data/skills';
import { cn, formatDate } from '../../lib/utils';
import { HorizontalBarList, RadarChart } from './charts';
import { ADOPTION_LABELS, MATURITY_LEVELS, maturityMeta } from './maturity';
import { HeroArt } from './components';
import { Reveal } from '../../components/motion';
import { RocketChart } from '../../components/illustrations';

const SIZE_LABELS: Record<string, string> = { '1-50': '1–50 employees', '51-200': '51–200 employees', '201-500': '201–500 employees', '501-1000': '501–1,000 employees', '1000+': '1,000+ employees' };

function Chips({ items, empty = 'None' }: { items: string[]; empty?: string }) {
  if (!items.length) return <span className="text-sm text-slate-400">{empty}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full border border-ink-950/10 bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
          {i}
        </span>
      ))}
    </div>
  );
}

const CONFETTI = ['#ffa946', '#c8f0dc', '#ffbcf2', '#ffa946', '#c8f0dc'];

export default function MaturityPage() {
  const { organisation: org } = useApp();
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';

  if (!org) return <EmptyState title="Set up your organisation first" action={<Button to="/employer/onboarding">Start employer assessment</Button>} />;
  const m = org.maturity;
  if (!m)
    return (
      <EmptyState
        icon={<Compass className="h-6 w-6" />}
        title="AI maturity not assessed yet"
        description="Answer a few questions about your organisation to get a maturity score, strengths, risks and recommendations."
        action={<Button to="/employer/onboarding?edit=1">Assess AI maturity</Button>}
      />
    );
  const meta = maturityMeta(m.level);
  const currentIdx = MATURITY_LEVELS.findIndex((l) => l.level === m.level);
  const industry = getIndustry(org.industryId);

  return (
    <div className="animate-fade-in">
      {isNew && (
        <section className="relative mb-10 animate-ghost-in overflow-hidden rounded-4xl bg-brand-800 p-6 text-canvas sm:p-10" aria-live="polite">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 animate-float rounded-full opacity-50"
              style={{ background: c, left: `${12 + i * 18}%`, top: `${10 + ((i * 37) % 70)}%`, animationDelay: `${i * 0.5}s` }}
              aria-hidden
            />
          ))}
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/60">Assessment complete</p>
              <h2 className="mt-3 text-3xl leading-[1.02] sm:text-5xl">
                {org.name} is at the <em className="text-gold-300">{m.level}</em> stage
              </h2>
              <p className="mt-4 max-w-xl text-[15px] text-canvas/75">Your maturity profile and workforce dashboard are ready.</p>
            </div>
            <Button variant="gold" size="lg" to="/employer" iconRight={<ArrowRight className="h-5 w-5" />} className="animate-scale-in">
              View workforce dashboard
            </Button>
          </div>
        </section>
      )}

      <PageHeader
        eyebrow={org.name}
        title={<>AI maturity <em>profile</em></>}
        description="Strategy, adoption, skills, data and governance — scored."
        actions={
          <div className="flex items-end gap-5">
            <HeroArt>
              <RocketChart className="h-28 w-28 lg:h-32 lg:w-32" animated />
            </HeroArt>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" to="/employer/onboarding?edit=1" icon={<RefreshCw className="h-4 w-4" />}>
                Reassess maturity
              </Button>
              {!isNew && (
                <Button to="/employer" icon={<LayoutDashboard className="h-4 w-4" />}>
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        }
      />

      <Reveal>
      <Card className="rounded-4xl sm:p-10">
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
          <div className="relative flex flex-col items-center">
            <ScoreRing value={m.score} color={meta.color} suffix="" label="of 100" size={200} />
            <Badge tone="dark" className="mt-3 px-3.5 py-1 font-condensed text-base font-normal uppercase tracking-wider">
              {m.level}
            </Badge>
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <AISourceBadge source={m.source} />
              <span className="text-xs text-slate-400">Assessed {formatDate(m.assessedAt)}</span>
            </div>
            <RichText text={m.summary} className="text-[15px] text-slate-700" />
            <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
          </div>
        </div>

        {/* Level ladder */}
        <div className="mt-10 border-t border-ink-950/5 pt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Maturity journey</p>
          <ol className="grid gap-2 sm:grid-cols-5">
            {MATURITY_LEVELS.map((l, i) => {
              const active = i === currentIdx;
              const passed = i < currentIdx;
              const within = active ? Math.round(((m.score - l.min) / (l.max - l.min)) * 100) : passed ? 100 : 0;
              return (
                <li key={l.level} className={cn('relative animate-ghost-in rounded-2xl border p-3 transition', active ? 'border-transparent bg-brand-800 text-canvas' : passed ? 'border-transparent bg-brand-50' : 'border-transparent bg-sand-100')} style={{ animationDelay: `${i * 80}ms` }} aria-current={active ? 'step' : undefined}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm font-bold', active ? 'text-canvas' : 'text-ink-950')}>{l.level}</span>
                    <span className={cn('text-[11px] tabular-nums', active ? 'text-canvas/70' : 'text-slate-400')}>
                      {l.min}–{l.max}
                    </span>
                  </div>
                  <div className={cn('mt-2 h-1.5 overflow-hidden rounded-full', active ? 'bg-canvas/15' : 'bg-sand-300/60')}>
                    <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${within}%`, background: active ? '#ffa946' : l.color }} />
                  </div>
                  <p className={cn('mt-2 text-[11px] leading-snug', active ? 'text-canvas/75' : 'text-slate-500')}>{active ? `You are here · ${m.score}/100` : l.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
        <Card className="h-full sm:p-8">
          <CardTitle title="Maturity dimensions" subtitle="Each scored 0–100" />
          <RadarChart axes={m.dimensions.map((d) => ({ label: d.name, value: d.score }))} color={meta.color} />
        </Card>
        </Reveal>
        <Reveal delay={80}>
        <Card className="h-full sm:p-8">
          <CardTitle title="Dimension scores" />
          <HorizontalBarList
            labelWidth="7rem"
            items={[...m.dimensions].sort((a, b) => b.score - a.score).map((d) => ({ label: d.name, value: d.score, display: `${d.score}`, color: MATURITY_LEVELS.find((l) => d.score <= l.max)?.color ?? meta.color }))}
          />
          <p className="mt-5 text-xs text-slate-500">Weighted into the overall maturity score.</p>
        </Card>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Strengths', items: m.strengths, icon: <CheckCircle2 className="h-4 w-4 text-brand-700" />, head: 'text-brand-800', card: 'bg-brand-50' },
          { title: 'Risks', items: m.risks, icon: <AlertTriangle className="h-4 w-4 text-clay-600" />, head: 'text-clay-700', card: 'bg-clay-50' },
          { title: 'Recommendations', items: m.recommendations, icon: <Lightbulb className="h-4 w-4 text-gold-600" />, head: 'text-gold-800', card: 'bg-gold-50' },
        ].map((s, i) => (
          <Reveal key={s.title} delay={i * 80}>
          <Card className={cn('h-full rounded-3xl border-0 shadow-none sm:p-7', s.card)}>
            <h3 className={cn('mb-3 font-display text-2xl font-medium', s.head)}>{s.title}</h3>
            <ul className="space-y-2.5">
              {s.items.map((it) => (
                <li key={it} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                  <span className="mt-0.5 shrink-0">{s.icon}</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Card>
          </Reveal>
        ))}
      </div>
      <AIDisclaimer className="mt-3" />

      <Reveal className="mt-6">
      <Card className="sm:p-8">
        <CardTitle title="Organisation profile" action={<Button size="sm" variant="ghost" to="/employer/onboarding?edit=1">Edit</Button>} />
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Industry</dt>
            <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink-950">
              {industry && <Icon name={industry.icon} className="h-4 w-4 text-brand-800" />}
              {industry?.name ?? org.industryId}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Workforce size</dt>
            <dd className="mt-1 text-sm font-semibold text-ink-950">{SIZE_LABELS[org.workforceSize] ?? org.workforceSize}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">AI adoption</dt>
            <dd className="mt-1 text-sm font-semibold text-ink-950">{ADOPTION_LABELS[org.adoptionLevel]}</dd>
          </div>
          <div>
            <dt className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Departments</dt>
            <dd><Chips items={org.departments} /></dd>
          </div>
          <div>
            <dt className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Currently using AI</dt>
            <dd><Chips items={org.departmentsUsingAI} empty="No departments yet" /></dd>
          </div>
          <div>
            <dt className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Significant AI transformation expected</dt>
            <dd><Chips items={org.transformationDepartments} /></dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <dt className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">AI tools being introduced</dt>
            <dd><Chips items={org.toolsIntroduced} empty="None specified" /></dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Skills to develop</dt>
            <dd><Chips items={org.desiredSkills.map(skillName)} empty="None specified" /></dd>
          </div>
        </dl>
      </Card>
      </Reveal>
    </div>
  );
}
