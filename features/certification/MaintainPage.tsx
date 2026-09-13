import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  Building2,
  CalendarClock,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Compass,
  Crown,
  GraduationCap,
  Plus,
  RefreshCw,
  Rocket,
  Route,
  ShieldCheck,
  Target,
  TrendingUp,
  TriangleAlert,
  UserCog,
} from 'lucide-react';
import type { ActivityLogEntry, AISource, CareerObjective, DomainId, EmployeeProfile, EmployerCompetency, PathItem } from '../../types';
import { useApp } from '../../services/store';
import { AIDisclaimer, AISourceBadge, Badge, Button, Card, CardTitle, Chip, EmptyState, Icon, LoadingState, OptionCard, PageHeader, ProgressBar, useToast } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { CERT_TYPE_META, checkEmployerCompetencies, LEVEL_META } from '../../lib/certification';
import type { CompetencyCheck } from '../../lib/certification';
import { emptyModuleProgress } from '../../lib/progress';
import { objectiveLabel } from '../../lib/aiContext';
import { SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { getDomain, getModule, MODULES, moduleTitle, resolveTargetDomain, TARGET_CAREERS } from '../../data/catalog';
import type { ModuleMeta } from '../../types';
import { skillName } from '../../data/skills';
import { cn, formatDate, nowISO } from '../../lib/utils';
import { ASSESSMENT_RENEWAL_DAYS, assessFreshness, buildTimeline, recommendMaintenance, REC_KIND_LABEL } from './cert-maintenance';
import type { Freshness, FreshnessReport, MaintenanceRec, RecKind, TimelineEvent } from './cert-maintenance';
import { tint } from './cert-utils';
import { Reveal } from '../../components/motion';
import { GrowthPath } from '../../components/illustrations';

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function MaintainPage() {
  const { profile, latestAssessment, assessments, progress, certificates, submissions, results, organisation, saveProgress } = useApp();
  const toast = useToast();

  const freshness = useMemo(() => assessFreshness({ latestAssessment, progress, certificates, submissions, results }), [latestAssessment, progress, certificates, submissions, results]);
  const timeline = useMemo(() => buildTimeline({ assessments, results, certificates }), [assessments, results, certificates]);
  const inPath = useMemo(() => new Set((progress?.path ?? []).map((p) => p.moduleId)), [progress]);

  // ── Recommendations (Gemini with deterministic fallback) ──
  const [recs, setRecs] = useState<{ items: MaintenanceRec[]; source: AISource; error?: string } | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const recReq = useRef(0);
  const latest = useRef({ profile, latestAssessment, progress });
  latest.current = { profile, latestAssessment, progress };

  const loadRecs = useCallback(async (profileOverride?: EmployeeProfile) => {
    const { profile: p, latestAssessment: a, progress: pr } = latest.current;
    if (!pr) return;
    const req = ++recReq.current;
    setRecLoading(true);
    try {
      const res = await recommendMaintenance({ profile: profileOverride ?? p, assessment: a, progress: pr });
      if (req === recReq.current) setRecs(res);
    } catch (e) {
      console.warn('[ZimAI] maintenance recommendations failed', e);
      if (req === recReq.current) setRecs({ items: [], source: 'engine', error: 'We could not load recommendations right now.' });
    } finally {
      if (req === recReq.current) setRecLoading(false);
    }
  }, []);

  const hasProgress = Boolean(progress);
  useEffect(() => {
    if (hasProgress) loadRecs();
  }, [hasProgress, loadRecs]);

  // ── Add a module to the learning path ──
  const [adding, setAdding] = useState<string | null>(null);
  const addToPath = async (moduleId: string, reason: string) => {
    const m = getModule(moduleId);
    if (!progress || !m) return;
    setAdding(moduleId);
    try {
      await saveProgress((prev) => {
        const base = prev ?? progress;
        if (base.path.some((p) => p.moduleId === moduleId)) return base;
        const item: PathItem = { moduleId, priority: base.path.length + 1, reason, required: false, addedBy: 'maintenance', addedAt: nowISO() };
        const entry: ActivityLogEntry = { at: nowISO(), type: 'path', label: `Added to learning path: ${moduleTitle(m, base.domainId)}` };
        return {
          ...base,
          path: [...base.path, item],
          modules: base.modules[moduleId] ? base.modules : { ...base.modules, [moduleId]: emptyModuleProgress(moduleId) },
          activity: [entry, ...base.activity].slice(0, 50),
        };
      });
      toast.success('Added to your learning path', moduleTitle(m, progress.domainId));
    } catch (e) {
      console.warn('[ZimAI] add to path failed', e);
      toast.error('Could not update your learning path', 'Please try again.');
    } finally {
      setAdding(null);
    }
  };

  // ── Triggers ──
  const [open, setOpen] = useState<'goals' | 'competencies' | null>(null);
  const reqs: EmployerCompetency[] = organisation?.requiredCompetencies ?? [];
  const checks = useMemo(() => checkEmployerCompetencies(progress?.skillLevels ?? {}, organisation?.requiredCompetencies ?? []), [progress, organisation]);
  const unmet = checks.filter((c) => !c.met);

  if (!profile && !progress) {
    return (
      <div>
        <PageHeader eyebrow="Continuous readiness" title={<>Maintain my AI <em>readiness</em></>} />
        <EmptyState
          icon={<RefreshCw className="h-6 w-6" />}
          title="Start with your AI readiness assessment"
          description="Take the readiness assessment to begin."
          action={<Button to="/onboarding">Start my readiness assessment</Button>}
        />
      </div>
    );
  }

  const competencyText = !organisation
    ? "You're not linked to an employer yet. When your employer defines required AI competencies, any gaps will appear here."
    : !reqs.length
      ? `${organisation.name} hasn't defined required AI competencies yet. They will appear here when it does.`
      : unmet.length
        ? `${organisation.name} requires ${reqs.length} AI competencies — you currently meet ${reqs.length - unmet.length}.`
        : `You meet all ${reqs.length} AI competencies required by ${organisation.name}.`;

  const toggle = (id: 'goals' | 'competencies') => setOpen((o) => (o === id ? null : id));

  return (
    <div>
      <PageHeader
        eyebrow="Continuous readiness"
        title={<>Maintain my AI <em>readiness</em></>}
        description="AI readiness isn’t permanent — keep it current."
        actions={
          <>
            <GrowthPath animated className="pointer-events-none -my-6 mr-2 hidden h-28 w-28 animate-ghost-in lg:block" />
            <Button to="/app/reassess" icon={<RefreshCw className="h-4 w-4" />}>
              Refresh my readiness
            </Button>
          </>
        }
      />

      <Reveal>
        <FreshnessPanel report={freshness} />
      </Reveal>

      {/* What's changed? */}
      <Reveal as="section" delay={80} className="mt-14 sm:mt-20">
        <h2 className="text-3xl leading-tight text-ink-950 sm:text-4xl">What's <em>changed?</em></h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <TriggerCard
            icon={<Target className="h-5 w-5" />}
            title="My goals have changed"
            text={`Current goal: ${objectiveLabel(profile?.careerObjective)}${profile?.targetCareer ? ` (${profile.targetCareer})` : ''}. Update it and your recommendations adapt instantly.`}
            className={open === 'goals' ? 'md:col-span-2' : undefined}
            action={
              profile ? (
                <Button size="sm" variant={open === 'goals' ? 'secondary' : 'outline'} onClick={() => toggle('goals')} iconRight={<ChevronDown className={cn('h-4 w-4 transition-transform', open === 'goals' && 'rotate-180')} />}>
                  {open === 'goals' ? 'Close' : 'Update my goals'}
                </Button>
              ) : (
                <Button size="sm" variant="outline" to="/onboarding">
                  Complete onboarding
                </Button>
              )
            }
          >
            {open === 'goals' && profile && (
              <GoalsEditor
                profile={profile}
                onCancel={() => setOpen(null)}
                onSaved={(next) => {
                  setOpen(null);
                  loadRecs(next);
                }}
              />
            )}
          </TriggerCard>

          <TriggerCard
            icon={<UserCog className="h-5 w-5" />}
            title="My role has changed"
            text="New job title, department or responsibilities? Retake the readiness onboarding so your pathway reflects your new role."
            action={
              <Button size="sm" variant="outline" to="/onboarding?retake=1" iconRight={<ArrowRight className="h-4 w-4" />}>
                Retake onboarding
              </Button>
            }
          />

          <TriggerCard
            icon={<Route className="h-5 w-5" />}
            title="I'm transitioning careers"
            text="See your transferable skills, the gaps to close and a step-by-step pathway into a new field."
            action={
              <Button size="sm" variant="outline" to="/app/career" iconRight={<ArrowRight className="h-4 w-4" />}>
                Open career transition
              </Button>
            }
          />

          <TriggerCard
            icon={<Building2 className="h-5 w-5" />}
            title="New competencies are required"
            text={competencyText}
            className={open === 'competencies' ? 'md:col-span-2' : undefined}
            action={
              reqs.length ? (
                <Button size="sm" variant={open === 'competencies' ? 'secondary' : 'outline'} onClick={() => toggle('competencies')} iconRight={<ChevronDown className={cn('h-4 w-4 transition-transform', open === 'competencies' && 'rotate-180')} />}>
                  {open === 'competencies' ? 'Hide' : unmet.length ? `Review ${unmet.length} gap${unmet.length === 1 ? '' : 's'}` : 'View competencies'}
                </Button>
              ) : null
            }
          >
            {open === 'competencies' && organisation && (
              <CompetencyGaps
                orgName={organisation.name}
                checks={checks}
                domainId={progress?.domainId ?? profile?.domainId ?? 'operations'}
                inPath={inPath}
                adding={adding}
                canAdd={Boolean(progress)}
                onAdd={addToPath}
              />
            )}
          </TriggerCard>
        </div>
      </Reveal>

      <div className="mt-14 grid items-start gap-8 sm:mt-20 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Recommended new learning */}
        <Reveal>
        <Card className="rounded-4xl p-6 sm:p-8">
          <CardTitle
            icon={<GraduationCap className="h-5 w-5" />}
            title="Recommended new learning"
            action={
              <div className="flex items-center gap-1.5">
                {recs && !recLoading && <AISourceBadge source={recs.source} className="hidden sm:inline-flex" />}
                <Button variant="ghost" size="sm" onClick={() => loadRecs()} disabled={recLoading || !progress} aria-label="Refresh recommendations" icon={<RefreshCw className={cn('h-4 w-4', recLoading && 'animate-spin')} />}>
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            }
          />
          {!progress ? (
            <EmptyState
              icon={<GraduationCap className="h-6 w-6" />}
              title="No learning path yet"
              description="Complete your readiness assessment to create a learning path — then we can recommend what to learn next."
              action={<Button to="/onboarding">Start assessment</Button>}
            />
          ) : recLoading || !recs ? (
            <LoadingState
              variant="ai"
              title="Finding your next best modules…"
              messages={['Reviewing your learning path', 'Checking your skill gaps and goals', 'Matching modules from the catalogue']}
            />
          ) : recs.items.length === 0 ? (
            <EmptyState
              icon={<CircleCheck className="h-6 w-6" />}
              title="You're on top of the catalogue"
              description="Every relevant module is already in your learning path. Check back as new modules are added."
            />
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2 sm:hidden">
                <AISourceBadge source={recs.source} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recs.items.map((r) => (
                  <RecCard key={r.moduleId} rec={r} domainId={progress.domainId} added={inPath.has(r.moduleId)} adding={adding === r.moduleId} onAdd={() => addToPath(r.moduleId, r.reason)} />
                ))}
              </div>
              {recs.error && <p className="mt-3 text-xs text-slate-500">{recs.error}</p>}
              <AIDisclaimer compact className="mt-4" />
            </>
          )}
        </Card>
        </Reveal>

        <Reveal delay={100} className="space-y-6">
          <div className="relative overflow-hidden rounded-4xl bg-brand-800 p-7 text-canvas sm:p-8">
            <div className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400 text-ink-950">
                <RefreshCw className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-3xl font-medium leading-tight">Refresh my <em>readiness</em></h3>
              <p className="mt-1 text-sm leading-relaxed text-canvas/75">
                {latestAssessment ? `Last taken ${formatDate(latestAssessment.createdAt)}.` : 'Measure your improvement.'}
              </p>
              <Button to="/app/reassess" variant="gold" full className="mt-5" iconRight={<ArrowRight className="h-4 w-4" />}>
                Refresh my readiness
              </Button>
            </div>
          </div>
          <TimelineCard events={timeline} />
        </Reveal>
      </div>
    </div>
  );
}

// ───────────────────────── Freshness ─────────────────────────

const FRESH_META: Record<Freshness, { label: string; icon: ReactNode; cls: string; text: string }> = {
  fresh: {
    label: 'Fresh',
    icon: <ShieldCheck className="h-6 w-6" />,
    cls: 'bg-brand-800 text-canvas',
    text: 'Your readiness evidence is current. Keep practising to stay ahead as AI tools evolve.',
  },
  review: {
    label: 'Review soon',
    icon: <Clock className="h-6 w-6" />,
    cls: 'bg-gold-400 text-ink-950',
    text: 'Some of your readiness evidence is ageing. A little learning now keeps you current.',
  },
  renewal: {
    label: 'Renewal due',
    icon: <TriangleAlert className="h-6 w-6" />,
    cls: 'bg-clay-400 text-ink-950',
    text: 'Part of your AI readiness needs renewing. Refresh your assessment or certificate to stay verifiably AI ready.',
  },
};

const freshTone = (v: number): 'brand' | 'gold' | 'clay' => (v > 50 ? 'brand' : v > 20 ? 'gold' : 'clay');
const ago = (d: number | null, none: string) => (d == null ? none : d === 0 ? 'Today' : `${d} day${d === 1 ? '' : 's'} ago`);

function FreshnessPanel({ report }: { report: FreshnessReport }) {
  const m = FRESH_META[report.status];
  const nearest = report.countdowns.find((c) => c.state === 'valid');
  const tiles = [
    {
      icon: <ClipboardCheck className="h-4 w-4" />,
      label: 'Last readiness assessment',
      value: ago(report.daysSinceAssessment, 'Not yet taken'),
      fresh: report.daysSinceAssessment == null ? 0 : 100 - (report.daysSinceAssessment / ASSESSMENT_RENEWAL_DAYS) * 100,
      hint: 'Reassess at least every 6 months',
    },
    {
      icon: <Award className="h-4 w-4" />,
      label: 'Certificate validity',
      value: nearest ? `${nearest.daysLeft} days left` : report.countdowns.length ? 'Expired' : 'No certificate yet',
      fresh: nearest ? nearest.percentRemaining : 0,
      hint: 'Certificates are valid for 12 months',
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: 'Last learning activity',
      value: ago(report.daysSinceActivity, 'None yet'),
      fresh: report.daysSinceActivity == null ? 0 : 100 - (report.daysSinceActivity / 30) * 100,
      hint: 'Aim to practise every week',
    },
  ];

  return (
    <Card padded={false} className="overflow-hidden rounded-4xl">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className={cn('relative overflow-hidden p-7 sm:p-8', m.cls)}>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Readiness freshness</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/20 ring-1 ring-current/30">{m.icon}</span>
              <p className="font-condensed text-5xl uppercase leading-none tracking-wide">{m.label}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed opacity-90">{m.text}</p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-2xl border border-ink-950/5 bg-sand-100 p-5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  {t.icon}
                  {t.label}
                </p>
                <p className="mt-2 font-display text-3xl font-medium leading-tight text-ink-950">{t.value}</p>
                <ProgressBar value={Math.max(0, t.fresh)} tone={freshTone(t.fresh)} size="xs" className="mt-2" />
                <p className="mt-1.5 text-[11px] text-slate-500">{t.hint}</p>
              </div>
            ))}
          </div>

          <ul className="mt-6 space-y-1.5">
            {report.reasons.length ? (
              report.reasons.map((r) => (
                <li key={r.text} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', r.level === 'renewal' ? 'bg-clay-500' : 'bg-gold-400')} />
                  {r.text}
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Everything is current — keep learning to stay ahead.
              </li>
            )}
          </ul>

          {report.countdowns.length > 0 && (
            <div className="mt-5 border-t border-ink-950/10 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Certificate expiry</p>
              <ul className="mt-2 space-y-3">
                {report.countdowns.map(({ cert, daysLeft, state, percentRemaining }) => (
                  <li key={cert.id}>
                    <Link to={`/app/certificates/${cert.id}`} className="group block">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-semibold text-ink-900 group-hover:text-brand-800">
                          <span style={{ color: LEVEL_META[cert.level].color }}>{LEVEL_META[cert.level].label}</span> · {CERT_TYPE_META[cert.type].label} · {cert.domainName}
                        </span>
                        <span className={cn('shrink-0 text-xs font-semibold', state !== 'valid' ? 'text-clay-700' : daysLeft <= 60 ? 'text-gold-700' : 'text-slate-500')}>
                          {state === 'valid' ? `${daysLeft} days · ${formatDate(cert.expiryDate)}` : state === 'expired' ? `Expired ${formatDate(cert.expiryDate)}` : 'Revoked'}
                        </span>
                      </div>
                      <ProgressBar value={state === 'valid' ? percentRemaining : 0} tone={freshTone(percentRemaining)} size="xs" className="mt-1.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ───────────────────────── Triggers ─────────────────────────

function TriggerCard({ icon, title, text, action, children, className }: { icon: ReactNode; title: string; text: string; action?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <Card className={cn('flex flex-col rounded-3xl p-6 transition duration-300 hover:border-ink-950/30 hover:shadow-ink-sm sm:p-7', className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-950/10 bg-lilac-100 text-ink-900">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-medium leading-tight text-ink-950">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
        </div>
      </div>
      {action && <div className="mt-4 sm:pl-14">{action}</div>}
      {children}
    </Card>
  );
}

const OBJECTIVES: { id: CareerObjective; icon: ReactNode; description: string }[] = [
  { id: 'better-current-job', icon: <TrendingUp className="h-5 w-5" />, description: 'Work faster and smarter in my current role' },
  { id: 'ai-ready-current', icon: <ShieldCheck className="h-5 w-5" />, description: 'Certify AI competency in my profession' },
  { id: 'prepare-changes', icon: <Compass className="h-5 w-5" />, description: 'Stay ahead as AI reshapes my role' },
  { id: 'transition', icon: <Route className="h-5 w-5" />, description: 'Move into a new field with a guided pathway' },
  { id: 'leadership', icon: <Crown className="h-5 w-5" />, description: 'Lead people and decisions in an AI-enabled workplace' },
  { id: 'advanced-ai', icon: <Rocket className="h-5 w-5" />, description: 'Go deeper into analytics, automation and AI tools' },
];

function GoalsEditor({ profile, onSaved, onCancel }: { profile: EmployeeProfile; onSaved: (next: EmployeeProfile) => void; onCancel: () => void }) {
  const { saveProfile, saveProgress, progress } = useApp();
  const toast = useToast();
  const [objective, setObjective] = useState<CareerObjective>(profile.careerObjective);
  const [target, setTarget] = useState(profile.targetCareer ?? '');
  const [saving, setSaving] = useState(false);

  const trimmed = target.trim();
  const targetDomain = objective === 'transition' ? resolveTargetDomain(trimmed) : undefined;
  const changed = objective !== profile.careerObjective || (objective === 'transition' && trimmed !== (profile.targetCareer ?? ''));
  const valid = objective !== 'transition' || trimmed.length >= 2;

  const save = async () => {
    setSaving(true);
    try {
      const next: EmployeeProfile = { ...profile, careerObjective: objective, updatedAt: nowISO() };
      if (objective === 'transition') {
        next.targetCareer = trimmed;
        if (targetDomain) next.targetDomainId = targetDomain;
        else delete next.targetDomainId;
      } else {
        delete next.targetCareer;
        delete next.targetDomainId;
      }
      await saveProfile(next);
      if (progress) {
        const entry: ActivityLogEntry = { at: nowISO(), type: 'path', label: `Career goal updated: ${objectiveLabel(objective)}${objective === 'transition' ? ` (${trimmed})` : ''}` };
        await saveProgress((prev) => {
          const base = prev ?? progress;
          return { ...base, activity: [entry, ...base.activity].slice(0, 50) };
        });
      }
      toast.success('Goals updated', 'Your learning recommendations are being refreshed.');
      onSaved(next);
    } catch (e) {
      console.warn('[ZimAI] save goals failed', e);
      toast.error('Could not save your goals', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5 animate-fade-in border-t border-ink-950/10 pt-5">
      <p className="text-sm font-bold text-ink-950">What is your main goal now?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {OBJECTIVES.map((o) => (
          <OptionCard key={o.id} compact selected={objective === o.id} onClick={() => setObjective(o.id)} icon={o.icon} label={objectiveLabel(o.id)} description={o.description} />
        ))}
      </div>

      {objective === 'transition' && (
        <div className="mt-5 rounded-2xl bg-sand-100 p-4">
          <p className="text-sm font-bold text-ink-950">Which career are you moving towards?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TARGET_CAREERS.map((c) => (
              <Chip key={c.id} selected={trimmed.toLowerCase() === c.label.toLowerCase()} onClick={() => setTarget(c.label)} icon={<Icon name={c.icon} className="h-4 w-4" />}>
                {c.label}
              </Chip>
            ))}
          </div>
          <label htmlFor="target-career" className="mt-4 block text-xs font-semibold text-slate-500">
            Or type another career
          </label>
          <input
            id="target-career"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. Supply Chain Analyst"
            maxLength={60}
            className="mt-1.5 h-11 w-full rounded-xl border border-ink-950/15 bg-paper px-3.5 text-[15px] text-ink-950 outline-none transition focus:border-ink-950 focus:ring-2 focus:ring-lilac-200"
          />
          <p className="mt-2 text-xs text-slate-500">
            {trimmed ? (
              targetDomain ? (
                <>
                  Learning domain: <strong className="text-ink-900">{getDomain(targetDomain)?.name}</strong>
                </>
              ) : (
                "We couldn't match this to a learning domain — recommendations will build on your current domain."
              )
            ) : (
              'Choose a career above or type your own.'
            )}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={save} loading={saving} disabled={!changed || !valid} icon={<CircleCheck className="h-4 w-4" />}>
          Save &amp; refresh recommendations
        </Button>
      </div>
    </div>
  );
}

const PRIORITY_RANK: Record<EmployerCompetency['priority'], number> = { critical: 0, important: 1, desirable: 2 };
const PRIORITY_TONE: Record<EmployerCompetency['priority'], Tone> = { critical: 'clay', important: 'gold', desirable: 'neutral' };
const LEVEL_RANK: Record<ModuleMeta['level'], number> = { foundation: 0, intermediate: 1, advanced: 2 };

function CompetencyGaps({ orgName, checks, domainId, inPath, adding, canAdd, onAdd }: {
  orgName: string;
  checks: CompetencyCheck[];
  domainId: DomainId;
  inPath: Set<string>;
  adding: string | null;
  canAdd: boolean;
  onAdd: (moduleId: string, reason: string) => void;
}) {
  const unmet = checks.filter((c) => !c.met).sort((a, b) => PRIORITY_RANK[a.competency.priority] - PRIORITY_RANK[b.competency.priority]);
  if (!unmet.length) {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-brand-800/15 bg-brand-50 p-4 text-sm font-medium text-brand-800">
        <CircleCheck className="h-5 w-5 shrink-0 text-brand-600" /> You meet every AI competency {orgName} requires.
      </div>
    );
  }
  const rank = (m: ModuleMeta) => (m.domainId === domainId ? 0 : m.kind === 'core' ? 10 : 20) + (m.kind === 'challenge' && m.domainId !== domainId ? 5 : 0) + LEVEL_RANK[m.level];
  return (
    <div className="mt-5 space-y-3 border-t border-ink-950/10 pt-5">
      {unmet.map(({ competency: c, actual }) => {
        const mods = MODULES.filter((m) => m.skillIds.some((s) => c.skillIds.includes(s)))
          .sort((a, b) => rank(a) - rank(b))
          .slice(0, 3);
        return (
          <div key={c.id} className="rounded-2xl border border-ink-950/10 bg-paper p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-ink-950">{c.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">{c.description}</p>
              </div>
              <Badge tone={PRIORITY_TONE[c.priority]}>{capitalise(c.priority)}</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Your level: <strong className="text-ink-900">{SKILL_LEVEL_LABELS[actual]}</strong> · Required: <strong className="text-ink-900">{SKILL_LEVEL_LABELS[c.requiredLevel]}</strong> · Measured by{' '}
              {c.skillIds.map(skillName).join(', ')}
            </p>
            {mods.length > 0 && (
              <ul className="mt-3 divide-y divide-ink-950/5 rounded-xl bg-sand-100">
                {mods.map((m) => {
                  const added = inPath.has(m.id);
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink-900">
                        <Icon name={m.icon} className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{moduleTitle(m, domainId)}</span>
                      </span>
                      {added ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700">
                          <CircleCheck className="h-4 w-4" /> In path
                        </span>
                      ) : (
                        <Button size="sm" variant="outline" disabled={!canAdd} loading={adding === m.id} onClick={() => onAdd(m.id, `Required by ${orgName}: ${c.name}`)} icon={<Plus className="h-4 w-4" />}>
                          Add
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────── Recommendations ─────────────────────────

const KIND_TONE: Record<RecKind, Tone> = { advanced: 'violet', domain: 'brand', target: 'violet', responsible: 'gold', adjacent: 'neutral', core: 'brand' };

function RecCard({ rec, domainId, added, adding, onAdd }: { rec: MaintenanceRec; domainId: DomainId; added: boolean; adding: boolean; onAdd: () => void }) {
  const m = getModule(rec.moduleId);
  if (!m) return null;
  const d = m.domainId ? getDomain(m.domainId) : undefined;
  const color = d?.color ?? '#034f46';
  return (
    <div className={cn('flex flex-col rounded-2xl border p-5 transition duration-300', added ? 'border-brand-800/15 bg-brand-50/60' : 'border-ink-950/10 bg-paper hover:border-ink-950/40 hover:shadow-ink-sm')}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: tint(color, 0.1), color }}>
          <Icon name={m.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <Badge tone={KIND_TONE[rec.kind]}>{REC_KIND_LABEL[rec.kind]}</Badge>
          <p className="mt-1.5 font-display text-lg font-medium leading-snug text-ink-950">{moduleTitle(m, domainId)}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {d ? d.name : 'Core · all professions'} · {capitalise(m.level)} · {m.estimatedMinutes} min
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{rec.reason}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        {added ? (
          <>
            <Button size="sm" variant="secondary" disabled icon={<CircleCheck className="h-4 w-4" />}>
              Added to your path
            </Button>
            <Link to={`/app/learning/${m.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-800 hover:underline">
              Open <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <Button size="sm" onClick={onAdd} loading={adding} icon={<Plus className="h-4 w-4" />}>
            Add to my path
          </Button>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Timeline ─────────────────────────

const TONE_HEX: Record<TimelineEvent['tone'], string> = { brand: '#1b8f78', gold: '#ffa946', clay: '#ff6c4c', sky: '#4fbf8e', ink: '#a3a390' };

function TimelineCard({ events }: { events: TimelineEvent[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? events : events.slice(0, 7);
  return (
    <Card className="rounded-3xl">
      <CardTitle icon={<CalendarClock className="h-5 w-5" />} title="Readiness timeline" />
      {events.length ? (
        <>
          <ol className="relative ml-2 space-y-4 border-l-2 border-ink-950/10 pl-5">
            {shown.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[28px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-paper" style={{ background: TONE_HEX[e.tone], opacity: e.future ? 0.55 : 1 }} />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold text-ink-950">
                    {e.to ? (
                      <Link to={e.to} className="hover:text-brand-800">
                        {e.title}
                      </Link>
                    ) : (
                      e.title
                    )}
                  </p>
                  {e.future && <Badge tone="gold">Upcoming</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatDate(e.at)} · <span className={e.kind === 'expiry' ? 'font-mono' : undefined}>{e.detail}</span>
                </p>
              </li>
            ))}
          </ol>
          {events.length > 7 && (
            <button onClick={() => setAll((a) => !a)} className="mt-4 text-sm font-semibold text-brand-800 hover:underline">
              {all ? 'Show less' : `Show all ${events.length} events`}
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">Your assessments and certificates will appear here.</p>
      )}
    </Card>
  );
}
