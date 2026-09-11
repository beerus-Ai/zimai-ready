import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gauge,
  GraduationCap,
  Map,
  Minus,
  PartyPopper,
  Plus,
  Radar,
  RefreshCw,
  Rocket,
  Route,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Workflow,
  X,
} from 'lucide-react';
import type { PathItem, PrescriptionCategory, ReadinessAssessment } from '../../types';
import { useApp } from '../../services/store';
import {
  AIDisclaimer,
  AISourceBadge,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  ScoreRing,
  useToast,
} from '../../components/ui';
import type { Tone } from '../../components/ui';
import { getModule } from '../../data/catalog';
import { industryName } from '../../data/industries';
import { roleName } from '../../data/roles';
import { skillName } from '../../data/skills';
import { computeScores } from '../../lib/scoring';
import type { ScoreFactor } from '../../lib/scoring';
import { exposureLabel, LEVEL_COLORS, PRIORITY_META } from '../../lib/readiness';
import { emptyModuleProgress } from '../../lib/progress';
import { objectiveLabel } from '../../lib/aiContext';
import { cn, formatDate, nowISO } from '../../lib/utils';

/**
 * /app/readiness — ANALYSE → RECOMMEND. The learner's AI Readiness Profile:
 * both scores, the readiness/exposure quadrant, Gemini's narrative, the
 * transparent score breakdown and the AI Skills Prescription.
 */

export const CATEGORY_META: Record<PrescriptionCategory, { label: string; tone: Tone }> = {
  fundamentals: { label: 'Fundamentals', tone: 'sky' },
  domain: { label: 'Role-specific', tone: 'brand' },
  responsible: { label: 'Responsible AI', tone: 'violet' },
  practical: { label: 'Practical challenge', tone: 'gold' },
  transition: { label: 'Career transition', tone: 'clay' },
  advanced: { label: 'Advanced', tone: 'dark' },
};

const EXPOSURE_HEX = '#394b65';

const PRIORITY_VISUAL = {
  warn: { tone: 'clay' as Tone, icon: <AlertTriangle className="h-3.5 w-3.5" />, panel: 'bg-clay-50/70 ring-clay-200/70', text: 'text-clay-800' },
  good: { tone: 'brand' as Tone, icon: <CheckCircle2 className="h-3.5 w-3.5" />, panel: 'bg-brand-50/70 ring-brand-200/70', text: 'text-brand-800' },
  info: { tone: 'sky' as Tone, icon: <Rocket className="h-3.5 w-3.5" />, panel: 'bg-sky-50/70 ring-sky-200/70', text: 'text-sky-800' },
  neutral: { tone: 'neutral' as Tone, icon: <Sprout className="h-3.5 w-3.5" />, panel: 'bg-slate-50 ring-slate-200', text: 'text-slate-700' },
};

export default function ReadinessPage() {
  const { latestAssessment: a, assessments, initialAssessment, progress, saveProgress } = useApp();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const isNew = params.get('new') === '1';
  const [updating, setUpdating] = useState(false);

  /** Staggered reveal — slower and more celebratory straight after an analysis. */
  const reveal = (i: number): CSSProperties => ({ animationDelay: `${i * (isNew ? 140 : 45)}ms` });

  const missing = useMemo(() => {
    if (!a || !progress) return [];
    const have = new Set(progress.path.map((p) => p.moduleId));
    return a.prescription.filter((p) => !have.has(p.moduleId) && getModule(p.moduleId));
  }, [a, progress]);

  if (!a) {
    return (
      <>
        <PageHeader eyebrow="AI Readiness" title="Your AI Readiness Profile" />
        <EmptyState
          icon={<Gauge className="h-6 w-6" />}
          title="No readiness assessment yet"
          description="Answer nine quick questions and we’ll analyse your personal AI readiness, your workplace AI exposure and the skills that matter most for you."
          action={
            <Button to="/onboarding" iconRight={<ArrowRight className="h-4 w-4" />}>
              Take the 2-minute assessment
            </Button>
          }
        />
      </>
    );
  }

  const level = LEVEL_COLORS[a.readinessLevel];
  const pmeta = PRIORITY_META[a.priorityState];
  const pvis = PRIORITY_VISUAL[pmeta.tone];
  const answers = a.answers;
  const totalMinutes = a.prescription.reduce((s, p) => s + p.estimatedMinutes, 0);
  const comparison = assessments.length >= 2 && initialAssessment && initialAssessment.id !== a.id ? initialAssessment : null;

  const updatePath = async () => {
    if (!progress || !missing.length) return;
    setUpdating(true);
    try {
      let added = 0;
      await saveProgress((prev) => {
        const base = prev ?? progress;
        const have = new Set(base.path.map((p) => p.moduleId));
        const top = base.path.reduce((m, p) => Math.max(m, p.priority), 0);
        const items: PathItem[] = missing
          .filter((p) => !have.has(p.moduleId))
          .map((p, i) => ({
            moduleId: p.moduleId,
            priority: top + i + 1,
            reason: p.reason,
            required: getModule(p.moduleId)?.requiredForCertification ?? false,
            addedBy: 'maintenance',
            addedAt: nowISO(),
          }));
        added = items.length;
        const modules = { ...base.modules };
        items.forEach((it) => {
          if (!modules[it.moduleId]) modules[it.moduleId] = emptyModuleProgress(it.moduleId);
        });
        return {
          ...base,
          path: [...base.path, ...items],
          modules,
          activity: [
            { at: nowISO(), type: 'path' as const, label: `Learning path updated with ${items.length} module${items.length === 1 ? '' : 's'} from your latest assessment` },
            ...base.activity,
          ].slice(0, 50),
        };
      });
      toast.success('Learning path updated', `${added} new module${added === 1 ? '' : 's'} added from your latest AI Skills Prescription. Your existing progress is unchanged.`);
    } catch {
      toast.error('Couldn’t update your path', 'Please try again in a moment.');
    } finally {
      setUpdating(false);
    }
  };

  const dismissBanner = () => {
    const next = new URLSearchParams(params);
    next.delete('new');
    setParams(next, { replace: true });
  };

  return (
    <div className="pb-6">
      <PageHeader
        eyebrow="AI Readiness"
        title="Your AI Readiness Profile"
        description={`${a.kind === 'reassessment' ? 'Reassessment' : 'Initial assessment'} · ${formatDate(a.createdAt)} · personalised to your role, workplace and goals.`}
        actions={
          <>
            <Button to="/onboarding?retake=1" variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
              Retake assessment
            </Button>
            <Button to="/app/learning" size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
              {progress ? 'Continue learning' : 'Start learning'}
            </Button>
          </>
        }
      />

      {isNew && (
        <div className="relative mb-6 animate-scale-in overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-4 text-white shadow-glow sm:p-5">
          <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="relative flex items-start gap-3 sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <PartyPopper className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold">Analysis complete</p>
              <p className="text-sm text-brand-50/90">
                {a.kind === 'reassessment' ? 'Your profile has been updated. See what changed below.' : 'Here is where you stand with AI — and exactly what to learn next.'}
              </p>
            </div>
            <AISourceBadge source={a.source} className="hidden bg-white/15 text-white ring-white/25 sm:inline-flex" />
            <button onClick={dismissBanner} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Hero: scores + quadrant ── */}
      <Card className="animate-fade-up overflow-hidden p-0 sm:p-0" style={reveal(0)} padded={false}>
        <div className="grid lg:grid-cols-[1fr_minmax(300px,380px)]">
          <div className="relative p-5 sm:p-7">
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl" aria-hidden />
            <div className="relative grid grid-cols-2 gap-4 sm:gap-8">
              <ScoreBlock
                title="Personal AI Readiness"
                hint="How prepared you are to work with AI"
                ring={<ScoreRing value={a.personalReadiness} color={level.hex} label={a.readinessLevel} size={150} stroke={13} className="scale-[0.82] sm:scale-100" />}
              />
              <ScoreBlock
                title="Workplace AI Exposure"
                hint="How much AI is changing your work"
                ring={<ScoreRing value={a.workplaceExposure} color={EXPOSURE_HEX} label={exposureLabel(a.workplaceExposure)} size={150} stroke={13} className="scale-[0.82] sm:scale-100" />}
              />
            </div>
            <div className={cn('relative mt-5 rounded-2xl p-4 ring-1 ring-inset', pvis.panel)}>
              <Badge tone={pvis.tone} icon={pvis.icon}>
                {a.priorityState}
              </Badge>
              <p className={cn('mt-2 text-sm leading-relaxed', pvis.text)}>{pmeta.description}</p>
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Where you stand</p>
            <Quadrant readiness={a.personalReadiness} exposure={a.workplaceExposure} previous={comparison} />
          </div>
        </div>
      </Card>

      {/* ── Profile chips ── */}
      <div className="mt-4 flex animate-fade-up flex-wrap gap-2" style={reveal(1)}>
        <ProfileChip icon={<Briefcase className="h-3.5 w-3.5" />} label={answers.jobTitle || roleName(answers.roleId, answers.roleOther)} />
        <ProfileChip icon={<Building2 className="h-3.5 w-3.5" />} label={industryName(answers.industryId, answers.industryOther)} />
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 ring-inset', level.bg, level.text, level.ring)}>
          <Gauge className="h-3.5 w-3.5" /> {a.readinessLevel}
        </span>
        <ProfileChip icon={<Target className="h-3.5 w-3.5" />} label={objectiveLabel(answers.careerObjective)} />
        {answers.careerObjective === 'transition' && answers.targetCareer && <ProfileChip icon={<Route className="h-3.5 w-3.5" />} label={`Target: ${answers.targetCareer}`} />}
      </div>

      {/* ── Summary ── */}
      <Card className="mt-6 animate-fade-up" style={reveal(2)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
            <Sparkles className="h-4 w-4" /> Your personalised analysis
          </p>
          <AISourceBadge source={a.source} />
        </div>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-900 sm:text-[17px]">{a.summary}</p>
        {a.improvementExplanation && (
          <div className="mt-4 rounded-xl bg-brand-50/60 p-4 ring-1 ring-inset ring-brand-200/60">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-800">
              <TrendingUp className="h-4 w-4" /> Since your last assessment
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{a.improvementExplanation}</p>
            {!!a.improvementDrivers?.length && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {a.improvementDrivers.map((d) => (
                  <Badge key={d} tone="brand" icon={<Check className="h-3 w-3" />}>
                    {d}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Career transition callout ── */}
      {a.careerTransition && (
        <Link
          to="/app/career"
          className="group mt-4 flex animate-fade-up flex-col gap-4 overflow-hidden rounded-2xl bg-ink-950 p-5 text-white shadow-lift transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-6"
          style={reveal(3)}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-ink-950">
            <Route className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-300">Career transition</p>
            <p className="mt-1 text-lg font-extrabold tracking-tight sm:text-xl">
              {a.careerTransition.currentRole} <span className="text-gold-300">→</span> {a.careerTransition.targetRole}
            </p>
            <div className="mt-2 flex max-w-sm items-center gap-3">
              <ProgressBar value={a.careerTransition.readiness} tone="gold" size="xs" className="flex-1" />
              <span className="text-sm font-semibold tabular-nums text-slate-200">Transition readiness {a.careerTransition.readiness}%</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gold-300 group-hover:text-gold-200">
            View career path <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      {/* ── Five insight sections ── */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InsightCard style={reveal(4)} title="Your strengths" icon={<Star className="h-5 w-5" />} tone="brand" items={a.strengths} bullet={<Check className="h-3.5 w-3.5" strokeWidth={3} />} />
        <InsightCard style={reveal(5)} title="Your AI skills gaps" icon={<Target className="h-5 w-5" />} tone="clay" items={a.gaps} bullet={<span className="h-1.5 w-1.5 rounded-full bg-current" />} />
        <InsightCard style={reveal(6)} title="How AI is changing your role" icon={<Workflow className="h-5 w-5" />} tone="sky" items={a.roleChanges} bullet={<RefreshCw className="h-3 w-3" />} />
        <InsightCard style={reveal(7)} title="What you should learn next" icon={<GraduationCap className="h-5 w-5" />} tone="violet" items={a.learnNext} numbered />
        <Card className="animate-fade-up md:col-span-2" style={reveal(8)}>
          <SectionHead title="Career opportunities" icon={<TrendingUp className="h-5 w-5" />} tone="gold" />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {a.careerOpportunities.map((c) => (
              <div key={c} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">
                <Briefcase className="h-4 w-4 shrink-0 text-gold-600" />
                <span className="text-sm font-semibold text-ink-950">{c}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Transparency ── */}
      <div className="mt-4 animate-fade-up" style={reveal(9)}>
        <HowCalculated assessment={a} />
      </div>

      {/* ── Initial vs latest ── */}
      {comparison && (
        <div className="mt-4 animate-fade-up" style={reveal(10)}>
          <Comparison initial={comparison} latest={a} />
        </div>
      )}

      {/* ── Prescription ── */}
      <Card className="mt-6 animate-fade-up" style={reveal(11)}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">Recommend</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-ink-950 sm:text-2xl">Your AI Skills Prescription</h2>
            <p className="mt-1 text-sm text-slate-500">
              {a.prescription.length} modules · about {Math.round(totalMinutes / 5) * 5} minutes · in the order that matters most for you
            </p>
          </div>
          <AISourceBadge source={a.source} />
        </div>

        <ol className="relative">
          {a.prescription.map((p, i) => {
            const status = progress?.modules[p.moduleId]?.status;
            const inPath = progress?.path.some((x) => x.moduleId === p.moduleId);
            const cat = CATEGORY_META[p.category] ?? CATEGORY_META.domain;
            const last = i === a.prescription.length - 1;
            return (
              <li key={p.moduleId} className="relative flex gap-3.5 pb-5 sm:gap-4">
                {!last && <span className="absolute left-[17px] top-10 h-[calc(100%-2.5rem)] w-px bg-slate-200 sm:left-[19px]" aria-hidden />}
                <span
                  className={cn(
                    'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold tabular-nums sm:h-10 sm:w-10',
                    status === 'completed' ? 'bg-brand-600 text-white' : i === 0 ? 'bg-ink-950 text-white' : 'bg-white text-ink-900 ring-2 ring-slate-200',
                  )}
                >
                  {status === 'completed' ? <Check className="h-4 w-4" strokeWidth={3} /> : p.priority}
                </span>
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-slate-300 hover:shadow-card">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={cat.tone}>{cat.label}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> {p.estimatedMinutes} min
                    </span>
                    {status === 'completed' && <Badge tone="brand" icon={<Check className="h-3 w-3" />}>Completed</Badge>}
                    {status === 'in-progress' && <Badge tone="sky">In progress</Badge>}
                    {progress && !inPath && <Badge tone="gold" icon={<Plus className="h-3 w-3" />}>Not yet in your path</Badge>}
                  </div>
                  <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink-950 sm:text-base">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    <span className="font-semibold text-ink-900">Why it matters: </span>
                    {p.reason}
                  </p>
                  {p.skillIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.skillIds.map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {skillName(s)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {progress
              ? missing.length
                ? `${missing.length} prescribed module${missing.length === 1 ? ' is' : 's are'} not yet in your learning path.`
                : 'Your learning path already includes every prescribed module.'
              : 'Your path adapts as you learn — modules you master move you forward faster.'}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {progress && missing.length > 0 && (
              <Button variant="secondary" onClick={updatePath} loading={updating} icon={<Plus className="h-4 w-4" />}>
                Update my learning path
              </Button>
            )}
            <Button to="/app/learning" size="lg" icon={<Map className="h-5 w-5" />} iconRight={<ArrowRight className="h-4 w-4" />}>
              {progress ? 'Continue my learning path' : 'Start my learning path'}
            </Button>
          </div>
        </div>
      </Card>

      <AIDisclaimer className="mt-5">
        Scores come from ZimAI Ready’s transparent readiness model; the narrative and prescription are AI-personalised. AI-generated guidance may contain mistakes — apply your professional judgement.
      </AIDisclaimer>
    </div>
  );
}

// ───────────────────────────── Sub-components ─────────────────────────────

function ScoreBlock({ title, hint, ring }: { title: string; hint: string; ring: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-xs">{title}</p>
      <div className="-my-3 sm:my-3">{ring}</div>
      <p className="max-w-[12rem] text-xs text-slate-500 sm:text-[13px]">{hint}</p>
    </div>
  );
}

function ProfileChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 shadow-card ring-1 ring-inset ring-slate-200">
      <span className="text-slate-400">{icon}</span>
      {label}
    </span>
  );
}

const SECTION_TONES = {
  brand: 'bg-brand-50 text-brand-700',
  clay: 'bg-clay-50 text-clay-600',
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
  gold: 'bg-gold-50 text-gold-700',
} as const;

function SectionHead({ title, icon, tone }: { title: string; icon: ReactNode; tone: keyof typeof SECTION_TONES }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', SECTION_TONES[tone])}>{icon}</span>
      <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-950">{title}</h3>
    </div>
  );
}

function InsightCard({ title, icon, tone, items, bullet, numbered, style }: {
  title: string;
  icon: ReactNode;
  tone: keyof typeof SECTION_TONES;
  items: string[];
  bullet?: ReactNode;
  numbered?: boolean;
  style?: CSSProperties;
}) {
  return (
    <Card className="animate-fade-up" style={style}>
      <SectionHead title={title} icon={icon} tone={tone} />
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={it} className="flex items-start gap-3 text-[14px] leading-relaxed text-slate-700">
            <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', SECTION_TONES[tone])}>{numbered ? i + 1 : bullet}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const QUADRANTS = [
  { key: 'Future Ready', pos: 'top-left', note: 'Skills ahead of workplace' },
  { key: 'Well Positioned', pos: 'top-right', note: 'Skills match the change' },
  { key: 'Build Foundations', pos: 'bottom-left', note: 'Early change, early start' },
  { key: 'Priority Upskilling Recommended', pos: 'bottom-right', note: 'Change outpacing skills' },
] as const;

export function Quadrant({ readiness, exposure, previous, compact }: { readiness: number; exposure: number; previous?: ReadinessAssessment | null; compact?: boolean }) {
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setPlaced(true), 250);
    return () => window.clearTimeout(t);
  }, []);
  const hiR = readiness > 50;
  const hiE = exposure > 50;
  const current = hiR ? (hiE ? 'Well Positioned' : 'Future Ready') : hiE ? 'Priority Upskilling Recommended' : 'Build Foundations';
  const pad = (v: number) => 6 + (Math.max(0, Math.min(100, v)) / 100) * 88; // keep the dot inside the frame
  const x = placed ? pad(exposure) : 50;
  const y = placed ? pad(readiness) : 50;
  return (
    <div className={cn('mx-auto w-full', compact ? 'max-w-[260px]' : 'max-w-[330px]')}>
      <div className="flex gap-2">
        <div className="flex w-4 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Readiness →</span>
        </div>
        <div className="relative aspect-square w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {QUADRANTS.map((q) => {
              const on = q.key === current;
              return (
                <div
                  key={q.key}
                  className={cn(
                    'flex p-2 transition-colors duration-700 sm:p-2.5',
                    q.pos.startsWith('top') ? 'items-start' : 'items-end',
                    q.pos.endsWith('right') ? 'justify-end text-right' : 'justify-start text-left',
                    q.pos === 'top-left' && 'border-b border-r border-dashed border-slate-200',
                    q.pos === 'top-right' && 'border-b border-dashed border-slate-200',
                    q.pos === 'bottom-left' && 'border-r border-dashed border-slate-200',
                    on ? (q.key === 'Priority Upskilling Recommended' ? 'bg-clay-50' : q.key === 'Well Positioned' ? 'bg-brand-50' : q.key === 'Future Ready' ? 'bg-sky-50' : 'bg-slate-100/70') : 'bg-white',
                  )}
                >
                  <span className="max-w-[92%]">
                    <span className={cn('block text-[10px] font-extrabold leading-tight sm:text-[11px]', on ? 'text-ink-950' : 'text-slate-400')}>{q.key === 'Priority Upskilling Recommended' ? 'Priority Upskilling' : q.key}</span>
                    {!compact && <span className={cn('mt-0.5 hidden text-[10px] leading-tight sm:block', on ? 'text-slate-600' : 'text-slate-300')}>{q.note}</span>}
                  </span>
                </div>
              );
            })}
          </div>
          {previous && (
            <span
              className="absolute h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-dashed border-slate-400 bg-white"
              style={{ left: `${pad(previous.workplaceExposure)}%`, bottom: `${pad(previous.personalReadiness)}%` }}
              title={`Initial: readiness ${previous.personalReadiness}%, exposure ${previous.workplaceExposure}%`}
            />
          )}
          <span
            className="absolute -translate-x-1/2 translate-y-1/2"
            style={{ left: `${x}%`, bottom: `${y}%`, transition: 'left 1.2s cubic-bezier(.2,.8,.2,1), bottom 1.2s cubic-bezier(.2,.8,.2,1)' }}
          >
            <span className="absolute inset-0 -m-2 animate-ping-slow rounded-full bg-brand-500/40" />
            <span className="relative block h-4 w-4 rounded-full border-[3px] border-white bg-brand-600 shadow-lift" />
          </span>
        </div>
      </div>
      <div className="ml-6 mt-1.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Workplace AI exposure →</div>
      {previous && (
        <p className="ml-6 mt-2 flex items-center justify-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-slate-400" /> Initial
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Now
          </span>
        </p>
      )}
    </div>
  );
}

const PERSONAL_MAX = [38, 26, 22, 5, 8];
const EXPOSURE_MAX = [40, 40, 12, 8];

function HowCalculated({ assessment }: { assessment: ReadinessAssessment }) {
  const [open, setOpen] = useState(false);
  const s = useMemo(() => computeScores(assessment.answers), [assessment.answers]);
  const personal = s.factors.filter((f) => f.group === 'personal');
  const exposure = s.factors.filter((f) => f.group === 'exposure');
  const dR = assessment.personalReadiness - s.personalReadiness;
  const dE = assessment.workplaceExposure - s.workplaceExposure;
  return (
    <Card padded={false}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-5 text-left sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-ink-900">
          <Calculator className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-ink-950">How we calculated this</span>
          <span className="block text-sm text-slate-500">Transparent, rule-based scoring — the same answers always give the same scores.</span>
        </span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="animate-fade-in border-t border-slate-100 p-5 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FactorGroup title="Personal AI readiness" icon={<Gauge className="h-4 w-4" />} total={s.personalReadiness} factors={personal} maxes={PERSONAL_MAX} color={LEVEL_COLORS[assessment.readinessLevel].hex} />
            <FactorGroup title="Workplace AI exposure" icon={<Radar className="h-4 w-4" />} total={s.workplaceExposure} factors={exposure} maxes={EXPOSURE_MAX} color={EXPOSURE_HEX} />
          </div>
          <div className="mt-5 space-y-1.5 rounded-xl bg-slate-50 p-4 text-[13px] leading-relaxed text-slate-600">
            <p>
              <span className="font-semibold text-ink-900">Personal AI readiness</span> = how often you use AI (max 38) + confidence (max 26) + breadth of AI use (max 22) + experience (max 5) + AI in your workplace (max 8).
            </p>
            <p>
              <span className="font-semibold text-ink-900">Workplace AI exposure</span> = 40% of your sector’s baseline + 40% of your function’s baseline, adjusted for organisation and department adoption.
            </p>
            {(dR !== 0 || dE !== 0) && (
              <p className="flex items-start gap-1.5 text-brand-800">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Gemini refined the engine scores ({dR >= 0 ? '+' : ''}
                {dR} readiness, {dE >= 0 ? '+' : ''}
                {dE} exposure) based on your full profile. Refinements are capped at ±10 points.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function FactorGroup({ title, icon, total, factors, maxes, color }: { title: string; icon: ReactNode; total: number; factors: ScoreFactor[]; maxes: number[]; color: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-ink-950">
          <span className="text-slate-400">{icon}</span> {title}
        </p>
        <span className="text-sm font-extrabold tabular-nums text-ink-950">{total}/100</span>
      </div>
      <ul className="space-y-2.5">
        {factors.map((f, i) => {
          const max = maxes[i] ?? 40;
          const neg = f.impact < 0;
          return (
            <li key={f.label}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-600">{f.label}</span>
                <span className={cn('font-bold tabular-nums', neg ? 'text-clay-600' : f.impact === 0 ? 'text-slate-400' : 'text-ink-950')}>
                  {f.impact > 0 ? '+' : ''}
                  {f.impact}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, (Math.abs(f.impact) / max) * 100)}%`, background: neg ? '#f4511e' : color }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Delta({ value }: { value: number }) {
  if (value === 0)
    return (
      <Badge tone="neutral" icon={<Minus className="h-3 w-3" />}>
        No change
      </Badge>
    );
  return value > 0 ? (
    <Badge tone="brand" icon={<TrendingUp className="h-3 w-3" />}>
      +{value}
    </Badge>
  ) : (
    <Badge tone="clay" icon={<TrendingDown className="h-3 w-3" />}>
      {value}
    </Badge>
  );
}

function Comparison({ initial, latest }: { initial: ReadinessAssessment; latest: ReadinessAssessment }) {
  const rows = [
    { label: 'Personal AI readiness', from: initial.personalReadiness, to: latest.personalReadiness, color: LEVEL_COLORS[latest.readinessLevel].hex },
    { label: 'Workplace AI exposure', from: initial.workplaceExposure, to: latest.workplaceExposure, color: EXPOSURE_HEX },
  ];
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[15px] font-bold text-ink-950">
          <TrendingUp className="h-4 w-4 text-brand-600" /> Initial vs latest
        </p>
        <p className="text-xs text-slate-500">
          {formatDate(initial.createdAt)} → {formatDate(latest.createdAt)}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-slate-600">{r.label}</p>
              <Delta value={r.to - r.from} />
            </div>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink-950">
              <span className="text-base font-bold text-slate-400">{r.from}% → </span>
              {r.to}%
            </p>
            <div className="relative mt-2 h-2 rounded-full bg-slate-100">
              <div className="absolute inset-y-0 left-0 rounded-full bg-slate-300" style={{ width: `${r.from}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full opacity-90 transition-[width] duration-700" style={{ width: `${r.to}%`, background: r.color }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Readiness level: <span className="font-semibold text-slate-700">{initial.readinessLevel}</span> → <span className="font-semibold text-slate-700">{latest.readinessLevel}</span>
      </p>
    </Card>
  );
}
