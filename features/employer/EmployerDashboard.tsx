import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Building2, ChevronsDownUp, ChevronsUpDown, Gauge, GraduationCap, PieChart, Radar, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import type { Organisation, WorkforceMember } from '../../types';
import { Badge, Button, Card, CardTitle, ExpandableSection, useExpandedSections } from '../../components/ui';
import { Reveal } from '../../components/motion';
import { LEVEL_COLORS, WORKFORCE_STATUS_META } from '../../lib/readiness';
import { CERT_TYPE_META, LEVEL_META } from '../../lib/certification';
import { useWorkforce } from './useWorkforce';
import { certificationSummary, departmentsNeedingAttention, departmentStats, momentumTrend, orgAverages, STATUS_ORDER, statusSplit } from './analytics';
import { AreaLine, ChartLegend, DonutChart, HorizontalBarList, QuadrantScatter, Sparkline, StackedBar } from './charts';
import { InsightsCard, KpiTile, readinessHex, SampleDataBanner, WorkforceGate } from './components';

export default function EmployerDashboard() {
  const state = useWorkforce();
  return <WorkforceGate state={state}>{(members, org) => <Dashboard org={org} members={members} />}</WorkforceGate>;
}

const verdictFor = (aiReadyPct: number) =>
  aiReadyPct >= 60 ? 'Ready for AI transformation' : aiReadyPct >= 25 ? 'Partly ready for AI transformation' : 'Not yet ready for AI transformation';

const SECTION_IDS = ['status', 'departments', 'invest', 'certification', 'maturity'] as const;
type SectionId = (typeof SECTION_IDS)[number];

/**
 * Calm employer overview: the verdict and four headline numbers up front; charts and breakdowns live in
 * collapsible sections that open on demand (open state is remembered per browser).
 */
function Dashboard({ org, members }: { org: Organisation; members: WorkforceMember[] }) {
  const navigate = useNavigate();
  const { open, toggle, set, setAll } = useExpandedSections('zimai.employer.sections');
  const split = useMemo(() => statusSplit(members), [members]);
  const avg = useMemo(() => orgAverages(members), [members]);
  const depts = useMemo(() => departmentStats(members, org), [members, org]);
  const attention = useMemo(() => departmentsNeedingAttention(members, org, 3), [members, org]);
  const cert = useMemo(() => certificationSummary(members, org.requiredCompetencies), [members, org]);
  const trend = useMemo(() => momentumTrend(members), [members]);
  const maturity = org.maturity;
  const statusSegments = STATUS_ORDER.map((s) => ({ label: WORKFORCE_STATUS_META[s].label, value: split.counts[s], color: WORKFORCE_STATUS_META[s].hex }));
  const lowest = [...depts].sort((a, b) => a.readiness - b.readiness)[0];
  const focusDepts = attention.slice(0, 2).map((a) => a.stat.department);
  const allOpen = SECTION_IDS.every((id) => open[id]);

  const reveal = (id: SectionId) => {
    set(id, true);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const glance: { id: SectionId; label: string; value: ReactNode; icon: ReactNode }[] = [
    { id: 'status', label: 'Employees', value: split.total, icon: <Users className="h-4 w-4" /> },
    { id: 'status', label: 'AI Ready', value: `${split.pct['ai-ready']}%`, icon: <Sparkles className="h-4 w-4" /> },
    { id: 'departments', label: 'Avg readiness', value: `${avg.readiness}%`, icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'certification', label: 'Certified', value: cert.total, icon: <Award className="h-4 w-4" /> },
  ];

  const quickLinks = [
    { to: '/employer/skills', icon: <Radar className="h-5 w-5" />, title: 'Skills gap', text: '' },
    { to: '/employer/competencies', icon: <Target className="h-5 w-5" />, title: 'Competencies', text: `${org.requiredCompetencies.length} defined` },
    { to: '/employer/maturity', icon: <Gauge className="h-5 w-5" />, title: 'AI maturity', text: maturity ? `${maturity.score}/100 · ${maturity.level}` : 'Not assessed' },
    { to: '/employer/advisor', icon: <Sparkles className="h-5 w-5" />, title: 'AI Workforce Advisor', text: '' },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      {/* Header */}
      <section className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 animate-ghost-in text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{org.name}</p>
          <h1 className="animate-ghost-in text-4xl leading-[1] text-ink-950 sm:text-5xl" style={{ animationDelay: '60ms' }}>
            Workforce <em className="text-brand-800">readiness.</em>
          </h1>
        </div>
        <div className="flex animate-ghost-in flex-wrap gap-2" style={{ animationDelay: '160ms' }}>
          <Button variant="outline" size="sm" to="/employer/workforce" icon={<Users className="h-4 w-4" />}>
            Employees
          </Button>
          <Button size="sm" to="/employer/advisor" icon={<Sparkles className="h-4 w-4" />}>
            Ask the AI Advisor
          </Button>
        </div>
      </section>

      <SampleDataBanner organisation={org} className="mt-6" />

      {/* The one answer that matters */}
      <Reveal className="mt-6" delay={100}>
        <section className="rounded-4xl bg-brand-800 p-6 text-canvas sm:p-10" aria-labelledby="verdict">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/60">Readiness verdict</p>
          <h2 id="verdict" className="mt-3 max-w-2xl text-3xl leading-[1.04] sm:text-4xl">
            {verdictFor(split.pct['ai-ready'])}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-canvas/75">
            {split.pct['ai-ready']}% of {split.total} employees are AI Ready.
            {focusDepts.length > 0 && (
              <>
                {' '}Start with <strong className="text-canvas">{focusDepts.join(' and ')}</strong>.
              </>
            )}
          </p>
          <StackedBar
            className="mt-6 max-w-xl"
            height={8}
            segments={statusSegments}
            label={`Workforce status: ${statusSegments.map((sg) => `${sg.label} ${sg.value}`).join(', ')}`}
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button variant="gold" to="/employer/skills" iconRight={<ArrowRight className="h-4 w-4" />}>
              View reskilling plans
            </Button>
            <button type="button" onClick={() => reveal('invest')} className="text-sm font-semibold text-canvas/75 underline decoration-canvas/30 underline-offset-4 hover:text-canvas">
              Why these teams?
            </button>
          </div>
        </section>
      </Reveal>

      {/* At a glance — each number opens its detail */}
      <Reveal delay={200}>
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {glance.map((g) => (
            <li key={g.label}>
              <button
                type="button"
                onClick={() => reveal(g.id)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-ink-950/[0.08] bg-paper px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-ink-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand-200/80 text-ink-700 transition group-hover:bg-lilac-200 group-hover:text-ink-950">{g.icon}</span>
                <span className="min-w-0">
                  <span className="block font-display text-2xl leading-none tabular-nums text-ink-950">{g.value}</span>
                  <span className="mt-1 block truncate text-xs font-medium text-ink-500">{g.label}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Details on demand */}
      <div className="mt-12 flex items-center justify-between gap-3">
        <p className="font-display text-lg italic text-ink-500 sm:text-xl">
          More detail<span className="hidden sm:inline">, when you want it</span>
        </p>
        <button
          type="button"
          onClick={() => setAll([...SECTION_IDS], !allOpen)}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-ink-600 transition hover:bg-ink-950/5 hover:text-ink-950"
        >
          {allOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <ExpandableSection
          id="status"
          title="Workforce status"
          icon={<PieChart className="h-5 w-5" />}
          summary={`${split.pct['ai-ready']}% AI Ready · ${split.pct.upskilling}% upskilling · ${split.pct['priority-reskilling']}% priority reskilling`}
          open={!!open.status}
          onToggle={() => toggle('status')}
        >
          <Card className="sm:p-8">
            <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
              <DonutChart segments={statusSegments} centerValue={split.total} centerLabel="Employees" />
              <ul className="w-full space-y-1">
                {STATUS_ORDER.map((st) => (
                  <li key={st}>
                    <button
                      type="button"
                      onClick={() => navigate(`/employer/workforce?status=${st}`)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-sm transition hover:bg-sand-100"
                    >
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: WORKFORCE_STATUS_META[st].hex }} aria-hidden />
                        {WORKFORCE_STATUS_META[st].label}
                      </span>
                      <span className="font-bold tabular-nums text-ink-950">
                        {split.pct[st]}% <span className="font-medium text-slate-400">· {split.counts[st]}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </ExpandableSection>

        <ExpandableSection
          id="departments"
          title="Departments"
          icon={<Building2 className="h-5 w-5" />}
          summary={lowest ? `${depts.length} departments · lowest readiness: ${lowest.department} (${lowest.readiness}%)` : `${depts.length} departments`}
          open={!!open.departments}
          onToggle={() => toggle('departments')}
        >
          <div className="space-y-4">
            <Card className="sm:p-8">
              <CardTitle
                title="Readiness by department"
                subtitle="Bar = readiness · tick = AI exposure"
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
                className="mt-5 border-t border-ink-950/5 pt-4"
                items={[
                  ...(['AI Beginner', 'Developing', 'AI Capable', 'AI Ready'] as const).map((l) => ({ label: l, color: LEVEL_COLORS[l].hex })),
                  { label: 'AI exposure (tick)', color: '#1a1a1a' },
                ]}
              />
            </Card>
            <Card className="sm:p-8">
              <CardTitle title="AI exposure vs readiness" subtitle="Bubble = department · size = headcount" />
              <QuadrantScatter
                points={depts.map((d) => ({ id: d.department, label: d.department, x: d.exposure, y: d.readiness, size: d.count, color: readinessHex(d.readiness), sub: `${d.count} employees` }))}
                xThreshold={65}
                yThreshold={60}
                onSelect={(pt) => navigate(`/employer/workforce?department=${encodeURIComponent(pt.id)}`)}
              />
            </Card>
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="invest"
          title="Where to invest first"
          icon={<Target className="h-5 w-5" />}
          summary={focusDepts.length ? `Start with ${focusDepts.join(' and ')} · AI insights inside` : 'AI management insights'}
          open={!!open.invest}
          onToggle={() => toggle('invest')}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
            <Card className="sm:p-8">
              <ol className="divide-y divide-ink-950/5">
                {attention.map((a, i) => (
                  <li key={a.stat.department} className="py-4 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-3 text-[15px] font-semibold text-ink-950">
                        <span className="font-display text-2xl leading-none text-ink-400 tabular-nums">{i + 1}</span>
                        {a.stat.department}
                      </p>
                      <Badge tone={a.severity === 'high' ? 'clay' : a.severity === 'medium' ? 'gold' : 'neutral'}>
                        {a.severity === 'high' ? 'High priority' : a.severity === 'medium' ? 'Medium' : 'Monitor'}
                      </Badge>
                    </div>
                    <p className="mt-1.5 pl-8 text-[13px] leading-snug text-slate-500">{a.reasons[0]}</p>
                  </li>
                ))}
              </ol>
              <Button variant="outline" size="sm" full className="mt-4" to="/employer/skills" iconRight={<ArrowRight className="h-4 w-4" />}>
                View reskilling plans
              </Button>
            </Card>
            <InsightsCard org={org} members={members} />
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="certification"
          title="Certification & momentum"
          icon={<Award className="h-5 w-5" />}
          summary={`${cert.total} certified · ${cert.eligibleNow.length} more eligible now · learning ${avg.learning}%`}
          open={!!open.certification}
          onToggle={() => toggle('certification')}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="sm:p-8">
              <CardTitle
                title="Certification"
                action={
                  <Button size="sm" variant="ghost" to="/employer/certification" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Details
                  </Button>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-sand-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{CERT_TYPE_META.domain.label}</p>
                  <p className="mt-2 font-display text-6xl font-medium leading-none tabular-nums text-ink-950">{cert.domainTotal}</p>
                  <StackedBar
                    className="mt-4"
                    segments={(['AI_READY', 'AI_CAPABLE', 'AI_AWARE'] as const).map((l) => ({ label: LEVEL_META[l].label, value: cert.domain[l], color: LEVEL_META[l].color }))}
                  />
                  <ChartLegend className="mt-2" items={(['AI_READY', 'AI_CAPABLE', 'AI_AWARE'] as const).map((l) => ({ label: LEVEL_META[l].label, color: LEVEL_META[l].color, value: cert.domain[l] }))} />
                </div>
                <div className="rounded-2xl bg-brand-800 p-5 text-canvas">
                  <p className="text-xs font-semibold uppercase tracking-wide text-canvas/60">{CERT_TYPE_META.employer.label}</p>
                  <p className="mt-2 font-display text-6xl font-medium leading-none tabular-nums text-canvas">{cert.employer}</p>
                  <p className="mt-4 text-[13px] leading-snug text-canvas/75">
                    <strong className="text-canvas">{cert.eligibleNow.length}</strong> more eligible now
                  </p>
                </div>
              </div>
            </Card>
            <Card className="sm:p-8">
              <CardTitle title="Learning momentum" subtitle={org.isSampleWorkforce ? 'Six months · sample history' : 'Six months'} />
              <AreaLine
                labels={trend.labels}
                series={[
                  { id: 'readiness', label: 'Average readiness', color: '#034f46', values: trend.readiness },
                  { id: 'ai-ready', label: '% AI Ready', color: '#4fbf8e', values: trend.aiReady },
                ]}
                height={200}
              />
            </Card>
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="maturity"
          title="AI maturity & shortcuts"
          icon={<Gauge className="h-5 w-5" />}
          summary={`${maturity ? `Maturity ${maturity.score}/100 · ${maturity.level}` : 'Maturity not assessed'} · ${org.requiredCompetencies.length} competencies defined`}
          open={!!open.maturity}
          onToggle={() => toggle('maturity')}
        >
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/employer/maturity')}
              className="group block h-full w-full rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac-400"
            >
              <KpiTile
                variant="lilac"
                label="AI maturity"
                value={maturity ? maturity.score : '—'}
                sub={maturity ? `${maturity.level} · of 100` : 'Not assessed'}
                icon={<Gauge className="h-4 w-4" />}
                className="group-hover:-translate-y-0.5 group-hover:shadow-ink-sm"
              />
            </button>
            <KpiTile variant="blush" label="Avg readiness" value={`${avg.readiness}%`} sub={`vs ${avg.exposure}% AI exposure`} icon={<TrendingUp className="h-4 w-4" />} />
            <KpiTile variant="gold" label="Certified" value={cert.total} sub={`${cert.pct}% · ${cert.employer} Employer AI Ready`} icon={<Award className="h-4 w-4" />} />
            <KpiTile variant="sand" label="Learning" value={`${avg.learning}%`} icon={<GraduationCap className="h-4 w-4" />}>
              <Sparkline values={trend.learning} color="#034f46" height={28} className="mt-3" label={`Learning progress trend: ${trend.learning.join(', ')}%`} />
            </KpiTile>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((l) => (
              <Card key={l.to} padded={false} className="group h-full transition duration-300 hover:-translate-y-0.5 hover:border-ink-950/30 hover:shadow-ink-sm">
                <button type="button" onClick={() => navigate(l.to)} className="flex h-full w-full items-center gap-3 p-4 text-left">
                  <span className="text-ink-700">{l.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-950">{l.title}</span>
                    {l.text && <span className="block truncate text-xs text-slate-500">{l.text}</span>}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-ink-950" />
                </button>
              </Card>
            ))}
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}
