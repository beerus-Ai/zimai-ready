import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Users, X } from 'lucide-react';
import type { Organisation, WorkforceMember, WorkforceStatus } from '../../types';
import { Avatar, Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { readinessLevel, WORKFORCE_STATUS_META } from '../../lib/readiness';
import { average, cn, timeAgo } from '../../lib/utils';
import { skillName } from '../../data/skills';
import { useWorkforce } from './useWorkforce';
import { departmentNames, requiredLevelFor, STATUS_ORDER, statusSplit } from './analytics';
import { StackedBar } from './charts';
import { CertBadge, HeroArt, MemberDetailModal, PrivacyNote, ReadinessCell, SampleDataBanner, StatusBadge, WorkforceGate } from './components';
import { Reveal } from '../../components/motion';
import { TeamIdeas } from '../../components/illustrations';

const PAGE_SIZE = 20;

const READINESS_BANDS = [
  { id: 'AI Beginner', label: 'AI Beginner (0–25%)' },
  { id: 'Developing', label: 'Developing (26–50%)' },
  { id: 'AI Capable', label: 'AI Capable (51–75%)' },
  { id: 'AI Ready', label: 'AI Ready (76–100%)' },
];
const LEARNING_BANDS = [
  { id: 'none', label: 'Not started (< 10%)', test: (v: number) => v < 10 },
  { id: 'early', label: 'Early (10–39%)', test: (v: number) => v >= 10 && v < 40 },
  { id: 'progressing', label: 'Progressing (40–69%)', test: (v: number) => v >= 40 && v < 70 },
  { id: 'advanced', label: 'Advanced (70%+)', test: (v: number) => v >= 70 },
];
const CERT_FILTERS = [
  { id: 'any', label: 'Any certificate' },
  { id: 'none', label: 'Not certified' },
  { id: 'domain', label: 'Domain AI Ready (any level)' },
  { id: 'employer', label: 'Employer AI Ready' },
  { id: 'AI_READY', label: 'Level: AI Ready' },
  { id: 'AI_CAPABLE', label: 'Level: AI Capable' },
  { id: 'AI_AWARE', label: 'Level: AI Aware' },
];
const SORTS = [
  { id: 'gap', label: 'Largest readiness gap' },
  { id: 'readiness-desc', label: 'Readiness (high → low)' },
  { id: 'readiness-asc', label: 'Readiness (low → high)' },
  { id: 'exposure', label: 'AI exposure (high → low)' },
  { id: 'learning', label: 'Learning progress' },
  { id: 'recent', label: 'Recently active' },
  { id: 'name', label: 'Name (A–Z)' },
];

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-10 w-full rounded-xl border bg-paper px-3 text-sm text-ink-900 focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-lilac-200', value ? 'border-ink-950/60 bg-lilac-50' : 'border-ink-950/15')}
      >
        {children}
      </select>
    </label>
  );
}

export default function WorkforcePage() {
  const state = useWorkforce();
  return <WorkforceGate state={state}>{(members, org) => <Workforce org={org} members={members} />}</WorkforceGate>;
}

function Workforce({ org, members }: { org: Organisation; members: WorkforceMember[] }) {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState(params.get('department') ?? '');
  const [role, setRole] = useState('');
  const [band, setBand] = useState('');
  const [learning, setLearning] = useState('');
  const [skill, setSkill] = useState(params.get('skill') ?? '');
  const [cert, setCert] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [sort, setSort] = useState(() => {
    const s = params.get('sort');
    if (s === 'readiness') return 'readiness-desc';
    return s && SORTS.some((x) => x.id === s) ? s : 'gap';
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(!!(params.get('department') || params.get('status') || params.get('skill')));
  const [selected, setSelected] = useState<WorkforceMember | null>(null);

  const departments = useMemo(() => departmentNames(members, org), [members, org]);
  const roles = useMemo(() => [...new Set(members.filter((m) => !department || m.department === department).map((m) => m.role))].sort(), [members, department]);
  const skills = useMemo(() => {
    const ids = new Set<string>();
    members.forEach((m) => Object.keys(m.skillLevels).forEach((s) => ids.add(s)));
    return [...ids].sort((a, b) => skillName(a).localeCompare(skillName(b)));
  }, [members]);

  useEffect(() => setPage(1), [search, department, role, band, learning, skill, cert, status, sort]);
  useEffect(() => {
    if (role && !roles.includes(role)) setRole('');
  }, [roles, role]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const req = skill ? requiredLevelFor(org, skill) : 0;
    const lb = LEARNING_BANDS.find((b) => b.id === learning);
    const out = members.filter((m) => {
      if (q && !`${m.name} ${m.role} ${m.department}`.toLowerCase().includes(q)) return false;
      if (department && m.department !== department) return false;
      if (role && m.role !== role) return false;
      if (band && readinessLevel(m.readiness) !== band) return false;
      if (lb && !lb.test(m.learningProgress)) return false;
      if (skill && (m.skillLevels[skill] ?? 0) >= req) return false;
      if (status && m.status !== status) return false;
      if (cert) {
        const c = m.certification;
        if (cert === 'any' && !c) return false;
        if (cert === 'none' && c) return false;
        if ((cert === 'domain' || cert === 'employer') && c?.type !== cert) return false;
        if (['AI_READY', 'AI_CAPABLE', 'AI_AWARE'].includes(cert) && c?.level !== cert) return false;
      }
      return true;
    });
    const sorters: Record<string, (a: WorkforceMember, b: WorkforceMember) => number> = {
      gap: (a, b) => b.exposure - b.readiness - (a.exposure - a.readiness),
      'readiness-desc': (a, b) => b.readiness - a.readiness,
      'readiness-asc': (a, b) => a.readiness - b.readiness,
      exposure: (a, b) => b.exposure - a.exposure,
      learning: (a, b) => b.learningProgress - a.learningProgress,
      recent: (a, b) => b.lastActive.localeCompare(a.lastActive),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return out.sort(sorters[sort] ?? sorters.gap);
  }, [members, org, search, department, role, band, learning, skill, cert, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const split = statusSplit(filtered);
  const activeCount = [department, role, band, learning, skill, cert, status].filter(Boolean).length;
  const clear = () => {
    setDepartment('');
    setRole('');
    setBand('');
    setLearning('');
    setSkill('');
    setCert('');
    setStatus('');
    setSearch('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={org.name}
        title="Employees"
        description="Find who needs support — and who can lead."
        actions={
          <HeroArt>
            <TeamIdeas className="h-28 w-36 lg:h-32 lg:w-40" animated />
          </HeroArt>
        }
      />
      <SampleDataBanner organisation={org} />

      <Reveal>
      <Card className="mb-6 rounded-3xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="relative block flex-1">
            <span className="sr-only">Search employees</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role or department"
              className="h-11 w-full rounded-full border border-ink-950/15 bg-paper pl-9 pr-4 text-sm focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-lilac-200"
            />
          </label>
          <div className="flex gap-2">
            <label className="block flex-1 sm:w-56">
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 w-full rounded-full border border-ink-950/15 bg-paper px-4 text-sm text-ink-900 focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-lilac-200" aria-label="Sort employees">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
            </label>
            <Button variant={showFilters ? 'secondary' : 'outline'} onClick={() => setShowFilters((s) => !s)} icon={<SlidersHorizontal className="h-4 w-4" />} aria-expanded={showFilters}>
              Filters{activeCount ? ` (${activeCount})` : ''}
            </Button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 grid animate-ghost-in gap-3 border-t border-ink-950/5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Department" value={department} onChange={setDepartment}>
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select label="Role" value={role} onChange={setRole}>
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            <Select label="Readiness band" value={band} onChange={setBand}>
              <option value="">All readiness levels</option>
              {READINESS_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </Select>
            <Select label="Learning progress" value={learning} onChange={setLearning}>
              <option value="">Any progress</option>
              {LEARNING_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </Select>
            <Select label="Skills gap" value={skill} onChange={setSkill}>
              <option value="">Any skill</option>
              {skills.map((s) => (
                <option key={s} value={s}>
                  Below required: {skillName(s)}
                </option>
              ))}
            </Select>
            <Select label="Certification" value={cert} onChange={setCert}>
              <option value="">All employees</option>
              {CERT_FILTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Select label="Priority status" value={status} onChange={setStatus}>
              <option value="">All statuses</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {WORKFORCE_STATUS_META[s].label}
                </option>
              ))}
            </Select>
            <div className="flex items-end">
              <Button variant="ghost" full onClick={clear} disabled={!activeCount && !search} icon={<X className="h-4 w-4" />}>
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </Card>
      </Reveal>

      {/* Filtered summary */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          <strong className="font-display text-xl font-medium text-ink-950">{filtered.length}</strong> of {members.length} employees · average readiness{' '}
          <strong className="font-display text-xl font-medium text-ink-950">{Math.round(average(filtered.map((m) => m.readiness)))}%</strong>
          {skill && (
            <>
              {' '}
              · below the required level in <strong className="text-ink-950">{skillName(skill)}</strong>
            </>
          )}
        </p>
        {filtered.length > 0 && (
          <div className="w-full sm:w-64">
            <StackedBar segments={STATUS_ORDER.map((s) => ({ label: WORKFORCE_STATUS_META[s].label, value: split.counts[s], color: WORKFORCE_STATUS_META[s].hex }))} />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No employees match these filters" description="Try widening your filters or clearing the search." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
      ) : (
        <>
          {/* Desktop table */}
          <Card padded={false} className="hidden animate-ghost-in overflow-hidden rounded-3xl lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink-950/10 bg-sand-200/60 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Employee</th>
                    <th scope="col" className="px-3 py-3">Department</th>
                    <th scope="col" className="px-3 py-3">Readiness</th>
                    <th scope="col" className="px-3 py-3">Exposure</th>
                    <th scope="col" className="px-3 py-3">Learning</th>
                    <th scope="col" className="px-3 py-3">Status</th>
                    <th scope="col" className="px-3 py-3">Certification</th>
                    <th scope="col" className="px-5 py-3 text-right">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-950/5">
                  {rows.map((m) => (
                    <tr key={m.id} className="cursor-pointer transition hover:bg-lilac-50" onClick={() => setSelected(m)}>
                      <td className="px-5 py-3">
                        <button type="button" className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac-400" onClick={(e) => { e.stopPropagation(); setSelected(m); }}>
                          <Avatar name={m.name} size={32} />
                          <span className="min-w-0">
                            <span className="block font-semibold text-ink-950">{m.name}</span>
                            <span className="block text-xs text-slate-500">{m.role}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{m.department}</td>
                      <td className="px-3 py-3"><ReadinessCell value={m.readiness} /></td>
                      <td className="px-3 py-3 tabular-nums text-slate-700">{m.exposure}%</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-sand-200"><div className="h-full rounded-full bg-lilac-500" style={{ width: `${m.learningProgress}%` }} /></div>
                          <span className="tabular-nums text-slate-700">{m.learningProgress}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={m.status as WorkforceStatus} /></td>
                      <td className="px-3 py-3"><CertBadge certification={m.certification} compact /></td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-slate-500">{timeAgo(m.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <ul className="space-y-2.5 lg:hidden">
            {rows.map((m, i) => (
              <li key={m.id} className="animate-ghost-in" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                <button type="button" onClick={() => setSelected(m)} className="w-full rounded-3xl border border-ink-950/10 bg-paper p-4 text-left shadow-card transition hover:border-ink-950 hover:shadow-ink-sm active:scale-[0.99]">
                  <div className="flex items-start gap-3">
                    <Avatar name={m.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-950">{m.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {m.role} · {m.department}
                      </p>
                    </div>
                    <StatusBadge status={m.status} className="shrink-0" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-sand-100 py-1.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-500">Readiness</p>
                      <p className="font-display text-xl font-medium leading-tight tabular-nums text-ink-950">{m.readiness}%</p>
                    </div>
                    <div className="rounded-xl bg-sand-100 py-1.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-500">Exposure</p>
                      <p className="font-display text-xl font-medium leading-tight tabular-nums text-ink-950">{m.exposure}%</p>
                    </div>
                    <div className="rounded-xl bg-sand-100 py-1.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-500">Learning</p>
                      <p className="font-display text-xl font-medium leading-tight tabular-nums text-ink-950">{m.learningProgress}%</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <CertBadge certification={m.certification} />
                    <span className="text-[11px] text-slate-400">Active {timeAgo(m.lastActive)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Pagination">
              <p className="text-xs text-slate-500">
                Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page" icon={<ChevronLeft className="h-4 w-4" />} />
                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pages || Math.abs(p - current) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-400">…</span>}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        aria-current={p === current ? 'page' : undefined}
                        className={cn('h-9 min-w-9 rounded-lg px-2.5 text-sm font-semibold', p === current ? 'bg-ink-950 text-canvas' : 'text-slate-600 hover:bg-sand-200/60')}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <Button size="sm" variant="outline" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page" icon={<ChevronRight className="h-4 w-4" />} />
              </div>
            </nav>
          )}
        </>
      )}

      <PrivacyNote className="mt-10" />
      <MemberDetailModal member={selected} org={org} onClose={() => setSelected(null)} />
    </div>
  );
}
