import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CircleCheck,
  ClipboardCheck,
  ExternalLink,
  Link2,
  Printer,
  SearchX,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Trophy,
} from 'lucide-react';
import type { Certificate } from '../../types';
import { useApp } from '../../services/store';
import { Badge, Button, Card, CardTitle, EmptyState, PageHeader, ProgressBar, useToast } from '../../components/ui';
import { CERT_TYPE_META, LEVEL_META } from '../../lib/certification';
import { CERT_RULES } from '../../config';
import { cn, formatDate } from '../../lib/utils';
import { CertificateCard } from './CertificateCard';
import { certDisplayState, copyText, daysUntil, humanDays, verificationUrl } from './cert-utils';
import type { CertDisplayState } from './cert-utils';
import { Reveal } from '../../components/motion';

const LinkedInGlyph = () => (
  <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] bg-[#0a66c2] text-[10px] font-extrabold leading-none text-white" aria-hidden>
    in
  </span>
);

export default function CertificateView() {
  const { certId = '' } = useParams();
  const { certificates } = useApp();
  const toast = useToast();
  const cert = certificates.find((c) => c.id.toUpperCase() === certId.toUpperCase());

  const back = (
    <Link to="/app/certificates" className="inline-flex items-center gap-1 hover:text-ink-950">
      <ArrowLeft className="h-3.5 w-3.5" /> My certificates
    </Link>
  );

  if (!cert) {
    return (
      <div>
        <PageHeader eyebrow={back} title="Certificate not found" />
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title="We couldn't find that certificate"
          description={
            <>
              No certificate with ID <span className="font-mono font-semibold text-ink-900">{certId || '—'}</span> belongs to your account. Check the link, or verify any certificate on the public verification page.
            </>
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button to="/app/certificates">My certificates</Button>
              <Button to={certId ? `/verify/${certId}` : '/verify'} variant="outline">
                Verify publicly
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const url = verificationUrl(cert.id);
  const state = certDisplayState(cert);
  const level = LEVEL_META[cert.level];

  const copyLink = async () => {
    const ok = await copyText(url);
    if (ok) toast.success('Verification link copied', 'Share it with employers so they can confirm your certificate.');
    else toast.error('Could not copy the link', url);
  };

  return (
    <div>
      <PageHeader
        eyebrow={back}
        title={<>{level.label} · <em>{cert.domainName}</em></>}
        description={`${CERT_TYPE_META[cert.type].label} certificate issued to ${cert.holderName} on ${formatDate(cert.issueDate, { day: 'numeric', month: 'long', year: 'numeric' })}.`}
      />

      {/* Actions */}
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <Button onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
          Print / Save as PDF
        </Button>
        <Button variant="outline" onClick={copyLink} icon={<Link2 className="h-4 w-4" />}>
          Copy verification link
        </Button>
        <Button variant="outline" href={url} icon={<ExternalLink className="h-4 w-4" />}>
          Open verification page
        </Button>
        <Button variant="outline" to="/app/profile" icon={<Share2 className="h-4 w-4" />}>
          Share Skills Profile
        </Button>
        <Button variant="ghost" onClick={() => toast.comingSoon('Adding certificates to LinkedIn')} icon={<LinkedInGlyph />}>
          Add to LinkedIn
        </Button>
      </div>

      <StatusBanner cert={cert} state={state} />

      <div className="mt-4 animate-ghost-in" style={{ animationDelay: '120ms' }}>
        <CertificateCard certificate={cert} />
      </div>
      <p className="no-print mt-2 flex items-center gap-1.5 text-xs text-slate-500 sm:hidden">
        <Smartphone className="h-3.5 w-3.5" /> Rotate your phone or use Print / Save as PDF for a full-size copy.
      </p>

      <div className="no-print mt-10 grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <EvidencePanel cert={cert} />
        </Reveal>
        <Reveal delay={100} className="space-y-6">
          <ExpiryCard cert={cert} state={state} />
          <Card className="rounded-3xl">
            <CardTitle icon={<ShieldCheck className="h-5 w-5" />} title="Public verification" />
            <div className="flex items-center gap-4">
              <div className="shrink-0 rounded-xl bg-white p-2 ring-1 ring-ink-950/10">
                <QRCodeSVG value={url} size={96} marginSize={0} level="M" fgColor="#1a1a1a" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400">Certificate ID</p>
                <p className="font-mono text-sm font-semibold text-ink-950">{cert.id}</p>
                <button onClick={copyLink} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-800 hover:underline">
                  <Link2 className="h-4 w-4" /> Copy link
                </button>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

function StatusBanner({ cert, state }: { cert: Certificate; state: CertDisplayState }) {
  const left = daysUntil(cert.expiryDate);
  const meta = {
    valid: { cls: 'border-brand-800/15 bg-brand-50/80 text-brand-900', icon: <ShieldCheck className="h-5 w-5 text-brand-800" />, text: 'Valid and publicly verifiable. Employers can scan the QR code or enter the certificate ID on the verification page.' },
    expiring: { cls: 'border-gold-200 bg-gold-50 text-gold-900', icon: <CalendarClock className="h-5 w-5 text-gold-600" />, text: `Valid, but it expires in ${humanDays(left)}. Refresh your readiness and renew before ${formatDate(cert.expiryDate)}.` },
    expired: { cls: 'border-gold-200 bg-gold-50 text-gold-900', icon: <ShieldAlert className="h-5 w-5 text-gold-600" />, text: `This certificate expired on ${formatDate(cert.expiryDate)}. AI readiness is not permanent — renew it to stay verifiably AI ready.` },
    revoked: { cls: 'border-clay-200 bg-clay-50 text-clay-900', icon: <ShieldX className="h-5 w-5 text-clay-600" />, text: 'This certificate has been revoked and will show as REVOKED to anyone who verifies it.' },
  }[state];
  return (
    <div className={cn('no-print flex animate-ghost-in flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between', meta.cls)}>
      <p className="flex items-start gap-2.5 text-sm font-medium">
        <span className="mt-0.5 shrink-0">{meta.icon}</span>
        {meta.text}
      </p>
      {(state === 'expiring' || state === 'expired') && (
        <Button to="/app/maintain" size="sm" variant="dark" iconRight={<ArrowRight className="h-4 w-4" />}>
          Renew
        </Button>
      )}
    </div>
  );
}

function ScoreRow({ label, score, threshold, note }: { label: string; score: number; threshold: number | null; note?: string }) {
  const passed = threshold == null ? score > 0 : score >= threshold;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="font-display text-2xl font-medium leading-none tabular-nums text-ink-950">{score ? `${Math.round(score)}%` : '—'}</p>
      </div>
      <ProgressBar value={score} tone={passed ? 'brand' : 'gold'} className="mt-1.5" />
      <p className="mt-1 text-xs text-slate-500">{threshold != null ? `Required at this level: ≥ ${threshold}%` : note ?? 'Not required at this level'}</p>
    </div>
  );
}

function EvidencePanel({ cert }: { cert: Certificate }) {
  const e = cert.evidence;
  const isReady = cert.level === 'AI_READY';
  const knowledgeMark = isReady ? CERT_RULES.knowledgePassMark : cert.level === 'AI_CAPABLE' ? CERT_RULES.capableKnowledgeMark : CERT_RULES.awareKnowledgeMark;
  return (
    <Card className="h-full rounded-3xl">
      <CardTitle icon={<ClipboardCheck className="h-5 w-5" />} title="Evidence behind this certificate" />
      <div className="grid gap-5 sm:grid-cols-3">
        <ScoreRow label="Knowledge assessment" score={e.knowledgeScore} threshold={knowledgeMark} />
        <ScoreRow label="Practical capstone" score={e.capstoneScore} threshold={isReady ? CERT_RULES.capstonePassMark : null} note="Required for AI Ready" />
        <ScoreRow label="Responsible AI" score={e.responsibleAIScore} threshold={isReady ? CERT_RULES.responsibleAIPassMark : null} note="Required for AI Ready" />
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: <BookOpen className="h-4 w-4" />, label: 'Modules completed', value: e.modulesCompleted },
          { icon: <Trophy className="h-4 w-4" />, label: 'Practicals passed', value: e.practicalsCompleted },
          { icon: <ShieldCheck className="h-4 w-4" />, label: 'Readiness score', value: `${Math.round(cert.readinessScore)}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink-950/5 bg-sand-100 p-3 sm:p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              {s.icon}
              <span className="truncate">{s.label}</span>
            </p>
            <p className="mt-1 font-display text-3xl font-medium leading-none tabular-nums text-ink-950 sm:text-4xl">{s.value}</p>
          </div>
        ))}
      </div>
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
    </Card>
  );
}

function ExpiryCard({ cert, state }: { cert: Certificate; state: CertDisplayState }) {
  const left = daysUntil(cert.expiryDate);
  const total = Math.max(1, (new Date(cert.expiryDate).getTime() - new Date(cert.issueDate).getTime()) / 86_400_000);
  const remainingPct = Math.max(0, Math.min(100, (left / total) * 100));
  const inactive = state === 'expired' || state === 'revoked';
  return (
    <Card className="rounded-3xl">
      <CardTitle icon={<CalendarClock className="h-5 w-5" />} title="Validity" subtitle="Valid for 12 months." />
      <div className="flex items-baseline gap-2">
        <span className={cn('font-display text-6xl font-medium leading-none tabular-nums tracking-tight', inactive ? 'text-slate-400' : state === 'expiring' ? 'text-gold-600' : 'text-brand-800')}>
          {inactive ? '0' : Math.max(0, left)}
        </span>
        <span className="text-sm font-semibold text-slate-500">days remaining</span>
      </div>
      <ProgressBar value={inactive ? 0 : remainingPct} tone={state === 'expiring' ? 'gold' : 'brand'} className="mt-3" />
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>Issued {formatDate(cert.issueDate)}</span>
        <span>Expires {formatDate(cert.expiryDate)}</span>
      </div>
      <Button to="/app/maintain" variant="secondary" full className="mt-4" iconRight={<ArrowRight className="h-4 w-4" />}>
        Maintain my readiness
      </Button>
    </Card>
  );
}
