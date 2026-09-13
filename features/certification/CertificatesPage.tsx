import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BadgeCheck, BookOpen, Building2, Circle, CircleCheck, ClipboardCheck, GraduationCap, ShieldCheck } from 'lucide-react';
import type { Certificate, CertificationLevel } from '../../types';
import { useApp } from '../../services/store';
import { Badge, Button, Card, CardTitle, PageHeader, ProgressBar } from '../../components/ui';
import { CERT_TYPE_META, evaluateCertification, LEVEL_META, LEVEL_ORDER } from '../../lib/certification';
import type { CertificationStatus } from '../../lib/certification';
import { cn, formatDate } from '../../lib/utils';
import { Reveal } from '../../components/motion';
import { CertificateRibbon } from '../../components/illustrations';
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
        title={<>My <em>certificates</em></>}
        description="Verifiable proof of demonstrated AI competency."
        actions={
          <>
            <CertificateRibbon animated className="pointer-events-none -my-6 mr-2 hidden h-28 w-28 animate-ghost-in lg:block" />
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
        <Reveal className="flex flex-col gap-3 mb-8 rounded-3xl border border-ink-950/10 bg-lilac-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div>
              <p className="font-display text-xl leading-snug text-ink-950">You meet the requirements for {LEVEL_META[claimable].label}</p>
              <p className="text-sm text-slate-600">Claim it from the assessments hub.</p>
            </div>
          </div>
          <Button to="/app/assessments" iconRight={<ArrowRight className="h-4 w-4" />}>
            Claim certificate
          </Button>
        </Reveal>
      )}

      {certificates.length ? (
        <>
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((c, i) => (
              <Reveal key={c.id} delay={Math.min(i, 6) * 70}>
                <CertificateTile c={c} />
              </Reveal>
            ))}
          </section>
          {towards && (
            <Card className="mt-8 rounded-4xl p-6 sm:p-8">
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
      className="group block h-full overflow-hidden rounded-3xl border border-ink-950/10 bg-paper shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-ink-950/40 hover:shadow-ink-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac-400"
    >
      <div className="relative overflow-hidden px-6 pb-6 pt-5 text-white" style={{ background: `linear-gradient(135deg, ${meta.color} 0%, #1a1a1a 150%)` }}>
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">{CERT_TYPE_META[c.type].label}</p>
            <p className="mt-1.5 font-condensed text-3xl uppercase leading-none tracking-wide">{meta.label}</p>
            {c.organisationName && <p className="mt-0.5 truncate text-xs font-semibold text-gold-300">{c.organisationName}</p>}
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <Award className="h-6 w-6" />
          </span>
        </div>
      </div>
      <div className="p-6">
        <p className="font-display text-xl font-medium leading-snug text-ink-950">{c.competency}</p>
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
            <dd className="font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{Math.round(c.readinessScore)}%</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold text-slate-400">Certificate ID</dt>
            <dd className="truncate font-mono text-[13px] font-semibold text-ink-900">{c.id}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink-950/10 pt-3">
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
          <h3 className="mt-1 font-display text-2xl font-medium leading-tight text-ink-950">Progress towards <em>{meta.label}</em></h3>
          <p className="mt-0.5 text-sm text-slate-500">{meta.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-4xl font-medium leading-none tabular-nums text-ink-950 sm:text-5xl">{overall}%</p>
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
    <Card padded={false} className="animate-ghost-in overflow-hidden rounded-4xl">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="relative overflow-hidden bg-brand-800 p-7 text-canvas sm:p-10">
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-ink-950">
              <Award className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-4xl leading-[1.02] sm:text-5xl">Earn your <em>first</em> certificate</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-canvas/75">Certificates prove what you can do — lessons alone never certify.</p>
            <ol className="mt-8 space-y-5">
              {[
                { icon: <BookOpen className="h-4 w-4" />, title: 'Complete your learning path', text: 'Required modules and practical workplace activities.' },
                { icon: <GraduationCap className="h-4 w-4" />, title: 'Pass the final knowledge assessment', text: 'AI concepts, tools, domain application and verification.' },
                { icon: <ShieldCheck className="h-4 w-4" />, title: 'Complete the practical capstone', text: 'A realistic task in your profession, including responsible AI.' },
              ].map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas/10 font-condensed text-base ring-1 ring-canvas/20">{i + 1}</span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      {s.icon}
                      {s.title}
                    </p>
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
        <div className="p-7 sm:p-10">
          <NextLevelProgress status={status} level={target} />
          <p className="mt-6 rounded-xl bg-sand-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
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
    <section className="mt-14 sm:mt-20">
      <h2 className="text-3xl leading-tight text-ink-950 sm:text-4xl">Two certification <em>types</em></h2>
      <p className="mt-2 text-sm text-slate-500">Publicly verifiable · valid for 12 months.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {items.map((it, i) => (
          <Reveal key={it.type} delay={i * 80}>
          <Card className="h-full rounded-3xl p-6 sm:p-8">
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
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function LevelsSection({ status, heldRank }: { status: CertificationStatus; heldRank: number }) {
  const achievedRank = status.achievableLevel ? LEVEL_META[status.achievableLevel].rank : 0;
  return (
    <section className="mt-14 sm:mt-20">
      <h2 className="text-3xl leading-tight text-ink-950 sm:text-4xl">Three certification <em>levels</em></h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {LEVEL_ORDER.map((lvl, i) => {
          const meta = LEVEL_META[lvl];
          const reqs = status.requirements.filter((r) => r.level === lvl);
          const held = heldRank >= meta.rank;
          const achieved = achievedRank >= meta.rank;
          return (
            <Reveal key={lvl} delay={i * 80}>
            <Card padded={false} className="h-full overflow-hidden rounded-3xl">
              <div className="h-1.5" style={{ background: meta.color }} />
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Level {meta.rank}</p>
                    <h3 className="mt-1 font-condensed text-2xl uppercase leading-none tracking-wide" style={{ color: meta.color }}>
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
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
