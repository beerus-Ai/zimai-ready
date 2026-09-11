import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Gauge, GraduationCap, Radar, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import type { Organisation, WorkforceMember } from '../../types';
import { Badge, Button, Card, CardTitle, PageHeader } from '../../components/ui';
import { ChevronPattern } from '../../components/brand';
import { LEVEL_COLORS, WORKFORCE_STATUS_META } from '../../lib/readiness';
import { CERT_TYPE_META, LEVEL_META } from '../../lib/certification';
import { cn } from '../../lib/utils';
import { useWorkforce } from './useWorkforce';
import { certificationSummary, departmentsNeedingAttention, departmentStats, momentumTrend, orgAverages, STATUS_ORDER, statusSplit } from './analytics';
import { AreaLine, ChartLegend, DonutChart, HorizontalBarList, QuadrantScatter, Sparkline, StackedBar } from './charts';
import { InsightsCard, KpiTile, readinessHex, SampleDataBanner, WorkforceGate } from './components';
import { maturityMeta } from './maturity';

export default function EmployerDashboard() {
  const state = useWorkforce();
  return <WorkforceGate state={state}>{(members, org) => <Dashboard org={org} members={members} />}</WorkforceGate>;
}

const verdictFor = (aiReadyPct: number) =>
  aiReadyPct >= 60 ? 'Ready for AI transformation' : aiReadyPct >= 25 ? 'Partly ready for AI transformation' : 'Not yet ready for AI transformation';

function HeroStat({ value, label, sub, color }: { value: string | number; label: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
        {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />}
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums text-white sm:text-4xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Dashboard({ org, members }: { org: Organisation; members: WorkforceMember[] }) {
  const navigate = useNavigate();
  const split = useMemo(() => statusSplit(members), [members]);
  const avg = useMemo(() => orgAverages(members), [members]);
  const depts = useMemo(() => departmentStats(members, org), [members, org]);
  const attention = useMemo(() => departmentsNeedingAttention(members, org, 3), [members, org]);
  const cert = useMemo(() => certificationSummary(members, org.requiredCompetencies), [members, org]);
  const trend = useMemo(() => momentumTrend(members), [members]);
  const maturity = org.maturity;
  const statusSegments = STATUS_ORDER.map((s) => ({ label: WORKFORCE_STATUS_META[s].label, value: split.counts[s], color: WORKFORCE_STATUS_META[s].hex }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={org.name}
        title="Workforce AI readiness"
        description="Is your workforce actually ready for AI transformation — and where should you invest in reskilling?"
        actions={
          <>
            <Button variant="outline" to="/employer/workforce" icon={<Users className="h-4 w-4" />}>
              Employees
            </Button>
            <Button to="/employer/advisor" icon={<Sparkles className="h-4 w-4" />}>
              Ask the AI Advisor
            </Button>
          </>
        }
      />
      <SampleDataBanner organisation={org} />

      {/* Executive answer */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-950 p-5 text-white shadow-lift sm:p-7" aria-labelledby="verdict">
        <ChevronPattern color="#ffffff" opacity={0.05} />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.7fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-300">Readiness verdict</p>
            <h2 id="verdict" className="mt-2 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              {verdictFor(split.pct['ai-ready'])}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
              {split.pct['ai-ready']}% of your {split.total} employees are AI Ready.{' '}
              {attention.length > 0 && (
                <>
                  Invest first in <strong className="text-white">{attention.slice(0, 2).map((a) => a.stat.department).join(' and ')}</strong>, where AI exposure is running ahead of skills.
                </>
              )}
            </p>
            <StackedBar className="mt-5" height={10} segments={statusSegments} label={`Workforce status: ${statusSegments.map((s) => `${s.label} ${s.value}`).join(', ')}`} />
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
              {statusSegments.map((s) => (
                <li key={s.label} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat value={split.total} label="Employees" sub={`${depts.length} departments`} />
            <HeroStat value={`${split.pct['ai-ready']}%`} label="AI Ready" sub={`${split.counts['ai-ready']} employees`} color={WORKFORCE_STATUS_META['ai-ready'].hex} />
            <HeroStat value={`${split.pct.upskilling}%`} label="Currently Upskilling" sub={`${split.counts.upskilling} employees`} color={WORKFORCE_STATUS_META.upskilling.hex} />
            <HeroStat value={`${split.pct['priority-reskilling']}%`} label="Priority Reskilling" sub={`${split.counts['priority-reskilling']} employees`} color={WORKFORCE_STATUS_META['priority-reskilling'].hex} />
          </div>
        </div>
      </section>

      {/* Secondary KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button type="button" onClick={() => navigate('/employer/maturity')} className="text-left">
          <KpiTile
            label="AI maturity"
            value={maturity ? maturity.score : '—'}
            sub={maturity ? `${maturity.level} · of 100` : 'Not assessed'}
            accent={maturity ? maturityMeta(maturity.level).color : undefined}
            icon={<Gauge className="h-4 w-4" />}
            className="h-full transition hover:shadow-lift"
          />
        </button>
        <KpiTile label="Average readiness" value={`${avg.readiness}%`} sub={`vs ${avg.exposure}% average AI exposure`} icon={<TrendingUp className="h-4 w-4" />} accent={readinessHex(avg.readiness)} />
        <KpiTile label="Certified" value={cert.total} sub={`${cert.pct}% of workforce · ${cert.employer} Employer AI Ready`} icon={<Award className="h-4 w-4" />} accent={LEVEL_META.AI_READY.color} />
        <KpiTile label="Learning progress" value={`${avg.learning}%`} sub="Average across the workforce" icon={<GraduationCap className="h-4 w-4" />} accent="#0ea5e9">
          <Sparkline values={trend.learning} color="#0ea5e9" height={28} className="mt-2" label={`Learning progress trend: ${trend.learning.join(', ')}%`} />
        </KpiTile>
      </div>

      {/* Status + departments */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle title="Workforce status" subtitle="Derived from readiness and AI exposure" />
          <div className="flex flex-col items-center gap-5">
            <DonutChart segments={statusSegments} centerValue={split.total} centerLabel="Employees" />
            <ul className="w-full space-y-2">
              {STATUS_ORDER.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => navigate(`/employer/workforce?status=${s}`)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center gap-2 text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: WORKFORCE_STATUS_META[s].hex }} aria-hidden />
                      {WORKFORCE_STATUS_META[s].label}
                    </span>
                    <span className="font-bold tabular-nums text-ink-950">
                      {split.pct[s]}% <span className="font-medium text-slate-400">· {split.counts[s]}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle
            title="AI readiness by department"
            subtitle="Average readiness · the tick marks average AI exposure"
            action={
              <Button size="sm" variant="ghost" to="/employer/skills" iconRight={<ArrowRight className="h-4 w-4" />}>
                Skills gap
              </Button>
            }
          />
          <HorizontalBarList
            items={[...depts]
              .sort((a, b) => b.readiness - a.readiness)
              .map((d) => ({
                id: d.department,
                label: d.department,
                value: d.readiness,
                color: readinessHex(d.readiness),
                marker: d.exposure,
                markerLabel: 'AI exposure',
                sublabel: `${d.count} employees · ${d.aiReady} AI Ready`,
              }))}
            onSelect={(it) => navigate(`/employer/workforce?department=${encodeURIComponent(it.label)}`)}
            ariaLabel="Average AI readiness by department"
          />
          <ChartLegend
            className="mt-4 border-t border-slate-100 pt-3"
            items={[
              ...(['AI Beginner', 'Developing', 'AI Capable', 'AI Ready'] as const).map((l) => ({ label: l, color: LEVEL_COLORS[l].hex })),
              { label: 'AI exposure (tick)', color: '#0b1220' },
            ]}
          />
        </Card>
      </div>

      {/* Exposure vs readiness + where to invest */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle title="AI exposure vs readiness" subtitle="Each bubble is a department · size = headcount" />
          <QuadrantScatter
            points={depts.map((d) => ({ id: d.department, label: d.department, x: d.exposure, y: d.readiness, size: d.count, color: readinessHex(d.readiness), sub: `${d.count} employees` }))}
            xThreshold={65}
            yThreshold={60}
            onSelect={(p) => navigate(`/employer/workforce?department=${encodeURIComponent(p.id)}`)}
          />
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle icon={<Target className="h-5 w-5" />} title="Where to invest first" subtitle="Ranked by exposure gap, low competency and transformation plans" />
          <ol className="space-y-3">
            {attention.map((a, i) => (
              <li key={a.stat.department} className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-bold text-ink-950">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-[11px] text-white">{i + 1}</span>
                    {a.stat.department}
                  </p>
                  <Badge tone={a.severity === 'high' ? 'clay' : a.severity === 'medium' ? 'gold' : 'neutral'}>{a.severity === 'high' ? 'High priority' : a.severity === 'medium' ? 'Medium' : 'Monitor'}</Badge>
                </div>
                <ul className="mt-2 space-y-1 text-[13px] leading-snug text-slate-600">
                  {a.reasons.slice(0, 2).map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <Button variant="outline" size="sm" full className="mt-4" to="/employer/skills" iconRight={<ArrowRight className="h-4 w-4" />}>
            View reskilling plans
          </Button>
        </Card>
      </div>

      <InsightsCard org={org} members={members} className="mt-4" />

      {/* Certification + momentum */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle
            icon={<Award className="h-5 w-5" />}
            title="Certification"
            subtitle="Domain AI Ready vs Employer AI Ready"
            action={
              <Button size="sm" variant="ghost" to="/employer/certification" iconRight={<ArrowRight className="h-4 w-4" />}>
                Details
              </Button>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{CERT_TYPE_META.domain.label}</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-ink-950">{cert.domainTotal}</p>
              <StackedBar
                className="mt-3"
                segments={(['AI_READY', 'AI_CAPABLE', 'AI_AWARE'] as const).map((l) => ({ label: LEVEL_META[l].label, value: cert.domain[l], color: LEVEL_META[l].color }))}
              />
              <ChartLegend className="mt-2" items={(['AI_READY', 'AI_CAPABLE', 'AI_AWARE'] as const).map((l) => ({ label: LEVEL_META[l].label, color: LEVEL_META[l].color, value: cert.domain[l] }))} />
            </div>
            <div className="rounded-xl bg-brand-50/60 p-4 ring-1 ring-inset ring-brand-100">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{CERT_TYPE_META.employer.label}</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-ink-950">{cert.employer}</p>
              <p className="mt-2 text-[13px] leading-snug text-slate-600">
                <strong className="text-ink-950">{cert.eligibleNow.length}</strong> more employees are eligible now against {org.name}&apos;s {org.requiredCompetencies.length} required competencies.
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <CardTitle icon={<TrendingUp className="h-5 w-5" />} title="Learning momentum" subtitle={org.isSampleWorkforce ? 'Six-month trend (sample history ending at today’s values)' : 'Six-month trend'} />
          <AreaLine
            labels={trend.labels}
            series={[
              { id: 'readiness', label: 'Average readiness', color: '#0a8a5f', values: trend.readiness },
              { id: 'ai-ready', label: '% AI Ready', color: '#0ea5e9', values: trend.aiReady },
            ]}
            height={200}
          />
        </Card>
      </div>

      {/* Quick links */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/employer/skills', icon: <Radar className="h-5 w-5" />, title: 'Skills-gap intelligence', text: 'Vulnerable skills and reskilling plans' },
          { to: '/employer/competencies', icon: <Target className="h-5 w-5" />, title: 'Required competencies', text: `${org.requiredCompetencies.length} employer-defined competencies` },
          { to: '/employer/maturity', icon: <Gauge className="h-5 w-5" />, title: 'AI maturity', text: maturity ? `${maturity.score}/100 · ${maturity.level}` : 'Assess your organisation' },
          { to: '/employer/advisor', icon: <Sparkles className="h-5 w-5" />, title: 'AI Workforce Advisor', text: 'Ask questions about your workforce' },
        ].map((l) => (
          <Card key={l.to} hover padded={false} className="group">
            <button type="button" onClick={() => navigate(l.to)} className={cn('flex w-full items-center gap-3 p-4 text-left')}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{l.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink-950">{l.title}</span>
                <span className="block truncate text-xs text-slate-500">{l.text}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
