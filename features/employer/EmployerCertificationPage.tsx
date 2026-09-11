import { useMemo, useState } from 'react';
import { ArrowRight, Award, BadgeCheck, Building2, CheckCircle2, Globe2, Plus, Target } from 'lucide-react';
import type { Organisation, WorkforceMember } from '../../types';
import { Badge, Button, Card, CardTitle, EmptyState, PageHeader, Tabs, useToast } from '../../components/ui';
import { CERT_TYPE_META, LEVEL_META } from '../../lib/certification';
import { SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { skillName } from '../../data/skills';
import { useWorkforce } from './useWorkforce';
import { certificationSummary, competencyCoverage } from './analytics';
import { ChartLegend, StackedBar } from './charts';
import { CertBadge, KpiTile, MemberDetailModal, MemberRow, SampleDataBanner, WorkforceGate } from './components';
import { PRIORITY_META } from './competencyTemplates';

export default function EmployerCertificationPage() {
  const state = useWorkforce();
  return <WorkforceGate state={state}>{(members, org) => <Certification org={org} members={members} />}</WorkforceGate>;
}

type TabId = 'eligible' | 'employer' | 'domain';

function Certification({ org, members }: { org: Organisation; members: WorkforceMember[] }) {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>('eligible');
  const [selected, setSelected] = useState<WorkforceMember | null>(null);
  const cert = useMemo(() => certificationSummary(members, org.requiredCompetencies), [members, org]);
  const coverage = useMemo(() => competencyCoverage(members, org.requiredCompetencies), [members, org]);
  const domainHolders = useMemo(() => members.filter((m) => m.certification?.type === 'domain').sort((a, b) => LEVEL_META[b.certification!.level].rank - LEVEL_META[a.certification!.level].rank || b.readiness - a.readiness), [members]);
  const employerHolders = useMemo(() => members.filter((m) => m.certification?.type === 'employer').sort((a, b) => b.readiness - a.readiness), [members]);
  const list = tab === 'eligible' ? cert.eligibleNow : tab === 'employer' ? employerHolders : domainHolders;
  const levels = ['AI_READY', 'AI_CAPABLE', 'AI_AWARE'] as const;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={org.name}
        title="Certification"
        description="Two complementary credentials: independent Domain AI Ready certification, and Employer AI Ready certification against your own competency framework."
        actions={
          <Button variant="outline" to="/employer/competencies" icon={<Target className="h-4 w-4" />}>
            Edit competencies
          </Button>
        }
      />
      <SampleDataBanner organisation={org} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1 bg-sky-500" aria-hidden />
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Globe2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-ink-950">{CERT_TYPE_META.domain.label}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{CERT_TYPE_META.domain.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="sky">Independent</Badge>
                <Badge tone="sky">Profession-based</Badge>
                <Badge tone="sky">Portable</Badge>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-extrabold tabular-nums text-ink-950">{cert.domainTotal}</p>
              <p className="text-xs text-slate-500">holders in your workforce</p>
            </div>
            <div className="w-full max-w-[16rem]">
              <StackedBar segments={levels.map((l) => ({ label: LEVEL_META[l].label, value: cert.domain[l], color: LEVEL_META[l].color }))} />
              <ChartLegend className="mt-2" items={levels.map((l) => ({ label: LEVEL_META[l].label, color: LEVEL_META[l].color, value: cert.domain[l] }))} />
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
            Earned by the employee through assessments and a practical capstone in their profession. It stays with them if they change employer.
          </p>
        </Card>

        <Card className="relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1 bg-brand-600" aria-hidden />
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Building2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-ink-950">{CERT_TYPE_META.employer.label}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{CERT_TYPE_META.employer.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="brand">{org.name}</Badge>
                <Badge tone="brand">Competency-based</Badge>
                <Badge tone="brand">{org.requiredCompetencies.length} requirements</Badge>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-4xl font-extrabold tabular-nums text-ink-950">{cert.employer}</p>
              <p className="text-xs text-slate-500">holders</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold tabular-nums text-brand-700">{cert.eligibleNow.length}</p>
              <p className="text-xs text-slate-500">eligible now</p>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-brand-50/60 px-3 py-2 text-xs leading-relaxed text-brand-900">
            Requires <strong>Domain AI Capable or above</strong> plus every <strong>critical</strong> and <strong>important</strong> competency in your framework.
          </p>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Total certified" value={cert.total} sub={`${cert.pct}% of ${members.length} employees`} accent={LEVEL_META.AI_READY.color} />
        <KpiTile label="Domain AI Ready" value={cert.domainTotal} sub={`${cert.domain.AI_READY} at AI Ready level`} accent="#0284c7" />
        <KpiTile label="Employer AI Ready" value={cert.employer} sub={`Against ${org.requiredCompetencies.length} competencies`} accent="#0a8a5f" />
        <KpiTile label="Eligible now" value={cert.eligibleNow.length} sub="Ready for Employer AI Ready" accent="#e0a400" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle icon={<Award className="h-5 w-5" />} title="Certificate holders" subtitle="Select an employee to see their competency evidence" />
          <Tabs<TabId>
            className="mb-3"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'eligible', label: 'Eligible now', count: cert.eligibleNow.length },
              { id: 'employer', label: 'Employer AI Ready', count: employerHolders.length },
              { id: 'domain', label: 'Domain AI Ready', count: domainHolders.length },
            ]}
          />
          {list.length === 0 ? (
            <EmptyState className="py-8" title={tab === 'eligible' ? 'Nobody is eligible yet' : 'No holders yet'} description={tab === 'eligible' ? 'Employees become eligible once they hold Domain AI Capable or above and meet your critical and important competencies.' : undefined} />
          ) : (
            <div className="max-h-[480px] divide-y divide-slate-100 overflow-y-auto pr-1">
              {list.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <MemberRow member={m} onClick={() => setSelected(m)} right={<CertBadge certification={m.certification} />} />
                  </div>
                  {tab === 'eligible' && (
                    <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => toast.comingSoon('Employer certification nominations')} className="shrink-0">
                      <span className="hidden sm:inline">Nominate</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle icon={<BadgeCheck className="h-5 w-5" />} title="How Employer AI Ready is earned" />
          <ol className="space-y-3 text-sm">
            {[
              { t: 'Domain certification', d: 'Hold Domain AI Ready at AI Capable level or above.' },
              { t: 'Critical competencies', d: `Meet all ${org.requiredCompetencies.filter((c) => c.priority === 'critical').length} critical competencies.` },
              { t: 'Important competencies', d: `Meet all ${org.requiredCompetencies.filter((c) => c.priority === 'important').length} important competencies.` },
              { t: 'Renew annually', d: 'Readiness is not permanent — reassess and renew every 12 months.' },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                <span>
                  <strong className="block text-ink-950">{s.t}</strong>
                  <span className="text-slate-600">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Employer AI Ready criteria"
          subtitle={`Derived from ${org.name}'s required competencies`}
          action={
            <Button size="sm" variant="ghost" to="/employer/competencies" iconRight={<ArrowRight className="h-4 w-4" />}>
              Manage
            </Button>
          }
        />
        {org.requiredCompetencies.length === 0 ? (
          <EmptyState title="No competencies defined" description="Define your competency framework to enable Employer AI Ready certification." action={<Button to="/employer/competencies">Define competencies</Button>} />
        ) : (
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="py-2.5 pr-3">Competency</th>
                  <th scope="col" className="px-3 py-2.5">Measured by</th>
                  <th scope="col" className="px-3 py-2.5">Required level</th>
                  <th scope="col" className="px-3 py-2.5">Priority</th>
                  <th scope="col" className="px-3 py-2.5">Counts for certificate</th>
                  <th scope="col" className="py-2.5 pl-3 text-right">Workforce meeting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coverage.map((c) => (
                  <tr key={c.competency.id}>
                    <td className="py-3 pr-3 font-semibold text-ink-950">{c.competency.name}</td>
                    <td className="px-3 py-3 text-slate-600">{c.competency.skillIds.map(skillName).join(', ')}</td>
                    <td className="px-3 py-3 text-slate-600">{SKILL_LEVEL_LABELS[c.competency.requiredLevel]}</td>
                    <td className="px-3 py-3">
                      <Badge tone={PRIORITY_META[c.competency.priority].tone}>{PRIORITY_META[c.competency.priority].label}</Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{c.competency.priority === 'desirable' ? 'Tracked only' : 'Required'}</td>
                    <td className="py-3 pl-3 text-right font-bold tabular-nums text-ink-950">
                      {c.pct}% <span className="font-medium text-slate-400">({c.met})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <MemberDetailModal member={selected} org={org} onClose={() => setSelected(null)} />
    </div>
  );
}
