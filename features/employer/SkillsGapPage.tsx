import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookOpen, Clock, Rocket, ShieldAlert, Sprout, TrendingDown, Users } from 'lucide-react';
import type { Organisation, WorkforceMember } from '../../types';
import { Badge, Button, Card, CardTitle, EmptyState, PageHeader, Tabs, useToast } from '../../components/ui';
import { SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { cn } from '../../lib/utils';
import { useWorkforce } from './useWorkforce';
import {
  advancedReady, competencyCoverage, competencyHeatmap, departmentsNeedingAttention, emergingSkills, mostVulnerableSkills, reskillingCandidates, reskillingPlan,
} from './analytics';
import { Heatmap, HorizontalBarList } from './charts';
import { CertBadge, InsightsCard, KpiTile, MemberDetailModal, MemberRow, SampleDataBanner, WorkforceGate } from './components';
import { PRIORITY_META } from './competencyTemplates';

export default function SkillsGapPage() {
  const state = useWorkforce();
  return <WorkforceGate state={state}>{(members, org) => <SkillsGap org={org} members={members} />}</WorkforceGate>;
}

const HORIZON_TONE = { Immediate: 'clay', 'Next quarter': 'gold', Sustain: 'brand' } as const;

function SkillsGap({ org, members }: { org: Organisation; members: WorkforceMember[] }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [selected, setSelected] = useState<WorkforceMember | null>(null);
  const vulnerable = useMemo(() => mostVulnerableSkills(members, org, 6), [members, org]);
  const emerging = useMemo(() => emergingSkills(members, org, 5), [members, org]);
  const attention = useMemo(() => departmentsNeedingAttention(members, org, 4), [members, org]);
  const candidates = useMemo(() => reskillingCandidates(members), [members]);
  const advanced = useMemo(() => advancedReady(members), [members]);
  const heat = useMemo(() => competencyHeatmap(members, org), [members, org]);
  const coverage = useMemo(() => competencyCoverage(members, org.requiredCompetencies), [members, org]);
  const plans = useMemo(() => reskillingPlan(members, org).sort((a, b) => ['Immediate', 'Next quarter', 'Sustain'].indexOf(a.horizon) - ['Immediate', 'Next quarter', 'Sustain'].indexOf(b.horizon)), [members, org]);
  const [planDept, setPlanDept] = useState(plans[0]?.department ?? '');
  const plan = plans.find((p) => p.department === planDept) ?? plans[0];
  const critical = coverage.filter((c) => c.competency.priority === 'critical');
  const criticalAvg = critical.length ? Math.round(critical.reduce((a, c) => a + c.pct, 0) / critical.length) : null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={org.name}
        title="Skills-gap intelligence"
        description="Which skills are vulnerable, which are emerging, which departments need attention — and a targeted reskilling plan for each."
        actions={
          <Button to="/employer/advisor" variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
            Ask the Advisor
          </Button>
        }
      />
      <SampleDataBanner organisation={org} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Critical competency coverage" value={criticalAvg != null ? `${criticalAvg}%` : '—'} sub="Average share meeting critical competencies" accent="#e8590c" />
        <KpiTile label="Most vulnerable skill" value={<span className="text-lg sm:text-xl">{vulnerable[0]?.name ?? '—'}</span>} sub={vulnerable[0] ? `${vulnerable[0].belowPct}% below required level` : undefined} accent="#e0a400" />
        <KpiTile label="Require reskilling" value={candidates.length} sub="High AI exposure, low readiness" accent="#e8590c" />
        <KpiTile label="Ready for advanced AI" value={advanced.length} sub="Readiness ≥ 80% and certified" accent="#0a8a5f" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle icon={<TrendingDown className="h-5 w-5" />} title="Most vulnerable skills" subtitle="Share of employees below the level your organisation requires" />
          {vulnerable.length ? (
            <HorizontalBarList
              labelWidth="11rem"
              items={vulnerable.map((s) => ({
                id: s.skillId,
                label: s.name,
                value: s.belowPct,
                color: s.source === 'critical' ? '#e8590c' : s.source === 'important' ? '#e0a400' : '#94a3b8',
                sublabel: `${s.competencies[0] ?? (s.source === 'desired' ? 'Management priority' : 'Core AI skill')} · needs ${SKILL_LEVEL_LABELS[s.required]}`,
              }))}
              onSelect={(it) => navigate(`/employer/workforce?skill=${encodeURIComponent(it.id!)}`)}
              ariaLabel="Share of employees below the required level per skill"
            />
          ) : (
            <p className="text-sm text-slate-500">No skills are below the required level. Excellent.</p>
          )}
          <p className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#e8590c]" />Critical competency</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#e0a400]" />Important competency</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-slate-400" />Other</span>
          </p>
        </Card>
        <Card>
          <CardTitle icon={<Sprout className="h-5 w-5" />} title="Emerging skills" subtitle="Needed for AI transformation or prioritised by management — low coverage today" />
          {emerging.length ? (
            <ul className="space-y-3">
              {emerging.map((s) => (
                <li key={s.skillId} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink-950">{s.name}</p>
                    <span className="text-sm font-bold tabular-nums text-ink-950">{s.coveragePct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${s.coveragePct}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {s.reason} · % competent or above
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Emerging skills are already well covered.</p>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Organisation-wide competency gaps"
          subtitle="Share of each department meeting your employer-defined competencies"
          action={
            <Button size="sm" variant="ghost" to="/employer/competencies" iconRight={<ArrowRight className="h-4 w-4" />}>
              Edit
            </Button>
          }
        />
        {heat.cols.length ? (
          <Heatmap
            rows={heat.rows.map((r) => ({ id: r.id, label: r.label, sub: `${r.count} employees` }))}
            cols={heat.cols.map((c) => ({ id: c.id, label: c.label, sub: PRIORITY_META[c.priority].label }))}
            values={heat.values}
            onCellClick={(ri) => navigate(`/employer/workforce?department=${encodeURIComponent(heat.rows[ri].id)}`)}
            describe={(ri, ci, v) => `${heat.rows[ri].label}: ${v}% meet ${heat.cols[ci].label}`}
          />
        ) : (
          <EmptyState title="No employer competencies defined" description="Define what AI readiness means for your organisation to see competency gaps." action={<Button to="/employer/competencies">Define competencies</Button>} />
        )}
      </Card>

      <Card className="mt-4">
        <CardTitle icon={<AlertTriangle className="h-5 w-5" />} title="Departments requiring attention" subtitle="Ranked by exposure gap, low competency, priority reskilling and transformation plans" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {attention.map((a) => (
            <button
              key={a.stat.department}
              type="button"
              onClick={() => navigate(`/employer/workforce?department=${encodeURIComponent(a.stat.department)}`)}
              className={cn('rounded-2xl border p-4 text-left transition hover:shadow-lift', a.severity === 'high' ? 'border-clay-200 bg-clay-50/50' : a.severity === 'medium' ? 'border-gold-200 bg-gold-50/40' : 'border-slate-200 bg-white')}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-ink-950">{a.stat.department}</p>
                <Badge tone={a.severity === 'high' ? 'clay' : a.severity === 'medium' ? 'gold' : 'neutral'}>{a.severity}</Badge>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-ink-950">
                {a.stat.readiness}% <span className="text-sm font-semibold text-slate-400">vs {a.stat.exposure}% exposure</span>
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-snug text-slate-600">
                {a.reasons.slice(0, 3).map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle
            icon={<Users className="h-5 w-5" />}
            title="Employees requiring reskilling"
            subtitle={`${candidates.length} employees combine high AI exposure with low readiness`}
            action={
              <Button size="sm" variant="ghost" to="/employer/workforce?status=priority-reskilling" iconRight={<ArrowRight className="h-4 w-4" />}>
                All
              </Button>
            }
          />
          {candidates.length ? (
            <div className="divide-y divide-slate-100">
              {candidates.slice(0, 7).map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  onClick={() => setSelected(m)}
                  right={
                    <span className="text-right">
                      <span className="block text-sm font-bold tabular-nums text-clay-700">+{m.exposure - m.readiness}</span>
                      <span className="block text-[10px] text-slate-400">gap</span>
                    </span>
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No employees currently need priority reskilling.</p>
          )}
        </Card>
        <Card>
          <CardTitle
            icon={<Rocket className="h-5 w-5" />}
            title="Ready for advanced AI responsibilities"
            subtitle="Readiness ≥ 80% and certified — pilots, output review and mentoring"
            action={
              <Button size="sm" variant="ghost" to="/employer/workforce?sort=readiness" iconRight={<ArrowRight className="h-4 w-4" />}>
                All
              </Button>
            }
          />
          {advanced.length ? (
            <div className="divide-y divide-slate-100">
              {advanced.slice(0, 7).map((m) => (
                <MemberRow key={m.id} member={m} onClick={() => setSelected(m)} right={<span className="flex flex-col items-end gap-0.5"><span className="text-sm font-bold tabular-nums text-brand-700">{m.readiness}%</span><CertBadge certification={m.certification} compact /></span>} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No employees meet the advanced threshold yet.</p>
          )}
        </Card>
      </div>

      <InsightsCard org={org} members={members} focus="skills" title="AI skills-gap insights" className="mt-4" />

      {plan && (
        <Card className="mt-4">
          <CardTitle icon={<BookOpen className="h-5 w-5" />} title="Targeted reskilling plans" subtitle="Recommended ZimAI Ready modules per department, ranked by the skills gap they close" />
          <Tabs tabs={plans.map((p) => ({ id: p.department, label: p.department }))} value={plan.department} onChange={setPlanDept} className="mb-4" />
          <div key={plan.department} className="grid animate-fade-in gap-5 lg:grid-cols-[1fr_2fr]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={HORIZON_TONE[plan.horizon]}>{plan.horizon}</Badge>
                <Badge tone="neutral">{plan.domainName}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Readiness</dt><dd className="text-xl font-extrabold tabular-nums">{plan.stat.readiness}%</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Exposure</dt><dd className="text-xl font-extrabold tabular-nums">{plan.stat.exposure}%</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Target group</dt><dd className="text-xl font-extrabold tabular-nums">{plan.targetEmployees}</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Learning time</dt><dd className="text-xl font-extrabold tabular-nums">{Math.round((plan.totalMinutes / 60) * 10) / 10}h</dd></div>
              </dl>
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Focus skills</p>
                <ul className="space-y-1.5">
                  {plan.focusSkills.map((s) => (
                    <li key={s.skillId} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-slate-700">{s.name}</span>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-clay-700">{s.belowPct}% below</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <ol className="space-y-2.5">
                {plan.modules.map((m, i) => (
                  <li key={m.moduleId} className="flex gap-3 rounded-xl border border-slate-200 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink-950">{m.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{m.reason}</p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{m.minutes} min</span>
                        <span className="capitalize">{m.level}</span>
                        <span className="truncate">{m.skills.join(' · ')}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button icon={<BookOpen className="h-4 w-4" />} onClick={() => toast.comingSoon('Assigning pathways to departments')}>
                  Assign to {plan.department}
                </Button>
                <Button variant="outline" to={`/employer/workforce?department=${encodeURIComponent(plan.department)}`}>
                  View {plan.department} employees
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <MemberDetailModal member={selected} org={org} onClose={() => setSelected(null)} />
    </div>
  );
}
