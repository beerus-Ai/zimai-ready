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
import { CertBadge, HeroArt, KpiTile, MemberDetailModal, MemberRow, SampleDataBanner, WorkforceGate } from './components';
import { Reveal } from '../../components/motion';
import { CertificateRibbon } from '../../components/illustrations';
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
        description="Independent domain credentials, plus your own employer standard."
        actions={
          <div className="flex items-end gap-5">
            <HeroArt>
              <CertificateRibbon className="h-28 w-28 lg:h-32 lg:w-32" animated />
            </HeroArt>
            <Button variant="outline" to="/employer/competencies" icon={<Target className="h-4 w-4" />}>
              Edit competencies
            </Button>
          </div>
        }
      />
      <SampleDataBanner organisation={org} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
        <Card className="relative h-full overflow-hidden rounded-4xl border-0 bg-lilac-100/70 shadow-none sm:p-8">
          <div className="flex items-start gap-3">
            <span className="mt-1 shrink-0 text-ink-700">
              <Globe2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl leading-tight text-ink-950 sm:text-3xl">{CERT_TYPE_META.domain.label}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{CERT_TYPE_META.domain.description}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-7xl font-medium leading-none tabular-nums text-ink-950">{cert.domainTotal}</p>
              <p className="mt-1 text-xs text-ink-600">holders in your workforce</p>
            </div>
            <div className="w-full sm:max-w-[16rem]">
              <StackedBar segments={levels.map((l) => ({ label: LEVEL_META[l].label, value: cert.domain[l], color: LEVEL_META[l].color }))} />
              <ChartLegend className="mt-2" items={levels.map((l) => ({ label: LEVEL_META[l].label, color: LEVEL_META[l].color, value: cert.domain[l] }))} />
            </div>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-ink-500">Earned by the employee · stays with them if they change employer.</p>
        </Card>
        </Reveal>

        <Reveal delay={80}>
        <Card className="relative h-full overflow-hidden rounded-4xl border-0 bg-brand-800 text-canvas shadow-none sm:p-8">
          <div className="flex items-start gap-3">
            <span className="mt-1 shrink-0 text-canvas/80">
              <Building2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl leading-tight text-canvas sm:text-3xl">{CERT_TYPE_META.employer.label}</h2>
              <p className="mt-1 text-sm leading-relaxed text-canvas/75">{CERT_TYPE_META.employer.description}</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-5">
            <div>
              <p className="font-display text-7xl font-medium leading-none tabular-nums text-canvas">{cert.employer}</p>
              <p className="mt-1 text-xs text-canvas/65">holders</p>
            </div>
            <div>
              <p className="font-display text-7xl font-medium leading-none tabular-nums text-gold-300">{cert.eligibleNow.length}</p>
              <p className="mt-1 text-xs text-canvas/65">eligible now</p>
            </div>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-canvas/75">
            Requires <strong>Domain AI Capable or above</strong> plus every <strong>critical</strong> and <strong>important</strong> competency in your framework.
          </p>
        </Card>
        </Reveal>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <Reveal><KpiTile variant="gold" label="Total certified" value={cert.total} sub={`${cert.pct}% of ${members.length} employees`} accent={LEVEL_META.AI_READY.color} /></Reveal>
        <Reveal delay={60}><KpiTile variant="lilac" label="Domain AI Ready" value={cert.domainTotal} sub={`${cert.domain.AI_READY} at AI Ready level`} accent="#2f9f72" /></Reveal>
        <Reveal delay={120}><KpiTile variant="sand" label="Employer AI Ready" value={cert.employer} sub={`Against ${org.requiredCompetencies.length} competencies`} accent="#034f46" /></Reveal>
        <Reveal delay={180}><KpiTile variant="blush" label="Eligible now" value={cert.eligibleNow.length} sub="Ready for Employer AI Ready" accent="#ffa946" /></Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
        <Card className="h-full sm:p-8">
          <CardTitle icon={<Award className="h-5 w-5" />} title="Certificate holders" subtitle="Select an employee for evidence" />
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
            <div className="max-h-[480px] divide-y divide-ink-950/5 overflow-y-auto pr-1">
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
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
        <Card className="h-full sm:p-8">
          <CardTitle icon={<BadgeCheck className="h-5 w-5" />} title="How Employer AI Ready is earned" />
          <ol className="space-y-5 text-sm">
            {[
              { t: 'Domain certification', d: 'Hold Domain AI Ready at AI Capable level or above.' },
              { t: 'Critical competencies', d: `Meet all ${org.requiredCompetencies.filter((c) => c.priority === 'critical').length} critical competencies.` },
              { t: 'Important competencies', d: `Meet all ${org.requiredCompetencies.filter((c) => c.priority === 'important').length} important competencies.` },
              { t: 'Renew annually', d: 'Readiness is not permanent — reassess and renew every 12 months.' },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span className="w-5 shrink-0 font-display text-2xl leading-none text-ink-400 tabular-nums">{i + 1}</span>
                <span>
                  <strong className="block text-ink-950">{s.t}</strong>
                  <span className="text-slate-600">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
        </Reveal>
      </div>

      <Reveal className="mt-6">
      <Card className="sm:p-8">
        <CardTitle
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Employer AI Ready criteria"
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
              <thead className="border-b border-ink-950/10 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
                <tr>
                  <th scope="col" className="py-2.5 pr-3">Competency</th>
                  <th scope="col" className="px-3 py-2.5">Measured by</th>
                  <th scope="col" className="px-3 py-2.5">Required level</th>
                  <th scope="col" className="px-3 py-2.5">Priority</th>
                  <th scope="col" className="px-3 py-2.5">Counts for certificate</th>
                  <th scope="col" className="py-2.5 pl-3 text-right">Workforce meeting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-950/5">
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
                      <span className="font-display text-lg font-medium">{c.pct}%</span> <span className="font-medium text-slate-400">({c.met})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </Reveal>

      <MemberDetailModal member={selected} org={org} onClose={() => setSelected(null)} />
    </div>
  );
}
