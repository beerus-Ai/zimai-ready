import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, ArrowUpRight, Bot, Briefcase, ChevronDown, Compass, Flag, Gauge, Map, Plus, RefreshCw, Route, Search } from 'lucide-react';
import type { AISource, CareerTransitionAnalysis, EmployeeProfile, PathItem } from '../../types';
import { useApp } from '../../services/store';
import { AISourceBadge, Button, Card, Chip, EmptyState, ErrorState, Icon, LoadingState, PageHeader, useToast } from '../../components/ui';
import { getDomain, getModule, TARGET_CAREERS } from '../../data/catalog';
import { industryName } from '../../data/industries';
import { roleName } from '../../data/roles';
import { emptyModuleProgress } from '../../lib/progress';
import { cn, nowISO, sleep } from '../../lib/utils';
import { analyseCareerTransition } from './engine';
import { TransitionView } from './TransitionView';
import { GrowthPath } from '../../components/illustrations';

/**
 * /app/career — career pathway. Shows the learner's transition goal (from the
 * readiness assessment or a goal set here) and lets anyone explore "what would
 * it take to move into X?" with a Gemini-personalised comparison.
 */

interface Explored {
  target: string;
  data: CareerTransitionAnalysis;
  source: AISource;
  fromAssessment?: boolean;
}

const same = (x?: string, y?: string) => Boolean(x && y && x.trim().toLowerCase() === y.trim().toLowerCase());

function readCache(key: string): Explored | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Explored;
    if (!v || typeof v.target !== 'string' || !v.data || !Array.isArray(v.data.pathway) || !Array.isArray(v.data.missingSkills)) return null;
    return v;
  } catch {
    return null;
  }
}

function writeCache(key: string, v: Explored) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

export default function CareerPage() {
  const { user, profile, latestAssessment: a, progress, saveProgress, saveProfile } = useApp();
  const toast = useToast();
  const cacheKey = `zimai:career-explore:${user?.id ?? 'anon'}`;

  const [explored, setExplored] = useState<Explored | null>(() => readCache(cacheKey));
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [pending, setPending] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const autoRan = useRef(false);

  const goalTarget = profile?.careerObjective === 'transition' ? profile.targetCareer?.trim() || undefined : undefined;
  const assessmentTx = a?.careerTransition;

  /** The transition shown as the learner's goal. */
  const goal: Explored | null = useMemo(() => {
    if (a && assessmentTx && (!goalTarget || same(goalTarget, assessmentTx.targetRole) || same(goalTarget, a.answers.targetCareer)))
      return { target: assessmentTx.targetRole, data: assessmentTx, source: a.source, fromAssessment: true };
    if (goalTarget && explored && same(explored.target, goalTarget)) return explored;
    return null;
  }, [a, assessmentTx, goalTarget, explored]);

  const answers = profile ?? a?.answers ?? null;
  const currentRole = answers ? answers.jobTitle || roleName(answers.roleId, answers.roleOther) : 'your role';

  const run = async (targetCareer: string) => {
    const clean = targetCareer.trim();
    if (clean.length < 2) {
      setInputError('Enter a role or field (at least 2 characters).');
      return;
    }
    if (!answers || !user) return;
    setInputError(null);
    setPending(clean);
    setStatus('loading');
    try {
      const [res] = await Promise.all([analyseCareerTransition({ answers, displayName: user.name, targetCareer: clean }), sleep(1800)]);
      const next: Explored = { target: clean, data: res.data, source: res.source };
      setExplored(next);
      writeCache(cacheKey, next);
      setStatus('idle');
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (e) {
      console.warn('[ZimAI] career analysis failed', e);
      setStatus('error');
    }
  };

  // A goal set on this page (not yet reflected in an assessment) is analysed automatically.
  useEffect(() => {
    if (goalTarget && !goal && !autoRan.current && status === 'idle') {
      autoRan.current = true;
      void run(goalTarget);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalTarget, goal]);

  /** Target-domain modules from an analysis that are not yet in the learner's path. */
  const modulesToAdd = (x: Explored): string[] => {
    const tId = x.data.targetDomainId;
    const domain = tId ? getDomain(tId) : undefined;
    const fromPathway = x.data.pathway.map((s) => s.moduleId).filter((id): id is string => Boolean(id && getModule(id)));
    const ids = domain
      ? [...fromPathway.filter((id) => getModule(id)?.domainId === tId), ...domain.moduleIds.filter((id) => getModule(id)?.requiredForCertification)]
      : fromPathway;
    const have = new Set(progress?.path.map((p) => p.moduleId) ?? []);
    return Array.from(new Set(ids)).filter((id) => !have.has(id));
  };

  const addToPath = async (x: Explored) => {
    if (!progress) return;
    const ids = modulesToAdd(x);
    if (!ids.length) {
      toast.info('Already in your learning path', `Every ${x.data.targetRole} module is already part of your path.`);
      return;
    }
    setAdding(true);
    try {
      let added = 0;
      await saveProgress((prev) => {
        const base = prev ?? progress;
        const have = new Set(base.path.map((p) => p.moduleId));
        const top = base.path.reduce((m, p) => Math.max(m, p.priority), 0);
        const items: PathItem[] = ids
          .filter((id) => !have.has(id))
          .map((id, i) => {
            const step = x.data.pathway.find((s) => s.moduleId === id);
            return {
              moduleId: id,
              priority: top + i + 1,
              reason: step?.description ? `Career transition to ${x.data.targetRole}: ${step.description}` : `Builds the skills needed to move into ${x.data.targetRole}.`,
              required: getModule(id)?.requiredForCertification ?? false,
              addedBy: 'transition',
              addedAt: nowISO(),
            };
          });
        added = items.length;
        const modules = { ...base.modules };
        items.forEach((it) => {
          if (!modules[it.moduleId]) modules[it.moduleId] = emptyModuleProgress(it.moduleId);
        });
        return {
          ...base,
          path: [...base.path, ...items],
          modules,
          activity: [{ at: nowISO(), type: 'path' as const, label: `Career transition modules added: ${x.data.currentRole} → ${x.data.targetRole}` }, ...base.activity].slice(0, 50),
        };
      });
      toast.success('Added to your learning path', `${added} ${x.data.targetRole} module${added === 1 ? '' : 's'} added after your current modules.`);
    } catch {
      toast.error('Couldn’t update your learning path', 'Please try again in a moment.');
    } finally {
      setAdding(false);
    }
  };

  const makeGoal = async (x: Explored) => {
    if (!profile) return;
    setSavingGoal(true);
    try {
      const { targetDomainId: _previous, ...rest } = profile;
      const next: EmployeeProfile = {
        ...rest,
        careerObjective: 'transition',
        targetCareer: x.target,
        ...(x.data.targetDomainId ? { targetDomainId: x.data.targetDomainId } : {}),
        updatedAt: nowISO(),
      };
      await saveProfile(next);
      toast.success('Career goal updated', `${x.data.targetRole} is now your career goal. Retake your assessment to rebuild your AI Skills Prescription around it.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Couldn’t save your goal', 'Please try again in a moment.');
    } finally {
      setSavingGoal(false);
    }
  };

  if (!a || !answers) {
    return (
      <>
        <PageHeader eyebrow="Career path" title={<>Your career <em>path</em></>} />
        <EmptyState
          icon={<Route className="h-6 w-6" />}
          title="Complete your readiness assessment first"
          description="Your career pathway is built from your role, skills and AI readiness."
          action={
            <Button to="/onboarding" iconRight={<ArrowRight className="h-4 w-4" />}>
              Take the assessment
            </Button>
          }
        />
      </>
    );
  }

  const exploredIsGoal = Boolean(goal && explored && goal === explored);
  const showExplored = Boolean(explored && !exploredIsGoal && status !== 'loading');

  const pathActions = (x: Explored, withGoal: boolean) => {
    const toAdd = progress ? modulesToAdd(x) : [];
    return (
      <>
        {progress ? (
          toAdd.length > 0 ? (
            <Button onClick={() => void addToPath(x)} loading={adding} icon={<Plus className="h-4 w-4" />}>
              Add this transition to my learning path
            </Button>
          ) : (
            <Button to="/app/learning" icon={<Map className="h-4 w-4" />} iconRight={<ArrowRight className="h-4 w-4" />}>
              Continue my learning path
            </Button>
          )
        ) : (
          <Button to="/app/learning" icon={<Map className="h-4 w-4" />} iconRight={<ArrowRight className="h-4 w-4" />}>
            Start my learning path
          </Button>
        )}
        {withGoal && (
          <Button variant="outline" onClick={() => void makeGoal(x)} loading={savingGoal} icon={<Flag className="h-4 w-4" />}>
            Make this my career goal
          </Button>
        )}
        <Button to="/app/tutor" variant="ghost" icon={<Bot className="h-4 w-4" />}>
          Talk it through with the AI Tutor
        </Button>
      </>
    );
  };

  const explorer = (
    <Explorer
      input={input}
      setInput={(v) => {
        setInput(v);
        setInputError(null);
      }}
      error={inputError}
      status={status}
      pending={pending}
      currentRole={currentRole}
      onRun={(t) => void run(t)}
      exclude={goal?.target}
    />
  );

  return (
    <div className="pb-6">
      <div className="relative flex items-end gap-4">
      <PageHeader
        className="min-w-0 flex-1"
        eyebrow="Career path"
        title={goal ? <>Your career <em>transition</em></> : <>Your career <em>path</em></>}
        description={
          goal
            ? `${goal.data.currentRole} → ${goal.data.targetRole}`
            : `${currentRole} · ${industryName(answers.industryId, answers.industryOther)}`
        }
        actions={
          <Button to="/app/readiness" variant="outline" size="sm" icon={<Gauge className="h-4 w-4" />}>
            Readiness profile
          </Button>
        }
      />
        <GrowthPath className="mb-6 hidden h-28 w-28 shrink-0 animate-ghost-in xl:block" animated />
      </div>

      {goal ? (
        <>
          <TransitionView analysis={goal.data} source={goal.source} progress={progress} isGoal actions={pathActions(goal, false)} />
          {!goal.fromAssessment && (
            <Card className="mt-4 flex animate-ghost-in flex-col gap-3 border-brand-800/15 bg-brand-50/60 sm:flex-row sm:items-center">
              <RefreshCw className="h-5 w-5 shrink-0 text-brand-800" />
              <p className="flex-1 text-sm text-slate-700">
                Your readiness profile was built for a different goal. Retake the assessment to rebuild your AI Skills Prescription around <span className="font-semibold">{goal.data.targetRole}</span>.
              </p>
              <Button to="/onboarding?retake=1" size="sm" variant="secondary">
                Retake assessment
              </Button>
            </Card>
          )}
          <Card className="mt-6 animate-ghost-in" padded={false}>
            <button type="button" onClick={() => setExploreOpen((o) => !o)} aria-expanded={exploreOpen} className="flex w-full items-center gap-3 p-5 text-left sm:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lilac-100 text-ink-900 ring-1 ring-inset ring-ink-950/10">
                <Compass className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl leading-tight text-ink-950">Explore a different career</span>
                <span className="block text-sm text-slate-500">Your current goal stays unchanged</span>
              </span>
              <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', (exploreOpen || status === 'loading') && 'rotate-180')} />
            </button>
            {(exploreOpen || status === 'loading') && <div className="animate-fade-in border-t border-slate-100 p-5 sm:px-6">{explorer}</div>}
          </Card>
        </>
      ) : goalTarget && status === 'loading' && same(pending, goalTarget) ? (
        <Card>
          <LoadingState variant="ai" title={`Analysing your move into ${goalTarget}`} messages={[`Comparing ${currentRole} skills with ${goalTarget} roles…`, 'Identifying your transferable strengths…', 'Designing your personalised pathway…']} />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Card className="animate-ghost-in">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-800">
                  <Briefcase className="h-5 w-5" />
                </span>
                <h3 className="font-display text-2xl leading-tight text-ink-950">Career opportunities</h3>
              </div>
              <AISourceBadge source={a.source} />
            </div>
            <ul className="space-y-2.5">
              {a.careerOpportunities.map((c, i) => (
                <li key={c} className="animate-ghost-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(c);
                      void run(c);
                    }}
                    disabled={status === 'loading'}
                    className="group flex w-full items-center gap-3 rounded-xl border border-ink-950/10 bg-paper px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-ink-sm disabled:opacity-60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-200/80 font-condensed text-base text-slate-600 group-hover:bg-lilac-200 group-hover:text-ink-950">{i + 1}</span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink-950">{c}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-ink-950">
                      Explore <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            
          </Card>
          <Card className="animate-ghost-in [animation-delay:100ms]">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-canvas">
                <Route className="h-5 w-5" />
              </span>
              <h3 className="font-display text-2xl leading-tight text-ink-950">Explore a career transition</h3>
            </div>
            {explorer}
          </Card>
        </div>
      )}

      {showExplored && explored && (
        <div ref={resultRef} className="mt-12 animate-ghost-in scroll-mt-20">
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="text-2xl leading-tight text-ink-950 sm:text-3xl">
              <em>Exploring:</em> {explored.data.currentRole} → {explored.data.targetRole}
            </h2>
            <button type="button" onClick={() => setExplored(null)} className="text-sm font-semibold text-slate-500 hover:text-ink-950">
              Clear
            </button>
          </div>
          <TransitionView analysis={explored.data} source={explored.source} progress={progress} actions={pathActions(explored, !same(goalTarget, explored.target))} />
          {!progress && <p className="mt-3 text-sm text-slate-500">Start your learning path first — you can then add these transition modules to it.</p>}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── Explorer ─────────────────────────────

function Explorer({ input, setInput, error, status, pending, currentRole, onRun, exclude }: {
  input: string;
  setInput: (v: string) => void;
  error: string | null;
  status: 'idle' | 'loading' | 'error';
  pending: string;
  currentRole: string;
  onRun: (target: string) => void;
  exclude?: string;
}) {
  const messages = useMemo(
    () => [`Comparing ${currentRole} skills with ${pending || 'target'} roles…`, 'Identifying your transferable strengths…', `Mapping the AI competencies ${pending || 'the role'} needs…`, 'Designing your personalised pathway…'],
    [currentRole, pending],
  );
  if (status === 'loading') return <LoadingState variant="ai" title={`Analysing ${pending}`} messages={messages} className="py-8" />;
  if (status === 'error') return <ErrorState title="We couldn’t analyse that transition" message="Please try again in a moment." onRetry={() => onRun(pending || input)} />;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TARGET_CAREERS.filter((t) => !same(t.label, exclude)).map((t) => (
          <Chip
            key={t.id}
            selected={same(input, t.label)}
            icon={<Icon name={t.icon} className="h-4 w-4" />}
            onClick={() => {
              setInput(t.label);
              onRun(t.label);
            }}
            className="text-[13px]"
          >
            {t.label}
          </Chip>
        ))}
      </div>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          onRun(input);
        }}
      >
        <label className="relative flex-1">
          <span className="sr-only">Target role or field</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={input}
            maxLength={60}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or type any role, e.g. Supply Chain Analyst"
            className="h-11 w-full rounded-xl border border-ink-950/20 bg-paper pl-10 pr-4 text-[15px] text-ink-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-ink-950 focus:ring-4 focus:ring-lilac-200"
          />
        </label>
        <Button type="submit" iconRight={<ArrowRight className="h-4 w-4" />}>
          Analyse transition
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-clay-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
