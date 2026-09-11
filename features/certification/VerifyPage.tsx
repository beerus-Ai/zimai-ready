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
import { Badge, Button, Card, ErrorState, Skeleton, Spinner, useToast } from '../../components/ui';
import { ChevronPattern, LogoMark } from '../../components/brand';
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
    <div className="relative">
      {/* Hero & search */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-10 sm:pt-16">
          <Badge tone="brand" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
            Certificate verification
          </Badge>
          <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink-950 sm:text-5xl">Verify a ZimAI Ready certificate</h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-slate-600 sm:text-base">
            Confirm that a professional's AI readiness certificate is authentic, current and backed by demonstrated competency.
          </p>

          <form onSubmit={onSubmit} noValidate className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lift sm:flex-row">
            <label htmlFor="cert-id" className="sr-only">
              Certificate ID
            </label>
            <div className="relative flex-1">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
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
                  'h-12 w-full rounded-xl bg-slate-50 pl-12 pr-3 font-mono text-base uppercase tracking-wider text-ink-950 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 sm:h-14 sm:text-lg',
                  inputError ? 'ring-2 ring-clay-400 focus:ring-clay-500' : 'focus:ring-brand-500',
                )}
              />
            </div>
            <Button type="submit" size="lg" loading={loading} icon={<SearchCheck className="h-5 w-5" />}>
              Verify
            </Button>
          </form>
          <p id="cert-id-hint" className={cn('mt-3 text-sm', inputError ? 'font-medium text-clay-700' : 'text-slate-500')} role={inputError ? 'alert' : undefined}>
            {inputError ?? `Format: ${CERT_ID_HINT} — printed on the certificate next to the QR code.`}
          </p>
          <button
            type="button"
            onClick={() => go(DEMO_CERTIFICATE_ID)}
            className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-3.5 py-1.5 text-sm font-semibold text-gold-800 transition hover:bg-gold-100"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-gold-600" />
            <span className="truncate">
              Try the demo certificate: <span className="font-mono">{DEMO_CERTIFICATE_ID}</span>
            </span>
          </button>
        </div>
      </section>

      {/* Result */}
      <section ref={resultRef} className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-12 sm:px-6" aria-live="polite">
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
    <Card className="animate-fade-in">
      <div className="flex items-center gap-3">
        <Spinner className="h-6 w-6" />
        <div>
          <p className="font-bold text-ink-950">Checking the certificate register…</p>
          <p className="font-mono text-sm text-slate-500">{id}</p>
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
    </Card>
  );
}

const RESULT_META = {
  valid: {
    label: 'VERIFIED',
    title: 'This certificate is authentic and valid',
    bar: 'bg-brand-600 text-white',
    icon: <ShieldCheck className="h-7 w-7" />,
    statusText: 'Valid',
    statusCls: 'text-brand-700',
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
    bar: 'bg-clay-600 text-white',
    icon: <ShieldX className="h-7 w-7" />,
    statusText: 'Revoked',
    statusCls: 'text-clay-700',
  },
} as const;

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
    <Card padded={false} className="animate-fade-up overflow-hidden">
      <div className={cn('relative flex items-center gap-4 overflow-hidden px-5 py-5 sm:px-7', meta.bar)}>
        <ChevronPattern color="currentColor" opacity={0.1} />
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">{meta.icon}</span>
        <div className="relative min-w-0">
          <p className="text-xs font-extrabold tracking-[0.22em]">{meta.label}</p>
          <h2 className="text-lg font-bold leading-snug sm:text-xl">{meta.title}</h2>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <p className="text-sm text-slate-600">{subtitle}</p>

        <div className="mt-5 flex flex-col-reverse gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Certificate holder</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{cert.holderName}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: tint(level.color, 0.1), color: level.color }}>
                <BadgeCheck className="h-3.5 w-3.5" /> {level.label}
              </span>
              <Badge tone="neutral">{CERT_TYPE_META[cert.type].label}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <div className="rounded-xl bg-white p-2 ring-1 ring-slate-200">
              <QRCodeSVG value={url} size={88} marginSize={0} level="M" fgColor="#0b1220" />
            </div>
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <ScanLine className="h-3.5 w-3.5" /> Scan to re-open this check
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="bg-white px-4 py-3">
              <dt className="text-xs font-semibold text-slate-400">{r.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-950">{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <p className="text-sm font-bold text-ink-950">Verified competencies</p>
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
            <div key={e.label} className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">{e.label}</p>
              <p className="mt-0.5 text-lg font-extrabold tabular-nums text-ink-950">{e.score ? `${Math.round(e.score)}%` : '—'}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {hasProfile && (
              <Button to={`/p/${cert.userId}`} variant="secondary" size="sm" icon={<UserRound className="h-4 w-4" />}>
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
          <p className="text-xs text-slate-400">Checked {formatDate(checkedAt, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </Card>
  );
}

function NotFoundCard({ id, reason, onDemo }: { id: string; reason: 'format' | 'missing'; onDemo: () => void }) {
  return (
    <Card className="animate-fade-up">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <SearchX className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-[0.22em] text-slate-500">NOT FOUND</p>
          <h2 className="mt-0.5 text-lg font-bold text-ink-950 sm:text-xl">
            {reason === 'format' ? "That isn't a valid certificate ID" : (
              <>
                No certificate matches <span className="break-all font-mono">{id}</span>
              </>
            )}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {reason === 'format'
              ? `ZimAI Ready certificate IDs follow the format ${CERT_ID_HINT}.`
              : 'We could not match this ID to a certificate issued on this deployment of ZimAI Ready. This does not necessarily mean the certificate is fake.'}
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-2.5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        {[
          'Check the ID carefully — the six-character code never uses the look-alike characters O, I, 0 or 1.',
          'Scan the QR code on the certificate instead of typing the ID.',
          'Ask the holder to share their verification link directly.',
          'Certificates issued on a different deployment of this prototype cannot be verified here.',
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {t}
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" className="mt-5" icon={<Sparkles className="h-4 w-4 text-gold-500" />} onClick={onDemo}>
        Try the demo certificate
      </Button>
    </Card>
  );
}

function HowToVerify() {
  const steps = [
    { icon: <ScanLine className="h-5 w-5" />, title: 'Find the ID or QR code', text: 'Printed at the bottom right of every ZimAI Ready certificate.' },
    { icon: <KeyRound className="h-5 w-5" />, title: 'Enter or scan it', text: 'Scanning the QR code opens this page with the result.' },
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'Review the result', text: 'Status, level, competencies and validity dates.' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((s, i) => (
        <div key={s.title} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
          <div className="flex items-center gap-2 text-brand-700">
            {s.icon}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
          </div>
          <p className="mt-2 text-sm font-bold text-ink-950">{s.title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

function Guarantees() {
  const items = [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: 'Knowledge assessment',
      text: `Passed a final knowledge assessment (≥ ${CERT_RULES.knowledgePassMark}% for AI Ready) covering AI concepts, tools, domain application and output verification.`,
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: 'Practical capstone',
      text: `Completed a realistic workplace task in their profession, evaluated against a published rubric (≥ ${CERT_RULES.capstonePassMark}%).`,
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Responsible AI',
      text: `Demonstrated privacy, bias awareness, verification and human oversight (≥ ${CERT_RULES.responsibleAIPassMark}% across knowledge and capstone).`,
    },
  ];
  return (
    <section className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">What verification guarantees</p>
          <h2 className="mt-2 text-balance text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">Demonstrated competency — not course completion</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] text-slate-600">
            A valid ZimAI Ready AI Ready certificate means the holder has proven, not just studied, their ability to use AI responsibly in their profession.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((it) => (
            <Card key={it.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{it.icon}</span>
              <h3 className="mt-3 font-bold text-ink-950">{it.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{it.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <p className="text-sm text-slate-600">
              <strong className="text-ink-950">Valid for 12 months.</strong> AI tools and risks change quickly, so AI readiness is not permanent — certificates must be renewed annually.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
            <p className="text-sm text-slate-600">
              <strong className="text-ink-950">Prototype note.</strong> This prototype verifies certificates issued on this deployment of ZimAI Ready and its connected database. All demo holders are fictional.
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button to="/for-employers" variant="ghost" className="h-auto min-h-11 whitespace-normal py-2 text-center" iconRight={<ArrowRight className="h-4 w-4 shrink-0" />}>
            Measure your whole workforce's AI readiness
          </Button>
        </div>
      </div>
    </section>
  );
}
