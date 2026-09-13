import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Eraser, MessageSquareText, Send, Sparkles } from 'lucide-react';
import type { ChatMessage, Organisation, WorkforceMember } from '../../types';
import { AIDisclaimer, AISourceBadge, Button, Card, CardTitle, PageHeader, RichText } from '../../components/ui';
import { WORKFORCE_STATUS_META } from '../../lib/readiness';
import { cn, nowISO, uid } from '../../lib/utils';
import { useWorkforce } from './useWorkforce';
import { departmentsNeedingAttention, orgAverages, statusSplit } from './analytics';
import { askAdvisor, SUGGESTED_QUESTIONS } from './advisorEngine';
import { HeroArt, SampleDataBanner, WorkforceGate } from './components';
import { Reveal } from '../../components/motion';
import { GhostMascot } from '../../components/illustrations';

export default function AdvisorPage() {
  const state = useWorkforce();
  return <WorkforceGate state={state}>{(members, org) => <Advisor org={org} members={members} />}</WorkforceGate>;
}

const storageKey = (orgId: string) => `zimai:advisor:${orgId}`;

function loadHistory(orgId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(orgId));
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'model')) : [];
  } catch {
    return [];
  }
}

function saveHistory(orgId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(storageKey(orgId), JSON.stringify(messages.slice(-40)));
  } catch {
    /* storage full or unavailable */
  }
}

function Advisor({ org, members }: { org: Organisation; members: WorkforceMember[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory(org.id));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const split = useMemo(() => statusSplit(members), [members]);
  const avg = useMemo(() => orgAverages(members), [members]);
  const top = useMemo(() => departmentsNeedingAttention(members, org, 1)[0], [members, org]);

  useEffect(() => saveHistory(org.id, messages), [org.id, messages]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, busy]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    if (q.length > 600) {
      setNotice('Please keep questions under 600 characters.');
      return;
    }
    setNotice(null);
    const history = messages;
    const userMsg: ChatMessage = { id: uid('m-'), role: 'user', text: q, at: nowISO() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const res = await askAdvisor(q, history, org, members);
      setMessages((m) => [...m, { id: uid('m-'), role: 'model', text: res.data, at: nowISO(), source: res.source }]);
      if (res.error) setNotice(res.error);
    } catch {
      setNotice('Something went wrong answering that question. Please try again.');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const lastModel = [...messages].reverse().find((m) => m.role === 'model');

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={org.name}
        title={<>AI Workforce <em>Advisor</em></>}
        description="Strategic answers, grounded in your workforce data."
        actions={
          <div className="flex items-end gap-5">
            <HeroArt>
              <GhostMascot mood="thinking" className="h-24 w-24 lg:h-28 lg:w-28" animated />
            </HeroArt>
            {messages.length > 0 && (
              <Button variant="outline" icon={<Eraser className="h-4 w-4" />} onClick={() => setMessages([])} disabled={busy}>
                Clear chat
              </Button>
            )}
          </div>
        }
      />
      <SampleDataBanner organisation={org} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card padded={false} className="flex min-h-[560px] animate-ghost-in flex-col overflow-hidden rounded-4xl">
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.length === 0 && (
              <div className="mx-auto max-w-lg py-10 text-center sm:py-16">
                <span className="relative mx-auto flex h-24 w-24 items-center justify-center md:hidden">
                                    <GhostMascot mood="wave" className="relative h-24 w-24 md:hidden" animated />
                </span>
                <h2 className="mt-4 text-3xl leading-tight text-ink-950 sm:text-4xl">
                  How can I help you plan your <em>AI workforce?</em>
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  I have analysed {members.length} employees across {new Set(members.map((m) => m.department)).size} departments. Try one of these:
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={q} type="button" onClick={() => ask(q)} className="animate-ghost-in rounded-full border border-ink-950/15 bg-paper px-3.5 py-2 text-sm font-medium text-ink-700 transition hover:-translate-y-px hover:border-ink-950 hover:bg-lilac-100 hover:shadow-ink-sm" style={{ animationDelay: `${200 + i * 70}ms` }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] animate-ghost-in rounded-2xl rounded-br-md border border-ink-950 bg-lilac-200 px-4 py-2.5 text-[15px] text-ink-950">{m.text}</p>
                </div>
              ) : (
                <div key={m.id} className="flex animate-ghost-in gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-canvas">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 max-w-[92%] rounded-2xl rounded-tl-md border border-ink-950/10 bg-sand-100 px-4 py-3">
                    <RichText text={m.text} className="text-[14.5px] text-slate-700" />
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <AISourceBadge source={m.source} />
                      {m.id === lastModel?.id && <AIDisclaimer compact />}
                    </div>
                  </div>
                </div>
              ),
            )}
            {busy && (
              <div className="flex gap-3" role="status">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-canvas">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </span>
                <div className="animate-ghost-pulse rounded-2xl rounded-tl-md border border-ink-950/10 bg-sand-100 px-4 py-3 text-sm text-ink-600">
                  <span className="inline-flex items-center gap-1.5">
                    Analysing your workforce data
                    <span className="inline-flex gap-0.5" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-800" style={{ animationDelay: `${i * 120}ms` }} />
                      ))}
                    </span>
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            className="border-t border-ink-950/10 bg-sand-200/50 p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
          >
            {notice && <p className="mb-2 text-xs text-gold-700">{notice}</p>}
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="advisor-input">
                Ask the AI Workforce Advisor
              </label>
              <textarea
                id="advisor-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void ask(input);
                  }
                }}
                rows={1}
                maxLength={600}
                placeholder="e.g. Which department should we prioritise?"
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-ink-950/15 bg-paper px-3.5 py-2.5 text-[15px] focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-lilac-200"
              />
              <Button type="submit" disabled={!input.trim() || busy} loading={busy} aria-label="Send question" icon={!busy ? <Send className="h-4 w-4" /> : undefined}>
                <span className="hidden sm:inline">Ask</span>
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Reveal delay={80}>
          <Card>
            <CardTitle title="Grounded in your data" />
            <dl className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-sand-100 p-3">
                <dt className="text-[11px] font-semibold uppercase text-slate-500">Employees</dt>
                <dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{split.total}</dd>
              </div>
              <div className="rounded-2xl bg-sand-100 p-3">
                <dt className="text-[11px] font-semibold uppercase text-slate-500">Readiness</dt>
                <dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{avg.readiness}%</dd>
              </div>
              <div className="rounded-2xl bg-sand-100 p-3">
                <dt className="text-[11px] font-semibold uppercase" style={{ color: WORKFORCE_STATUS_META['ai-ready'].hex }}>
                  AI Ready
                </dt>
                <dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{split.pct['ai-ready']}%</dd>
              </div>
              <div className="rounded-2xl bg-sand-100 p-3">
                <dt className="text-[11px] font-semibold uppercase" style={{ color: WORKFORCE_STATUS_META['priority-reskilling'].hex }}>
                  Priority
                </dt>
                <dd className="mt-0.5 font-display text-3xl font-medium leading-none tabular-nums text-ink-950">{split.pct['priority-reskilling']}%</dd>
              </div>
            </dl>
            {top && (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Highest-priority department: <strong className="text-ink-950">{top.stat.department}</strong> ({top.stat.readiness}% readiness vs {top.stat.exposure}% exposure).
              </p>
            )}
            {org.maturity && (
              <p className="mt-1 text-xs text-slate-500">
                AI maturity: <strong className="text-ink-950">{org.maturity.score}/100 · {org.maturity.level}</strong>
              </p>
            )}
          </Card>
          </Reveal>
          <Reveal delay={160}>
          <Card>
            <CardTitle icon={<MessageSquareText className="h-5 w-5" />} title="Suggested questions" />
            <ul className="space-y-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => ask(q)}
                    disabled={busy}
                    className={cn('w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm text-ink-700 transition hover:border-ink-950/15 hover:bg-lilac-100 hover:text-ink-950 disabled:opacity-50')}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
