import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, Circle, CircleCheck, CircleDashed, Lock, ShieldCheck } from 'lucide-react';
import type { PublicSkillsProfile, SkillLevel } from '../../types';
import { Avatar, Badge, ProgressBar } from '../../components/ui';
import { LogoMark } from '../../components/brand';
import { CERT_TYPE_META, LEVEL_META } from '../../lib/certification';
import { LEVEL_COLORS, SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { cn, formatDate } from '../../lib/utils';
import { tint } from './cert-utils';

/** Presentational AI Skills Profile — used by the private preview (/app/profile) and the public page (/p/:userId). */

const STATUS_META: Record<PublicSkillsProfile['competencies'][number]['status'], { label: string; cls: string; icon: ReactNode }> = {
  verified: { label: 'Verified', cls: 'bg-brand-800 text-canvas ring-brand-800', icon: <CircleCheck className="h-3.5 w-3.5" /> },
  'in-progress': { label: 'In progress', cls: 'bg-gold-50 text-gold-800 ring-gold-200', icon: <CircleDashed className="h-3.5 w-3.5" /> },
  'not-started': { label: 'Not started', cls: 'bg-sand-100 text-ink-500 ring-ink-950/10', icon: <Circle className="h-3.5 w-3.5" /> },
};

export function ProfileView({ profile, className, preview }: { profile: PublicSkillsProfile; className?: string; preview?: boolean }) {
  const lvl = LEVEL_COLORS[profile.readinessLevel];
  const verified = profile.competencies.filter((c) => c.status === 'verified').length;
  const cert = profile.certification;
  const certMeta = cert ? LEVEL_META[cert.level] : null;

  return (
    <article className={cn('overflow-hidden rounded-4xl border border-ink-950/10 bg-paper shadow-card', className)}>
      {/* Header */}
      <header className="relative overflow-hidden bg-brand-800 px-6 pb-8 pt-8 text-canvas sm:px-10 sm:pb-10 sm:pt-10">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="rounded-full p-1 ring-2 ring-canvas/25">
              <Avatar name={profile.name} size={68} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{preview ? 'Profile preview' : 'AI Skills Profile'}</p>
              <h2 className="mt-1 truncate text-3xl leading-tight sm:text-4xl">{profile.name}</h2>
              <p className="mt-0.5 text-sm text-canvas/75">{profile.headline}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="white">{profile.domainName}</Badge>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: tint(lvl.hex, 0.22), color: '#fff', boxShadow: `inset 0 0 0 1px ${tint(lvl.hex, 0.5)}` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: lvl.hex }} />
                  {profile.readinessLevel}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full shrink-0 rounded-2xl bg-canvas/[0.08] p-4 ring-1 ring-canvas/15 md:w-56">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-canvas/70">AI readiness</span>
              <span className="font-display text-5xl font-medium leading-none tabular-nums">{Math.round(profile.readiness)}%</span>
            </div>
            <ProgressBar value={profile.readiness} color={lvl.hex} className="mt-2" />
            <p className="mt-2 text-xs text-canvas/60">
              {verified} of {profile.competencies.length} competencies verified
            </p>
          </div>
        </div>
      </header>

      {/* Certification */}
      <div className="border-b border-ink-950/10 px-6 py-5 sm:px-10">
        {cert && certMeta ? (
          <Link
            to={`/verify/${cert.id}`}
            className="group flex flex-col gap-3 rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-ink-sm sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: tint(certMeta.color, 0.3), background: tint(certMeta.color, 0.05) }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: certMeta.color }}>
                <BadgeCheck className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl font-medium leading-tight text-ink-950">
                  Certified {certMeta.label} <span className="font-medium text-slate-500">· {CERT_TYPE_META[cert.type].label}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Issued {formatDate(cert.issueDate)} · <span className="font-mono">{cert.id}</span>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-800 group-hover:underline">
              Verify certificate <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink-950/15 bg-sand-100/70 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand-200 text-ink-400">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <p className="text-sm text-slate-500">No active ZimAI Ready certificate yet — the competencies below show verified evidence and current progress.</p>
          </div>
        )}
      </div>

      <div className={cn('grid gap-10 px-6 py-8 sm:px-10 sm:py-10 [&>*]:min-w-0', preview ? '2xl:grid-cols-[1.15fr_1fr]' : 'lg:grid-cols-[1.15fr_1fr]')}>
        {/* Competencies */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-2xl font-medium text-ink-950">AI <em>competencies</em></h3>
            <span className="text-xs font-semibold text-slate-400">
              {verified}/{profile.competencies.length} verified
            </span>
          </div>
          <ul className="divide-y divide-ink-950/5 rounded-2xl border border-ink-950/10">
            {profile.competencies.map((c) => {
              const m = STATUS_META[c.status];
              return (
                <li key={c.name} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className={cn('text-[15px] font-semibold', c.status === 'not-started' ? 'text-slate-500' : 'text-ink-950')}>{c.name}</p>
                    {c.evidence && <p className="mt-0.5 truncate text-xs text-slate-500">{c.evidence}</p>}
                  </div>
                  <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset', m.cls)}>
                    {m.icon}
                    {m.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Skills */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-2xl font-medium text-ink-950">Skills</h3>
            <span className="text-xs font-semibold text-slate-400">{profile.skills.length} demonstrated</span>
          </div>
          {profile.skills.length ? (
            <ul className="space-y-3">
              {profile.skills.map((s) => (
                <li key={s.skillId}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold text-ink-900">{s.name}</span>
                    <span className={cn('shrink-0 text-xs font-semibold', SKILL_LEVEL_COLORS[s.level].text)}>{SKILL_LEVEL_LABELS[s.level]}</span>
                  </div>
                  <LevelBar level={s.level} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-ink-950/15 p-4 text-sm text-slate-500">Skills appear here as they are demonstrated through learning, practical activities and assessments.</p>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="flex flex-col gap-3 border-t border-ink-950/10 bg-sand-100/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7" />
          <div>
            <p className="flex items-center gap-1 text-sm font-bold text-ink-950">
              Verified by ZimAI Ready <ShieldCheck className="h-4 w-4 text-brand-800" />
            </p>
            <p className="text-xs text-slate-500">Updated {formatDate(profile.updatedAt)}</p>
          </div>
        </div>
        <p className="flex items-start gap-1.5 text-xs text-slate-500 sm:max-w-xs sm:text-right">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Snapshot shared by the holder. Contains no assessment answers or private data.
        </p>
      </footer>
    </article>
  );
}

function LevelBar({ level }: { level: SkillLevel }) {
  const hex = SKILL_LEVEL_COLORS[level].hex;
  return (
    <div className="mt-1.5 grid grid-cols-3 gap-1" aria-label={`Level ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className="h-1.5 rounded-full" style={{ background: i <= level ? hex : '#ebebd8' }} />
      ))}
    </div>
  );
}

export default ProfileView;
