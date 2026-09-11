import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Compass, LayoutDashboard, Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { AIDisclaimer, AISourceBadge, Badge, Button, Card, CardTitle, EmptyState, Icon, PageHeader, RichText, ScoreRing } from '../../components/ui';
import { useApp } from '../../services/store';
import { getIndustry } from '../../data/industries';
import { skillName } from '../../data/skills';
import { cn, formatDate } from '../../lib/utils';
import { HorizontalBarList, RadarChart } from './charts';
import { ADOPTION_LABELS, MATURITY_LEVELS, maturityMeta } from './maturity';

const SIZE_LABELS: Record<string, string> = { '1-50': '1–50 employees', '51-200': '51–200 employees', '201-500': '201–500 employees', '501-1000': '501–1,000 employees', '1000+': '1,000+ employees' };

function Chips({ items, empty = 'None' }: { items: string[]; empty?: string }) {
  if (!items.length) return <span className="text-sm text-slate-400">{empty}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {i}
        </span>
      ))}
    </div>
  );
}

const CONFETTI = ['#15ae7c', '#ffc21a', '#0ea5e9', '#f4511e', '#7c3aed', '#15ae7c', '#ffc21a', '#0ea5e9'];

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
        <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-ink-900 p-6 text-white shadow-glow sm:p-8" aria-live="polite">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="absolute h-2.5 w-2.5 animate-float rounded-sm opacity-80"
              style={{ background: c, left: `${8 + i * 11.5}%`, top: `${12 + ((i * 37) % 60)}%`, animationDelay: `${i * 0.35}s`, transform: `rotate(${i * 25}deg)` }}
              aria-hidden
            />
          ))}
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="animate-fade-up">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-gold-300" /> Assessment complete
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {org.name} is at the <span className="text-gold-300">{m.level}</span> stage
              </h2>
              <p className="mt-2 max-w-xl text-[15px] text-white/80">Your AI maturity profile and workforce dashboard are ready. Explore where your people stand and where to invest in reskilling.</p>
            </div>
            <Button variant="gold" size="lg" to="/employer" iconRight={<ArrowRight className="h-5 w-5" />} className="animate-scale-in">
              View workforce dashboard
            </Button>
          </div>
        </section>
      )}

      <PageHeader
        eyebrow={org.name}
        title="AI maturity profile"
        description="How prepared your organisation is — across strategy, adoption, skills, data and governance — to benefit from AI responsibly."
        actions={
          <>
            <Button variant="outline" to="/employer/onboarding?edit=1" icon={<RefreshCw className="h-4 w-4" />}>
              Reassess maturity
            </Button>
            {!isNew && (
              <Button to="/employer" icon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </Button>
            )}
          </>
        }
      />

      <Card>
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex flex-col items-center">
            <ScoreRing value={m.score} color={meta.color} suffix="" label="of 100" size={176} />
            <Badge tone="dark" className="mt-3 px-3 py-1 text-sm">
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
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Maturity journey</p>
          <ol className="grid gap-2 sm:grid-cols-5">
            {MATURITY_LEVELS.map((l, i) => {
              const active = i === currentIdx;
              const passed = i < currentIdx;
              const within = active ? Math.round(((m.score - l.min) / (l.max - l.min)) * 100) : passed ? 100 : 0;
              return (
                <li key={l.level} className={cn('relative rounded-xl border p-3 transition', active ? 'border-transparent bg-ink-950 text-white shadow-lift' : passed ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200 bg-white')} aria-current={active ? 'step' : undefined}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm font-bold', active ? 'text-white' : 'text-ink-950')}>{l.level}</span>
                    <span className={cn('text-[11px] tabular-nums', active ? 'text-slate-300' : 'text-slate-400')}>
                      {l.min}–{l.max}
                    </span>
                  </div>
                  <div className={cn('mt-2 h-1.5 overflow-hidden rounded-full', active ? 'bg-white/15' : 'bg-slate-100')}>
                    <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${within}%`, background: active ? '#ffc21a' : l.color }} />
                  </div>
                  <p className={cn('mt-2 text-[11px] leading-snug', active ? 'text-slate-300' : 'text-slate-500')}>{active ? `You are here · ${m.score}/100` : l.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle title="Maturity dimensions" subtitle="Each scored 0–100" />
          <RadarChart axes={m.dimensions.map((d) => ({ label: d.name, value: d.score }))} color={meta.color} />
        </Card>
        <Card>
          <CardTitle title="Dimension scores" subtitle="Weakest dimensions are your fastest wins" />
          <HorizontalBarList
            labelWidth="7rem"
            items={[...m.dimensions].sort((a, b) => b.score - a.score).map((d) => ({ label: d.name, value: d.score, display: `${d.score}`, color: MATURITY_LEVELS.find((l) => d.score <= l.max)?.color ?? meta.color }))}
          />
          <p className="mt-4 text-xs text-slate-500">Strategy · Adoption · Skills · Data · Governance. Weighted into the overall maturity score.</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {[
          { title: 'Strengths', items: m.strengths, icon: <CheckCircle2 className="h-4 w-4 text-brand-600" />, head: 'text-brand-700' },
          { title: 'Risks', items: m.risks, icon: <AlertTriangle className="h-4 w-4 text-clay-600" />, head: 'text-clay-700' },
          { title: 'Recommendations', items: m.recommendations, icon: <Lightbulb className="h-4 w-4 text-gold-600" />, head: 'text-gold-800' },
        ].map((s) => (
          <Card key={s.title}>
            <h3 className={cn('mb-3 text-sm font-bold uppercase tracking-wide', s.head)}>{s.title}</h3>
            <ul className="space-y-2.5">
              {s.items.map((it) => (
                <li key={it} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                  <span className="mt-0.5 shrink-0">{s.icon}</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <AIDisclaimer className="mt-3" />

      <Card className="mt-4">
        <CardTitle title="Organisation profile" subtitle="The answers this assessment is based on" action={<Button size="sm" variant="ghost" to="/employer/onboarding?edit=1">Edit</Button>} />
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Industry</dt>
            <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink-950">
              {industry && <Icon name={industry.icon} className="h-4 w-4 text-brand-600" />}
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
    </div>
  );
}
