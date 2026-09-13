import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleCheck, CircleX, ClipboardCheck, Clock, Eye, ListChecks, LogOut, RotateCcw, Route, Send, Wrench } from 'lucide-react';
import {
  AIDisclaimer, AISourceBadge, Badge, Button, Card, CardTitle, EmptyState, ErrorState, Icon, LoadingState, Modal, OptionCard, PageHeader,
  ProgressBar, ScoreRing, Tabs, useToast,
} from '../../components/ui';
import { useApp } from '../../services/store';
import { CERT_RULES } from '../../config';
import { evaluateCertification } from '../../lib/certification';
import { recordActivity } from '../../lib/progress';
import { getDomain } from '../../data/catalog';
import { cn, formatDate, nowISO, sleep, uid } from '../../lib/utils';
import type { AISource, AssessmentResult } from '../../types';
import { DIMENSION_META, DIMENSIONS, generateFinalAssessment, QUESTION_COUNT, scoreFinalAssessment, SUGGESTED_MINUTES } from './assessmentEngine';
import type { AssessmentQuestion, FinalScore } from './assessmentEngine';
import { BreakdownBars, Fact, LockedPanel, scoreHex } from './assessment-components';
import { Reveal } from '../../components/motion';

type Phase = 'intro' | 'loading' | 'test' | 'review' | 'saving' | 'results' | 'error';
const LETTERS = ['A', 'B', 'C', 'D'];

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function FinalAssessmentPage() {
  const { user, profile, latestAssessment, progress, submissions, results, addAssessmentResult, saveProgress } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const status = useMemo(() => evaluateCertification({ progress, submissions, results }), [progress, submissions, results]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [source, setSource] = useState<AISource>('engine');
  const [notice, setNotice] = useState<string | undefined>();
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [outcome, setOutcome] = useState<{ score: FinalScore; result: AssessmentResult; seconds: number } | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const savingRef = useRef(false);

  const attempts = results.filter((r) => r.kind === 'final-knowledge');
  const domain = getDomain(progress?.domainId);
  const inExam = phase === 'test' || phase === 'review';

  // Elapsed timer (informational — the assessment is not strictly timed).
  useEffect(() => {
    if (!inExam) return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [inExam, startedAt]);

  // Warn before leaving mid-assessment.
  useEffect(() => {
    if (!inExam) return;
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [inExam]);

  const choose = useCallback(
    (opt: number) => setAnswers((prev) => prev.map((a, i) => (i === index ? opt : a))),
    [index],
  );

  const next = useCallback(() => {
    if (answers[index] == null) return;
    if (index < questions.length - 1) setIndex(index + 1);
    else setPhase('review');
  }, [answers, index, questions.length]);

  // Keyboard: 1–4 / A–D to choose, Enter to continue, ← to go back.
  useEffect(() => {
    if (phase !== 'test' || exitOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      const n = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : ['a', 'b', 'c', 'd'].indexOf(k);
      if (n >= 0) choose(n);
      else if (e.key === 'Enter') next();
      else if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, exitOpen, choose, next, index]);

  if (!user) return null;

  const header = (
    <PageHeader
      eyebrow="Stage 3 · Final knowledge assessment"
      title="Final Knowledge Assessment"
      description={`Scenario questions tailored to ${domain?.name ?? 'your profession'}.`}
    />
  );

  if (!progress) {
    return (
      <div className="animate-fade-up">
        {header}
        <EmptyState
          icon={<Route className="h-6 w-6" />}
          title="Start your learning path first"
          description="The final assessment unlocks as you complete your personalised learning path."
          action={<Button to="/app/learning">Go to my learning path</Button>}
        />
      </div>
    );
  }

  if (!status.finalUnlocked && phase === 'intro') {
    const target = Math.max(1, Math.min(Math.ceil(status.requiredTotal / 2), 3));
    return (
      <div className="animate-fade-up">
        {header}
        <LockedPanel
          title="The final assessment is locked"
          description="Certification requires demonstrated competency. Build your knowledge first — the assessment unlocks once you have completed enough of your required learning."
          items={[
            {
              label: 'Complete at least half of your required modules (or three of them)',
              detail: `${status.requiredCompleted}/${status.requiredTotal} required modules completed`,
              met: status.finalUnlocked,
              progress: (status.requiredCompleted / target) * 100,
            },
          ]}
          action={
            <>
              <Button to="/app/learning" iconRight={<ArrowRight className="h-4 w-4" />}>
                Continue learning
              </Button>
              <Button to="/app/assessments" variant="outline">
                Back to assessments
              </Button>
            </>
          }
        />
      </div>
    );
  }

  async function start() {
    if (!user || !progress) return;
    setPhase('loading');
    savingRef.current = false;
    try {
      const [res] = await Promise.all([
        generateFinalAssessment({ userId: user.id, domainId: progress.domainId, attempt: attempts.length + 1, profile, assessment: latestAssessment, progress }),
        sleep(900),
      ]);
      setQuestions(res.data);
      setSource(res.source);
      setNotice(res.error);
      setAnswers(res.data.map(() => null));
      setIndex(0);
      setStartedAt(Date.now());
      setElapsed(0);
      setFilter('all');
      setPhase('test');
      window.scrollTo({ top: 0 });
    } catch {
      setPhase('error');
    }
  }

  async function submit() {
    if (!user || !progress || savingRef.current) return;
    if (answers.some((a) => a == null)) {
      toast.info('Answer every question first', 'Use the list below to jump to any unanswered question.');
      return;
    }
    savingRef.current = true;
    setPhase('saving');
    const sc = scoreFinalAssessment(questions, answers);
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    const result: AssessmentResult = {
      id: uid('res-'),
      userId: user.id,
      kind: 'final-knowledge',
      domainId: progress.domainId,
      score: sc.score,
      passed: sc.passed,
      breakdown: sc.breakdown,
      responsibleAIScore: sc.responsibleAIScore,
      createdAt: nowISO(),
      source,
    };
    try {
      await addAssessmentResult(result);
      await saveProgress((prev) => recordActivity(prev ?? progress, 'assessment', `Final knowledge assessment — scored ${sc.score}% (${sc.passed ? 'passed' : 'not yet passed'})`));
      setOutcome({ score: sc, result, seconds });
      setPhase('results');
      window.scrollTo({ top: 0 });
    } catch {
      savingRef.current = false;
      setPhase('review');
      toast.error('Could not save your result', 'Please check your connection and submit again — your answers are kept.');
    }
  }

  // ───────────── Loading / error ─────────────
  if (phase === 'loading' || phase === 'saving') {
    return (
      <div className="animate-fade-in">
        {header}
        <Card>
          <LoadingState
            variant="ai"
            title={phase === 'loading' ? 'Preparing your assessment…' : 'Scoring your answers…'}
            messages={
              phase === 'loading'
                ? [`Tailoring scenarios to ${domain?.name ?? 'your profession'}…`, 'Balancing the six competency dimensions…', 'Checking every question has one clearly best answer…']
                : ['Marking each dimension…', 'Calculating your responsible AI score…', 'Saving your result securely…']
            }
          />
        </Card>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="animate-fade-in">
        {header}
        <ErrorState title="We could not prepare your assessment" message="Something went wrong while building your questions. Please try again." onRetry={start} />
      </div>
    );
  }

  // ───────────── Test ─────────────
  if (phase === 'test' && questions[index]) {
    const qn = questions[index];
    const answeredCount = answers.filter((a) => a != null).length;
    return (
      <div className="mx-auto max-w-3xl animate-fade-in">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-bold text-ink-950">
              Question <span className="font-display text-lg font-medium tabular-nums">{index + 1}</span> <span className="font-medium text-slate-400">of {questions.length}</span>
            </span>
            <Badge tone="violet" icon={<Icon name={DIMENSION_META[qn.dimension].icon} className="h-3 w-3" />} className="hidden sm:inline-flex">
              {DIMENSION_META[qn.dimension].label}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums text-slate-500" title={`Suggested time: about ${SUGGESTED_MINUTES} minutes`}>
              <Clock className="h-3.5 w-3.5" />
              {fmtTime(elapsed)}
            </span>
            <Button variant="ghost" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={() => setExitOpen(true)}>
              Exit
            </Button>
          </div>
        </div>
        <ProgressBar value={((index + (answers[index] != null ? 1 : 0)) / questions.length) * 100} size="xs" className="mb-6" />

        <Card key={qn.id} className="animate-ghost-in rounded-3xl">
          <Badge tone="violet" icon={<Icon name={DIMENSION_META[qn.dimension].icon} className="h-3 w-3" />} className="mb-3 sm:hidden">
            {DIMENSION_META[qn.dimension].label}
          </Badge>
          {qn.scenario && <p className="mb-4 rounded-2xl border border-ink-950/10 bg-sand-100 p-4 text-[15px] leading-relaxed text-ink-700">{qn.scenario}</p>}
          <h2 className="text-2xl leading-snug text-ink-950 sm:text-3xl">{qn.question}</h2>
          <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Answer options">
            {qn.options.map((opt, i) => (
              <OptionCard
                key={i}
                compact
                selected={answers[index] === i}
                onClick={() => choose(i)}
                icon={<span className="text-sm font-extrabold">{LETTERS[i]}</span>}
                label={<span className="font-medium">{opt}</span>}
              />
            ))}
          </div>
        </Card>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} disabled={index === 0} onClick={() => setIndex(index - 1)}>
            Back
          </Button>
          <Button disabled={answers[index] == null} iconRight={<ArrowRight className="h-4 w-4" />} onClick={next}>
            {index === questions.length - 1 ? 'Review answers' : 'Next'}
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="Question navigator">
          {questions.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to question ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'h-8 w-8 rounded-lg text-xs font-bold tabular-nums transition',
                i === index ? 'bg-ink-950 text-canvas' : answers[i] != null ? 'border border-ink-950/20 bg-lilac-200 text-ink-950 hover:bg-lilac-300' : 'bg-sand-200/70 text-ink-500 hover:bg-sand-300',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          {answeredCount}/{questions.length} answered · No feedback until you submit
          <span className="hidden sm:inline"> · Press 1–4 to choose, Enter to continue</span>
        </p>

        <ExitModal open={exitOpen} onClose={() => setExitOpen(false)} onExit={() => navigate('/app/assessments')} />
      </div>
    );
  }

  // ───────────── Review before submit ─────────────
  if (phase === 'review') {
    const unanswered = answers.filter((a) => a == null).length;
    return (
      <div className="mx-auto max-w-3xl animate-fade-in">
        <PageHeader eyebrow="Final knowledge assessment" title="Review your answers" description="Once submitted, your result is recorded." />
        <Card padded={false} className="animate-ghost-in overflow-hidden rounded-3xl">
          <ul className="divide-y divide-ink-950/5">
            {questions.map((x, i) => (
              <li key={x.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold', answers[i] != null ? 'bg-lilac-100 text-ink-950' : 'bg-clay-50 text-clay-700')}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-ink-950">{x.question}</p>
                  <p className={cn('mt-0.5 text-[13px]', answers[i] != null ? 'text-slate-500' : 'font-semibold text-clay-700')}>
                    {answers[i] != null ? `${LETTERS[answers[i] as number]}. ${x.options[answers[i] as number]}` : 'Not answered'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIndex(i);
                    setPhase('test');
                  }}
                >
                  Change
                </Button>
              </li>
            ))}
          </ul>
        </Card>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => {
              setIndex(questions.length - 1);
              setPhase('test');
            }}
          >
            Back to questions
          </Button>
          <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <Button size="lg" icon={<Send className="h-4 w-4" />} disabled={unanswered > 0} onClick={submit}>
              Submit assessment
            </Button>
            {unanswered > 0 && <p className="text-center text-xs font-medium text-clay-700 sm:text-right">{unanswered} question{unanswered === 1 ? '' : 's'} still to answer</p>}
          </div>
        </div>
        <ExitModal open={exitOpen} onClose={() => setExitOpen(false)} onExit={() => navigate('/app/assessments')} />
      </div>
    );
  }

  // ───────────── Results ─────────────
  if (phase === 'results' && outcome) {
    const { score: sc, seconds } = outcome;
    const color = scoreHex(sc.score, CERT_RULES.knowledgePassMark);
    const thresholds = [
      { mark: CERT_RULES.awareKnowledgeMark, label: 'AI Aware knowledge threshold · unlocks the practical capstone' },
      { mark: CERT_RULES.capableKnowledgeMark, label: 'AI Capable knowledge threshold' },
      { mark: CERT_RULES.knowledgePassMark, label: 'Pass mark · required for AI Ready' },
    ];
    const shown = sc.perQuestion.filter((p) => (filter === 'all' ? true : filter === 'correct' ? p.correct : !p.correct));
    return (
      <div className="animate-fade-up space-y-8 sm:space-y-10">
        <PageHeader
          eyebrow="Final knowledge assessment · Results"
          title={sc.passed ? 'Knowledge competency demonstrated' : 'Not yet — you are building towards it'}
          description={sc.passed ? 'You passed the final knowledge assessment. Your practical capstone is the next step to AI Ready.' : `You scored ${sc.score}%. The pass mark is ${CERT_RULES.knowledgePassMark}%. Review the explanations below, then retake whenever you are ready.`}
        />

        <Reveal>
        <Card className="rounded-4xl">
          <div className="flex flex-col items-center gap-8 p-1 sm:p-3 md:flex-row md:items-center md:gap-10">
            <ScoreRing value={sc.score} size={208} stroke={16} color={color} label={sc.passed ? 'Passed' : 'Score'} />
            <div className="w-full min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={sc.passed ? 'brand' : sc.score >= CERT_RULES.awareKnowledgeMark ? 'gold' : 'clay'} icon={sc.passed ? <CircleCheck className="h-3 w-3" /> : undefined}>
                  {sc.passed ? 'Passed' : 'Not yet passed'} · pass mark {CERT_RULES.knowledgePassMark}%
                </Badge>
                <AISourceBadge source={source} />
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Fact label="Correct" value={`${sc.correct}/${sc.total}`} />
                <Fact label="Responsible AI" value={`${sc.responsibleAIScore}%`} />
                <Fact label="Time taken" value={fmtTime(seconds)} />
                <Fact label="Attempt" value={`#${attempts.length}`} />
              </dl>
              <ul className="mt-4 space-y-1.5">
                {thresholds.map((t) => (
                  <li key={t.mark} className="flex items-center gap-2 text-sm">
                    {sc.score >= t.mark ? <CircleCheck className="h-4 w-4 shrink-0 text-brand-600" /> : <CircleX className="h-4 w-4 shrink-0 text-slate-300" />}
                    <span className={sc.score >= t.mark ? 'text-ink-950' : 'text-slate-500'}>
                      <strong className="font-semibold tabular-nums">{t.mark}%</strong> — {t.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
        </Reveal>

        <Reveal delay={80} className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <Card className="rounded-3xl lg:col-span-3">
            <CardTitle icon={<ListChecks className="h-5 w-5" />} title="Score by dimension" />
            <BreakdownBars items={sc.breakdown} />
          </Card>
          <Card className="rounded-3xl lg:col-span-2">
            <CardTitle icon={<ArrowRight className="h-5 w-5" />} title="What happens next" />
            <div className="space-y-3 text-sm text-slate-600">
              {status.capstoneUnlocked ? (
                <p>
                  Your <strong className="font-semibold text-ink-950">practical capstone</strong> is unlocked. It asks you to solve a realistic {domain?.shortName ?? ''} scenario with AI and show how you verified the result.
                </p>
              ) : (
                <p>Score at least {CERT_RULES.awareKnowledgeMark}% to unlock the practical capstone. Revisit the modules linked to your weakest dimensions, then retake.</p>
              )}
              <p>
                Your responsible AI score ({sc.responsibleAIScore}%) counts towards the responsible AI requirement, together with your capstone.
              </p>
              <p>Your best attempt is the one used for certification. Retakes use a fresh set of questions.</p>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {status.capstoneUnlocked && (
                <Button to="/app/assessments/capstone" icon={<Wrench className="h-4 w-4" />} full>
                  Go to the capstone
                </Button>
              )}
              <Button variant="outline" icon={<RotateCcw className="h-4 w-4" />} full onClick={start}>
                Retake with new questions
              </Button>
              <Button variant="ghost" to="/app/assessments" full>
                Back to assessments
              </Button>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={120}>
        <Card className="rounded-3xl">
          <CardTitle
            icon={<Eye className="h-5 w-5" />}
            title="Review every question"
          />
          <Tabs
            className="mb-5"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'all', label: 'All', count: sc.total },
              { id: 'incorrect', label: 'To review', count: sc.total - sc.correct },
              { id: 'correct', label: 'Correct', count: sc.correct },
            ]}
          />
          {shown.length === 0 ? (
            <p className="rounded-xl bg-sand-100 p-4 text-center text-sm text-slate-500">{filter === 'incorrect' ? 'Nothing to review — every answer was correct.' : 'No questions in this view.'}</p>
          ) : (
            <ol className="space-y-4">
              {shown.map((p) => {
                const n = sc.perQuestion.indexOf(p) + 1;
                return (
                  <li key={p.question.id} className={cn('rounded-2xl border p-4 sm:p-5', p.correct ? 'border-brand-800/15 bg-brand-50/40' : 'border-clay-200/80 bg-clay-50/40')}>
                    <div className="flex flex-wrap items-center gap-2">
                      {p.correct ? <CircleCheck className="h-5 w-5 text-brand-600" /> : <CircleX className="h-5 w-5 text-clay-600" />}
                      <span className="text-sm font-bold text-ink-950">Question {n}</span>
                      <Badge tone="neutral">{DIMENSION_META[p.question.dimension].label}</Badge>
                    </div>
                    {p.question.scenario && <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.question.scenario}</p>}
                    <p className="mt-2 text-[15px] font-semibold text-ink-950">{p.question.question}</p>
                    <ul className="mt-3 space-y-1.5">
                      {p.question.options.map((o, i) => {
                        const isCorrect = i === p.question.correctIndex;
                        const isChosen = i === p.chosen;
                        return (
                          <li
                            key={i}
                            className={cn(
                              'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
                              isCorrect ? 'bg-brand-100/70 font-semibold text-brand-900' : isChosen ? 'bg-clay-100/70 text-clay-900' : 'text-slate-600',
                            )}
                          >
                            <span className="w-4 shrink-0 font-bold">{LETTERS[i]}</span>
                            <span className="flex-1">{o}</span>
                            {isCorrect && <span className="shrink-0 text-xs font-bold uppercase tracking-wide">Correct</span>}
                            {isChosen && !isCorrect && <span className="shrink-0 text-xs font-bold uppercase tracking-wide">Your answer</span>}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      <strong className="font-semibold text-ink-950">Why: </strong>
                      {p.question.explanation}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
          {source === 'gemini' ? (
            <AIDisclaimer className="mt-5">Questions and explanations were generated by Gemini for your profession and validated automatically. If anything looks wrong, apply your professional judgement.</AIDisclaimer>
          ) : (
            <AIDisclaimer className="mt-5">Questions came from the ZimAI Ready question bank{notice ? ' because Gemini was unavailable' : ''}. Scenarios feature fictional organisations and people.</AIDisclaimer>
          )}
        </Card>
        </Reveal>
      </div>
    );
  }

  // ───────────── Intro ─────────────
  const best = status.bestKnowledge;
  return (
    <div className="animate-fade-up space-y-8 sm:space-y-10">
      {header}
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <Reveal className="lg:col-span-3">
        <Card className="h-full rounded-4xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-800 text-canvas">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-3xl leading-tight text-ink-950">Before you <em>begin</em></h2>
              <p className="mt-1 text-sm text-slate-500">No hard time limit — take the time you need.</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Questions" value={QUESTION_COUNT} />
            <Fact label="Time" value={`~${SUGGESTED_MINUTES} min`} />
            <Fact label="Pass mark" value={`${CERT_RULES.knowledgePassMark}%`} />
            <Fact label="Retakes" value="Allowed" />
          </dl>
          <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
            {[
              'One scenario per screen.',
              'No feedback until you submit — move back and forth freely.',
              'Review your answers before submitting.',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" iconRight={<ArrowRight className="h-5 w-5" />} onClick={start}>
              {attempts.length ? 'Start a new attempt' : 'Start assessment'}
            </Button>
            <Button variant="ghost" to="/app/assessments">
              Back to assessments
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-400">Questions are generated by Gemini for {domain?.professional ?? 'your profession'}, or drawn from the ZimAI Ready question bank when AI is unavailable.</p>
        </Card>
        </Reveal>

        <Reveal delay={100} className="space-y-6 lg:col-span-2">
          <Card className="rounded-3xl">
            <CardTitle title="What is assessed" />
            <ul className="space-y-3">
              {DIMENSIONS.map((d) => (
                <li key={d} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lilac-100 text-ink-800">
                    <Icon name={DIMENSION_META[d].icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-950">
                      {DIMENSION_META[d].label}
                      <span className="text-xs font-medium text-slate-400">
                        {DIMENSION_META[d].target} question{DIMENSION_META[d].target === 1 ? '' : 's'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">{DIMENSION_META[d].description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="rounded-3xl">
            <CardTitle title="Your attempts" subtitle={best ? `Best score ${best.score}%` : 'No attempts yet'} />
            {attempts.length ? (
              <ul className="space-y-2">
                {attempts.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-xl bg-sand-100 px-3 py-2 text-sm">
                    <span className="text-slate-600">{formatDate(a.createdAt)}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-display text-xl font-medium leading-none tabular-nums text-ink-950">{a.score}%</span>
                      <Badge tone={a.passed ? 'brand' : 'neutral'}>{a.passed ? 'Passed' : 'Not yet'}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Your first attempt will appear here. Only your best score counts towards certification.</p>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

function ExitModal({ open, onClose, onExit }: { open: boolean; onClose: () => void; onExit: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Leave the assessment?"
      description="Your answers will not be saved and this attempt will not be recorded."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Keep going
          </Button>
          <Button variant="danger" onClick={onExit}>
            Leave assessment
          </Button>
        </>
      }
    />
  );
}
