import type { ReactNode } from 'react';
import { Award, Circle, CircleCheck, Lock, ShieldCheck } from 'lucide-react';
import { Badge, Card, ProgressBar } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import { LEVEL_META, LEVEL_ORDER } from '../../../lib/certification';
import type { CertificationStatus } from '../../../lib/certification';
import type { AssessmentResult, CertificationLevel } from '../../../types';

/** Colour for a score relative to its pass mark (brand = pass, gold = close, clay = not yet). */
export const scoreHex = (score: number, passMark: number) => (score >= passMark ? '#034f46' : score >= 50 ? '#ffa946' : '#d6361c');

const barTone = (pct: number) => (pct >= 70 ? 'brand' : pct >= 50 ? 'gold' : 'clay') as 'brand' | 'gold' | 'clay';

/** The core Stage 3 principle, shown wherever certification is discussed. */
export function PrincipleBanner({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-3xl border border-ink-950/10 bg-sand-100 px-5 py-4 sm:px-6', className)}>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-canvas">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug text-ink-950">Certification requires demonstrated competency — completing lessons alone never certifies you.</p>
        </div>
      </div>
    </div>
  );
}

/** Calm locked state with the conditions still to meet. */
export function LockedPanel({ title, description, items, action, className }: {
  title: string;
  description: ReactNode;
  items: { label: string; detail?: string; met: boolean; progress?: number }[];
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('mx-auto max-w-2xl text-center', className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-950/10 bg-sand-200/70 text-ink-600">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="text-3xl leading-tight text-ink-950">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">{description}</p>
      <ul className="mx-auto mt-6 max-w-md space-y-3 text-left">
        {items.map((it) => (
          <li key={it.label} className="rounded-xl border border-ink-950/10 bg-sand-100 p-3.5">
            <div className="flex items-start gap-2.5">
              {it.met ? <CircleCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-600" /> : <Circle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-slate-300" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-950">{it.label}</p>
                {it.detail && <p className="text-xs text-slate-500">{it.detail}</p>}
                {typeof it.progress === 'number' && <ProgressBar value={it.progress} size="xs" className="mt-2" tone={it.met ? 'brand' : 'gold'} />}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </Card>
  );
}

/** Score breakdown bars (assessment dimensions or capstone criteria). */
export function BreakdownBars({ items, showComments }: { items: AssessmentResult['breakdown']; showComments?: boolean }) {
  return (
    <ul className="space-y-4">
      {items.map((it) => {
        const pct = it.max ? Math.round((it.score / it.max) * 100) : 0;
        return (
          <li key={it.dimension}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-ink-950">{it.dimension}</span>
              <span className="shrink-0 font-display text-lg font-medium leading-none tabular-nums text-ink-950">
                {it.score}
                <span className="font-medium text-slate-400">/{it.max}</span>
              </span>
            </div>
            <ProgressBar value={pct} tone={barTone(pct)} />
            {showComments && it.comment && <p className="mt-1.5 text-[13px] leading-snug text-slate-500">{it.comment}</p>}
          </li>
        );
      })}
    </ul>
  );
}

/** AI AWARE → AI CAPABLE → AI READY ladder. */
export function LevelLadder({ status, heldLevel }: { status: CertificationStatus; heldLevel: CertificationLevel | null }) {
  const achievedRank = status.achievableLevel ? LEVEL_META[status.achievableLevel].rank : 0;
  const heldRank = heldLevel ? LEVEL_META[heldLevel].rank : 0;
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {LEVEL_ORDER.map((lvl, i) => {
        const meta = LEVEL_META[lvl];
        const reqs = status.requirements.filter((r) => r.level === lvl);
        const met = reqs.filter((r) => r.met).length;
        const held = meta.rank <= heldRank;
        const achieved = meta.rank <= achievedRank;
        const next = !achieved && status.nextLevel === lvl;
        const stateLabel = held ? 'Certified' : achieved ? 'Ready to claim' : next ? 'Next level' : 'Locked';
        return (
          <li
            key={lvl}
            className={cn('relative flex flex-col rounded-3xl border p-5 transition duration-300 sm:p-6', achieved || held ? 'border-transparent bg-paper shadow-card' : next ? 'border-ink-950/15 bg-paper' : 'border-dashed border-ink-950/15 bg-sand-100/70')}
            style={achieved || held ? { boxShadow: `0 0 0 2px ${meta.color}` } : undefined}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold', achieved || held ? 'text-white' : 'bg-sand-200 text-ink-600')}
                  style={achieved || held ? { background: meta.color } : undefined}
                >
                  {held ? <Award className="h-4 w-4" /> : achieved ? <CircleCheck className="h-4 w-4" /> : i + 1}
                </span>
                <span className="font-condensed text-lg uppercase tracking-wide" style={{ color: achieved || held || next ? meta.color : '#7c7c6c' }}>
                  {meta.label.toUpperCase()}
                </span>
              </div>
              <Badge tone={held || achieved ? 'brand' : next ? 'gold' : 'neutral'}>{stateLabel}</Badge>
            </div>
            <p className="mt-2.5 flex-1 text-sm leading-snug text-slate-600">{meta.description}</p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                <span>Requirements</span>
                <span className="tabular-nums">
                  {met}/{reqs.length} met
                </span>
              </div>
              <ProgressBar value={reqs.length ? (met / reqs.length) * 100 : 0} size="xs" color={meta.color} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Small labelled fact (used in stat rows). */
export function Fact({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-sand-100 px-4 py-3.5', className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{value}</dd>
    </div>
  );
}

/** Monospace data/code block for scenario material. */
export function DataBlock({ data, kind }: { data: string; kind: 'table' | 'code' | 'text' }) {
  return (
    <div className="overflow-x-auto rounded-xl">
      <pre
        className={cn(
          'min-w-full whitespace-pre p-4 font-mono text-[12px] leading-relaxed sm:text-[12.5px]',
          kind === 'code' ? 'bg-ink-950 text-slate-100' : 'border border-ink-950/10 bg-sand-100 text-ink-800',
        )}
      >
        {data}
      </pre>
    </div>
  );
}
