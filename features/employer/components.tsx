import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Award, CheckCircle2, Info, Lightbulb, Lock, RefreshCw, Route, Sparkles, UserPlus, XCircle } from 'lucide-react';
import type { Organisation, WorkforceMember, WorkforceStatus } from '../../types';
import {
  AIDisclaimer, AISourceBadge, Avatar, Badge, Button, Card, CardTitle, EmptyState, ErrorState, LoadingState, Modal, ProgressBar, RichText, Skeleton, useToast,
} from '../../components/ui';
import { CERT_TYPE_META, LEVEL_META } from '../../lib/certification';
import { exposureLabel, LEVEL_COLORS, readinessLevel, SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS, WORKFORCE_STATUS_META } from '../../lib/readiness';
import { cn, timeAgo } from '../../lib/utils';
import { skillName } from '../../data/skills';
import { generateText } from '../../services/gemini';
import type { AISource } from '../../types';
import { memberChecks, recommendedActions, requiredLevelFor } from './analytics';
import { PRIORITY_META } from './competencyTemplates';
import { generateInsights, insightsCacheKey, readCachedInsights, writeCachedInsights } from './aiInsights';
import type { InsightFocus, InsightsResult } from './aiInsights';
import type { WorkforceState } from './useWorkforce';
import { isEmployerReadyEligible } from '../../lib/certification';

// ───────────────────────── Colours & small badges ─────────────────────────

export const readinessHex = (v: number) => LEVEL_COLORS[readinessLevel(v)].hex;

export function StatusBadge({ status, className }: { status: WorkforceStatus; className?: string }) {
  const m = WORKFORCE_STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', m.bg, m.text, className)}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.hex }} aria-hidden />
      {m.label}
    </span>
  );
}

export function CertBadge({ certification, compact }: { certification: WorkforceMember['certification']; compact?: boolean }) {
  if (!certification) return <span className="text-xs text-slate-400">{compact ? '—' : 'Not certified'}</span>;
  const level = LEVEL_META[certification.level];
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold" style={{ color: level.color }}>
      <Award className="h-3.5 w-3.5" aria-hidden />
      {certification.type === 'employer' ? 'Employer · ' : compact ? '' : 'Domain · '}
      {level.label}
    </span>
  );
}

export function ReadinessCell({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex min-w-[96px] items-center gap-2', className)}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: readinessHex(value) }} />
      </div>
      <span className="text-sm font-bold tabular-nums text-ink-950">{value}%</span>
    </div>
  );
}

/** Executive KPI tile. */
export function KpiTile({ label, value, sub, accent, icon, className, children }: { label: ReactNode; value: ReactNode; sub?: ReactNode; accent?: string; icon?: ReactNode; className?: string; children?: ReactNode }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5', className)}>
      {accent && <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <p className="mt-1.5 text-[28px] font-extrabold leading-none tracking-tight text-ink-950 tabular-nums sm:text-[32px]">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
      {children}
    </div>
  );
}

export function PrivacyNote({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500', className)}>
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        Employers see only name, department, role and AI readiness indicators. Assessment answers, tutor conversations and other personal details stay private to each employee.
      </span>
    </p>
  );
}

// ───────────────────────── Page gate & banners ─────────────────────────

export function WorkforceGate({ state, children, loadingTitle = 'Loading workforce intelligence…' }: { state: WorkforceState; children: (members: WorkforceMember[], org: Organisation) => ReactNode; loadingTitle?: string }) {
  const { organisation, members, loading, error, reload } = state;
  if (!organisation)
    return <EmptyState title="Set up your organisation first" description="Complete the employer assessment to unlock workforce intelligence." action={<Button to="/employer/onboarding">Start employer assessment</Button>} />;
  if (loading && !members.length)
    return (
      <div className="space-y-4" aria-busy="true">
        <LoadingState title={loadingTitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  if (error && !members.length) return <ErrorState message={error} onRetry={reload} />;
  if (!members.length)
    return (
      <EmptyState
        icon={<UserPlus className="h-6 w-6" />}
        title="No workforce data yet"
        description="Once employees join ZimAI Ready through your organisation, their readiness will appear here. Re-run the employer assessment to generate a sample workforce."
        action={<Button to="/employer/onboarding?edit=1">Re-run employer assessment</Button>}
      />
    );
  return <>{children(members, organisation)}</>;
}

export function SampleDataBanner({ organisation, className }: { organisation: Organisation; className?: string }) {
  const toast = useToast();
  if (!organisation.isSampleWorkforce) return null;
  return (
    <div className={cn('mb-5 flex flex-col gap-3 rounded-2xl border border-gold-200 bg-gold-50/70 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="flex items-start gap-2 text-gold-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
        <span>
          <strong className="font-semibold">Sample workforce data</strong> — employee invitations coming soon. Figures are generated from your organisation profile to demonstrate the analytics.
        </span>
      </p>
      <Button size="sm" variant="outline" icon={<UserPlus className="h-4 w-4" />} onClick={() => toast.comingSoon('Employee invitations')} className="shrink-0">
        Invite employees
      </Button>
    </div>
  );
}

// ───────────────────────── AI insights card ─────────────────────────

const INSIGHT_META = {
  risk: { icon: <AlertTriangle className="h-4 w-4" />, cls: 'bg-clay-50 text-clay-600', label: 'Risk' },
  opportunity: { icon: <Lightbulb className="h-4 w-4" />, cls: 'bg-brand-50 text-brand-700', label: 'Opportunity' },
  action: { icon: <ArrowRight className="h-4 w-4" />, cls: 'bg-sky-50 text-sky-700', label: 'Action' },
} as const;

export function InsightsCard({ org, members, focus = 'overview', title = 'AI management insights', className }: { org: Organisation; members: WorkforceMember[]; focus?: InsightFocus; title?: string; className?: string }) {
  const key = useMemo(() => insightsCacheKey(org, members, focus), [org, members, focus]);
  const [result, setResult] = useState<{ data: InsightsResult; source: AISource; error?: string } | null>(() => readCachedInsights(key));
  const [loading, setLoading] = useState(false);

  const run = async (force = false) => {
    if (!force) {
      const cached = readCachedInsights(key);
      if (cached) {
        setResult(cached);
        return;
      }
    }
    setLoading(true);
    try {
      const res = await generateInsights(org, members, focus);
      writeCachedInsights(key, res);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <Card className={className}>
      <CardTitle
        icon={<Sparkles className="h-5 w-5" />}
        title={title}
        subtitle="Generated from your live workforce data"
        action={
          <div className="flex items-center gap-2">
            <AISourceBadge source={result?.source} />
            <Button size="sm" variant="ghost" onClick={() => run(true)} disabled={loading} aria-label="Regenerate insights" icon={<RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />}>
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          </div>
        }
      />
      {loading && !result ? (
        <LoadingState variant="ai" title="Analysing your workforce…" messages={['Comparing departments…', 'Checking competency coverage…', 'Prioritising reskilling investment…']} className="py-8" />
      ) : result ? (
        <div className={cn('space-y-4 transition-opacity', loading && 'opacity-60')}>
          <p className="rounded-xl bg-ink-950 px-4 py-3 text-[15px] font-semibold leading-snug text-white">{result.data.headline}</p>
          <ul className="space-y-3">
            {result.data.insights.map((i, idx) => {
              const meta = INSIGHT_META[i.type];
              return (
                <li key={idx} className="flex gap-3 animate-fade-up" style={{ animationDelay: `${idx * 60}ms` }}>
                  <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.cls)} aria-label={meta.label}>
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-950">{i.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{i.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          {result.error && <p className="text-xs text-gold-700">{result.error}</p>}
          <AIDisclaimer compact />
        </div>
      ) : null}
    </Card>
  );
}

// ───────────────────────── Compact member row ─────────────────────────

export function MemberRow({ member, onClick, right }: { member: WorkforceMember; onClick?: () => void; right?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
      <Avatar name={member.name} size={34} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-950">{member.name}</span>
        <span className="block truncate text-xs text-slate-500">
          {member.role} · {member.department}
        </span>
      </span>
      {right ?? <span className="text-sm font-bold tabular-nums text-ink-950">{member.readiness}%</span>}
    </button>
  );
}

// ───────────────────────── Member detail modal ─────────────────────────

export function MemberDetailModal({ member, org, onClose }: { member: WorkforceMember | null; org: Organisation; onClose: () => void }) {
  const toast = useToast();
  const [note, setNote] = useState<{ text: string; source: AISource } | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  useEffect(() => {
    setNote(null);
    setNoteLoading(false);
  }, [member?.id]);
  if (!member) return null;
  const checks = memberChecks(member, org.requiredCompetencies);
  const actions = recommendedActions(member, org);
  const gap = member.exposure - member.readiness;
  const level = readinessLevel(member.readiness);
  const skills = Object.entries(member.skillLevels)
    .map(([id, lvl]) => ({ id, lvl, req: requiredLevelFor(org, id) }))
    .sort((a, b) => a.lvl - a.req - (b.lvl - b.req) || a.id.localeCompare(b.id))
    .slice(0, 12);
  const domainLevel = member.certification?.type === 'domain' ? member.certification.level : null;
  const eligible = isEmployerReadyEligible(domainLevel, checks);

  const generateNote = async () => {
    setNoteLoading(true);
    const fallback = () =>
      `**Development focus for ${member.name.split(' ')[0]}**\n\n${actions.map((a) => `- ${a}`).join('\n')}\n\nReview progress in 30 days and reassess AI readiness next quarter.`;
    const res = await generateText({
      prompt: `Write a short, supportive development note (max 120 words, markdown bullets) for a line manager about one employee.
Role: ${member.role}, ${member.department} department (${org.name}, fictional).
AI readiness ${member.readiness}% (${level}); workplace AI exposure ${member.exposure}%; learning progress ${member.learningProgress}%; status ${WORKFORCE_STATUS_META[member.status].label}.
Unmet employer competencies: ${checks.filter((c) => !c.met).map((c) => `${c.competency.name} (${c.competency.priority})`).join(', ') || 'none'}.
Rule-based recommended actions: ${actions.join(' | ')}.
Focus on practical next steps and coaching. Use responsible language about AI and work.`,
      system: 'You are an AI reskilling coach helping line managers support their teams.',
      temperature: 0.5,
      fallback,
    });
    setNote({ text: res.data, source: res.source });
    setNoteLoading(false);
  };

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      size="lg"
      title={member.name}
      description={`${member.role} · ${member.department}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button icon={<Route className="h-4 w-4" />} onClick={() => toast.comingSoon('Pathway assignment')}>
            Assign pathway
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name={member.name} size={44} />
          <StatusBadge status={member.status} />
          <CertBadge certification={member.certification} />
          <span className="text-xs text-slate-400">Active {timeAgo(member.lastActive)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Readiness</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: readinessHex(member.readiness) }}>
              {member.readiness}%
            </p>
            <p className="text-[11px] text-slate-500">{level}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">AI exposure</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink-950">{member.exposure}%</p>
            <p className="text-[11px] text-slate-500">{exposureLabel(member.exposure)}</p>
          </div>
          <div className={cn('rounded-xl p-3', gap > 15 ? 'bg-clay-50' : 'bg-slate-50')}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Gap</p>
            <p className={cn('mt-1 text-2xl font-extrabold tabular-nums', gap > 15 ? 'text-clay-700' : 'text-ink-950')}>
              {gap > 0 ? '+' : ''}
              {gap}
            </p>
            <p className="text-[11px] text-slate-500">{gap > 0 ? 'exposure ahead' : 'readiness ahead'}</p>
          </div>
        </div>

        <ProgressBar value={member.learningProgress} label="Learning progress" showValue tone="sky" size="sm" />

        <section>
          <h3 className="mb-2 text-sm font-bold text-ink-950">Skill levels</h3>
          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {skills.map((s) => {
              const c = SKILL_LEVEL_COLORS[s.lvl];
              return (
                <li key={s.id} className="flex items-center justify-between gap-3" title={`${skillName(s.id)}: ${SKILL_LEVEL_LABELS[s.lvl]} (required ${SKILL_LEVEL_LABELS[s.req]})`}>
                  <span className="min-w-0 truncate text-[13px] text-slate-700">{skillName(s.id)}</span>
                  <span className="flex shrink-0 items-center gap-1" aria-label={`${SKILL_LEVEL_LABELS[s.lvl]}`}>
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={cn('h-2 w-5 rounded-sm', n <= s.lvl ? '' : 'bg-slate-200', n === s.req && 'ring-1 ring-ink-900/40 ring-offset-1')} style={n <= s.lvl ? { background: c.hex } : undefined} />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] text-slate-400">Outlined segment = level required by {org.name}.</p>
        </section>

        {checks.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-bold text-ink-950">Employer competencies</h3>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {checks.map((c) => (
                <li key={c.competency.id} className="flex items-center gap-3 px-3 py-2.5">
                  {c.met ? <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" aria-label="Met" /> : <XCircle className="h-4 w-4 shrink-0 text-clay-500" aria-label="Not met" />}
                  <span className="min-w-0 flex-1 text-sm text-ink-900">{c.competency.name}</span>
                  <Badge tone={PRIORITY_META[c.competency.priority].tone}>{PRIORITY_META[c.competency.priority].label}</Badge>
                  <span className="w-24 text-right text-xs tabular-nums text-slate-500">
                    {SKILL_LEVEL_LABELS[c.actual]} / {SKILL_LEVEL_LABELS[c.competency.requiredLevel]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              {member.certification?.type === 'employer'
                ? `Holds ${CERT_TYPE_META.employer.label} for ${org.name}.`
                : eligible
                  ? `Eligible for ${CERT_TYPE_META.employer.label} now.`
                  : `${CERT_TYPE_META.employer.label} needs Domain AI Capable or above plus every critical and important competency.`}
            </p>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-bold text-ink-950">Recommended actions</h3>
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a} className="flex gap-2 text-sm text-slate-700">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            {note ? (
              <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-700">AI development note</p>
                  <AISourceBadge source={note.source} />
                </div>
                <RichText text={note.text} className="text-sm" />
                <AIDisclaimer compact className="mt-2" />
              </div>
            ) : noteLoading ? (
              <LoadingState variant="ai" title="Writing a development note…" className="py-6" />
            ) : (
              <Button size="sm" variant="secondary" icon={<Sparkles className="h-4 w-4" />} onClick={generateNote}>
                Generate AI development note
              </Button>
            )}
          </div>
        </section>

        <PrivacyNote />
      </div>
    </Modal>
  );
}
