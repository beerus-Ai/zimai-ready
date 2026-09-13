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
        <span key={i} className="h-1.5 w-3.5 rounded-full transition-colors" style={{ background: i <= level ? SKILL_LEVEL_COLORS[level].hex : '#e4e4d0' }} />
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
    <div className="rounded-xl bg-sand-200/60 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-ink-950 tabular-nums">{value}</p>
    </div>
  );
}

function WidgetEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-ink-950/15 bg-sand-100/70 px-4 py-6 text-center text-sm text-slate-500">{children}</p>;
}

const PRIORITY_TONE: Record<'warn' | 'good' | 'info' | 'neutral', Tone> = { warn: 'clay', good: 'brand', info: 'violet', neutral: 'neutral' };

const scoreHex = (s: number) => (s >= 80 ? '#1b8f78' : s >= 60 ? '#4fbf8e' : s >= 40 ? '#ffa946' : '#ff6c4c');

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
    <div className="relative h-full overflow-hidden rounded-4xl bg-brand-800 p-6 text-canvas sm:p-10">
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
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300">{action.eyebrow}</span>
          </div>
          <h2 className="mt-4 text-balance text-3xl leading-[1.05] sm:text-4xl">{action.title}</h2>
          <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-canvas/70">{action.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button to={action.to} variant="gold" iconRight={<ArrowRight className="h-4 w-4" />}>
              {action.cta}
            </Button>
            <Link to="/app/learning" className="text-sm font-semibold text-canvas/75 underline decoration-canvas/30 underline-offset-4 hover:text-canvas">
              View my learning path
            </Link>
          </div>
          {pathPercent != null && (
            <div className="mt-8 max-w-sm">
              <div className="mb-1.5 flex items-end justify-between text-[11px] font-semibold uppercase tracking-wide text-canvas/60">
                <span>Pathway progress</span>
                <span className="font-display text-3xl font-medium normal-case leading-none tracking-tight tabular-nums text-canvas">{pathPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-canvas/15">
                <div className="h-full rounded-full bg-gold-400 transition-[width] duration-700" style={{ width: `${pathPercent}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-canvas/10 text-canvas sm:flex">
          <I className="h-10 w-10" strokeWidth={1.5} />
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
        <h2 className="mt-4 text-balance text-3xl leading-[1.05] sm:text-4xl">Your personalised learning path is <em>ready</em></h2>
        {items.length > 0 && (
          <p className="mt-3 text-sm text-canvas/70">
            {items.length} modules · about {formatMinutes(mins)}
          </p>
        )}
        {items.length > 0 && (
          <ol className="mt-6 space-y-2">
            {items.slice(0, 3).map((p, i) => (
              <li key={p.moduleId} className="flex items-start gap-3 rounded-xl bg-canvas/5 px-3 py-2.5 ring-1 ring-canvas/10">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-ink-950">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{p.title}</span>
                  
                </span>
              </li>
            ))}
            {items.length > 3 && <li className="pl-12 text-xs font-semibold text-canvas/60">+ {items.length - 3} more modules</li>}
          </ol>
        )}
        <div className="mt-8">
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
        <ScoreRing value={latest.personalReadiness} size={128} stroke={10} color={lc.hex} className="animate-scale-in" />
        <div className="min-w-0 space-y-2.5">
          <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset', lc.bg, lc.text, lc.ring)}>{latest.readinessLevel}</span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">AI exposure</p>
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
      <div className="mt-5">
        <Badge tone={PRIORITY_TONE[pmeta.tone]}>{latest.priorityState}</Badge>
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
            <p className="font-display text-6xl font-medium leading-none tracking-tight text-ink-950 tabular-nums">
              {stats.percent}
              <span className="text-2xl text-slate-400">%</span>
            </p>
            <p className="pb-1 text-sm font-semibold text-slate-500 tabular-nums">
              {stats.completed}/{stats.total} modules
            </p>
          </div>
          <ProgressBar value={stats.percent} size="md" className="mt-3" />
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <MiniStat icon={<Clock className="h-3 w-3" />} label="Remaining" value={formatMinutes(stats.minutesRemaining)} />
            <MiniStat icon={<Target className="h-3 w-3" />} label="Required" value={`${stats.requiredCompleted}/${stats.requiredTotal} done`} />
          </div>
          {stats.current && current ? (
            <Link
              to={`/app/learning/${stats.current.moduleId}`}
              className="group mt-4 flex items-center gap-3 rounded-xl border border-brand-800/15 bg-brand-50 p-3 transition hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-ink-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-canvas">
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
      <CardTitle icon={<BadgeCheck className="h-5 w-5" />} title="Skills acquired" />
      {!ids.length ? (
        <WidgetEmpty>Skills are tracked as soon as your learning path begins.</WidgetEmpty>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <p className="font-display text-6xl font-medium leading-none tracking-tight text-ink-950 tabular-nums">{acquired}</p>
            <p className="pb-1 text-sm font-semibold text-slate-500">of {ids.length}</p>
          </div>
          <ProgressBar value={(acquired / ids.length) * 100} color="#4fbf8e" className="mt-3" />
          <ul className="mt-5 space-y-2.5">
            {top.slice(0, 3).map((id) => (
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
      <CardTitle icon={<Flame className="h-5 w-5" />} title="Learning streak" />
      <div className="relative flex items-center gap-4">
        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full', s.current ? 'bg-gold-400 text-ink-950' : 'bg-sand-300 text-canvas')}>
          <Flame className="h-7 w-7" />
        </div>
        <div>
          <p className="font-display text-6xl font-medium leading-none tracking-tight text-ink-950 tabular-nums">
            {s.current}
            <span className="ml-1.5 font-sans text-base font-semibold text-slate-500">day{s.current === 1 ? '' : 's'}</span>
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">Best: {s.longest} day{s.longest === 1 ? '' : 's'}</p>
        </div>
      </div>
      <div className="relative mt-6 flex justify-between">
        {days.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                d.active ? 'bg-gold-400 text-ink-950' : 'bg-sand-200',
                d.isToday && !d.active && 'border-2 border-dashed border-gold-300 bg-paper',
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
      <CardTitle icon={<FlaskConical className="h-5 w-5" />} title="Practical challenges" />
      <div className="flex items-end gap-2">
        <p className="font-display text-6xl font-medium leading-none tracking-tight text-ink-950 tabular-nums">{best.length}</p>
        <p className="pb-1 text-sm font-semibold text-slate-500">
          submitted{acts.length ? ` of ${acts.length} on your path` : ''} · {passed} passed
        </p>
      </div>
      {best.length ? (
        <ul className="mt-5 space-y-3">
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
        <p className="mt-3 text-sm text-slate-500">No practicals submitted yet.</p>
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-950/5 bg-sand-100/80 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink-950">{label}</p>
        <p className="truncate text-xs text-slate-500">{result ? timeAgo(result.createdAt) : unlocked ? 'Unlocked' : 'Locked'}</p>
      </div>
      {result ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-display text-xl font-medium tabular-nums text-ink-950">{result.score}%</span>
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
      <CardTitle icon={<ClipboardCheck className="h-5 w-5" />} title="Assessments" />
      <div className="flex items-center gap-4">
        <ScoreRing value={quiz.percent} size={84} stroke={9} color="#4fbf8e">
          {quiz.total ? undefined : <span className="text-lg font-extrabold text-slate-300">—</span>}
        </ScoreRing>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-950">Lesson quiz accuracy</p>
          <p className="text-xs text-slate-500 tabular-nums">{quiz.total ? `${quiz.correct}/${quiz.total} correct` : 'No lesson checks yet'}</p>
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
      <CardTitle icon={<Layers className="h-5 w-5" />} title="Skills map" subtitle={total ? `${total} skills tracked` : undefined} />
      {!total ? (
        <WidgetEmpty>Your skills map fills in as you learn.</WidgetEmpty>
      ) : (
        <>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-sand-200">
            {SKILL_LEVELS.map((l) =>
              counts[l] ? <div key={l} className="h-full transition-[width] duration-700 first:rounded-l-full last:rounded-r-full" style={{ width: `${(counts[l] / total) * 100}%`, background: SKILL_LEVEL_COLORS[l].hex }} title={`${SKILL_LEVEL_LABELS[l]}: ${counts[l]}`} /> : null,
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {SKILL_LEVELS.map((l) => (
              <Link key={l} to="/app/skills" className={cn('rounded-xl border border-transparent px-3 py-2.5 transition hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-ink-sm', SKILL_LEVEL_COLORS[l].bg)}>
                <p className={cn('flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide', SKILL_LEVEL_COLORS[l].text)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', SKILL_LEVEL_COLORS[l].dot)} />
                  {SKILL_LEVEL_LABELS[l]}
                </p>
                <p className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{counts[l]}</p>
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
        subtitle={status.achievableLevel ? `Ready for ${LEVEL_META[status.achievableLevel].label}` : undefined}
        action={
          <Button to="/app/assessments" variant="outline" size="sm" iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}>
            <span className="hidden sm:inline">Assessments</span>
            <span className="sm:hidden">Open</span>
          </Button>
        }
      />
      <ol className="grid gap-4 sm:grid-cols-3">
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
              className={cn('relative flex flex-col rounded-2xl border p-4 transition', achieved || certified ? 'border-transparent bg-paper' : isNext ? 'border-ink-950/15 bg-paper' : 'border-dashed border-ink-950/15 bg-sand-100/70')}
              style={achieved || certified ? { boxShadow: `inset 0 0 0 2px ${meta.color}` } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: achieved || certified || isNext ? meta.color : '#d2d2b9' }}>
                  {certified || achieved ? <CircleCheck className="h-5 w-5" /> : isNext ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                </span>
                <span className="font-condensed text-lg leading-none tracking-wide text-slate-300">L{meta.rank}<span className="sr-only"> — Level {meta.rank}</span></span>
              </div>
              <p className="mt-3 font-display text-xl leading-tight text-ink-950">{meta.label}</p>
              <div className="mt-auto pt-4">
                <ProgressBar value={pct} color={meta.color} size="xs" />
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-500 tabular-nums">
                    {met}/{rs.length} requirements
                  </span>
                  <span style={{ color: achieved || certified || isNext ? meta.color : '#a3a390' }}>{stateLabel}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {nextReqs.length > 0 && status.nextLevel && (
        <div className="mt-5 rounded-xl bg-sand-200/60 p-4">
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
  quiz: { icon: ClipboardCheck, cls: 'bg-lilac-50 text-lilac-700' },
  activity: { icon: FlaskConical, cls: 'bg-lilac-50 text-lilac-700' },
  tutor: { icon: Bot, cls: 'bg-blush-100 text-clay-800' },
  assessment: { icon: ClipboardCheck, cls: 'bg-gold-50 text-gold-700' },
  certificate: { icon: Award, cls: 'bg-gold-50 text-gold-700' },
  reassessment: { icon: TrendingUp, cls: 'bg-brand-50 text-brand-700' },
  path: { icon: Route, cls: 'bg-sand-200 text-ink-800' },
};

export function ActivityFeed({ progress }: { progress: EmployeeProgress | null }) {
  const items = (progress?.activity ?? []).slice(0, 5);
  return (
    <Card className="h-full">
      <CardTitle icon={<Activity className="h-5 w-5" />} title="Recent activity" />
      {!items.length ? (
        <WidgetEmpty>Your lessons, practicals and assessments will appear here.</WidgetEmpty>
      ) : (
        <ol className="relative space-y-1">
          <span className="absolute bottom-3 left-[17px] top-3 w-px border-l border-dashed border-ink-950/15" aria-hidden />
          {items.map((a, i) => {
            const m = ACT_META[a.type] ?? ACT_META.path;
            const I = m.icon;
            return (
              <li key={`${a.at}-${i}`} className="relative flex items-start gap-3 rounded-xl py-2 pr-2">
                <span className={cn('relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-4 ring-paper', m.cls)}>
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
      <CardTitle title="Quick links" />
      <div className="grid grid-cols-2 gap-2.5">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              'group relative flex flex-col gap-2 rounded-xl border p-3 transition hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-ink-sm',
              'border-ink-950/10 bg-paper',
            )}
          >
            {l.highlight && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold-400" title="Your goal" aria-label="Your goal" />}
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', l.highlight ? 'bg-gold-400 text-ink-950' : 'bg-sand-200/80 text-slate-700 group-hover:bg-lilac-200 group-hover:text-ink-950')}>{l.icon}</span>
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
    <div className="animate-ghost-in rounded-2xl bg-gold-50 p-6">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-800">
            <Lightbulb className="h-4 w-4" /> Today&rsquo;s focus
          </p>
          <AISourceBadge source={latest?.source} />
        </div>
        <p className="mt-3 font-display text-xl leading-snug text-ink-950">{tip}</p>
        <Link to="/app/tutor" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-800 hover:text-gold-900">
          Ask the AI Tutor how <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
