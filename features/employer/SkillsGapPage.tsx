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
import { CertBadge, HeroArt, InsightsCard, KpiTile, MemberDetailModal, MemberRow, SampleDataBanner, WorkforceGate } from './components';
import { Reveal } from '../../components/motion';
import { BrainSpark } from '../../components/illustrations';
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
        title={<>Skills-gap <em>intelligence</em></>}
        description="Vulnerable skills, emerging needs and where to reskill."
        actions={
          <div className="flex items-end gap-5">
            <HeroArt>
              <BrainSpark className="h-28 w-28 lg:h-32 lg:w-32" animated />
            </HeroArt>
            <Button to="/employer/advisor" variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
              Ask the Advisor
            </Button>
          </div>
        }
      />
      <SampleDataBanner organisation={org} />

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <Reveal delay={0}><KpiTile variant="blush" label="Critical coverage" value={criticalAvg != null ? `${criticalAvg}%` : '—'} /></Reveal>
        <Reveal delay={60}><KpiTile variant="gold" label="Most vulnerable skill" value={<span className="block text-2xl leading-tight sm:text-[28px]">{vulnerable[0]?.name ?? '—'}</span>} sub={vulnerable[0] ? `${vulnerable[0].belowPct}% below required` : undefined} /></Reveal>
        <Reveal delay={120}><KpiTile variant="lilac" label="Require reskilling" value={candidates.length} sub="High exposure · low readiness" /></Reveal>
        <Reveal delay={180}><KpiTile variant="sand" label="Ready for advanced AI" value={advanced.length} sub="≥ 80% · certified" /></Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
        <Card className="h-full sm:p-8">
          <CardTitle icon={<TrendingDown className="h-5 w-5" />} title="Most vulnerable skills" subtitle="% of employees below required level" />
          {vulnerable.length ? (
            <HorizontalBarList
              labelWidth="11rem"
              items={vulnerable.map((s) => ({
                id: s.skillId,
                label: s.name,
                value: s.belowPct,
                color: s.source === 'critical' ? '#ff6c4c' : s.source === 'important' ? '#ffa946' : '#a3a390',
                sublabel: `${s.competencies[0] ?? (s.source === 'desired' ? 'Management priority' : 'Core AI skill')} · needs ${SKILL_LEVEL_LABELS[s.required]}`,
              }))}
              onSelect={(it) => navigate(`/employer/workforce?skill=${encodeURIComponent(it.id!)}`)}
              ariaLabel="Share of employees below the required level per skill"
            />
          ) : (
            <p className="text-sm text-slate-500">No skills are below the required level. Excellent.</p>
          )}
          <p className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#ff6c4c]" />Critical competency</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#ffa946]" />Important competency</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#a3a390]" />Other</span>
          </p>
        </Card>
        </Reveal>
        <Reveal delay={80}>
        <Card className="h-full sm:p-8">
          <CardTitle icon={<Sprout className="h-5 w-5" />} title="Emerging skills" subtitle="Low coverage today" />
          {emerging.length ? (
            <ul className="space-y-3">
              {emerging.map((s) => (
                <li key={s.skillId} className="rounded-2xl border border-ink-950/10 bg-sand-100 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink-950">{s.name}</p>
                    <span className="font-display text-2xl font-medium leading-none tabular-nums text-ink-950">{s.coveragePct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-300/70">
                    <div className="h-full rounded-full bg-lilac-500" style={{ width: `${s.coveragePct}%` }} />
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
        </Reveal>
      </div>

      <Reveal className="mt-6">
      <Card className="sm:p-8">
        <CardTitle
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Organisation-wide competency gaps"
          subtitle="% of each department meeting each competency"
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
      </Reveal>

      <Reveal className="mt-6">
      <Card className="sm:p-8">
        <CardTitle icon={<AlertTriangle className="h-5 w-5" />} title="Departments requiring attention" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {attention.map((a) => (
            <button
              key={a.stat.department}
              type="button"
              onClick={() => navigate(`/employer/workforce?department=${encodeURIComponent(a.stat.department)}`)}
              className={cn('rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-ink-sm', a.severity === 'high' ? 'border-clay-200 bg-clay-50' : a.severity === 'medium' ? 'border-gold-200 bg-gold-50' : 'border-ink-950/10 bg-sand-100')}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-ink-950">{a.stat.department}</p>
                <Badge tone={a.severity === 'high' ? 'clay' : a.severity === 'medium' ? 'gold' : 'neutral'}>{a.severity}</Badge>
              </div>
              <p className="mt-2 font-display text-4xl font-medium leading-none tabular-nums text-ink-950">
                {a.stat.readiness}% <span className="font-sans text-sm font-semibold text-slate-500">vs {a.stat.exposure}% exposure</span>
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-snug text-slate-600">
                {a.reasons.slice(0, 2).map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </Card>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
        <Card className="h-full sm:p-8">
          <CardTitle
            icon={<Users className="h-5 w-5" />}
            title="Employees requiring reskilling"
            action={
              <Button size="sm" variant="ghost" to="/employer/workforce?status=priority-reskilling" iconRight={<ArrowRight className="h-4 w-4" />}>
                All
              </Button>
            }
          />
          {candidates.length ? (
            <div className="divide-y divide-ink-950/5">
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
        </Reveal>
        <Reveal delay={80}>
        <Card className="h-full sm:p-8">
          <CardTitle
            icon={<Rocket className="h-5 w-5" />}
            title="Ready for advanced AI responsibilities"
            action={
              <Button size="sm" variant="ghost" to="/employer/workforce?sort=readiness" iconRight={<ArrowRight className="h-4 w-4" />}>
                All
              </Button>
            }
          />
          {advanced.length ? (
            <div className="divide-y divide-ink-950/5">
              {advanced.slice(0, 7).map((m) => (
                <MemberRow key={m.id} member={m} onClick={() => setSelected(m)} right={<span className="flex flex-col items-end gap-0.5"><span className="text-sm font-bold tabular-nums text-brand-700">{m.readiness}%</span><CertBadge certification={m.certification} compact /></span>} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No employees meet the advanced threshold yet.</p>
          )}
        </Card>
        </Reveal>
      </div>

      <Reveal className="mt-6">
        <InsightsCard org={org} members={members} focus="skills" title="AI skills-gap insights" />
      </Reveal>

      {plan && (
        <Reveal className="mt-6">
        <Card className="sm:p-8">
          <CardTitle icon={<BookOpen className="h-5 w-5" />} title="Targeted reskilling plans" subtitle="Recommended modules per department" />
          <Tabs tabs={plans.map((p) => ({ id: p.department, label: p.department }))} value={plan.department} onChange={setPlanDept} className="mb-4" />
          <div key={plan.department} className="grid animate-ghost-in gap-5 lg:grid-cols-[1fr_2fr]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={HORIZON_TONE[plan.horizon]}>{plan.horizon}</Badge>
                <Badge tone="neutral">{plan.domainName}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-sand-100 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Readiness</dt><dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{plan.stat.readiness}%</dd></div>
                <div className="rounded-2xl bg-sand-100 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Exposure</dt><dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{plan.stat.exposure}%</dd></div>
                <div className="rounded-2xl bg-sand-100 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Target group</dt><dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{plan.targetEmployees}</dd></div>
                <div className="rounded-2xl bg-sand-100 p-3"><dt className="text-[11px] font-semibold uppercase text-slate-500">Learning time</dt><dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{Math.round((plan.totalMinutes / 60) * 10) / 10}h</dd></div>
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
                  <li key={m.moduleId} className="flex gap-3 rounded-2xl border border-ink-950/10 bg-paper p-3.5 transition hover:border-ink-950/30">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-800 font-condensed text-sm text-canvas">{i + 1}</span>
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
        </Reveal>
      )}

      <MemberDetailModal member={selected} org={org} onClose={() => setSelected(null)} />
    </div>
  );
}
