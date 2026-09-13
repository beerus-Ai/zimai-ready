import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { ArrowUp, Award, BookCheck, Check, ClipboardCheck, Lock, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { ScoreRing } from '../ui';
import { GhostText, Typewriter } from '../motion';
import { GhostMascot, Sparkle } from '../illustrations';
import { cn } from '../../lib/utils';
import { Certificate, Rubric } from './scenes-learner';
import { DemoCursor, Eyebrow, FauxQR, Ghost, Mascot, Panel, SparkleBurst, Speech, TypingDots, useTimeline } from './primitives';

/* ════════════════════════ Tutor chat pieces ════════════════════════ */

function TutorAvatar({ thinking }: { thinking?: boolean }) {
  return (
    <span className={cn('relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lilac-200 ring-1 ring-ink-950/80', thinking && 'animate-ghost-pulse')}>
      <GhostMascot mood={thinking ? 'thinking' : 'happy'} className="h-6 w-6" />
    </span>
  );
}

function ChatFrame({ children, input, className, sendRef, chips }: { children: ReactNode; input?: ReactNode; className?: string; sendRef?: RefObject<HTMLSpanElement | null>; chips?: ReactNode }) {
  return (
    <Panel className={cn('flex h-[232px] flex-col overflow-hidden', className)}>
      <div className="flex items-center gap-2 border-b border-ink-950/10 px-3 py-2">
        <TutorAvatar />
        <div className="min-w-0 leading-tight">
          <p className="text-[12px] font-bold">AI Tutor</p>
          <p className="truncate text-[10px] text-ink-500">Verifying AI outputs</p>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden px-3 py-2">{children}</div>
      <div className="border-t border-ink-950/10 px-2 pb-2 pt-1.5">
        {chips && <div className="mb-1.5 flex gap-1 overflow-hidden">{chips}</div>}
        <div className="flex items-center gap-1.5 rounded-xl border border-ink-950/15 bg-sand-200/50 py-1 pl-2.5 pr-1">
          <div className="min-h-[18px] min-w-0 flex-1 truncate text-[11.5px]">{input ?? <span className="text-ink-400">Ask the AI Tutor anything…</span>}</div>
          <span ref={sendRef} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-ink-950 bg-lilac-200">
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Panel>
  );
}

function UserBubble({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <Ghost delay={delay} className="flex justify-end">
      <p className="max-w-[80%] rounded-2xl rounded-br-md border border-ink-950 bg-lilac-200 px-2.5 py-1.5 text-[11.5px] leading-snug text-ink-950">{children}</p>
    </Ghost>
  );
}

function AIBubble({ children, delay = 0, thinking }: { children?: ReactNode; delay?: number; thinking?: boolean }) {
  return (
    <Ghost delay={delay} className="flex items-end gap-1.5">
      <TutorAvatar thinking={thinking} />
      <div className="max-w-[84%] rounded-2xl rounded-bl-md border border-ink-950/10 bg-sand-200/60 px-2.5 py-1.5 text-[11.5px] leading-snug text-ink-800">{thinking ? <TypingDots className="py-1" /> : children}</div>
    </Ghost>
  );
}

const QUESTION = 'How do I check an AI summary of a budget?';

export function AskScene() {
  const root = useRef<HTMLDivElement>(null);
  const send = useRef<HTMLSpanElement>(null);
  const step = useTimeline([400, 2000, 2700, 3000]);
  return (
    <div ref={root} className="relative h-full w-full">
      <div className="absolute left-3 top-1 w-[300px]">
        <ChatFrame sendRef={send} input={step >= 3 ? undefined : step >= 1 ? <Typewriter text={QUESTION} speed={30} /> : undefined}>
          <AIBubble>Hi Tendai. Ask me anything.</AIBubble>
          {step >= 3 && <UserBubble>{QUESTION}</UserBubble>}
          {step >= 4 && <AIBubble thinking />}
        </ChatFrame>
      </div>
      <DemoCursor root={root} target={step >= 2 ? send : null} clicks={step >= 3 ? 1 : 0} />
      <Mascot mood="wave" className="bottom-2 right-3 h-24 w-24" />
    </div>
  );
}

export function ContextScene() {
  const pills = [
    { t: 'Accounts Clerk', x: 8, y: 30, d: 300 },
    { t: 'Finance & banking', x: 312, y: 18, d: 650 },
    { t: 'Lesson: verifying outputs', x: 290, y: 150, d: 1000 },
    { t: 'Readiness 64%', x: 6, y: 170, d: 1350 },
  ];
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="w-[230px]">
        <ChatFrame>
          <UserBubble>{QUESTION}</UserBubble>
          <AIBubble thinking />
        </ChatFrame>
      </div>
      {pills.map((p, i) => (
        <div key={p.t} className="absolute" style={{ left: p.x, top: p.y }}>
          <Ghost delay={p.d}>
            <div className="animate-float" style={{ animationDelay: `${i * 0.6}s`, animationDuration: `${5 + i}s` }}>
              <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-card', i % 2 ? 'border-ink-950 bg-lilac-200 text-ink-950' : 'border-ink-950/15 bg-paper text-ink-800')}>
                <Sparkle className="h-3 w-3" color={i % 2 ? '#1a1a1a' : '#ffa946'} />
                {p.t}
              </span>
            </div>
          </Ghost>
        </div>
      ))}
    </div>
  );
}

export function AnswerScene() {
  const step = useTimeline([2400]);
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-1 w-[312px]">
        <ChatFrame>
          <UserBubble>{QUESTION}</UserBubble>
          <Ghost className="flex items-end gap-1.5">
            <TutorAvatar />
            <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-ink-950/10 bg-sand-200/60 px-2.5 py-1.5 text-[11.5px] leading-snug text-ink-800">
              <GhostText startOnView={false} delay={200} stagger={85} text="Re-add the totals yourself, then spot-check *three lines* against the ledger." accentClassName="font-display italic text-[13px]" />
            </div>
          </Ghost>
          {step >= 1 && (
            <div className="flex animate-ghost-in gap-1 pl-8">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 ring-1 ring-inset ring-brand-800/15">Tailored for an Accounts Clerk</span>
            </div>
          )}
        </ChatFrame>
      </div>
      <Mascot mood="happy" className="bottom-3 right-3 h-24 w-24" />
    </div>
  );
}

export function TestScene() {
  const root = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const step = useTimeline([500, 1250, 1500, 2400, 3500, 4200]);
  return (
    <div ref={root} className="relative h-full w-full">
      <div className="absolute left-3 top-1 w-[312px]">
        <ChatFrame
          chips={
            <>
              <span ref={chip} className={cn('whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition-colors', step >= 2 ? 'border-ink-950 bg-ink-950 text-canvas' : 'border-ink-950/15 bg-paper')}>
                Test my understanding
              </span>
              <span className="whitespace-nowrap rounded-full border border-ink-950/15 bg-paper px-2 py-0.5 text-[10.5px] font-semibold">Give me an example</span>
            </>
          }
        >
          {step < 2 && <AIBubble>Ready when you are.</AIBubble>}
          {step >= 2 && <UserBubble>Test my understanding</UserBubble>}
          {step === 3 && <AIBubble thinking />}
          {step >= 4 && (
            <AIBubble>
              AI says spending fell 12%. What do you check first?
            </AIBubble>
          )}
          {step >= 5 && <UserBubble>The source figures in the ledger</UserBubble>}
          {step >= 6 && (
            <AIBubble>
              <span className="font-bold text-brand-800">Exactly right.</span>
            </AIBubble>
          )}
        </ChatFrame>
      </div>
      <DemoCursor root={root} target={step >= 1 ? chip : null} clicks={step >= 2 ? 1 : 0} idle={{ x: 0.5, y: 0.95 }} />
      <Mascot mood={step >= 6 ? 'happy' : 'thinking'} className="bottom-2 right-3 h-24 w-24" />
      {step >= 6 && <SparkleBurst className="right-14 top-16" count={10} radius={60} />}
    </div>
  );
}

/* ════════════════════════ Certification ════════════════════════ */

export function RequirementsScene() {
  const step = useTimeline([700, 1400, 2100]);
  const rows: { label: string; hint: string; icon: ReactNode }[] = [
    { label: 'Modules', hint: '6 / 6', icon: <BookCheck className="h-3.5 w-3.5" /> },
    { label: 'Practicals', hint: '3 passed', icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
    { label: 'Final assessment', hint: 'Unlocked', icon: <Award className="h-3.5 w-3.5" /> },
    { label: 'Capstone', hint: 'Next', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  ];
  return (
    <div className="relative h-full w-full">
      <Panel className="absolute left-3 top-3 w-[292px] p-3.5">
        <Eyebrow>Certification</Eyebrow>
        <p className="mt-1 font-display text-[21px] leading-[1.1]">
          Road to <em>certified</em>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200">
          <div className="h-full rounded-full bg-brand-800 transition-[width] duration-700" style={{ width: `${Math.min(step, 2) * 25 + 10}%` }} />
        </div>
        <ul className="mt-2.5 space-y-1.5">
          {rows.map((r, i) => {
            const done = i < 2 && step > i;
            const unlocked = i === 2 && step >= 3;
            return (
              <Ghost key={r.label} delay={100 + i * 120}>
                <li className={cn('flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors duration-500', unlocked ? 'border-ink-950 bg-lilac-100' : 'border-ink-950/10 bg-paper')}>
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors duration-300', done ? 'bg-brand-800 text-canvas' : unlocked ? 'bg-gold-400 text-ink-950' : 'bg-sand-200 text-ink-500')}>
                    {done ? <Check key="d" className="tut-pop h-3.5 w-3.5" strokeWidth={3} /> : i === 3 ? <Lock className="h-3 w-3" /> : r.icon}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[12px] font-semibold">{r.label}</span>
                    <span className="block text-[10px] text-ink-500">{r.hint}</span>
                  </span>
                  {unlocked && <span className="tut-pop rounded-full bg-ink-950 px-1.5 py-0.5 text-[9px] font-bold uppercase text-canvas">Go</span>}
                </li>
              </Ghost>
            );
          })}
        </ul>
      </Panel>
      <Mascot mood="wave" className="bottom-2 right-4 h-24 w-24" />
      <Speech show={step >= 3} className="right-10 top-12" tail="left">
        Unlocked!
      </Speech>
    </div>
  );
}

export function FinalScene() {
  const step = useTimeline([1700, 2700]);
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-4">
      <Panel className="w-[176px] p-3">
        <Eyebrow>20 questions</Eyebrow>
        <p className="mt-1 font-display text-[17px] leading-tight">
          Final <em>assessment</em>
        </p>
        <div className="mt-2.5 grid grid-cols-5 gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className={cn('tut-pop h-5 rounded-md', [3, 11, 16].includes(i) ? 'bg-clay-300' : 'bg-brand-800')} style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-ink-500">Pass mark 70%</p>
      </Panel>
      <div className="relative w-[150px]">
        {step >= 1 ? (
          <Panel className="flex animate-ghost-in flex-col items-center p-3">
            <ScoreRing value={85} size={96} stroke={9} />
            <p className="mt-1 font-display text-[15px]">
              Your <em>score</em>
            </p>
          </Panel>
        ) : (
          <div className="flex h-[140px] items-center justify-center rounded-2xl border border-dashed border-current opacity-40">
            <TypingDots dot="bg-current" />
          </div>
        )}
        {step >= 2 && (
          <span className="tut-stamp absolute -right-3 -top-3 rounded-lg border-2 border-brand-800 bg-paper px-2 py-0.5 font-condensed text-[20px] uppercase leading-none tracking-wider text-brand-800">Passed</span>
        )}
      </div>
      <Mascot mood={step >= 2 ? 'happy' : 'thinking'} className="bottom-0 left-2 h-16 w-16" />
    </div>
  );
}

export function CapstoneScene() {
  const step = useTimeline([2600]);
  return (
    <div className="relative h-full w-full">
      <Panel className="absolute left-3 top-3 w-[268px] p-3.5">
        <Eyebrow>Workplace capstone</Eyebrow>
        <p className="mb-2 mt-1 font-display text-[18px] leading-tight">
          Weekly <em>stock report</em>
        </p>
        <Rubric
          rows={[
            { label: 'Real problem', score: 19, max: 20 },
            { label: 'Responsible AI', score: 17, max: 20 },
            { label: 'Impact', score: 15, max: 20 },
            { label: 'Human sign-off', score: 9, max: 10 },
          ]}
        />
        {step >= 1 && (
          <span className="tut-stamp absolute -right-4 top-3 rounded-lg border-2 border-clay-600 bg-paper px-2 py-0.5 font-condensed text-[20px] uppercase leading-none tracking-wider text-clay-600">Approved</span>
        )}
      </Panel>
      <Mascot mood={step >= 1 ? 'happy' : 'thinking'} className="bottom-2 right-4 h-24 w-24" />
      <Speech show={step >= 1} className="right-8 top-8" tail="left">
        <em className="font-display text-[14px]">Proven</em>
      </Speech>
    </div>
  );
}

export function VerifyScene() {
  const step = useTimeline([2300]);
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-5">
      <div className="origin-left scale-[0.86]">
        <Certificate />
      </div>
      <Ghost delay={700} className="-ml-10">
        <div className="relative flex h-[196px] w-[118px] flex-col items-center rounded-[22px] border-2 border-ink-950 bg-ink-950 p-1.5 shadow-lift">
          <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-[16px] bg-paper px-2 text-center text-ink-950">
            {step >= 1 ? (
              <div className="animate-ghost-in">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 text-canvas">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </span>
                <p className="mt-1.5 font-display text-[15px] leading-tight">
                  Valid <em>certificate</em>
                </p>
                
              </div>
            ) : (
              <>
                <FauxQR seed="verify" size={70} />
                <span className="tut-scan absolute inset-x-2 h-0.5 rounded-full bg-clay-400 shadow-[0_0_10px_#ff6c4c]" />
                <p className="mt-2 text-[9px] font-semibold text-ink-500">Scanning…</p>
              </>
            )}
          </div>
        </div>
      </Ghost>
      {step >= 1 && <SparkleBurst className="right-[70px] top-1/2" count={12} radius={80} />}
    </div>
  );
}

/* ════════════════════════ Employer ════════════════════════ */

export function InviteScene() {
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLSpanElement>(null);
  const step = useTimeline([1700, 2450, 2800]);
  const emails = ['rudo@example.co.zw', 'tatenda@example.co.zw', 'farai@example.co.zw', '+9 more'];
  return (
    <div ref={root} className="relative h-full w-full">
      <Panel className="absolute left-3 top-4 w-[296px] p-3.5">
        
        <p className="mt-1 font-display text-[21px] leading-[1.1]">
          Invite your <em>team</em>
        </p>
        <div className="mt-2.5 flex min-h-[64px] flex-wrap content-start gap-1 rounded-xl border border-ink-950/15 bg-sand-200/50 p-1.5">
          {emails.map((e, i) => (
            <span key={e} className={cn('tut-fly inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold', i === 3 ? 'bg-ink-950 text-canvas' : 'bg-paper ring-1 ring-ink-950/10')} style={{ animationDelay: `${250 + i * 280}ms` }}>
              {e}
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="rounded-lg border border-ink-950/15 px-2 py-1 text-[11px] font-semibold text-ink-700">Finance department ▾</span>
          <span
            ref={btn}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-colors duration-300',
              step >= 2 ? 'border-brand-800 bg-brand-800 text-canvas' : 'border-ink-950 bg-lilac-200 text-ink-950',
            )}
          >
            {step >= 2 ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={3} /> 12 sent
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" /> Send invites
              </>
            )}
          </span>
        </div>
        {step >= 3 && (
          <div className="mt-2.5 flex animate-ghost-in items-center gap-2">
            <div className="flex -space-x-1.5">
              {['bg-brand-800', 'bg-clay-400', 'bg-gold-400', 'bg-lilac-400'].map((c, i) => (
                <span key={c} className={cn('tut-pop h-5 w-5 rounded-full ring-2 ring-paper', c)} style={{ animationDelay: `${i * 90}ms` }} />
              ))}
            </div>
            <span className="text-[11px] text-ink-500">Joined</span>
          </div>
        )}
      </Panel>
      <DemoCursor root={root} target={step >= 1 ? btn : null} clicks={step >= 2 ? 1 : 0} />
      <Mascot mood="wave" className="bottom-2 right-3 h-24 w-24" />
    </div>
  );
}

const heat = (v: number) => (v < 40 ? '#ff6c4c' : v < 55 ? '#ffa946' : v < 70 ? '#1b8f78' : '#034f46');

export function HeatmapScene() {
  const step = useTimeline([2200]);
  const depts = ['Finance', 'HR', 'Operations', 'Sales', 'IT'];
  const skills = ['Prompt', 'Verify', 'Privacy', 'Data', 'Auto'];
  const data = [
    [72, 64, 58, 76, 44],
    [61, 52, 38, 41, 30],
    [55, 48, 50, 62, 57],
    [68, 45, 42, 49, 36],
    [84, 78, 74, 81, 79],
  ];
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Panel className="relative w-[340px] p-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-[18px] leading-tight">
            Team <em>readiness</em>
          </p>
          <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-semibold text-ink-700">48 people</span>
        </div>
        <div className="mt-2 grid grid-cols-[64px_repeat(5,minmax(0,1fr))] gap-1">
          <span />
          {skills.map((s) => (
            <span key={s} className="text-center text-[9.5px] font-semibold uppercase tracking-wide text-ink-500">
              {s}
            </span>
          ))}
          {depts.map((d, r) => (
            <div key={d} className="contents">
              <span className="self-center truncate text-[11px] font-semibold">{d}</span>
              {data[r].map((v, c) => {
                const hot = r === 1 && c === 2;
                return (
                  <span key={c} className="relative">
                    <span
                      className={cn('tut-pop flex h-6 items-center justify-center rounded-md text-[9.5px] font-bold tabular-nums text-canvas', hot && step >= 1 && 'ring-2 ring-ink-950 ring-offset-1 ring-offset-paper')}
                      style={{ background: heat(v), animationDelay: `${(r + c) * 90}ms` }}
                    >
                      {v}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[9.5px] text-ink-500">
          {[30, 50, 60, 80].map((v, i) => (
            <span key={v} className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm" style={{ background: heat(v) }} />
              {['Low', 'Emerging', 'Ready', 'Strong'][i]}
            </span>
          ))}
        </div>
        {step >= 1 && (
          <div className="absolute left-[150px] top-[118px] z-10 animate-ghost-in rounded-xl border border-ink-950 bg-ink-950 px-2 py-1 text-[10.5px] font-semibold text-canvas shadow-ink-sm">HR · Privacy 38%</div>
        )}
      </Panel>
      <Mascot mood="thinking" className="-top-1 right-1 h-16 w-16" delay={600} />
    </div>
  );
}

export function GapsScene() {
  const rows = [
    { label: 'Data privacy with AI', now: 38, target: 70 },
    { label: 'Verifying AI output', now: 52, target: 75 },
    { label: 'Workflow automation', now: 44, target: 60 },
    { label: 'Prompting', now: 66, target: 75 },
  ];
  return (
    <div className="relative h-full w-full">
      <Panel className="absolute left-3 top-4 w-[300px] p-3.5">
        
        <p className="mt-1 font-display text-[20px] leading-[1.1]">
          Skills <em>gaps</em>
        </p>
        <div className="mt-3 space-y-2.5">
          {rows.map((r, i) => (
            <Ghost key={r.label} delay={200 + i * 200}>
              <div className="flex items-center justify-between text-[11.5px] font-semibold">
                <span>{r.label}</span>
                <span className="tut-pop rounded-full bg-clay-100 px-1.5 text-[10px] font-bold tabular-nums text-clay-700" style={{ animationDelay: `${1300 + i * 200}ms` }}>
                  −{r.target - r.now}
                </span>
              </div>
              <div className="relative mt-1 h-2.5 rounded-full bg-sand-200">
                <div className="tut-grow h-full rounded-full bg-brand-800" style={{ width: `${r.now}%`, animationDelay: `${400 + i * 200}ms` }} />
                <span className="absolute -top-1 h-[18px] w-[3px] rounded-full bg-ink-950" style={{ left: `${r.target}%` }} />
              </div>
            </Ghost>
          ))}
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-ink-500">
          <span className="inline-block h-2 w-3 rounded-full bg-brand-800" /> Current
          <span className="ml-2 inline-block h-3 w-[3px] rounded-full bg-ink-950" /> Role target
        </p>
      </Panel>
      <Mascot mood="thinking" className="bottom-3 right-4 h-24 w-24" />
    </div>
  );
}

const ADVICE = 'Enrol HR in “Data privacy with AI”. Biggest gap: 38% → 70%.';

export function AdvisorScene() {
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLSpanElement>(null);
  const step = useTimeline([900, 2900, 3600]);
  return (
    <div ref={root} className="relative h-full w-full">
      <Panel className="absolute left-3 top-4 w-[310px] p-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lilac-200 ring-1 ring-ink-950">
            <GhostMascot mood={step >= 1 ? 'happy' : 'thinking'} className="h-7 w-7" />
          </span>
          <div className="leading-tight">
            <p className="text-[12px] font-bold">AI workforce advisor</p>
            
          </div>
          <Sparkles className="ml-auto h-4 w-4 text-gold-500" />
        </div>
        <div className="mt-2.5 min-h-[86px] rounded-xl rounded-tl-sm border border-ink-950/10 bg-sand-200/60 p-2.5 text-[12.5px] leading-snug text-ink-800">
          {step >= 1 ? <Typewriter text={ADVICE} speed={26} /> : <TypingDots />}
        </div>
        <div className="mt-2.5 flex items-center justify-end gap-2">
          <span className="rounded-lg px-2 py-1 text-[11.5px] font-semibold text-ink-500">Dismiss</span>
          <span
            ref={btn}
            className={cn('inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-colors duration-300', step >= 3 ? 'border-brand-800 bg-brand-800 text-canvas' : 'border-ink-950 bg-lilac-200 text-ink-950')}
          >
            {step >= 3 ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={3} /> Assigned to 9
              </>
            ) : (
              'Assign module'
            )}
          </span>
        </div>
      </Panel>
      <DemoCursor root={root} target={step >= 2 ? btn : null} clicks={step >= 3 ? 1 : 0} />
      <Mascot mood={step >= 3 ? 'happy' : 'thinking'} className="bottom-2 right-3 h-24 w-24" />
      {step >= 3 && <SparkleBurst className="left-[270px] top-[170px]" count={10} radius={60} />}
    </div>
  );
}
