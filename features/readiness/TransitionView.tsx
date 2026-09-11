import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Bot, Check, CheckCircle2, Clock, Compass, Flag, Info, Sparkles, Target } from 'lucide-react';
import type { AISource, CareerTransitionAnalysis, EmployeeProgress } from '../../types';
import { AIDisclaimer, AISourceBadge, Badge, Card, ScoreRing, useCountUp } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { getDomain, getModule } from '../../data/catalog';
import { cn } from '../../lib/utils';

/**
 * CURRENT STATE → TARGET STATE comparison for a career transition: readiness,
 * transferable skills, gaps, AI competencies, a progress-aware pathway and a
 * responsible outlook. Used by the Career page (goal + explorer).
 */

const IMPORTANCE: Record<'critical' | 'important' | 'helpful', { label: string; tone: Tone; bar: string; width: string }> = {
  critical: { label: 'Critical', tone: 'clay', bar: 'bg-clay-500', width: 'w-full' },
  important: { label: 'Important', tone: 'gold', bar: 'bg-gold-400', width: 'w-2/3' },
  helpful: { label: 'Helpful', tone: 'sky', bar: 'bg-sky-500', width: 'w-1/3' },
};

export function transitionStage(r: number): string {
  if (r >= 75) return 'Nearly ready';
  if (r >= 55) return 'Strong foundation';
  if (r >= 40) return 'Building momentum';
  return 'Early stage';
}

function RingLabel({ value }: { value: number }) {
  const n = useCountUp(Math.round(value));
  return (
    <>
      <span className="text-[40px] font-extrabold leading-none tracking-tight text-white tabular-nums">
        {n}
        <span className="align-top text-lg text-white/50">%</span>
      </span>
      <span className="mt-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-gold-300">{transitionStage(value)}</span>
    </>
  );
}

function StateCard({ label, role, sub, highlight }: { label: string; role: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-2xl p-4 ring-1 ring-inset backdrop-blur', highlight ? 'bg-gold-400/10 ring-gold-300/40' : 'bg-white/5 ring-white/15')}>
      <p className={cn('text-[10px] font-bold uppercase tracking-[0.16em]', highlight ? 'text-gold-300' : 'text-slate-400')}>{label}</p>
      <p className="mt-1.5 text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">{role}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function TransitionView({ analysis, source, progress, actions, isGoal, className }: {
  analysis: CareerTransitionAnalysis;
  source?: AISource;
  progress: EmployeeProgress | null;
  actions?: ReactNode;
  isGoal?: boolean;
  className?: string;
}) {
  const domain = analysis.targetDomainId ? getDomain(analysis.targetDomainId) : undefined;
  const linked = analysis.pathway.filter((s) => s.moduleId && getModule(s.moduleId));
  const done = linked.filter((s) => progress?.modules[s.moduleId!]?.status === 'completed').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hero */}
      <section className="relative animate-fade-up overflow-hidden rounded-3xl bg-ink-950 p-5 text-white shadow-lift sm:p-8">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-gold-400/15 blur-3xl" aria-hidden />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {isGoal ? (
                <Badge tone="white" icon={<Flag className="h-3 w-3" />}>
                  Your career goal
                </Badge>
              ) : (
                <Badge tone="white" icon={<Compass className="h-3 w-3" />}>
                  Exploring
                </Badge>
              )}
              {domain && (
                <Badge tone="white" icon={<Target className="h-3 w-3" />}>
                  {domain.name}
                </Badge>
              )}
              <AISourceBadge source={source} />
            </div>
            <div className="mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <StateCard label="Current state" role={analysis.currentRole} sub="Where you are today" />
              <div className="flex justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-lg shadow-gold-500/30">
                  <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
                </span>
              </div>
              <StateCard label="Target state" role={analysis.targetRole} sub={domain ? `Learning domain: ${domain.shortName}` : 'Outside the current learning catalogue'} highlight />
            </div>
            {linked.length > 0 && progress && (
              <p className="mt-4 text-sm text-slate-300">
                <span className="font-bold text-white">{done}</span> of {linked.length} pathway modules completed
              </p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing value={analysis.readiness} color="#ffc21a" track="rgba(255,255,255,0.12)" size={172} stroke={14}>
              <RingLabel value={analysis.readiness} />
            </ScoreRing>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Transition readiness</p>
          </div>
        </div>
      </section>

      {actions && <div className="flex animate-fade-up flex-col gap-2 sm:flex-row sm:flex-wrap [animation-delay:80ms]">{actions}</div>}

      {/* Skills */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up [animation-delay:120ms]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-950">Transferable skills you already have</h3>
              <p className="text-[13px] text-slate-500">Strengths that carry straight into {analysis.targetRole} work</p>
            </div>
          </div>
          <ul className="space-y-3">
            {analysis.transferableSkills.map((s) => (
              <li key={s.skill} className="flex items-start gap-3 rounded-xl bg-brand-50/40 p-3 ring-1 ring-inset ring-brand-100">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-950">{s.skill}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{s.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="animate-fade-up [animation-delay:180ms]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-50 text-clay-600">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-950">Skills to build</h3>
              <p className="text-[13px] text-slate-500">Ranked by how much they matter for the move</p>
            </div>
          </div>
          <ul className="space-y-3">
            {analysis.missingSkills.map((s) => {
              const meta = IMPORTANCE[s.importance];
              return (
                <li key={s.skill} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-ink-950">{s.skill}</p>
                    <Badge tone={meta.tone} className="shrink-0">
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full', meta.bar, meta.width)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* AI competencies */}
      <Card className="animate-fade-up [animation-delay:240ms]">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-950">AI competencies the role requires</h3>
            <p className="text-[13px] text-slate-500">How {analysis.targetRole} work is being augmented by AI</p>
          </div>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {analysis.aiCompetencies.map((c) => (
            <div key={c} className="flex items-center gap-2.5 rounded-xl bg-violet-50/50 px-3.5 py-3 ring-1 ring-inset ring-violet-100">
              <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
              <span className="text-sm font-semibold text-ink-900">{c}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pathway */}
      <Card className="animate-fade-up [animation-delay:300ms]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">Recommended learning pathway</p>
            <h3 className="mt-1 text-lg font-extrabold tracking-tight text-ink-950">
              {analysis.currentRole} → {analysis.targetRole}
            </h3>
          </div>
          <p className="text-sm text-slate-500">{analysis.pathway.length} steps</p>
        </div>
        <ol>
          {analysis.pathway.map((s, i) => {
            const m = s.moduleId ? getModule(s.moduleId) : undefined;
            const status = m ? progress?.modules[m.id]?.status : undefined;
            const inPath = m ? progress?.path.some((p) => p.moduleId === m.id) : false;
            const last = i === analysis.pathway.length - 1;
            const body = (
              <div className={cn('min-w-0 flex-1 rounded-2xl border p-4 transition', m ? 'border-slate-200/80 bg-white group-hover:border-brand-300 group-hover:shadow-card' : 'border-dashed border-slate-300 bg-slate-50/60')}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {status === 'completed' && (
                    <Badge tone="brand" icon={<Check className="h-3 w-3" />}>
                      Completed
                    </Badge>
                  )}
                  {status === 'in-progress' && <Badge tone="sky">In progress</Badge>}
                  {m && progress && inPath && (!status || status === 'not-started') && <Badge tone="neutral">In your path</Badge>}
                  {m && progress && !inPath && <Badge tone="gold">Not in your path yet</Badge>}
                  {m && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> {m.estimatedMinutes} min
                    </span>
                  )}
                  {!m && <Badge tone="neutral">Beyond the platform</Badge>}
                </div>
                <p className="mt-2 flex items-start justify-between gap-2 text-[15px] font-bold leading-snug text-ink-950">
                  <span>{s.title}</span>
                  {m && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-600" />}
                </p>
                {s.description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.description}</p>}
              </div>
            );
            return (
              <li key={`${s.step}-${s.title}`} className="relative flex gap-3.5 pb-4 sm:gap-4">
                {!last && <span className="absolute left-[17px] top-10 h-[calc(100%-2.5rem)] w-px bg-slate-200 sm:left-[19px]" aria-hidden />}
                <span
                  className={cn(
                    'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold tabular-nums sm:h-10 sm:w-10',
                    status === 'completed' ? 'bg-brand-600 text-white' : status === 'in-progress' ? 'bg-sky-500 text-white' : m ? 'bg-white text-ink-900 ring-2 ring-slate-200' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {status === 'completed' ? <Check className="h-4 w-4" strokeWidth={3} /> : m ? i + 1 : <Flag className="h-4 w-4" />}
                </span>
                {m ? (
                  <Link to={`/app/learning/${m.id}`} className="group min-w-0 flex-1">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Outlook */}
      <Card className="animate-fade-up [animation-delay:360ms]">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
            <Compass className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-950">Your outlook</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-900">{analysis.outlook}</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3.5 text-[13px] leading-relaxed text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p>
            <span className="font-semibold text-ink-900">A responsible view: </span>
            AI mostly changes the tasks within roles rather than removing whole professions. Treat this analysis as guidance, not a guarantee — outcomes depend on your effort, the opportunities available and the local job market.
          </p>
        </div>
        <AIDisclaimer compact className="mt-3" />
      </Card>
    </div>
  );
}
