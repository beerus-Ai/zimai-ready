import type { CSSProperties, ReactNode, SVGProps } from 'react';

/** Shared primitives for the hand-drawn illustration library. */

export type IllustrationProps = { className?: string; animated?: boolean };
export type P = [number, number];

export const INK = '#1a1a1a';
export const HAIR = '#2b1b14';
export const C = {
  lav: '#c8f0dc',
  lav2: '#a6e6c8',
  pink: '#ffbcf2',
  orange: '#ffa946',
  coral: '#ff6c4c',
  teal: '#034f46',
  teal2: '#1b8f78',
  cream: '#fffeeb',
  sand: '#e4e4d0',
  wine: '#7f1c34',
  white: '#ffffff',
  skin1: '#8a5a3c',
  skin2: '#6b4226',
  skin3: '#a86f4c',
} as const;

export const svgId = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, '');

/** Ink outline for filled shapes. */
export const S = { stroke: INK, strokeWidth: 2.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
/** Ink line (no fill). */
export const LINE = { ...S, fill: 'none' } as const;

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Template tag that rounds interpolated numbers to one decimal. */
export const pd = (s: TemplateStringsArray, ...v: number[]) =>
  s.reduce((acc, str, i) => acc + str + (i < v.length ? r1(v[i]) : ''), '');

/** Deterministic pseudo-random generator so the "wobble" is stable between renders. */
function rng(seed: number) {
  let s = Math.abs(Math.floor(seed * 7919)) % 233280 || 17;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Catmull-Rom spline through points, as cubic Beziers. */
export function smooth(pts: P[], closed = true, t = 1): string {
  const n = pts.length;
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) * t) / 6;
    const c1y = p1[1] + ((p2[1] - p0[1]) * t) / 6;
    const c2x = p2[0] - ((p3[0] - p1[0]) * t) / 6;
    const c2y = p2[1] - ((p3[1] - p1[1]) * t) / 6;
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

/** Slightly irregular circle. */
export function wobCircle(cx: number, cy: number, r: number, seed = 1, j = 0.035, n = 9): string {
  const rand = rng(seed + cx * 0.13 + cy * 0.07);
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = r * (1 + (rand() - 0.5) * 2 * j);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smooth(pts, true);
}

/** Scalloped / bumpy ellipse: clouds, afros, rosettes. */
export function scallop(cx: number, cy: number, rx: number, ry: number, n: number, amp: number, seed = 2): string {
  const rand = rng(seed + cx * 0.11);
  const pts: P[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const k = i % 2 === 0 ? 1 + amp * (0.8 + rand() * 0.4) : 1 - amp * 0.35;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(pts, true);
}

/** Hand-drawn rounded rectangle: edges bow very slightly. */
export function wrect(x: number, y: number, w: number, h: number, r = 8, b = 1.5): string {
  return pd`M${x + r} ${y}Q${x + w / 2} ${y - b} ${x + w - r} ${y}Q${x + w} ${y} ${x + w} ${y + r}Q${x + w + b} ${y + h / 2} ${x + w} ${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}Q${x + w / 2} ${y + h - b} ${x + r} ${y + h}Q${x} ${y + h} ${x} ${y + h - r}Q${x + b} ${y + h / 2} ${x} ${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}

/** Speech bubble with the tail built into the outline (bottom edge). `at` = tail base offset from x. */
export function bubble(x: number, y: number, w: number, h: number, r: number, at: number, tw: number, dx: number, dy: number, b = 1.5): string {
  const yb = y + h;
  return pd`M${x + r} ${y}Q${x + w / 2} ${y - b} ${x + w - r} ${y}Q${x + w} ${y} ${x + w} ${y + r}Q${x + w + b} ${y + h / 2} ${x + w} ${yb - r}Q${x + w} ${yb} ${x + w - r} ${yb}L${x + at + tw} ${yb}L${x + at + dx} ${yb + dy}L${x + at} ${yb}L${x + r} ${yb}Q${x} ${yb} ${x} ${yb - r}Q${x - b} ${y + h / 2} ${x} ${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}

/** 4-point twinkle star. */
export function star4(x: number, y: number, s: number, k = 0.2): string {
  const i = s * k;
  return pd`M${x} ${y - s}C${x + i * 0.4} ${y - i} ${x + i} ${y - i * 0.4} ${x + s} ${y}C${x + i} ${y + i * 0.4} ${x + i * 0.4} ${y + i} ${x} ${y + s}C${x - i * 0.4} ${y + i} ${x - i} ${y + i * 0.4} ${x - s} ${y}C${x - i} ${y - i * 0.4} ${x - i * 0.4} ${y - i} ${x} ${y - s}Z`;
}

/** Radial ray segments around a point. */
export function rays(cx: number, cy: number, ra: number, rb: number, n: number, offset = 0): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + offset;
    d += pd`M${cx + Math.cos(a) * ra} ${cy + Math.sin(a) * ra}L${cx + Math.cos(a) * rb} ${cy + Math.sin(a) * rb}`;
  }
  return d;
}

type AnimClass =
  | 'animate-float'
  | 'animate-wiggle'
  | 'animate-ghost-float'
  | 'animate-ghost-pulse'
  | 'animate-blink'
  | 'animate-spin-slow'
  | 'animate-ping-slow';

/** Animation wrapper group: pivots on its own bounding box. Renders a plain <g> when not animated. */
export function Anim({ on, cls, delay, dur, origin = 'center', children }: { on: boolean; cls: AnimClass; delay?: number; dur?: number; origin?: string; children: ReactNode }) {
  if (!on) return <g>{children}</g>;
  const style: CSSProperties = { transformBox: 'fill-box', transformOrigin: origin };
  if (delay) style.animationDelay = `${delay}s`;
  if (dur) style.animationDuration = `${dur}s`;
  return (
    <g className={cls} style={style}>
      {children}
    </g>
  );
}

type DrawProps = Pick<SVGProps<SVGPathElement>, 'pathLength' | 'strokeDasharray' | 'className' | 'style'>;

/** Stroke draw-on props. Uses pathLength=100 so the dash length is exact regardless of the real path length. */
export function draw(on: boolean, delay = 0, loop?: number): DrawProps {
  if (!on) return {};
  const style = { '--len': 101, animationDelay: `${delay}s` } as CSSProperties;
  if (loop) Object.assign(style, { animationDuration: `${loop}s`, animationIterationCount: 'infinite' });
  return { pathLength: 100, strokeDasharray: '101 101', className: 'animate-draw', style };
}

/** Reveals dashed/dotted children progressively by drawing a mask along `d`. */
export function DrawReveal({ id, d, on, width = 14, delay = 0, children }: { id: string; d: string; on: boolean; width?: number; delay?: number; children: ReactNode }) {
  if (!on) return <g>{children}</g>;
  return (
    <g>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse">
          <path d={d} fill="none" stroke="#fff" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" {...draw(true, delay)} />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>{children}</g>
    </g>
  );
}

/** Outlined "tube" stroke (arms, stalks, handles): an ink stroke with a coloured stroke on top. */
export function Tube({ d, color, w = 11, sw = 2.8 }: { d: string; color: string; w?: number; sw?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + sw * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** A twinkling sparkle. */
export function Twinkle({ x, y, s, fill = C.orange, on, delay = 0, sw = 2.2, cls = 'animate-ghost-pulse' }: { x: number; y: number; s: number; fill?: string; on: boolean; delay?: number; sw?: number; cls?: AnimClass }) {
  return (
    <Anim on={on} cls={cls} delay={delay}>
      <path d={star4(x, y, s)} fill={fill} {...S} strokeWidth={sw} />
    </Anim>
  );
}

export type HairStyle = 'crop' | 'puff' | 'bun' | 'wrap' | 'none';

/** Stylised friendly head: dot eyes that blink, blush, smile, and a simple hairstyle. */
export function Head({ x, y, r = 22, skin, hair = 'crop', hairColor = HAIR, wrap = C.coral, mouth = 'smile', on = false, seed = 3 }: { x: number; y: number; r?: number; skin: string; hair?: HairStyle; hairColor?: string; wrap?: string; mouth?: 'smile' | 'open' | 'flat'; on?: boolean; seed?: number }) {
  const eyeR = Math.max(1.8, r * 0.085);
  const cap = pd`M${x - r * 0.98} ${y - r * 0.05}C${x - r * 1.05} ${y - r * 1.3} ${x + r * 1.05} ${y - r * 1.3} ${x + r * 0.98} ${y - r * 0.05}C${x + r * 0.7} ${y - r * 0.55} ${x - r * 0.2} ${y - r * 0.75} ${x - r * 0.98} ${y - r * 0.05}Z`;
  return (
    <g>
      {hair === 'puff' && <path d={scallop(x, y - r * 0.3, r * 1.3, r * 1.2, 9, 0.06, seed)} fill={hairColor} {...S} />}
      {hair === 'bun' && <path d={wobCircle(x, y - r * 1.05, r * 0.45, seed)} fill={hairColor} {...S} />}
      <path d={wobCircle(x, y, r, seed)} fill={skin} {...S} />
      {(hair === 'crop' || hair === 'puff' || hair === 'bun') && <path d={cap} fill={hairColor} {...S} strokeWidth={2.4} />}
      {hair === 'wrap' && (
        <g>
          <path d={pd`M${x - r * 1.04} ${y - r * 0.12}C${x - r * 1.25} ${y - r * 1.55} ${x + r * 1.25} ${y - r * 1.55} ${x + r * 1.04} ${y - r * 0.12}C${x + r * 0.55} ${y - r * 0.45} ${x - r * 0.55} ${y - r * 0.45} ${x - r * 1.04} ${y - r * 0.12}Z`} fill={wrap} {...S} />
          <path d={scallop(x + r * 0.55, y - r * 1.12, r * 0.32, r * 0.26, 3, 0.18, seed)} fill={wrap} {...S} strokeWidth={2.4} />
          <path d={pd`M${x - r * 0.62} ${y - r * 0.62}Q${x - r * 0.1} ${y - r * 1.02} ${x + r * 0.3} ${y - r * 1.02}`} {...LINE} strokeWidth={2} />
          <circle cx={x - r * 0.5} cy={y - r * 0.35} r={r * 0.07} fill={C.cream} />
          <circle cx={x + r * 0.05} cy={y - r * 0.5} r={r * 0.07} fill={C.cream} />
          <circle cx={x + r * 0.6} cy={y - r * 0.38} r={r * 0.07} fill={C.cream} />
        </g>
      )}
      <ellipse cx={x - r * 0.62} cy={y + r * 0.34} rx={r * 0.17} ry={r * 0.1} fill={C.pink} opacity={0.85} />
      <ellipse cx={x + r * 0.62} cy={y + r * 0.34} rx={r * 0.17} ry={r * 0.1} fill={C.pink} opacity={0.85} />
      <Anim on={on} cls="animate-blink" delay={seed * 0.7}>
        <circle cx={x - r * 0.36} cy={y + r * 0.04} r={eyeR} fill={INK} />
        <circle cx={x + r * 0.36} cy={y + r * 0.04} r={eyeR} fill={INK} />
      </Anim>
      {mouth === 'smile' && <path d={pd`M${x - r * 0.26} ${y + r * 0.36}Q${x} ${y + r * 0.62} ${x + r * 0.26} ${y + r * 0.36}`} {...LINE} strokeWidth={2.2} />}
      {mouth === 'open' && <path d={pd`M${x - r * 0.26} ${y + r * 0.34}Q${x} ${y + r * 0.8} ${x + r * 0.26} ${y + r * 0.34}Z`} fill={C.wine} {...S} strokeWidth={2} />}
      {mouth === 'flat' && <path d={pd`M${x - r * 0.2} ${y + r * 0.45}Q${x} ${y + r * 0.4} ${x + r * 0.2} ${y + r * 0.47}`} {...LINE} strokeWidth={2.2} />}
    </g>
  );
}

/** Root svg: scales to its container via className. */
export function Svg({ className, label, viewBox = '0 0 320 240', preserveAspectRatio, children }: { className?: string; label?: string; viewBox?: string; preserveAspectRatio?: string; children: ReactNode }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return (
    <svg viewBox={viewBox} {...a11y} className={className} fill="none" preserveAspectRatio={preserveAspectRatio} xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}
