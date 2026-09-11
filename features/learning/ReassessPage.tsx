import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, Award, BarChart3, BookOpen, CalendarClock, CircleCheck, ClipboardCheck, FlaskConical, Gauge, Layers,
  Lock, RefreshCw, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import type { ReadinessAssessment } from '../../types';
import {
  AIDisclaimer, AISourceBadge, Badge, Button, Card, CardTitle, EmptyState, ErrorState, Icon, LoadingState, OptionCard, PageHeader,
  ProgressBar, ScoreRing, useToast,
} from '../../components/ui';
import { useApp } from '../../services/store';
import { exposureLabel, LEVEL_COLORS, PRIORITY_META, SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { evaluateCertification } from '../../lib/certification';
import { pathStats, recordActivity } from '../../lib/progress';
import { cn, formatDate, sleep, timeAgo } from '../../lib/utils';
import type { AISource } from '../../types';
import {
  buildReassessment, changesSinceInitial, computeReassessmentScores, CONFIDENCE_OPTIONS, confidenceLabel, EVIDENCE_WEIGHTS,
  generateReassessmentInsights, reassessEligibility, USAGE_OPTIONS, USE_CASE_OPTIONS, usageLabel, useCaseLabel,
} from './reassess';
import type { ChangeSummary, PulseAnswers, ReassessmentScores } from './reassess';

type Step = 'intro' | 'usage' | 'confidence' | 'uses' | 'analysing' | 'results' | 'error';

interface Outcome {
  record: ReadinessAssessment;
  scores: ReassessmentScores;
  initial: ReadinessAssessment;
  source: AISource;
}

const ANALYSIS_MESSAGES = [
  'Comparing today with your initial assessment…',
  'Weighing lesson accuracy and practical scores…',
  'Checking the evidence behind each skill…',
  'Writing your personalised improvement analysis…',
];

/* ───────────────────────────── Shared pieces ───────────────────────────── */

function LevelBadge({ level }: { level: ReadinessAssessment['readinessLevel'] }) {
  const c = LEVEL_COLORS[level];
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset', c.bg, c.text, c.ring)}>{level}</span>;
}

function StatTile({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink-950 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Readiness scale bar showing the gain between two scores, with level thresholds. */
function GainBar({ from, to }: { from: number; to: number }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 350);
    return () => clearTimeout(t);
  }, []);
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const up = to >= from;
  return (
    <div>
      <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-slate-300" style={{ width: `${lo}%` }} />
        <div
          className={cn('absolute inset-y-0 transition-[width] duration-1000 ease-out', up ? 'bg-gradient-to-r from-brand-400 to-brand-600' : 'bg-gradient-to-r from-clay-300 to-clay-500')}
          style={{ left: `${lo}%`, width: shown ? `${hi - lo}%` : '0%' }}
        />
        {[25, 50, 75].map((t) => (
          <span key={t} className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${t}%` }} />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        <span>AI Beginner</span>
        <span>Developing</span>
        <span>AI Capable</span>
        <span>AI Ready</span>
      </div>
    </div>
  );
}

/** Readiness over time — custom SVG line chart. */
function TrendChart({ points }: { points: { score: number; date: string }[] }) {
  const gid = useId().replace(/:/g, '');
  const W = 600;
  const H = 180;
  const pad = { l: 36, r: 20, t: 20, b: 28 };
  const x = (i: number) => pad.l + (points.length === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (points.length - 1));
  const y = (v: number) => pad.t + (1 - v / 100) * (H - pad.t - pad.b);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[320px]" role="img" aria-label="Personal AI readiness over time">
        <defs>
          <linearGradient id={`g${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#15ae7c" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#15ae7c" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t % 50 ? '3 4' : undefined} />
            <text x={pad.l - 8} y={y(t) + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: 10, fontWeight: 600 }}>
              {t}
            </text>
          </g>
        ))}
        {points.length > 1 && <path d={area} fill={`url(#g${gid})`} />}
        {points.length > 1 && <path d={line} fill="none" stroke="#0a8a5f" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.score)} r={5.5} fill="#fff" stroke="#0a8a5f" strokeWidth={2.5} />
            <text x={x(i)} y={y(p.score) - 11} textAnchor="middle" className="fill-ink-950" style={{ fontSize: 11, fontWeight: 800 }}>
              {p.score}%
            </text>
            <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10, fontWeight: 600 }}>
              {formatDate(p.date, { day: 'numeric', month: 'short' })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function HistoryTimeline({ assessments }: { assessments: ReadinessAssessment[] }) {
  if (!assessments.length) return null;
  const newestFirst = [...assessments].reverse();
  return (
    <Card>
      <CardTitle icon={<CalendarClock className="h-5 w-5" />} title="Readiness history" subtitle="Every assessment you have taken" />
      {assessments.length > 1 && (
        <div className="mb-5 rounded-xl bg-slate-50/70 p-3">
          <TrendChart points={assessments.map((a) => ({ score: a.personalReadiness, date: a.createdAt }))} />
        </div>
      )}
      <ol className="relative space-y-4">
        <span className="absolute bottom-2 left-[11px] top-2 w-px bg-slate-200" aria-hidden />
        {newestFirst.map((a, i) => {
          const prev = newestFirst[i + 1];
          const delta = prev ? a.personalReadiness - prev.personalReadiness : null;
          return (
            <li key={a.id} className="relative flex items-start gap-4">
              <span className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white" style={{ background: LEVEL_COLORS[a.readinessLevel].hex }}>
                {a.kind === 'initial' ? <Gauge className="h-3 w-3 text-white" /> : <RefreshCw className="h-3 w-3 text-white" />}
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-white p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-ink-950">{a.kind === 'initial' ? 'Initial assessment' : 'Readiness reassessment'}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(a.createdAt)} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold tabular-nums text-ink-950">{a.personalReadiness}%</span>
                    <LevelBadge level={a.readinessLevel} />
                    {delta != null && (
                      <Badge tone={delta >= 0 ? 'brand' : 'clay'}>
                        {delta >= 0 ? '+' : ''}
                        {delta}
                      </Badge>
                    )}
                  </div>
                </div>
                {a.improvementExplanation && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{a.improvementExplanation}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function QuestionShell({ index, title, subtitle, onBack, children, footer }: { index: number; title: string; subtitle: string; onBack: () => void; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={onBack} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-ink-950" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500">
            <span>Pulse check</span>
            <span>Question {index} of 3</span>
          </div>
          <ProgressBar value={(index / 3) * 100} />
        </div>
      </div>
      <Card className="!p-5 sm:!p-8">
        <h2 className="text-xl font-extrabold tracking-tight text-ink-950 sm:text-2xl">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-7 flex flex-wrap items-center justify-end gap-2">{footer}</div>
      </Card>
    </div>
  );
}

const PreviouslyTag = () => <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Last time</span>;

/* ───────────────────────────── Page ───────────────────────────── */

export default function ReassessPage() {
  const { user, profile, progress, submissions, results, assessments, latestAssessment, initialAssessment, addAssessment, saveProgress } = useApp();
  const toast = useToast();
  const [step, setStep] = useState<Step>('intro');
  const [usage, setUsage] = useState<PulseAnswers['personalUsage'] | null>(null);
  const [confidence, setConfidence] = useState<PulseAnswers['confidence'] | null>(null);
  const [uses, setUses] = useState<PulseAnswers['useCases']>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);

  const eligibility = useMemo(() => reassessEligibility(progress, submissions), [progress, submissions]);
  const changes: ChangeSummary | null = useMemo(
    () => (initialAssessment ? changesSinceInitial({ initial: initialAssessment, profile, progress, submissions }) : null),
    [initialAssessment, profile, progress, submissions],
  );
  const status = useMemo(() => evaluateCertification({ progress, submissions, results }), [progress, submissions, results]);
  const previousAnswers = latestAssessment?.answers ?? initialAssessment?.answers;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const header = (
    <PageHeader
      eyebrow="Readiness"
      title="Reassess My AI Readiness"
      description="See how far you have come. Your new score blends a quick pulse check with the evidence you have demonstrated through learning and practice."
    />
  );

  if (!initialAssessment)
    return (
      <div className="animate-fade-up">
        {header}
        <EmptyState
          icon={<Gauge className="h-6 w-6" />}
          title="Take your initial readiness assessment first"
          description="A reassessment compares your progress with your starting point, so you need an initial AI readiness assessment."
          action={<Button to="/onboarding">Assess my readiness</Button>}
        />
      </div>
    );

  async function analyse(finalUses: PulseAnswers['useCases']) {
    if (running.current || !initialAssessment || !usage || !confidence || !user) return;
    running.current = true;
    setStep('analysing');
    setError(null);
    try {
      const pulse: PulseAnswers = { personalUsage: usage, confidence, useCases: finalUses };
      const scores = computeReassessmentScores({ initial: initialAssessment, pulse, progress, submissions });
      const ch = changesSinceInitial({ initial: initialAssessment, profile, progress, submissions });
      const [insights] = await Promise.all([generateReassessmentInsights({ initial: initialAssessment, scores, changes: ch, pulse, profile, progress }), sleep(2400)]);
      const record = buildReassessment({
        userId: user.id,
        previous: latestAssessment ?? initialAssessment,
        initial: initialAssessment,
        scores,
        insights: insights.data,
        source: insights.source,
      });
      await addAssessment(record);
      if (progress)
        await saveProgress((prev) =>
          recordActivity(prev ?? progress, 'reassessment', `Reassessed AI readiness: ${initialAssessment.personalReadiness}% → ${record.personalReadiness}%`),
        );
      setOutcome({ record, scores, initial: initialAssessment, source: insights.source });
      setStep('results');
      toast.success('Readiness updated', `Your personal AI readiness is now ${record.personalReadiness}%.`);
    } catch (e) {
      console.warn('[ZimAI] reassessment failed', e);
      setError('We could not save your reassessment. Your answers are still here — please try again.');
      setStep('error');
    } finally {
      running.current = false;
    }
  }

  /* ── Locked ── */
  if (!eligibility.eligible && step !== 'results') {
    const current = pathStats(progress).current;
    return (
      <div className="animate-fade-up">
        {header}
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Lock className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink-950">Reassessment unlocks after some learning</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Your readiness score should reflect what you have demonstrated, not just how you feel. Meet either requirement below to reassess.
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {eligibility.requirements.map((r) => (
                <li key={r.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-sm font-semibold text-ink-950">
                      {r.met ? <CircleCheck className="h-5 w-5 text-brand-600" /> : <span className="h-5 w-5 rounded-full border-2 border-slate-300" />}
                      {r.label}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-slate-500">{r.detail}</span>
                  </div>
                  <ProgressBar value={r.progress} size="xs" className="mt-3" />
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button to={current ? `/app/learning/${current.moduleId}` : '/app/learning'} iconRight={<ArrowRight className="h-4 w-4" />}>
                {progress ? 'Continue learning' : 'Start my learning path'}
              </Button>
              <Button to="/app/readiness" variant="outline">
                View current readiness
              </Button>
            </div>
          </Card>
          <div className="lg:col-span-2">
            <HistoryTimeline assessments={assessments} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Analysing ── */
  if (step === 'analysing')
    return (
      <div className="animate-fade-up">
        {header}
        <Card className="mx-auto max-w-2xl">
          <LoadingState variant="ai" title="Analysing your progress" messages={ANALYSIS_MESSAGES} />
        </Card>
      </div>
    );

  /* ── Error ── */
  if (step === 'error')
    return (
      <div className="animate-fade-up">
        {header}
        <ErrorState className="mx-auto max-w-2xl" title="Reassessment not saved" message={error} onRetry={() => analyse(uses)} />
      </div>
    );

  /* ── Q1: usage ── */
  if (step === 'usage')
    return (
      <QuestionShell
        index={1}
        title="How often do you use AI at work now?"
        subtitle="Think about the last few weeks, including anything you have tried since starting your learning."
        onBack={() => setStep('intro')}
        footer={
          <Button disabled={!usage} onClick={() => setStep('confidence')} iconRight={<ArrowRight className="h-4 w-4" />}>
            Next
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {USAGE_OPTIONS.map((o) => (
            <OptionCard
              key={o.id}
              selected={usage === o.id}
              onClick={() => setUsage(o.id)}
              icon={<Icon name={o.icon} className="h-5 w-5" />}
              label={
                <>
                  {o.label}
                  {previousAnswers?.personalUsage === o.id && <PreviouslyTag />}
                </>
              }
              description={o.description}
            />
          ))}
        </div>
      </QuestionShell>
    );

  /* ── Q2: confidence ── */
  if (step === 'confidence')
    return (
      <QuestionShell
        index={2}
        title="How confident are you using AI now?"
        subtitle="Rate your confidence in getting accurate, useful, verified results from AI tools."
        onBack={() => setStep('usage')}
        footer={
          <Button disabled={!confidence} onClick={() => setStep('uses')} iconRight={<ArrowRight className="h-4 w-4" />}>
            Next
          </Button>
        }
      >
        <div className="grid gap-2.5 sm:grid-cols-5">
          {CONFIDENCE_OPTIONS.map((o) => {
            const sel = confidence === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setConfidence(o.id)}
                aria-pressed={sel}
                className={cn(
                  'relative flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all active:scale-[0.98] sm:flex-col sm:items-center sm:gap-2 sm:px-2 sm:py-4 sm:text-center',
                  sel ? 'border-brand-500 bg-brand-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-brand-300',
                )}
              >
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold', sel ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}>{o.id}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink-950">{o.label}</span>
                  <span className="block text-xs leading-snug text-slate-500">{o.description}</span>
                </span>
                {previousAnswers?.confidence === o.id && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-slate-300" title="Last time" />}
              </button>
            );
          })}
        </div>
        {previousAnswers && <p className="mt-3 text-xs text-slate-500">Last time you rated yourself {previousAnswers.confidence}/5 ({confidenceLabel(previousAnswers.confidence)}).</p>}
      </QuestionShell>
    );

  /* ── Q3: use cases ── */
  if (step === 'uses')
    return (
      <QuestionShell
        index={3}
        title="What do you now use AI for?"
        subtitle="Select everything that applies."
        onBack={() => setStep('confidence')}
        footer={
          <Button onClick={() => analyse(uses)} icon={<Sparkles className="h-4 w-4" />}>
            {uses.length ? 'Analyse my progress' : 'None yet — analyse my progress'}
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {USE_CASE_OPTIONS.map((o) => {
            const sel = uses.includes(o.id);
            return (
              <OptionCard
                key={o.id}
                compact
                multi
                selected={sel}
                onClick={() => setUses((xs) => (sel ? xs.filter((x) => x !== o.id) : [...xs, o.id]))}
                icon={<Icon name={o.icon} className="h-4 w-4" />}
                label={o.label}
                description={previousAnswers?.useCases.includes(o.id) ? 'Selected last time' : undefined}
              />
            );
          })}
        </div>
      </QuestionShell>
    );

  /* ── Results ── */
  if (step === 'results' && outcome) {
    const { record, scores, initial } = outcome;
    const delta = record.personalReadiness - initial.personalReadiness;
    const levelChanged = record.readinessLevel !== initial.readinessLevel;
    const certReady = status.finalUnlocked || status.achievableLevel != null;
    const current = pathStats(progress).current;
    const pmeta = PRIORITY_META[record.priorityState];
    const ev = scores.evidence;
    const clipped = scores.raw !== scores.personalReadiness;
    return (
      <div className="animate-fade-up space-y-5">
        {header}

        {/* Comparison */}
        <Card className="relative overflow-hidden !p-5 sm:!p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
              <Badge tone={delta >= 0 ? 'brand' : 'clay'} icon={<TrendingUp className="h-3 w-3" />} className="!text-sm">
                {delta >= 0 ? '+' : ''}
                {delta} points
              </Badge>
              {levelChanged && delta > 0 && (
                <Badge tone="gold" icon={<Sparkles className="h-3 w-3" />}>
                  Level up
                </Badge>
              )}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 sm:gap-10">
              <div className="flex flex-col items-center text-center">
                <ScoreRing value={initial.personalReadiness} size={124} stroke={11} color={LEVEL_COLORS[initial.readinessLevel].hex} className="sm:hidden" />
                <ScoreRing value={initial.personalReadiness} size={168} stroke={14} color={LEVEL_COLORS[initial.readinessLevel].hex} className="hidden sm:inline-flex" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">Initial AI Readiness</p>
                <div className="mt-1.5">
                  <LevelBadge level={initial.readinessLevel} />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{formatDate(initial.createdAt)}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow sm:h-12 sm:w-12">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-center text-center">
                <ScoreRing value={record.personalReadiness} size={124} stroke={11} color={LEVEL_COLORS[record.readinessLevel].hex} className="sm:hidden" />
                <ScoreRing value={record.personalReadiness} size={168} stroke={14} color={LEVEL_COLORS[record.readinessLevel].hex} className="hidden sm:inline-flex" />
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">Current AI Readiness</p>
                <div className="mt-1.5">
                  <LevelBadge level={record.readinessLevel} />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Today</p>
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-2xl">
              <GainBar from={initial.personalReadiness} to={record.personalReadiness} />
            </div>
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Workplace AI exposure</p>
                <p className="mt-0.5 text-sm font-bold text-ink-950">
                  {record.workplaceExposure}% · {exposureLabel(record.workplaceExposure)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Priority state</p>
                <p className="mt-0.5 text-sm font-bold text-ink-950">{record.priorityState}</p>
                <p className="mt-0.5 text-xs text-slate-500">{pmeta.description}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-5">
          {/* AI analysis */}
          <Card className="lg:col-span-3">
            <CardTitle icon={<Sparkles className="h-5 w-5" />} title="What drove your change" subtitle="Your original assessment compared with demonstrated learning" action={<AISourceBadge source={outcome.source} />} />
            <p className="text-[15px] leading-relaxed text-slate-700">{record.improvementExplanation}</p>
            <ul className="mt-4 space-y-2.5">
              {(record.improvementDrivers ?? []).map((d, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-brand-50/60 p-3 text-sm text-ink-950">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Target className="h-3.5 w-3.5" /> Remaining gaps
                </p>
                <ul className="mt-2 space-y-1.5">
                  {record.gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-400" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <BookOpen className="h-3.5 w-3.5" /> Learn next
                </p>
                <ul className="mt-2 space-y-1.5">
                  {record.learnNext.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <AIDisclaimer className="mt-5" />
          </Card>

          {/* Transparent scoring */}
          <Card className="lg:col-span-2">
            <CardTitle icon={<BarChart3 className="h-5 w-5" />} title="How your score was calculated" subtitle="Transparent and deterministic — never random" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Self-report · 50%</p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink-950">{scores.selfReport.personalReadiness}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence · 50%</p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink-950">{ev.score}%</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'Lesson quiz accuracy', value: ev.quizAccuracy, w: EVIDENCE_WEIGHTS.quiz, hint: ev.quizAnswered ? `${ev.quizAnswered} questions` : 'No questions yet' },
                { label: 'Required modules completed', value: ev.requiredRatio, w: EVIDENCE_WEIGHTS.required, hint: `${ev.requiredCompleted}/${ev.requiredTotal}` },
                { label: 'Practical activity average', value: ev.practicalAverage, w: EVIDENCE_WEIGHTS.practical, hint: ev.practicalsSubmitted ? `${ev.practicalsSubmitted} submitted` : 'None submitted yet' },
                { label: 'Average skill level', value: ev.skillLevelScore, w: EVIDENCE_WEIGHTS.skills, hint: `${ev.averageSkillLevel.toFixed(1)} of 3` },
              ].map((r) => (
                <li key={r.label}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-700">
                      {r.label} <span className="text-xs text-slate-400">× {Math.round(r.w * 100)}%</span>
                    </span>
                    <span className="font-bold tabular-nums text-ink-950">{r.value}%</span>
                  </div>
                  <ProgressBar value={r.value} size="xs" tone="sky" />
                  <p className="mt-0.5 text-[11px] text-slate-400">{r.hint}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              New readiness = ½ × self-report + ½ × evidence ={' '}
              <span className="font-bold text-ink-950">{scores.raw}%</span>
              {clipped ? `, kept within ${scores.bounds[0]}–${scores.bounds[1]}% of your initial score → ${scores.personalReadiness}%` : ''}. Pulse answers: {usageLabel(scores.answers.personalUsage).toLowerCase()} use, confidence{' '}
              {scores.answers.confidence}/5, {scores.answers.useCases.filter((u) => u !== 'none').map(useCaseLabel).join(', ').toLowerCase() || 'no use cases yet'}.
            </p>
          </Card>
        </div>

        {/* What's next */}
        <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white shadow-lift sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-70" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">What&rsquo;s next</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">{certReady ? 'You can now work towards certification' : 'Keep building demonstrated evidence'}</h2>
              <p className="mt-1.5 text-sm text-slate-300">
                {certReady
                  ? 'Your learning has unlocked certification assessments. Prove your competency to earn a verifiable AI readiness certificate.'
                  : 'Complete more modules and practical activities — they raise both your skills and your next readiness score.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {certReady ? (
                <Button to="/app/assessments" variant="gold" icon={<Award className="h-4 w-4" />}>
                  Go to certification
                </Button>
              ) : (
                <Button to={current ? `/app/learning/${current.moduleId}` : '/app/learning'} variant="gold" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Continue learning
                </Button>
              )}
              <Button to="/app" variant="white">
                Dashboard
              </Button>
            </div>
          </div>
        </div>

        <HistoryTimeline assessments={assessments} />
      </div>
    );
  }

  /* ── Intro ── */
  const lastReassessment = [...assessments].reverse().find((a) => a.kind === 'reassessment');
  const raised = changes?.skillsRaised ?? [];
  return (
    <div className="animate-fade-up space-y-5">
      {header}

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white shadow-lift sm:p-8 lg:col-span-3">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-70" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative">
            <Badge tone="white" icon={<CalendarClock className="h-3 w-3" />}>
              {changes?.daysSinceInitial ? `${changes.daysSinceInitial} day${changes.daysSinceInitial === 1 ? '' : 's'} since your initial assessment` : 'Since your initial assessment'}
            </Badge>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Ready to measure your growth?</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
              Answer three quick questions about how you use AI today. We combine your answers (50%) with the evidence from your lessons, practicals and skills (50%), then Gemini explains what changed.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Initial readiness</p>
                <p className="mt-0.5 text-3xl font-extrabold tabular-nums">{initialAssessment.personalReadiness}%</p>
                <p className="text-xs text-slate-400">{initialAssessment.readinessLevel}</p>
              </div>
              {lastReassessment && (
                <div className="border-l border-white/15 pl-5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Last reassessed</p>
                  <p className="mt-0.5 text-3xl font-extrabold tabular-nums">{lastReassessment.personalReadiness}%</p>
                  <p className="text-xs text-slate-400">{timeAgo(lastReassessment.createdAt)}</p>
                </div>
              )}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="gold" size="lg" onClick={() => setStep('usage')} iconRight={<ArrowRight className="h-5 w-5" />}>
                {lastReassessment ? 'Reassess again' : 'Start pulse check'}
              </Button>
              <span className="text-xs font-semibold text-slate-400">About 2 minutes · 3 questions</span>
            </div>
          </div>
        </div>

        <Card className="lg:col-span-2">
          <CardTitle icon={<Layers className="h-5 w-5" />} title="Skills you have raised" subtitle="Compared with your starting baseline" />
          {raised.length ? (
            <ul className="space-y-2.5">
              {raised.slice(0, 6).map((s) => (
                <li key={s.skillId} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-slate-700">{s.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold">
                    <span className={SKILL_LEVEL_COLORS[s.from as 0 | 1 | 2 | 3].text}>{SKILL_LEVEL_LABELS[s.from as 0 | 1 | 2 | 3]}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span className={SKILL_LEVEL_COLORS[s.to as 0 | 1 | 2 | 3].text}>{SKILL_LEVEL_LABELS[s.to as 0 | 1 | 2 | 3]}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center text-sm text-slate-500">Skill levels rise as you complete modules and practicals.</p>
          )}
        </Card>
      </div>

      {changes && (
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">What has changed since {formatDate(initialAssessment.createdAt, { day: 'numeric', month: 'long' })}</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={<BookOpen className="h-4 w-4" />} label="Modules completed" value={changes.modulesCompleted.length} hint={`of ${progress?.path.length ?? 0} on your path`} />
            <StatTile icon={<ClipboardCheck className="h-4 w-4" />} label="Lesson accuracy" value={changes.quiz.total ? `${changes.quiz.percent}%` : '—'} hint={changes.quiz.total ? `${changes.quiz.correct}/${changes.quiz.total} correct` : 'No lesson checks yet'} />
            <StatTile
              icon={<FlaskConical className="h-4 w-4" />}
              label="Practicals"
              value={changes.practicals.length}
              hint={changes.practicals.length ? `Best ${Math.max(...changes.practicals.map((p) => p.score))}%` : 'None submitted yet'}
            />
            <StatTile icon={<TrendingUp className="h-4 w-4" />} label="Skills raised" value={raised.length} hint={`Longest streak ${changes.streakLongest} day${changes.streakLongest === 1 ? '' : 's'}`} />
          </div>
          {changes.modulesCompleted.length > 0 && (
            <Card className="mt-3 !p-4">
              <ul className="divide-y divide-slate-100">
                {changes.modulesCompleted.map((m) => (
                  <li key={m.moduleId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-ink-950">
                      <CircleCheck className="h-4 w-4 shrink-0 text-brand-600" />
                      <span className="truncate">{m.title}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-slate-500">
                      {m.quiz != null ? `${m.quiz}% lesson checks` : 'Completed'}
                      {m.completedAt ? ` · ${formatDate(m.completedAt, { day: 'numeric', month: 'short' })}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <HistoryTimeline assessments={assessments} />
    </div>
  );
}
