import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, Briefcase, Check, CircleCheck, CircleX, Lightbulb, ListChecks, PenLine, RefreshCw, RotateCcw, Sparkles, Target, WandSparkles, X, Zap } from 'lucide-react';
import { AIDisclaimer, AISourceBadge, Button, RichText, Spinner } from '../../../components/ui';
import { generateText } from '../../../services/gemini';
import { cn } from '../../../lib/utils';
import type { AISource, LessonBlock } from '../../../types';

/** A lesson block as shown by the player — includes the virtual "In your field" card. */
export type PlayerBlock = LessonBlock | { type: 'field'; title: string; scenario: string; takeaway: string; domainName: string };
export type QuizBlock = Extract<LessonBlock, { type: 'quiz' }>;
export type InteractiveBlock = Extract<LessonBlock, { type: 'interactive' }>;

export const isGated = (b: PlayerBlock) => b.type === 'quiz' || b.type === 'interactive';

const BLOCK_META: Record<PlayerBlock['type'], { label: string; icon: ReactNode; cls: string }> = {
  explain: { label: 'Concept', icon: <BookOpen className="h-3.5 w-3.5" />, cls: 'bg-sky-50 text-sky-700 ring-sky-200/70' },
  example: { label: 'Workplace example', icon: <Briefcase className="h-3.5 w-3.5" />, cls: 'bg-violet-50 text-violet-700 ring-violet-200/70' },
  field: { label: 'In your field', icon: <Target className="h-3.5 w-3.5" />, cls: 'bg-gold-50 text-gold-800 ring-gold-200' },
  'ai-example': { label: 'Personalised AI example', icon: <Sparkles className="h-3.5 w-3.5" />, cls: 'bg-brand-50 text-brand-700 ring-brand-200/70' },
  interactive: { label: 'Interactive', icon: <Zap className="h-3.5 w-3.5" />, cls: 'bg-clay-50 text-clay-700 ring-clay-200/70' },
  quiz: { label: 'Quick check', icon: <ListChecks className="h-3.5 w-3.5" />, cls: 'bg-brand-50 text-brand-700 ring-brand-200/70' },
  task: { label: 'Try it at work', icon: <PenLine className="h-3.5 w-3.5" />, cls: 'bg-ink-50 text-ink-800 ring-ink-200' },
};

export function BlockLabel({ type }: { type: PlayerBlock['type'] }) {
  const m = BLOCK_META[type];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset', m.cls)}>
      {m.icon}
      {m.label}
    </span>
  );
}

const H = ({ children }: { children: ReactNode }) => <h2 className="text-xl font-extrabold leading-tight tracking-tight text-ink-950 sm:text-2xl">{children}</h2>;

// ───────────────────────── Static blocks ─────────────────────────

export function ExplainView({ block }: { block: Extract<LessonBlock, { type: 'explain' }> }) {
  return (
    <div>
      <H>{block.title}</H>
      <RichText text={block.body} className="mt-3 text-slate-700" />
      {block.bullets?.length ? (
        <ul className="mt-5 space-y-2.5">
          {block.bullets.map((b, i) => (
            <li key={i} className="flex animate-fade-up items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3 text-[15px] text-slate-700" style={{ animationDelay: `${120 + i * 80}ms` }}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ExampleView({ title, scenario, takeaway, accent = 'violet', eyebrow }: { title: string; scenario: string; takeaway: string; accent?: 'violet' | 'gold'; eyebrow?: string }) {
  return (
    <div>
      {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gold-700">{eyebrow}</p>}
      <H>{title}</H>
      <div className={cn('mt-4 rounded-2xl border-l-4 p-4 text-[15px] leading-relaxed text-slate-700 sm:p-5', accent === 'gold' ? 'border-gold-400 bg-gold-50/50' : 'border-violet-400 bg-violet-50/40')}>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Briefcase className="h-3.5 w-3.5" /> Scenario
        </div>
        <RichText text={scenario} />
      </div>
      <div className="mt-4 flex animate-fade-up items-start gap-3 rounded-2xl bg-ink-950 p-4 text-white" style={{ animationDelay: '150ms' }}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-ink-950">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-300">Takeaway</p>
          <p className="mt-0.5 whitespace-pre-line text-[15px] leading-relaxed text-white/90">{takeaway}</p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── AI example ─────────────────────────

export function AIExampleView({ block, cacheKey, learner }: { block: Extract<LessonBlock, { type: 'ai-example' }>; cacheKey: string; learner: string }) {
  const [state, setState] = useState<{ text: string; source: AISource } | null>(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      return raw ? (JSON.parse(raw) as { text: string; source: AISource }) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!state);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (state && nonce === 0) return;
    let cancelled = false;
    setLoading(true);
    generateText({
      system: 'You create short, vivid, personalised workplace examples for micro-learning. You never use real organisation names.',
      prompt: `LEARNER
${learner}

INSTRUCTION
${block.instruction}

Write this example for the learner's actual job and industry in Zimbabwe (fictional organisation names only). Maximum 130 words. Use short paragraphs or bullet points; if you show a prompt, put it on its own line starting with "> ". End with one line starting "**Check:**" naming what the learner must verify before relying on the AI output.${nonce ? ' Give a different example from before.' : ''}`,
      temperature: 0.8,
      fallback: () => block.fallback,
    })
      .then((res) => {
        if (cancelled) return;
        const next = { text: res.data, source: res.source };
        setState(next);
        if (res.source === 'gemini') {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(next));
          } catch {
            /* ignore */
          }
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, nonce]);

  return (
    <div>
      <H>{block.title}</H>
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-brand-200/70 bg-gradient-to-br from-brand-50/80 via-white to-white p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center gap-3 py-6">
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 animate-ping-slow rounded-full bg-brand-400/30" />
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                <Sparkles className="h-4 w-4 text-brand-600" />
              </span>
            </span>
            <div>
              <p className="text-sm font-bold text-ink-950">Personalising this example for you…</p>
              <p className="text-xs text-slate-500">Using your role, industry and progress</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <RichText text={state?.text ?? block.fallback} className="text-slate-700" />
          </div>
        )}
      </div>
      {!loading && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AISourceBadge source={state?.source} />
            <AIDisclaimer compact />
          </div>
          <button onClick={() => setNonce((n) => n + 1)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">
            <RefreshCw className="h-3.5 w-3.5" /> New example
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Interactive ─────────────────────────

export function InteractiveView({ block, done, onDone }: { block: InteractiveBlock; done: boolean; onDone: () => void }) {
  const correctIds = block.options.filter((o) => o.correct).map((o) => o.id);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set(done ? block.options.map((o) => o.id) : []));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(done ? correctIds : []));
  const [checked, setChecked] = useState(done);
  const [complete, setComplete] = useState(done);
  const finish = () => {
    if (!complete) {
      setComplete(true);
      onDone();
    }
  };

  if (block.mode === 'sort') {
    const exact = checked && correctIds.length === selected.size && correctIds.every((id) => selected.has(id));
    return (
      <div>
        <H>{block.title}</H>
        <p className="mt-2 whitespace-pre-line text-[15px] text-slate-600">{block.prompt}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">Select every option that applies, then check.</p>
        <div className="mt-4 space-y-2.5">
          {block.options.map((o) => {
            const on = selected.has(o.id);
            const show = checked;
            const right = o.correct === on;
            return (
              <button
                key={o.id}
                disabled={complete}
                onClick={() => {
                  if (checked && !complete) setChecked(false);
                  setSelected((s) => {
                    const n = new Set(s);
                    if (n.has(o.id)) n.delete(o.id);
                    else n.add(o.id);
                    return n;
                  });
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.99]',
                  show ? (right ? 'border-brand-400 bg-brand-50/60' : 'border-clay-300 bg-clay-50/60') : on ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 bg-white hover:border-brand-300',
                )}
              >
                <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white')}>
                  {on && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink-950">{o.label}</span>
                  {show && <span className={cn('mt-1 block animate-fade-in text-[13px]', right ? 'text-brand-800' : 'text-clay-700')}>{o.feedback}</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!complete && (
            <Button
              size="sm"
              disabled={!selected.size}
              onClick={() => {
                setChecked(true);
                const ok = correctIds.length === selected.size && correctIds.every((id) => selected.has(id));
                if (ok) finish();
              }}
            >
              Check my answer
            </Button>
          )}
          {checked && !exact && !complete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelected(new Set(correctIds));
                setChecked(true);
                finish();
              }}
            >
              Show the answer
            </Button>
          )}
          {checked && (exact || complete) && <Feedback ok title="Nicely sorted" />}
          {checked && !exact && !complete && <span className="text-sm font-semibold text-clay-700">Not quite — adjust your selection and check again.</span>}
        </div>
      </div>
    );
  }

  const wrongCount = [...revealed].filter((id) => !block.options.find((o) => o.id === id)?.correct).length;
  const foundCorrect = correctIds.filter((id) => revealed.has(id)).length;
  const needAll = block.mode === 'spot-the-risk';
  const satisfied = needAll ? foundCorrect === correctIds.length : foundCorrect > 0;

  return (
    <div>
      <H>{block.title}</H>
      <p className="mt-2 text-[15px] text-slate-600">{block.prompt}</p>
      {needAll && correctIds.length > 1 && (
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Tap each option to reveal feedback · {foundCorrect} of {correctIds.length} risks found
        </p>
      )}
      <div className="mt-4 space-y-2.5">
        {block.options.map((o) => {
          const shown = revealed.has(o.id);
          return (
            <button
              key={o.id}
              onClick={() => {
                if (shown) return;
                const n = new Set(revealed);
                n.add(o.id);
                setRevealed(n);
                const found = correctIds.filter((id) => n.has(id)).length;
                if (needAll ? found === correctIds.length : o.correct) finish();
              }}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.99]',
                shown ? (o.correct ? 'border-brand-400 bg-brand-50/60' : 'border-clay-300 bg-clay-50/50') : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50',
              )}
            >
              <span className="mt-0.5 shrink-0">
                {shown ? o.correct ? <CircleCheck className="h-5 w-5 text-brand-600" /> : <CircleX className="h-5 w-5 text-clay-500" /> : <span className="block h-5 w-5 rounded-full border-2 border-slate-300" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-snug text-ink-950">{o.label}</span>
                {shown && <span className={cn('mt-1 block animate-fade-in text-[13px] leading-snug', o.correct ? 'text-brand-800' : 'text-clay-700')}>{o.feedback}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {satisfied && <Feedback ok title={needAll ? 'All risks spotted' : 'Great choice'} />}
        {!satisfied && wrongCount >= 2 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRevealed(new Set(block.options.map((o) => o.id)));
              finish();
            }}
          >
            Show the answers
          </Button>
        )}
      </div>
    </div>
  );
}

function Feedback({ ok, title }: { ok: boolean; title: string }) {
  return (
    <span className={cn('inline-flex animate-scale-in items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold', ok ? 'bg-brand-600 text-white' : 'bg-clay-100 text-clay-700')}>
      {ok ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" />}
      {title}
    </span>
  );
}

// ───────────────────────── Quiz ─────────────────────────

export interface AltExplanation {
  text: string;
  source: AISource;
}

export function QuizView({
  block,
  done,
  onFirstAttempt,
  onSolved,
  explainDifferently,
  practice,
}: {
  block: QuizBlock;
  done: boolean;
  onFirstAttempt?: (correct: boolean) => void;
  onSolved: () => void;
  explainDifferently?: (block: QuizBlock, chosen: number) => Promise<AltExplanation>;
  practice?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(done ? block.correctIndex : null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(done);
  const [alt, setAlt] = useState<AltExplanation | null>(null);
  const [altLoading, setAltLoading] = useState(false);
  const attempted = useRef(done);
  const firstTry = useRef<boolean | null>(done ? null : null);

  const choose = (i: number) => {
    if (solved || wrong.includes(i)) return;
    setSelected(i);
    const correct = i === block.correctIndex;
    if (!attempted.current) {
      attempted.current = true;
      firstTry.current = correct;
      onFirstAttempt?.(correct);
    }
    if (correct) {
      setSolved(true);
      onSolved();
    } else setWrong((w) => [...w, i]);
  };

  const showingWrong = selected !== null && !solved && wrong.includes(selected);

  const askAlt = async () => {
    if (!explainDifferently || selected === null) return;
    setAltLoading(true);
    try {
      setAlt(await explainDifferently(block, selected));
    } finally {
      setAltLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-extrabold leading-snug tracking-tight text-ink-950 sm:text-xl">{block.question}</h2>
      <div className="mt-4 space-y-2.5" role="radiogroup">
        {block.options.map((o, i) => {
          const isWrong = wrong.includes(i);
          const isRight = solved && i === block.correctIndex;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={selected === i}
              disabled={solved || isWrong}
              onClick={() => choose(i)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.99]',
                isRight && 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-900/5',
                isWrong && 'border-clay-300 bg-clay-50/60',
                !isRight && !isWrong && (solved ? 'border-slate-100 bg-white opacity-60' : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'),
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold transition',
                  isRight ? 'bg-brand-600 text-white' : isWrong ? 'bg-clay-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-700',
                )}
              >
                {isRight ? <Check className="h-4 w-4" strokeWidth={3} /> : isWrong ? <X className="h-4 w-4" strokeWidth={3} /> : 'ABCDE'[i]}
              </span>
              <span className={cn('text-[15px] font-semibold leading-snug', isWrong ? 'text-clay-800 line-through decoration-clay-300' : 'text-ink-950')}>{o}</span>
            </button>
          );
        })}
      </div>

      {solved && (
        <div className="mt-4 animate-scale-in rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
          <p className="flex items-center gap-2 text-sm font-extrabold text-brand-800">
            <CircleCheck className="h-5 w-5" />
            {firstTry.current === true ? (practice ? 'Correct — nicely done!' : 'Correct, first time!') : done && firstTry.current === null ? 'Answered' : 'Correct — you got there!'}
          </p>
          <RichText text={block.explanation} className="mt-1.5 text-slate-700" />
        </div>
      )}

      {showingWrong && (
        <div className="mt-4 animate-scale-in rounded-2xl border border-clay-200 bg-clay-50/70 p-4">
          <p className="flex items-center gap-2 text-sm font-extrabold text-clay-700">
            <CircleX className="h-5 w-5" /> Not quite — here's why
          </p>
          <RichText text={block.explanation} className="mt-1.5 text-slate-700" />
          <div className="mt-3 flex flex-wrap gap-2">
            {explainDifferently && !alt && (
              <Button size="sm" variant="outline" icon={altLoading ? <Spinner className="h-4 w-4" /> : <WandSparkles className="h-4 w-4 text-brand-600" />} disabled={altLoading} onClick={askAlt}>
                {altLoading ? 'Re-explaining for your role…' : 'Explain it differently'}
              </Button>
            )}
            <Button size="sm" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setSelected(null)}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {alt && (
        <div className="mt-4 animate-fade-up rounded-2xl border border-brand-200/70 bg-gradient-to-br from-white to-brand-50/60 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-700">
              <WandSparkles className="h-3.5 w-3.5" /> Explained for your role
            </p>
            <AISourceBadge source={alt.source} />
          </div>
          <RichText text={alt.text} className="text-[14px] text-slate-700" />
          <AIDisclaimer compact className="mt-2" />
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Task ─────────────────────────

export function TaskView({ block, storageKey }: { block: Extract<LessonBlock, { type: 'task' }>; storageKey: string }) {
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(storageKey) ?? '';
    } catch {
      return '';
    }
  });
  const [hint, setHint] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (text) localStorage.setItem(storageKey, text);
        else localStorage.removeItem(storageKey);
        setSaved(!!text);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [text, storageKey]);

  return (
    <div>
      <H>{block.title}</H>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-slate-700">
        <RichText text={block.instructions} />
      </div>
      {block.hint && (
        <div className="mt-3">
          {hint ? (
            <div className="flex animate-fade-in items-start gap-2.5 rounded-xl bg-gold-50 p-3 text-sm text-gold-900 ring-1 ring-inset ring-gold-200">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              {block.hint}
            </div>
          ) : (
            <button onClick={() => setHint(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-gold-700 hover:bg-gold-50">
              <Lightbulb className="h-4 w-4" /> Show a hint
            </button>
          )}
        </div>
      )}
      <label className="mt-5 block">
        <span className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
          Your reflection <span className="font-medium normal-case tracking-normal text-slate-400">optional · not graded</span>
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Jot down how you would apply this in your own work…"
          className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-ink-950 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      {saved && (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Check className="h-3 w-3" /> Saved on this device
        </p>
      )}
    </div>
  );
}
