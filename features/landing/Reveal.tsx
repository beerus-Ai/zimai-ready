import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Fires once when the element scrolls into view (falls back to visible when IntersectionObserver is missing). */
export function useInView<T extends Element>(rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.08 },
    );
    io.observe(el);
    // Safety net: never leave content hidden (print, screenshots, embedded previews with odd viewports).
    const t = setTimeout(() => setInView(true), 1800);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [inView, rootMargin]);
  return { ref, inView };
}

/** Fade-up on scroll with an optional stagger delay (ms). */
export function Reveal({ children, delay = 0, className, style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(inView ? 'animate-fade-up' : 'opacity-0', className)} style={{ ...style, animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Consistent section heading for public marketing pages. */
export function SectionHeading({ eyebrow, title, description, align = 'center', light, className }: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  light?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl', className)}>
      <p className={cn('text-xs font-bold uppercase tracking-[0.16em]', light ? 'text-gold-300' : 'text-brand-600')}>{eyebrow}</p>
      <h2 className={cn('mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl', light ? 'text-white' : 'text-ink-950')}>{title}</h2>
      {description && <p className={cn('mt-4 text-balance text-base leading-relaxed sm:text-lg', light ? 'text-slate-300' : 'text-slate-500')}>{description}</p>}
    </Reveal>
  );
}
