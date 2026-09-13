import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowRight, Award, Bot, Check, ClipboardCheck, Clock, Flame, Gauge, Layers, Lock, Plus, RefreshCw, Route, Sparkles, Target, Zap,
} from 'lucide-react';
import {
  Badge, Button, Card, CardTitle, EmptyState, ErrorState, Icon, LoadingState, PageHeader, ProgressBar, ScoreRing, useToast,
} from '../../components/ui';
import { Reveal } from '../../components/motion';
import { GhostMascot, GrowthPath, MapPins, Sparkle } from '../../components/illustrations';
import { useApp } from '../../services/store';
import { getDomain, getModule, moduleTitle } from '../../data/catalog';
import { skillName } from '../../data/skills';
import { pathStats } from '../../lib/progress';
import { evaluateCertification } from '../../lib/certification';
import { SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { cn } from '../../lib/utils';
import type { EmployeeProgress, PathItem, SkillLevel } from '../../types';
import { lessonCountFor, moduleHasActivity, activityFor } from './components/moduleContent';
import { addModuleToPath, formatMinutes, PACE_META, sortedPath, suggestedAdvancedModule, useEnsureProgress } from './components/useLearning';

export default function LearningPathPage() {
  const { progress, creating, error } = useEnsureProgress();
  if (!progress) {
    if (creating)
      return (
        <LoadingState
          variant="ai"
          className="min-h-[60vh]"
          title="Building your personalised path…"
          messages={['Reading your AI Skills Prescription', 'Ordering modules by priority', 'Matching examples to your role', 'Setting your adaptive pace']}
        />
      );
    if (error) return <ErrorState className="my-10" message={error} onRetry={() => window.location.reload()} />;
    return (
      <>
        <PageHeader eyebrow="Learn" title="My AI Learning Path" />
        <EmptyState
          icon={<Route className="h-6 w-6" />}
          title="Your path starts with an AI readiness assessment"
          description="We build your learning path from your personal AI Skills Prescription. It takes about five minutes."
          action={<Button to="/app/readiness">Go to AI readiness</Button>}
        />
      </>
    );
  }
  return <PathView progress={progress} />;
}

type StepStatus = 'completed' | 'in-progress' | 'up-next' | 'later';

const STATUS_META: Record<StepStatus, { label: string; tone: 'brand' | 'gold' | 'violet' | 'neutral' }> = {
  completed: { label: 'Completed', tone: 'brand' },
  'in-progress': { label: 'In progress', tone: 'gold' },
  'up-next': { label: 'Up next', tone: 'violet' },
  later: { label: 'Later', tone: 'neutral' },
};

function PathView({ progress }: { progress: EmployeeProgress }) {
  const { profile, submissions, results, saveProgress } = useApp();
  const toast = useToast();
  const domainId = progress.domainId;
  const domain = getDomain(domainId);
  const items = sortedPath(progress);
  const stats = pathStats(progress);
  const cert = evaluateCertification({ progress, submissions, results });
  const status = (id: string) => progress.modules[id]?.status ?? 'not-started';
  const upNextId = items.find((i) => status(i.moduleId) === 'not-started')?.moduleId;
  const continueItem = stats.current;
  const recommendedNext = items.find((i) => status(i.moduleId) !== 'completed' && i.moduleId !== continueItem?.moduleId);
  const advanced = suggestedAdvancedModule(progress);
  const pace = PACE_META[progress.pace];

  const skills = useMemo(() => Array.from(new Set(items.flatMap((i) => getModule(i.moduleId)?.skillIds ?? []))), [items]);
  const bestScore = (activityId: string) => {
    const scores = submissions.filter((s) => s.activityId === activityId).map((s) => s.feedback.score);
    return scores.length ? Math.max(...scores) : null;
  };

  const stepStatus = (item: PathItem): StepStatus => {
    const s = status(item.moduleId);
    if (s === 'completed') return 'completed';
    if (s === 'in-progress') return 'in-progress';
    return item.moduleId === upNextId ? 'up-next' : 'later';
  };

  const addAdvanced = async () => {
    if (!advanced) return;
    await saveProgress((prev) => addModuleToPath(prev ?? progress, advanced));
    toast.success('Added to your path', moduleTitle(advanced, domainId));
  };

  const cm = continueItem ? progress.modules[continueItem.moduleId] : undefined;
  const cmLessons = continueItem ? lessonCountFor(continueItem.moduleId) : 0;
  const transition = progress.targetDomainId && profile?.targetCareer;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={domain?.name ?? 'Learning'}
        title={
          <>
            My AI <em>learning</em> path
          </>
        }
        description={
          transition ? (
            <>
              Career transition to <strong className="font-semibold text-ink-950">{profile?.targetCareer}</strong>.
            </>
          ) : (
            <>For {domain?.professional ?? 'your profession'}. Start anywhere.</>
          )
        }
        actions={
          <Button variant="outline" to="/app/tutor" icon={<Bot className="h-4 w-4" />}>
            Ask the AI Tutor
          </Button>
        }
      />

      {/* Hero summary */}
      <Card padded={false} className="relative animate-ghost-in overflow-hidden rounded-4xl border-0 bg-brand-800 text-canvas shadow-lift">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lilac-200/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-center gap-5">
            <ScoreRing value={stats.percent} size={128} stroke={11} color="#c8f0dc" track="rgba(255,254,235,0.14)">
              <span className="font-display text-4xl tabular-nums text-canvas">
                {stats.percent}
                <span className="align-top text-base text-canvas/50">%</span>
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-canvas/50">complete</span>
            </ScoreRing>
            <div className="md:hidden">
              <p className="font-condensed text-4xl tracking-wide">
                {stats.completed}/{stats.total}
              </p>
              <p className="text-sm text-canvas/60">modules completed</p>
            </div>
          </div>
          <div className="min-w-0">
            {continueItem ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lilac-200">{cm?.status === 'in-progress' ? 'Continue where you left off' : 'Start here'}</p>
                <h2 className="mt-2 text-3xl leading-[1.05] sm:text-4xl">{moduleTitle(continueItem.moduleId, domainId)}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-canvas/65">{continueItem.reason}</p>
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-canvas/60">
                      <span>
                        Lesson {Math.min((cm?.lessonsCompleted.length ?? 0) + 1, cmLessons)} of {cmLessons}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {getModule(continueItem.moduleId)?.estimatedMinutes ?? 20} min
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-canvas/10">
                      <div className="h-full rounded-full bg-lilac-200 transition-[width] duration-700" style={{ width: `${cmLessons ? ((cm?.lessonsCompleted.length ?? 0) / cmLessons) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <Button variant="white" to={`/app/learning/${continueItem.moduleId}`} iconRight={<ArrowRight className="h-4 w-4" />}>
                    {cm?.status === 'in-progress' ? 'Continue' : 'Start module'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lilac-200">Path complete</p>
                <h2 className="mt-2 text-3xl leading-[1.05] sm:text-4xl">
                  Every module, <em>done.</em>
                </h2>
                <p className="mt-2 text-sm text-canvas/65">Demonstrate your competency in the final assessment and capstone to earn certification.</p>
                <Button className="mt-4" variant="white" to="/app/assessments" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Go to assessments
                </Button>
              </>
            )}
          </div>
          <div className="relative hidden h-40 w-40 lg:block" aria-hidden>
            <div className="h-full w-full animate-float">
              <GrowthPath className="h-full w-full" />
            </div>
            <Sparkle className="absolute -left-2 top-2 h-6 w-6" color="#ffa946" />
          </div>
        </div>
      </Card>

      {/* Summary stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat delay={60} icon={<Check className="h-5 w-5" />} tone="bg-brand-800 text-canvas" label="Modules completed" value={`${stats.completed} of ${stats.total}`} hint={`${stats.requiredCompleted}/${stats.requiredTotal} required for certification`} />
        <MiniStat delay={120} icon={<Clock className="h-5 w-5" />} tone="bg-lilac-200 text-ink-950" label="Time remaining" value={`~${formatMinutes(stats.minutesRemaining)}`} hint={`of ${formatMinutes(stats.minutesTotal)}`} />
        <MiniStat delay={180} icon={<Flame className="h-5 w-5" />} tone="bg-clay-400 text-ink-950" label="Learning streak" value={`${progress.streak.current} day${progress.streak.current === 1 ? '' : 's'}`} hint={`Longest: ${progress.streak.longest} days`} />
        <Reveal delay={240}>
          <Card className="flex h-full items-start gap-4 !p-4 sm:!p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-ink-950">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-500">Recommended next</p>
              {recommendedNext ? (
                <>
                  <p className="mt-0.5 line-clamp-2 font-display text-lg leading-snug text-ink-950">{moduleTitle(recommendedNext.moduleId, domainId)}</p>
                  <a href={`#/app/learning/${recommendedNext.moduleId}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink-950 underline decoration-lilac-400 decoration-2 underline-offset-4 hover:decoration-ink-950">
                    Preview <ArrowRight className="h-3 w-3" />
                  </a>
                </>
              ) : (
                <p className="mt-0.5 font-display text-lg text-ink-950">{continueItem ? 'Finish your current module' : 'Final assessment'}</p>
              )}
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Skills */}
      <Reveal>
        <Card className="mt-4">
          <CardTitle
            icon={<Layers className="h-4 w-4" />}
            title="Skills you're developing"
            subtitle="Levels rise only with demonstrated evidence"
            action={
              <Button size="sm" variant="ghost" to="/app/skills">
                All skills
              </Button>
            }
          />
          <div className="flex flex-wrap gap-2">
            {skills.map((id, i) => {
              const level = (progress.skillLevels[id] ?? 0) as SkillLevel;
              const c = SKILL_LEVEL_COLORS[level];
              return (
                <span key={id} title={SKILL_LEVEL_LABELS[level]} className={cn('inline-flex animate-ghost-in items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold', c.bg, c.text)} style={{ animationDelay: `${Math.min(i, 12) * 50}ms` }}>
                  <span className={cn('h-2 w-2 rounded-full', c.dot)} />
                  {skillName(id)}
                </span>
              );
            })}
          </div>
        </Card>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Journey */}
        <div className="min-w-0 lg:col-span-2">
          <Card padded={false} className="overflow-hidden rounded-4xl p-4 sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{items.length} modules · no locks</p>
                <h2 className="mt-1.5 text-4xl leading-[1] text-ink-950 sm:text-5xl">
                  Your <em>journey</em>
                </h2>
              </div>
              <div className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" aria-hidden>
                <div className="h-full w-full animate-float">
                  <MapPins className="h-full w-full" />
                </div>
              </div>
            </div>
            <ol>
              {items.map((item, idx) => (
                <PathStep
                  key={item.moduleId}
                  item={item}
                  idx={idx}
                  last={idx === items.length - 1}
                  status={stepStatus(item)}
                  nextDone={idx < items.length - 1 && stepStatus(items[idx + 1]) === 'completed'}
                  progress={progress}
                  best={(() => {
                    const a = moduleHasActivity(item.moduleId) ? activityFor(item.moduleId, domainId) : undefined;
                    return a ? bestScore(a.id) : null;
                  })()}
                />
              ))}
            </ol>
          </Card>
        </div>

        {/* Side */}
        <div className="space-y-4">
          {cert.finalUnlocked && (
            <Reveal>
              <Card className="relative overflow-hidden border-ink-950 bg-gold-400/90 shadow-ink-sm">
                <Sparkle className="absolute right-3 top-3 h-6 w-6" color="#1a1a1a" />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-canvas">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-ink-950">
                      Final <em>unlocked</em>
                    </h3>
                    <p className="mt-1 text-sm text-ink-800">You can now attempt the final knowledge assessment.</p>
                    <Button className="mt-3" size="sm" variant="dark" to="/app/assessments" iconRight={<ArrowRight className="h-4 w-4" />}>
                      Go to assessments
                    </Button>
                  </div>
                </div>
              </Card>
            </Reveal>
          )}

          {advanced && (
            <Reveal delay={60}>
              <Card>
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-lilac-800">
                  <Sparkles className="h-3.5 w-3.5" /> Suggested for you
                </p>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${domain?.color ?? '#034f46'}14`, color: domain?.color }}>
                    <Icon name={getModule(advanced)?.icon ?? 'Sparkles'} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl leading-snug text-ink-950">{moduleTitle(advanced, domainId)}</h3>
                    <p className="mt-1 text-sm text-ink-500">{getModule(advanced)?.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="violet">Advanced</Badge>
                      <Badge>Optional</Badge>
                      <Badge>{getModule(advanced)?.estimatedMinutes} min</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={addAdvanced}>
                    Add to my path
                  </Button>
                  <Button size="sm" variant="ghost" to={`/app/learning/${advanced}`}>
                    Preview
                  </Button>
                </div>
              </Card>
            </Reveal>
          )}

          <Reveal delay={120}>
            <Card>
              <CardTitle icon={<Gauge className="h-4 w-4" />} title="Your adaptive pace" subtitle="Adjusts from your quiz results" />
              <div className="grid grid-cols-3 gap-1 rounded-full border border-ink-950/10 bg-sand-200/60 p-1">
                {(['supported', 'standard', 'accelerated'] as const).map((p) => (
                  <div
                    key={p}
                    className={cn(
                      'rounded-full py-1.5 text-center text-xs font-semibold transition',
                      progress.pace === p ? (p === 'supported' ? 'bg-clay-400 text-ink-950' : p === 'standard' ? 'bg-ink-950 text-canvas' : 'bg-brand-800 text-canvas') : 'text-ink-500',
                    )}
                  >
                    {PACE_META[p].label}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-ink-600">{pace.description}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-ink-500">
                <li className="flex gap-2">
                  <Zap className="h-3.5 w-3.5 shrink-0 text-clay-500" /> Two first-time misses in a module → extra practice and re-explanations for your role
                </li>
                <li className="flex gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-800" /> 90%+ mastery → Fast-track and stretch modules
                </li>
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={180}>
            <Card className="relative overflow-hidden border-ink-950 bg-lilac-200">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 animate-ghost-float" aria-hidden>
                  <GhostMascot mood="wave" className="h-full w-full" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl leading-tight text-ink-950">
                    Stuck? <em>Ask.</em>
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-700">
                    Tailored to your work{profile?.jobTitle ? ` as ${/^[aeiou]/i.test(profile.jobTitle) ? 'an' : 'a'} ${profile.jobTitle}` : ''}.
                  </p>
                </div>
              </div>
              <Button className="mt-4" size="sm" variant="dark" to="/app/tutor" iconRight={<ArrowRight className="h-4 w-4" />}>
                Open AI Tutor
              </Button>
            </Card>
          </Reveal>

          <Reveal delay={240}>
            <Card>
              <CardTitle icon={<RefreshCw className="h-4 w-4" />} title="Reassess my AI readiness" subtitle="See how far you've grown" />
              {stats.completed >= 2 ? (
                <Button size="sm" to="/app/reassess" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Reassess My AI Readiness
                </Button>
              ) : (
                <div>
                  <p className="flex items-center gap-1.5 text-sm text-ink-500">
                    <Lock className="h-3.5 w-3.5" /> Unlocks after 2 completed modules
                  </p>
                  <ProgressBar className="mt-2" value={(stats.completed / 2) * 100} label={`${stats.completed} of 2 modules`} size="xs" tone="ink" />
                </div>
              )}
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, tone, label, value, hint, delay = 0 }: { icon: ReactNode; tone: string; label: string; value: string; hint?: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Card className="flex h-full items-start gap-4 !p-4 sm:!p-5">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone)}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink-500">{label}</p>
          <p className="mt-0.5 font-display text-2xl leading-tight text-ink-950 tabular-nums">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
        </div>
      </Card>
    </Reveal>
  );
}

/* Node centres for the winding journey (sm and up): even steps sit left, odd steps step right. */
const NODE_X = [18, 58];

function PathStep({ item, idx, last, status, nextDone, progress, best }: { item: PathItem; idx: number; last: boolean; status: StepStatus; nextDone: boolean; progress: EmployeeProgress; best: number | null }) {
  const meta = getModule(item.moduleId);
  if (!meta) return null;
  const domain = getDomain(meta.domainId ?? progress.domainId);
  const mp = progress.modules[item.moduleId];
  const lessons = lessonCountFor(item.moduleId);
  const hasActivity = moduleHasActivity(item.moduleId);
  const s = STATUS_META[status];
  const color = domain?.color ?? '#034f46';
  const cta = status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start';
  const odd = idx % 2 === 1;
  const x1 = NODE_X[idx % 2];
  const x2 = NODE_X[(idx + 1) % 2];
  const doneSeg = status === 'completed' && nextDone;
  const delay = Math.min(idx, 8) * 90;

  return (
    <li className="relative flex gap-3 pb-7 last:pb-0 sm:gap-4">
      {!last && (
        <>
          {/* Mobile: straight connector */}
          <span
            className={cn('absolute bottom-0 left-[17px] top-10 w-0 animate-ghost-in border-l-2 sm:hidden', status === 'completed' ? 'border-solid border-brand-800' : 'border-dotted border-ink-950/25')}
            style={{ animationDelay: `${delay + 200}ms` }}
            aria-hidden
          />
          {/* sm+: winding dotted connector that draws itself */}
          <svg className="pointer-events-none absolute bottom-0 left-0 top-9 hidden h-[calc(100%-2.25rem)] w-[80px] overflow-visible sm:block" viewBox="0 0 80 100" preserveAspectRatio="none" fill="none" aria-hidden>
            <path
              d={`M${x1} 0 C${x1} 55, ${x2} 45, ${x2} 100`}
              stroke="#1a1a1a"
              strokeOpacity={0.25}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="1 7"
              vectorEffect="non-scaling-stroke"
              className="animate-ghost-in"
              style={{ animationDelay: `${delay + 200}ms` }}
            />
            {doneSeg && (
              <path
                d={`M${x1} 0 C${x1} 55, ${x2} 45, ${x2} 100`}
                stroke="#034f46"
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                className="animate-draw"
                style={{ ['--len' as string]: 1, animationDelay: `${delay + 300}ms` } as React.CSSProperties}
              />
            )}
          </svg>
        </>
      )}
      <div className={cn('relative z-10 shrink-0 transition-[margin]', odd && 'sm:ml-10')}>
        {status === 'completed' ? (
          <span className="flex h-9 w-9 animate-scale-in items-center justify-center rounded-full bg-brand-800 text-canvas shadow-sm" style={{ animationDelay: `${delay}ms` }}>
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        ) : status === 'in-progress' ? (
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink-950 bg-lilac-200 font-condensed text-base text-ink-950 shadow-ink-sm">
            <span className="absolute -inset-1 animate-ping-slow rounded-full bg-lilac-300/60" />
            <span className="relative">{idx + 1}</span>
          </span>
        ) : status === 'up-next' ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-950 bg-gold-400 font-condensed text-base text-ink-950">{idx + 1}</span>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-950/10 bg-paper font-condensed text-base text-ink-400">{idx + 1}</span>
        )}
      </div>

      <Reveal delay={delay} className="min-w-0 flex-1">
        <div
          className={cn(
            'rounded-3xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5',
            status === 'in-progress' ? 'border-ink-950 bg-lilac-100/60 shadow-ink-sm' : 'border-ink-950/10 bg-paper',
          )}
        >
          <div className="flex items-start gap-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex" style={{ background: `${color}14`, color }}>
              <Icon name={meta.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={s.tone}>{s.label}</Badge>
                {item.required ? <Badge tone="dark">Required for certification</Badge> : <Badge>Optional</Badge>}
                {item.addedBy === 'adaptive' && (
                  <Badge tone="violet" icon={<Sparkles className="h-3 w-3" />}>
                    Adaptive
                  </Badge>
                )}
                {item.addedBy === 'transition' && <Badge tone="clay">Career transition</Badge>}
              </div>
              <h3 className="mt-2 font-display text-xl leading-snug text-ink-950 sm:text-2xl">{moduleTitle(meta, progress.domainId)}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{item.reason}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {meta.estimatedMinutes} min
                </span>
                <span className="capitalize">{meta.level}</span>
                <span>
                  {lessons} lesson{lessons === 1 ? '' : 's'}
                  {meta.kind === 'challenge' ? ' + challenge' : ''}
                </span>
              </div>
              {(mp?.struggling || (progress.pace === 'accelerated' && status !== 'completed') || hasActivity) && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {mp?.struggling && (
                    <Badge tone="clay" icon={<Zap className="h-3 w-3" />}>
                      Extra practice recommended
                    </Badge>
                  )}
                  {progress.pace === 'accelerated' && status !== 'completed' && !mp?.struggling && (
                    <Badge tone="brand" icon={<Zap className="h-3 w-3" />}>
                      Fast-track
                    </Badge>
                  )}
                  {hasActivity && (
                    <Badge tone={best != null && best >= 60 ? 'brand' : 'gold'} icon={<ClipboardCheck className="h-3 w-3" />}>
                      {best != null ? `Practical activity · best ${best}%` : 'Practical activity'}
                    </Badge>
                  )}
                </div>
              )}
              {mp && mp.status !== 'not-started' && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <ProgressBar value={lessons ? (mp.lessonsCompleted.length / lessons) * 100 : 0} label={`Lessons ${Math.min(mp.lessonsCompleted.length, lessons)}/${lessons}`} size="xs" tone="ink" />
                  {mp.quizTotal > 0 && <ProgressBar value={mp.mastery} label="Mastery" showValue size="xs" tone={mp.mastery >= 80 ? 'brand' : mp.mastery >= 60 ? 'gold' : 'clay'} />}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {hasActivity && (status === 'completed' || best != null || meta.kind === 'challenge') && (
              <Button size="sm" variant="ghost" to={`/app/learning/${meta.id}/activity`} icon={<ClipboardCheck className="h-4 w-4" />}>
                {meta.kind === 'challenge' ? 'Challenge' : 'Practical'}
              </Button>
            )}
            <Button size="sm" variant={status === 'in-progress' || status === 'up-next' ? 'primary' : 'outline'} to={`/app/learning/${meta.id}`} iconRight={<ArrowRight className="h-3.5 w-3.5" />}>
              {cta}
            </Button>
          </div>
        </div>
      </Reveal>
    </li>
  );
}
