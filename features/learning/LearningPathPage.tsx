import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowRight, Award, Bot, Check, ClipboardCheck, Clock, Flame, Gauge, Layers, Lock, Plus, RefreshCw, Route, Sparkles, Target, Zap,
} from 'lucide-react';
import {
  Badge, Button, Card, CardTitle, EmptyState, ErrorState, Icon, LoadingState, PageHeader, ProgressBar, ScoreRing, useToast,
} from '../../components/ui';
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

const STATUS_META: Record<StepStatus, { label: string; tone: 'brand' | 'gold' | 'sky' | 'neutral' }> = {
  completed: { label: 'Completed', tone: 'brand' },
  'in-progress': { label: 'In progress', tone: 'gold' },
  'up-next': { label: 'Up next', tone: 'sky' },
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
        title="My AI Learning Path"
        description={
          <>
            Personalised from your AI Skills Prescription
            {transition ? (
              <>
                {' '}
                · career transition to <strong className="text-ink-950">{profile?.targetCareer}</strong>
              </>
            ) : (
              <> for {domain?.professional ?? 'your profession'}</>
            )}
            . Recommended order — start anywhere; your path adapts as you learn.
          </>
        }
        actions={
          <Button variant="outline" to="/app/tutor" icon={<Bot className="h-4 w-4" />}>
            Ask the AI Tutor
          </Button>
        }
      />

      {/* Hero summary */}
      <Card padded={false} className="relative overflow-hidden border-0 bg-ink-950 text-white shadow-lift">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-8">
          <div className="flex items-center gap-5">
            <ScoreRing value={stats.percent} size={128} stroke={11} color="#39c996" track="rgba(255,255,255,0.12)">
              <span className="text-3xl font-extrabold tabular-nums text-white">
                {stats.percent}
                <span className="align-top text-base text-white/50">%</span>
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">complete</span>
            </ScoreRing>
            <div className="md:hidden">
              <p className="text-2xl font-extrabold">
                {stats.completed}/{stats.total}
              </p>
              <p className="text-sm text-white/60">modules completed</p>
            </div>
          </div>
          <div className="min-w-0">
            {continueItem ? (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-300">{cm?.status === 'in-progress' ? 'Continue where you left off' : 'Start here'}</p>
                <h2 className="mt-1.5 text-xl font-extrabold leading-tight sm:text-2xl">{moduleTitle(continueItem.moduleId, domainId)}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm text-white/65">{continueItem.reason}</p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/60">
                      <span>
                        Lesson {Math.min((cm?.lessonsCompleted.length ?? 0) + 1, cmLessons)} of {cmLessons}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {getModule(continueItem.moduleId)?.estimatedMinutes ?? 20} min
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-brand-400 transition-[width] duration-700" style={{ width: `${cmLessons ? ((cm?.lessonsCompleted.length ?? 0) / cmLessons) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <Button variant="gold" to={`/app/learning/${continueItem.moduleId}`} iconRight={<ArrowRight className="h-4 w-4" />}>
                    {cm?.status === 'in-progress' ? 'Continue' : 'Start module'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-300">Path complete</p>
                <h2 className="mt-1.5 text-xl font-extrabold sm:text-2xl">You've completed every module in your path</h2>
                <p className="mt-1.5 text-sm text-white/65">Demonstrate your competency in the final assessment and capstone to earn certification.</p>
                <Button className="mt-4" variant="gold" to="/app/assessments" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Go to assessments
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Summary stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat icon={<Check className="h-5 w-5" />} tone="bg-brand-50 text-brand-700" label="Modules completed" value={`${stats.completed} of ${stats.total}`} hint={`${stats.requiredCompleted}/${stats.requiredTotal} required for certification`} />
        <MiniStat icon={<Clock className="h-5 w-5" />} tone="bg-sky-50 text-sky-700" label="Learning time remaining" value={`~${formatMinutes(stats.minutesRemaining)}`} hint={`of ${formatMinutes(stats.minutesTotal)} in your path`} />
        <MiniStat icon={<Flame className="h-5 w-5" />} tone="bg-clay-50 text-clay-600" label="Learning streak" value={`${progress.streak.current} day${progress.streak.current === 1 ? '' : 's'}`} hint={`Longest: ${progress.streak.longest} days`} />
        <Card className="flex items-start gap-4 !p-4 sm:!p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-500">Recommended next</p>
            {recommendedNext ? (
              <>
                <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-ink-950">{moduleTitle(recommendedNext.moduleId, domainId)}</p>
                <a href={`#/app/learning/${recommendedNext.moduleId}`} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline">
                  Preview <ArrowRight className="h-3 w-3" />
                </a>
              </>
            ) : (
              <p className="mt-0.5 text-sm font-bold text-ink-950">{continueItem ? 'Finish your current module' : 'Final assessment'}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Skills */}
      <Card className="mt-4">
        <CardTitle
          icon={<Layers className="h-4 w-4" />}
          title="Skills you're developing"
          subtitle="Levels rise only with demonstrated evidence — quizzes, practical activities and assessments"
          action={
            <Button size="sm" variant="ghost" to="/app/skills">
              All skills
            </Button>
          }
        />
        <div className="flex flex-wrap gap-2">
          {skills.map((id) => {
            const level = (progress.skillLevels[id] ?? 0) as SkillLevel;
            const c = SKILL_LEVEL_COLORS[level];
            return (
              <span key={id} title={SKILL_LEVEL_LABELS[level]} className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold', c.bg, c.text)}>
                <span className={cn('h-2 w-2 rounded-full', c.dot)} />
                {skillName(id)}
              </span>
            );
          })}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card padded={false} className="p-4 sm:p-6">
            <CardTitle icon={<Route className="h-4 w-4" />} title="Your path" subtitle={`${items.length} modules in recommended order · no locks — follow your curiosity`} />
            <ol>
              {items.map((item, idx) => (
                <PathStep
                  key={item.moduleId}
                  item={item}
                  idx={idx}
                  last={idx === items.length - 1}
                  status={stepStatus(item)}
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
            <Card className="relative overflow-hidden border-gold-200 bg-gradient-to-br from-gold-50 via-white to-white">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-ink-950">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-ink-950">Final assessment unlocked</h3>
                  <p className="mt-1 text-sm text-slate-600">You've completed enough required learning to attempt the final knowledge assessment towards certification.</p>
                  <Button className="mt-3" size="sm" variant="gold" to="/app/assessments" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Go to assessments
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {advanced && (
            <Card>
              <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-600">
                <Sparkles className="h-3.5 w-3.5" /> Suggested for you
              </p>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${domain?.color ?? '#0a8a5f'}14`, color: domain?.color }}>
                  <Icon name={getModule(advanced)?.icon ?? 'Sparkles'} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold leading-snug text-ink-950">{moduleTitle(advanced, domainId)}</h3>
                  <p className="mt-1 text-sm text-slate-500">{getModule(advanced)?.summary}</p>
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
          )}

          <Card>
            <CardTitle icon={<Gauge className="h-4 w-4" />} title="Your adaptive pace" subtitle="Adjusts automatically from your quiz results" />
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {(['supported', 'standard', 'accelerated'] as const).map((p) => (
                <div
                  key={p}
                  className={cn(
                    'rounded-lg py-1.5 text-center text-xs font-bold transition',
                    progress.pace === p ? (p === 'supported' ? 'bg-clay-500 text-white' : p === 'standard' ? 'bg-sky-600 text-white' : 'bg-brand-600 text-white') : 'text-slate-500',
                  )}
                >
                  {PACE_META[p].label}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">{pace.description}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
              <li className="flex gap-2">
                <Zap className="h-3.5 w-3.5 shrink-0 text-clay-500" /> Two first-time misses in a module → extra practice and re-explanations for your role
              </li>
              <li className="flex gap-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-600" /> 90%+ mastery → Fast-track and stretch modules
              </li>
            </ul>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold">Stuck? Ask the AI Tutor</h3>
                <p className="mt-1 text-sm text-brand-50/90">
                  Explanations and examples tailored to your work{profile?.jobTitle ? ` as ${/^[aeiou]/i.test(profile.jobTitle) ? 'an' : 'a'} ${profile.jobTitle}` : ''}.
                </p>
                <Button className="mt-3" size="sm" variant="white" to="/app/tutor" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Open AI Tutor
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle icon={<RefreshCw className="h-4 w-4" />} title="Reassess my AI readiness" subtitle="See how much your readiness has grown" />
            {stats.completed >= 2 ? (
              <Button size="sm" to="/app/reassess" iconRight={<ArrowRight className="h-4 w-4" />}>
                Reassess My AI Readiness
              </Button>
            ) : (
              <div>
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Lock className="h-3.5 w-3.5" /> Unlocks after 2 completed modules
                </p>
                <ProgressBar className="mt-2" value={(stats.completed / 2) * 100} label={`${stats.completed} of 2 modules`} size="xs" />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, tone, label, value, hint }: { icon: ReactNode; tone: string; label: string; value: string; hint?: string }) {
  return (
    <Card className="flex items-start gap-4 !p-4 sm:!p-5">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone)}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-extrabold tracking-tight text-ink-950 tabular-nums">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </Card>
  );
}

function PathStep({ item, idx, last, status, progress, best }: { item: PathItem; idx: number; last: boolean; status: StepStatus; progress: EmployeeProgress; best: number | null }) {
  const meta = getModule(item.moduleId);
  if (!meta) return null;
  const domain = getDomain(meta.domainId ?? progress.domainId);
  const mp = progress.modules[item.moduleId];
  const lessons = lessonCountFor(item.moduleId);
  const hasActivity = moduleHasActivity(item.moduleId);
  const s = STATUS_META[status];
  const color = domain?.color ?? '#0a8a5f';
  const cta = status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start';

  return (
    <li className="relative flex animate-fade-up gap-3 pb-5 last:pb-0 sm:gap-4" style={{ animationDelay: `${Math.min(idx, 8) * 50}ms` }}>
      {!last && <span className={cn('absolute left-[17px] top-10 bottom-1 w-0.5 rounded-full', status === 'completed' ? 'bg-brand-300' : 'bg-slate-200')} />}
      <div className="relative z-10 shrink-0">
        {status === 'completed' ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        ) : status === 'in-progress' ? (
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-extrabold text-brand-700 ring-2 ring-brand-500">
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-brand-400/30" />
            {idx + 1}
          </span>
        ) : status === 'up-next' ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-sm font-extrabold text-ink-950">{idx + 1}</span>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">{idx + 1}</span>
        )}
      </div>

      <div className={cn('min-w-0 flex-1 rounded-2xl border p-4 transition duration-200 hover:shadow-lift', status === 'in-progress' ? 'border-brand-300 bg-brand-50/30' : 'border-slate-200 bg-white')}>
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
              {item.addedBy === 'transition' && <Badge tone="sky">Career transition</Badge>}
            </div>
            <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink-950">{moduleTitle(meta, progress.domainId)}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-600">Why it's in your path: </span>
              {item.reason}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
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
                <ProgressBar value={lessons ? (mp.lessonsCompleted.length / lessons) * 100 : 0} label={`Lessons ${Math.min(mp.lessonsCompleted.length, lessons)}/${lessons}`} size="xs" />
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
    </li>
  );
}
