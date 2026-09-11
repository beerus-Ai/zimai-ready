import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Cpu, Info, Loader2, RefreshCw, Rocket, Sparkles, X, Hammer } from 'lucide-react';
import { cn, initials } from '../../lib/utils';
import type { AISource } from '../../types';

export { Icon, ICONS } from './Icon';
export { RichText } from './RichText';

/* ───────────────────────────── Button ───────────────────────────── */

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/10 focus-visible:ring-brand-500',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100 focus-visible:ring-brand-400',
  outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400',
  ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
  gold: 'bg-gold-400 text-ink-950 hover:bg-gold-300 shadow-sm shadow-gold-900/10 focus-visible:ring-gold-500',
  dark: 'bg-ink-950 text-white hover:bg-ink-800 focus-visible:ring-ink-700',
  white: 'bg-white text-ink-950 hover:bg-slate-100 shadow-sm focus-visible:ring-white',
  danger: 'bg-clay-600 text-white hover:bg-clay-700 focus-visible:ring-clay-500',
} as const;

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  lg: 'h-12 sm:h-14 px-6 sm:px-7 text-base gap-2.5 rounded-xl',
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
    'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap',
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
        !noBorder && !borderColour && 'border-slate-200/80',
        !hasBg && 'bg-white',
        !hasShadow && 'shadow-card',
        padded && 'p-5 sm:p-6',
        hover && 'transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift',
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
        {icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{icon}</div>}
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
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/70',
  gold: 'bg-gold-50 text-gold-800 ring-1 ring-inset ring-gold-200',
  clay: 'bg-clay-50 text-clay-700 ring-1 ring-inset ring-clay-200/70',
  sky: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/70',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/70',
  dark: 'bg-ink-950 text-white',
  white: 'bg-white/10 text-white ring-1 ring-inset ring-white/20',
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
        selected ? 'border-brand-600 bg-brand-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50',
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
        'group relative flex w-full items-center gap-3 rounded-2xl border-2 bg-white text-left transition-all duration-150 active:scale-[0.985]',
        compact ? 'px-3.5 py-3' : 'px-4 py-4',
        selected ? 'border-brand-500 bg-brand-50/60 shadow-sm shadow-brand-900/5' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/60',
        className,
      )}
    >
      {icon && (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors', selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-700')}>
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
          selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white',
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
export function ScoreRing({ value, size = 168, stroke = 14, color = '#0a8a5f', track = '#e9eef3', label, suffix = '%', children, className }: {
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
            <span className="font-extrabold leading-none tracking-tight text-ink-950 tabular-nums" style={{ fontSize: size * 0.23 }}>
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
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} />;
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
        <div className="relative mb-7 h-24 w-24">
          <span className="absolute inset-0 animate-ping-slow rounded-full bg-brand-400/30" />
          <span className="absolute inset-2 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#15ae7c,#ffc21a,#0ea5e9,#15ae7c)] blur-[2px]" />
          <span className="absolute inset-4 flex items-center justify-center rounded-full bg-white shadow-inner">
            <Sparkles className="h-8 w-8 text-brand-600" />
          </span>
        </div>
        <h3 className="text-lg font-bold text-ink-950">{title}</h3>
        {messages?.length ? (
          <p key={i} className="mt-2 animate-fade-in text-sm text-slate-500">
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
      <LoadingState title={title} />
    </div>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">{icon ?? <Info className="h-6 w-6" />}</div>
      <h3 className="text-base font-bold text-ink-950">{title}</h3>
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
          <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lift">
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
      <div className={cn('relative max-h-[92vh] w-full animate-scale-in overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl', width)}>
        {(title || description) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
            <div>
              {title && <h2 className="text-lg font-bold text-ink-950">{title}</h2>}
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
      <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={value === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-all',
              value === t.id ? 'bg-white text-ink-950 shadow-sm' : 'text-slate-500 hover:text-slate-800',
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

/* ───────────────────────────── Page scaffolding ───────────────────────────── */

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, hint, tone = 'brand', className }: { label: ReactNode; value: ReactNode; icon?: ReactNode; hint?: ReactNode; tone?: 'brand' | 'gold' | 'clay' | 'sky' | 'violet' | 'ink'; className?: string }) {
  const iconTone = {
    brand: 'bg-brand-50 text-brand-700',
    gold: 'bg-gold-50 text-gold-700',
    clay: 'bg-clay-50 text-clay-600',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
    ink: 'bg-slate-100 text-ink-900',
  }[tone];
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {icon && <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconTone)}>{icon}</div>}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-ink-950 tabular-nums">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </Card>
  );
}

export function Avatar({ name, photoURL, size = 36, className }: { name: string; photoURL?: string; size?: number; className?: string }) {
  if (photoURL) return <img src={photoURL} alt={name} className={cn('shrink-0 rounded-full object-cover', className)} style={{ width: size, height: size }} referrerPolicy="no-referrer" />;
  const palette = ['bg-brand-600', 'bg-sky-600', 'bg-violet-600', 'bg-gold-500', 'bg-clay-500', 'bg-ink-800'];
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
