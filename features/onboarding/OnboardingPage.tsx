import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  BarChart3,
  Check,
  CircleHelp,
  Clock,
  Code2,
  Compass,
  CornerDownLeft,
  Crown,
  FileText,
  FlaskConical,
  Gauge,
  Headset,
  Layers,
  Lightbulb,
  ListChecks,
  PenLine,
  Radar,
  Rocket,
  Route,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
  X,
  Zap,
  CircleDashed,
  CalendarDays,
  CalendarClock,
  Repeat,
} from 'lucide-react';
import type { CareerObjective, Confidence, DeptUsage, ExperienceBand, OnboardingAnswers, OrgAdoption, PersonalUsage, UseCase } from '../../types';
import { useApp } from '../../services/store';
import { isGeminiAvailable } from '../../services/gemini';
import { Button, Chip, ErrorState, Icon, LoadingState, Modal, OptionCard, ProgressBar } from '../../components/ui';
import { Logo } from '../../components/brand';
import { INDUSTRIES, industryName } from '../../data/industries';
import { getRole, ROLES, roleName } from '../../data/roles';
import { resolveDomain, resolveTargetDomain, TARGET_CAREERS } from '../../data/catalog';
import { cn, nowISO, sleep } from '../../lib/utils';
import { resolveAnalysisDomains, runReadinessAnalysis } from '../readiness/engine';

/**
 * /onboarding — the ASSESS step. A focused, full-screen, one-question-per-screen
 * flow (9 questions) that feeds the readiness engine. Draft answers survive a
 * refresh (sessionStorage); a retake is pre-filled from the saved profile.
 */

// ───────────────────────────── Types & option data ─────────────────────────────

interface Draft {
  industryId?: string;
  industryOther?: string;
  roleId?: string;
  roleOther?: string;
  jobTitle?: string;
  experience?: ExperienceBand;
  orgAdoption?: OrgAdoption;
  deptUsage?: DeptUsage;
  personalUsage?: PersonalUsage;
  useCases: UseCase[];
  confidence?: Confidence;
  careerObjective?: CareerObjective;
  targetCareer?: string;
}

type Phase = 'intro' | 'questions' | 'analysing' | 'error';

const TOTAL = 9;
const EMPTY: Draft = { useCases: [] };

const EXPERIENCE: { id: ExperienceBand; label: string; hint: string }[] = [
  { id: '0-2', label: '0–2', hint: 'Early career' },
  { id: '3-5', label: '3–5', hint: 'Established' },
  { id: '6-10', label: '6–10', hint: 'Experienced' },
  { id: '11-15', label: '11–15', hint: 'Senior' },
  { id: '16+', label: '16+', hint: 'Veteran' },
];

const ORG: { id: OrgAdoption; label: string; description: string; icon: ReactNode }[] = [
  { id: 'extensive', label: 'Yes, extensively', description: 'AI tools are used across many teams and processes', icon: <Rocket className="h-5 w-5" /> },
  { id: 'partial', label: 'Partially', description: 'Some teams or processes already use AI', icon: <Layers className="h-5 w-5" /> },
  { id: 'experimenting', label: 'Currently experimenting', description: 'Pilots or trials are under way', icon: <FlaskConical className="h-5 w-5" /> },
  { id: 'not-yet', label: 'Not yet', description: 'No formal AI adoption so far', icon: <CircleDashed className="h-5 w-5" /> },
  { id: 'unknown', label: 'I don’t know', description: 'That’s fine — we’ll account for it', icon: <CircleHelp className="h-5 w-5" /> },
];

const DEPT: { id: DeptUsage; label: string; description: string; icon: ReactNode }[] = [
  { id: 'regularly', label: 'Regularly', description: 'AI is part of how the team works', icon: <Repeat className="h-5 w-5" /> },
  { id: 'occasionally', label: 'Occasionally', description: 'Some colleagues use it for some tasks', icon: <CalendarClock className="h-5 w-5" /> },
  { id: 'experimenting', label: 'Experimenting', description: 'The team is trying AI out', icon: <FlaskConical className="h-5 w-5" /> },
  { id: 'never', label: 'Never', description: 'AI isn’t used in the department', icon: <CircleDashed className="h-5 w-5" /> },
  { id: 'unsure', label: 'Unsure', description: 'I’m not sure how much it is used', icon: <CircleHelp className="h-5 w-5" /> },
];

const USAGE: { id: PersonalUsage; label: string; description: string; icon: ReactNode }[] = [
  { id: 'daily', label: 'Daily', description: 'AI is part of my everyday work', icon: <Zap className="h-5 w-5" /> },
  { id: 'weekly', label: 'Weekly', description: 'A few times a week for specific tasks', icon: <CalendarDays className="h-5 w-5" /> },
  { id: 'occasionally', label: 'Occasionally', description: 'Now and then, when I remember to', icon: <CalendarClock className="h-5 w-5" /> },
  { id: 'never', label: 'Never', description: 'I haven’t used AI at work yet', icon: <CircleDashed className="h-5 w-5" /> },
];

const USE_CASES: { id: UseCase; label: string; icon: ReactNode }[] = [
  { id: 'writing', label: 'Writing', icon: <PenLine className="h-4 w-4" /> },
  { id: 'research', label: 'Research', icon: <Search className="h-4 w-4" /> },
  { id: 'data-analysis', label: 'Data analysis', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'automation', label: 'Automation', icon: <Workflow className="h-4 w-4" /> },
  { id: 'coding', label: 'Coding', icon: <Code2 className="h-4 w-4" /> },
  { id: 'customer-support', label: 'Customer support', icon: <Headset className="h-4 w-4" /> },
  { id: 'reporting', label: 'Reporting', icon: <FileText className="h-4 w-4" /> },
  { id: 'brainstorming', label: 'Brainstorming', icon: <Lightbulb className="h-4 w-4" /> },
  { id: 'decision-support', label: 'Decision support', icon: <Scale className="h-4 w-4" /> },
  { id: 'none', label: 'I don’t currently use AI', icon: <Ban className="h-4 w-4" /> },
];

const CONFIDENCE: { id: Confidence; name: string; description: string }[] = [
  { id: 1, name: 'Beginner', description: 'I’ve heard of it' },
  { id: 2, name: 'Explorer', description: 'I’ve tried AI tools a few times' },
  { id: 3, name: 'Practitioner', description: 'I use AI for simple tasks' },
  { id: 4, name: 'Confident', description: 'I use AI confidently in my work' },
  { id: 5, name: 'Advanced', description: 'I build workflows and automations with AI' },
];

const OBJECTIVES: { id: CareerObjective; label: string; description: string; icon: ReactNode }[] = [
  { id: 'better-current-job', label: 'Become better at my current job', description: 'Save time and improve the quality of my work', icon: <TrendingUp className="h-5 w-5" /> },
  { id: 'ai-ready-current', label: 'Become AI-ready in my current profession', description: 'Build and certify recognised AI competency', icon: <ShieldCheck className="h-5 w-5" /> },
  { id: 'prepare-changes', label: 'Prepare for future changes to my role', description: 'Stay ahead as AI reshapes my tasks', icon: <Compass className="h-5 w-5" /> },
  { id: 'transition', label: 'Transition into another field', description: 'Use AI skills to move into a new career', icon: <Route className="h-5 w-5" /> },
  { id: 'leadership', label: 'Move into leadership/management', description: 'Lead teams and decisions in an AI-enabled workplace', icon: <Crown className="h-5 w-5" /> },
  { id: 'advanced-ai', label: 'Build advanced AI skills', description: 'Go deeper: automation, analytics and advanced tools', icon: <Sparkles className="h-5 w-5" /> },
];

const STEP_META: { eyebrow: string; title: string; helper?: string }[] = [
  { eyebrow: 'About your work', title: 'Which industry do you work in?', helper: 'This helps us understand how AI is changing your sector.' },
  { eyebrow: 'About your work', title: 'What is your functional area?', helper: 'Choose the area closest to your day-to-day work, then add your job title.' },
  { eyebrow: 'About your work', title: 'How many years of professional experience do you have?' },
  { eyebrow: 'AI in your workplace', title: 'Has your organisation adopted AI?', helper: 'Your best guess is fine.' },
  { eyebrow: 'AI in your workplace', title: 'How much is AI currently used in your department?' },
  { eyebrow: 'Your AI use', title: 'How often do you currently use AI at work?', helper: 'Include tools such as ChatGPT, Gemini or Copilot, and AI features inside other software.' },
  { eyebrow: 'Your AI use', title: 'What do you currently use AI for?', helper: 'Select all that apply.' },
  { eyebrow: 'Your AI use', title: 'How confident are you with AI?', helper: 'Be honest — there are no wrong answers. This only personalises your path.' },
  { eyebrow: 'Your goals', title: 'What is your main career objective?', helper: 'We’ll shape your learning path around it.' },
];

// ───────────────────────────── Helpers ─────────────────────────────

function validate(step: number, d: Draft): string | null {
  switch (step) {
    case 0:
      if (!d.industryId) return 'Choose the industry you work in.';
      if (d.industryId === 'other' && (d.industryOther ?? '').trim().length < 2) return 'Tell us which industry you work in.';
      return null;
    case 1:
      if (!d.roleId) return 'Choose your functional area.';
      if (d.roleId === 'other' && (d.roleOther ?? '').trim().length < 2) return 'Tell us your functional area.';
      if ((d.jobTitle ?? '').trim().length < 2) return 'Add your job title (at least 2 characters).';
      return null;
    case 2:
      return d.experience ? null : 'Choose your years of experience.';
    case 3:
      return d.orgAdoption ? null : 'Choose the option closest to your organisation.';
    case 4:
      return d.deptUsage ? null : 'Choose the option closest to your department.';
    case 5:
      return d.personalUsage ? null : 'Choose how often you use AI at work.';
    case 6:
      return d.useCases.length ? null : 'Select at least one option — or “I don’t currently use AI”.';
    case 7:
      return d.confidence ? null : 'Choose the level that best describes you.';
    case 8:
      if (!d.careerObjective) return 'Choose your main career objective.';
      if (d.careerObjective === 'transition' && (d.targetCareer ?? '').trim().length < 2) return 'Tell us which field or role interests you.';
      return null;
    default:
      return null;
  }
}

function toAnswers(d: Draft): OnboardingAnswers {
  const transition = d.careerObjective === 'transition';
  const targetCareer = transition ? (d.targetCareer ?? '').trim() : '';
  const quick = TARGET_CAREERS.find((t) => t.label.toLowerCase() === targetCareer.toLowerCase());
  const targetDomainId = transition ? quick?.domainId ?? resolveTargetDomain(targetCareer) : undefined;
  const useCases = d.useCases.includes('none') ? (['none'] as UseCase[]) : d.useCases;
  return {
    industryId: d.industryId!,
    ...(d.industryId === 'other' ? { industryOther: (d.industryOther ?? '').trim() } : {}),
    roleId: d.roleId!,
    ...(d.roleId === 'other' ? { roleOther: (d.roleOther ?? '').trim() } : {}),
    jobTitle: (d.jobTitle ?? '').trim(),
    experience: d.experience!,
    orgAdoption: d.orgAdoption!,
    deptUsage: d.deptUsage!,
    personalUsage: d.personalUsage!,
    useCases,
    confidence: d.confidence!,
    careerObjective: d.careerObjective!,
    ...(transition ? { targetCareer, ...(targetDomainId ? { targetDomainId } : {}) } : {}),
  };
}

function fromAnswers(a: Partial<OnboardingAnswers> | null | undefined): Draft {
  if (!a) return { ...EMPTY };
  return {
    industryId: a.industryId,
    industryOther: a.industryOther,
    roleId: a.roleId,
    roleOther: a.roleOther,
    jobTitle: a.jobTitle,
    experience: a.experience,
    orgAdoption: a.orgAdoption,
    deptUsage: a.deptUsage,
    personalUsage: a.personalUsage,
    useCases: a.useCases ? [...a.useCases] : [],
    confidence: a.confidence,
    careerObjective: a.careerObjective,
    targetCareer: a.targetCareer,
  };
}

interface Stored {
  draft: Draft;
  step: number;
  started: boolean;
}

function readStored(key: string): Stored | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Stored;
    if (!v || typeof v !== 'object' || !v.draft) return null;
    return { draft: { ...EMPTY, ...v.draft, useCases: Array.isArray(v.draft.useCases) ? v.draft.useCases : [] }, step: Math.max(0, Math.min(TOTAL - 1, Number(v.step) || 0)), started: Boolean(v.started) };
  } catch {
    return null;
  }
}

// ───────────────────────────── Page ─────────────────────────────

export default function OnboardingPage() {
  const { user, profile, assessments, latestAssessment, saveProfile, addAssessment } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const retake = params.get('retake') === '1' || Boolean(latestAssessment);
  const storageKey = `zimai:onboarding-draft:${user?.id ?? 'anon'}`;

  const stored = useMemo(() => readStored(storageKey), [storageKey]);
  const [draft, setDraft] = useState<Draft>(() => stored?.draft ?? fromAnswers(profile));
  const [step, setStep] = useState(() => stored?.step ?? 0);
  const [phase, setPhase] = useState<Phase>(() => (stored?.started ? 'questions' : 'intro'));
  const [dir, setDir] = useState<1 | -1>(1);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [exitOpen, setExitOpen] = useState(false);

  const draftRef = useRef(draft);
  draftRef.current = draft;
  const stepRef = useRef(step);
  stepRef.current = step;
  const timer = useRef<number | undefined>(undefined);
  const titleRef = useRef<HTMLInputElement>(null);

  const exitTarget = latestAssessment ? '/app' : '/';

  // Persist the in-progress draft.
  useEffect(() => {
    if (phase !== 'questions') return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ draft, step, started: true } satisfies Stored));
    } catch {
      /* storage unavailable — draft simply won't survive a refresh */
    }
  }, [draft, step, phase, storageKey]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Preselect "I don't currently use AI" for people who never use it.
  useEffect(() => {
    if (step === 6 && draft.personalUsage === 'never' && draft.useCases.length === 0) setDraft((d) => ({ ...d, useCases: ['none'] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step, phase]);

  const update = useCallback((patch: Partial<Draft>) => {
    setError(null);
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const finish = useCallback(async () => {
    if (!user) return;
    const answers = toAnswers(draftRef.current);
    setFailure(null);
    setPhase('analysing');
    try {
      const [result] = await Promise.all([
        runReadinessAnalysis({
          answers,
          userId: user.id,
          displayName: user.name,
          kind: assessments.length ? 'reassessment' : 'initial',
          previous: latestAssessment,
        }),
        sleep(3200),
      ]);
      const now = nowISO();
      const { targetDomainId } = resolveAnalysisDomains(answers);
      await saveProfile({
        ...answers,
        userId: user.id,
        displayName: user.name,
        ...(profile?.department ? { department: profile.department } : {}),
        domainId: resolveDomain(answers.industryId, answers.roleId),
        ...(targetDomainId ? { targetDomainId } : {}),
        ...(user.organisationId ?? profile?.organisationId ? { organisationId: user.organisationId ?? profile?.organisationId } : {}),
        onboardingCompletedAt: now,
        updatedAt: now,
      });
      await addAssessment(result);
      clearDraft();
      navigate('/app/readiness?new=1', { replace: true });
    } catch (e) {
      console.warn('[ZimAI] readiness analysis failed', e);
      setFailure('We couldn’t save your analysis. Check your connection and try again — your answers are safe.');
      setPhase('error');
    }
  }, [user, assessments.length, latestAssessment, profile, saveProfile, addAssessment, clearDraft, navigate]);

  const goNext = useCallback(() => {
    window.clearTimeout(timer.current);
    const s = stepRef.current;
    const msg = validate(s, draftRef.current);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    if (s >= TOTAL - 1) {
      void finish();
      return;
    }
    setDir(1);
    setStep(s + 1);
  }, [finish]);

  const goBack = useCallback(() => {
    window.clearTimeout(timer.current);
    setError(null);
    if (stepRef.current === 0) {
      setPhase('intro');
      return;
    }
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  /** Single-choice select with a short auto-advance for speed. */
  const choose = useCallback(
    (patch: Partial<Draft>, advance = true) => {
      update(patch);
      window.clearTimeout(timer.current);
      if (advance) {
        const at = stepRef.current;
        timer.current = window.setTimeout(() => {
          if (stepRef.current === at) goNext();
        }, 260);
      }
    },
    [update, goNext],
  );

  const start = useCallback(() => {
    setDir(1);
    setPhase('questions');
  }, []);

  // Enter continues (buttons keep their native Enter behaviour).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing || exitOpen) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'TEXTAREA')) return;
      if (phase === 'intro') {
        e.preventDefault();
        start();
      } else if (phase === 'questions') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, exitOpen, goNext, start]);

  const hasAnswers = phase === 'questions' && (step > 0 || Boolean(draft.industryId));
  const requestExit = () => {
    if (phase === 'analysing') return;
    if (hasAnswers) setExitOpen(true);
    else {
      clearDraft();
      navigate(exitTarget);
    }
  };

  const industryLabel = draft.industryId ? industryName(draft.industryId, draft.industryOther) : 'your sector';
  const role = getRole(draft.roleId);

  // ───────── Render ─────────

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <style>{`
        @keyframes zo-in-right { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
        @keyframes zo-in-left { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }
        @keyframes zo-shake { 0%,100% { transform: none; } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .zo-in-right { animation: zo-in-right .38s cubic-bezier(.2,.8,.2,1) both; }
        .zo-in-left { animation: zo-in-left .38s cubic-bezier(.2,.8,.2,1) both; }
        .zo-shake { animation: zo-shake .3s ease-in-out; }
      `}</style>

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(21,174,124,0.16),transparent)]" />
        <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4 sm:px-6">
          <div
            onClickCapture={(e) => {
              e.preventDefault();
              requestExit();
            }}
          >
            <Logo to={exitTarget} compact className="sm:hidden" />
            <Logo to={exitTarget} className="hidden sm:inline-flex" />
          </div>
          <div className="min-w-0 flex-1">
            {phase === 'questions' && (
              <div className="mx-auto max-w-md animate-fade-in">
                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">
                    Question <span className="tabular-nums text-ink-950">{step + 1}</span> of {TOTAL}
                  </span>
                  <span className="hidden text-slate-400 sm:inline">{STEP_META[step].eyebrow}</span>
                </div>
                <ProgressBar value={((step + 1) / TOTAL) * 100} size="xs" />
              </div>
            )}
            {phase === 'intro' && (
              <p className="hidden text-center text-sm font-semibold text-slate-500 sm:block">{retake ? 'AI readiness reassessment' : 'AI readiness assessment'}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={requestExit} disabled={phase === 'analysing'} icon={<X className="h-4 w-4" />} aria-label="Exit assessment">
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        {phase === 'intro' && <Intro retake={retake} onStart={start} name={user?.name} />}

        {phase === 'questions' && (
          <>
            <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
              <div key={step} className={dir > 0 ? 'zo-in-right' : 'zo-in-left'}>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{STEP_META[step].eyebrow}</p>
                <h1 className="text-balance text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[32px] sm:leading-tight">{STEP_META[step].title}</h1>
                {STEP_META[step].helper && <p className="mt-2 text-[15px] text-slate-500">{STEP_META[step].helper}</p>}
                <div className="mt-7">
                  {step === 0 && (
                    <>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {INDUSTRIES.map((ind, i) => (
                          <Stagger key={ind.id} i={i}>
                            <OptionCard
                              compact
                              selected={draft.industryId === ind.id}
                              onClick={() => choose({ industryId: ind.id }, ind.id !== 'other')}
                              icon={<Icon name={ind.icon} className="h-5 w-5" />}
                              label={ind.name}
                              description={<span className="line-clamp-1">{ind.description}</span>}
                            />
                          </Stagger>
                        ))}
                      </div>
                      {draft.industryId === 'other' && (
                        <TextField
                          autoFocus
                          label="Which industry do you work in?"
                          placeholder="e.g. Logistics, NGO / development, Media"
                          value={draft.industryOther ?? ''}
                          onChange={(v) => update({ industryOther: v })}
                          maxLength={60}
                        />
                      )}
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {ROLES.map((r, i) => (
                          <Stagger key={r.id} i={i}>
                            <RoleTile
                              selected={draft.roleId === r.id}
                              icon={<Icon name={r.icon} className="h-5 w-5" />}
                              label={r.name}
                              onClick={() => {
                                update({ roleId: r.id });
                                window.setTimeout(() => titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
                              }}
                            />
                          </Stagger>
                        ))}
                      </div>
                      {draft.roleId === 'other' && (
                        <TextField
                          autoFocus
                          label="Which functional area?"
                          placeholder="e.g. Legal, Quality assurance, Communications"
                          value={draft.roleOther ?? ''}
                          onChange={(v) => update({ roleOther: v })}
                          maxLength={60}
                        />
                      )}
                      <div className={cn('transition-opacity duration-300', draft.roleId ? 'opacity-100' : 'opacity-60')}>
                        <TextField
                          inputRef={titleRef}
                          label="Your job title"
                          placeholder={role?.exampleTitles[0] ? `e.g. ${role.exampleTitles[0]}` : 'e.g. Project Officer'}
                          value={draft.jobTitle ?? ''}
                          onChange={(v) => update({ jobTitle: v })}
                          maxLength={70}
                        />
                        {role && role.exampleTitles.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {role.exampleTitles.map((t) => (
                              <Chip key={t} selected={(draft.jobTitle ?? '').trim().toLowerCase() === t.toLowerCase()} onClick={() => update({ jobTitle: t })} className="py-1.5 text-[13px]">
                                {t}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {EXPERIENCE.map((x, i) => (
                        <Stagger key={x.id} i={i} className={i === 4 ? 'col-span-2 sm:col-span-1' : undefined}>
                          <button
                            type="button"
                            aria-pressed={draft.experience === x.id}
                            onClick={() => choose({ experience: x.id })}
                            className={cn(
                              'group flex w-full flex-col items-center justify-center rounded-2xl border-2 bg-white px-3 py-5 transition-all active:scale-[0.98] sm:py-7',
                              draft.experience === x.id ? 'border-brand-500 bg-brand-50/70 shadow-sm' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/60',
                            )}
                          >
                            <span className={cn('text-3xl font-extrabold tracking-tight tabular-nums', draft.experience === x.id ? 'text-brand-700' : 'text-ink-950')}>{x.label}</span>
                            <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">years</span>
                            <span className="mt-2 text-[12px] text-slate-400">{x.hint}</span>
                          </button>
                        </Stagger>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <OptionList options={ORG} value={draft.orgAdoption} onChoose={(id) => choose({ orgAdoption: id })} />
                  )}

                  {step === 4 && (
                    <OptionList options={DEPT} value={draft.deptUsage} onChoose={(id) => choose({ deptUsage: id })} />
                  )}

                  {step === 5 && (
                    <OptionList
                      options={USAGE}
                      value={draft.personalUsage}
                      onChoose={(id) =>
                        choose({
                          personalUsage: id,
                          // Keep use cases consistent with the usage answer.
                          ...(id !== 'never' && draft.useCases.length === 1 && draft.useCases[0] === 'none' ? { useCases: [] } : {}),
                        })
                      }
                    />
                  )}

                  {step === 6 && (
                    <>
                      <div className="flex flex-wrap gap-2.5">
                        {USE_CASES.map((u, i) => {
                          const selected = draft.useCases.includes(u.id);
                          return (
                            <Stagger key={u.id} i={i}>
                              <Chip
                                selected={selected}
                                icon={u.icon}
                                className="px-4 py-2.5 text-[15px]"
                                onClick={() => {
                                  const cur = draft.useCases;
                                  let next: UseCase[];
                                  if (u.id === 'none') next = selected ? [] : ['none'];
                                  else next = selected ? cur.filter((x) => x !== u.id) : [...cur.filter((x) => x !== 'none'), u.id];
                                  update({ useCases: next });
                                }}
                              >
                                {u.label}
                              </Chip>
                            </Stagger>
                          );
                        })}
                      </div>
                      <p className="mt-4 text-sm text-slate-500">
                        {draft.useCases.includes('none')
                          ? 'No problem — many professionals are just starting. Your path will begin with the essentials.'
                          : draft.useCases.length
                            ? `${draft.useCases.length} selected`
                            : draft.personalUsage === 'never'
                              ? 'Choose “I don’t currently use AI” if that applies.'
                              : 'Choose everything you use AI for, even occasionally.'}
                      </p>
                    </>
                  )}

                  {step === 7 && <ConfidenceScale value={draft.confidence} onChange={(v) => update({ confidence: v })} />}

                  {step === 8 && (
                    <>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {OBJECTIVES.map((o, i) => (
                          <Stagger key={o.id} i={i}>
                            <OptionCard
                              selected={draft.careerObjective === o.id}
                              onClick={() => choose({ careerObjective: o.id }, o.id !== 'transition')}
                              icon={o.icon}
                              label={o.label}
                              description={o.description}
                              className="h-full"
                            />
                          </Stagger>
                        ))}
                      </div>
                      {draft.careerObjective === 'transition' && (
                        <div className="mt-5 animate-fade-up rounded-2xl border border-brand-200 bg-white p-4 shadow-card sm:p-5">
                          <p className="flex items-center gap-2 text-[15px] font-bold text-ink-950">
                            <Target className="h-4 w-4 text-brand-600" /> Which field or role interests you?
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {TARGET_CAREERS.map((t) => (
                              <Chip
                                key={t.id}
                                selected={(draft.targetCareer ?? '').trim().toLowerCase() === t.label.toLowerCase()}
                                icon={<Icon name={t.icon} className="h-4 w-4" />}
                                onClick={() => update({ targetCareer: t.label })}
                                className="text-[13px]"
                              >
                                {t.label}
                              </Chip>
                            ))}
                          </div>
                          <TextField
                            label="Or type a role"
                            placeholder="e.g. Supply Chain Analyst"
                            value={draft.targetCareer ?? ''}
                            onChange={(v) => update({ targetCareer: v })}
                            maxLength={60}
                            compact
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {error && (
                  <p key={error + step} role="alert" className="zo-shake mt-5 flex items-center gap-2 rounded-xl bg-clay-50 px-3.5 py-2.5 text-sm font-medium text-clay-700 ring-1 ring-inset ring-clay-200">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </p>
                )}
              </div>
            </div>

            {/* Footer navigation */}
            <div className="sticky bottom-0 z-20 border-t border-slate-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <Button variant="ghost" onClick={goBack} icon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <span className="hidden items-center gap-1 text-xs text-slate-400 md:inline-flex">
                    press <kbd className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans font-semibold text-slate-500">Enter <CornerDownLeft className="h-3 w-3" /></kbd>
                  </span>
                  <Button onClick={goNext} iconRight={step === TOTAL - 1 ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />} className="min-w-[132px]">
                    {step === TOTAL - 1 ? 'Analyse my readiness' : 'Continue'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {phase === 'analysing' && <Analysing draft={draft} industryLabel={industryLabel} />}

        {phase === 'error' && (
          <div className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
            <ErrorState title="Your analysis didn’t complete" message={failure ?? undefined} onRetry={() => void finish()} />
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => {
                  setPhase('questions');
                  setStep(TOTAL - 1);
                }}
              >
                Back to questions
              </Button>
            </div>
          </div>
        )}
      </main>

      <Modal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        size="sm"
        title="Leave the assessment?"
        description={latestAssessment ? 'Your current readiness profile stays as it is.' : 'You’ll need to finish it to unlock your readiness profile and learning path.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setExitOpen(false)}>
              Keep going
            </Button>
            <Button
              variant="dark"
              onClick={() => {
                clearDraft();
                setExitOpen(false);
                navigate(exitTarget);
              }}
            >
              Exit and discard answers
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          You’ve answered {Math.min(step + (validate(step, draft) ? 0 : 1), TOTAL)} of {TOTAL} questions. It only takes about two minutes to finish.
        </p>
      </Modal>
    </div>
  );
}

// ───────────────────────────── Sub-components ─────────────────────────────

function Stagger({ i, children, className }: { i: number; children: ReactNode; className?: string }) {
  return (
    <div className={cn('animate-fade-up', className)} style={{ animationDelay: `${Math.min(i, 12) * 28}ms` }}>
      {children}
    </div>
  );
}

function OptionList<T extends string>({ options, value, onChoose }: { options: { id: T; label: string; description: string; icon: ReactNode }[]; value?: T; onChoose: (id: T) => void }) {
  return (
    <div className="grid gap-2.5">
      {options.map((o, i) => (
        <Stagger key={o.id} i={i}>
          <OptionCard selected={value === o.id} onClick={() => onChoose(o.id)} icon={o.icon} label={o.label} description={o.description} />
        </Stagger>
      ))}
    </div>
  );
}

function RoleTile({ selected, icon, label, onClick }: { selected: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'group relative flex h-full w-full flex-col items-start gap-2.5 rounded-2xl border-2 bg-white p-3.5 text-left transition-all active:scale-[0.98]',
        selected ? 'border-brand-500 bg-brand-50/60 shadow-sm' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/60',
      )}
    >
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-colors', selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-700')}>{icon}</span>
      <span className="text-[14px] font-semibold leading-snug text-ink-950">{label}</span>
      {selected && (
        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function TextField({ label, value, onChange, placeholder, autoFocus, maxLength, inputRef, compact }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  inputRef?: React.Ref<HTMLInputElement>;
  compact?: boolean;
}) {
  return (
    <label className={cn('block animate-fade-up', compact ? 'mt-4' : 'mt-6')}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
      />
    </label>
  );
}

function ConfidenceScale({ value, onChange }: { value?: Confidence; onChange: (v: Confidence) => void }) {
  const active = CONFIDENCE.find((c) => c.id === value);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(5, (value ?? 0) + 1) as Confidence);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, (value ?? 2) - 1) as Confidence);
    }
  };
  return (
    <div>
      <div role="radiogroup" aria-label="AI confidence" onKeyDown={onKey} className="relative">
        <div className="absolute inset-x-[10%] top-[38px] hidden h-1 rounded-full bg-gradient-to-r from-clay-300 via-gold-300 to-brand-500 opacity-60 sm:block" aria-hidden />
        <div className="relative grid grid-cols-5 gap-2 sm:gap-3">
          {CONFIDENCE.map((c, i) => {
            const on = value === c.id;
            const filled = value != null && c.id <= value;
            return (
              <Stagger key={c.id} i={i}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${c.id} – ${c.name}: ${c.description}`}
                  tabIndex={on || (!value && c.id === 1) ? 0 : -1}
                  onClick={() => onChange(c.id)}
                  className={cn(
                    'flex w-full flex-col items-center gap-2 rounded-2xl border-2 bg-white px-1 py-3.5 transition-all active:scale-[0.97] sm:py-4',
                    on ? 'border-brand-500 bg-brand-50/70 shadow-glow' : 'border-slate-200 hover:border-brand-300',
                  )}
                >
                  <span className="flex h-8 items-end gap-[3px]" aria-hidden>
                    {[1, 2, 3, 4, 5].map((b) => (
                      <span key={b} className={cn('w-1.5 rounded-full transition-colors duration-300', b <= c.id ? (filled ? 'bg-brand-500' : 'bg-slate-300') : 'bg-slate-100')} style={{ height: 6 + b * 5 }} />
                    ))}
                  </span>
                  <span className={cn('text-lg font-extrabold tabular-nums', on ? 'text-brand-700' : 'text-ink-950')}>{c.id}</span>
                  <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:block">{c.name}</span>
                </button>
              </Stagger>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between px-1 text-xs font-semibold text-slate-400">
        <span>Beginner</span>
        <span>Advanced</span>
      </div>
      <div className={cn('mt-5 rounded-2xl border p-5 transition-colors', active ? 'border-brand-200 bg-white shadow-card' : 'border-dashed border-slate-300 bg-white/60')}>
        {active ? (
          <div key={active.id} className="flex animate-fade-in items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Gauge className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">
                Level {active.id} · {active.name}
              </p>
              <p className="mt-0.5 text-lg font-bold text-ink-950">“{active.description}”</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Tap a level to see what it means. Use ← → to adjust.</p>
        )}
      </div>
    </div>
  );
}

function Intro({ retake, onStart, name }: { retake: boolean; onStart: () => void; name?: string }) {
  const first = name?.split(' ')[0];
  const items = [
    { icon: <Gauge className="h-5 w-5" />, title: 'Personal AI Readiness', text: 'How prepared you are to work with AI, scored 0–100.' },
    { icon: <Radar className="h-5 w-5" />, title: 'Workplace AI Exposure', text: 'How much AI is transforming your role and sector.' },
    { icon: <Target className="h-5 w-5" />, title: 'Your AI skills gaps', text: 'The specific skills that matter most in your job.' },
    { icon: <ListChecks className="h-5 w-5" />, title: 'AI Skills Prescription', text: 'A prioritised learning path built around you.' },
  ];
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 pb-16 pt-10 text-center sm:px-6 sm:pt-16">
      <span className="inline-flex animate-fade-up items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 shadow-card ring-1 ring-brand-200/70">
        <Sparkles className="h-3.5 w-3.5" /> {retake ? 'Reassessment' : 'AI Readiness Assessment'}
      </span>
      <h1 className="mt-5 max-w-2xl animate-fade-up text-balance text-3xl font-extrabold tracking-tight text-ink-950 [animation-delay:60ms] sm:text-5xl sm:leading-[1.08]">
        {retake ? (
          <>
            Let’s see how far you’ve come{first ? `, ${first}` : ''}.
          </>
        ) : (
          <>
            Let’s understand where you are with <span className="shimmer-text">AI</span>.
          </>
        )}
      </h1>
      <p className="mt-4 max-w-xl animate-fade-up text-[15px] leading-relaxed text-slate-600 [animation-delay:120ms] sm:text-lg">
        {retake
          ? 'Your previous answers are pre-filled — update anything that has changed. We’ll compare your new profile with your last one.'
          : 'Nine quick questions about your work, your workplace and how you use AI today. Your answers become a personal readiness profile and learning plan.'}
      </p>
      <p className="mt-4 inline-flex animate-fade-up items-center gap-1.5 text-sm font-semibold text-slate-500 [animation-delay:160ms]">
        <Clock className="h-4 w-4" /> Takes about 2 minutes
      </p>

      <div className="mt-9 grid w-full gap-3 text-left sm:grid-cols-2">
        {items.map((it, i) => (
          <div key={it.title} className="flex animate-fade-up items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card" style={{ animationDelay: `${200 + i * 70}ms` }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{it.icon}</span>
            <div>
              <p className="text-[15px] font-bold text-ink-950">{it.title}</p>
              <p className="mt-0.5 text-sm text-slate-500">{it.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-9 flex animate-fade-up flex-col items-center gap-3 [animation-delay:520ms]">
        <Button size="lg" onClick={onStart} iconRight={<ArrowRight className="h-5 w-5" />} className="min-w-[220px] shadow-glow">
          {retake ? 'Start reassessment' : 'Start assessment'}
        </Button>
        <p className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex">
          or press <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-sans font-semibold text-slate-500">Enter</kbd>
        </p>
      </div>
      <p className="mt-8 flex max-w-md items-start gap-2 text-left text-xs leading-relaxed text-slate-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        Your answers are only used to personalise your analysis and learning. We never ask for sensitive personal data.
      </p>
    </div>
  );
}

function Analysing({ draft, industryLabel }: { draft: Draft; industryLabel: string }) {
  const role = getRole(draft.roleId);
  const roleLabel = roleName(draft.roleId, draft.roleOther);
  const shortRole = role?.id === 'human-resources' ? 'HR' : roleLabel;
  const tasks = role?.aiImpactedTasks.slice(0, 2).map((t) => t.toLowerCase()) ?? [];
  const transition = draft.careerObjective === 'transition' && draft.targetCareer;
  const gemini = isGeminiAvailable();

  const messages = useMemo(
    () => [
      `Mapping AI exposure in ${industryLabel}…`,
      `Comparing your skills with ${shortRole} roles…`,
      ...(tasks.length === 2 ? [`Reviewing how AI is changing ${tasks[0]} and ${tasks[1]}…`] : []),
      ...(transition ? [`Assessing your move into ${draft.targetCareer}…`] : []),
      'Building your AI Skills Prescription…',
      gemini ? 'Personalising your profile with Gemini…' : 'Running the ZimAI readiness engine…',
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const stages = [
    { label: 'Scoring your personal AI readiness', icon: <Gauge className="h-4 w-4" /> },
    { label: `Mapping workplace AI exposure in ${industryLabel}`, icon: <Radar className="h-4 w-4" /> },
    { label: transition ? `Analysing your transition to ${draft.targetCareer}` : 'Identifying your AI skills gaps', icon: transition ? <Route className="h-4 w-4" /> : <Target className="h-4 w-4" /> },
    { label: 'Prescribing your learning path', icon: <ListChecks className="h-4 w-4" /> },
  ];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setDone((d) => Math.min(stages.length - 1, d + 1)), 800);
    return () => window.clearInterval(t);
  }, [stages.length]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 pb-16 pt-6 sm:pt-12">
      <LoadingState variant="ai" title="Analysing your AI readiness" messages={messages} />
      <div className="w-full animate-fade-up rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
        <ul className="space-y-3">
          {stages.map((s, i) => {
            const complete = i < done;
            const current = i === done;
            return (
              <li key={s.label} className={cn('flex items-center gap-3 text-sm transition-opacity duration-300', i > done && 'opacity-40')}>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    complete ? 'bg-brand-600 text-white' : current ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {complete ? <Check className="h-4 w-4" strokeWidth={3} /> : s.icon}
                </span>
                <span className={cn('font-medium', complete ? 'text-slate-500' : 'text-ink-950')}>{s.label}</span>
                {current && <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-5 text-center text-xs text-slate-400">Scores come from a transparent, deterministic model — AI personalises the explanation and plan.</p>
    </div>
  );
}
