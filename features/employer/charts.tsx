import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Lightweight, dependency-free SVG/CSS charts for the employer workspace.
 * Thin marks, recessive grids, hover tooltips, direct labels where useful and
 * accessible text alternatives on every chart.
 */

/** Warm, harmonious chart palette. Semantics: good = teal, mid = orange, risk = coral. */
export const CHART_COLORS = {
  teal: '#034f46',
  green: '#1b8f78',
  orange: '#ffa946',
  coral: '#ff6c4c',
  lilac: '#4fbf8e',
  wine: '#7f1c34',
  sand: '#d2d2b9',
  good: '#034f46',
  mid: '#ffa946',
  risk: '#ff6c4c',
} as const;
export const CHART_SERIES = ['#034f46', '#ffa946', '#4fbf8e', '#ff6c4c', '#1b8f78', '#7f1c34', '#d2d2b9'] as const;

// ───────────────────────── Hooks & primitives ─────────────────────────

export function useAppear(delay = 80) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return on;
}

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => setWidth(Math.round(entries[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function Tip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = Math.max(80, Math.min(Math.max(80, width - 80), x));
  return (
    <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-ink-950 bg-ink-950 px-2.5 py-1.5 text-xs text-canvas shadow-lift" style={{ left, top: y - 8 }}>
      {children}
    </div>
  );
}

export interface LegendItem {
  label: string;
  color: string;
  value?: ReactNode;
}

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600', className)}>
      {items.map((it) => (
        <li key={it.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: it.color }} aria-hidden />
          <span>{it.label}</span>
          {it.value != null && <span className="font-semibold tabular-nums text-ink-900">{it.value}</span>}
        </li>
      ))}
    </ul>
  );
}

// ───────────────────────── Donut ─────────────────────────

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ segments, size = 184, thickness = 20, centerValue, centerLabel, ariaLabel, className }: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
  ariaLabel?: string;
  className?: string;
}) {
  const on = useAppear();
  const [hover, setHover] = useState<number | null>(null);
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const rad = (size - thickness - 8) / 2;
  const circ = 2 * Math.PI * rad;
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 2.5 : 0;
  let acc = 0;
  const arcs = segments.map((s) => {
    const len = (s.value / total) * circ;
    const arc = { len: Math.max(0, len - gap), offset: acc };
    acc += len;
    return arc;
  });
  const h = hover != null ? segments[hover] : null;
  const summary = ariaLabel ?? segments.map((s) => `${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`).join(', ');
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }} role="img" aria-label={summary}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={rad} fill="none" stroke="#ebebd8" strokeWidth={thickness} />
        {arcs.map((a, i) => (
          <circle
            key={segments[i].label}
            cx={size / 2}
            cy={size / 2}
            r={rad}
            fill="none"
            stroke={segments[i].color}
            strokeWidth={hover === i ? thickness + 6 : thickness}
            strokeDasharray={`${on ? a.len : 0} ${circ}`}
            strokeDashoffset={-a.offset}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="cursor-pointer"
            style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1), stroke-width .15s ease' }}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {h ? (
          <>
            <span className="font-display text-4xl font-medium leading-none tabular-nums text-ink-950">{Math.round((h.value / total) * 100)}%</span>
            <span className="mt-0.5 max-w-[70%] text-[11px] font-semibold leading-tight text-slate-500">
              {h.label} · {h.value}
            </span>
          </>
        ) : (
          <>
            <span className="font-display text-4xl font-medium leading-none tabular-nums text-ink-950">{centerValue}</span>
            {centerLabel && <span className="mt-0.5 max-w-[70%] text-[11px] font-semibold uppercase leading-tight tracking-wide text-slate-500">{centerLabel}</span>}
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Stacked bar ─────────────────────────

export function StackedBar({ segments, height = 8, className, label }: { segments: DonutSegment[]; height?: number; className?: string; label?: string }) {
  const on = useAppear();
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className={cn('flex w-full gap-[2px] overflow-hidden rounded-full bg-sand-200', className)} style={{ height }} role="img" aria-label={label ?? segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <span
            key={s.label}
            title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: on ? `${(s.value / total) * 100}%` : '0%', background: s.color, transition: 'width .9s cubic-bezier(.2,.8,.2,1)' }}
          />
        ))}
    </div>
  );
}

// ───────────────────────── Horizontal bars ─────────────────────────

export interface BarItem {
  id?: string;
  label: string;
  value: number;
  display?: string;
  color?: string;
  sublabel?: ReactNode;
  marker?: number; // e.g. exposure or target, drawn as a tick
  markerLabel?: string;
}

export function HorizontalBarList({ items, max = 100, onSelect, labelWidth = '9.5rem', className, ariaLabel }: {
  items: BarItem[];
  max?: number;
  onSelect?: (item: BarItem) => void;
  labelWidth?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const on = useAppear();
  return (
    <ul className={cn('space-y-1', className)} aria-label={ariaLabel}>
      {items.map((it) => {
        const w = Math.max(0, Math.min(100, (it.value / max) * 100));
        const content = (
          <>
            <span className="min-w-0 text-left">
              <span className="block truncate text-[13px] font-semibold text-ink-900">{it.label}</span>
              {it.sublabel && <span className="block truncate text-[11px] text-slate-500">{it.sublabel}</span>}
            </span>
            <span className="relative h-2.5 w-full rounded-full bg-sand-200">
              <span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: on ? `${w}%` : '0%', background: it.color ?? CHART_COLORS.good, transition: 'width .9s cubic-bezier(.2,.8,.2,1)' }}
              />
              {it.marker != null && (
                <span
                  className="absolute -top-1 h-[18px] w-[2px] rounded-full bg-ink-900/60"
                  style={{ left: `calc(${Math.min(100, (it.marker / max) * 100)}% - 1px)` }}
                  title={it.markerLabel}
                  aria-hidden
                />
              )}
            </span>
            <span className="w-12 text-right text-sm font-bold tabular-nums text-ink-950">{it.display ?? `${Math.round(it.value)}%`}</span>
          </>
        );
        const cls = 'grid w-full items-center gap-3 rounded-lg px-2 py-2';
        const style = { gridTemplateColumns: `minmax(0, ${labelWidth}) minmax(0, 1fr) auto` };
        const title = `${it.label}: ${it.display ?? `${Math.round(it.value)}%`}${it.marker != null ? ` · ${it.markerLabel ?? 'marker'} ${it.marker}%` : ''}`;
        return (
          <li key={it.id ?? it.label}>
            {onSelect ? (
              <button type="button" onClick={() => onSelect(it)} className={cn(cls, 'transition hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac-400')} style={style} title={title}>
                {content}
              </button>
            ) : (
              <div className={cn(cls, 'hover:bg-sand-100')} style={style} title={title}>
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ───────────────────────── Vertical bars ─────────────────────────

export function VerticalBarChart({ data, height = 190, max = 100, suffix = '%', className, ariaLabel }: {
  data: { label: string; value: number; color?: string; display?: string }[];
  height?: number;
  max?: number;
  suffix?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const on = useAppear();
  const [hover, setHover] = useState<number | null>(null);
  const ticks = [0, 25, 50, 75, 100];
  return (
    <div className={cn('w-full', className)} role="img" aria-label={ariaLabel ?? data.map((d) => `${d.label} ${d.display ?? d.value + suffix}`).join(', ')}>
      <div className="relative flex" style={{ height }}>
        <div className="relative w-8 shrink-0" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-slate-400" style={{ top: `${100 - t}%` }}>
              {Math.round((t / 100) * max)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <span key={t} className={cn('absolute inset-x-0 border-t', t === 0 ? 'border-slate-300' : 'border-dashed border-slate-200')} style={{ top: `${100 - t}%` }} aria-hidden />
          ))}
          <div className="absolute inset-0 flex items-end gap-2 px-1 sm:gap-3">
            {data.map((d, i) => {
              const h = Math.max(0, Math.min(100, (d.value / max) * 100));
              return (
                <div key={d.label} className="relative flex h-full flex-1 flex-col items-center justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <span className={cn('mb-1 text-[11px] font-bold tabular-nums transition', hover === i ? 'text-ink-950' : 'text-slate-600')}>{d.display ?? `${Math.round(d.value)}${suffix}`}</span>
                  <div
                    className="w-full max-w-[42px] rounded-t-lg transition-[height,opacity] duration-700 ease-out"
                    style={{ height: on ? `${h}%` : '0%', background: d.color ?? CHART_COLORS.good, opacity: hover == null || hover === i ? 1 : 0.55 }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-8 mt-2 flex gap-2 px-1 sm:gap-3" aria-hidden>
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[11px] font-medium text-slate-500" title={d.label}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── Heatmap (diverging around a target) ─────────────────────────

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [ra, ga, ba] = hexToRgb(a);
  const [rb, gb, bb] = hexToRgb(b);
  return `rgb(${Math.round(ra + (rb - ra) * t)}, ${Math.round(ga + (gb - ga) * t)}, ${Math.round(ba + (bb - ba) * t)})`;
};
const LOW = CHART_COLORS.risk;
const MID = '#f5f5e6';
const HIGH = CHART_COLORS.good;

/** Diverging colour: coral below the target, warm sand at the target, teal above. */
export function divergingColor(v: number, mid = 50): { bg: string; fg: string } {
  const t = v < mid ? (mid - v) / mid : (v - mid) / (100 - mid);
  const bg = v < mid ? mix(MID, LOW, Math.min(1, t)) : mix(MID, HIGH, Math.min(1, t));
  return { bg, fg: t > 0.55 && v >= mid ? '#fffeeb' : '#1a1a1a' };
}

export function Heatmap({ rows, cols, values, mid = 50, format = (v: number) => `${v}%`, rowHeader = 'Department', onCellClick, describe }: {
  rows: { id: string; label: string; sub?: string }[];
  cols: { id: string; label: string; sub?: ReactNode }[];
  values: number[][];
  mid?: number;
  format?: (v: number) => string;
  rowHeader?: string;
  onCellClick?: (row: number, col: number) => void;
  describe?: (row: number, col: number, v: number) => string;
}) {
  const on = useAppear();
  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <table className="w-full min-w-[560px] border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-paper px-2 pb-2 text-left align-bottom text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {rowHeader}
              </th>
              {cols.map((c) => (
                <th key={c.id} scope="col" className="min-w-[84px] px-1 pb-2 text-center align-bottom text-[11px] font-semibold leading-tight text-slate-600">
                  {c.label}
                  {c.sub && <div className="mt-0.5 font-normal text-slate-400">{c.sub}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id}>
                <th scope="row" className="sticky left-0 z-10 bg-paper pr-3 text-left">
                  <span className="block whitespace-nowrap text-[13px] font-semibold text-ink-900">{row.label}</span>
                  {row.sub && <span className="block text-[11px] font-normal text-slate-400">{row.sub}</span>}
                </th>
                {cols.map((c, ci) => {
                  const v = values[ri]?.[ci] ?? 0;
                  const { bg, fg } = divergingColor(v, mid);
                  const text = describe ? describe(ri, ci, v) : `${row.label} — ${c.label}: ${format(v)}`;
                  const cell = (
                    <span
                      className="flex h-11 items-center justify-center rounded-lg text-[13px] font-bold tabular-nums transition-opacity duration-500"
                      style={{ background: bg, color: fg, opacity: on ? 1 : 0, transitionDelay: `${(ri * cols.length + ci) * 12}ms` }}
                    >
                      {format(v)}
                    </span>
                  );
                  return (
                    <td key={c.id} className="p-0" title={text}>
                      {onCellClick ? (
                        <button type="button" className="block w-full rounded-lg transition hover:-translate-y-px hover:shadow-ink-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac-400" onClick={() => onCellClick(ri, ci)} aria-label={text}>
                          {cell}
                        </button>
                      ) : (
                        <span aria-label={text} role="img" className="block">
                          {cell}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span>0%</span>
        <span className="h-2 w-40 rounded-full" style={{ background: `linear-gradient(90deg, ${LOW}, ${MID}, ${HIGH})` }} aria-hidden />
        <span>100%</span>
        <span className="text-slate-400">· sand = {mid}% target · each cell shows the share meeting the requirement</span>
      </div>
    </div>
  );
}

// ───────────────────────── Quadrant scatter ─────────────────────────

export interface ScatterPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  sub?: string;
}

export function QuadrantScatter({ points, xThreshold = 65, yThreshold = 60, xLabel = 'AI exposure', yLabel = 'AI readiness', height = 320, showLabels = true, onSelect, ariaLabel }: {
  points: ScatterPoint[];
  xThreshold?: number;
  yThreshold?: number;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  showLabels?: boolean;
  onSelect?: (p: ScatterPoint) => void;
  ariaLabel?: string;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<ScatterPoint | null>(null);
  const on = useAppear(120);
  const pad = { l: 40, r: 14, t: 12, b: 36 };
  const x0 = Math.max(0, Math.min(xThreshold - 20, Math.floor((Math.min(...points.map((p) => p.x), 100) - 8) / 10) * 10));
  const y0 = Math.max(0, Math.min(yThreshold - 30, Math.floor((Math.min(...points.map((p) => p.y), 100) - 8) / 10) * 10));
  const pw = Math.max(10, width - pad.l - pad.r);
  const ph = height - pad.t - pad.b;
  const sx = (v: number) => pad.l + ((v - x0) / (100 - x0)) * pw;
  const sy = (v: number) => pad.t + (1 - (v - y0) / (100 - y0)) * ph;
  const xt = sx(xThreshold);
  const yt = sy(yThreshold);
  const ticksX = Array.from({ length: Math.floor((100 - x0) / 10) + 1 }, (_, i) => x0 + i * 10).filter((v, i, a) => width > 420 || i % 2 === 0 || i === a.length - 1);
  const ticksY = Array.from({ length: Math.floor((100 - y0) / 20) + 1 }, (_, i) => y0 + i * 20);
  const rOf = (p: ScatterPoint) => (p.size ? Math.max(7, Math.min(24, 5 + Math.sqrt(p.size) * 2.6)) : 5);
  const quad = [
    { x: pad.l, y: pad.t, w: xt - pad.l, h: yt - pad.t, fill: '#f1fbf6', label: 'Future ready', ax: pad.l + 8, ay: pad.t + 16, anchor: 'start' as const },
    { x: xt, y: pad.t, w: pad.l + pw - xt, h: yt - pad.t, fill: '#eefaf6', label: 'Well positioned', ax: pad.l + pw - 8, ay: pad.t + 16, anchor: 'end' as const },
    { x: pad.l, y: yt, w: xt - pad.l, h: pad.t + ph - yt, fill: '#fbfbf1', label: 'Build foundations', ax: pad.l + 8, ay: pad.t + ph - 8, anchor: 'start' as const },
    { x: xt, y: yt, w: pad.l + pw - xt, h: pad.t + ph - yt, fill: '#fff3ef', label: 'Priority reskilling', ax: pad.l + pw - 8, ay: pad.t + ph - 8, anchor: 'end' as const },
  ];
  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel ?? `${yLabel} versus ${xLabel}: ${points.map((p) => `${p.label} exposure ${p.x}%, readiness ${p.y}%`).join('; ')}`}>
          {quad.map((q) => (
            <g key={q.label}>
              <rect x={q.x} y={q.y} width={Math.max(0, q.w)} height={Math.max(0, q.h)} fill={q.fill} />
              <text x={q.ax} y={q.ay} textAnchor={q.anchor} className="fill-slate-400" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {q.label}
              </text>
            </g>
          ))}
          {ticksX.map((t) => (
            <text key={`x${t}`} x={sx(t)} y={pad.t + ph + 15} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>
              {t}
            </text>
          ))}
          {ticksY.map((t) => (
            <text key={`y${t}`} x={pad.l - 8} y={sy(t) + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: 10 }}>
              {t}
            </text>
          ))}
          <line x1={pad.l} x2={pad.l + pw} y1={pad.t + ph} y2={pad.t + ph} stroke="#d2d2b9" />
          <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + ph} stroke="#d2d2b9" />
          <line x1={xt} x2={xt} y1={pad.t} y2={pad.t + ph} stroke="#a3a390" strokeDasharray="4 4" />
          <line x1={pad.l} x2={pad.l + pw} y1={yt} y2={yt} stroke="#a3a390" strokeDasharray="4 4" />
          <text x={pad.l + pw / 2} y={height - 4} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11, fontWeight: 600 }}>
            {xLabel} (%) →
          </text>
          <text transform={`translate(11 ${pad.t + ph / 2}) rotate(-90)`} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11, fontWeight: 600 }}>
            {yLabel} (%) →
          </text>
          {points.map((p, i) => {
            const cx = sx(p.x);
            const cy = sy(p.y);
            const rr = rOf(p);
            const right = cx + rr + 80 < pad.l + pw;
            return (
              <g
                key={p.id}
                className={onSelect ? 'cursor-pointer' : undefined}
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect?.(p)}
                style={{ opacity: on ? 1 : 0, transition: `opacity .5s ease ${i * 40}ms` }}
              >
                <circle cx={cx} cy={cy} r={Math.max(rr, 12)} fill="transparent" />
                <circle cx={cx} cy={cy} r={hover?.id === p.id ? rr + 2 : rr} fill={p.color ?? CHART_COLORS.good} fillOpacity={0.9} stroke="#1a1a1a" strokeOpacity={hover?.id === p.id ? 1 : 0.5} strokeWidth={hover?.id === p.id ? 1.5 : 1} />
                {showLabels && (
                  <text x={right ? cx + rr + 5 : cx - rr - 5} y={cy + 4} textAnchor={right ? 'start' : 'end'} className="fill-ink-900" style={{ fontSize: 11.5, fontWeight: 700, paintOrder: 'stroke', stroke: '#fffdf6', strokeWidth: 3 }}>
                    {p.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover && (
        <Tip x={sx(hover.x)} y={sy(hover.y) - rOf(hover)} width={width}>
          <p className="font-bold">{hover.label}</p>
          <p className="text-canvas/70">
            Exposure {hover.x}% · Readiness {hover.y}%{hover.sub ? ` · ${hover.sub}` : ''}
          </p>
        </Tip>
      )}
    </div>
  );
}

// ───────────────────────── Radar ─────────────────────────

export function RadarChart({ axes, max = 100, color = CHART_COLORS.good, size = 320, className, compare }: {
  axes: { label: string; value: number }[];
  max?: number;
  color?: string;
  size?: number;
  className?: string;
  compare?: { label: string; values: number[] };
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const on = useAppear(150);
  const w = Math.min(size, width || size);
  const labelPad = w < 300 ? 58 : 76; // room for side labels such as "Governance"
  const R = Math.max(40, w / 2 - labelPad);
  const c = w / 2;
  const n = axes.length;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number) => [c + Math.cos(ang(i)) * R * (v / max), c + Math.sin(ang(i)) * R * (v / max)] as const;
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(',')).join(' ');
  return (
    <div ref={ref} className={cn('flex w-full justify-center', className)}>
      {width > 0 && (
        <svg width={w} height={w} overflow="visible" style={{ overflow: 'visible' }} role="img" aria-label={axes.map((a) => `${a.label} ${a.value}`).join(', ')}>
          {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
            <polygon key={f} points={axes.map((_, i) => pt(i, max * f).join(',')).join(' ')} fill="none" stroke="#e4e4d0" strokeWidth={1} />
          ))}
          {axes.map((_, i) => {
            const [x, y] = pt(i, max);
            return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#e4e4d0" />;
          })}
          {compare && <polygon points={poly(compare.values)} fill="none" stroke="#a3a390" strokeWidth={1.5} strokeDasharray="4 3" />}
          <g style={{ transform: `scale(${on ? 1 : 0.2})`, transformOrigin: `${c}px ${c}px`, opacity: on ? 1 : 0, transition: 'transform .9s cubic-bezier(.2,.8,.2,1), opacity .5s' }}>
            <polygon points={poly(axes.map((a) => a.value))} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2.25} strokeLinejoin="round" />
            {axes.map((a, i) => {
              const [x, y] = pt(i, a.value);
              return <circle key={a.label} cx={x} cy={y} r={4} fill={color} stroke="#fffdf6" strokeWidth={2} />;
            })}
          </g>
          {axes.map((a, i) => {
            const [x, y] = pt(i, max * 1.13);
            const cos = Math.cos(ang(i));
            const anchor = Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end';
            const dy = Math.sin(ang(i)) < -0.5 ? -6 : Math.sin(ang(i)) > 0.5 ? 10 : 2;
            return (
              <text key={a.label} x={x} y={y + dy} textAnchor={anchor} style={{ fontSize: 11.5 }}>
                <tspan className="fill-slate-600" style={{ fontWeight: 600 }}>
                  {a.label}
                </tspan>
                <tspan x={x} dy={14} className="fill-ink-950" style={{ fontWeight: 800 }}>
                  {Math.round(a.value)}
                </tspan>
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// ───────────────────────── Line / area ─────────────────────────

export interface LineSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
}

export function AreaLine({ series, labels, height = 220, yMax = 100, yMin = 0, suffix = '%', className, ariaLabel }: {
  series: LineSeries[];
  labels: string[];
  height?: number;
  yMax?: number;
  yMin?: number;
  suffix?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [idx, setIdx] = useState<number | null>(null);
  const on = useAppear(100);
  const gid = useId().replace(/:/g, '');
  const pad = { l: 32, r: 36, t: 12, b: 26 };
  const n = labels.length;
  const pw = Math.max(10, width - pad.l - pad.r);
  const ph = height - pad.t - pad.b;
  const sx = (i: number) => pad.l + (n > 1 ? (i / (n - 1)) * pw : pw / 2);
  const sy = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * ph;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMin + (yMax - yMin) * f));
  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    setIdx(Math.max(0, Math.min(n - 1, Math.round((mx / rect.width) * (n - 1)))));
  };
  return (
    <div className={cn('w-full', className)}>
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={ariaLabel ?? series.map((s) => `${s.label}: ${s.values.map((v, i) => `${labels[i]} ${v}${suffix}`).join(', ')}`).join('. ')}>
            <defs>
              <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={series[0]?.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={series[0]?.color} stopOpacity={0} />
              </linearGradient>
              <clipPath id={`clip-${gid}`}>
                <rect x={0} y={0} width={on ? width : 0} height={height} style={{ transition: 'width 1.2s cubic-bezier(.2,.8,.2,1)' }} />
              </clipPath>
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={pad.l + pw} y1={sy(t)} y2={sy(t)} stroke={t === yMin ? '#d2d2b9' : '#ebebd8'} strokeDasharray={t === yMin ? undefined : '3 4'} />
                <text x={pad.l - 6} y={sy(t) + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: 10 }}>
                  {t}
                </text>
              </g>
            ))}
            {labels.map((l, i) => (
              <text key={l + i} x={sx(i)} y={height - 6} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10.5 }}>
                {l}
              </text>
            ))}
            <g clipPath={`url(#clip-${gid})`}>
              {series[0] && <path d={`${path(series[0].values)} L${sx(n - 1)},${sy(yMin)} L${sx(0)},${sy(yMin)} Z`} fill={`url(#area-${gid})`} />}
              {series.map((s) => (
                <path key={s.id} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
              ))}
              {series.map((s) => (
                <g key={`end-${s.id}`}>
                  <circle cx={sx(n - 1)} cy={sy(s.values[n - 1])} r={4} fill={s.color} stroke="#fffdf6" strokeWidth={2} />
                  <text x={sx(n - 1) + 7} y={sy(s.values[n - 1]) + 4} className="fill-ink-900" style={{ fontSize: 11, fontWeight: 700 }}>
                    {s.values[n - 1]}
                    {suffix}
                  </text>
                </g>
              ))}
            </g>
            {idx != null && (
              <g pointerEvents="none">
                <line x1={sx(idx)} x2={sx(idx)} y1={pad.t} y2={pad.t + ph} stroke="#a3a390" strokeDasharray="3 3" />
                {series.map((s) => (
                  <circle key={s.id} cx={sx(idx)} cy={sy(s.values[idx])} r={4.5} fill={s.color} stroke="#fffdf6" strokeWidth={2} />
                ))}
              </g>
            )}
            <rect x={pad.l} y={pad.t} width={pw} height={ph} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setIdx(null)} />
          </svg>
        )}
        {idx != null && (
          <Tip x={sx(idx)} y={Math.min(...series.map((s) => sy(s.values[idx])))} width={width}>
            <p className="mb-0.5 font-bold">{labels[idx]}</p>
            {series.map((s) => (
              <p key={s.id} className="flex items-center gap-1.5 text-canvas/80">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.label}: <span className="font-semibold text-canvas">{s.values[idx]}{suffix}</span>
              </p>
            ))}
          </Tip>
        )}
      </div>
      {series.length > 1 && <ChartLegend className="mt-3" items={series.map((s) => ({ label: s.label, color: s.color }))} />}
    </div>
  );
}

export function Sparkline({ values, color = CHART_COLORS.good, height = 36, className, fill = true, label }: { values: number[]; color?: string; height?: number; className?: string; fill?: boolean; label?: string }) {
  const gid = useId().replace(/:/g, '');
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [values.length > 1 ? (i / (values.length - 1)) * 100 : 50, 4 + (1 - (v - min) / span) * (height - 8)] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className={cn('w-full', className)} style={{ height }} role="img" aria-label={label ?? `Trend: ${values.join(', ')}`}>
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={`${d} L100,${height} L0,${height} Z`} fill={`url(#spark-${gid})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
