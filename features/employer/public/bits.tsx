import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../../components/motion';
import { cn } from '../../../lib/utils';

/**
 * Re-mounts its children once they scroll into view, so charts that animate on mount
 * (bars growing, donuts drawing) play their animation when the reader actually sees them.
 * Children render immediately too, so there is no layout shift.
 */
export function ReplayOnView({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>('0px 0px -12% 0px');
  return (
    <div ref={ref} className={className}>
      <div key={inView ? 'on' : 'off'} className={cn(!inView && 'opacity-0')}>
        {children}
      </div>
    </div>
  );
}

function Counter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{v}</>;
}

/** Oversized condensed stat number that counts up when it enters the viewport. */
export function BigStat({ value, suffix = '', label, className, numberClassName, labelClassName }: {
  value: number;
  suffix?: string;
  label: ReactNode;
  className?: string;
  numberClassName?: string;
  labelClassName?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      <dt className="sr-only">{label}</dt>
      <dd className={cn('font-condensed uppercase leading-[0.85] tabular-nums', numberClassName)} aria-label={`${value}${suffix}`}>
        <span aria-hidden>{inView ? <Counter target={value} /> : 0}{suffix}</span>
      </dd>
      <dd className={cn('mt-2 text-xs font-semibold uppercase tracking-[0.16em]', labelClassName)} aria-hidden>
        {label}
      </dd>
    </div>
  );
}

/** A bar fill that grows to `pct` when it scrolls into view (width, or height when vertical). */
export function GrowBar({ pct, className, style, delay = 0, vertical = false }: { pct: number; className?: string; style?: CSSProperties; delay?: number; vertical?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setOn(true), 60);
    return () => clearTimeout(t);
  }, [inView]);
  const size = `${on ? Math.max(0, Math.min(100, pct)) : 0}%`;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(vertical ? { height: size } : { width: size }),
        transition: `${vertical ? 'height' : 'width'} 1s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
      }}
    />
  );
}

/** Small floating analytics chip used over photos. */
export function FloatChip({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={cn('absolute z-10', className)}>
      <div className="animate-ghost-in" style={{ animationDelay: `${delay}ms` }}>
        <div className="animate-float" style={{ animationDelay: `${delay / 1000}s`, animationDuration: '6s' }}>
          <div className="rounded-2xl border border-ink-950 bg-paper px-3 py-2 text-ink-950 shadow-ink-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
