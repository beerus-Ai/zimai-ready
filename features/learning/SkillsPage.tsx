import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CircleCheck, ClipboardCheck, FlaskConical, Info, Layers, Radar, Rocket, ShieldCheck } from 'lucide-react';
import type { ActivitySubmission, AssessmentResult, EmployeeProgress, SkillCategory, SkillLevel } from '../../types';
import { Badge, Button, Card, CardTitle, Chip, EmptyState, Icon, Modal, PageHeader, ProgressBar, Tabs } from '../../components/ui';
import { useApp } from '../../services/store';
import { SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { getSkill, skillName } from '../../data/skills';
import { moduleTitle } from '../../data/catalog';
import { getModuleContent } from '../../data/content';
import { cn, formatDate } from '../../lib/utils';
import { bestSubmissions, CATEGORY_LABELS, CATEGORY_ORDER, levelCounts, modulesTeaching, SKILL_LEVELS, skillCategory, trackedSkillLevels } from '../dashboard/stats';
import { LevelPill, LevelPips } from '../dashboard/widgets';

const LEVEL_DESCRIPTIONS: Record<SkillLevel, string> = {
  0: 'Not yet demonstrated. Covered by modules on or beyond your pathway.',
  1: 'Early evidence — prior experience, or lessons under way.',
  2: 'Demonstrated by completing modules, lesson checks and practical activities.',
  3: 'Verified through certification — the final knowledge assessment and practical capstone.',
};

type LevelTab = '0' | '1' | '2' | '3';

/* ───────────────────────────── Radar chart (custom SVG) ───────────────────────────── */

function CategoryRadar({ data }: { data: { label: string; value: number }[] }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(1), 120);
    return () => clearTimeout(t);
  }, []);
  const cx = 160;
  const cy = 150;
  const R = 104;
  const n = data.length;
  const pt = (i: number, r: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const poly = (r: (i: number) => number) => data.map((_, i) => pt(i, r(i)).map((v) => v.toFixed(1)).join(',')).join(' ');
  return (
    <svg viewBox="-50 -6 420 312" className="mx-auto h-auto w-full max-w-[400px] overflow-visible" role="img" aria-label="Average skill level by category">
      {[1, 2, 3].map((l) => (
        <polygon key={l} points={poly(() => (R * l) / 3)} fill={l === 3 ? '#f8fafc' : 'none'} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1} />;
      })}
      <g style={{ transform: `scale(${shown})`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 1s cubic-bezier(.2,.8,.2,1)' }}>
        <polygon points={poly((i) => Math.max(0.06, data[i].value / 3) * R)} fill="rgba(21,174,124,0.18)" stroke="#0a8a5f" strokeWidth={2} strokeLinejoin="round" />
        {data.map((d, i) => {
          const [x, y] = pt(i, Math.max(0.06, d.value / 3) * R);
          const lvl = Math.round(d.value) as SkillLevel;
          return <circle key={i} cx={x} cy={y} r={4.5} fill="#fff" stroke={SKILL_LEVEL_COLORS[lvl].hex} strokeWidth={2.5} />;
        })}
      </g>
      {data.map((d, i) => {
        const [x, y] = pt(i, R + 20);
        const cos = Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / n);
        const anchor = Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end';
        return (
          <text key={d.label} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-slate-600" style={{ fontSize: 11, fontWeight: 600 }}>
            {d.label}
          </text>
        );
      })}
      {[1, 2, 3].map((l) => (
        <text key={l} x={cx + 4} y={cy - (R * l) / 3 + 3} className="fill-slate-400" style={{ fontSize: 9, fontWeight: 600 }}>
          {l}
        </text>
      ))}
    </svg>
  );
}

/* ───────────────────────────── Skill tile ───────────────────────────── */

function SkillTile({ skillId, level, onOpen }: { skillId: string; level: SkillLevel; onOpen: () => void }) {
  const c = SKILL_LEVEL_COLORS[level];
  const cat = skillCategory(skillId);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn('group w-full rounded-xl border border-transparent p-3 text-left transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-lift active:scale-[0.99]', c.bg)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-snug text-ink-950">{skillName(skillId)}</span>
        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={cn('text-[11px] font-semibold', c.text)}>{CATEGORY_LABELS[cat]}</span>
        <LevelPips level={level} />
      </div>
    </button>
  );
}

function LevelColumn({ level, ids, levels, onOpen }: { level: SkillLevel; ids: string[]; levels: Record<string, SkillLevel>; onOpen: (id: string) => void }) {
  const c = SKILL_LEVEL_COLORS[level];
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-card" style={{ borderTop: `4px solid ${c.hex}` }}>
      <div className="flex items-center justify-between px-1 pb-3 pt-1">
        <span className={cn('flex items-center gap-2 text-xs font-bold uppercase tracking-wider', c.text)}>
          <span className={cn('h-2 w-2 rounded-full', c.dot)} />
          {SKILL_LEVEL_LABELS[level]}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600">{ids.length}</span>
      </div>
      <div className="space-y-2">
        {ids.map((id) => (
          <SkillTile key={id} skillId={id} level={levels[id]} onOpen={() => onOpen(id)} />
        ))}
        {!ids.length && <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">No skills at this level{level === 3 ? ' yet — earned through certification' : ''}</p>}
      </div>
    </div>
  );
}

/* ───────────────────────────── Skill detail modal ───────────────────────────── */

function SkillDetail({ skillId, level, progress, submissions, results }: { skillId: string; level: SkillLevel; progress: EmployeeProgress; submissions: ActivitySubmission[]; results: AssessmentResult[] }) {
  const skill = getSkill(skillId);
  const teaching = modulesTeaching(skillId);
  const teachingIds = new Set(teaching.map((m) => m.id));
  const inPath = new Set(progress.path.map((p) => p.moduleId));
  const status = (id: string) => progress.modules[id]?.status ?? 'not-started';

  const completed = teaching.filter((m) => status(m.id) === 'completed');
  const subs = bestSubmissions(submissions.filter((s) => teachingIds.has(s.moduleId) || getModuleContent(s.moduleId)?.activity?.skillIds.includes(skillId)));
  const levelUp = teaching
    .filter((m) => status(m.id) !== 'completed')
    .sort((a, b) => Number(inPath.has(b.id)) - Number(inPath.has(a.id)) || Number(b.kind === 'core') - Number(a.kind === 'core') || Number(b.domainId === progress.domainId) - Number(a.domainId === progress.domainId))
    .slice(0, 4);
  const hasEvidence = completed.length + subs.length + results.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <LevelPill level={level} />
          <Badge>{CATEGORY_LABELS[skillCategory(skillId)]}</Badge>
          {teaching.some((m) => inPath.has(m.id)) && <Badge tone="brand">On your pathway</Badge>}
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{skill?.description ?? 'A skill tracked on your learning pathway.'}</p>
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {SKILL_LEVELS.map((l) => (
            <div key={l} className="text-center">
              <div className="h-2 rounded-full" style={{ background: l <= level ? SKILL_LEVEL_COLORS[level].hex : '#e2e8f0' }} />
              <p className={cn('mt-1.5 text-[10px] font-bold uppercase leading-tight tracking-wide', l === level ? SKILL_LEVEL_COLORS[l].text : 'text-slate-400')}>{SKILL_LEVEL_LABELS[l]}</p>
            </div>
          ))}
        </div>
      </div>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Evidence</h3>
        {!hasEvidence ? (
          <p className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 text-sm text-slate-500">
            No evidence recorded yet. {level === 1 ? 'Your current level reflects your prior experience — ' : ''}Complete a module that teaches this skill to demonstrate it.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {completed.map((m) => {
              const mp = progress.modules[m.id];
              const quiz = mp?.quizTotal ? Math.round((mp.quizCorrect / mp.quizTotal) * 100) : null;
              return (
                <li key={m.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <CircleCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-950">{moduleTitle(m, progress.domainId)}</p>
                    <p className="text-xs text-slate-500">
                      Module completed{mp?.completedAt ? ` · ${formatDate(mp.completedAt)}` : ''}
                      {quiz != null ? ` · lesson checks ${quiz}%` : ''}
                    </p>
                  </div>
                </li>
              );
            })}
            {subs.map((s) => (
              <li key={s.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                  <FlaskConical className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-950">{getModuleContent(s.moduleId)?.activity?.title ?? `${moduleTitle(s.moduleId, progress.domainId)} practical`}</p>
                  <p className="line-clamp-2 text-xs text-slate-500">{s.feedback.overall}</p>
                </div>
                <span className="shrink-0 text-sm font-extrabold tabular-nums text-ink-950">{s.feedback.score}%</span>
              </li>
            ))}
            {results.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-gold-700">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-950">{r.kind === 'capstone' ? 'Practical capstone' : 'Final knowledge assessment'}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(r.createdAt)} · {r.passed ? 'Passed' : 'Not yet passed'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-extrabold tabular-nums text-ink-950">{r.score}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">How to level up</h3>
        {levelUp.length ? (
          <ul className="mt-2 space-y-2">
            {levelUp.map((m) => (
              <li key={m.id}>
                <Link to={`/app/learning/${m.id}`} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand-300 hover:bg-brand-50/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-brand-100 group-hover:text-brand-700">
                    <Icon name={m.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-950">{moduleTitle(m, progress.domainId)}</span>
                    <span className="block text-xs text-slate-500">
                      {m.estimatedMinutes} min · {status(m.id) === 'in-progress' ? 'In progress' : inPath.has(m.id) ? 'On your pathway' : 'Optional — from the catalogue'}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            {teaching.length ? 'You have completed every module that teaches this skill.' : 'This skill is developed through your practical activities and assessments.'}
            {level < 2 ? ' Submit practical activities to strengthen your evidence.' : ''}
          </p>
        )}
        <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-brand-50/70 p-3 text-sm text-brand-900 ring-1 ring-inset ring-brand-100">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
          <p>
            <span className="font-semibold">AI Ready (level 3) is awarded through certification.</span> Pass the final knowledge assessment and practical capstone to have this skill verified.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

export default function SkillsPage() {
  const { progress, submissions, results } = useApp();
  const [category, setCategory] = useState<SkillCategory | 'all'>('all');
  const [tab, setTab] = useState<LevelTab>('0');
  const [selected, setSelected] = useState<string | null>(null);

  const levels = useMemo(() => trackedSkillLevels(progress), [progress]);
  const ids = useMemo(() => Object.keys(levels).sort((a, b) => skillName(a).localeCompare(skillName(b))), [levels]);
  const counts = useMemo(() => levelCounts(levels), [levels]);
  const categories = useMemo(() => CATEGORY_ORDER.filter((c) => ids.some((id) => skillCategory(id) === c)), [ids]);
  const filtered = category === 'all' ? ids : ids.filter((id) => skillCategory(id) === category);
  const byLevel = SKILL_LEVELS.map((l) => filtered.filter((id) => levels[id] === l));
  const categoryAverages = categories.map((c) => {
    const inCat = ids.filter((id) => skillCategory(id) === c);
    return { category: c, label: CATEGORY_LABELS[c], value: inCat.reduce((a, id) => a + levels[id], 0) / Math.max(1, inCat.length), count: inCat.length };
  });

  // Open the first non-empty level tab on mobile.
  useEffect(() => {
    const first = SKILL_LEVELS.find((l) => counts[l] > 0);
    if (first != null) setTab(String(first) as LevelTab);
  }, [counts]);

  const header = <PageHeader eyebrow="Learn" title="Skills map" description="Every skill on your pathway and the evidence behind it. Levels rise only through demonstrated learning — never from self-rating alone." />;

  if (!progress)
    return (
      <div className="animate-fade-up">
        {header}
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="Your skills map starts with your learning path"
          description="Once your personalised path is created, every skill it develops is tracked here — from Needs development through to AI Ready."
          action={
            <Button to="/app/learning" icon={<Rocket className="h-4 w-4" />}>
              Start my learning path
            </Button>
          }
        />
      </div>
    );

  const competentPct = ids.length ? Math.round(((counts[2] + counts[3]) / ids.length) * 100) : 0;
  const teachingCount = selected ? modulesTeaching(selected).length : 0;

  return (
    <div className="animate-fade-up">
      {header}

      {/* Summary counts */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {SKILL_LEVELS.map((l) => {
          const c = SKILL_LEVEL_COLORS[l];
          return (
            <Card key={l} className="relative overflow-hidden !p-4 sm:!p-5">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: c.hex }} />
              <p className={cn('flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide', c.text)}>
                <span className={cn('h-2 w-2 rounded-full', c.dot)} />
                {SKILL_LEVEL_LABELS[l]}
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink-950 tabular-nums">{counts[l]}</p>
              <p className="text-xs text-slate-500">skill{counts[l] === 1 ? '' : 's'}</p>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
            All skills <span className="opacity-70">{ids.length}</span>
          </Chip>
          {categories.map((c) => (
            <Chip key={c} selected={category === c} onClick={() => setCategory(c)} className="whitespace-nowrap">
              {CATEGORY_LABELS[c]} <span className="opacity-70">{ids.filter((id) => skillCategory(id) === c).length}</span>
            </Chip>
          ))}
        </div>
        <p className="shrink-0 text-sm font-semibold text-slate-500">
          <span className="text-ink-950">{competentPct}%</span> at Competent or above
        </p>
      </div>

      {/* Board — mobile tabs */}
      <div className="mt-4 md:hidden">
        <Tabs<LevelTab> tabs={SKILL_LEVELS.map((l) => ({ id: String(l) as LevelTab, label: SKILL_LEVEL_LABELS[l], count: byLevel[l].length }))} value={tab} onChange={setTab} />
        <div className="mt-3">
          <LevelColumn level={Number(tab) as SkillLevel} ids={byLevel[Number(tab)]} levels={levels} onOpen={setSelected} />
        </div>
      </div>

      {/* Board — tablet & desktop columns */}
      <div className="mt-4 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {SKILL_LEVELS.map((l) => (
          <LevelColumn key={l} level={l} ids={byLevel[l]} levels={levels} onOpen={setSelected} />
        ))}
      </div>

      {/* Chart + legend */}
      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle icon={<Radar className="h-5 w-5" />} title="Skill profile by category" subtitle="Average level per category (0 – 3)" />
          <div className="grid items-center gap-6 sm:grid-cols-2">
            {categoryAverages.length >= 3 ? (
              <CategoryRadar data={categoryAverages.map((c) => ({ label: c.label, value: c.value }))} />
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">The radar appears once skills span three or more categories.</p>
            )}
            <ul className="space-y-3">
              {categoryAverages.map((c) => {
                const lvl = Math.round(c.value) as SkillLevel;
                return (
                  <li key={c.category}>
                    <button type="button" onClick={() => setCategory(c.category)} className="w-full text-left">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {c.label} <span className="text-xs text-slate-400">({c.count})</span>
                        </span>
                        <span className="font-bold tabular-nums text-ink-950">{c.value.toFixed(1)}</span>
                      </div>
                      <ProgressBar value={(c.value / 3) * 100} color={SKILL_LEVEL_COLORS[lvl].hex} size="xs" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle icon={<Info className="h-5 w-5" />} title="How skill levels work" />
          <ul className="space-y-3">
            {SKILL_LEVELS.map((l) => (
              <li key={l} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white" style={{ background: SKILL_LEVEL_COLORS[l].hex }}>
                  {l}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-950">{SKILL_LEVEL_LABELS[l]}</p>
                  <p className="text-xs leading-relaxed text-slate-500">{LEVEL_DESCRIPTIONS[l]}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p>Levels rise only through demonstrated evidence. Your self-reported starting point is capped at Developing, and AI Ready is awarded only through certification.</p>
          </div>
          <Button to="/app/learning" variant="secondary" className="mt-4" full icon={<BookOpen className="h-4 w-4" />}>
            Continue learning
          </Button>
        </Card>
      </div>

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected ? skillName(selected) : undefined}
        description={selected ? `${CATEGORY_LABELS[skillCategory(selected)]} · ${teachingCount ? `taught in ${teachingCount} module${teachingCount === 1 ? '' : 's'}` : 'developed through practice'}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button to="/app/assessments" variant="outline" icon={<Award className="h-4 w-4" />}>
              Certification
            </Button>
          </>
        }
      >
        {selected && <SkillDetail skillId={selected} level={levels[selected] ?? 0} progress={progress} submissions={submissions} results={results} />}
      </Modal>
    </div>
  );
}
