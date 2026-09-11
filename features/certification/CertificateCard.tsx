import { useId } from 'react';
import type { CSSProperties } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Certificate } from '../../types';
import { AccentBar, LogoMark } from '../../components/brand';
import { CERT_TYPE_META, certificateState, LEVEL_META } from '../../lib/certification';
import { cn, formatDate } from '../../lib/utils';
import { LEVEL_WORD, svgId, tint, verificationUrl, verifyDisplayUrl } from './cert-utils';

/**
 * Premium, printable ZimAI Ready certificate (A4 landscape).
 *
 * Scaling: the root is a size container with a fixed 297/210 aspect ratio; the
 * inner canvas sets `font-size: 1cqw` and every measurement inside is in `em`,
 * so the whole credential scales proportionally from phone width to a full A4
 * print page (print CSS stretches `.print-area` to the page).
 */

const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
const GOLD = { light: '#ffe685', mid: '#ffc21a', deep: '#d98300', dark: '#783d0d' };
const BRAND_DARK = '#094936';

export function CertificateCard({ certificate: c, className }: { certificate: Certificate; className?: string }) {
  const uid = svgId(useId());
  const level = LEVEL_META[c.level];
  const color = level.color;
  const state = certificateState(c);
  const url = verificationUrl(c.id);
  const isEmployer = c.type === 'employer';
  const nameSize = c.holderName.length > 30 ? '3.6em' : c.holderName.length > 22 ? '4.2em' : '4.9em';

  const rootStyle = {
    aspectRatio: '297 / 210',
    containerType: 'inline-size',
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
  } as CSSProperties;

  return (
    <div
      className={cn('print-area relative w-full select-text overflow-hidden rounded-xl bg-[#fffdf8] shadow-lift ring-1 ring-black/5 print:rounded-none print:ring-0', className)}
      style={rootStyle}
      role="img"
      aria-label={`${LEVEL_WORD[c.level]} professional certificate issued to ${c.holderName}, certificate ID ${c.id}`}
    >
      <div className="absolute inset-0 text-ink-950" style={{ fontSize: '1cqw' }}>
        <Frame uid={uid} color={color} />

        {/* Content */}
        <div className="absolute flex flex-col" style={{ top: '6.6em', left: '8em', right: '8em', bottom: '6.2em' }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-[2em]">
            <div className="flex items-center gap-[1.1em]">
              <LogoMark className="h-[4.4em] w-[4.4em] shrink-0" />
              <div className="leading-none">
                <p className="text-[2.2em] font-extrabold tracking-tight">
                  ZimAI <span className="text-brand-600">Ready</span>
                </p>
                <p className="mt-[0.55em] text-[0.95em] font-semibold uppercase tracking-[0.2em] text-slate-500">AI Workforce Readiness &amp; Certification</p>
              </div>
            </div>
            <div
              className="flex flex-col items-end text-right text-white"
              style={{ background: isEmployer ? BRAND_DARK : '#0b1220', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 1.4em 50%)', padding: '0.9em 1.6em 0.9em 2.8em' }}
            >
              <span className="text-[1.05em] font-bold uppercase tracking-[0.22em]">{CERT_TYPE_META[c.type].label}</span>
              {isEmployer && c.organisationName && <span className="mt-[0.3em] max-w-[22em] truncate text-[0.95em] font-semibold text-gold-300">{c.organisationName}</span>}
            </div>
          </div>

          {/* Title & holder */}
          <div className="mt-[2.4em] flex flex-col items-center text-center">
            <h2 className="text-[2.3em] font-extrabold uppercase leading-none tracking-[0.16em]">
              <span style={{ color }}>{LEVEL_WORD[c.level]}</span> Professional Certification
            </h2>
            <AccentBar className="mx-auto mt-[1.1em] !h-[0.32em] !w-[18em]" />
            <p className="mt-[2.2em] text-[1.25em] font-semibold uppercase tracking-[0.3em] text-slate-500">This certifies that</p>
            <p className="mt-[0.35em] max-w-full truncate leading-[1.15] text-ink-950" style={{ fontFamily: SERIF, fontSize: nameSize }}>
              {c.holderName}
            </p>
            <div className="mt-[0.5em] h-[0.12em] w-[44em]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.deep}, transparent)` }} />
            <p className="mt-[1.2em] max-w-[64em] text-[1.3em] leading-[1.55] text-slate-600">
              has demonstrated verified, practical competency in <strong className="font-bold" style={{ color }}>{c.competency}</strong> within the{' '}
              <strong className="font-semibold text-ink-900">{c.domainName}</strong> domain
              {isEmployer && c.organisationName ? (
                <>
                  , measured against the AI competency requirements of <strong className="font-semibold text-ink-900">{c.organisationName}</strong>
                </>
              ) : null}
              .
            </p>
          </div>

          {/* Key facts */}
          <div className="mt-[2.4em] grid grid-cols-5 border-y border-slate-200" style={{ borderColor: tint('#0b1220', 0.1) }}>
            <Fact label="Domain" value={c.domainName} first />
            <Fact label="Readiness score" value={`${Math.round(c.readinessScore)}%`} />
            <Fact label="AI readiness level" value={level.label} color={color} />
            <Fact label="Issue date" value={formatDate(c.issueDate, { day: 'numeric', month: 'long', year: 'numeric' })} />
            <Fact label="Valid until" value={formatDate(c.expiryDate, { day: 'numeric', month: 'long', year: 'numeric' })} />
          </div>

          {/* Competencies · seal · verification */}
          <div className="mt-auto grid items-end gap-[2.6em]" style={{ gridTemplateColumns: '1fr auto auto' }}>
            <div className="min-w-0">
              <p className="text-[0.9em] font-bold uppercase tracking-[0.18em] text-slate-500">Verified competencies</p>
              <ul className="mt-[0.9em] grid grid-cols-2 gap-x-[1.8em] gap-y-[0.65em]">
                {c.competencies.map((comp) => (
                  <li key={comp.name} className="flex min-w-0 items-center gap-[0.6em]">
                    <CheckDot color={color} />
                    <span className="truncate text-[1.1em] font-semibold text-ink-900">{comp.name}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-[1.6em] flex items-end gap-[1.2em]">
                <div>
                  <Signature />
                  <div className="h-[0.08em] w-[16em] bg-slate-300" />
                  <p className="mt-[0.45em] text-[0.85em] font-semibold uppercase tracking-[0.14em] text-slate-500">ZimAI Ready Certification</p>
                </div>
              </div>
            </div>

            <Seal uid={uid} color={color} label={level.label.toUpperCase()} year={new Date(c.issueDate).getFullYear()} />

            <div className="flex items-end gap-[1.2em]">
              <div className="text-right">
                <p className="text-[0.85em] font-bold uppercase tracking-[0.18em] text-slate-500">Certificate ID</p>
                <p className="mt-[0.3em] font-mono text-[1.35em] font-semibold tracking-wide text-ink-950">{c.id}</p>
                <p className="mt-[0.9em] text-[0.85em] font-semibold uppercase tracking-[0.14em] text-slate-500">Scan or verify at</p>
                <p className="mt-[0.2em] max-w-[17em] break-all text-[0.95em] font-semibold text-brand-700">{verifyDisplayUrl()}</p>
              </div>
              <div className="rounded-[0.6em] bg-white p-[0.55em] ring-1 ring-slate-200">
                <div className="h-[9.2em] w-[9.2em]">
                  <QRCodeSVG value={url} size={256} level="M" marginSize={0} fgColor="#0b1220" bgColor="#ffffff" style={{ width: '100%', height: '100%', display: 'block' }} title={`Verify certificate ${c.id}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {state !== 'valid' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-[0.6em] bg-white/70 px-[1.4em] py-[0.3em] text-[5.4em] font-black uppercase tracking-[0.18em]"
              style={{ color: state === 'revoked' ? '#e03a0c' : '#d98300', border: `0.08em solid currentColor`, transform: 'rotate(-14deg)', opacity: 0.85 }}
            >
              {state}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value, color, first }: { label: string; value: string; color?: string; first?: boolean }) {
  return (
    <div className={cn('px-[1.3em] py-[1.1em] text-center', !first && 'border-l')} style={{ borderColor: tint('#0b1220', 0.1) }}>
      <p className="text-[0.85em] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-[0.45em] truncate text-[1.35em] font-bold leading-tight text-ink-950" style={color ? { color } : undefined}>
        {value}
      </p>
    </div>
  );
}

function CheckDot({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[1.3em] w-[1.3em] shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="10" fill={color} />
      <path d="M5.8 10.4 L8.7 13.1 L14.3 7.2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Signature() {
  return (
    <svg viewBox="0 0 160 36" className="h-[2.6em] w-[11.5em]" aria-hidden>
      <path
        d="M4 26 C14 8, 22 6, 24 18 S30 32, 38 20 S50 4, 56 16 S62 30, 72 22 C80 16, 84 12, 92 20 S104 30, 114 18 C120 12, 128 14, 134 20 S146 26, 156 14"
        fill="none"
        stroke="#172133"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

/** Guilloché border, chevron corner ornaments and a rosette watermark. */
function Frame({ uid, color }: { uid: string; color: string }) {
  const ellipses = Array.from({ length: 36 }, (_, i) => i * 5);
  const corners: [number, number, number, number][] = [
    [15, 15, 1, 1],
    [282, 15, -1, 1],
    [15, 195, 1, -1],
    [282, 195, -1, -1],
  ];
  return (
    <svg viewBox="0 0 297 210" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id={`${uid}-guil`} width="8" height="5" patternUnits="userSpaceOnUse">
          <path d="M0 2.5 C2 -0.2, 2 -0.2, 4 2.5 S6 5.2, 8 2.5" fill="none" stroke={BRAND_DARK} strokeWidth="0.28" strokeOpacity="0.55" />
          <path d="M0 2.5 C2 5.2, 2 5.2, 4 2.5 S6 -0.2, 8 2.5" fill="none" stroke={GOLD.deep} strokeWidth="0.28" strokeOpacity="0.65" />
        </pattern>
        <radialGradient id={`${uid}-glow`} cx="0.15" cy="0.1" r="0.9">
          <stop offset="0%" stopColor={color} stopOpacity="0.07" />
          <stop offset="60%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="297" height="210" fill="#fffdf8" />
      <rect width="297" height="210" fill={`url(#${uid}-glow)`} />

      {/* Rosette watermark */}
      <g transform="translate(148.5 112)" fill="none" stroke={color} strokeOpacity="0.055" strokeWidth="0.3">
        {ellipses.map((deg) => (
          <ellipse key={deg} rx="64" ry="21" transform={`rotate(${deg})`} />
        ))}
        <circle r="66" />
        <circle r="22" />
      </g>

      {/* Guilloché band */}
      <path fillRule="evenodd" fill={`url(#${uid}-guil)`} d="M6 6 H291 V204 H6 Z M11 11 V199 H286 V11 Z" />
      <rect x="6" y="6" width="285" height="198" fill="none" stroke={BRAND_DARK} strokeWidth="0.8" />
      <rect x="11" y="11" width="275" height="188" fill="none" stroke={GOLD.deep} strokeWidth="0.45" />
      <rect x="12.6" y="12.6" width="271.8" height="184.8" fill="none" stroke={color} strokeWidth="0.18" strokeOpacity="0.7" />

      {/* Corner ornaments (Great Zimbabwe chevrons) */}
      {corners.map(([x, y, sx, sy]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
          <path d="M0 16 V0 H16" fill="none" stroke={GOLD.deep} strokeWidth="0.6" />
          <path d="M3 16 V3 H16" fill="none" stroke={color} strokeWidth="0.3" />
          <path d="M5 9 L7.5 6.5 L10 9 L12.5 6.5 L15 9" fill="none" stroke={GOLD.deep} strokeWidth="0.45" strokeLinejoin="round" />
          <rect x="-1.5" y="-1.5" width="3" height="3" transform="rotate(45)" fill={GOLD.mid} stroke={GOLD.dark} strokeWidth="0.2" />
        </g>
      ))}
    </svg>
  );
}

/** Gold certification seal with level ribbons. */
function Seal({ uid, color, label, year }: { uid: string; color: string; label: string; year: number }) {
  const points = Array.from({ length: 64 }, (_, i) => {
    const r = i % 2 === 0 ? 58 : 53.5;
    const a = (i / 64) * Math.PI * 2;
    return `${(60 + r * Math.cos(a)).toFixed(2)},${(60 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 120 142" className="h-[13.5em] w-[11.4em] shrink-0 drop-shadow-sm" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD.light} />
          <stop offset="45%" stopColor={GOLD.mid} />
          <stop offset="100%" stopColor={GOLD.deep} />
        </linearGradient>
        <path id={`${uid}-ring`} d="M20 60 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" />
      </defs>
      <path d="M38 90 L28 138 L41 130 L50 141 L57 98 Z" fill={color} />
      <path d="M82 90 L92 138 L79 130 L70 141 L63 98 Z" fill={color} opacity="0.85" />
      <polygon points={points} fill={`url(#${uid}-gold)`} stroke="#b45d05" strokeWidth="0.6" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="0.9" />
      <circle cx="60" cy="60" r="34" fill={`url(#${uid}-gold)`} stroke={GOLD.dark} strokeOpacity="0.45" strokeWidth="0.6" />
      <text fontSize="7" fontWeight="800" fill={GOLD.dark} letterSpacing="1.2">
        <textPath href={`#${uid}-ring`} textLength="246" lengthAdjust="spacing">
          ZIMAI READY • VERIFIED COMPETENCY •
        </textPath>
      </text>
      <path d="M45 56 L52.5 48.5 L60 56 L67.5 48.5 L75 56" fill="none" stroke={GOLD.dark} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="60" y="71" textAnchor="middle" fontSize={label.length > 8 ? 8.2 : 9.5} fontWeight="800" fill="#452002" letterSpacing="0.4">
        {label}
      </text>
      <text x="60" y="81" textAnchor="middle" fontSize="6.4" fontWeight="700" fill={GOLD.dark} letterSpacing="1">
        {year}
      </text>
    </svg>
  );
}

export default CertificateCard;
