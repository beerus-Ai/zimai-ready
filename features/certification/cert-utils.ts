import type { Certificate, CertificationLevel } from '../../types';
import { certificateState, LEVEL_META } from '../../lib/certification';
import type { Tone } from '../../components/ui';

/** Shared helpers for the certification, verification and skills-profile screens. */

export const CERT_ID_PATTERN = /^ZAR-\d{4}-[A-Z0-9]{6}$/;
export const CERT_ID_HINT = 'ZAR-YYYY-XXXXXX';

const baseUrl = () => `${window.location.origin}${window.location.pathname}`;

/** Public verification link for a certificate (HashRouter-safe). */
export const verificationUrl = (id: string) => `${baseUrl()}#/verify/${id}`;

/** Public AI Skills Profile link. */
export const publicProfileUrl = (userId: string) => `${baseUrl()}#/p/${userId}`;

/** Short human-readable verification address printed on the certificate, e.g. "zimaiready.app/#/verify". */
export function verifyDisplayUrl(): string {
  const path = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  return `${window.location.host}${path}/#/verify`;
}

/** Upper-cases, strips spaces and re-inserts dashes (e.g. "zar20267f3k9q" → "ZAR-2026-7F3K9Q"). */
export function normaliseCertId(raw: string): string {
  const s = raw.toUpperCase().replace(/\s+/g, '').trim();
  const m = s.match(/^ZAR-?(\d{4})-?([A-Z0-9]{6})$/);
  return m ? `ZAR-${m[1]}-${m[2]}` : s;
}

const DAY = 86_400_000;
export const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);
export const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));

export function humanDays(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 60) return `${days} days`;
  const months = Math.round(days / 30.4);
  return `${months} month${months === 1 ? '' : 's'}`;
}

export const LEVEL_WORD: Record<CertificationLevel, string> = {
  AI_AWARE: 'AI-AWARE',
  AI_CAPABLE: 'AI-CAPABLE',
  AI_READY: 'AI-READY',
};

export const certificateTitle = (level: CertificationLevel) => `${LEVEL_WORD[level]} PROFESSIONAL CERTIFICATION`;

/** Highest-level, most recent certificate that is currently valid. */
export function bestValidCertificate(certs: Certificate[]): Certificate | null {
  return (
    [...certs]
      .filter((c) => certificateState(c) === 'valid')
      .sort((a, b) => LEVEL_META[b.level].rank - LEVEL_META[a.level].rank || b.issueDate.localeCompare(a.issueDate))[0] ?? null
  );
}

export type CertDisplayState = 'valid' | 'expiring' | 'expired' | 'revoked';

/** Display state: a valid certificate within 60 days of expiry reads as "expiring". */
export function certDisplayState(c: Certificate): CertDisplayState {
  const s = certificateState(c);
  if (s !== 'valid') return s;
  return daysUntil(c.expiryDate) <= 60 ? 'expiring' : 'valid';
}

export const CERT_STATE_META: Record<CertDisplayState, { label: string; tone: Tone }> = {
  valid: { label: 'Valid', tone: 'brand' },
  expiring: { label: 'Renew soon', tone: 'gold' },
  expired: { label: 'Expired', tone: 'gold' },
  revoked: { label: 'Revoked', tone: 'clay' },
};

/** Hex colour with alpha → rgba() string. */
export function tint(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Safe id fragment for SVG <defs> (React useId output contains characters invalid in url(#…)). */
export const svgId = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, '');

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
