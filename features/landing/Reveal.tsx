import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Reveal } from '../../components/motion';

export { Reveal, useInView } from '../../components/motion';

/**
 * Consistent section heading for public marketing pages.
 * Wrap words in *asterisks* inside a string title to set them in italic.
 */
export function SectionHeading({ eyebrow, title, description, align = 'center', light, className }: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  light?: boolean;
  className?: string;
}) {
  const renderTitle = (t: ReactNode) =>
    typeof t === 'string'
      ? t.split(/(\*[^*]+\*)/g).map((part, i) => (part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : part))
      : t;
  return (
    <Reveal className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl', className)}>
      <p className={cn('text-xs font-semibold uppercase tracking-[0.2em]', light ? 'text-canvas/70' : 'text-ink-500')}>{eyebrow}</p>
      <h2 className={cn('mt-4 text-balance text-4xl leading-[1.02] sm:text-5xl lg:text-6xl', light ? 'text-canvas' : 'text-ink-950')}>{renderTitle(title)}</h2>
      {description && <p className={cn('mt-5 text-balance text-base leading-relaxed sm:text-lg', light ? 'text-canvas/75' : 'text-ink-600')}>{description}</p>}
    </Reveal>
  );
}
