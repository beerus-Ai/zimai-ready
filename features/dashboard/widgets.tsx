import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, Award, BadgeCheck, BookOpen, Bot, CircleCheck, ClipboardCheck, Clock, Flame,
  FlaskConical, Gauge, Layers, Lightbulb, Lock, Map as MapIcon, RefreshCw, Rocket, Route, Sparkles, Target, TrendingUp,
  Trophy,
} from 'lucide-react';
import type { ActivityLogEntry, ActivitySubmission, AssessmentResult, Certificate, EmployeeProfile, EmployeeProgress, ReadinessAssessment, SkillLevel } from '../../types';
import { AISourceBadge, Badge, Button, Card, CardTitle, Icon, ProgressBar, ScoreRing } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { exposureLabel, LEVEL_COLORS, PRIORITY_META, SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { pathStats } from '../../lib/progress';
import { certificateState, LEVEL_META, LEVEL_ORDER } from '../../lib/certification';
import type { CertificationStatus } from '../../lib/certification';
import { getDomain, getModule, moduleTitle } from '../../data/catalog';
import { skillName } from '../../data/skills';
import { cn, timeAgo } from '../../lib/utils';
import {
  ACTIVITY_TYPE_LABEL, activityTitle, bestSubmissions, effectiveStreak, formatMinutes, lastSevenDays, levelCounts,
  pathActivities, quizAccuracy, SKILL_LEVELS, trackedSkillLevels,
} from './stats';
import type { NextAction, NextActionKind } from './nextAction';

/* ───────────────────────────── Small shared bits ───────────────────────────── */

export function LevelPips({ level, className }: { level: SkillLevel; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={SKILL_LEVEL_LABELS[level]}>
      {[1, 2, 3].map((i) => (
        <span key={i} className="h-1.5 w-3.5 rounded-full transition-colors" style={{ background: i <= level ? SKILL_LEVEL_COLORS[level].hex : '#e2e8f0' }} />
      ))}
    </span>
  );
}

export function LevelPill({ level, className }: { level: SkillLevel; className?: string }) {
  const c = SKILL_LEVEL_COLORS[level];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold', c.bg, c.text, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {SKILL_LEVEL_LABELS[level]}
    </span>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="group mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700 hover:text-brand-800">
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-ink-950 tabular-nums">{value}</p>
    </div>
  );
}

function WidgetEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">{children}</p>;
}

const PRIORITY_TONE: Record<'warn' | 'good' | 'info' | 'neutral', Tone> = { warn: 'clay', good: 'brand', info: 'sky', neutral: 'neutral' };

const scoreHex = (s: number) => (s >= 80 ? '#10a36f' : s >= 60 ? '#0ea5e9' : s >= 40 ? '#f0b400' : '#e8590c');

/* ───────────────────────────── Hero: next action / start path ───────────────────────────── */

const ACTION_ICON: Record<NextActionKind, typeof Rocket> = {
  'start-path': Rocket,
  'extra-practice': Target,
  'continue-module': BookOpen,
  practical: FlaskConical,
  reassess: TrendingUp,
  final: ClipboardCheck,
  capstone: Trophy,
  claim: Award,
  maintain: RefreshCw,
  'next-module': BookOpen,
  'all-done': Sparkles,
};

function DarkHero({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl bg-ink-950 p-6 text-white shadow-lift sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-70" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

export function NextActionCard({ action, pathPercent }: { action: NextAction; pathPercent?: number }) {
  const I = ACTION_ICON[action.kind];
  return (
    <DarkHero>
      <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="white" icon={<Sparkles className="h-3 w-3" />}>
              Next recommended action
            </Badge>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">{action.eyebrow}</span>
          </div>
          <h2 className="mt-4 text-balance text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{action.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{action.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button to={action.to} variant="gold" iconRight={<ArrowRight className="h-4 w-4" />}>
              {action.cta}
            </Button>
            <Link to="/app/learning" className="text-sm font-semibold text-slate-300 hover:text-white">
              View my learning path
            </Link>
          </div>
          {pathPercent != null && (
            <div className="mt-6 max-w-sm">
              <div className="mb-1.5 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Pathway progress</span>
                <span className="tabular-nums text-white">{pathPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-gold-300 transition-[width] duration-700" style={{ width: `${pathPercent}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="hidden h-28 w-28 shrink-0 animate-float items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15 backdrop-blur sm:flex">
          <I className="h-12 w-12 text-gold-300" strokeWidth={1.75} />
        </div>
      </div>
    </DarkHero>
  );
}

export function StartPathHero({ latest }: { latest: ReadinessAssessment | null }) {
  const items = [...(latest?.prescription ?? [])].sort((a, b) => a.priority - b.priority);
  const mins = items.reduce((a, p) => a + (p.estimatedMinutes || 0), 0);
  return (
    <DarkHero>
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="white" icon={<Sparkles className="h-3 w-3" />}>
            Personalised for you
          </Badge>
          {latest && <AISourceBadge source={latest.source} />}
        </div>
        <h2 className="mt-4 text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">Your personalised learning path is ready</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
          {items.length
            ? `Built from your AI readiness assessment — ${items.length} modules, about ${formatMinutes(mins)}, ordered by what matters most for your role and goals.`
            : 'Built from your AI readiness assessment and ordered by what matters most for your role and goals.'}
        </p>
        {items.length > 0 && (
          <ol className="mt-5 space-y-2">
            {items.slice(0, 3).map((p, i) => (
              <li key={p.moduleId} className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{p.title}</span>
                  <span className="line-clamp-1 block text-xs text-slate-400">{p.reason}</span>
                </span>
              </li>
            ))}
            {items.length > 3 && <li className="pl-12 text-xs font-semibold text-slate-400">+ {items.length - 3} more modules</li>}
          </ol>
        )}
        <div className="mt-6">
          <Button to="/app/learning" variant="gold" size="lg" icon={<Rocket className="h-5 w-5" />}>
            Start my personalised learning path
          </Button>
        </div>
      </div>
    </DarkHero>
  );
}

/* ───────────────────────────── AI readiness ───────────────────────────── */

export function ReadinessWidget({ latest, initial, canReassess }: { latest: ReadinessAssessment | null; initial: ReadinessAssessment | null; canReassess?: boolean }) {
  if (!latest)
    return (
      <Card className="flex h-full flex-col">
        <CardTitle icon={<Gauge className="h-5 w-5" />} title="AI Readiness" />
        <WidgetEmpty>Discover where you stand with AI in about five minutes.</WidgetEmpty>
        <Button to="/onboarding" className="mt-4" full>
          Assess my readiness
        </Button>
      </Card>
    );
  const lc = LEVEL_COLORS[latest.readinessLevel];
  const reassessed = latest.kind === 'reassessment' && initial != null && initial.id !== latest.id;
  const delta = reassessed ? latest.personalReadiness - initial!.personalReadiness : 0;
  const pmeta = PRIORITY_META[latest.priorityState];
  return (
    <Card className="flex h-full flex-col">
      <CardTitle
        icon={<Gauge className="h-5 w-5" />}
        title="AI Readiness"
        subtitle={`${reassessed ? 'Reassessed' : 'Assessed'} ${timeAgo(latest.createdAt)}`}
        action={<AISourceBadge source={latest.source} />}
      />
      <div className="flex items-center gap-5">
        <ScoreRing value={latest.personalReadiness} size={116} stroke={11} color={lc.hex} label="Personal" />
        <div className="min-w-0 space-y-2.5">
          <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset', lc.bg, lc.text, lc.ring)}>{latest.readinessLevel}</span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Workplace AI exposure</p>
            <p className="text-sm font-bold text-ink-950 tabular-nums">
              {latest.workplaceExposure}% <span className="font-medium text-slate-500">· {exposureLabel(latest.workplaceExposure)}</span>
            </p>
          </div>
          {reassessed && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
              <span className="tabular-nums text-slate-400">{initial!.personalReadiness}%</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="tabular-nums text-ink-950">{latest.personalReadiness}%</span>
              <Badge tone={delta >= 0 ? 'brand' : 'clay'} icon={<TrendingUp className="h-3 w-3" />}>
                {delta >= 0 ? '+' : ''}
                {delta} pts
              </Badge>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <Badge tone={PRIORITY_TONE[pmeta.tone]}>{latest.priorityState}</Badge>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{pmeta.description}</p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <Link to="/app/readiness" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
          Full analysis <ArrowRight className="h-4 w-4" />
        </Link>
        {canReassess && (
          <Link to="/app/reassess" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-ink-950">
            <RefreshCw className="h-3.5 w-3.5" /> Reassess
          </Link>
        )}
      </div>
    </Card>
  );
}

/* ───────────────────────────── Learning progress ───────────────────────────── */

export function LearningProgressWidget({ progress }: { progress: EmployeeProgress | null }) {
  const stats = pathStats(progress);
  const domain = getDomain(progress?.domainId);
  const current = stats.current ? getModule(stats.current.moduleId) : undefined;
  return (
    <Card className="flex h-full flex-col">
      <CardTitle icon={<MapIcon className="h-5 w-5" />} title="Learning progress" subtitle={domain ? `${domain.name} pathway` : 'Your personalised pathway'} />
      {!progress ? (
        <WidgetEmpty>Your progress appears here once you start your learning path.</WidgetEmpty>
      ) : (
        <>
          <div className="flex items-end justify-between gap-3">
            <p className="text-4xl font-extrabold tracking-tight text-ink-950 tabular-nums">
              {stats.percent}
              <span className="text-lg text-slate-400">%</span>
            </p>
            <p className="pb-1 text-sm font-semibold text-slate-500 tabular-nums">
              {stats.completed}/{stats.total} modules
            </p>
          </div>
          <ProgressBar value={stats.percent} size="md" className="mt-3" />
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <MiniStat icon={<Clock className="h-3 w-3" />} label="Remaining" value={formatMinutes(stats.minutesRemaining)} />
            <MiniStat icon={<Target className="h-3 w-3" />} label="Required" value={`${stats.requiredCompleted}/${stats.requiredTotal} done`} />
          </div>
          {stats.current && current ? (
            <Link
              to={`/app/learning/${stats.current.moduleId}`}
              className="group mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-3 ring-1 ring-inset ring-brand-100 transition hover:bg-brand-100/70"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Icon name={current.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-brand-700">
                  {progress.modules[stats.current.moduleId]?.status === 'in-progress' ? 'Continue' : 'Start next'}
                </span>
                <span className="block truncate text-sm font-semibold text-ink-950">{moduleTitle(current, progress.domainId)}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-700 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-800">
              <CircleCheck className="h-4 w-4" /> Pathway complete — well done.
            </p>
          )}
          <FooterLink to="/app/learning">Open learning path</FooterLink>
        </>
      )}
    </Card>
  );
}

/* ───────────────────────────── Skills acquired ───────────────────────────── */

export function SkillsAcquiredWidget({ progress }: { progress: EmployeeProgress | null }) {
  const levels = trackedSkillLevels(progress);
  const ids = Object.keys(levels);
  const counts = levelCounts(levels);
  const acquired = counts[2] + counts[3];
  const top = ids.sort((a, b) => levels[b] - levels[a] || skillName(a).localeCompare(skillName(b))).slice(0, 4);
  return (
    <Card className="flex h-full flex-col">
      <CardTitle icon={<BadgeCheck className="h-5 w-5" />} title="Skills acquired" subtitle="Competent or above, evidenced by learning" />
      {!ids.length ? (
        <WidgetEmpty>Skills are tracked as soon as your learning path begins.</WidgetEmpty>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-extrabold tracking-tight text-ink-950 tabular-nums">{acquired}</p>
            <p className="pb-1 text-sm font-semibold text-slate-500">of {ids.length} tracked skills</p>
          </div>
          <ProgressBar value={(acquired / ids.length) * 100} tone="sky" className="mt-3" />
          <ul className="mt-4 space-y-2">
            {top.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium text-slate-700">{skillName(id)}</span>
                <LevelPips level={levels[id]} className="shrink-0" />
              </li>
            ))}
          </ul>
          <FooterLink to="/app/skills">View skills map</FooterLink>
        </>
      )}
    </Card>
  );
}

/* ───────────────────────────── Streak ───────────────────────────── */

export function StreakWidget({ progress }: { progress: EmployeeProgress | null }) {
  const s = effectiveStreak(progress);
  const days = lastSevenDays(progress);
  return (
    <Card className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-200/40 blur-2xl" />
      <CardTitle icon={<Flame className="h-5 w-5" />} title="Learning streak" subtitle="Consecutive days of learning" />
      <div className="relative flex items-center gap-4">
        <div className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg', s.current ? 'bg-gradient-to-br from-gold-300 via-gold-500 to-clay-500 shadow-gold-500/30' : 'bg-slate-200 shadow-none')}>
          <Flame className={cn('h-8 w-8', s.current > 0 && 'animate-float')} />
        </div>
        <div>
          <p className="text-4xl font-extrabold tracking-tight text-ink-950 tabular-nums">
            {s.current}
            <span className="ml-1 text-base font-semibold text-slate-500">day{s.current === 1 ? '' : 's'}</span>
          </p>
          <p className="text-xs font-medium text-slate-500">Longest streak: {s.longest} day{s.longest === 1 ? '' : 's'}</p>
        </div>
      </div>
      <div className="relative mt-5 flex justify-between">
        {days.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                d.active ? 'bg-gradient-to-br from-gold-400 to-clay-500 text-white shadow-sm' : 'bg-slate-100',
                d.isToday && !d.active && 'border-2 border-dashed border-gold-300 bg-white',
              )}
              title={d.key}
            >
              {d.active ? <Flame className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
            </span>
            <span className={cn('text-[11px] font-bold', d.isToday ? 'text-ink-950' : 'text-slate-400')}>{d.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-auto pt-4 text-xs text-slate-500">
        {!progress
          ? 'Start learning to build your streak.'
          : s.activeToday
            ? 'You have learnt today — streak secured.'
            : s.atRisk
              ? 'Complete a lesson today to keep your streak alive.'
              : 'Complete a lesson today to start a new streak.'}
      </p>
    </Card>
  );
}

/* ───────────────────────────── Practical challenges ───────────────────────────── */

export function PracticalsWidget({ progress, submissions }: { progress: EmployeeProgress | null; submissions: ActivitySubmission[] }) {
  const best = bestSubmissions(submissions);
  const passed = best.filter((s) => s.feedback.score >= 60).length;
  const acts = pathActivities(progress, submissions);
  const nextAct = acts.find((a) => !a.submitted && a.moduleStatus !== 'not-started') ?? acts.find((a) => !a.submitted);
  return (
    <Card className="flex h-full flex-col">
      <CardTitle icon={<FlaskConical className="h-5 w-5" />} title="Practical challenges" subtitle="Workplace scenarios scored against a rubric" />
      <div className="flex items-end gap-2">
        <p className="text-4xl font-extrabold tracking-tight text-ink-950 tabular-nums">{best.length}</p>
        <p className="pb-1 text-sm font-semibold text-slate-500">
          submitted{acts.length ? ` of ${acts.length} on your path` : ''} · {passed} passed
        </p>
      </div>
      {best.length ? (
        <ul className="mt-4 space-y-3">
          {best.slice(0, 3).map((s) => (
            <li key={s.id}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium text-slate-700">{activityTitle(s, `${moduleTitle(s.moduleId, progress?.domainId)} practical`)}</span>
                <span className="shrink-0 font-bold tabular-nums text-ink-950">{s.feedback.score}%</span>
              </div>
              <ProgressBar value={s.feedback.score} color={scoreHex(s.feedback.score)} size="xs" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-slate-500">No practicals yet. Modules end with a realistic Zimbabwean workplace scenario — Gemini scores your work and explains how to improve.</p>
      )}
      {nextAct ? (
        <FooterLink to={nextAct.moduleStatus === 'completed' ? `/app/learning/${nextAct.moduleId}/activity` : `/app/learning/${nextAct.moduleId}`}>
          {nextAct.moduleStatus === 'completed' ? `Start: ${nextAct.activity.title}` : 'Work towards your next practical'}
        </FooterLink>
      ) : (
        <FooterLink to="/app/learning">Go to learning</FooterLink>
      )}
    </Card>
  );
}

/* ───────────────────────────── Assessment performance ───────────────────────────── */

function ResultRow({ label, result, unlocked }: { label: string; result?: AssessmentResult; unlocked: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink-950">{label}</p>
        <p className="truncate text-xs text-slate-500">{result ? `Best attempt · ${timeAgo(result.createdAt)}` : unlocked ? 'Unlocked — ready when you are' : 'Unlocks as you progress'}</p>
      </div>
      {result ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-base font-extrabold tabular-nums text-ink-950">{result.score}%</span>
          <Badge tone={result.passed ? 'brand' : 'gold'}>{result.passed ? 'Passed' : 'Retake'}</Badge>
        </div>
      ) : unlocked ? (
        <Badge tone="gold">Unlocked</Badge>
      ) : (
        <Lock className="h-4 w-4 shrink-0 text-slate-400" />
      )}
    </div>
  );
}

export function AssessmentWidget({ progress, status }: { progress: EmployeeProgress | null; status: CertificationStatus }) {
  const quiz = quizAccuracy(progress);
  return (
    <Card className="flex h-full flex-col">
      <CardTitle icon={<ClipboardCheck className="h-5 w-5" />} title="Assessment performance" subtitle="Lesson checks and certification assessments" />
      <div className="flex items-center gap-4">
        <ScoreRing value={quiz.percent} size={84} stroke={9} color="#0ea5e9">
          {quiz.total ? undefined : <span className="text-lg font-extrabold text-slate-300">—</span>}
        </ScoreRing>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-950">Lesson quiz accuracy</p>
          <p className="text-xs text-slate-500">{quiz.total ? `${quiz.correct} of ${quiz.total} questions correct across all modules` : 'Answer lesson checks to see your accuracy'}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <ResultRow label="Final knowledge assessment" result={status.bestKnowledge} unlocked={status.finalUnlocked} />
        <ResultRow label="Practical capstone" result={status.bestCapstone} unlocked={status.capstoneUnlocked} />
      </div>
      <FooterLink to="/app/assessments">Assessments hub</FooterLink>
    </Card>
  );
}

/* ───────────────────────────── Mini skills map ───────────────────────────── */

export function MiniSkillsMap({ progress }: { progress: EmployeeProgress | null }) {
  const levels = trackedSkillLevels(progress);
  const counts = levelCounts(levels);
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <Card className="flex h-full flex-col">
      <CardTitle icon={<Layers className="h-5 w-5" />} title="Skills map" subtitle={total ? `${total} skills tracked on your pathway` : 'Your skills at a glance'} />
      {!total ? (
        <WidgetEmpty>Your skills map fills in as you learn.</WidgetEmpty>
      ) : (
        <>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {SKILL_LEVELS.map((l) =>
              counts[l] ? <div key={l} className="h-full transition-[width] duration-700 first:rounded-l-full last:rounded-r-full" style={{ width: `${(counts[l] / total) * 100}%`, background: SKILL_LEVEL_COLORS[l].hex }} title={`${SKILL_LEVEL_LABELS[l]}: ${counts[l]}`} /> : null,
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {SKILL_LEVELS.map((l) => (
              <Link key={l} to="/app/skills" className={cn('rounded-xl px-3 py-2.5 transition hover:ring-1 hover:ring-slate-200', SKILL_LEVEL_COLORS[l].bg)}>
                <p className={cn('flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide', SKILL_LEVEL_COLORS[l].text)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', SKILL_LEVEL_COLORS[l].dot)} />
                  {SKILL_LEVEL_LABELS[l]}
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink-950">{counts[l]}</p>
              </Link>
            ))}
          </div>
          <FooterLink to="/app/skills">Explore skills map</FooterLink>
        </>
      )}
    </Card>
  );
}

/* ───────────────────────────── Certification journey ───────────────────────────── */

export function CertificationJourney({ status, certificates }: { status: CertificationStatus; certificates: Certificate[] }) {
  const achievedRank = status.achievableLevel ? LEVEL_META[status.achievableLevel].rank : 0;
  const nextReqs = status.nextLevel ? status.requirements.filter((r) => r.level === status.nextLevel && !r.met) : [];
  return (
    <Card className="flex h-full flex-col">
      <CardTitle
        icon={<Award className="h-5 w-5" />}
        title="Certification journey"
        subtitle={status.achievableLevel ? `You meet the requirements for ${LEVEL_META[status.achievableLevel].label}` : 'Certification requires demonstrated competency — content alone never certifies'}
        action={
          <Button to="/app/assessments" variant="outline" size="sm" iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}>
            <span className="hidden sm:inline">Assessments</span>
            <span className="sm:hidden">Open</span>
          </Button>
        }
      />
      <ol className="grid gap-3 sm:grid-cols-3">
        {LEVEL_ORDER.map((lvl) => {
          const meta = LEVEL_META[lvl];
          const rs = status.requirements.filter((r) => r.level === lvl);
          const met = rs.filter((r) => r.met).length;
          const pct = Math.round(rs.reduce((a, r) => a + r.progress, 0) / Math.max(1, rs.length));
          const certified = certificates.some((c) => c.level === lvl && certificateState(c) === 'valid');
          const achieved = achievedRank >= meta.rank;
          const isNext = status.nextLevel === lvl;
          const stateLabel = certified ? 'Certified' : achieved ? 'Ready to claim' : isNext ? 'In progress' : 'Locked';
          return (
            <li
              key={lvl}
              className={cn('relative flex flex-col rounded-2xl border p-4 transition', achieved || certified ? 'border-transparent bg-white' : isNext ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/70')}
              style={achieved || certified ? { boxShadow: `inset 0 0 0 2px ${meta.color}` } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: achieved || certified || isNext ? meta.color : '#cbd5e1' }}>
                  {certified || achieved ? <CircleCheck className="h-5 w-5" /> : isNext ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Level {meta.rank}</span>
              </div>
              <p className="mt-3 font-bold text-ink-950">{meta.label}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{meta.description}</p>
              <div className="mt-auto pt-3">
                <ProgressBar value={pct} color={meta.color} size="xs" />
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-500 tabular-nums">
                    {met}/{rs.length} requirements
                  </span>
                  <span style={{ color: achieved || certified || isNext ? meta.color : '#94a3b8' }}>{stateLabel}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {nextReqs.length > 0 && status.nextLevel && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">To reach {LEVEL_META[status.nextLevel].label}</p>
          <ul className="mt-2 space-y-1.5">
            {nextReqs.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-start gap-2 text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {r.label}
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-500">{r.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/* ───────────────────────────── Activity feed ───────────────────────────── */

const ACT_META: Record<ActivityLogEntry['type'], { icon: typeof BookOpen; cls: string }> = {
  lesson: { icon: BookOpen, cls: 'bg-brand-50 text-brand-700' },
  quiz: { icon: ClipboardCheck, cls: 'bg-sky-50 text-sky-700' },
  activity: { icon: FlaskConical, cls: 'bg-violet-50 text-violet-700' },
  tutor: { icon: Bot, cls: 'bg-sky-50 text-sky-700' },
  assessment: { icon: ClipboardCheck, cls: 'bg-gold-50 text-gold-700' },
  certificate: { icon: Award, cls: 'bg-gold-50 text-gold-700' },
  reassessment: { icon: TrendingUp, cls: 'bg-brand-50 text-brand-700' },
  path: { icon: Route, cls: 'bg-slate-100 text-ink-800' },
};

export function ActivityFeed({ progress }: { progress: EmployeeProgress | null }) {
  const items = (progress?.activity ?? []).slice(0, 7);
  return (
    <Card className="h-full">
      <CardTitle icon={<Activity className="h-5 w-5" />} title="Recent activity" subtitle="Your latest learning milestones" />
      {!items.length ? (
        <WidgetEmpty>Your lessons, practicals and assessments will appear here.</WidgetEmpty>
      ) : (
        <ol className="relative space-y-1">
          <span className="absolute bottom-3 left-[17px] top-3 w-px bg-slate-100" aria-hidden />
          {items.map((a, i) => {
            const m = ACT_META[a.type] ?? ACT_META.path;
            const I = m.icon;
            return (
              <li key={`${a.at}-${i}`} className="relative flex items-start gap-3 rounded-xl py-2 pr-2">
                <span className={cn('relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-4 ring-white', m.cls)}>
                  <I className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium leading-snug text-ink-950">{a.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ACTIVITY_TYPE_LABEL[a.type] ?? 'Update'} · {timeAgo(a.at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

/* ───────────────────────────── Quick links & focus tip ───────────────────────────── */

export function QuickLinks({ profile, latest, certificates }: { profile: EmployeeProfile | null; latest: ReadinessAssessment | null; certificates: Certificate[] }) {
  const transition = profile?.careerObjective === 'transition';
  const ct = latest?.careerTransition;
  const validCerts = certificates.filter((c) => certificateState(c) === 'valid').length;
  const links: { to: string; icon: ReactNode; title: string; hint: string; highlight?: boolean }[] = [
    { to: '/app/tutor', icon: <Bot className="h-5 w-5" />, title: 'AI Tutor', hint: 'Ask about any module' },
    {
      to: '/app/career',
      icon: <Route className="h-5 w-5" />,
      title: 'Career path',
      hint: transition ? (ct ? `${ct.currentRole} → ${ct.targetRole}` : profile?.targetCareer ? `Towards ${profile.targetCareer}` : 'Your transition plan') : 'How AI is changing your role',
      highlight: transition,
    },
    { to: '/app/certificates', icon: <Award className="h-5 w-5" />, title: 'Certificates', hint: validCerts ? `${validCerts} valid` : 'None yet' },
    { to: '/app/profile', icon: <BadgeCheck className="h-5 w-5" />, title: 'Skills profile', hint: 'Share verified skills' },
  ];
  return (
    <Card>
      <CardTitle icon={<Sparkles className="h-5 w-5" />} title="Quick links" />
      <div className="grid grid-cols-2 gap-2.5">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              'group relative flex flex-col gap-2 rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-lift',
              l.highlight ? 'border-gold-300 bg-gradient-to-br from-gold-50 to-white' : 'border-slate-200 bg-white hover:border-slate-300',
            )}
          >
            {l.highlight && <span className="absolute right-2 top-2 rounded-full bg-gold-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-950">Your goal</span>}
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', l.highlight ? 'bg-gold-400 text-ink-950' : 'bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-700')}>{l.icon}</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink-950">{l.title}</span>
              <span className="block truncate text-xs text-slate-500">{l.hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function FocusTip({ latest }: { latest: ReadinessAssessment | null }) {
  const tips = latest?.learnNext?.filter(Boolean) ?? [];
  if (!tips.length) return null;
  const dayIndex = Math.floor(Date.now() / 86400000);
  const tip = tips[dayIndex % tips.length];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 via-white to-white p-5 shadow-card">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold-200/50 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-800">
            <Lightbulb className="h-4 w-4" /> Today&rsquo;s focus
          </p>
          <AISourceBadge source={latest?.source} />
        </div>
        <p className="mt-3 text-[15px] font-semibold leading-snug text-ink-950">{tip}</p>
        <p className="mt-1.5 text-xs text-slate-500">From your {latest?.kind === 'reassessment' ? 'latest reassessment' : 'readiness analysis'}.</p>
        <Link to="/app/tutor" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-800 hover:text-gold-900">
          Ask the AI Tutor how <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
