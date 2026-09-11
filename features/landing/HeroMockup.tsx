import { Bot, Clock, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { ScoreRing } from '../../components/ui';
import { ChevronPattern, LogoMark } from '../../components/brand';

const PRESCRIPTION = [
  { n: 1, title: 'AI Fundamentals for HR', minutes: 20, progress: 60 },
  { n: 2, title: 'Prompt Engineering for HR Professionals', minutes: 25, progress: 0 },
  { n: 3, title: 'AI-Assisted Recruitment', minutes: 25, progress: 0 },
];

/** Floating product mockup shown in the landing hero (illustrative, fictional profile). */
export default function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-16 pt-6 sm:pb-12" aria-label="Illustrative example of an AI Readiness Profile">
      {/* Glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-[48px] bg-gradient-to-tr from-brand-400/35 via-gold-300/25 to-sky-300/25 blur-3xl sm:-inset-10" aria-hidden />

      {/* Main card */}
      <div className="relative animate-float overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-glow backdrop-blur sm:p-6">
        <ChevronPattern className="text-brand-700" opacity={0.05} />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <LogoMark className="h-8 w-8 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-extrabold tracking-tight text-ink-950">Your AI Readiness Profile</p>
                <p className="truncate text-xs text-slate-500">HR Officer · Banking &amp; Finance</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-200/70">
              <Sparkles className="h-3 w-3" /> Gemini
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/80 px-2 py-3.5">
              <ScoreRing value={42} size={96} stroke={9} color="#0a8a5f" />
              <p className="mt-2 text-center text-[12px] font-bold leading-tight text-ink-950">Personal AI Readiness</p>
              <p className="text-[11px] text-slate-500">Developing</p>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/80 px-2 py-3.5">
              <ScoreRing value={71} size={96} stroke={9} color="#f5a800" />
              <p className="mt-2 text-center text-[12px] font-bold leading-tight text-ink-950">Workplace AI Exposure</p>
              <p className="text-[11px] text-slate-500">High role transformation</p>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-50 px-3 py-1 text-xs font-bold text-clay-700 ring-1 ring-inset ring-clay-200/70">
              <Zap className="h-3.5 w-3.5" /> Priority Upskilling Recommended
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">AI Skills Prescription</p>
              <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Clock className="h-3 w-3" /> ~70 min
              </p>
            </div>
            <ul className="space-y-2">
              {PRESCRIPTION.map((p) => (
                <li key={p.n} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-card">
                  <div className="flex items-center gap-2.5">
                    <span className={p.progress ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-extrabold text-white' : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-extrabold text-slate-600'}>
                      {p.n}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-950">{p.title}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{p.minutes} min</span>
                  </div>
                  {p.progress > 0 && (
                    <div className="ml-8 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.progress}%` }} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Floating: reassessment delta */}
      <div className="absolute -right-1 top-0 animate-float sm:-right-8" style={{ animationDelay: '1.4s' }}>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 shadow-lift">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-slate-500">After reassessment</p>
            <p className="text-sm font-extrabold text-ink-950">+18 pts</p>
          </div>
        </div>
      </div>

      {/* Floating: AI Tutor bubble */}
      <div className="absolute -left-1 bottom-0 w-[250px] animate-float sm:-left-10" style={{ animationDelay: '2.2s' }}>
        <div className="rounded-2xl rounded-bl-md bg-ink-950 p-3.5 text-white shadow-lift">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500">
              <Bot className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold">AI Tutor</span>
            <span className="ml-auto flex gap-0.5" aria-hidden>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" style={{ animationDelay: '0.2s' }} />
            </span>
          </div>
          <p className="text-[12.5px] leading-snug text-slate-200">
            Before shortlisting, ask the AI to check your criteria for possible bias — then make the final call yourself.
          </p>
        </div>
      </div>
    </div>
  );
}
