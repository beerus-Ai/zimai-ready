import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronDown, Cpu, Info, Loader2, RefreshCw, Rocket, Sparkles, X, Hammer } from 'lucide-react';
import { cn, initials } from '../../lib/utils';
import { GhostMascot } from '../illustrations';
import type { AISource } from '../../types';

export { Icon, ICONS } from './Icon';
export { RichText } from './RichText';

/* ───────────────────────────── Button ───────────────────────────── */

const VARIANTS = {
  primary: 'border border-ink-950 bg-lilac-200 text-ink-950 hover:bg-lilac-300 hover:-translate-y-px hover:shadow-ink-sm focus-visible:ring-lilac-400',
  secondary: 'border border-brand-800/10 bg-brand-50 text-brand-800 hover:bg-brand-100 focus-visible:ring-brand-400',
  outline: 'border border-ink-950/15 bg-paper text-ink-900 hover:border-ink-950/40 hover:bg-white focus-visible:ring-ink-400',
  ghost: 'text-ink-700 hover:bg-ink-950/5 focus-visible:ring-ink-400',
  gold: 'border border-ink-950 bg-gold-400 text-ink-950 hover:bg-gold-300 hover:-translate-y-px hover:shadow-ink-sm focus-visible:ring-gold-500',
  dark: 'border border-ink-950 bg-ink-950 text-canvas hover:bg-ink-800 focus-visible:ring-ink-700',
  white: 'border border-canvas bg-canvas text-ink-950 hover:bg-lilac-200 focus-visible:ring-canvas',
  danger: 'border border-clay-800 bg-clay-600 text-white hover:bg-clay-700 focus-visible:ring-clay-500',
} as const;

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-[10px]',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  lg: 'h-12 sm:h-14 px-6 sm:px-7 text-base gap-2.5 rounded-2xl',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  full?: boolean;
  /** Renders a router <Link> */
  to?: string;
  /** Renders an external <a> */
  href?: string;
};

export function Button({ variant = 'primary', size = 'md', loading, icon, iconRight, full, to, href, className, children, disabled, type, ...rest }: ButtonProps) {
  const cls = cn(
    'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap',
    VARIANTS[variant],
    SIZES[size],
    full && 'w-full',
    className,
  );
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls} onClick={rest.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
        {content}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  return (
    <button type={type ?? 'button'} className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}

/* ───────────────────────────── Card ───────────────────────────── */

export function Card({ className, children, hover, padded = true, ...rest }: HTMLAttributes<HTMLDivElement> & { hover?: boolean; padded?: boolean }) {
  // With the Tailwind CDN, conflicting utilities resolve by stylesheet order (not class order),
  // so only apply defaults the caller hasn't overridden.
  const c = className ?? '';
  const hasBg = /(^|\s)bg-(?!clip|opacity|gradient|grid|none|blend)/.test(c);
  const noBorder = /(^|\s)border-(0|none)(\s|$)/.test(c);
  const borderWidth = /(^|\s)border(-[xytrbl])?-(2|4|8)(\s|$)/.test(c);
  const borderColour = /(^|\s)border-(?:[a-z]+-\d{2,3}|transparent|white|black|current)(?:\/\d+)?(\s|$)/.test(c);
  const hasShadow = /(^|\s)shadow-/.test(c);
  return (
    <div
      className={cn(
        'rounded-2xl',
        !noBorder && !borderWidth && 'border',
        !noBorder && !borderColour && 'border-ink-950/[0.08]',
        !hasBg && 'bg-paper',
        !hasShadow && 'shadow-card',
        padded && 'p-5 sm:p-6',
        hover && 'transition duration-300 hover:-translate-y-1 hover:border-ink-950/20 hover:shadow-lift',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ icon, title, subtitle, action, className }: { icon?: ReactNode; title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lilac-100 text-ink-900 ring-1 ring-inset ring-ink-950/10">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-ink-950">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ───────────────────────────── Badge & Chip ───────────────────────────── */

const TONES = {
  neutral: 'bg-sand-200/70 text-ink-700',
  brand: 'bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-800/15',
  gold: 'bg-gold-50 text-gold-800 ring-1 ring-inset ring-gold-300/60',
  clay: 'bg-clay-50 text-clay-700 ring-1 ring-inset ring-clay-300/50',
  sky: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/70',
  violet: 'bg-lilac-100 text-lilac-800 ring-1 ring-inset ring-lilac-300/60',
  dark: 'bg-ink-950 text-canvas',
  white: 'bg-canvas/10 text-canvas ring-1 ring-inset ring-canvas/20',
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = 'neutral', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

export function Chip({ selected, onClick, icon, children, className, disabled }: { selected?: boolean; onClick?: () => void; icon?: ReactNode; children: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-50',
        selected ? 'border-ink-950 bg-ink-950 text-canvas shadow-sm' : 'border-ink-950/15 bg-paper text-ink-700 hover:border-ink-950/40 hover:bg-lilac-50',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ───────────────────────────── Option card (assessment answers) ───────────────────────────── */

export function OptionCard({ selected, onClick, icon, label, description, multi, className, compact }: {
  selected?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  multi?: boolean;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-2xl border-2 bg-paper text-left transition-all duration-200 active:scale-[0.985]',
        compact ? 'px-3.5 py-3' : 'px-4 py-4',
        selected ? 'border-ink-950 bg-lilac-100 shadow-ink-sm' : 'border-ink-950/10 hover:border-ink-950/35 hover:bg-white',
        className,
      )}
    >
      {icon && (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors', selected ? 'bg-ink-950 text-canvas' : 'bg-sand-200/80 text-ink-700 group-hover:bg-lilac-200 group-hover:text-ink-950')}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug text-ink-950">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{description}</span>}
      </span>
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all',
          multi ? 'rounded-md' : 'rounded-full',
          selected ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/25 bg-paper',
        )}
      >
        {selected && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

/* ───────────────────────────── Progress ───────────────────────────── */

const BAR_TONES = { brand: 'bg-brand-500', gold: 'bg-gold-400', clay: 'bg-clay-500', sky: 'bg-sky-500', ink: 'bg-ink-900', violet: 'bg-violet-500' } as const;

export function ProgressBar({ value, tone = 'brand', color, size = 'sm', className, label, showValue }: {
  value: number;
  tone?: keyof typeof BAR_TONES;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  label?: ReactNode;
  showValue?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{label}</span>
          {showValue && <span className="tabular-nums text-slate-900">{Math.round(v)}%</span>}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-slate-100', size === 'xs' ? 'h-1.5' : size === 'sm' ? 'h-2' : 'h-3')}>
        <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', !color && BAR_TONES[tone])} style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  );
}

export function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** Animated circular score gauge. */
export function ScoreRing({ value, size = 168, stroke = 14, color = '#034f46', track = '#ebebd8', label, suffix = '%', children, className }: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: ReactNode;
  suffix?: string;
  children?: ReactNode;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const count = useCountUp(Math.round(value));
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 60);
    return () => clearTimeout(t);
  }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, shown)) / 100);
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            <span className="font-display font-medium leading-none tracking-tight text-ink-950 tabular-nums" style={{ fontSize: size * 0.27 }}>
              {count}
              <span style={{ fontSize: size * 0.11 }} className="align-top text-slate-400">
                {suffix}
              </span>
            </span>
            {label && <span className="mt-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── Loading / empty / error ───────────────────────────── */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-800', className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-ghost-pulse rounded-xl bg-sand-300/70', className)} />;
}

/** Loading state. variant="ai" shows an animated Gemini "thinking" orb with cycling step messages. */
export function LoadingState({ title = 'Loading…', messages, variant = 'default', className }: { title?: string; messages?: string[]; variant?: 'default' | 'ai'; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!messages?.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % messages.length), 2200);
    return () => clearInterval(t);
  }, [messages]);
  if (variant === 'ai')
    return (
      <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
        <div className="relative mb-6 h-28 w-28">
          <span className="absolute inset-3 animate-ghost-pulse rounded-full bg-lilac-300/60 blur-xl" />
          <GhostMascot mood="thinking" className="relative h-28 w-28" />
        </div>
        <h3 className="font-display text-2xl text-ink-950">{title}</h3>
        {messages?.length ? (
          <p key={i} className="mt-2 animate-ghost-in text-sm text-ink-500">
            {messages[i]}
          </p>
        ) : null}
      </div>
    );
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      <Spinner className="h-7 w-7" />
      <p className="text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
}

export function FullPageLoader({ title = 'Loading ZimAI Ready…' }: { title?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <GhostMascot className="h-16 w-16" />
        <p className="animate-ghost-pulse font-display text-xl text-ink-700">{title}</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-950/20 bg-paper/70 px-6 py-12 text-center', className)}>
      <div className="relative mb-4">
        <GhostMascot className="h-20 w-20" />
        <span className="absolute -bottom-1 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border border-ink-950 bg-lilac-200 text-ink-950 shadow-ink-sm">{icon ?? <Info className="h-4 w-4" />}</span>
      </div>
      <h3 className="font-display text-2xl text-ink-950">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className }: { title?: string; message?: ReactNode; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-clay-200 bg-clay-50/60 px-6 py-10 text-center', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-100 text-clay-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-ink-950">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" icon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/* ───────────────────────────── AI labelling ───────────────────────────── */

export function AIDisclaimer({ className, compact, children }: { className?: string; compact?: boolean; children?: ReactNode }) {
  return (
    <p className={cn('flex items-start gap-1.5 text-xs leading-relaxed text-slate-500', className)}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {children ??
          (compact
            ? 'AI-generated — verify important information.'
            : 'AI-generated guidance. It may contain mistakes — verify important information and apply your professional judgement before acting on it.')}
      </span>
    </p>
  );
}

export function AISourceBadge({ source, className }: { source?: AISource; className?: string }) {
  if (!source) return null;
  return source === 'gemini' ? (
    <Badge tone="brand" className={className} icon={<Sparkles className="h-3 w-3" />}>
      Gemini AI
    </Badge>
  ) : (
    <span title="Generated by ZimAI Ready's built-in engine because Gemini was unavailable">
      <Badge tone="neutral" className={className} icon={<Cpu className="h-3 w-3" />}>
        ZimAI engine
      </Badge>
    </span>
  );
}

/* ───────────────────────────── Toasts ───────────────────────────── */

type ToastTone = 'success' | 'error' | 'info' | 'soon';
interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}
interface ToastApi {
  show: (t: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  /** Tasteful "not built yet" feedback for future features. */
  comingSoon: (feature?: string) => void;
}

const ToastCtx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const show = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = ++idRef.current;
      setItems((xs) => [...xs.slice(-3), { ...t, id }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );
  const api = React.useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description) => show({ tone: 'success', title, description }),
      error: (title, description) => show({ tone: 'error', title, description }),
      info: (title, description) => show({ tone: 'info', title, description }),
      comingSoon: (feature) =>
        show({ tone: 'soon', title: 'Coming soon', description: `${feature ? feature + ' is' : 'This feature is'} planned for a future release of ZimAI Ready.` }),
    }),
    [show],
  );
  const ICON: Record<ToastTone, ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-brand-600" />,
    error: <AlertTriangle className="h-5 w-5 text-clay-600" />,
    info: <Info className="h-5 w-5 text-sky-600" />,
    soon: <Rocket className="h-5 w-5 text-gold-600" />,
  };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
        {items.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-ghost-in items-start gap-3 rounded-2xl border border-ink-950 bg-paper p-4 shadow-ink">
            {ICON[t.tone]}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-950">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] text-slate-500">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-700" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ───────────────────────────── Modal ───────────────────────────── */

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative max-h-[92vh] w-full animate-ghost-in overflow-y-auto rounded-t-4xl border border-ink-950/10 bg-paper shadow-2xl sm:rounded-4xl', width)}>
        {(title || description) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink-950/5 bg-paper/95 px-6 py-5 backdrop-blur">
            <div>
              {title && <h2 className="text-2xl text-ink-950">{title}</h2>}
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ───────────────────────────── Tabs ───────────────────────────── */

export function Tabs<T extends string>({ tabs, value, onChange, className }: {
  tabs: { id: T; label: ReactNode; icon?: ReactNode; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1', className)} role="tablist">
      <div className="inline-flex gap-1 rounded-full border border-ink-950/10 bg-sand-200/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={value === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
              value === t.id ? 'bg-paper text-ink-950 shadow-card ring-1 ring-ink-950/10' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {t.icon}
            {t.label}
            {t.count != null && <span className={cn('rounded-full px-1.5 text-[11px]', value === t.id ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-slate-600')}>{t.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── Expandable section ───────────────────────────── */

/**
 * A calm, collapsible section: a one-line header with a short summary that expands (smooth height animation)
 * to reveal detail. Controlled via `open`/`onToggle`, so pages can remember state or offer "expand all".
 */
export function ExpandableSection({ id, title, icon, summary, open, onToggle, children, className }: {
  id: string;
  title: ReactNode;
  icon?: ReactNode;
  summary?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 rounded-3xl border transition-colors duration-300', open ? 'border-ink-950/15 bg-paper' : 'border-ink-950/[0.08] bg-paper/60 hover:border-ink-950/20 hover:bg-paper', className)}>
      <h2 className="!m-0 !font-sans !text-base !tracking-normal">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="flex w-full items-center gap-4 rounded-3xl px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac-400 sm:px-6"
        >
          {icon && <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300', open ? 'bg-ink-950 text-canvas' : 'bg-sand-200/80 text-ink-700')}>{icon}</span>}
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-ink-950">{title}</span>
            {summary && <span className="mt-0.5 line-clamp-2 text-sm font-normal leading-snug text-ink-500 sm:line-clamp-1">{summary}</span>}
          </span>
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-950/15 text-ink-700 transition-transform duration-300', open && 'rotate-180 border-ink-950 bg-lilac-200 text-ink-950')} aria-hidden>
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </h2>
      <div id={`${id}-panel`} className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <div className={cn('px-4 pb-5 transition-opacity duration-500 sm:px-6 sm:pb-6', open ? 'opacity-100' : 'opacity-0')}>{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Remembers which sections are open (per browser). Falls back to in-memory state when storage is unavailable. */
export function useExpandedSections(storageKey: string, defaults: Record<string, boolean> = {}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
      return defaults;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(open));
    } catch {
      /* storage unavailable — keep in memory */
    }
  }, [open, storageKey]);
  const toggle = useCallback((id: string) => setOpen((o) => ({ ...o, [id]: !o[id] })), []);
  const set = useCallback((id: string, value: boolean) => setOpen((o) => ({ ...o, [id]: value })), []);
  const setAll = useCallback((ids: string[], value: boolean) => setOpen((o) => ({ ...o, ...Object.fromEntries(ids.map((i) => [i, value])) })), []);
  return { open, toggle, set, setAll };
}

/* ───────────────────────────── Page scaffolding ───────────────────────────── */

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 animate-ghost-in text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{eyebrow}</p>}
        <h1 className="animate-ghost-in text-4xl leading-[1.02] text-ink-950 sm:text-5xl" style={{ animationDelay: '60ms' }}>{title}</h1>
        {description && <p className="mt-3 max-w-2xl animate-ghost-in text-[15px] leading-relaxed text-ink-600" style={{ animationDelay: '120ms' }}>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, hint, tone = 'brand', className }: { label: ReactNode; value: ReactNode; icon?: ReactNode; hint?: ReactNode; tone?: 'brand' | 'gold' | 'clay' | 'sky' | 'violet' | 'ink'; className?: string }) {
  const iconTone = {
    brand: 'bg-brand-800 text-canvas',
    gold: 'bg-gold-400 text-ink-950',
    clay: 'bg-clay-400 text-ink-950',
    sky: 'bg-sky-200 text-ink-950',
    violet: 'bg-lilac-200 text-ink-950',
    ink: 'bg-ink-950 text-canvas',
  }[tone];
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {icon && <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconTone)}>{icon}</div>}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-500">{label}</p>
        <p className="mt-1 font-display text-4xl leading-none tracking-tight text-ink-950 tabular-nums">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </Card>
  );
}

export function Avatar({ name, photoURL, size = 36, className }: { name: string; photoURL?: string; size?: number; className?: string }) {
  if (photoURL) return <img src={photoURL} alt={name} className={cn('shrink-0 rounded-full object-cover', className)} style={{ width: size, height: size }} referrerPolicy="no-referrer" />;
  const palette = ['bg-brand-800', 'bg-clay-800', 'bg-lilac-700', 'bg-gold-600', 'bg-clay-500', 'bg-ink-800'];
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white', palette[idx], className)} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name) || '?'}
    </span>
  );
}

/** Temporary placeholder used by unbuilt pages. */
export function PageStub({ name }: { name: string }) {
  return (
    <EmptyState
      className="my-10"
      icon={<Hammer className="h-6 w-6" />}
      title={`${name} is being built`}
      description="This screen is part of ZimAI Ready and will be available shortly."
    />
  );
}
