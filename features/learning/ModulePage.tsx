import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bot, Check, ChevronLeft, ChevronRight, ClipboardCheck, Clock, Eye, Keyboard, PanelRightOpen, Plus,
  RefreshCw, Rocket, Route, Sparkles, Target, Trophy, X, Zap,
} from 'lucide-react';
import {
  AISourceBadge, Badge, Button, Card, EmptyState, ErrorState, Icon, LoadingState, Modal, ScoreRing, useToast,
} from '../../components/ui';
import { CertificateRibbon, GhostMascot, Sparkle } from '../../components/illustrations';
import { LessonTutorial } from '../../components/tutorials';
import { SparkleBurst, TutorialStyles } from '../../components/tutorials/primitives';
import { useApp } from '../../services/store';
import { generateJSON, generateText, Type } from '../../services/gemini';
import type { Schema } from '../../services/gemini';
import { getDomain, getModule, moduleTitle } from '../../data/catalog';
import { getRole, roleName } from '../../data/roles';
import { skillName } from '../../data/skills';
import { emptyModuleProgress, raiseSkills, recordActivity } from '../../lib/progress';
import { SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { cn, nowISO } from '../../lib/utils';
import type { AISource, DomainId, EmployeeProgress, SkillLevel } from '../../types';
import { TutorPanel } from '../tutor/TutorPanel';
import { blockToText } from '../tutor/tutorEngine';
import { AIExampleView, BlockLabel, ExampleView, ExplainView, InteractiveView, isGated, QuizView, TaskView } from './components/blocks';
import type { AltExplanation, PlayerBlock, QuizBlock } from './components/blocks';
import { activityFor, useModuleContent } from './components/moduleContent';
import type { ResolvedModule } from './components/moduleContent';
import { seedFor } from './components/domainSeeds';
import {
  addModuleToPath, formatMinutes, nextPathModule, useEnsureProgress, useLearnerDescription, useLearnerDomain, withModule,
} from './components/useLearning';

// ───────────────────────── Page ─────────────────────────

export default function ModulePage() {
  const { moduleId = '' } = useParams();
  const meta = getModule(moduleId);
  const { progress, creating, error } = useEnsureProgress();
  const domainId = useLearnerDomain();
  const learner = useLearnerDescription();
  const { state, retry } = useModuleContent(meta ? moduleId : undefined, domainId, learner);

  if (!meta)
    return (
      <EmptyState
        className="my-10"
        icon={<Route className="h-6 w-6" />}
        title="We couldn't find that module"
        description="It may have been renamed or removed. Head back to your learning path to pick up where you left off."
        action={<Button to="/app/learning">Back to my learning path</Button>}
      />
    );
  if (!progress) {
    if (creating) return <LoadingState variant="ai" className="min-h-[60vh]" title="Building your personalised path…" messages={['Reading your AI Skills Prescription', 'Ordering modules by priority', 'Tailoring examples to your role']} />;
    if (error) return <ErrorState className="my-10" message={error} onRetry={() => window.location.reload()} />;
    return (
      <EmptyState
        className="my-10"
        icon={<Target className="h-6 w-6" />}
        title="Start with your AI readiness assessment"
        description="Your lessons are personalised from your AI Skills Prescription. Complete the readiness assessment first."
        action={<Button to="/app/readiness">Go to AI readiness</Button>}
      />
    );
  }
  if (state.status === 'loading')
    return (
      <LoadingState
        variant="ai"
        className="min-h-[60vh]"
        title="Preparing your personalised lessons…"
        messages={['Reading the module outline', 'Writing examples for your profession', 'Adding quick checks and practical tasks', 'Checking for responsible AI guidance']}
      />
    );
  if (state.status === 'missing') return <ErrorState className="my-10" title="Lessons unavailable" message="We could not load this module's lessons." onRetry={retry} />;
  return <Player key={moduleId} data={state.data} progress={progress} domainId={domainId} learner={learner} />;
}

// ───────────────────────── Player ─────────────────────────

interface Summary {
  mastery: number;
  quizCorrect: number;
  quizTotal: number;
  minutes: number;
  completedNow: boolean;
  skills: { id: string; level: SkillLevel }[];
}

const TUTOR_PREF = 'zimai:tutorPanel';
const countedKey = (userId: string, moduleId: string) => `zimai:quizcount:${userId}:${moduleId}`;
function readCounted(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
  } catch {
    return [];
  }
}
function writeCounted(key: string, v: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

function Player({ data, progress, domainId, learner }: { data: ResolvedModule; progress: EmployeeProgress; domainId: DomainId; learner: string }) {
  const { meta, content, source } = data;
  const { user, profile, saveProgress, submissions } = useApp();
  const toast = useToast();
  const userId = user?.id ?? 'guest';
  const title = moduleTitle(meta, domainId);
  const domain = getDomain(domainId);
  const lessons = content.lessons;
  const mp = progress.modules[meta.id] ?? emptyModuleProgress(meta.id);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const activity = activityFor(meta.id, domainId, content);
  const bestActivity = activity ? Math.max(-1, ...submissions.filter((s) => s.activityId === activity.id).map((s) => s.feedback.score)) : -1;

  const fieldExample = meta.kind === 'core' ? content.domainExamples?.[domainId] ?? (profile ? content.domainExamples?.[profile.domainId] : undefined) : undefined;

  const lessonBlocks: PlayerBlock[][] = useMemo(
    () =>
      lessons.map((l, li) => {
        const blocks: PlayerBlock[] = [...l.blocks];
        if (li === 0 && fieldExample) {
          const idx = blocks.findIndex((b) => b.type === 'explain');
          blocks.splice(idx + 1, 0, { type: 'field', title: `How this looks in ${domain?.shortName ?? 'your field'}`, scenario: fieldExample.scenario, takeaway: fieldExample.takeaway, domainName: domain?.name ?? '' });
        }
        return blocks;
      }),
    [lessons, fieldExample, domain],
  );

  const allLessonsDone = lessons.every((l) => mp.lessonsCompleted.includes(l.id));
  const initialLesson = useMemo(() => {
    if (mp.status === 'completed') return 0;
    const cur = lessons.findIndex((l) => l.id === mp.currentLessonId);
    if (cur >= 0 && !mp.lessonsCompleted.includes(lessons[cur].id)) return cur;
    const first = lessons.findIndex((l) => !mp.lessonsCompleted.includes(l.id));
    return first >= 0 ? first : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [lessonIdx, setLessonIdx] = useState(initialLesson);
  const [blockIdx, setBlockIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [view, setView] = useState<'lesson' | 'complete' | 'briefing'>(() => (meta.kind === 'challenge' && allLessonsDone ? 'briefing' : 'lesson'));
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [firstResults, setFirstResults] = useState<Record<string, boolean>>({});
  const [strongLesson, setStrongLesson] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saving, setSaving] = useState(false);
  const [mobileTutor, setMobileTutor] = useState(false);
  // Lesson preview tutorial: open on a fresh module, collapsed otherwise. Remembered for this module while the page is open.
  const [previewOpen, setPreviewOpen] = useState(() => mp.status === 'not-started' && mp.lessonsCompleted.length === 0);
  const [tutorOpen, setTutorOpen] = useState(() => {
    try {
      return localStorage.getItem(TUTOR_PREF) !== 'closed';
    } catch {
      return true;
    }
  });
  const toggleTutor = (open: boolean) => {
    setTutorOpen(open);
    try {
      localStorage.setItem(TUTOR_PREF, open ? 'open' : 'closed');
    } catch {
      /* ignore */
    }
  };

  const lesson = lessons[lessonIdx];
  const blocks = lessonBlocks[lessonIdx] ?? [];
  const block = blocks[blockIdx];
  const key = `${lesson?.id}:${blockIdx}`;
  const lessonDone = !!lesson && mp.lessonsCompleted.includes(lesson.id);
  const canAdvance = !!block && (!isGated(block) || lessonDone || !!solved[key]);
  const isLastBlock = blockIdx === blocks.length - 1;
  const isLastLesson = lessonIdx === lessons.length - 1;
  const firstIncomplete = lessons.findIndex((l) => !mp.lessonsCompleted.includes(l.id));

  // Mark the module as started when it is opened (also adds it if it's not in the path).
  useEffect(() => {
    saveProgress((prev) =>
      withModule(prev ?? progressRef.current, meta.id, (m) => ({
        ...m,
        status: m.status === 'not-started' ? 'in-progress' : m.status,
        startedAt: m.startedAt ?? nowISO(),
        currentLessonId: m.status === 'completed' ? m.currentLessonId : lessons[initialLesson]?.id,
      })),
    ).catch((e) => console.warn('[ZimAI] could not start module', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ── Quiz tracking & adaptive support ──
  const onFirstAttempt = useCallback(
    (bKey: string, correct: boolean, inCompletedLesson: boolean) => {
      setFirstResults((r) => ({ ...r, [bKey]: correct }));
      if (inCompletedLesson) return;
      const ck = countedKey(userId, meta.id);
      const counted = readCounted(ck);
      if (counted.includes(bKey)) return;
      writeCounted(ck, [...counted, bKey]);
      const flag = { became: false };
      saveProgress((prev) => {
        let p = withModule(prev ?? progressRef.current, meta.id, (m) => {
          const n = { ...m, quizTotal: m.quizTotal + 1, quizCorrect: m.quizCorrect + (correct ? 1 : 0) };
          if (!correct && n.quizTotal - n.quizCorrect >= 2 && !n.struggling) {
            n.struggling = true;
            flag.became = true;
          }
          return n;
        });
        if (flag.became) p = { ...p, pace: 'supported' };
        return p;
      })
        .then(() => {
          if (flag.became) toast.info('Extra practice unlocked', "We've switched you to a supported pace with extra practice tailored to your role.");
        })
        .catch((e) => console.warn('[ZimAI] could not record quiz', e));
    },
    [userId, meta.id, saveProgress, toast],
  );

  const explainDifferently = useCallback(
    async (b: QuizBlock, chosen: number): Promise<AltExplanation> => {
      const ex = fieldExample ?? seedFor(domainId).example;
      const role = getRole(profile?.roleId);
      const job = profile?.jobTitle || (profile ? roleName(profile.roleId, profile.roleOther) : 'professional');
      const fallback = () =>
        `Let's look at it from a different angle.\n\n**The key idea:** ${b.explanation}\n\n**In ${domain?.shortName ?? 'your'} work:** ${ex.scenario}\n\n**So:** ${ex.takeaway}\n\nThat's why the best answer is **${b.options[b.correctIndex]}**${chosen !== b.correctIndex ? ` rather than "${b.options[chosen]}"` : ''}.${
          role ? `\n\n**Memory tip:** next time you're working on ${role.aiImpactedTasks[0].toLowerCase()}, ask yourself what could go wrong if you skipped this step.` : ''
        }`;
      const res = await generateText({
        system: 'You are a patient workplace AI tutor who re-explains concepts in fresh, concrete ways.',
        prompt: `LEARNER
${learner}

The learner answered this question incorrectly in the module "${title}".
Question: ${b.question}
Their answer: ${b.options[chosen]}
Correct answer: ${b.options[b.correctIndex]}
Original explanation (it did not land): ${b.explanation}

Re-explain the concept in a DIFFERENT way, specifically for a ${job}. Use one concrete example from their daily work in their industry (fictional organisation). Gently explain why their choice falls short. Maximum 110 words. End with a single line starting "**Memory tip:**".`,
        temperature: 0.7,
        fallback,
      });
      return { text: res.data, source: res.source };
    },
    [fieldExample, domainId, profile, domain, learner, title],
  );

  // ── Navigation ──
  const completeLesson = async () => {
    if (!lesson || saving) return;
    setSaving(true);
    const wasDone = mp.lessonsCompleted.includes(lesson.id);
    const quizKeys = blocks.map((b, i) => (b.type === 'quiz' ? `${lesson.id}:${i}` : null)).filter((x): x is string => !!x);
    const strong = !wasDone && quizKeys.length > 0 && quizKeys.every((k) => firstResults[k] === true);
    const finishModule = isLastLesson && meta.kind !== 'challenge';
    const info = { completedNow: false };
    try {
      const updated = await saveProgress((prev) => {
        let p = withModule(prev ?? progressRef.current, meta.id, (m) => {
          const n = { ...m };
          if (!n.lessonsCompleted.includes(lesson.id)) {
            n.lessonsCompleted = [...n.lessonsCompleted, lesson.id];
            n.minutesSpent = (n.minutesSpent || 0) + lesson.minutes;
          }
          if (n.quizTotal > 0) n.mastery = Math.round((n.quizCorrect / n.quizTotal) * 100);
          if (n.status === 'not-started') n.status = 'in-progress';
          if (!isLastLesson) n.currentLessonId = lessons[lessonIdx + 1].id;
          if (finishModule && n.status !== 'completed') {
            n.status = 'completed';
            n.completedAt = nowISO();
            n.currentLessonId = undefined;
            info.completedNow = true;
          }
          return n;
        });
        if (!wasDone) p = recordActivity(p, 'lesson', `Completed lesson: ${title} · ${lesson.title}`);
        if (info.completedNow) {
          const mastery = p.modules[meta.id].mastery;
          p = raiseSkills(p, meta.skillIds, mastery >= 80 ? 2 : 1);
          p = recordActivity(p, 'lesson', `Completed module: ${title}`);
        }
        return p;
      });
      const m = updated.modules[meta.id];
      if (strong) setStrongLesson(lesson.title);
      if (isLastLesson) {
        setSummary({
          mastery: m.mastery,
          quizCorrect: m.quizCorrect,
          quizTotal: m.quizTotal,
          minutes: m.minutesSpent,
          completedNow: info.completedNow,
          skills: meta.skillIds.map((id) => ({ id, level: (updated.skillLevels[id] ?? 0) as SkillLevel })),
        });
        setView(meta.kind === 'challenge' ? 'briefing' : 'complete');
        if (strong) toast.success('Strong competency!', `Every answer right first time in "${lesson.title}".`);
        scrollTop();
      } else {
        toast.success(strong ? 'Strong competency!' : 'Lesson complete', strong ? `Every answer right first time in "${lesson.title}".` : `${lesson.title} · +${lesson.minutes} min of learning`);
        setDir(1);
        setLessonIdx(lessonIdx + 1);
        setBlockIdx(0);
        scrollTop();
      }
    } catch (e) {
      console.warn('[ZimAI] could not save lesson', e);
      toast.error('Could not save your progress', 'Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (!canAdvance || saving) return;
    if (blockIdx < blocks.length - 1) {
      setDir(1);
      setBlockIdx(blockIdx + 1);
    } else completeLesson();
  };
  const goBack = () => {
    if (blockIdx > 0) {
      setDir(-1);
      setBlockIdx(blockIdx - 1);
    } else if (lessonIdx > 0) {
      setDir(-1);
      setLessonIdx(lessonIdx - 1);
      setBlockIdx(lessonBlocks[lessonIdx - 1].length - 1);
    }
  };
  const jumpToLesson = (i: number) => {
    setDir(i >= lessonIdx ? 1 : -1);
    setLessonIdx(i);
    setBlockIdx(0);
    setView('lesson');
  };

  const navRef = useRef({ goNext, goBack });
  navRef.current = { goNext, goBack };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view !== 'lesson' || mobileTutor) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navRef.current.goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navRef.current.goBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, mobileTutor]);

  // ── Adaptive follow-up actions ──
  const switchPace = async (pace: EmployeeProgress['pace'], label: string) => {
    await saveProgress((prev) => recordActivity({ ...(prev ?? progressRef.current), pace }, 'path', label));
  };
  const advancedId = getDomain(domainId)?.moduleIds[2];
  const advancedInPath = !!advancedId && progress.path.some((i) => i.moduleId === advancedId);
  const addAdvanced = async () => {
    if (!advancedId) return;
    await saveProgress((prev) => addModuleToPath(prev ?? progressRef.current, advancedId, `Suggested after your strong ${title} result — a stretch module to deepen your expertise.`));
    toast.success('Added to your path', moduleTitle(advancedId, domainId));
  };

  const next = nextPathModule(progress, meta.id);
  const blockContext = view === 'lesson' && block ? blockToText(block) : summary ? `The learner has just completed the module with ${summary.mastery}% mastery.` : undefined;

  const renderBlock = () => {
    if (!block || !lesson) return null;
    switch (block.type) {
      case 'explain':
        return <ExplainView block={block} />;
      case 'example':
        return <ExampleView title={block.title} scenario={block.scenario} takeaway={block.takeaway} />;
      case 'field':
        return <ExampleView title={block.title} scenario={block.scenario} takeaway={block.takeaway} accent="gold" eyebrow={block.domainName} />;
      case 'ai-example':
        return <AIExampleView block={block} cacheKey={`zimai:aiex:${userId}:${lesson.id}:${blockIdx}`} learner={learner} />;
      case 'interactive':
        return <InteractiveView block={block} done={lessonDone} onDone={() => setSolved((s) => ({ ...s, [key]: true }))} />;
      case 'quiz':
        return (
          <QuizView
            block={block}
            done={false}
            onFirstAttempt={(c) => onFirstAttempt(key, c, lessonDone)}
            onSolved={() => setSolved((s) => ({ ...s, [key]: true }))}
            explainDifferently={explainDifferently}
          />
        );
      case 'task':
        return <TaskView block={block} storageKey={`zimai:reflection:${userId}:${lesson.id}:${blockIdx}`} />;
    }
  };

  const tutor = (
    <TutorPanel moduleId={meta.id} lessonTitle={view === 'lesson' ? lesson?.title : undefined} blockContext={blockContext} onClose={() => toggleTutor(false)} className="h-full" />
  );

  return (
    <div className="animate-fade-in">
      {/* Compact header */}
      <div className="sticky top-14 z-30 -mx-4 mb-5 border-b border-ink-950/10 bg-canvas/85 px-4 pb-3 pt-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/app/learning" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-950/15 bg-paper text-ink-700 transition hover:border-ink-950 hover:text-ink-950" aria-label="Back to my learning path">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lilac-200 text-ink-950 ring-1 ring-ink-950 sm:flex">
            <Icon name={meta.icon} className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-tight text-ink-950 sm:text-xl">{title}</p>
            <p className="truncate text-xs text-ink-500">
              {view === 'lesson' && lesson ? `Lesson ${lessonIdx + 1} of ${lessons.length} · ${lesson.title}` : view === 'complete' ? 'Module complete' : 'Briefing complete · practical challenge next'}
            </p>
          </div>
          {source !== 'authored' && (
            <span className="hidden sm:inline-flex" title="Lessons generated for this module">
              <AISourceBadge source={source} />
            </span>
          )}
          {!tutorOpen && (
            <Button size="sm" variant="outline" className="hidden lg:inline-flex" icon={<PanelRightOpen className="h-4 w-4" />} onClick={() => toggleTutor(true)}>
              AI Tutor
            </Button>
          )}
        </div>
        {view === 'lesson' && (
          <div className="mt-3 flex gap-1" aria-label={`Step ${blockIdx + 1} of ${blocks.length}`}>
            {blocks.map((_, i) => (
              <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', i < blockIdx ? 'bg-ink-950' : i === blockIdx ? 'animate-ghost-pulse bg-lilac-400' : 'bg-lilac-100')} />
            ))}
          </div>
        )}
      </div>

      <div className={cn('grid gap-6', tutorOpen && 'lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]')}>
        <div className="mx-auto w-full min-w-0 max-w-2xl">
          {view === 'lesson' && lesson && block && (
            <>
              <div className="mb-4 overflow-hidden rounded-3xl border border-ink-950/10 bg-paper">
                <button
                  type="button"
                  onClick={() => setPreviewOpen((o) => !o)}
                  aria-expanded={previewOpen}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-ink-950/[0.03]"
                >
                  <span className="h-8 w-8 shrink-0 animate-ghost-float" aria-hidden>
                    <GhostMascot mood="wave" className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1 font-display text-lg text-ink-950">
                    Lesson <em>preview</em>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-ink-950/15 px-2.5 py-1 text-xs font-semibold text-ink-700">
                    {previewOpen ? 'Hide' : 'Watch'}
                    <ChevronRight className={cn('h-3.5 w-3.5 transition-transform duration-300', previewOpen && 'rotate-90')} />
                  </span>
                </button>
                {previewOpen && (
                  <div className="animate-ghost-in px-2 pb-2">
                    <LessonTutorial className="rounded-[1.5rem]" />
                  </div>
                )}
              </div>

              {lessons.length > 1 && (
                <div className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1">
                  {lessons.map((l, i) => {
                    const done = mp.lessonsCompleted.includes(l.id);
                    const reachable = done || i === lessonIdx || i <= (firstIncomplete < 0 ? lessons.length : firstIncomplete);
                    return (
                      <button
                        key={l.id}
                        disabled={!reachable}
                        onClick={() => jumpToLesson(i)}
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                          i === lessonIdx ? 'bg-ink-950 text-canvas' : done ? 'bg-brand-50 text-brand-800 hover:bg-brand-100' : 'bg-paper text-ink-500 ring-1 ring-inset ring-ink-950/10 disabled:opacity-50',
                        )}
                      >
                        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="tabular-nums">{i + 1}</span>}
                        <span className="max-w-[160px] truncate">{l.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {mp.status === 'completed' && (
                <div className="mb-3 flex animate-ghost-in items-center gap-2 rounded-2xl bg-lilac-100 px-3 py-2 text-xs font-semibold text-ink-800 ring-1 ring-inset ring-lilac-300/60">
                  <Eye className="h-3.5 w-3.5" /> Review mode — you've completed this module, so answers here won't change your mastery.
                </div>
              )}
              {strongLesson && blockIdx === 0 && (
                <div className="relative mb-3 flex animate-ghost-in items-center gap-3 rounded-2xl border border-ink-950 bg-gold-400 px-4 py-3 shadow-ink-sm">
                  <TutorialStyles />
                  <SparkleBurst className="left-6 top-1/2" count={10} radius={50} />
                  <Trophy className="h-5 w-5 shrink-0 text-ink-950" />
                  <p className="flex-1 text-sm text-ink-950">
                    <strong>Strong competency</strong> in "{strongLesson}" — every answer right first time.
                  </p>
                  <button onClick={() => setStrongLesson(null)} className="text-ink-800 hover:text-ink-950" aria-label="Dismiss">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <Card key={key} className={cn('min-h-[320px] animate-ghost-in rounded-4xl sm:p-10', dir === 1 ? '' : '[animation-duration:.6s]')}>
                <div className="mb-6 flex items-center justify-between gap-2">
                  <BlockLabel type={block.type} />
                  <span className="font-condensed text-sm tracking-wider tabular-nums text-ink-400">
                    {blockIdx + 1} / {blocks.length}
                  </span>
                </div>
                {renderBlock()}
              </Card>

              <div className="mt-4 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={goBack} disabled={lessonIdx === 0 && blockIdx === 0} icon={<ChevronLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <span className="hidden items-center gap-1.5 text-xs text-ink-400 sm:inline-flex">
                  <Keyboard className="h-3.5 w-3.5" /> Use ← → keys
                </span>
                <Button onClick={goNext} disabled={!canAdvance} loading={saving} iconRight={<ChevronRight className="h-4 w-4" />}>
                  {isLastBlock ? (isLastLesson ? (meta.kind === 'challenge' ? 'Finish briefing' : 'Complete module') : 'Complete lesson') : 'Next'}
                </Button>
              </div>
              {!canAdvance && (
                <p className="mt-2 animate-ghost-in text-center text-xs font-medium text-ink-500 sm:text-right">{block.type === 'quiz' ? 'Answer correctly to continue' : 'Complete the activity to continue'}</p>
              )}

              {mp.struggling && (
                <ExtraPractice
                  key={`practice-${lessonIdx}`}
                  moduleTitleText={title}
                  lessons={lessons}
                  uptoLesson={lessonIdx}
                  learner={learner}
                  onRecovered={async () => {
                    await saveProgress((prev) => {
                      const p = withModule(prev ?? progressRef.current, meta.id, (m) => ({ ...m, struggling: false }));
                      return recordActivity({ ...p, pace: 'standard' }, 'quiz', `Extra practice completed: ${title}`);
                    });
                    toast.success("You're back on track", 'Two practice questions right — your pace is back to standard.');
                  }}
                />
              )}
            </>
          )}

          {view === 'complete' && (
            <CompletionView
              title={title}
              lessonsCount={lessons.length}
              summary={summary ?? { mastery: mp.mastery, quizCorrect: mp.quizCorrect, quizTotal: mp.quizTotal, minutes: mp.minutesSpent, completedNow: false, skills: meta.skillIds.map((id) => ({ id, level: (progress.skillLevels[id] ?? 0) as SkillLevel })) }}
              activity={activity ? { title: activity.title, to: `/app/learning/${meta.id}/activity`, best: bestActivity } : undefined}
              next={next ? { title: moduleTitle(next.moduleId, domainId), to: `/app/learning/${next.moduleId}` } : undefined}
              pace={progress.pace}
              onFastTrack={() => switchPace('accelerated', 'Switched to Fast-track pace').then(() => toast.success('Fast-track on', 'Your path will now move faster and suggest stretch modules sooner.'))}
              advanced={
                advancedId && advancedId !== meta.id
                  ? { id: advancedId, title: moduleTitle(advancedId, domainId), summary: getModule(advancedId)?.summary ?? '', inPath: advancedInPath, onAdd: addAdvanced }
                  : undefined
              }
              onReview={() => jumpToLesson(0)}
            />
          )}

          {view === 'briefing' && activity && (
            <Card className="animate-ghost-in rounded-4xl text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 animate-float items-center justify-center rounded-3xl border border-ink-950 bg-lilac-200 text-ink-950 shadow-ink-sm">
                <Target className="h-8 w-8" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{mp.status === 'completed' ? 'Challenge passed' : 'Briefing complete'}</p>
              <h1 className="mt-3 text-4xl leading-[1.02] text-ink-950 sm:text-5xl">{activity.title}</h1>
              <p className="mx-auto mt-3 max-w-lg text-[15px] text-ink-500">
                {mp.status === 'completed'
                  ? `You passed this challenge${bestActivity >= 0 ? ` with ${bestActivity}%` : ''}. You can revisit it to improve your score.`
                  : 'This module is completed by passing the practical challenge (60% or more). Your answer is assessed against a transparent rubric:'}
              </p>
              <div className="mx-auto mt-6 grid max-w-lg gap-2 text-left">
                {activity.rubric.map((r, i) => (
                  <div key={r.criterion} className="flex animate-ghost-in items-center justify-between gap-3 rounded-2xl bg-sand-200/60 px-4 py-2.5 text-sm" style={{ animationDelay: `${150 + i * 80}ms` }}>
                    <span className="font-semibold text-ink-950">{r.criterion}</span>
                    <Badge tone="neutral">{r.weight} pts</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button size="lg" to={`/app/learning/${meta.id}/activity`} iconRight={<ArrowRight className="h-5 w-5" />}>
                  {mp.status === 'completed' ? 'Open the challenge' : 'Start the challenge'}
                </Button>
                <Button size="lg" variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => jumpToLesson(0)}>
                  Review briefing
                </Button>
              </div>
            </Card>
          )}
        </div>

        {tutorOpen && (
          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-28 h-[calc(100vh-8.5rem)]">{tutor}</div>
          </aside>
        )}
      </div>

      {/* Mobile tutor */}
      <button
        onClick={() => setMobileTutor(true)}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex items-center gap-2 rounded-full border border-ink-950 bg-lilac-200 py-2 pl-2 pr-4 text-sm font-semibold text-ink-950 shadow-ink-sm transition active:scale-95 lg:hidden"
      >
        <span className="h-7 w-7 animate-ghost-float" aria-hidden>
          <GhostMascot className="h-full w-full" />
        </span>
        Ask AI Tutor
      </button>
      <Modal open={mobileTutor} onClose={() => setMobileTutor(false)} title="AI Tutor" description={title}>
        <TutorPanel
          moduleId={meta.id}
          lessonTitle={view === 'lesson' ? lesson?.title : undefined}
          blockContext={blockContext}
          showHeader={false}
          className="-mx-6 -my-5 h-[66vh] rounded-none border-0 shadow-none"
        />
      </Modal>

      {view === 'lesson' && !lessonDone && mp.status !== 'completed' && (
        <span className="sr-only" aria-live="polite">
          {`Lesson ${lessonIdx + 1}, step ${blockIdx + 1} of ${blocks.length}`}
        </span>
      )}
      {saving && <span className="sr-only">Saving…</span>}
    </div>
  );
}

// ───────────────────────── Extra practice ─────────────────────────

const PRACTICE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING },
  },
  required: ['question', 'options', 'correctIndex', 'explanation'],
};

function shuffleQuiz(q: QuizBlock): QuizBlock {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), correctIndex: order.indexOf(q.correctIndex) };
}

const GENERIC_PRACTICE: QuizBlock = {
  type: 'quiz',
  question: 'An AI tool gives you a polished draft containing a figure you have not seen before. What is the professional next step?',
  options: ['Use it — polished drafts are usually accurate', 'Verify the figure against a trusted source before using it', 'Ask the AI to rephrase the draft', 'Remove the figure and send the rest'],
  correctIndex: 1,
  explanation: 'Fluent writing is not proof of accuracy. Verify facts and figures against a trusted source before relying on them.',
};

function ExtraPractice({ moduleTitleText, lessons, uptoLesson, learner, onRecovered }: { moduleTitleText: string; lessons: ResolvedModule['content']['lessons']; uptoLesson: number; learner: string; onRecovered: () => void }) {
  const [q, setQ] = useState<{ quiz: QuizBlock; source: AISource } | null>(null);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const recovered = useRef(false);

  const earlier = useMemo(
    () =>
      lessons
        .slice(0, uptoLesson + 1)
        .flatMap((l) => l.blocks)
        .filter((b): b is QuizBlock => b.type === 'quiz'),
    [lessons, uptoLesson],
  );
  const concepts = useMemo(
    () =>
      lessons
        .slice(0, uptoLesson + 1)
        .flatMap((l) => l.blocks)
        .filter((b) => b.type === 'explain')
        .map((b) => (b.type === 'explain' ? `${b.title}: ${b.body}` : ''))
        .join('\n')
        .slice(0, 1500),
    [lessons, uptoLesson],
  );

  const generate = async () => {
    setLoading(true);
    const pick = earlier.length ? earlier[round % earlier.length] : GENERIC_PRACTICE;
    const res = await generateJSON<QuizBlock>({
      system: 'You write clear, fair multiple-choice practice questions for workplace AI micro-learning.',
      prompt: `LEARNER
${learner}

MODULE: ${moduleTitleText}
KEY CONCEPTS:
${concepts || 'Verification of AI output, responsible AI and prompting.'}

The learner has been finding this module difficult. Write ONE new practice question that reinforces a key concept using a scenario from the learner's own job and industry (fictional organisation). Exactly 4 options, one clearly correct, plausible distractors. Explanation max 40 words. Do not repeat this question: "${pick.question}".`,
      schema: PRACTICE_SCHEMA,
      temperature: 0.8,
      fallback: () => shuffleQuiz(pick),
      normalize: (raw) => {
        const r = raw as Record<string, unknown>;
        const options = Array.isArray(r?.options) ? (r.options as unknown[]).filter((o): o is string => typeof o === 'string' && !!o.trim()) : [];
        const ci = typeof r?.correctIndex === 'number' ? r.correctIndex : -1;
        if (typeof r?.question !== 'string' || options.length !== 4 || ci < 0 || ci > 3) return null;
        return { type: 'quiz', question: r.question, options, correctIndex: ci, explanation: typeof r.explanation === 'string' ? r.explanation : 'Review the key idea and connect it to your work.' };
      },
    });
    setQ({ quiz: res.data, source: res.source });
    setRound((n) => n + 1);
    setLoading(false);
  };

  return (
    <Card className="mt-6 animate-ghost-in rounded-4xl border-clay-300/40 bg-blush-100/60">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-950 bg-clay-400 text-ink-950">
          <Zap className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl leading-tight text-ink-950">Extra practice</h3>
            {q && <AISourceBadge source={q.source} />}
          </div>
          <p className="mt-0.5 text-sm text-slate-600">A couple of questions were tricky first time — that's normal. Practise with a question tailored to your role. Get two right to return to standard pace.</p>
        </div>
      </div>
      {q ? (
        <div className="mt-4 animate-ghost-in rounded-3xl border border-ink-950/10 bg-paper p-4 sm:p-5">
          <QuizView
            key={round}
            block={q.quiz}
            done={false}
            practice
            onSolved={() => undefined}
            onFirstAttempt={(correct) => {
              if (!correct) return;
              const w = wins + 1;
              setWins(w);
              if (w >= 2 && !recovered.current) {
                recovered.current = true;
                onRecovered();
              }
            }}
          />
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">{wins}/2 practice questions right first time</span>
            <Button size="sm" variant="outline" loading={loading} icon={<RefreshCw className="h-4 w-4" />} onClick={generate}>
              Another question
            </Button>
          </div>
        </div>
      ) : (
        <Button className="mt-4" size="sm" loading={loading} icon={<Sparkles className="h-4 w-4" />} onClick={generate}>
          {loading ? 'Creating your practice question…' : 'Generate a practice question'}
        </Button>
      )}
    </Card>
  );
}

// ───────────────────────── Completion ─────────────────────────

const CONFETTI = [
  { l: '8%', t: '14%', c: '#034f46', d: '0ms' },
  { l: '14%', t: '70%', c: '#ffa946', d: '300ms' },
  { l: '28%', t: '8%', c: '#ffbcf2', d: '600ms' },
  { l: '70%', t: '10%', c: '#ff6c4c', d: '150ms' },
  { l: '86%', t: '62%', c: '#1a1a1a', d: '450ms' },
  { l: '90%', t: '22%', c: '#1b8f78', d: '750ms' },
];

function CompletionView({
  title,
  lessonsCount,
  summary,
  activity,
  next,
  pace,
  onFastTrack,
  advanced,
  onReview,
}: {
  title: string;
  lessonsCount: number;
  summary: Summary;
  activity?: { title: string; to: string; best: number };
  next?: { title: string; to: string };
  pace: EmployeeProgress['pace'];
  onFastTrack: () => void;
  advanced?: { id: string; title: string; summary: string; inPath: boolean; onAdd: () => void };
  onReview: () => void;
}) {
  const fastTrack = summary.quizTotal > 0 && summary.mastery >= 90;
  return (
    <div className="space-y-4">
      <Card className="relative animate-ghost-in overflow-hidden rounded-4xl text-center sm:p-12">
        <TutorialStyles />
        {CONFETTI.map((c, i) => (
          <span key={i} className="pointer-events-none absolute h-5 w-5 animate-float" style={{ left: c.l, top: c.t, animationDelay: c.d }} aria-hidden>
            <Sparkle className="h-full w-full" color={c.c} />
          </span>
        ))}
        <div className="relative mx-auto h-28 w-28 sm:h-32 sm:w-32" aria-hidden>
          <div className="tut-pop h-full w-full">
            <div className="h-full w-full animate-float">
              <CertificateRibbon className="h-full w-full" />
            </div>
          </div>
          <SparkleBurst className="left-1/2 top-1/2" count={20} radius={160} delay={250} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Module complete</p>
        <h1 className="mx-auto mt-3 max-w-xl text-4xl leading-[1.02] text-ink-950 sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-500">
          {summary.completedNow ? 'Your skills profile has been updated.' : 'Every lesson, complete.'}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {summary.quizTotal > 0 && <ScoreRing value={summary.mastery} size={136} stroke={12} label="Mastery" />}
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              ['Lessons', String(lessonsCount)],
              ['Time invested', formatMinutes(summary.minutes || 0)],
              ['Quick checks', summary.quizTotal ? `${summary.quizCorrect}/${summary.quizTotal} first time` : '—'],
              ['Pace', pace === 'accelerated' ? 'Fast-track' : pace === 'supported' ? 'Supported' : 'Standard'],
            ].map(([k, v], i) => (
              <div key={k} className="animate-ghost-in rounded-2xl bg-sand-200/60 px-4 py-3" style={{ animationDelay: `${400 + i * 90}ms` }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">{k}</p>
                <p className="mt-0.5 font-display text-lg leading-tight text-ink-950">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">Skills strengthened</p>
          <div className="mt-2.5 flex flex-wrap justify-center gap-2">
            {summary.skills.map((s, i) => (
              <span key={s.id} className={cn('inline-flex animate-ghost-in items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold', SKILL_LEVEL_COLORS[s.level].bg, SKILL_LEVEL_COLORS[s.level].text)} style={{ animationDelay: `${700 + i * 90}ms` }}>
                <span className={cn('h-2 w-2 rounded-full', SKILL_LEVEL_COLORS[s.level].dot)} />
                {skillName(s.id)} · {SKILL_LEVEL_LABELS[s.level]}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {activity && (
        <Card className="animate-ghost-in rounded-4xl border-0 bg-brand-800 text-canvas" style={{ animationDelay: '220ms' }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-canvas/15">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/60">Now prove it</p>
              <p className="mt-0.5 font-display text-2xl leading-tight">{activity.title}</p>
              <p className="text-sm text-canvas/75">
                {activity.best >= 0 ? `Your best score so far: ${activity.best}%. ` : ''}A realistic workplace task with instant AI feedback — it counts towards certification.
              </p>
            </div>
            <Button variant="white" to={activity.to} iconRight={<ArrowRight className="h-4 w-4" />}>
              Complete the practical activity
            </Button>
          </div>
        </Card>
      )}

      {fastTrack && (
        <Card className="animate-ghost-in rounded-4xl border-gold-300/60 bg-gold-50" style={{ animationDelay: '300ms' }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-ink-950">
              <Rocket className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-ink-950">Strong competency — Fast-track available</h3>
              <p className="mt-0.5 text-sm text-slate-600">
                {summary.mastery}% mastery shows you're ready to move faster. Fast-track speeds up your path and points you to stretch content sooner.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pace !== 'accelerated' ? (
                  <Button size="sm" variant="gold" icon={<Zap className="h-4 w-4" />} onClick={onFastTrack}>
                    Switch to Fast-track
                  </Button>
                ) : (
                  <Badge tone="brand" icon={<Check className="h-3 w-3" />}>
                    Fast-track is on
                  </Badge>
                )}
              </div>
              {advanced && (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">Suggested stretch module</p>
                    <p className="text-sm font-bold text-ink-950">{advanced.title}</p>
                    <p className="text-xs text-slate-500">{advanced.summary}</p>
                  </div>
                  {advanced.inPath ? (
                    <Button size="sm" variant="outline" to={`/app/learning/${advanced.id}`}>
                      Open module
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={advanced.onAdd}>
                      Add to my path
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {next && (
          <Button to={next.to} variant={activity ? 'outline' : 'primary'} iconRight={<ArrowRight className="h-4 w-4" />}>
            Next: {next.title.length > 42 ? `${next.title.slice(0, 40)}…` : next.title}
          </Button>
        )}
        <Button to="/app/learning" variant="ghost" icon={<Route className="h-4 w-4" />}>
          Back to my path
        </Button>
        <Button variant="ghost" icon={<Clock className="h-4 w-4" />} onClick={onReview}>
          Review lessons
        </Button>
      </div>
    </div>
  );
}
