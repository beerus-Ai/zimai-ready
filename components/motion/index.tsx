import { Children, useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ───────────────────────────── Visibility ───────────────────────────── */

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
    const t = setTimeout(() => setInView(true), 2200);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [inView, rootMargin]);
  return { ref, inView };
}

/** Scroll progress (0 → 1) of an element travelling through the viewport. */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight;
      setProgress(Math.min(1, Math.max(0, (window.innerHeight - r.top) / total)));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return { ref, progress };
}

/* ───────────────────────────── Reveal ───────────────────────────── */

/**
 * Reveal on scroll with an optional stagger delay (ms).
 * variant "up" fades up; "ghost" materialises out of a soft blur (the ghost motion used across the app).
 */
export function Reveal({ children, delay = 0, className, style, variant = 'ghost', as: Tag = 'div' }: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  variant?: 'up' | 'ghost';
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn(inView ? (variant === 'ghost' ? 'animate-ghost-in' : 'animate-fade-up') : 'opacity-0', className)}
      style={{ ...style, animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ───────────────────────────── Ghost text ───────────────────────────── */

/**
 * Text that materialises word by word out of a blur — like a message arriving in incognito.
 * Wrap words in *asterisks* to set them in italic serif with an accent colour.
 */
export function GhostText({ text, className, wordClassName, accentClassName = 'italic', delay = 0, stagger = 70, as: Tag = 'span', startOnView = true }: {
  text: string;
  className?: string;
  wordClassName?: string;
  accentClassName?: string;
  delay?: number;
  stagger?: number;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
  startOnView?: boolean;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  const show = !startOnView || inView;
  const tokens = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let i = 0;
  return (
    <Tag ref={ref as never} className={className} aria-label={text.replace(/\*/g, '')}>
      {tokens.map((tok, ti) => {
        const accent = tok.startsWith('*') && tok.endsWith('*');
        const words = (accent ? tok.slice(1, -1) : tok).split(/(\s+)/);
        return words.map((w, wi) => {
          if (/^\s+$/.test(w) || w === '') return w;
          const d = delay + i++ * stagger;
          return (
            <span
              key={`${ti}-${wi}`}
              aria-hidden
              className={cn('inline-block will-change-[filter,transform]', show ? 'animate-ghost-in' : 'opacity-0', wordClassName, accent && accentClassName)}
              style={{ animationDelay: `${d}ms` }}
            >
              {w}
            </span>
          );
        });
      })}
    </Tag>
  );
}

/* ───────────────────────────── Typewriter ───────────────────────────── */

export function useTypewriter(full: string, { speed = 22, start = true }: { speed?: number; start?: boolean } = {}) {
  const [out, setOut] = useState(prefersReducedMotion() ? full : '');
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setOut(full);
      return;
    }
    setOut('');
    let n = 0;
    const t = setInterval(() => {
      n += 1 + (Math.random() > 0.7 ? 1 : 0);
      setOut(full.slice(0, n));
      if (n >= full.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [full, speed, start]);
  return { text: out, done: out.length >= full.length };
}

export function Typewriter({ text, className, speed, start = true, caret = true }: { text: string; className?: string; speed?: number; start?: boolean; caret?: boolean }) {
  const { text: shown, done } = useTypewriter(text, { speed, start });
  return (
    <span className={className}>
      {shown}
      {caret && !done && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-caret bg-current" aria-hidden />}
    </span>
  );
}

/* ───────────────────────────── Ghost bubbles ───────────────────────────── */

export interface GhostBubble {
  name: string;
  text: string;
  /** Position within the parent, as CSS percentages. */
  x: string;
  y: string;
  tone?: 'dark' | 'light' | 'lilac';
  nameColor?: string;
}

/**
 * Chat bubbles that drift around a headline, each fading in out of a blur and dissolving again on its own rhythm.
 * Place inside a `relative` parent. Hidden on small screens unless `mobile` is set.
 */
export function GhostBubbles({ bubbles, className, mobile = false, cycle = 5200 }: { bubbles: GhostBubble[]; className?: string; mobile?: boolean; cycle?: number }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setTick((x) => x + 1), cycle / 2);
    return () => clearInterval(t);
  }, [cycle]);
  return (
    <div className={cn('pointer-events-none absolute inset-0', !mobile && 'hidden md:block', className)} aria-hidden>
      {bubbles.map((b, i) => {
        // Alternate bubbles between visible and ghosted phases so the scene is never static.
        const visible = (tick + i) % 3 !== 0;
        const tone =
          b.tone === 'light'
            ? 'bg-white text-ink-900 shadow-card'
            : b.tone === 'lilac'
              ? 'bg-lilac-200 text-ink-950'
              : 'bg-brand-950/70 text-canvas backdrop-blur-sm';
        return (
          <div
            key={`${b.name}-${i}`}
            className="absolute transition-all duration-[1400ms] ease-out"
            style={{
              left: b.x,
              top: b.y,
              opacity: visible ? (i % 4 === 3 ? 0.45 : 1) : 0,
              filter: visible ? 'blur(0px)' : 'blur(12px)',
              transform: `translateY(${visible ? 0 : 10}px)`,
            }}
          >
            <div className="animate-float" style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${6 + (i % 3)}s` }}>
              <p className="mb-1 text-[11px] font-semibold" style={{ color: b.nameColor ?? '#ffa946' }}>
                {b.name}
              </p>
              <p className={cn('max-w-[240px] rounded-xl px-3.5 py-2.5 text-[13px] font-medium leading-snug', tone)}>{b.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────── Marquee ───────────────────────────── */

export function Marquee({ children, className, reverse, speed = 38 }: { children: ReactNode; className?: string; reverse?: boolean; speed?: number }) {
  return (
    <div className={cn('group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]', className)}>
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className="flex shrink-0 animate-marquee items-center gap-3 pr-3 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────── Scroll story ───────────────────────────── */

export interface StoryChapter {
  id: string;
  label: string;
  title: ReactNode;
  body: ReactNode;
  visual: ReactNode;
}

/**
 * Wispr-style scroll story: a sticky chapter index on the left, a sticky visual in the middle that
 * ghost-swaps as each chapter's copy scrolls past on the right.
 */
export function ScrollStory({ chapters, className }: { chapters: StoryChapter[]; className?: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [chapters.length]);

  return (
    <div className={cn('relative', className)}>
      {/* Mobile: stacked cards */}
      <div className="space-y-12 lg:hidden">
        {chapters.map((c) => (
          <Reveal key={c.id}>
            <div className="overflow-hidden rounded-4xl bg-sand-200/70 p-4">{c.visual}</div>
            <h3 className="mt-6 font-display text-3xl leading-tight text-ink-950">{c.title}</h3>
            <div className="mt-3 text-[15px] leading-relaxed text-ink-600">{c.body}</div>
          </Reveal>
        ))}
      </div>

      {/* Desktop: sticky index + sticky visual + scrolling copy */}
      <div className="hidden grid-cols-[180px_minmax(0,1fr)_minmax(0,340px)] gap-10 lg:grid xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,360px)]">
        <div>
          <ol className="sticky top-32 space-y-3">
            {chapters.map((c, i) => (
              <li key={c.id} className="relative pl-4">
                <span className={cn('absolute left-0 top-0 h-full w-[3px] rounded-full transition-colors duration-500', i === active ? 'bg-clay-400' : 'bg-sand-300')} />
                <button
                  type="button"
                  onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className={cn('font-display text-xl transition-colors duration-500', i === active ? 'text-ink-950' : 'text-ink-400 hover:text-ink-700')}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div className="sticky top-28 aspect-[4/5] max-h-[70vh] w-full">
            {chapters.map((c, i) => (
              <div
                key={c.id}
                className="absolute inset-0 overflow-hidden rounded-4xl bg-sand-200/70 transition-all duration-700 ease-out"
                style={{ opacity: i === active ? 1 : 0, filter: i === active ? 'blur(0)' : 'blur(16px)', transform: i === active ? 'scale(1)' : 'scale(.97)' }}
                aria-hidden={i !== active}
              >
                {c.visual}
              </div>
            ))}
          </div>
        </div>
        <div>
          {chapters.map((c, i) => (
            <div key={c.id} ref={(el) => { refs.current[i] = el; }} data-idx={i} className="flex min-h-[80vh] flex-col justify-center">
              <h3 className={cn('font-display text-4xl leading-[1.05] tracking-tight text-ink-950 transition-all duration-700', i === active ? 'opacity-100 blur-0' : 'opacity-30 blur-[2px]')}>{c.title}</h3>
              <div className={cn('mt-4 text-[15px] leading-relaxed text-ink-600 transition-opacity duration-700', i === active ? 'opacity-100' : 'opacity-30')}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Tutorial player ───────────────────────────── */

export interface TutorialScene {
  /** Short caption, shown like a subtitle. */
  caption: ReactNode;
  /** Optional title shown above the caption. */
  title?: ReactNode;
  /** The animated visual for this scene. Rendered fresh each time the scene starts, so CSS animations replay. */
  visual: ReactNode;
  /** Duration in ms (default 4200). */
  duration?: number;
}

/**
 * A lightweight "video" built from animated scenes: story-style progress segments, play/pause, previous/next,
 * replay, and ghost transitions between scenes. No media files — every frame is live SVG/HTML.
 */
export function TutorialPlayer({ scenes, className, autoPlay = true, loop = false, dark = false, label = 'Tutorial', onComplete }: {
  scenes: TutorialScene[];
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  dark?: boolean;
  label?: string;
  onComplete?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(autoPlay && !prefersReducedMotion());
  const [runId, setRunId] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();
  const finished = index === scenes.length - 1 && elapsed >= (scenes[index]?.duration ?? 4200);

  const go = useCallback(
    (i: number) => {
      const n = (i + scenes.length) % scenes.length;
      setIndex(n);
      setElapsed(0);
      setRunId((r) => r + 1);
    },
    [scenes.length],
  );

  useEffect(() => {
    if (!playing || !inView) return;
    const dur = scenes[index]?.duration ?? 4200;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const next = elapsed + (t - last);
      last = t;
      if (next >= dur) {
        if (index < scenes.length - 1) go(index + 1);
        else if (loop) go(0);
        else {
          setElapsed(dur);
          setPlaying(false);
          onComplete?.();
        }
        return;
      }
      setElapsed(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, inView, index, runId]);

  const scene = scenes[index];
  const muted = dark ? 'text-canvas/60' : 'text-ink-500';
  return (
    <div ref={ref} className={cn('relative overflow-hidden rounded-4xl', dark ? 'bg-brand-900 text-canvas' : 'bg-sand-200/70 text-ink-950', className)} role="region" aria-roledescription="tutorial" aria-label={label}>
      {/* progress segments */}
      <div className="absolute inset-x-4 top-4 z-20 flex gap-1.5">
        {scenes.map((s, i) => {
          const dur = s.duration ?? 4200;
          const pct = i < index ? 100 : i > index ? 0 : Math.min(100, (elapsed / dur) * 100);
          return (
            <button key={i} type="button" onClick={() => go(i)} className={cn('h-1 flex-1 overflow-hidden rounded-full', dark ? 'bg-canvas/20' : 'bg-ink-950/10')} aria-label={`Go to step ${i + 1}`}>
              <span className={cn('block h-full rounded-full', dark ? 'bg-canvas' : 'bg-ink-950')} style={{ width: `${pct}%` }} />
            </button>
          );
        })}
      </div>

      {/* stage */}
      <div className="relative aspect-[16/11] w-full sm:aspect-[16/10]">
        <div key={`${index}-${runId}`} className="absolute inset-0 flex animate-ghost-in items-center justify-center p-8 pt-12">
          {scene?.visual}
        </div>
      </div>

      {/* caption + controls */}
      <div className="relative z-10 flex items-end justify-between gap-4 px-5 pb-5 sm:px-6">
        <div key={`c-${index}-${runId}`} className="min-w-0 animate-ghost-in" aria-live="polite">
          <p className={cn('text-[11px] font-bold uppercase tracking-[0.18em]', muted)}>
            Step {index + 1} of {scenes.length}
          </p>
          {scene?.title && <p className="mt-1 font-display text-2xl leading-tight">{scene.title}</p>}
          <p className={cn('mt-1 text-sm leading-relaxed', dark ? 'text-canvas/80' : 'text-ink-600')}>{scene?.caption}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => go(index - 1)} className={ctl(dark)} aria-label="Previous step">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {finished ? (
            <button type="button" onClick={() => { go(0); setPlaying(true); }} className={ctl(dark, true)} aria-label="Replay">
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={() => setPlaying((p) => !p)} className={ctl(dark, true)} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
            </button>
          )}
          <button type="button" onClick={() => go(index + 1)} className={ctl(dark)} aria-label="Next step">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const ctl = (dark: boolean, primary = false) =>
  cn(
    'flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-95',
    primary
      ? dark
        ? 'border-canvas bg-canvas text-ink-950 hover:bg-lilac-200'
        : 'border-ink-950 bg-lilac-200 text-ink-950 hover:bg-lilac-300'
      : dark
        ? 'border-canvas/25 text-canvas hover:bg-canvas/10'
        : 'border-ink-950/15 text-ink-800 hover:bg-ink-950/5',
  );

/* ───────────────────────────── Stagger helper ───────────────────────────── */

/** Reveals each child in turn with the ghost motion. */
export function Stagger({ children, className, step = 80, itemClassName }: { children: ReactNode; className?: string; step?: number; itemClassName?: string }) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <Reveal key={i} delay={i * step} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

/* ───────────────────────────── Section shell ───────────────────────────── */

/**
 * Stacked "card deck" section with big rounded top corners, as used on wisprflow.ai.
 * tone: cream (default), teal, ink (near-black), lilac, sand.
 */
export function DeckSection({ tone = 'cream', className, children, id, overlap = true }: {
  tone?: 'cream' | 'teal' | 'ink' | 'lilac' | 'sand';
  className?: string;
  children: ReactNode;
  id?: string;
  overlap?: boolean;
}) {
  const bg = { cream: 'bg-canvas text-ink-950', teal: 'bg-brand-800 text-canvas', ink: 'bg-ink-950 text-canvas', lilac: 'bg-lilac-200 text-ink-950', sand: 'bg-sand-200 text-ink-950' }[tone];
  return (
    <section id={id} className={cn('relative scroll-mt-24 rounded-t-[2.5rem] sm:rounded-t-[4rem]', overlap && '-mt-10 sm:-mt-16', bg, className)}>
      {children}
    </section>
  );
}

/* ───────────────────────────── Depth: tilt & parallax ───────────────────────────── */

/**
 * 3D tilt that follows the pointer (CSS perspective, no WebGL). Children can pop forward with
 * `style={{ transform: 'translateZ(40px)' }}` because the card preserves 3D.
 */
export function Tilt({ children, className, max = 10, glare = true, scale = 1.02 }: { children: ReactNode; className?: string; max?: number; glare?: boolean; scale?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [shine, setShine] = useState({ x: 50, y: 50, o: 0 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || prefersReducedMotion()) return;
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setStyle({ transform: `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) scale(${scale})` });
    setShine({ x: px * 100, y: py * 100, o: 1 });
  };
  const onLeave = () => {
    setStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)' });
    setShine((s) => ({ ...s, o: 0 }));
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('relative transition-transform duration-300 ease-out [transform-style:preserve-3d] will-change-transform', className)}
      style={style}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ opacity: shine.o, background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,.45), transparent 55%)`, mixBlendMode: 'soft-light' }}
          aria-hidden
        />
      )}
    </div>
  );
}

/** Moves its children vertically as the section scrolls (speed: px of travel across the viewport, negative = up). */
export function Parallax({ children, className, speed = 80, rotate = 0 }: { children: ReactNode; className?: string; speed?: number; rotate?: number }) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const reduced = prefersReducedMotion();
  const d = reduced ? 0 : progress - 0.5;
  return (
    <div ref={ref} className={cn('will-change-transform', className)} style={{ transform: `translate3d(0, ${d * -speed}px, 0) rotate(${d * rotate}deg)` }}>
      {children}
    </div>
  );
}

/** Pointer-driven parallax for layered hero compositions: wrap layers and give each a `depth` (px of travel). */
export function PointerParallax({ children, className }: { children: (offset: { x: number; y: number }) => ReactNode; className?: string }) {
  const [o, setO] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const on = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setO({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
      });
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => {
      window.removeEventListener('pointermove', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div className={className}>{children(o)}</div>;
}
