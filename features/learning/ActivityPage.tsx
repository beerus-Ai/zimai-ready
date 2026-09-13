import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Award, Bot, CircleCheck, ClipboardCheck, Database, Eye, EyeOff, FileText, History, Lightbulb, RotateCcw, Scale, Send,
  ShieldCheck, Target, TrendingUp,
} from 'lucide-react';
import {
  AIDisclaimer, AISourceBadge, Badge, Button, Card, CardTitle, EmptyState, LoadingState, Modal, PageHeader, ProgressBar, RichText, ScoreRing, useToast,
} from '../../components/ui';
import { Reveal } from '../../components/motion';
import { GhostMascot, Sparkle } from '../../components/illustrations';
import { SparkleBurst, TutorialStyles } from '../../components/tutorials/primitives';
import { useApp } from '../../services/store';
import { getModule, moduleTitle } from '../../data/catalog';
import { raiseSkills, recordActivity } from '../../lib/progress';
import { evaluateCertification } from '../../lib/certification';
import { cn, nowISO, timeAgo, uid } from '../../lib/utils';
import type { ActivitySubmission, DomainId, EmployeeProgress, ModuleMeta, PracticalActivity } from '../../types';
import { TutorPanel } from '../tutor/TutorPanel';
import { evaluateSubmission, PASS_MARK, VERDICT_META } from './evaluate';
import { activityFor } from './components/moduleContent';
import { nextPathModule, useEnsureProgress, useLearnerDescription, useLearnerDomain, withModule } from './components/useLearning';

const MIN_CHARS = 120;

export default function ActivityPage() {
  const { moduleId = '' } = useParams();
  const meta = getModule(moduleId);
  const { progress, creating } = useEnsureProgress();
  const domainId = useLearnerDomain();
  const activity = meta ? activityFor(meta.id, domainId) : undefined;

  if (!meta)
    return (
      <EmptyState
        className="my-10"
        icon={<ClipboardCheck className="h-6 w-6" />}
        title="We couldn't find that module"
        action={<Button to="/app/learning">Back to my learning path</Button>}
      />
    );
  if (!activity)
    return (
      <EmptyState
        className="my-10"
        icon={<ClipboardCheck className="h-6 w-6" />}
        title="No practical activity for this module"
        description="This module is assessed through its lessons and quick checks. Practical activities appear in your domain modules and workplace challenge."
        action={
          <Button to={`/app/learning/${meta.id}`} icon={<ArrowLeft className="h-4 w-4" />}>
            Back to the module
          </Button>
        }
      />
    );
  if (!progress) {
    if (creating) return <LoadingState variant="ai" className="min-h-[60vh]" title="Building your personalised path…" />;
    return (
      <EmptyState
        className="my-10"
        icon={<Target className="h-6 w-6" />}
        title="Start with your AI readiness assessment"
        description="Practical activities are part of your personalised learning path."
        action={<Button to="/app/readiness">Go to AI readiness</Button>}
      />
    );
  }
  return <ActivityView key={activity.id} meta={meta} activity={activity} progress={progress} domainId={domainId} />;
}

function ActivityView({ meta, activity, progress, domainId }: { meta: ModuleMeta; activity: PracticalActivity; progress: EmployeeProgress; domainId: DomainId }) {
  const { user, submissions, results, addSubmission, saveProgress } = useApp();
  const toast = useToast();
  const learner = useLearnerDescription();
  const userId = user?.id ?? 'guest';
  const title = moduleTitle(meta, domainId);
  const draftKey = `zimai:draft:${userId}:${activity.id}`;
  const attempts = useMemo(() => submissions.filter((s) => s.activityId === activity.id), [submissions, activity.id]);

  const [draft, setDraft] = useState(() => {
    try {
      return localStorage.getItem(draftKey) ?? '';
    } catch {
      return '';
    }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [phase, setPhase] = useState<'edit' | 'evaluating' | 'result'>(() => (attempts.length ? 'result' : 'edit'));
  const [viewingId, setViewingId] = useState<string | null>(() => attempts[0]?.id ?? null);
  const [showModel, setShowModel] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);

  const viewing = attempts.find((a) => a.id === viewingId) ?? attempts[0] ?? null;
  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.feedback.score)) : null;

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (draft.trim()) {
          localStorage.setItem(draftKey, draft);
          setSavedAt(nowISO());
        } else localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [draft, draftKey]);

  const len = draft.trim().length;
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  const submit = async () => {
    if (len < MIN_CHARS || phase === 'evaluating') return;
    const answer = draft.trim();
    setPhase('evaluating');
    try {
      const { feedback, source } = await evaluateSubmission({ activity, answer, learnerContext: learner });
      const sub: ActivitySubmission = { id: uid('sub-'), userId, moduleId: meta.id, activityId: activity.id, answer, feedback, createdAt: nowISO(), source };
      await addSubmission(sub);
      const passed = feedback.score >= PASS_MARK;
      const completesChallenge = meta.kind === 'challenge' && passed && progress.modules[meta.id]?.status !== 'completed';
      await saveProgress((prev) => {
        let p = recordActivity(prev ?? progress, 'activity', `Submitted practical: ${activity.title} — scored ${feedback.score}%`);
        p = raiseSkills(p, activity.skillIds, feedback.score >= 75 ? 2 : 1);
        if (meta.kind === 'challenge' && passed && p.modules[meta.id]?.status !== 'completed') {
          p = withModule(p, meta.id, (m) => ({
            ...m,
            status: 'completed',
            completedAt: nowISO(),
            startedAt: m.startedAt ?? nowISO(),
            currentLessonId: undefined,
            mastery: Math.max(m.mastery, feedback.score),
          }));
          p = raiseSkills(p, meta.skillIds, feedback.score >= 75 ? 2 : 1);
          p = recordActivity(p, 'lesson', `Completed module: ${title}`);
        } else if (!p.modules[meta.id]) {
          p = withModule(p, meta.id, (m) => ({ ...m, status: 'in-progress', startedAt: nowISO() }));
        }
        return p;
      });
      setViewingId(sub.id);
      setShowModel(false);
      setShowAnswer(false);
      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (completesChallenge) toast.success('Challenge passed — module complete!', `You scored ${feedback.score}%. This practical counts towards certification.`);
      else if (passed) toast.success(`You scored ${feedback.score}%`, 'Passed — this practical counts towards certification.');
      else toast.info(`You scored ${feedback.score}%`, `Revise using the feedback — ${PASS_MARK}% is needed for this to count towards certification.`);
    } catch (e) {
      console.warn('[ZimAI] evaluation failed', e);
      toast.error('We could not assess your answer', 'Your draft is saved. Please try again.');
      setPhase('edit');
    }
  };

  const revise = () => {
    if (viewing && !draft.trim()) setDraft(viewing.answer);
    else if (viewing && draft.trim() !== viewing.answer && !window.confirm('Replace your current draft with your submitted answer? Choose Cancel to keep your draft.')) {
      // keep the existing draft
    } else if (viewing) setDraft(viewing.answer);
    setPhase('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Next-step CTA after a result
  const cert = evaluateCertification({ progress, submissions, results });
  const next = nextPathModule(progress, meta.id);
  const nextStep = viewing && viewing.feedback.score >= PASS_MARK
    ? meta.kind === 'challenge' && cert.finalUnlocked
      ? { label: 'Go to assessments', to: '/app/assessments', icon: <Award className="h-4 w-4" /> }
      : next
        ? { label: `Next: ${moduleTitle(next.moduleId, domainId)}`, to: `/app/learning/${next.moduleId}`, icon: <ArrowRight className="h-4 w-4" /> }
        : { label: 'Back to my path', to: '/app/learning', icon: <ArrowRight className="h-4 w-4" /> }
    : null;

  const feedbackContext = viewing
    ? `Practical activity "${activity.title}". Task: ${activity.task}\nLearner's answer: ${viewing.answer.slice(0, 900)}\nFeedback: ${viewing.feedback.score}% (${viewing.feedback.verdict}). ${viewing.feedback.criteria
        .map((c) => `${c.criterion} ${c.score}/${c.max}: ${c.comment}`)
        .join(' ')} Improvements: ${viewing.feedback.improvements.join(' ')}`
    : undefined;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={meta.kind === 'challenge' ? 'Workplace challenge' : 'Practical workplace activity'}
        title={activity.title}
        description={`${title} · assessed against a transparent rubric with AI feedback`}
        actions={
          <>
            <Button variant="outline" to={`/app/learning/${meta.id}`} icon={<ArrowLeft className="h-4 w-4" />}>
              Back to module
            </Button>
            {bestScore != null && (
              <Badge tone={bestScore >= PASS_MARK ? 'brand' : 'gold'} className="self-center !py-1.5" icon={<Award className="h-3.5 w-3.5" />}>
                Best {bestScore}%
              </Badge>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {phase === 'evaluating' && (
            <Card className="relative animate-ghost-in overflow-hidden rounded-4xl bg-lilac-100/60">
              <Sparkle className="absolute left-8 top-8 h-5 w-5 animate-float" color="#ffa946" />
              <Sparkle className="absolute bottom-10 right-10 h-4 w-4 animate-float" color="#ff6c4c" />
              <LoadingState
                variant="ai"
                title="Assessing your work against the rubric…"
                messages={['Reading your answer', 'Checking how you verified the AI output', 'Looking for privacy, bias and oversight safeguards', 'Checking accuracy against the data', 'Writing specific feedback for you']}
              />
              <div className="-mt-8 flex justify-center gap-1.5 pb-6" aria-hidden>
                {[0, 160, 320].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-ink-950/60" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </Card>
          )}

          {phase === 'result' && viewing && (
            <ResultView
              sub={viewing}
              attemptNo={attempts.length - attempts.indexOf(viewing)}
              activity={activity}
              showModel={showModel}
              setShowModel={setShowModel}
              showAnswer={showAnswer}
              setShowAnswer={setShowAnswer}
              onRevise={revise}
              onAskTutor={() => setTutorOpen(true)}
              nextStep={nextStep}
            />
          )}

          {phase === 'edit' && (
            <>
              <Brief activity={activity} />
              <Card className="animate-ghost-in rounded-4xl">
                <CardTitle icon={<FileText className="h-4 w-4" />} title="Your answer" subtitle="Your prompt, checks, safeguards and recommendation." />
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={12}
                  placeholder={'e.g.\n1. Prompt I would use: "You are…"\n2. What I kept / corrected from the AI output (with figures)…\n3. How I protected data and checked for bias…\n4. My recommendation and who signs it off…'}
                  className="w-full resize-y rounded-2xl border border-ink-950/15 bg-sand-200/40 px-4 py-3.5 text-[15px] leading-relaxed text-ink-950 placeholder:text-ink-400 focus:border-ink-950 focus:bg-paper focus:outline-none focus:ring-2 focus:ring-lilac-200"
                  aria-describedby="answer-counter"
                />
                <div id="answer-counter" className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className={cn('font-semibold tabular-nums', len >= MIN_CHARS ? 'text-brand-700' : 'text-slate-500')}>
                    {len >= MIN_CHARS ? <CircleCheck className="mr-1 inline h-3.5 w-3.5" /> : null}
                    {len} / {MIN_CHARS} characters minimum · {words} words
                  </span>
                  {savedAt && <span className="text-slate-400">Draft saved on this device</span>}
                </div>
                <ProgressBar className="mt-2" value={(len / MIN_CHARS) * 100} size="xs" tone={len >= MIN_CHARS ? 'brand' : 'gold'} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Don't include real personal or confidential data — the scenario is fictional.
                  </p>
                  <div className="flex gap-2">
                    {attempts.length > 0 && (
                      <Button variant="ghost" onClick={() => setPhase('result')}>
                        View last feedback
                      </Button>
                    )}
                    <Button onClick={submit} disabled={len < MIN_CHARS} icon={<Send className="h-4 w-4" />}>
                      Submit for AI feedback
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {phase === 'result' && (
            <details className="group animate-ghost-in rounded-3xl border border-ink-950/10 bg-paper shadow-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-bold text-ink-950">
                <span className="inline-flex items-center gap-2">
                  <Target className="h-4 w-4 text-brand-600" /> Activity brief, data and rubric
                </span>
                <span className="text-xs font-semibold text-slate-400 group-open:hidden">Show</span>
                <span className="hidden text-xs font-semibold text-slate-400 group-open:inline">Hide</span>
              </summary>
              <div className="space-y-4 border-t border-slate-100 p-4 sm:p-5">
                <Brief activity={activity} flat />
              </div>
            </details>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardTitle icon={<ShieldCheck className="h-4 w-4" />} title="Responsible AI tips" subtitle="What strong answers include" />
            <ul className="space-y-2.5 text-sm text-slate-600">
              {[
                'Show your prompt — role, context, format and what the AI must not do',
                'Verify: recalculate figures and compare against the data provided',
                'Remove names, IDs and confidential details before using any AI tool',
                'Check for bias — who could be treated unfairly by the output?',
                'Keep a human accountable for the final decision',
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardTitle icon={<History className="h-4 w-4" />} title="Your attempts" subtitle={attempts.length ? `${attempts.length} submitted · best counts` : 'No submissions yet'} />
            {attempts.length ? (
              <div className="space-y-2">
                {attempts.map((a, i) => {
                  const v = VERDICT_META[a.feedback.verdict];
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setViewingId(a.id);
                        setPhase('result');
                        setShowModel(false);
                        setShowAnswer(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                        phase === 'result' && viewing?.id === a.id ? 'border-brand-300 bg-brand-50/50' : 'border-slate-200 hover:bg-slate-50',
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums text-white" style={{ background: v.hex }}>
                        {a.feedback.score}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink-950">
                          Attempt {attempts.length - i} · {v.label}
                        </span>
                        <span className="block text-xs text-slate-500">{timeAgo(a.createdAt)}</span>
                      </span>
                      <AISourceBadge source={a.source} className="!px-2 !py-0 text-[10px]" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Submit your answer to receive instant, rubric-based AI feedback. You can revise and resubmit as often as you like.</p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              {PASS_MARK}%+ counts as a passed practical towards certification
              {meta.kind === 'challenge' ? ' and completes this challenge module' : ''}.
            </p>
          </Card>

          <Card className="border-ink-950 bg-lilac-200">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 shrink-0 animate-ghost-float" aria-hidden>
                <GhostMascot mood="wave" className="h-full w-full" />
              </span>
              <div>
                <p className="font-display text-xl leading-tight text-ink-950">Need a nudge?</p>
                <p className="mt-0.5 text-sm text-slate-500">The AI Tutor can explain the rubric or help you plan — it won't write your answer for you.</p>
                <Button className="mt-3" size="sm" variant="outline" onClick={() => setTutorOpen(true)}>
                  Ask the AI Tutor
                </Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <Modal open={tutorOpen} onClose={() => setTutorOpen(false)} title="AI Tutor" description={viewing && phase === 'result' ? 'Ask about your feedback' : activity.title} size="lg">
        <TutorPanel
          moduleId={meta.id}
          lessonTitle={phase === 'result' && viewing ? 'Practical activity feedback' : 'Practical activity'}
          blockContext={phase === 'result' && viewing ? feedbackContext : `Practical activity "${activity.title}". Scenario: ${activity.scenario} Task: ${activity.task} (Coach the learner — do not write the answer for them.)`}
          initialInput={phase === 'result' && viewing ? 'How can I improve my answer based on this feedback?' : undefined}
          showHeader={false}
          className="-mx-6 -my-5 h-[66vh] rounded-none border-0 shadow-none"
        />
      </Modal>
    </div>
  );
}

// ───────────────────────── Brief ─────────────────────────

function Section({ flat, children }: { flat?: boolean; children: React.ReactNode }) {
  return flat ? <div>{children}</div> : <Reveal><Card className="rounded-4xl">{children}</Card></Reveal>;
}

function Brief({ activity, flat }: { activity: PracticalActivity; flat?: boolean }) {
  return (
    <>
      <Section flat={flat}>
        <CardTitle icon={<Target className="h-4 w-4" />} title="The scenario" />
        <RichText text={activity.scenario} className="text-slate-700" />
      </Section>
      {activity.data && (
        <Section flat={flat}>
          <CardTitle icon={<Database className="h-4 w-4" />} title="Your data" subtitle="Fictional data — scroll sideways on small screens" />
          <div className="-mx-1 overflow-x-auto rounded-2xl bg-ink-950 p-4">
            <pre className="whitespace-pre font-mono text-[12.5px] leading-relaxed text-canvas/90">{activity.data}</pre>
          </div>
        </Section>
      )}
      <Section flat={flat}>
        <CardTitle icon={<ClipboardCheck className="h-4 w-4" />} title="Your task" />
        <div className="rounded-2xl bg-lilac-100/80 px-4 py-3.5 font-display text-lg leading-snug text-ink-950 ring-1 ring-inset ring-lilac-300/50">
          <RichText text={activity.task} />
        </div>
      </Section>
      <Section flat={flat}>
        <CardTitle icon={<Scale className="h-4 w-4" />} title="How you'll be assessed" subtitle="The same rubric the AI uses" />
        <div className="space-y-2.5">
          {activity.rubric.map((r, i) => (
            <div key={r.criterion} className="animate-ghost-in rounded-2xl bg-sand-200/60 px-4 py-3" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-950">{r.criterion}</p>
                <Badge tone="neutral">{r.weight}%</Badge>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{r.description}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-950/10">
                <div className="h-full rounded-full bg-ink-950" style={{ width: `${r.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ───────────────────────── Result ─────────────────────────

function ResultView({
  sub,
  attemptNo,
  activity,
  showModel,
  setShowModel,
  showAnswer,
  setShowAnswer,
  onRevise,
  onAskTutor,
  nextStep,
}: {
  sub: ActivitySubmission;
  attemptNo: number;
  activity: PracticalActivity;
  showModel: boolean;
  setShowModel: (v: boolean) => void;
  showAnswer: boolean;
  setShowAnswer: (v: boolean) => void;
  onRevise: () => void;
  onAskTutor: () => void;
  nextStep: { label: string; to: string; icon: React.ReactNode } | null;
}) {
  const f = sub.feedback;
  const v = VERDICT_META[f.verdict];
  const passed = f.score >= PASS_MARK;
  return (
    <Card key={sub.id} className="relative animate-ghost-in overflow-hidden rounded-4xl sm:p-8">
      <TutorialStyles />
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="relative shrink-0">
          <ScoreRing value={f.score} size={140} stroke={12} color={v.hex} label="Score" />
          {passed && (
            <>
              <SparkleBurst className="left-1/2 top-1/2" count={16} radius={120} delay={900} />
              <span className="tut-stamp absolute -right-4 -top-1 rounded-lg border-2 border-brand-800 bg-paper px-2 py-0.5 font-condensed text-lg uppercase leading-none tracking-wider text-brand-800" style={{ animationDelay: '1100ms' }}>
                Passed
              </span>
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge tone={v.tone}>{v.label}</Badge>
            <Badge tone={passed ? 'brand' : 'neutral'} icon={passed ? <CircleCheck className="h-3 w-3" /> : undefined}>
              {passed ? 'Passed' : `Not yet passed · ${PASS_MARK}% needed`}
            </Badge>
            <AISourceBadge source={sub.source} />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-ink-400">
            Attempt {attemptNo} · {timeAgo(sub.createdAt)}
          </p>
          <div className="animate-ghost-in" style={{ animationDelay: '300ms' }}>
            <RichText text={f.overall} className="mt-2 text-ink-700" />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">Rubric breakdown</p>
        {f.criteria.map((c, i) => {
          const ratio = c.max ? c.score / c.max : 0;
          const d = 350 + i * 140;
          return (
            <div key={c.criterion} className="animate-ghost-in rounded-2xl bg-sand-200/50 p-4" style={{ animationDelay: `${d}ms` }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-950">{c.criterion}</p>
                <span className="font-condensed text-lg leading-none tracking-wide tabular-nums text-ink-950">
                  {c.score}
                  <span className="text-ink-400">/{c.max}</span>
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-950/10" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={c.criterion}>
                <div className={cn('tut-grow h-full rounded-full', ratio >= 0.75 ? 'bg-brand-800' : ratio >= 0.5 ? 'bg-gold-400' : 'bg-clay-400')} style={{ width: `${ratio * 100}%`, animationDelay: `${d + 250}ms` }} />
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{c.comment}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="animate-ghost-in rounded-3xl bg-brand-50 p-5 ring-1 ring-inset ring-brand-800/10" style={{ animationDelay: `${450 + f.criteria.length * 140}ms` }}>
          <p className="flex items-center gap-1.5 font-display text-xl text-brand-800">
            <CircleCheck className="h-4 w-4" /> Strengths
          </p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-ink-700">
            {f.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-ghost-in rounded-3xl bg-gold-50 p-5 ring-1 ring-inset ring-gold-300/50" style={{ animationDelay: `${550 + f.criteria.length * 140}ms` }}>
          <p className="flex items-center gap-1.5 font-display text-xl text-gold-800">
            <TrendingUp className="h-4 w-4" /> To improve
          </p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-ink-700">
            {f.improvements.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {activity.sampleStrongAnswer && (
          <div className="rounded-2xl border border-slate-200">
            <button onClick={() => setShowModel(!showModel)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-bold text-ink-950">
              <span className="inline-flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold-600" /> {showModel ? 'Hide' : 'Reveal'} model answer
              </span>
              {showModel ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
            </button>
            {showModel && (
              <div className="animate-fade-in border-t border-slate-100 px-4 py-3">
                <RichText text={activity.sampleStrongAnswer} className="text-slate-700" />
                <p className="mt-2 text-xs text-slate-400">One strong approach — yours can be different and still excellent.</p>
              </div>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-slate-200">
          <button onClick={() => setShowAnswer(!showAnswer)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-bold text-ink-950">
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" /> Your submitted answer
            </span>
            {showAnswer ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
          </button>
          {showAnswer && <p className="animate-fade-in whitespace-pre-wrap border-t border-slate-100 px-4 py-3 text-[14px] leading-relaxed text-slate-700">{sub.answer}</p>}
        </div>
      </div>

      <AIDisclaimer className="mt-4">AI-assisted feedback against a published rubric. It can make mistakes — use it as coaching, and apply your professional judgement.</AIDisclaimer>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant={passed ? 'outline' : 'primary'} icon={<RotateCcw className="h-4 w-4" />} onClick={onRevise}>
          Revise &amp; resubmit
        </Button>
        <Button variant="outline" icon={<Bot className="h-4 w-4" />} onClick={onAskTutor}>
          Ask the tutor about my feedback
        </Button>
        {nextStep && (
          <Button to={nextStep.to} iconRight={nextStep.icon} className="max-w-full">
            <span className="truncate">{nextStep.label.length > 40 ? `${nextStep.label.slice(0, 38)}…` : nextStep.label}</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
