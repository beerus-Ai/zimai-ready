import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, Building2, CircleCheck, CircleX, ClipboardList, Clock, FileText, Lightbulb, ListChecks, PenLine, RotateCcw, Save, Scale, Send, Sparkles, Target, TriangleAlert } from 'lucide-react';
import { AIDisclaimer, AISourceBadge, Badge, Button, Card, CardTitle, EmptyState, LoadingState, PageHeader, RichText, ScoreRing, useToast } from '../../components/ui';
import { useApp } from '../../services/store';
import { CERT_RULES } from '../../config';
import { certificateState, evaluateCertification, LEVEL_META } from '../../lib/certification';
import { recordActivity } from '../../lib/progress';
import { getDomain } from '../../data/catalog';
import { cn, nowISO, sleep, timeAgo, uid } from '../../lib/utils';
import type { AISource, AssessmentResult } from '../../types';
import { CAPSTONE_CRITERIA, CAPSTONE_MINUTES, CAPSTONE_SECTIONS, emptySections, getCapstoneBrief } from './capstones';
import type { CapstoneSections, SectionId } from './capstones';
import { combineSections, evaluateCapstone, fallbackCapstoneIntro, personaliseCapstone } from './assessmentEngine';
import type { CapstoneEvaluation, CapstoneIntro } from './assessmentEngine';
import { BreakdownBars, DataBlock, Fact, LockedPanel, scoreHex } from './assessment-components';
import { Reveal } from '../../components/motion';

type Phase = 'brief' | 'evaluating' | 'results';

const draftKey = (userId: string, domainId: string) => `zimai:capstone-draft:${userId}:${domainId}`;
const introKey = (userId: string, domainId: string) => `zimai:capstone-intro:${userId}:${domainId}`;

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — drafts are a convenience */
  }
}
function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

const wordCount = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export default function CapstonePage() {
  const { user, profile, latestAssessment, progress, submissions, results, certificates, addAssessmentResult, saveProgress } = useApp();
  const toast = useToast();
  const status = useMemo(() => evaluateCertification({ progress, submissions, results }), [progress, submissions, results]);
  const domainId = progress?.domainId ?? 'operations';
  const domain = getDomain(domainId);
  const brief = useMemo(() => getCapstoneBrief(domainId), [domainId]);
  const userId = user?.id ?? '';

  const [phase, setPhase] = useState<Phase>('brief');
  const [sections, setSections] = useState<CapstoneSections>(emptySections);
  const [draftReady, setDraftReady] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [intro, setIntro] = useState<CapstoneIntro | null>(null);
  const [introSource, setIntroSource] = useState<AISource | undefined>();
  const [introLoading, setIntroLoading] = useState(false);
  const [outcome, setOutcome] = useState<{ evaluation: CapstoneEvaluation; source: AISource; notice?: string } | null>(null);

  const attempts = results.filter((r) => r.kind === 'capstone');
  const unlocked = status.capstoneUnlocked;

  // Load any saved draft.
  useEffect(() => {
    if (!userId) return;
    const saved = readJSON<{ sections: Partial<CapstoneSections>; savedAt: string }>(draftKey(userId, domainId));
    if (saved?.sections) {
      setSections({ ...emptySections(), ...saved.sections });
      setSavedAt(saved.savedAt ?? null);
    }
    setDraftReady(true);
  }, [userId, domainId]);

  // Autosave the draft (debounced).
  useEffect(() => {
    if (!draftReady || !userId || phase !== 'brief') return;
    const t = setTimeout(() => {
      const hasContent = Object.values(sections).some((v) => v.trim());
      if (!hasContent) {
        removeKey(draftKey(userId, domainId));
        setSavedAt(null);
        return;
      }
      const at = nowISO();
      writeJSON(draftKey(userId, domainId), { sections, savedAt: at });
      setSavedAt(at);
    }, 700);
    return () => clearTimeout(t);
  }, [sections, draftReady, userId, domainId, phase]);

  // Personalise the scenario framing to the learner's role (optional; cached).
  useEffect(() => {
    if (!userId || !unlocked) return;
    const cached = readJSON<CapstoneIntro>(introKey(userId, domainId));
    if (cached?.intro) {
      setIntro(cached);
      setIntroSource('gemini');
      return;
    }
    let cancelled = false;
    setIntroLoading(true);
    personaliseCapstone({ brief, profile, assessment: latestAssessment, progress })
      .then((res) => {
        if (cancelled) return;
        setIntro(res.data);
        setIntroSource(res.source);
        if (res.source === 'gemini') writeJSON(introKey(userId, domainId), res.data);
      })
      .catch(() => !cancelled && setIntro(fallbackCapstoneIntro(brief, profile)))
      .finally(() => !cancelled && setIntroLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, domainId, unlocked]);

  if (!user) return null;

  const header = (
    <PageHeader
      eyebrow="Stage 3 · Practical capstone"
      title={unlocked && progress ? brief.title : 'Practical Capstone'}
      description={`A realistic ${domain?.shortName ?? 'workplace'} scenario to solve with AI.`}
    />
  );

  if (!progress) {
    return (
      <div className="animate-fade-up">
        {header}
        <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="Start your learning path first" description="The capstone unlocks after your final knowledge assessment." action={<Button to="/app/learning">Go to my learning path</Button>} />
      </div>
    );
  }

  if (!unlocked && phase === 'brief') {
    const k = status.bestKnowledge?.score ?? 0;
    return (
      <div className="animate-fade-up">
        {header}
        <LockedPanel
          title="The capstone is locked"
          description="Demonstrate your knowledge first. The capstone unlocks once you reach the AI Aware threshold in the final knowledge assessment."
          items={[
            {
              label: `Score at least ${CERT_RULES.awareKnowledgeMark}% in the final knowledge assessment`,
              detail: status.bestKnowledge ? `Your best score: ${k}%` : status.finalUnlocked ? 'Not attempted yet' : 'The final assessment is not unlocked yet',
              met: false,
              progress: (k / CERT_RULES.awareKnowledgeMark) * 100,
            },
          ]}
          action={
            status.finalUnlocked ? (
              <Button to="/app/assessments/final" iconRight={<ArrowRight className="h-4 w-4" />}>
                Take the final assessment
              </Button>
            ) : (
              <Button to="/app/learning" iconRight={<ArrowRight className="h-4 w-4" />}>
                Continue learning
              </Button>
            )
          }
        />
      </div>
    );
  }

  const errors = CAPSTONE_SECTIONS.filter((s) => sections[s.id].trim().length < s.minChars).map((s) => s.id);
  const completeCount = CAPSTONE_SECTIONS.length - errors.length;

  async function submit() {
    if (!user || !progress) return;
    if (errors.length) {
      setShowErrors(true);
      toast.error('Your submission is not complete yet', `${errors.length} section${errors.length === 1 ? ' needs' : 's need'} more detail.`);
      document.getElementById(`cap-${errors[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setPhase('evaluating');
    window.scrollTo({ top: 0 });
    try {
      const [res] = await Promise.all([evaluateCapstone({ brief, sections, profile, assessment: latestAssessment, progress }), sleep(1400)]);
      const ev = res.data;
      const result: AssessmentResult = {
        id: uid('res-'),
        userId: user.id,
        kind: 'capstone',
        domainId: progress.domainId,
        score: ev.score,
        passed: ev.passed,
        breakdown: ev.breakdown,
        responsibleAIScore: ev.responsibleAIScore,
        answer: combineSections(sections),
        feedback: ev.feedback,
        createdAt: nowISO(),
        source: res.source,
      };
      await addAssessmentResult(result);
      await saveProgress((prev) => recordActivity(prev ?? progress, 'assessment', `Practical capstone — scored ${ev.score}% (${ev.passed ? 'passed' : 'not yet passed'})`));
      removeKey(draftKey(user.id, domainId));
      setOutcome({ evaluation: ev, source: res.source, notice: res.error });
      setPhase('results');
      window.scrollTo({ top: 0 });
    } catch {
      setPhase('brief');
      toast.error('We could not save your capstone', 'Your draft is kept on this device — please try again.');
    }
  }

  // ───────────── Evaluating ─────────────
  if (phase === 'evaluating') {
    return (
      <div className="animate-fade-in">
        {header}
        <Card>
          <LoadingState
            variant="ai"
            title="Evaluating your capstone…"
            messages={['Reading your approach and AI prompts…', 'Checking how you verified the AI output…', 'Assessing your responsible AI safeguards…', 'Scoring against the published criteria…']}
          />
        </Card>
      </div>
    );
  }

  // ───────────── Results ─────────────
  if (phase === 'results' && outcome) {
    const ev = outcome.evaluation;
    const color = scoreHex(ev.score, CERT_RULES.capstonePassMark);
    const achievable = status.achievableLevel;
    const held = certificates
      .filter((c) => c.type === 'domain' && c.domainId === progress.domainId && certificateState(c) === 'valid')
      .reduce((m, c) => Math.max(m, LEVEL_META[c.level].rank), 0);
    const canClaim = !!achievable && LEVEL_META[achievable].rank > held;
    const outstanding = status.requirements.filter((r) => !r.met && r.level === (status.nextLevel ?? 'AI_READY'));
    return (
      <div className="animate-fade-up space-y-8 sm:space-y-10">
        <PageHeader
          eyebrow="Practical capstone · Results"
          title={ev.passed ? 'Practical competency demonstrated' : 'Not yet — revise and resubmit'}
          description={ev.passed ? 'You passed the practical capstone — evidence that you can use AI responsibly in real professional work.' : `You scored ${ev.score}%. The pass mark is ${CERT_RULES.capstonePassMark}%. Use the feedback below to strengthen your submission.`}
        />

        <Reveal>
        <Card className="rounded-4xl">
          <div className="flex flex-col items-center gap-8 p-1 sm:p-3 md:flex-row md:gap-10">
            <ScoreRing value={ev.score} size={208} stroke={16} color={color} label={ev.passed ? 'Passed' : 'Score'} />
            <div className="w-full min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={ev.passed ? 'brand' : ev.score >= 50 ? 'gold' : 'clay'}>
                  {ev.passed ? 'Passed' : 'Not yet passed'} · pass mark {CERT_RULES.capstonePassMark}%
                </Badge>
                <Badge tone="neutral" className="capitalize">
                  {ev.feedback.verdict.replace('-', ' ')}
                </Badge>
                <AISourceBadge source={outcome.source} />
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{ev.feedback.overall}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Fact label="Capstone score" value={`${ev.score}%`} />
                <Fact label="Responsible AI" value={`${ev.responsibleAIScore}%`} />
                <Fact label="Submission" value={`#${attempts.length}`} className="col-span-2 sm:col-span-1" />
              </dl>
              {outcome.notice && <p className="mt-3 text-xs text-slate-500">{outcome.notice} Your work was scored by the built-in evaluator against the same published criteria.</p>}
            </div>
          </div>
        </Card>
        </Reveal>

        <Reveal delay={80} className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <Card className="rounded-3xl lg:col-span-3">
            <CardTitle icon={<ListChecks className="h-5 w-5" />} title="Score by criterion" />
            <BreakdownBars items={ev.breakdown} showComments />
          </Card>
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-3xl">
              <CardTitle icon={<Award className="h-5 w-5" />} title="What this means for certification" />
              {canClaim && achievable ? (
                <>
                  <p className="text-sm text-slate-600">
                    You now meet every requirement for <strong className="font-semibold text-ink-950">{LEVEL_META[achievable].label}</strong>. Claim your verifiable certificate from the assessments hub.
                  </p>
                  <Button to="/app/assessments" className="mt-4" full variant="gold" icon={<Award className="h-4 w-4" />}>
                    Claim your {LEVEL_META[achievable].label} certificate
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600">
                    {ev.passed ? 'Your capstone requirement is met.' : `AI Ready requires a capstone score of at least ${CERT_RULES.capstonePassMark}%.`}{' '}
                    {outstanding.length ? `Still to complete for ${LEVEL_META[status.nextLevel ?? 'AI_READY'].label}:` : ''}
                  </p>
                  {outstanding.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {outstanding.map((r) => (
                        <li key={r.id} className="flex gap-2 text-sm">
                          <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                          <span>
                            <span className="font-semibold text-ink-950">{r.label}</span>
                            <span className="block text-xs text-slate-500">{r.detail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button to="/app/assessments" className="mt-4" full variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Back to assessments hub
                  </Button>
                </>
              )}
            </Card>
            <Card className="rounded-3xl">
              <CardTitle icon={<Target className="h-5 w-5" />} title="Key issues in this scenario" />
              <ul className="space-y-2">
                {brief.planted.map((p) => (
                  <li key={p.label} className="flex gap-2 text-sm text-slate-600">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {p.label}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Reveal>

        <Reveal delay={120} className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl bg-brand-50/60">
            <CardTitle icon={<CircleCheck className="h-5 w-5" />} title="Strengths" />
            <ul className="space-y-2">
              {ev.feedback.strengths.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-slate-700">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="rounded-3xl bg-gold-50/60">
            <CardTitle icon={<PenLine className="h-5 w-5" />} title="How to improve" />
            <ul className="space-y-2">
              {ev.feedback.improvements.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-slate-700">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Card className="rounded-3xl">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-ink-950">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" /> Your submission
              </span>
              <span className="text-sm font-semibold text-brand-700 group-open:hidden">Show</span>
              <span className="hidden text-sm font-semibold text-brand-700 group-open:inline">Hide</span>
            </summary>
            <RichText text={combineSections(sections)} className="mt-4 text-sm text-slate-700" />
          </details>
        </Card>

        <AIDisclaimer>
          {outcome.source === 'gemini'
            ? 'Scored by Gemini against the published criteria. AI evaluation can make mistakes — the criteria, your submission and this feedback are recorded so the result can be reviewed.'
            : 'Scored by the ZimAI Ready built-in evaluator against the published criteria, based on the concepts and issues your submission addresses.'}
        </AIDisclaimer>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/app/assessments" iconRight={<ArrowRight className="h-4 w-4" />}>
            Back to assessments hub
          </Button>
          <Button
            variant="outline"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              setOutcome(null);
              setShowErrors(false);
              setPhase('brief');
              window.scrollTo({ top: 0 });
            }}
          >
            Revise & resubmit
          </Button>
        </div>
      </div>
    );
  }

  // ───────────── Brief + submission ─────────────
  const best = status.bestCapstone;
  const shownIntro = intro ?? fallbackCapstoneIntro(brief, profile);
  return (
    <div className="animate-fade-up space-y-8 sm:space-y-10">
      {header}

      {best && (
        <div className={cn('flex flex-col gap-2 rounded-2xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between', best.passed ? 'border-brand-800/15 bg-brand-50/70' : 'border-gold-200 bg-gold-50/70')}>
          <p className="text-slate-700">
            Your best capstone score is <strong className="font-display text-xl font-medium text-ink-950">{best.score}%</strong> ({best.passed ? 'passed' : 'not yet passed'}). You can revise and resubmit — your best score counts.
          </p>
          <Badge tone={best.passed ? 'brand' : 'gold'}>{attempts.length} submission{attempts.length === 1 ? '' : 's'}</Badge>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <Reveal className="space-y-6 lg:col-span-3">
          <Card className="rounded-4xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand" icon={<Building2 className="h-3 w-3" />}>
                {brief.organisation}
              </Badge>
              <Badge tone="neutral" icon={<Clock className="h-3 w-3" />}>
                {CAPSTONE_MINUTES}
              </Badge>
              <Badge tone="neutral">Pass mark {CERT_RULES.capstonePassMark}%</Badge>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Your role</p>
            <p className="font-display text-2xl leading-tight text-ink-950 sm:text-3xl">{shownIntro.roleTitle}</p>
            <div className="mt-3 rounded-2xl border border-ink-950/10 bg-lilac-100/70 p-4">
              {introLoading ? (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4 animate-pulse text-brand-600" /> Personalising this scenario to your role…
                </p>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-slate-700">{shownIntro.intro}</p>
                  {introSource === 'gemini' && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AISourceBadge source="gemini" />
                      <AIDisclaimer compact />
                    </div>
                  )}
                </>
              )}
            </div>
            <h3 className="mt-6 font-display text-xl font-medium text-ink-950">The situation</h3>
            <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-slate-700">
              {brief.context.split('\n\n').map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl">
            <CardTitle icon={<FileText className="h-5 w-5" />} title={brief.dataTitle} subtitle="Fictional data — not everything here is correct." />
            <DataBlock data={brief.data} kind={brief.dataKind} />
          </Card>

          <Card className="rounded-3xl">
            <CardTitle icon={<Target className="h-5 w-5" />} title="Your task" />
            <p className="text-[15px] font-semibold leading-relaxed text-ink-950">{brief.task}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">Your submission should include:</p>
            <ul className="mt-2 space-y-1.5">
              {brief.deliverables.map((d) => (
                <li key={d} className="flex gap-2 text-sm text-slate-600">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-2">
          <div className="space-y-6 lg:sticky lg:top-6">
            <Card className="rounded-3xl">
              <CardTitle icon={<Scale className="h-5 w-5" />} title="How you will be scored" subtitle="100 points in total." />
              <ul className="space-y-3">
                {CAPSTONE_CRITERIA.map((c) => (
                  <li key={c.id} className="flex items-start gap-3">
                    <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-950/10 bg-gold-100 font-condensed text-base tabular-nums text-ink-950">{c.weight}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-950">{c.label}</p>
                      <p className="text-xs leading-snug text-slate-500">{c.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-sand-100 p-3 text-xs leading-relaxed text-slate-500">
                Pass mark {CERT_RULES.capstonePassMark}%. Your responsible AI score from this capstone also counts towards the responsible AI requirement ({CERT_RULES.responsibleAIPassMark}%).
              </p>
            </Card>
            <Card className="rounded-3xl border-ink-950/10 bg-blush-100/60">
              <CardTitle icon={<Lightbulb className="h-5 w-5" />} title="Tips for a strong submission" />
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Be specific to this scenario — refer to the actual data and figures.</li>
                <li>• Write out the real prompts you would use.</li>
                <li>• Name each error or weak assumption you find, and explain why.</li>
                <li>• Never paste personal data into AI tools — say how you would protect it.</li>
                <li>• End with a clear recommendation someone could act on tomorrow.</li>
              </ul>
            </Card>
          </div>
        </Reveal>
      </div>

      {/* Submission form */}
      <Card className="rounded-4xl p-6 sm:p-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl leading-tight text-ink-950">Your <em>submission</em></h2>
            <p className="text-sm text-slate-500">
              {completeCount}/{CAPSTONE_SECTIONS.length} sections complete · Your draft saves automatically on this device.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-live="polite">
            <Save className="h-3.5 w-3.5" />
            {savedAt ? `Draft saved ${timeAgo(savedAt)}` : 'Not saved yet'}
          </span>
        </div>

        <div className="space-y-8">
          {CAPSTONE_SECTIONS.map((sec) => {
            const value = sections[sec.id];
            const len = value.trim().length;
            const invalid = showErrors && errors.includes(sec.id);
            const met = len >= sec.minChars;
            return (
              <div key={sec.id} id={`cap-${sec.id}`} className="scroll-mt-24">
                <label htmlFor={`cap-input-${sec.id}`} className="flex items-start gap-3">
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold', met ? 'bg-brand-800 text-canvas' : 'border border-ink-950/15 bg-sand-100 text-ink-700')}>
                    {met ? <CircleCheck className="h-4 w-4" /> : sec.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-ink-950">{sec.title}</span>
                    <span className="mt-0.5 block text-sm text-slate-500">{sec.helper}</span>
                  </span>
                </label>
                <textarea
                  id={`cap-input-${sec.id}`}
                  value={value}
                  maxLength={sec.maxChars}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSections((prev) => ({ ...prev, [sec.id as SectionId]: v }));
                  }}
                  placeholder={sec.placeholder}
                  rows={sec.id === 'recommendation' || sec.id === 'aiUse' ? 7 : 5}
                  aria-invalid={invalid}
                  aria-describedby={`cap-hint-${sec.id}`}
                  className={cn(
                    'mt-3 w-full resize-y rounded-xl border bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink-950 outline-none transition placeholder:text-slate-400 focus:ring-2',
                    invalid ? 'border-clay-400 focus:border-clay-500 focus:ring-clay-100' : 'border-ink-950/15 focus:border-ink-950 focus:ring-lilac-200',
                  )}
                />
                <div id={`cap-hint-${sec.id}`} className="mt-1.5 flex items-center justify-between gap-3 text-xs">
                  {invalid ? (
                    <span className="flex items-center gap-1 font-semibold text-clay-700">
                      <TriangleAlert className="h-3.5 w-3.5" /> Add more detail — at least {sec.minChars} characters ({sec.minChars - len} to go).
                    </span>
                  ) : (
                    <span className={met ? 'text-brand-700' : 'text-slate-400'}>{met ? `${wordCount(value)} words` : `Minimum ${sec.minChars} characters`}</span>
                  )}
                  <span className="shrink-0 tabular-nums text-slate-400">
                    {len}/{sec.maxChars}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-ink-950/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-slate-500">
            Your submission is evaluated against the criteria above by Gemini, or by the built-in evaluator when AI is unavailable. You can revise and resubmit as many times as you need.
          </p>
          <Button size="lg" icon={<Send className="h-4 w-4" />} onClick={submit} className="shrink-0">
            Submit for evaluation
          </Button>
        </div>
      </Card>
    </div>
  );
}
