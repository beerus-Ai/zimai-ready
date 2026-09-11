import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

/** SVG ids must be unique per instance: if the first element with an id sits inside a hidden subtree, Chrome won't paint url(#id) anywhere. */
const svgId = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, '');

/** Logo mark: a rounded tile with a stylised rising chevron (inspired by Great Zimbabwe stonework) and an AI spark. */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  const gid = `zr-g-${svgId(useId())}`;
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#15ae7c" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gid})`} />
      <path d="M8 27 L14 21 L20 27 L26 21 L32 27" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21 L14 15 L20 21 L26 15 L32 21" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31" cy="10" r="3.2" fill="#ffc21a" />
    </svg>
  );
}

export function Logo({ to = '/', light = false, className, compact = false }: { to?: string; light?: boolean; className?: string; compact?: boolean }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="ZimAI Ready home">
      <LogoMark className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:-rotate-6" />
      {!compact && (
        <span className={cn('text-[17px] font-extrabold tracking-tight', light ? 'text-white' : 'text-ink-950')}>
          ZimAI <span className={light ? 'text-gold-300' : 'text-brand-600'}>Ready</span>
        </span>
      )}
    </Link>
  );
}

/** Subtle chevron band pattern used as a decorative background. */
export function ChevronPattern({ className, color = 'currentColor', opacity = 0.08 }: { className?: string; color?: string; opacity?: number }) {
  const pid = `chev-${svgId(useId())}`;
  return (
    <svg className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} aria-hidden>
      <defs>
        <pattern id={pid} width="28" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 12 L7 5 L14 12 L21 5 L28 12" fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="1.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/** Thin tricolour accent bar (green · gold · clay · ink) — a nod to the national palette without looking governmental. */
export function AccentBar({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-1 w-full overflow-hidden rounded-full', className)} aria-hidden>
      <span className="flex-[5] bg-brand-500" />
      <span className="flex-[2] bg-gold-400" />
      <span className="flex-1 bg-clay-500" />
      <span className="flex-1 bg-ink-900" />
    </div>
  );
}
