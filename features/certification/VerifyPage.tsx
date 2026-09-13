import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  CircleCheck,
  GraduationCap,
  Info,
  KeyRound,
  Link2,
  ScanLine,
  SearchCheck,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { Certificate } from '../../types';
import { useApp } from '../../services/store';
import { localDb } from '../../services/backend';
import { seedPublicDemoData, DEMO_CERTIFICATE_ID } from '../../data/demo/seed';
import { Badge, Button, ErrorState, Skeleton, useToast } from '../../components/ui';
import { LogoMark } from '../../components/brand';
import { DeckSection, GhostText, Reveal } from '../../components/motion';
import { CertificateRibbon, GhostMascot, ShieldHands, Sparkle, Squiggle } from '../../components/illustrations';
import { CERT_TYPE_META, certificateState, LEVEL_META } from '../../lib/certification';
import { CERT_RULES } from '../../config';
import { cn, formatDate, nowISO, sleep } from '../../lib/utils';
import { CERT_ID_HINT, CERT_ID_PATTERN, copyText, normaliseCertId, tint, verificationUrl } from './cert-utils';

type Phase =
  | { kind: 'idle' }
  | { kind: 'loading'; id: string }
  | { kind: 'found'; cert: Certificate; hasProfile: boolean; checkedAt: string }
  | { kind: 'not-found'; id: string; reason: 'format' | 'missing' }
  | { kind: 'error'; id: string };

export default function VerifyPage() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const { lookupCertificate, lookupPublic, ready } = useApp();
  const [input, setInput] = useState(certId ? normaliseCertId(certId) : '');
  const [inputError, setInputError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [phase, setPhase] = useState<Phase>(certId ? { kind: 'loading', id: normaliseCertId(certId) } : { kind: 'idle' });
  const reqRef = useRef(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Make sure the public demo certificate always exists on this device.
  useEffect(() => {
    let alive = true;
    seedPublicDemoData(localDb)
      .catch((e) => console.warn('[ZimAI] demo seed failed', e))
      .finally(() => alive && setSeeded(true));
    return () => {
      alive = false;
    };
  }, []);

  const run = useCallback(
    async (raw: string) => {
      const id = normaliseCertId(raw);
      const req = ++reqRef.current;
      if (!CERT_ID_PATTERN.test(id)) {
        setPhase({ kind: 'not-found', id, reason: 'format' });
        return;
      }
      setPhase({ kind: 'loading', id });
      try {
        const [cert] = await Promise.all([lookupCertificate(id), sleep(450)]);
        if (req !== reqRef.current) return;
        if (!cert) {
          setPhase({ kind: 'not-found', id, reason: 'missing' });
          return;
        }
        let hasProfile = false;
        try {
          hasProfile = Boolean(await lookupPublic('publicProfiles', cert.userId));
        } catch {
          hasProfile = false;
        }
        if (req !== reqRef.current) return;
        setPhase({ kind: 'found', cert, hasProfile, checkedAt: nowISO() });
      } catch (e) {
        console.warn('[ZimAI] verification failed', e);
        if (req === reqRef.current) setPhase({ kind: 'error', id });
      }
    },
    [lookupCertificate, lookupPublic],
  );

  // Verify whenever the route param changes — once the demo data is seeded and the
  // backend (local or Firestore) is ready. A ref keeps this from re-running when
  // the store's lookup callbacks change identity.
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    if (!seeded || !ready) return;
    if (certId) {
      setInput(normaliseCertId(certId));
      runRef.current(certId);
    } else {
      reqRef.current++;
      setPhase({ kind: 'idle' });
    }
  }, [certId, seeded, ready]);

  // On small screens, bring the result into view once it is ready.
  useEffect(() => {
    if ((phase.kind === 'found' || phase.kind === 'not-found') && window.innerWidth < 768) {
      const t = setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      return () => clearTimeout(t);
    }
  }, [phase.kind]);

  const go = (id: string) => {
    setInputError(null);
    setInput(id);
    if (certId && normaliseCertId(certId) === id) run(id);
    else navigate(`/verify/${id}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = normaliseCertId(input);
    if (!id) {
      setInputError('Enter the certificate ID printed on the certificate.');
      return;
    }
    if (!CERT_ID_PATTERN.test(id)) {
      setInputError(`Certificate IDs follow the format ${CERT_ID_HINT}, e.g. ${DEMO_CERTIFICATE_ID}.`);
      return;
    }
    go(id);
  };

  const loading = phase.kind === 'loading' || ((!seeded || !ready) && Boolean(certId));

  return (
    <div className="relative overflow-x-clip">
      {/* Hero & search */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden />
        <div className="pointer-events-none absolute left-[4%] top-40 hidden -rotate-6 xl:block" aria-hidden>
          <div className="animate-ghost-in" style={{ animationDelay: '300ms' }}>
            <CertificateRibbon className="h-44 w-44 animate-float" animated />
          </div>
        </div>
        <div className="pointer-events-none absolute right-[4%] top-48 hidden rotate-3 xl:block" aria-hidden>
          <div className="animate-ghost-in" style={{ animationDelay: '450ms' }}>
            <ShieldHands className="h-40 w-40" animated />
          </div>
        </div>
        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-28 text-center sm:px-6 sm:pb-14 sm:pt-36">
          <span className="inline-flex animate-ghost-in items-center gap-2 rounded-full border border-ink-950/15 bg-paper px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700 shadow-card">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-800" />
            Certificate verification
          </span>
          <h1 className="mt-6 text-balance text-[2.6rem] leading-[0.95] text-ink-950 sm:text-7xl">
            <span className="sr-only">Verify a ZimAI Ready certificate</span>
            <span aria-hidden>
              <GhostText text="Verify a ZimAI Ready" startOnView={false} stagger={70} />{' '}
              <span className="relative inline-block">
                <GhostText text="*certificate*" accentClassName="italic text-brand-800" startOnView={false} delay={320} stagger={100} />
                <Squiggle className="absolute -bottom-2 left-0 h-4 w-full sm:-bottom-3 sm:h-5" color="#ffa946" animated />
              </span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-ghost-in text-[15px] leading-relaxed text-ink-600 sm:text-lg" style={{ animationDelay: '380ms' }}>
            Authentic. Current. Proven.
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mx-auto mt-9 flex max-w-xl animate-ghost-in flex-col gap-2 rounded-3xl border border-ink-950 bg-paper p-2 shadow-ink sm:flex-row"
            style={{ animationDelay: '460ms' }}
          >
            <label htmlFor="cert-id" className="sr-only">
              Certificate ID
            </label>
            <div className="relative flex-1">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
              <input
                id="cert-id"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value.toUpperCase());
                  if (inputError) setInputError(null);
                }}
                placeholder="ZAR-2026-XXXXXX"
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={24}
                aria-invalid={Boolean(inputError)}
                aria-describedby="cert-id-hint"
                className={cn(
                  'h-12 w-full rounded-2xl bg-sand-200/60 pl-12 pr-3 font-mono text-base uppercase tracking-wider text-ink-950 outline-none transition-colors placeholder:text-ink-400 focus:bg-canvas focus:ring-2 sm:h-14 sm:text-lg',
                  inputError ? 'ring-2 ring-clay-400 focus:ring-clay-500' : 'focus:ring-lilac-300',
                )}
              />
            </div>
            <Button type="submit" size="lg" loading={loading} icon={<SearchCheck className="h-5 w-5" />}>
              Verify
            </Button>
          </form>
          <p id="cert-id-hint" className={cn('mt-4 text-sm', inputError ? 'font-medium text-clay-700' : 'text-ink-500')} role={inputError ? 'alert' : undefined}>
            {inputError ?? `Format: ${CERT_ID_HINT} — printed on the certificate next to the QR code.`}
          </p>
          <button
            type="button"
            onClick={() => go(DEMO_CERTIFICATE_ID)}
            className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-ink-950 bg-gold-400 px-3.5 py-1.5 text-sm font-semibold text-ink-950 transition hover:-translate-y-px hover:shadow-ink-sm"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Try the demo certificate: <span className="font-mono">{DEMO_CERTIFICATE_ID}</span>
            </span>
          </button>
        </div>
      </section>

      {/* Result */}
      <section ref={resultRef} className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-28 sm:px-6 sm:pb-36" aria-live="polite">
        {loading ? (
          <LoadingCard id={phase.kind === 'loading' ? phase.id : normaliseCertId(certId ?? '')} />
        ) : phase.kind === 'found' ? (
          <ResultCard cert={phase.cert} hasProfile={phase.hasProfile} checkedAt={phase.checkedAt} />
        ) : phase.kind === 'not-found' ? (
          <NotFoundCard id={phase.id} reason={phase.reason} onDemo={() => go(DEMO_CERTIFICATE_ID)} />
        ) : phase.kind === 'error' ? (
          <ErrorState
            title="We couldn't reach the certificate register"
            message="Your connection may have dropped. Please try again in a moment."
            onRetry={() => run(phase.id)}
          />
        ) : (
          <HowToVerify />
        )}
      </section>

      <Guarantees />
    </div>
  );
}

// ───────────────────────── Result states ─────────────────────────

function LoadingCard({ id }: { id: string }) {
  return (
    <div className="animate-ghost-in rounded-4xl border border-ink-950/10 bg-paper p-5 shadow-card sm:p-7">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <span className="absolute inset-1 animate-ghost-pulse rounded-full bg-lilac-300/60 blur-lg" aria-hidden />
          <GhostMascot mood="thinking" className="relative h-14 w-14" animated />
        </div>
        <div className="min-w-0">
          <p className="font-display text-2xl leading-tight text-ink-950">Checking the certificate register…</p>
          <p className="truncate font-mono text-sm text-ink-500">{id}</p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
    </div>
  );
}

const RESULT_META = {
  valid: {
    label: 'VERIFIED',
    title: 'This certificate is authentic and valid',
    bar: 'bg-brand-800 text-canvas',
    icon: <ShieldCheck className="h-7 w-7" />,
    statusText: 'Valid',
    statusCls: 'text-brand-800',
  },
  expired: {
    label: 'EXPIRED',
    title: 'Authentic certificate — no longer valid',
    bar: 'bg-gold-400 text-ink-950',
    icon: <ShieldAlert className="h-7 w-7" />,
    statusText: 'Expired',
    statusCls: 'text-gold-700',
  },
  revoked: {
    label: 'REVOKED',
    title: 'This certificate has been revoked',
    bar: 'bg-clay-800 text-canvas',
    icon: <ShieldX className="h-7 w-7" />,
    statusText: 'Revoked',
    statusCls: 'text-clay-700',
  },
} as const;

/** Sparkles that burst around the verified stamp. */
const SPARKS = [
  { cls: 'left-[6%] top-3 h-6 w-6', color: '#ffa946', d: 0 },
  { cls: 'right-[10%] top-2 h-8 w-8', color: '#c8f0dc', d: 180 },
  { cls: 'right-[34%] -top-2 h-5 w-5', color: '#ffbcf2', d: 320 },
  { cls: 'left-[40%] bottom-2 h-5 w-5', color: '#fffeeb', d: 460 },
  { cls: 'right-[4%] bottom-3 h-6 w-6', color: '#ffa946', d: 600 },
];

function ResultCard({ cert, hasProfile, checkedAt }: { cert: Certificate; hasProfile: boolean; checkedAt: string }) {
  const toast = useToast();
  const state = certificateState(cert);
  const meta = RESULT_META[state];
  const level = LEVEL_META[cert.level];
  const url = verificationUrl(cert.id);
  const long = { day: 'numeric', month: 'long', year: 'numeric' } as const;

  const subtitle =
    state === 'valid'
      ? `Issued by ZimAI Ready and valid until ${formatDate(cert.expiryDate, long)}.`
      : state === 'expired'
        ? `It expired on ${formatDate(cert.expiryDate, long)}. AI readiness must be renewed every 12 months — ask the holder for their renewed certificate.`
        : 'It must not be relied upon as evidence of AI competency.';

  const rows: { label: string; value: ReactNode }[] = [
    { label: 'Certificate ID', value: <span className="font-mono">{cert.id}</span> },
    { label: 'Verification status', value: <span className={cn('font-bold', meta.statusCls)}>{meta.statusText}</span> },
    { label: 'Certificate type', value: `${CERT_TYPE_META[cert.type].label}${cert.organisationName ? ` · ${cert.organisationName}` : ''}` },
    { label: 'Domain', value: cert.domainName },
    { label: 'Competency', value: cert.competency },
    { label: 'AI readiness level', value: <span style={{ color: level.color }} className="font-bold">{level.label}</span> },
    { label: 'Readiness score', value: `${Math.round(cert.readinessScore)}%` },
    { label: 'Issue date', value: formatDate(cert.issueDate, long) },
    { label: 'Expiry date', value: formatDate(cert.expiryDate, long) },
    {
      label: 'Issuer',
      value: (
        <span className="inline-flex items-center gap-1.5">
          <LogoMark className="h-4 w-4" /> ZimAI Ready
        </span>
      ),
    },
  ];

  const evidence = [
    { label: 'Knowledge assessment', score: cert.evidence.knowledgeScore },
    { label: 'Practical capstone', score: cert.evidence.capstoneScore },
    { label: 'Responsible AI', score: cert.evidence.responsibleAIScore },
  ];

  return (
    <div className="animate-ghost-in">
      <div className="overflow-hidden rounded-4xl border border-ink-950 bg-paper shadow-ink">
        {/* Status band */}
        <div className={cn('relative flex items-center gap-4 overflow-hidden px-5 py-6 sm:px-8 sm:py-7', meta.bar)}>
          {state === 'valid' && (
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {SPARKS.map((s, i) => (
                <span key={i} className={cn('absolute animate-ghost-in', s.cls)} style={{ animationDelay: `${s.d}ms` }}>
                  <Sparkle className="h-full w-full" color={s.color} animated />
                </span>
              ))}
            </div>
          )}
          <span className="relative flex h-14 w-14 shrink-0 animate-scale-in items-center justify-center rounded-full border-2 border-current">
            {state === 'valid' && <span className="absolute inset-0 animate-ping-slow rounded-full border-2 border-current opacity-40" aria-hidden />}
            {meta.icon}
          </span>
          <div className="relative min-w-0">
            <p className="font-condensed text-2xl uppercase leading-none tracking-wide sm:text-3xl">{meta.label}</p>
            <h2 className="mt-1 text-xl leading-snug sm:text-2xl">{meta.title}</h2>
          </div>
        </div>

        {/* Certificate body with an inset frame */}
        <div className="p-3 sm:p-4">
          <div className="relative rounded-3xl border border-dashed border-ink-950/25 p-4 sm:p-6">
            <div className="pointer-events-none absolute -right-2 -top-3 hidden sm:block" aria-hidden>
              <CertificateRibbon className="h-24 w-24" animated={state === 'valid'} />
            </div>
            <p className="max-w-lg text-sm text-ink-600 sm:pr-20">{subtitle}</p>

            <div className="mt-6 flex flex-col-reverse gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Certificate holder</p>
                <p className="mt-1 break-words font-display text-4xl leading-tight text-ink-950 sm:text-5xl">{cert.holderName}</p>
                <Squiggle className="mt-1 h-3 w-32" color={level.color} animated={state === 'valid'} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: tint(level.color, 0.12), color: level.color }}>
                    <BadgeCheck className="h-3.5 w-3.5" /> {level.label}
                  </span>
                  <Badge tone="neutral">{CERT_TYPE_META[cert.type].label}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:mt-16 sm:flex-col sm:items-end">
                <div className="rounded-2xl border border-ink-950/15 bg-canvas p-2">
                  <QRCodeSVG value={url} size={88} marginSize={0} level="M" fgColor="#1a1a1a" bgColor="#fffeeb" />
                </div>
                <p className="flex items-center gap-1 text-[11px] font-medium text-ink-500">
                  <ScanLine className="h-3.5 w-3.5" /> Scan to re-open this check
                </p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-950/10 bg-ink-950/10 sm:grid-cols-2">
              {rows.map((r, i) => (
                <div key={r.label} className="animate-ghost-in bg-paper px-4 py-3" style={{ animationDelay: `${150 + i * 40}ms` }}>
                  <dt className="text-xs font-semibold text-ink-400">{r.label}</dt>
                  <dd className="mt-0.5 break-words text-sm font-semibold text-ink-950">{r.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <p className="font-display text-xl text-ink-950">Verified competencies</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {cert.competencies.map((c) => (
                  <Badge key={c.name} tone="brand" icon={<CircleCheck className="h-3.5 w-3.5" />} className="px-3 py-1 text-[13px]">
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {evidence.map((e) => (
                <div key={e.label} className="rounded-2xl bg-sand-200/60 px-4 py-3">
                  <p className="text-xs font-semibold text-ink-500">{e.label}</p>
                  <p className="mt-1 font-condensed text-3xl leading-none tabular-nums text-ink-950">{e.score ? `${Math.round(e.score)}%` : '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 px-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {hasProfile && (
                <Button to={`/p/${cert.userId}`} variant="primary" size="sm" icon={<UserRound className="h-4 w-4" />}>
                  View AI Skills Profile
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={<Link2 className="h-4 w-4" />}
                onClick={async () => ((await copyText(url)) ? toast.success('Verification link copied') : toast.error('Could not copy the link', url))}
              >
                Copy verification link
              </Button>
            </div>
            <p className="text-xs text-ink-400">Checked {formatDate(checkedAt, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundCard({ id, reason, onDemo }: { id: string; reason: 'format' | 'missing'; onDemo: () => void }) {
  return (
    <div className="animate-ghost-in rounded-4xl border border-ink-950/10 bg-paper p-5 shadow-card sm:p-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row">
        <div className="relative shrink-0">
          <GhostMascot mood="thinking" className="h-20 w-20 animate-ghost-float" animated />
          <span className="absolute -bottom-1 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-ink-950 bg-blush-200 text-ink-950 shadow-ink-sm">
            <SearchX className="h-4 w-4" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-condensed text-xl uppercase leading-none tracking-wide text-clay-500">Not found</p>
          <h2 className="mt-2 text-3xl leading-tight text-ink-950">
            {reason === 'format' ? "That isn't a valid certificate ID" : (
              <>
                No certificate matches <span className="break-all font-mono text-2xl">{id}</span>
              </>
            )}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            {reason === 'format'
              ? `ZimAI Ready certificate IDs follow the format ${CERT_ID_HINT}.`
              : 'We could not match this ID to a certificate issued on this deployment of ZimAI Ready. This does not necessarily mean the certificate is fake.'}
          </p>
        </div>
      </div>
      <ul className="mt-6 space-y-2.5 rounded-3xl bg-sand-200/60 p-4 text-sm text-ink-600 sm:p-5">
        {[
          'Check the ID carefully — the six-character code never uses the look-alike characters O, I, 0 or 1.',
          'Scan the QR code on the certificate instead of typing the ID.',
          'Ask the holder to share their verification link directly.',
          'Certificates issued on a different deployment of this prototype cannot be verified here.',
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
            {t}
          </li>
        ))}
      </ul>
      <Button variant="gold" size="sm" className="mt-5" icon={<Sparkles className="h-4 w-4" />} onClick={onDemo}>
        Try the demo certificate
      </Button>
    </div>
  );
}

function HowToVerify() {
  const steps = [
    { icon: <ScanLine className="h-5 w-5" />, title: 'Find the ID or QR code', c: 'bg-lilac-200' },
    { icon: <KeyRound className="h-5 w-5" />, title: 'Enter or scan it', c: 'bg-gold-400' },
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'Review the result', c: 'bg-blush-200' },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={500 + i * 100}>
          <div className="h-full rounded-3xl border border-ink-950/10 bg-paper p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-ink-950 hover:shadow-ink-sm">
            <div className="flex items-center justify-between">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl border border-ink-950 text-ink-950', s.c)}>{s.icon}</span>
              <span className="font-condensed text-5xl leading-none text-ink-950/10" aria-hidden>
                0{i + 1}
              </span>
            </div>
            <p className="mt-5 font-display text-2xl leading-tight text-ink-950">{s.title}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function Guarantees() {
  const items = [
    { icon: <GraduationCap className="h-5 w-5" />, title: 'Knowledge assessment', mark: CERT_RULES.knowledgePassMark },
    { icon: <Briefcase className="h-5 w-5" />, title: 'Practical capstone', mark: CERT_RULES.capstonePassMark },
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'Responsible AI', mark: CERT_RULES.responsibleAIPassMark },
  ];
  return (
    <DeckSection tone="teal" className="-mb-12 overflow-hidden sm:-mb-16">
      <div className="relative mx-auto max-w-5xl px-4 pb-40 pt-24 sm:px-6 sm:pb-52 sm:pt-36">
        <Reveal className="text-center">
          <div className="mb-8 flex justify-center" aria-hidden>
            <ShieldHands className="h-32 w-32 sm:h-44 sm:w-44" animated />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/60">What verification guarantees</p>
          <h2 className="mt-5 text-balance text-5xl leading-[0.95] text-canvas sm:text-7xl">
            Proven, <em className="text-gold-300">not just studied.</em>
          </h2>
        </Reveal>
        <dl className="mt-16 grid gap-10 text-center sm:mt-24 sm:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 120}>
              <dt className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-canvas/60">
                {it.icon}
                {it.title}
              </dt>
              <dd className="mt-3 font-condensed text-7xl leading-none text-canvas sm:text-8xl">
                <span className="align-top text-3xl text-gold-300 sm:text-4xl">≥</span>
                {it.mark}%
              </dd>
            </Reveal>
          ))}
        </dl>
        <Reveal delay={200} className="mx-auto mt-16 max-w-2xl space-y-3 text-center text-sm text-canvas/60 sm:mt-24">
          <p className="flex items-center justify-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-gold-300" />
            <span>
              <strong className="text-canvas">Valid for 12 months.</strong> Renewed annually.
            </span>
          </p>
          <p className="flex items-start justify-center gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Prototype: verifies certificates issued on this deployment of ZimAI Ready. All demo holders are fictional.</span>
          </p>
        </Reveal>
        <div className="mt-10 text-center">
          <Button to="/for-employers" variant="white" size="lg" iconRight={<ArrowRight className="h-4 w-4 shrink-0" />}>
            Measure your workforce
          </Button>
        </div>
      </div>
    </DeckSection>
  );
}
