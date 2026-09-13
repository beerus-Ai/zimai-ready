import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, Briefcase, Check, CircleCheck, CircleX, Lightbulb, ListChecks, PenLine, RefreshCw, RotateCcw, Sparkles, Target, WandSparkles, X, Zap } from 'lucide-react';
import { AIDisclaimer, AISourceBadge, Button, RichText, Spinner } from '../../../components/ui';
import { Reveal } from '../../../components/motion';
import { GhostMascot, Sparkle } from '../../../components/illustrations';
import { generateText } from '../../../services/gemini';
import { cn } from '../../../lib/utils';
import type { AISource, LessonBlock } from '../../../types';

/** A lesson block as shown by the player — includes the virtual "In your field" card. */
export type PlayerBlock = LessonBlock | { type: 'field'; title: string; scenario: string; takeaway: string; domainName: string };
export type QuizBlock = Extract<LessonBlock, { type: 'quiz' }>;
export type InteractiveBlock = Extract<LessonBlock, { type: 'interactive' }>;

export const isGated = (b: PlayerBlock) => b.type === 'quiz' || b.type === 'interactive';

const BLOCK_META: Record<PlayerBlock['type'], { label: string; icon: ReactNode; cls: string }> = {
  explain: { label: 'Concept', icon: <BookOpen className="h-3.5 w-3.5" />, cls: 'bg-sand-200 text-ink-800 ring-ink-950/10' },
  example: { label: 'Workplace example', icon: <Briefcase className="h-3.5 w-3.5" />, cls: 'bg-blush-100 text-clay-800 ring-clay-300/40' },
  field: { label: 'In your field', icon: <Target className="h-3.5 w-3.5" />, cls: 'bg-gold-50 text-gold-800 ring-gold-300/60' },
  'ai-example': { label: 'Personalised AI example', icon: <Sparkles className="h-3.5 w-3.5" />, cls: 'bg-lilac-100 text-lilac-800 ring-lilac-300/60' },
  interactive: { label: 'Interactive', icon: <Zap className="h-3.5 w-3.5" />, cls: 'bg-clay-50 text-clay-700 ring-clay-300/50' },
  quiz: { label: 'Quick check', icon: <ListChecks className="h-3.5 w-3.5" />, cls: 'bg-ink-950 text-canvas ring-ink-950' },
  task: { label: 'Try it at work', icon: <PenLine className="h-3.5 w-3.5" />, cls: 'bg-brand-50 text-brand-800 ring-brand-800/15' },
};

export function BlockLabel({ type }: { type: PlayerBlock['type'] }) {
  const m = BLOCK_META[type];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset', m.cls)}>
      {m.icon}
      {m.label}
    </span>
  );
}

const H = ({ children }: { children: ReactNode }) => <h2 className="animate-ghost-in text-3xl leading-[1.05] text-ink-950 sm:text-4xl">{children}</h2>;

// ───────────────────────── Static blocks ─────────────────────────

export function ExplainView({ block }: { block: Extract<LessonBlock, { type: 'explain' }> }) {
  return (
    <div>
      <H>{block.title}</H>
      <Reveal delay={80}>
        <RichText text={block.body} className="mt-4 text-[15px] leading-relaxed text-ink-700" />
      </Reveal>
      {block.bullets?.length ? (
        <ul className="mt-6 space-y-2.5">
          {block.bullets.map((b, i) => (
            <Reveal as="li" key={i} delay={160 + i * 90} className="flex items-start gap-3 rounded-2xl border border-ink-950/5 bg-sand-200/50 px-4 py-3 text-[15px] text-ink-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-950 text-canvas">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span>{b}</span>
            </Reveal>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ExampleView({ title, scenario, takeaway, accent = 'violet', eyebrow }: { title: string; scenario: string; takeaway: string; accent?: 'violet' | 'gold'; eyebrow?: string }) {
  return (
    <div>
      {eyebrow && <p className="mb-2 animate-ghost-in text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{eyebrow}</p>}
      <H>{title}</H>
      <Reveal delay={100}>
        <div className={cn('relative mt-5 overflow-hidden rounded-3xl p-5 text-[15px] leading-relaxed text-ink-800 sm:p-6', accent === 'gold' ? 'bg-gold-50 ring-1 ring-inset ring-gold-300/50' : 'bg-blush-100/70 ring-1 ring-inset ring-clay-300/30')}>
          <Sparkle className="absolute right-4 top-4 h-5 w-5 opacity-70" color={accent === 'gold' ? '#ffa946' : '#ff6c4c'} />
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
            <Briefcase className="h-3.5 w-3.5" /> Scenario
          </p>
          <RichText text={scenario} />
        </div>
      </Reveal>
      <Reveal delay={260}>
        <div className="mt-4 flex items-start gap-3 rounded-3xl bg-brand-800 p-5 text-canvas sm:p-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-950 bg-gold-400 text-ink-950">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-canvas/60">Takeaway</p>
            <p className="mt-1 whitespace-pre-line font-display text-xl leading-snug text-canvas">{takeaway}</p>
          </div>
        </div>
      </Reveal>
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
      <div className="relative mt-5 overflow-hidden rounded-3xl bg-lilac-100/80 p-5 ring-1 ring-inset ring-lilac-300/50 sm:p-6">
        <Sparkle className="absolute right-4 top-4 h-5 w-5" color="#1a1a1a" />
        {loading ? (
          <div className="flex items-center gap-3 py-6">
            <span className="relative h-12 w-12 shrink-0">
              <span className="absolute inset-1 animate-ghost-pulse rounded-full bg-lilac-300/70 blur-md" />
              <GhostMascot mood="thinking" className="relative h-12 w-12" />
            </span>
            <div>
              <p className="font-display text-xl text-ink-950">Personalising for you…</p>
              <p className="mt-1 flex gap-1" aria-hidden>
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-950/60" style={{ animationDelay: `${d}ms` }} />
                ))}
              </p>
            </div>
          </div>
        ) : (
          <div key={state?.text} className="animate-ghost-in pr-6">
            <RichText text={state?.text ?? block.fallback} className="text-[15px] text-ink-800" />
          </div>
        )}
      </div>
      {!loading && (
        <div className="mt-3 flex animate-ghost-in flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AISourceBadge source={state?.source} />
            <AIDisclaimer compact />
          </div>
          <button onClick={() => setNonce((n) => n + 1)} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-800 hover:bg-ink-950/5">
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
        <p className="mt-3 whitespace-pre-line text-[15px] text-ink-600">{block.prompt}</p>
        <p className="mt-1 text-xs font-semibold text-ink-400">Select every option that applies, then check.</p>
        <div className="mt-5 space-y-2.5">
          {block.options.map((o, i) => {
            const on = selected.has(o.id);
            const show = checked;
            const right = o.correct === on;
            return (
              <Reveal key={o.id} delay={80 + i * 70}>
                <button
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
                    show ? (right ? 'border-brand-800/60 bg-brand-50' : 'border-clay-300 bg-blush-100/60') : on ? 'border-ink-950 bg-lilac-100 shadow-ink-sm' : 'border-ink-950/10 bg-paper hover:border-ink-950/35',
                  )}
                >
                  <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2', on ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/25 bg-paper')}>
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink-950">{o.label}</span>
                    {show && <span className={cn('mt-1 block animate-ghost-in text-[13px]', right ? 'text-brand-800' : 'text-clay-700')}>{o.feedback}</span>}
                  </span>
                </button>
              </Reveal>
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
      <p className="mt-3 text-[15px] text-ink-600">{block.prompt}</p>
      {needAll && correctIds.length > 1 && (
        <p className="mt-1 text-xs font-semibold text-ink-400">
          Tap each option to reveal feedback · {foundCorrect} of {correctIds.length} risks found
        </p>
      )}
      <div className="mt-5 space-y-2.5">
        {block.options.map((o, i) => {
          const shown = revealed.has(o.id);
          return (
            <Reveal key={o.id} delay={80 + i * 70}>
              <button
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
                  shown ? (o.correct ? 'border-brand-800/60 bg-brand-50' : 'border-clay-300 bg-blush-100/60') : 'border-ink-950/10 bg-paper hover:border-ink-950/35 hover:bg-white',
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {shown ? o.correct ? <CircleCheck className="h-5 w-5 animate-scale-in text-brand-800" /> : <CircleX className="h-5 w-5 animate-scale-in text-clay-500" /> : <span className="block h-5 w-5 rounded-full border-2 border-ink-950/25" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-snug text-ink-950">{o.label}</span>
                  {shown && <span className={cn('mt-1 block animate-ghost-in text-[13px] leading-snug', o.correct ? 'text-brand-800' : 'text-clay-700')}>{o.feedback}</span>}
                </span>
              </button>
            </Reveal>
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
    <span className={cn('relative inline-flex animate-scale-in items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold', ok ? 'border-brand-800 bg-brand-800 text-canvas' : 'border-clay-300 bg-clay-100 text-clay-700')}>
      {ok ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" />}
      {title}
      {ok && <Sparkle className="absolute -right-2 -top-2 h-4 w-4" color="#ffa946" />}
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
      <h2 className="animate-ghost-in text-2xl leading-[1.15] text-ink-950 sm:text-3xl">{block.question}</h2>
      <div className="mt-5 space-y-2.5" role="radiogroup">
        {block.options.map((o, i) => {
          const isWrong = wrong.includes(i);
          const isRight = solved && i === block.correctIndex;
          return (
            <Reveal key={i} delay={80 + i * 70}>
              <button
                role="radio"
                aria-checked={selected === i}
                disabled={solved || isWrong}
                onClick={() => choose(i)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.99]',
                  isRight && 'border-brand-800 bg-brand-50 shadow-ink-sm',
                  isWrong && 'border-clay-300 bg-blush-100/60',
                  !isRight && !isWrong && (solved ? 'border-ink-950/5 bg-paper opacity-50' : 'border-ink-950/10 bg-paper hover:border-ink-950/40 hover:bg-white'),
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-condensed text-sm transition',
                    isRight ? 'bg-brand-800 text-canvas' : isWrong ? 'bg-clay-400 text-ink-950' : 'bg-sand-200 text-ink-700 group-hover:bg-lilac-200 group-hover:text-ink-950',
                  )}
                >
                  {isRight ? <Check className="h-4 w-4" strokeWidth={3} /> : isWrong ? <X className="h-4 w-4" strokeWidth={3} /> : 'ABCDE'[i]}
                </span>
                <span className={cn('text-[15px] font-semibold leading-snug', isWrong ? 'text-clay-800 line-through decoration-clay-300' : 'text-ink-950')}>{o}</span>
              </button>
            </Reveal>
          );
        })}
      </div>

      {solved && (
        <div className="relative mt-5 animate-ghost-in overflow-hidden rounded-3xl bg-brand-800 p-5 text-canvas">
          <Sparkle className="absolute right-4 top-4 h-6 w-6" color="#ffa946" />
          <p className="flex items-center gap-2 font-display text-2xl leading-tight">
            <CircleCheck className="h-5 w-5 shrink-0" />
            {firstTry.current === true ? (practice ? 'Correct — nicely done!' : 'Correct, first time!') : done && firstTry.current === null ? 'Answered' : 'Correct — you got there!'}
          </p>
          <RichText text={block.explanation} className="mt-2 text-canvas/85 [&_strong]:text-canvas" />
        </div>
      )}

      {showingWrong && (
        <div className="mt-5 animate-ghost-in rounded-3xl bg-blush-100/80 p-5 ring-1 ring-inset ring-clay-300/40">
          <p className="flex items-center gap-2 font-display text-2xl leading-tight text-clay-800">
            <CircleX className="h-5 w-5 shrink-0" /> Not quite — here's why
          </p>
          <RichText text={block.explanation} className="mt-2 text-ink-700" />
          <div className="mt-4 flex flex-wrap gap-2">
            {explainDifferently && !alt && (
              <Button size="sm" variant="outline" icon={altLoading ? <Spinner className="h-4 w-4" /> : <WandSparkles className="h-4 w-4 text-lilac-700" />} disabled={altLoading} onClick={askAlt}>
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
        <div className="mt-4 animate-ghost-in rounded-3xl bg-lilac-100/80 p-5 ring-1 ring-inset ring-lilac-300/50">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-lilac-800">
              <WandSparkles className="h-3.5 w-3.5" /> Explained for your role
            </p>
            <AISourceBadge source={alt.source} />
          </div>
          <RichText text={alt.text} className="text-[14px] text-ink-700" />
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
      <Reveal delay={100}>
        <div className="mt-5 rounded-3xl bg-sand-200/70 p-5 text-ink-800 ring-1 ring-inset ring-ink-950/5 sm:p-6">
          <RichText text={block.instructions} />
        </div>
      </Reveal>
      {block.hint && (
        <div className="mt-3">
          {hint ? (
            <div className="flex animate-ghost-in items-start gap-2.5 rounded-2xl bg-gold-50 p-3.5 text-sm text-gold-900 ring-1 ring-inset ring-gold-300/60">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              {block.hint}
            </div>
          ) : (
            <button onClick={() => setHint(true)} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold text-gold-800 hover:bg-gold-50">
              <Lightbulb className="h-4 w-4" /> Show a hint
            </button>
          )}
        </div>
      )}
      <Reveal delay={200}>
        <label className="mt-5 block">
          <span className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
            Your reflection <span className="font-medium normal-case tracking-normal text-ink-400">optional · not graded</span>
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Jot down how you would apply this in your own work…"
            className="mt-2 w-full resize-y rounded-2xl border border-ink-950/15 bg-paper px-4 py-3 text-[15px] text-ink-950 placeholder:text-ink-400 focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-lilac-200"
          />
        </label>
      </Reveal>
      {saved && (
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
          <Check className="h-3 w-3" /> Saved on this device
        </p>
      )}
    </div>
  );
}
