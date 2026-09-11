import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BadgeCheck, BookOpen, Building2, Circle, CircleCheck, ClipboardCheck, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import type { Certificate, CertificationLevel } from '../../types';
import { useApp } from '../../services/store';
import { Badge, Button, Card, CardTitle, PageHeader, ProgressBar } from '../../components/ui';
import { ChevronPattern } from '../../components/brand';
import { CERT_TYPE_META, evaluateCertification, LEVEL_META, LEVEL_ORDER } from '../../lib/certification';
import type { CertificationStatus } from '../../lib/certification';
import { cn, formatDate } from '../../lib/utils';
import { bestValidCertificate, CERT_STATE_META, certDisplayState, daysUntil, humanDays, tint } from './cert-utils';

export default function CertificatesPage() {
  const { certificates, progress, submissions, results, organisation } = useApp();
  const status = useMemo(() => evaluateCertification({ progress, submissions, results }), [progress, submissions, results]);
  const best = bestValidCertificate(certificates);
  const heldRank = best ? LEVEL_META[best.level].rank : 0;
  const claimable = status.achievableLevel && LEVEL_META[status.achievableLevel].rank > heldRank ? status.achievableLevel : null;
  const towards = status.nextLevel && LEVEL_META[status.nextLevel].rank > heldRank ? status.nextLevel : null;

  return (
    <div>
      <PageHeader
        eyebrow="Certification"
        title="My Certificates"
        description="Verifiable credentials that prove demonstrated AI competency — never just course completion."
        actions={
          <>
            <Button to="/verify" variant="ghost" icon={<ShieldCheck className="h-4 w-4" />}>
              Verify a certificate
            </Button>
            <Button to="/app/assessments" variant="outline" icon={<ClipboardCheck className="h-4 w-4" />}>
              Assessments
            </Button>
          </>
        }
      />

      {claimable && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-ink-950">You meet the requirements for {LEVEL_META[claimable].label}</p>
              <p className="text-sm text-slate-600">Claim your certificate from the assessments hub — it will appear here and be publicly verifiable.</p>
            </div>
          </div>
          <Button to="/app/assessments" iconRight={<ArrowRight className="h-4 w-4" />}>
            Claim certificate
          </Button>
        </div>
      )}

      {certificates.length ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((c) => (
              <CertificateTile key={c.id} c={c} />
            ))}
          </section>
          {towards && (
            <Card className="mt-6">
              <NextLevelProgress status={status} level={towards} />
            </Card>
          )}
        </>
      ) : (
        <NoCertificates status={status} />
      )}

      <TypesSection organisationName={organisation?.name} hasEmployerReqs={Boolean(organisation?.requiredCompetencies?.length)} />
      <LevelsSection status={status} heldRank={heldRank} />
    </div>
  );
}

function CertificateTile({ c }: { c: Certificate }) {
  const meta = LEVEL_META[c.level];
  const st = certDisplayState(c);
  const sm = CERT_STATE_META[st];
  const left = daysUntil(c.expiryDate);
  return (
    <Link
      to={`/app/certificates/${c.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative overflow-hidden px-5 pb-5 pt-4 text-white" style={{ background: `linear-gradient(135deg, ${meta.color} 0%, #0b1220 150%)` }}>
        <ChevronPattern color="#ffffff" opacity={0.12} />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">{CERT_TYPE_META[c.type].label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{meta.label}</p>
            {c.organisationName && <p className="mt-0.5 truncate text-xs font-semibold text-gold-200">{c.organisationName}</p>}
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <Award className="h-6 w-6" />
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="font-bold leading-snug text-ink-950">{c.competency}</p>
        <p className="mt-0.5 text-sm text-slate-500">{c.domainName}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold text-slate-400">Issued</dt>
            <dd className="font-semibold text-ink-900">{formatDate(c.issueDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400">Valid until</dt>
            <dd className="font-semibold text-ink-900">{formatDate(c.expiryDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400">Readiness score</dt>
            <dd className="font-semibold tabular-nums text-ink-900">{Math.round(c.readinessScore)}%</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold text-slate-400">Certificate ID</dt>
            <dd className="truncate font-mono text-[13px] font-semibold text-ink-900">{c.id}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge tone={sm.tone}>{sm.label}</Badge>
            <span className="truncate text-xs text-slate-500">{st === 'valid' || st === 'expiring' ? `${humanDays(left)} left` : st === 'expired' ? `Expired ${formatDate(c.expiryDate)}` : 'Not valid'}</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700">
            View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function NextLevelProgress({ status, level }: { status: CertificationStatus; level: CertificationLevel }) {
  const meta = LEVEL_META[level];
  const reqs = status.requirements.filter((r) => r.level === level);
  const overall = reqs.length ? Math.round(reqs.reduce((a, r) => a + r.progress, 0) / reqs.length) : 0;
  const met = reqs.filter((r) => r.met).length;
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: meta.color }}>
            Next level
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink-950">Progress towards {meta.label}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{meta.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold tabular-nums text-ink-950">{overall}%</p>
          <p className="text-xs text-slate-500">
            {met}/{reqs.length} met
          </p>
        </div>
      </div>
      <ProgressBar value={overall} color={meta.color} size="md" className="mt-4" />
      <ul className="mt-5 space-y-3">
        {reqs.map((r) => (
          <li key={r.id} className="flex items-start gap-3">
            {r.met ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className={cn('text-sm font-semibold', r.met ? 'text-ink-950' : 'text-slate-700')}>{r.label}</p>
                <p className="text-xs text-slate-500">{r.detail}</p>
              </div>
              {!r.met && <ProgressBar value={r.progress} size="xs" color={meta.color} className="mt-1.5" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoCertificates({ status }: { status: CertificationStatus }) {
  const target = status.nextLevel ?? 'AI_AWARE';
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="relative overflow-hidden bg-ink-950 p-6 text-white sm:p-8">
          <ChevronPattern color="#ffffff" opacity={0.06} />
          <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-ink-950">
              <Award className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight">Earn your first certificate</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
              ZimAI Ready certificates prove <strong className="text-white">demonstrated</strong> competency. Completing lessons alone never certifies anyone — you show what you can do.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                { icon: <BookOpen className="h-4 w-4" />, title: 'Complete your learning path', text: 'Required modules and practical workplace activities.' },
                { icon: <GraduationCap className="h-4 w-4" />, title: 'Pass the final knowledge assessment', text: 'AI concepts, tools, domain application and verification.' },
                { icon: <ShieldCheck className="h-4 w-4" />, title: 'Complete the practical capstone', text: 'A realistic task in your profession, including responsible AI.' },
              ].map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold ring-1 ring-white/15">{i + 1}</span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      {s.icon}
                      {s.title}
                    </p>
                    <p className="text-sm text-slate-400">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button to="/app/assessments" variant="gold" iconRight={<ArrowRight className="h-4 w-4" />}>
                Go to assessments
              </Button>
              <Button to="/app/learning" variant="white">
                Continue learning
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <NextLevelProgress status={status} level={target} />
          <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
            Required learning: {status.requiredCompleted}/{status.requiredTotal} modules · Practical activities passed: {status.practicalsCompleted} ·{' '}
            {status.finalUnlocked ? 'Final assessment unlocked' : 'Final assessment unlocks after half of your required learning'}
          </p>
        </div>
      </div>
    </Card>
  );
}

function TypesSection({ organisationName, hasEmployerReqs }: { organisationName?: string; hasEmployerReqs: boolean }) {
  const items = [
    {
      type: 'domain' as const,
      icon: <BadgeCheck className="h-5 w-5" />,
      points: ['Portable — it belongs to you, not your employer', 'Based on your professional domain pathway', 'Three levels: AI Aware, AI Capable, AI Ready'],
    },
    {
      type: 'employer' as const,
      icon: <Building2 className="h-5 w-5" />,
      points: [
        'Requires a Domain certificate at AI Capable or above',
        'Every critical and important employer competency met',
        organisationName ? (hasEmployerReqs ? `Your employer: ${organisationName}` : `${organisationName} has not yet defined AI competencies`) : 'Available when your employer defines AI competencies',
      ],
    },
  ];
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-ink-950">Two certification types</h2>
      <p className="mt-1 text-sm text-slate-500">Every certificate is publicly verifiable by ID or QR code and valid for 12 months.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <Card key={it.type}>
            <CardTitle icon={it.icon} title={CERT_TYPE_META[it.type].label} subtitle={CERT_TYPE_META[it.type].description} />
            <ul className="space-y-2">
              {it.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LevelsSection({ status, heldRank }: { status: CertificationStatus; heldRank: number }) {
  const achievedRank = status.achievableLevel ? LEVEL_META[status.achievableLevel].rank : 0;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-ink-950">Three certification levels</h2>
      <p className="mt-1 text-sm text-slate-500">Each level builds on the one before. Your live status against every requirement is shown below.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {LEVEL_ORDER.map((lvl) => {
          const meta = LEVEL_META[lvl];
          const reqs = status.requirements.filter((r) => r.level === lvl);
          const held = heldRank >= meta.rank;
          const achieved = achievedRank >= meta.rank;
          return (
            <Card key={lvl} padded={false} className="overflow-hidden">
              <div className="h-1.5" style={{ background: meta.color }} />
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Level {meta.rank}</p>
                    <h3 className="mt-0.5 text-xl font-extrabold" style={{ color: meta.color }}>
                      {meta.label}
                    </h3>
                  </div>
                  {held ? <Badge tone="brand">Certified</Badge> : achieved ? <Badge tone="gold">Eligible</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-slate-600">{meta.description}</p>
                <ul className="mt-4 space-y-2 rounded-xl p-3" style={{ background: tint(meta.color, 0.05) }}>
                  {reqs.map((r) => (
                    <li key={r.id} className="flex items-start gap-2 text-[13px]">
                      {r.met ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
                      <span className={r.met ? 'text-ink-900' : 'text-slate-600'}>{r.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
