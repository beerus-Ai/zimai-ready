import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, PanelRightClose, PlayCircle, Sparkles, Trash2 } from 'lucide-react';
import { AIDisclaimer, AISourceBadge, RichText, useToast } from '../../components/ui';
import { GhostText } from '../../components/motion';
import { GhostMascot } from '../../components/illustrations';
import { TutorTutorial } from '../../components/tutorials';
import { useApp } from '../../services/store';
import { chat } from '../../services/gemini';
import { recordActivity } from '../../lib/progress';
import { cn, nowISO, uid } from '../../lib/utils';
import { getModule, moduleTitle } from '../../data/catalog';
import { industryName } from '../../data/industries';
import { roleName } from '../../data/roles';
import type { ChatMessage } from '../../types';
import { buildTutorSystem, loadTutorState, offlineTutorReply, saveTutorState, suggestedPrompts, tutorStorageKey } from './tutorEngine';
import type { TutorContext, TutorState } from './tutorEngine';

export interface TutorPanelProps {
  moduleId?: string;
  lessonTitle?: string;
  blockContext?: string;
  className?: string;
  variant?: 'panel' | 'page';
  /** Hide the built-in header (e.g. when rendered inside a titled Modal). */
  showHeader?: boolean;
  onClose?: () => void;
  /** Pre-fills the input (e.g. "Help me improve my answer…"). */
  initialInput?: string;
}

const TEN_MINUTES = 10 * 60 * 1000;

/** Gemini expects alternating turns — merge consecutive messages from the same role. */
function sanitizeHistory(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) out[out.length - 1] = { ...last, text: `${last.text}\n\n${m.text}` };
    else out.push(m);
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const timeOf = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export function TutorPanel({ moduleId, lessonTitle, blockContext, className, variant = 'panel', showHeader = true, onClose, initialInput }: TutorPanelProps) {
  const { user, profile, latestAssessment, progress, saveProgress } = useApp();
  const toast = useToast();
  const key = tutorStorageKey(user?.id ?? 'guest', moduleId);
  const [state, setState] = useState<TutorState>(() => loadTutorState(key));
  const stateRef = useRef(state);
  const [input, setInput] = useState(initialInput ?? '');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  /** Messages already on screen when this context loaded — only replies that arrive afterwards get the word-by-word ghost. */
  const arrived = useRef<Set<string>>(new Set(state.messages.map((m) => m.id)));

  useEffect(() => {
    const s = loadTutorState(key);
    stateRef.current = s;
    arrived.current = new Set(s.messages.map((m) => m.id));
    setState(s);
  }, [key]);

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [state.messages.length, busy]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const ctx: TutorContext = useMemo(
    () => ({ profile, assessment: latestAssessment, progress, moduleId, lessonTitle, blockContext }),
    [profile, latestAssessment, progress, moduleId, lessonTitle, blockContext],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chips = useMemo(() => suggestedPrompts(ctx), [profile, moduleId]);
  const meta = moduleId ? getModule(moduleId) : undefined;
  const domainId = progress?.domainId ?? profile?.domainId;
  const contextTitle = meta ? moduleTitle(meta, domainId) : 'General AI coaching';
  const jobTitle = profile?.jobTitle || (profile ? roleName(profile.roleId, profile.roleOther) : 'professional');
  const firstName = profile?.displayName?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'there';

  const persist = useCallback(
    (s: TutorState) => {
      stateRef.current = s;
      setState(s);
      saveTutorState(key, s);
    },
    [key],
  );

  const countQuestion = useCallback(
    (text: string) => {
      if (!progress) return;
      const label = meta ? `Asked the AI Tutor about ${moduleTitle(meta, domainId)}` : `Asked the AI Tutor: "${clip(text, 60)}"`;
      saveProgress((prev) => {
        const base = prev ?? progress;
        let next = { ...base, tutorQuestions: (base.tutorQuestions ?? 0) + 1 };
        const lastTutor = base.activity.find((a) => a.type === 'tutor');
        if (!lastTutor || Date.now() - new Date(lastTutor.at).getTime() > TEN_MINUTES) next = recordActivity(next, 'tutor', label);
        return next;
      }).catch((e) => console.warn('[ZimAI] could not record tutor question', e));
    },
    [progress, meta, domainId, saveProgress],
  );

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || busy) return;
      const before = stateRef.current;
      const userMsg: ChatMessage = { id: uid('msg-'), role: 'user', text, at: nowISO() };
      persist({ ...before, messages: [...before.messages, userMsg] });
      setInput('');
      setBusy(true);
      countQuestion(text);
      const holder: { reply: ReturnType<typeof offlineTutorReply> | null } = { reply: null };
      try {
        const res = await chat({
          system: buildTutorSystem(ctx),
          history: sanitizeHistory(before.messages),
          message: text,
          fallback: () => {
            holder.reply = offlineTutorReply(ctx, text, before);
            return holder.reply.text;
          },
        });
        const cur = stateRef.current;
        const modelMsg: ChatMessage = { id: uid('msg-'), role: 'model', text: res.data, at: nowISO(), source: res.source };
        persist({
          messages: [...cur.messages, modelMsg],
          pendingQuiz: res.source === 'engine' && holder.reply ? holder.reply.pendingQuiz : null,
          asked: holder.reply ? holder.reply.asked : cur.asked,
        });
      } catch (e) {
        console.warn('[ZimAI] tutor failed', e);
        const cur = stateRef.current;
        persist({
          ...cur,
          messages: [...cur.messages, { id: uid('msg-'), role: 'model', text: 'Sorry — I could not answer that just now. Please try again in a moment.', at: nowISO(), source: 'engine' }],
        });
      } finally {
        setBusy(false);
        requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
      }
    },
    [input, busy, persist, countQuestion, ctx],
  );

  const clear = () => {
    persist({ messages: [], pendingQuiz: null, asked: stateRef.current.asked });
    toast.info('Chat cleared', 'Your conversation for this context has been removed from this device.');
  };

  const page = variant === 'page';
  const messages = state.messages;
  const newest = messages[messages.length - 1];
  const [tour, setTour] = useState(false);

  return (
    <div className={cn('flex min-h-0 flex-col overflow-hidden rounded-3xl border border-ink-950/10 bg-paper shadow-card', className)}>
      {showHeader && (
        <div className="flex items-center gap-3 border-b border-ink-950/10 px-4 py-3">
          <TutorAvatar size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight text-ink-950">
              AI <em>Tutor</em>
            </p>
            <p className="truncate text-xs text-ink-500">{lessonTitle && meta ? `${contextTitle} · ${lessonTitle}` : contextTitle}</p>
          </div>
          {messages.length > 0 && (
            <button onClick={clear} className="rounded-full p-2 text-ink-400 transition hover:bg-ink-950/5 hover:text-ink-800" title="Clear chat" aria-label="Clear chat">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="rounded-full p-2 text-ink-400 transition hover:bg-ink-950/5 hover:text-ink-800" title="Hide tutor" aria-label="Hide tutor">
              <PanelRightClose className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div ref={scrollRef} className={cn('min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-canvas/60 px-4 py-5', page && 'sm:px-6')} aria-live="polite">
        {messages.length === 0 && (
          <div>
            <div className="flex animate-ghost-in items-end gap-2.5">
              <TutorAvatar />
              <div className="min-w-0 flex-1 rounded-3xl rounded-bl-md border border-ink-950/10 bg-paper px-4 py-3 text-[14px] leading-relaxed text-ink-700 shadow-card">
                <p className="font-display text-xl leading-tight text-ink-950">
                  Hi {firstName}, I'm your <em>AI Tutor.</em>
                </p>
                <p className="mt-1.5">
                  I know you work as {/^[aeiou]/i.test(jobTitle) ? 'an' : 'a'} <strong className="font-semibold text-ink-950">{jobTitle}</strong>
                  {profile ? ` in ${industryName(profile.industryId, profile.industryOther)}` : ''}, so I'll tailor explanations and examples to your work.
                  {meta ? (
                    <>
                      {' '}
                      We're on <strong className="font-semibold text-ink-950">{contextTitle}</strong>
                      {lessonTitle ? ` · ${lessonTitle}` : ''}.
                    </>
                  ) : (
                    ' Ask me anything about using AI in your job.'
                  )}
                </p>
              </div>
            </div>
            <div className={cn('mt-5 flex flex-wrap gap-2', page ? 'sm:pl-10' : 'pl-0')}>
              {chips.slice(0, 4).map((c, i) => (
                <div key={c} className="animate-ghost-in" style={{ animationDelay: `${200 + i * 110}ms` }}>
                  <button
                    onClick={() => send(c)}
                    disabled={busy}
                    className="group flex max-w-full animate-float items-center gap-1.5 rounded-full border border-ink-950/15 bg-paper px-3.5 py-2 text-left text-[13px] font-medium text-ink-800 shadow-card transition hover:border-ink-950 hover:bg-lilac-200 hover:text-ink-950"
                    style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${5 + (i % 3)}s` }}
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-500 transition group-hover:scale-110 group-hover:text-ink-950" />
                    <span className="min-w-0">{c}</span>
                  </button>
                </div>
              ))}
            </div>
            {page && (
              <div className="mt-6 sm:pl-10">
                <button
                  type="button"
                  onClick={() => setTour((t) => !t)}
                  aria-expanded={tour}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-500 transition hover:bg-ink-950/5 hover:text-ink-950"
                >
                  <PlayCircle className="h-3.5 w-3.5" /> {tour ? 'Hide tour' : 'How it works'}
                </button>
                {tour && (
                  <div className="mt-3 max-w-xl animate-ghost-in">
                    <TutorTutorial />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex animate-ghost-in justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-md border border-ink-950 bg-lilac-200 px-4 py-2.5 text-[14px] leading-relaxed text-ink-950">{m.text}</div>
            </div>
          ) : (
            <div key={m.id} className="flex animate-ghost-in items-start gap-2.5">
              <TutorAvatar />
              <div className="min-w-0 max-w-[92%] flex-1">
                <div className="rounded-3xl rounded-tl-md border border-ink-950/10 bg-paper px-4 py-3 text-ink-700 shadow-card">
                  {m.id === newest?.id && !arrived.current.has(m.id) && isPlain(m.text) ? (
                    <GhostText text={m.text} startOnView={false} stagger={45} className="block text-[14px] leading-relaxed" />
                  ) : (
                    <RichText text={m.text} className="text-[14px]" />
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2 pl-1">
                  <AISourceBadge source={m.source} className="!px-2 !py-0 text-[10px]" />
                  <span className="text-[11px] text-ink-400">{timeOf(m.at)}</span>
                </div>
              </div>
            </div>
          ),
        )}

        {busy && (
          <div className="flex animate-ghost-in items-end gap-2.5">
            <TutorAvatar thinking />
            <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-md border border-ink-950/10 bg-paper px-4 py-3.5 shadow-card" aria-label="AI Tutor is typing">
              {[0, 160, 320].map((d) => (
                <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-ink-950/60" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-ink-950/10 bg-paper px-3 pb-3 pt-2.5">
        {messages.length > 0 && (
          <div className="no-scrollbar -mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                disabled={busy}
                className="shrink-0 whitespace-nowrap rounded-full border border-ink-950/15 bg-paper px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-ink-950 hover:bg-lilac-200 hover:text-ink-950 disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2 rounded-2xl border border-ink-950/15 bg-canvas/70 p-1.5 pl-3.5 transition focus-within:border-ink-950 focus-within:bg-paper focus-within:ring-2 focus-within:ring-lilac-200"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={meta ? 'Ask about this lesson…' : 'Ask the AI Tutor anything…'}
            aria-label="Message the AI Tutor"
            className="max-h-36 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[14px] text-ink-950 placeholder:text-ink-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-950 bg-lilac-200 text-ink-950 transition hover:-translate-y-px hover:bg-lilac-300 hover:shadow-ink-sm active:scale-95 disabled:border-ink-950/10 disabled:bg-sand-200 disabled:text-ink-400"
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </form>
        <AIDisclaimer compact className="mt-2 px-1 text-[11px]" />
      </div>
    </div>
  );
}

/** Short, markdown-free replies can materialise word by word; anything richer ghosts in as a block. */
function isPlain(text: string) {
  return text.length <= 260 && !/[*_#>`[\]|]|\n|^\s*[-\d]/m.test(text);
}

function TutorAvatar({ thinking, size = 'sm' }: { thinking?: boolean; size?: 'sm' | 'lg' }) {
  return (
    <span className={cn('relative flex shrink-0 items-center justify-center rounded-full bg-lilac-200 ring-1 ring-ink-950', size === 'lg' ? 'h-10 w-10' : 'h-8 w-8')} aria-hidden>
      {thinking && <span className="absolute -inset-1 animate-ghost-pulse rounded-full bg-lilac-300/70 blur-sm" />}
      <span className={cn('relative block animate-ghost-float', size === 'lg' ? 'h-8 w-8' : 'h-6 w-6')}>
        <GhostMascot mood={thinking ? 'thinking' : 'happy'} className="h-full w-full" />
      </span>
    </span>
  );
}

export default TutorPanel;
