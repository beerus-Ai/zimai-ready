import type { ReactNode } from 'react';
import { GhostText, Reveal } from '../../components/motion';
import { cn } from '../../lib/utils';

/** Tiny uppercase eyebrow label. */
export function Eyebrow({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return <p className={cn('text-xs font-semibold uppercase tracking-[0.2em]', light ? 'text-canvas/70' : 'text-ink-500', className)}>{children}</p>;
}

/**
 * Serif headline that materialises word by word. Screen readers get the plain sentence once;
 * the animated words are hidden from assistive tech.
 */
export function Headline({ text, as: Tag = 'h2', className, accentClassName, delay = 0, stagger = 55 }: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  accentClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <Tag className={className}>
      <span className="sr-only">{text.replace(/\*/g, '')}</span>
      <span aria-hidden>
        <GhostText text={text} accentClassName={cn('italic font-normal', accentClassName)} delay={delay} stagger={stagger} />
      </span>
    </Tag>
  );
}

/** Section intro: eyebrow + ghost headline + description. */
export function Intro({ eyebrow, title, description, light, align = 'center', accentClassName, className, width, titleSize = 'text-[2.6rem] sm:text-6xl lg:text-7xl' }: {
  eyebrow: ReactNode;
  title: string;
  description?: ReactNode;
  light?: boolean;
  align?: 'center' | 'left';
  accentClassName?: string;
  className?: string;
  /** max-width utility (defaults: max-w-4xl centred, max-w-2xl left). */
  width?: string;
  titleSize?: string;
}) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto text-center' : '', width ?? (align === 'center' ? 'max-w-4xl' : 'max-w-2xl'), className)}>
      <Reveal>
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
      </Reveal>
      <Headline
        text={title}
        accentClassName={accentClassName}
        className={cn('mt-4 text-balance leading-[0.98]', titleSize, light ? 'text-canvas' : 'text-ink-950')}
      />
      {description && (
        <Reveal delay={200}>
          <p className={cn('mt-6 text-balance text-base leading-relaxed sm:text-lg', align === 'center' && 'mx-auto max-w-2xl', light ? 'text-canvas/75' : 'text-ink-600')}>{description}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Oversized stamp-like condensed number ("01"). */
export function StampNumber({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn('font-condensed leading-none tracking-tight tabular-nums', className)} aria-hidden>
      {String(n).padStart(2, '0')}
    </span>
  );
}

/** Rotating circular text sticker. */
export function SpinStamp({ text, className, fill = '#ffa946', ink = '#1a1a1a', children, id }: {
  text: string;
  className?: string;
  fill?: string;
  ink?: string;
  children?: ReactNode;
  id: string;
}) {
  return (
    // With the Tailwind CDN, `relative` would override a caller's `absolute`/`fixed` (stylesheet order), so only add it when unpositioned.
    <div className={cn(!/(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? '') && 'relative', className)} aria-hidden>
      <svg viewBox="0 0 120 120" className="h-full w-full animate-spin-slow" style={{ animationDuration: '24s' }}>
        <defs>
          <path id={id} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill={fill} stroke={ink} strokeWidth="2" />
        <circle cx="60" cy="60" r="33" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="3 4" />
        <text fill={ink} fontSize="12.5" letterSpacing="1.6" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
