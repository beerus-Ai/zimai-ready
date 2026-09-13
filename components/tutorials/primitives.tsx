import { useEffect, useLayoutEffect, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { cn } from '../../lib/utils';
import { useInView } from '../motion';
import { GhostMascot, Sparkle } from '../illustrations';

/* Shared building blocks for the animated tutorial scenes. Every scene is drawn on a fixed logical
   canvas (440 × 250) that is scaled to fit the player's stage, so the mini-UIs keep their composition
   from a 375px phone up to a wide desktop without overflowing. */

export const CANVAS_W = 440;
export const CANVAS_H = 250;

export const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Keyframes used only by the tutorial scenes. */
const CSS = `
@keyframes tut-click { 0% { transform: scale(.2); opacity: .9 } 100% { transform: scale(2.6); opacity: 0 } }
@keyframes tut-press { 0%,100% { transform: scale(1) } 45% { transform: scale(.8) } }
@keyframes tut-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes tut-rise { from { transform: scaleY(0) } to { transform: scaleY(1) } }
@keyframes tut-burst { 0% { transform: translate(0,0) scale(.2) rotate(0deg); opacity: 0 } 15% { opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(1) rotate(var(--r)); opacity: 0 } }
@keyframes tut-slide { from { transform: translateY(60px) rotate(-9deg); opacity: 0; filter: blur(12px) } to { transform: translateY(0) rotate(-2.5deg); opacity: 1; filter: blur(0) } }
@keyframes tut-dot { 0%,80%,100% { transform: translateY(0); opacity: .35 } 40% { transform: translateY(-4px); opacity: 1 } }
@keyframes tut-pop { 0% { transform: scale(.4); opacity: 0 } 70% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
@keyframes tut-fly { from { transform: translate(-40px, 16px) rotate(-8deg); opacity: 0; filter: blur(8px) } to { transform: none; opacity: 1; filter: blur(0) } }
@keyframes tut-sweep { from { transform: rotate(-80deg) } to { transform: rotate(var(--to)) } }
@keyframes tut-scan { 0%,100% { top: 12% } 50% { top: 82% } }
@keyframes tut-stamp { 0% { transform: scale(2.4) rotate(-14deg); opacity: 0 } 60% { transform: scale(.94) rotate(-10deg); opacity: 1 } 100% { transform: scale(1) rotate(-10deg); opacity: 1 } }
.tut-scan { animation: tut-scan 1.8s ease-in-out infinite }
.tut-stamp { animation: tut-stamp .55s cubic-bezier(.2,.8,.2,1) both }
.tut-click { animation: tut-click .65s ease-out both }
.tut-press { animation: tut-press .35s ease-in-out both }
.tut-grow { transform-origin: left center; animation: tut-grow 1.1s cubic-bezier(.2,.8,.2,1) both }
.tut-rise { transform-origin: bottom center; animation: tut-rise 1s cubic-bezier(.2,.8,.2,1) both }
.tut-burst { animation: tut-burst 1.4s cubic-bezier(.2,.7,.3,1) both }
.tut-slide { animation: tut-slide 1.1s cubic-bezier(.2,.8,.2,1) both }
.tut-dot { animation: tut-dot 1.1s ease-in-out infinite }
.tut-pop { animation: tut-pop .5s cubic-bezier(.2,.8,.2,1) both }
.tut-fly { animation: tut-fly .8s cubic-bezier(.2,.8,.2,1) both }
.tut-sweep { transform-origin: 50% 100%; animation: tut-sweep 1.6s cubic-bezier(.3,1.4,.5,1) both }
`;

export function TutorialStyles() {
  return <style>{CSS}</style>;
}

/* ───────────── Timelines ───────────── */

/** Advances a step counter at each cumulative timestamp (ms). Reduced motion jumps straight to the end state. */
export function useTimeline(marks: number[]) {
  const [step, setStep] = useState(() => (reducedMotion() ? marks.length : 0));
  const key = marks.join(',');
  useEffect(() => {
    if (reducedMotion()) {
      setStep(marks.length);
      return;
    }
    setStep(0);
    const ids = marks.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return step;
}

/** Cycles 0 → n-1 on an interval (static under reduced motion). */
export function useCycle(n: number, every: number, delay = 0) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion() || n < 2) return;
    let interval = 0;
    const t = window.setTimeout(() => {
      setI((x) => (x + 1) % n);
      interval = window.setInterval(() => setI((x) => (x + 1) % n), every);
    }, delay || every);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(interval);
    };
  }, [n, every, delay]);
  return i;
}

/* ───────────── Canvas ───────────── */

/** Scales a fixed-size scene to fit its container. Children mount only once visible, so animations start on screen. */
export function SceneCanvas({ children, width = CANVAS_W, height = CANVAS_H, className }: { children: ReactNode; width?: number; height?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>('0px');
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) setScale(Math.min(w / width, h / height, 1.4));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, width, height]);
  return (
    <div ref={ref} className={cn('relative h-full w-full', className)} aria-hidden>
      <TutorialStyles />
      <div className="absolute left-1/2 top-1/2" style={{ width, height, transform: `translate(-50%, -50%) scale(${scale || 0.0001})` }}>
        {inView && scale > 0 ? children : null}
      </div>
    </div>
  );
}

/* ───────────── Pieces ───────────── */

/** Materialises out of a blur after `delay` ms (or when `show` flips true). */
export function Ghost({ children, delay = 0, show = true, className, style }: { children?: ReactNode; delay?: number; show?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn(show ? 'animate-ghost-in' : 'opacity-0', className)} style={{ ...style, animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Panel({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('rounded-2xl border border-ink-950/10 bg-paper text-ink-950 shadow-card', className)} style={style}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500', className)}>{children}</p>;
}

/** The friendly ghost guide, floating in a corner of the scene. */
export function Mascot({ mood = 'happy', className, delay = 250 }: { mood?: 'happy' | 'thinking' | 'wave'; className?: string; delay?: number }) {
  return (
    <div className={cn('pointer-events-none absolute z-20 animate-ghost-in', className)} style={{ animationDelay: `${delay}ms` }}>
      <div className="h-full w-full animate-ghost-float">
        <GhostMascot mood={mood} animated className="h-full w-full" />
      </div>
    </div>
  );
}

/** A small speech bubble (for the mascot). */
export function Speech({ children, className, show = true, delay = 0, tail = 'right' }: { children: ReactNode; className?: string; show?: boolean; delay?: number; tail?: 'right' | 'left' }) {
  return (
    <div className={cn('absolute z-20', show ? 'animate-ghost-in' : 'opacity-0', className)} style={{ animationDelay: `${delay}ms` }}>
      <div className={cn('relative rounded-2xl border border-ink-950 bg-lilac-200 px-3 py-1.5 text-[12px] font-semibold leading-snug text-ink-950 shadow-ink-sm', tail === 'right' ? 'rounded-br-sm' : 'rounded-bl-sm')}>{children}</div>
    </div>
  );
}

export function TypingDots({ className, dot = 'bg-ink-950/70' }: { className?: string; dot?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {[0, 160, 320].map((d) => (
        <span key={d} className={cn('tut-dot h-1.5 w-1.5 rounded-full', dot)} style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}

const BURST_COLOURS = ['#ffa946', '#ff6c4c', '#c8f0dc', '#ffbcf2', '#034f46', '#1b8f78'];

/** Confetti + sparkle burst radiating from its centre. Place inside a relative parent. */
export function SparkleBurst({ className, count = 16, delay = 0, radius = 110 }: { className?: string; count?: number; delay?: number; radius?: number }) {
  return (
    <div className={cn('pointer-events-none absolute h-0 w-0', className)}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
        const r = radius * (0.6 + ((i * 37) % 10) / 25);
        const style = {
          '--dx': `${Math.cos(a) * r}px`,
          '--dy': `${Math.sin(a) * r}px`,
          '--r': `${(i % 2 ? 1 : -1) * (90 + i * 20)}deg`,
          animationDelay: `${delay + (i % 4) * 60}ms`,
        } as CSSProperties;
        return i % 4 === 0 ? (
          <span key={i} className="tut-burst absolute -left-2 -top-2 h-4 w-4" style={style}>
            <Sparkle className="h-4 w-4" color={BURST_COLOURS[i % BURST_COLOURS.length]} />
          </span>
        ) : (
          <span key={i} className={cn('tut-burst absolute -left-1 -top-1', i % 3 ? 'h-2 w-2 rounded-full' : 'h-1.5 w-3 rounded-sm')} style={{ ...style, background: BURST_COLOURS[i % BURST_COLOURS.length] }} />
        );
      })}
    </div>
  );
}

/** A deterministic, decorative QR-style code. */
export function FauxQR({ seed = 'zimai', size = 56, className }: { seed?: string; size?: number; className?: string }) {
  const n = 11;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push(((h >> 16) & 1) === 1);
  }
  const finder = (x: number, y: number) => (x < 4 && y < 4) || (x > n - 5 && y < 4) || (x < 4 && y > n - 5);
  const cell = size / n;
  const corners = [
    [0, 0],
    [n - 3, 0],
    [0, n - 3],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <rect width={size} height={size} fill="#fffdf6" />
      {cells.map((on, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        return on && !finder(x, y) ? <rect key={i} x={x * cell} y={y * cell} width={cell + 0.2} height={cell + 0.2} fill="#1a1a1a" /> : null;
      })}
      {corners.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <rect x={cx * cell + cell * 0.5} y={cy * cell + cell * 0.5} width={cell * 2} height={cell * 2} fill="none" stroke="#1a1a1a" strokeWidth={cell} />
          <rect x={cx * cell + cell} y={cy * cell + cell} width={cell} height={cell} fill="#1a1a1a" />
        </g>
      ))}
    </svg>
  );
}

/* ───────────── Fake cursor ───────────── */

interface Pt {
  x: number;
  y: number;
}

/**
 * An animated arrow cursor that glides to a target element inside `root` and "clicks" whenever `clicks` increments.
 * Positions are measured with offsetLeft/offsetTop, so they are unaffected by the canvas scale or ghost transforms.
 */
export function DemoCursor({ root, target, idle = { x: 0.92, y: 0.96 }, clicks = 0, anchor = { x: 0.62, y: 0.6 } }: {
  root: RefObject<HTMLElement | null>;
  target?: RefObject<HTMLElement | null> | null;
  idle?: Pt;
  clicks?: number;
  anchor?: Pt;
}) {
  const [pos, setPos] = useState<Pt | null>(null);
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const t = target?.current;
    if (!t) {
      setPos({ x: r.clientWidth * idle.x, y: r.clientHeight * idle.y });
      return;
    }
    let x = t.offsetWidth * anchor.x;
    let y = t.offsetHeight * anchor.y;
    let el: HTMLElement | null = t;
    while (el && el !== r) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
    }
    if (!el) return;
    setPos({ x, y });
  }, [root, target, idle.x, idle.y, anchor.x, anchor.y]);
  if (!pos) return null;
  return (
    <div className="pointer-events-none absolute z-40" style={{ left: pos.x, top: pos.y, transition: 'left .85s cubic-bezier(.65,0,.25,1), top .85s cubic-bezier(.65,0,.25,1)' }}>
      {clicks > 0 && <span key={`r${clicks}`} className="tut-click absolute -left-3 -top-3 h-6 w-6 rounded-full bg-lilac-400/70" />}
      <svg key={`c${clicks}`} width="20" height="24" viewBox="0 0 20 24" className={cn('relative drop-shadow-md', clicks > 0 && 'tut-press')} style={{ transformOrigin: '2px 2px' }}>
        <path d="M2 1.5v17.5l4.6-4.1 3.1 7 3.3-1.5-3.1-6.9 6.2-.5z" fill="#1a1a1a" stroke="#fffdf6" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
