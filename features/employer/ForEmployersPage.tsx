import { useMemo, useState } from 'react';
import { ArrowRight, Bot, Building2, CheckCircle2, Gauge, Globe2, Radar, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import { AIDisclaimer, Badge, Button, Card, Icon, RichText } from '../../components/ui';
import { AccentBar, ChevronPattern } from '../../components/brand';
import { buildDemoOrganisation } from '../../data/demo/organisation';
import { skillName } from '../../data/skills';
import { CERT_TYPE_META } from '../../lib/certification';
import { LEVEL_COLORS, SKILL_LEVEL_LABELS, WORKFORCE_STATUS_META } from '../../lib/readiness';
import { cn } from '../../lib/utils';
import { certificationSummary, competencyHeatmap, departmentsNeedingAttention, departmentStats, mostVulnerableSkills, orgAverages, STATUS_ORDER, statusSplit } from './analytics';
import { ChartLegend, DonutChart, Heatmap, HorizontalBarList, StackedBar } from './charts';
import { answerOffline, SUGGESTED_QUESTIONS } from './advisorEngine';
import { computeInsights } from './aiInsights';
import { COMPETENCY_TEMPLATES, PRIORITY_META } from './competencyTemplates';
import { MATURITY_LEVELS } from './maturity';

const hex = (v: number) => {
  const l = v <= 25 ? 'AI Beginner' : v <= 50 ? 'Developing' : v <= 75 ? 'AI Capable' : 'AI Ready';
  return LEVEL_COLORS[l].hex;
};

const INDUSTRY_STRIP = [
  { label: 'Financial services', icon: 'Landmark' },
  { label: 'Mining', icon: 'Pickaxe' },
  { label: 'Agriculture', icon: 'Sprout' },
  { label: 'Telecoms', icon: 'RadioTower' },
  { label: 'Retail', icon: 'ShoppingBag' },
  { label: 'Tourism', icon: 'Palmtree' },
  { label: 'Manufacturing', icon: 'Factory' },
  { label: 'Education', icon: 'GraduationCap' },
  { label: 'Healthcare', icon: 'HeartPulse' },
  { label: 'Public sector', icon: 'Building2' },
  { label: 'Technology', icon: 'Cpu' },
];

function SectionHeading({ eyebrow, title, text, light, className }: { eyebrow: string; title: string; text?: string; light?: boolean; className?: string }) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <p className={cn('text-xs font-bold uppercase tracking-[0.16em]', light ? 'text-brand-300' : 'text-brand-600')}>{eyebrow}</p>
      <h2 className={cn('mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl', light ? 'text-white' : 'text-ink-950')}>{title}</h2>
      {text && <p className={cn('mt-3 text-[16px] leading-relaxed', light ? 'text-slate-300' : 'text-slate-600')}>{text}</p>}
    </div>
  );
}

export default function ForEmployersPage() {
  // Live figures from the fictional demo bank — the same data the demo dashboard uses.
  const demo = useMemo(() => {
    const { organisation: org, workforce: members } = buildDemoOrganisation('preview');
    return {
      org,
      members,
      split: statusSplit(members),
      avg: orgAverages(members),
      depts: departmentStats(members, org),
      heat: competencyHeatmap(members, org),
      vulnerable: mostVulnerableSkills(members, org, 4),
      attention: departmentsNeedingAttention(members, org, 2),
      cert: certificationSummary(members, org.requiredCompetencies),
      insight: computeInsights(org, members, 'overview').insights[0],
    };
  }, []);
  const { org, members, split, avg, depts, heat, vulnerable, attention, cert, insight } = demo;
  const [question, setQuestion] = useState(SUGGESTED_QUESTIONS[0]);
  const answer = useMemo(() => answerOffline(question, org, members), [question, org, members]);
  const maturity = org.maturity!;
  const bank = COMPETENCY_TEMPLATES.find((t) => t.id === 'banking')!;
  const mining = COMPETENCY_TEMPLATES.find((t) => t.id === 'mining')!;
  const statusSegments = STATUS_ORDER.map((s) => ({ label: WORKFORCE_STATUS_META[s].label, value: split.counts[s], color: WORKFORCE_STATUS_META[s].hex }));

  return (
    <div className="overflow-x-hidden">
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="bg-grid-dark absolute inset-0" aria-hidden />
        <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <Badge tone="white" icon={<Building2 className="h-3.5 w-3.5" />}>
              For employers, HR and transformation leaders
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.35rem]">
              Is your workforce actually ready for <span className="shimmer-text">AI transformation?</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              ZimAI Ready measures AI readiness across every department, pinpoints skills gaps against the competencies <em>you</em> define, and shows exactly where to invest in reskilling — with an AI Workforce Advisor powered by Google Gemini.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" to="/login?role=employer&mode=signup" iconRight={<ArrowRight className="h-5 w-5" />}>
                Start employer assessment
              </Button>
              <Button size="lg" variant="white" to="/demo" icon={<Sparkles className="h-5 w-5 text-gold-500" />}>
                View live demo
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                ['9', 'questions to assess'],
                ['5', 'maturity dimensions'],
                ['2', 'certification types'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-2xl font-extrabold text-white">{v}</dd>
                  <dd className="text-xs text-slate-400">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Dashboard preview */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="rounded-3xl bg-white p-4 text-ink-950 shadow-glow sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{org.name}</p>
                  <p className="text-xs text-slate-500">Workforce AI readiness · live preview</p>
                </div>
                <Badge tone="gold">Fictional sample</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { v: split.total, l: 'Employees', c: '#0b1220' },
                  { v: `${split.pct['ai-ready']}%`, l: 'AI Ready', c: WORKFORCE_STATUS_META['ai-ready'].hex },
                  { v: `${split.pct.upskilling}%`, l: 'Upskilling', c: WORKFORCE_STATUS_META.upskilling.hex },
                  { v: `${split.pct['priority-reskilling']}%`, l: 'Priority reskilling', c: WORKFORCE_STATUS_META['priority-reskilling'].hex },
                ].map((k) => (
                  <div key={k.l} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-2xl font-extrabold tabular-nums" style={{ color: k.c }}>
                      {k.v}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">{k.l}</p>
                  </div>
                ))}
              </div>
              <StackedBar className="mt-4" segments={statusSegments} />
              <div className="mt-4">
                <HorizontalBarList
                  labelWidth="8rem"
                  items={[...depts].sort((a, b) => b.readiness - a.readiness).map((d) => ({ label: d.department, value: d.readiness, color: hex(d.readiness), marker: d.exposure, markerLabel: 'AI exposure' }))}
                  ariaLabel="Department readiness preview"
                />
              </div>
              {attention[0] && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-clay-50 px-3 py-2 text-xs leading-snug text-clay-800">
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Invest first in {attention[0].stat.department}: {attention[0].stat.readiness}% readiness vs {attention[0].stat.exposure}% AI exposure.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Leadership questions ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Workforce intelligence" title="Answers to the questions your board is already asking" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Gauge className="h-5 w-5" />, q: 'How mature is our organisation’s AI adoption?', a: 'A five-dimension maturity score from Exploring to Leading.' },
            { icon: <Users className="h-5 w-5" />, q: 'Which departments are ready — and which are exposed?', a: 'Readiness vs AI exposure for every team and employee.' },
            { icon: <Radar className="h-5 w-5" />, q: 'Which skills are we missing?', a: 'Vulnerable and emerging skills against your own framework.' },
            { icon: <Target className="h-5 w-5" />, q: 'Where should we invest in reskilling first?', a: 'Ranked priorities and targeted learning plans per department.' },
          ].map((x) => (
            <Card key={x.q} hover>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{x.icon}</span>
              <h3 className="mt-4 font-bold leading-snug text-ink-950">{x.q}</h3>
              <p className="mt-2 text-sm text-slate-500">{x.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ───────── Organisational AI maturity ───────── */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Organisational AI maturity"
              title="Know where you stand before you scale"
              text="Nine short questions about adoption, tools, transformation plans and skills priorities produce a maturity score across Strategy, Adoption, Skills, Data and Governance — with Gemini-written strengths, risks and recommendations."
            />
            <ul className="mt-6 space-y-2.5 text-[15px] text-slate-700">
              {['Deterministic scoring you can explain to the board', 'Gemini refines the narrative for your sector', 'Reassess any time to track progress'].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Card className="shadow-lift">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink-950">{org.name}</p>
              <p className="text-sm font-extrabold tabular-nums text-ink-950">
                {maturity.score}/100 · <span className="text-sky-700">{maturity.level}</span>
              </p>
            </div>
            <ol className="space-y-2">
              {MATURITY_LEVELS.map((l) => {
                const active = l.level === maturity.level;
                return (
                  <li key={l.level} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5', active ? 'bg-ink-950 text-white' : 'bg-slate-50')}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: l.color }} />
                    <span className="w-24 text-sm font-bold">{l.level}</span>
                    <span className={cn('min-w-0 flex-1 truncate text-xs', active ? 'text-slate-300' : 'text-slate-500')}>{active ? `Current position · ${maturity.score}` : l.description}</span>
                    <span className={cn('text-[11px] tabular-nums', active ? 'text-slate-300' : 'text-slate-400')}>
                      {l.min}–{l.max}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 grid grid-cols-5 gap-2">
              {maturity.dimensions.map((d) => (
                <div key={d.name} className="text-center">
                  <div className="mx-auto flex h-20 w-7 items-end overflow-hidden rounded-md bg-slate-100">
                    <div className="w-full rounded-t-[4px] bg-brand-500" style={{ height: `${d.score}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] font-bold tabular-nums text-ink-950">{d.score}</p>
                  <p className="truncate text-[10px] text-slate-500">{d.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ───────── Workforce dashboard ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Executive workforce dashboard"
          title="Department readiness at a glance"
          text="Every employee is classified as AI Ready, Currently Upskilling or Priority Reskilling from their measured readiness and the AI exposure of their role — so you can see where capability lags change."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card className="flex flex-col items-center">
            <DonutChart segments={statusSegments} centerValue={split.total} centerLabel="Employees" />
            <ChartLegend className="mt-5 justify-center" items={statusSegments.map((s) => ({ label: s.label, color: s.color, value: `${Math.round((s.value / split.total) * 100)}%` }))} />
            <p className="mt-4 text-center text-xs text-slate-500">
              Average readiness {avg.readiness}% · {cert.total} certified
            </p>
          </Card>
          <Card className="lg:col-span-2">
            <p className="mb-3 text-sm font-bold text-ink-950">AI readiness by department</p>
            <HorizontalBarList
              items={depts.map((d) => ({ label: d.department, value: d.readiness, display: `${d.readiness}%`, color: hex(d.readiness), sublabel: `${d.count} employees`, marker: d.exposure, markerLabel: 'AI exposure' }))}
            />
            {insight && (
              <div className="mt-4 flex gap-3 rounded-xl bg-ink-950 p-4 text-white">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-300">AI management insight</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">{insight.detail}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ───────── Skills gap ───────── */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Skills-gap intelligence"
            title="See exactly which capabilities are missing — and where"
            text="Competency coverage by department, the most vulnerable skills, emerging skills your transformation needs, and employees ready for advanced AI responsibilities."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card>
              <p className="mb-3 text-sm font-bold text-ink-950">Competency coverage heatmap · % meeting each requirement</p>
              <Heatmap rows={heat.rows.map((r) => ({ id: r.id, label: r.label }))} cols={heat.cols.map((c) => ({ id: c.id, label: c.label }))} values={heat.values} />
            </Card>
            <Card>
              <p className="mb-3 text-sm font-bold text-ink-950">Most vulnerable skills</p>
              <ul className="space-y-3">
                {vulnerable.map((s) => (
                  <li key={s.skillId}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-ink-900">{s.name}</span>
                      <span className="shrink-0 font-bold tabular-nums text-clay-700">{s.belowPct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-clay-500" style={{ width: `${s.belowPct}%` }} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">below {SKILL_LEVEL_LABELS[s.required]}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────── Employer-defined competencies ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Employer-defined competencies"
          title="“AI ready” means something different in a bank and on a mine"
          text="Start from an industry template, then tailor each competency, its mapped skills, required level and priority. Your framework drives skills-gap analysis and Employer AI Ready certification."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { tpl: bank, icon: 'Landmark', title: 'A bank requires…' },
            { tpl: mining, icon: 'Pickaxe', title: 'A mining company requires…' },
          ].map(({ tpl, icon, title }) => (
            <Card key={tpl.id}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 text-white">
                  <Icon name={icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-ink-950">{title}</p>
                  <p className="text-xs text-slate-500">{tpl.label} template</p>
                </div>
              </div>
              <ul className="space-y-2">
                {tpl.competencies.map(([name, , skills, , priority]) => (
                  <li key={name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-950">{name}</span>
                      <span className="block truncate text-[11px] text-slate-500">{skills.map(skillName).join(' · ')}</span>
                    </span>
                    <Badge tone={PRIORITY_META[priority].tone}>{PRIORITY_META[priority].label}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* ───────── Certification ───────── */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <ChevronPattern color="#ffffff" opacity={0.05} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading light eyebrow="Two kinds of certification" title="Domain AI Ready vs Employer AI Ready" text="Independent, portable proof of professional AI competency — plus proof that an employee meets your organisation’s specific requirements." />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { meta: CERT_TYPE_META.domain, icon: <Globe2 className="h-6 w-6" />, tags: ['Independent', 'Profession-based', 'Portable across employers'], color: 'text-sky-300', count: `${cert.domainTotal} holders at ${org.name}` },
              { meta: CERT_TYPE_META.employer, icon: <Building2 className="h-6 w-6" />, tags: ['Organisation-specific', 'Competency-based', 'Requires Domain AI Capable+'], color: 'text-brand-300', count: `${cert.employer} holders · ${cert.eligibleNow.length} eligible now` },
            ].map((c) => (
              <div key={c.meta.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10', c.color)}>{c.icon}</span>
                <h3 className="mt-4 text-xl font-extrabold">{c.meta.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{c.meta.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <Badge key={t} tone="white">
                      {t}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-400">Demo: {c.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Advisor ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="AI Workforce Advisor"
              title="Ask strategic questions. Get answers grounded in your data."
              text="The Advisor, powered by Google Gemini, reads your live workforce analytics and answers with specific numbers, departments and recommended learning modules. Try it with the fictional bank's data:"
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuestion(q)}
                  aria-pressed={question === q}
                  className={cn('rounded-full border px-3.5 py-2 text-sm font-medium transition', question === q ? 'border-ink-950 bg-ink-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300')}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <Card className="shadow-lift">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-950 px-4 py-2.5 text-[15px] text-white">{question}</p>
            </div>
            <div key={question} className="mt-4 flex animate-fade-up gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Bot className="h-4 w-4" />
              </span>
              <div className="min-w-0 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3">
                <RichText text={answer} className="text-[14px] text-slate-700" />
              </div>
            </div>
            <AIDisclaimer className="mt-4">Sample answer generated from the fictional Savanna Crest Bank workforce. In the product, Gemini answers follow-up questions in context.</AIDisclaimer>
          </Card>
        </div>
      </section>

      {/* ───────── Industries ───────── */}
      <section className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Built for Zimbabwean industries</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
            {INDUSTRY_STRIP.map((i) => (
              <li key={i.label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-canvas px-4 py-2 text-sm font-semibold text-slate-700">
                <Icon name={i.icon} className="h-4 w-4 text-brand-600" />
                {i.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-12 text-center text-white shadow-glow sm:px-12">
          <ChevronPattern color="#ffffff" opacity={0.08} />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">Find out where to invest in reskilling — in minutes</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">Assess your organisation’s AI maturity and see a workforce readiness dashboard immediately, using sample data until your employees join.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="gold" to="/login?role=employer&mode=signup" iconRight={<ArrowRight className="h-5 w-5" />}>
                Start employer assessment
              </Button>
              <Button size="lg" variant="white" to="/demo">
                View live demo
              </Button>
            </div>
            <AccentBar className="mx-auto mt-8 max-w-[10rem] opacity-80" />
            <p className="mt-4 text-xs text-white/70">Savanna Crest Bank and all people shown are fictional.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
