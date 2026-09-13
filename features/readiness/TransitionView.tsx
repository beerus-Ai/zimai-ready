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
  critical: { label: 'Critical', tone: 'clay', bar: 'bg-clay-400', width: 'w-full' },
  important: { label: 'Important', tone: 'gold', bar: 'bg-gold-400', width: 'w-2/3' },
  helpful: { label: 'Helpful', tone: 'violet', bar: 'bg-lilac-500', width: 'w-1/3' },
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
      <span className="font-display text-5xl font-medium leading-none tracking-tight text-canvas tabular-nums">
        {n}
        <span className="align-top text-lg text-canvas/50">%</span>
      </span>
      <span className="mt-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-gold-300">{transitionStage(value)}</span>
    </>
  );
}

function StateCard({ label, role, sub, highlight }: { label: string; role: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-2xl p-4 ring-1 ring-inset backdrop-blur', highlight ? 'bg-gold-400/15 ring-gold-300/50' : 'bg-canvas/5 ring-canvas/15')}>
      <p className={cn('text-[10px] font-bold uppercase tracking-[0.16em]', highlight ? 'text-gold-300' : 'text-canvas/60')}>{label}</p>
      <p className="mt-1.5 font-display text-2xl leading-tight text-canvas sm:text-[1.7rem]">{role}</p>
      {sub && <p className="mt-1 text-xs text-canvas/60">{sub}</p>}
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
    <div className={cn('space-y-6', className)}>
      {/* Hero */}
      <section className="relative animate-ghost-in overflow-hidden rounded-4xl bg-brand-800 p-5 text-canvas sm:p-10">
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
              <StateCard label="Current state" role={analysis.currentRole} />
              <div className="flex justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 text-ink-950">
                  <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
                </span>
              </div>
              <StateCard label="Target state" role={analysis.targetRole} sub={domain ? `Learning domain: ${domain.shortName}` : 'Outside the current learning catalogue'} highlight />
            </div>
            {linked.length > 0 && progress && (
              <p className="mt-4 text-sm text-canvas/75">
                <span className="font-condensed text-lg text-canvas">{done}</span> of {linked.length} pathway modules completed
              </p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing value={analysis.readiness} color="#ffa946" track="rgba(255,254,235,0.14)" size={172} stroke={14} className="animate-scale-in">
              <RingLabel value={analysis.readiness} />
            </ScoreRing>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-canvas/60">Transition readiness</p>
          </div>
        </div>
      </section>

      {actions && <div className="flex animate-ghost-in flex-col gap-2 sm:flex-row sm:flex-wrap [animation-delay:80ms]">{actions}</div>}

      {/* Skills */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-ghost-in [animation-delay:120ms]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl leading-tight text-ink-950">Transferable skills</h3>
          </div>
          <ul className="space-y-3">
            {analysis.transferableSkills.map((s) => (
              <li key={s.skill} className="flex items-start gap-3 rounded-xl bg-brand-50/50 p-3 ring-1 ring-inset ring-brand-800/10">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-800 text-canvas">
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

        <Card className="animate-ghost-in [animation-delay:180ms]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clay-50 text-clay-600">
              <Target className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl leading-tight text-ink-950">Skills to build</h3>
          </div>
          <ul className="space-y-3">
            {analysis.missingSkills.map((s) => {
              const meta = IMPORTANCE[s.importance];
              return (
                <li key={s.skill} className="rounded-xl border border-ink-950/10 bg-sand-100/50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-ink-950">{s.skill}</p>
                    <Badge tone={meta.tone} className="shrink-0">
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200">
                    <div className={cn('h-full rounded-full', meta.bar, meta.width)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* AI competencies */}
      <Card className="animate-ghost-in [animation-delay:240ms]">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lilac-100 text-lilac-800">
            <Bot className="h-5 w-5" />
          </span>
          <h3 className="font-display text-xl leading-tight text-ink-950">AI competencies required</h3>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {analysis.aiCompetencies.map((c) => (
            <div key={c} className="flex items-center gap-2.5 rounded-xl bg-lilac-50 px-3.5 py-3 ring-1 ring-inset ring-lilac-200/70">
              <Sparkles className="h-4 w-4 shrink-0 text-lilac-600" />
              <span className="text-sm font-semibold text-ink-900">{c}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pathway */}
      <Card className="animate-ghost-in [animation-delay:300ms]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-800">Recommended learning pathway</p>
            <h3 className="mt-1 font-display text-2xl leading-tight text-ink-950 sm:text-3xl">
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
              <div className={cn('min-w-0 flex-1 rounded-2xl border p-4 transition', m ? 'border-ink-950/10 bg-paper group-hover:-translate-y-0.5 group-hover:border-ink-950 group-hover:shadow-ink-sm' : 'border-dashed border-ink-950/20 bg-sand-100/70')}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {status === 'completed' && (
                    <Badge tone="brand" icon={<Check className="h-3 w-3" />}>
                      Completed
                    </Badge>
                  )}
                  {status === 'in-progress' && <Badge tone="violet">In progress</Badge>}
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
                  {m && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-ink-950" />}
                </p>
                {s.description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.description}</p>}
              </div>
            );
            return (
              <li key={`${s.step}-${s.title}`} className="relative flex gap-3.5 pb-4 sm:gap-4">
                {!last && <span className="absolute left-[17px] top-10 h-[calc(100%-2.5rem)] w-px border-l border-dashed border-ink-950/20 sm:left-[19px]" aria-hidden />}
                <span
                  className={cn(
                    'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-condensed text-base tabular-nums sm:h-10 sm:w-10',
                    status === 'completed' ? 'bg-brand-800 text-canvas' : status === 'in-progress' ? 'border border-ink-950 bg-lilac-200 text-ink-950' : m ? 'bg-paper text-ink-900 ring-2 ring-ink-950/10' : 'bg-sand-200 text-slate-500',
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
      <Card className="animate-ghost-in [animation-delay:360ms]">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-800">
            <Compass className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-xl leading-tight text-ink-950">Your outlook</h3>
            <p className="mt-2 font-display text-lg leading-snug text-ink-900 sm:text-xl">{analysis.outlook}</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-sand-200/60 p-3.5 text-[13px] leading-relaxed text-slate-600">
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
