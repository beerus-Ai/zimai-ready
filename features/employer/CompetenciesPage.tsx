import { useMemo, useState } from 'react';
import { BookCopy, Info, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import type { EmployerCompetency, Organisation, SkillLevel, WorkforceMember } from '../../types';
import { Badge, Button, Card, CardTitle, Chip, EmptyState, Modal, PageHeader, useToast } from '../../components/ui';
import { SKILLS, skillName } from '../../data/skills';
import { SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { cn, uid } from '../../lib/utils';
import { useApp } from '../../services/store';
import { useWorkforce } from './useWorkforce';
import { competencyCoverage, competencyHeatmap } from './analytics';
import { Heatmap } from './charts';
import { SampleDataBanner } from './components';
import { COMPETENCY_TEMPLATES, competenciesFromTemplate, getTemplate, PRIORITY_META } from './competencyTemplates';

type Draft = Omit<EmployerCompetency, 'id'> & { id?: string };
const EMPTY: Draft = { name: '', description: '', skillIds: [], requiredLevel: 2, priority: 'important' };
const PRIORITIES: EmployerCompetency['priority'][] = ['critical', 'important', 'desirable'];

export default function CompetenciesPage() {
  const { organisation, saveOrganisation } = useApp();
  const { members } = useWorkforce();
  const toast = useToast();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [removing, setRemoving] = useState<EmployerCompetency | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!organisation) return <EmptyState title="Set up your organisation first" action={<Button to="/employer/onboarding">Start employer assessment</Button>} />;
  const org = organisation;
  const comps = org.requiredCompetencies;

  const persist = async (next: EmployerCompetency[], message: string) => {
    setSaving(true);
    try {
      await saveOrganisation({ ...org, requiredCompetencies: next });
      toast.success(message);
      return true;
    } catch {
      toast.error('Could not save', 'Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={org.name}
        title="Required AI competencies"
        description={`Define what “AI ready” means for ${org.name}. Each competency is measured through mapped platform skills and drives Employer AI Ready certification.`}
        actions={
          <>
            <Button variant="outline" icon={<BookCopy className="h-4 w-4" />} onClick={() => setTemplateOpen(true)}>
              Load industry template
            </Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing({ ...EMPTY })}>
              Add competency
            </Button>
          </>
        }
      />
      <SampleDataBanner organisation={org} />

      <Card className="mb-4 bg-gradient-to-br from-white to-brand-50/40">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Info className="h-5 w-5" />
          </span>
          <div className="text-sm leading-relaxed text-slate-600">
            <p>
              <strong className="text-ink-950">How it works:</strong> an employee meets a competency when the average of its mapped skills reaches the required level (
              {SKILL_LEVEL_LABELS[1]} · {SKILL_LEVEL_LABELS[2]} · {SKILL_LEVEL_LABELS[3]}).
            </p>
            <p className="mt-1">
              <strong className="text-ink-950">Employer AI Ready</strong> requires Domain AI Capable or above <em>plus</em> every <strong>critical</strong> and <strong>important</strong> competency. Desirable competencies are tracked but do not block certification.
            </p>
          </div>
        </div>
      </Card>

      {comps.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6" />}
          title="No competencies defined yet"
          description="Start from an industry template or add your own."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setTemplateOpen(true)}>Load industry template</Button>
              <Button variant="outline" onClick={() => setEditing({ ...EMPTY })}>
                Add competency
              </Button>
            </div>
          }
        />
      ) : (
        <CompetencyList org={org} members={members} onEdit={(c) => setEditing({ ...c })} onRemove={setRemoving} />
      )}

      {comps.length > 0 && members.length > 0 && <DepartmentComparison org={org} members={members} />}

      <CompetencyEditor
        draft={editing}
        saving={saving}
        existing={comps}
        onClose={() => setEditing(null)}
        onSave={async (d) => {
          const next = d.id ? comps.map((c) => (c.id === d.id ? ({ ...d, id: d.id } as EmployerCompetency) : c)) : [...comps, { ...d, id: `comp-${uid()}` } as EmployerCompetency];
          if (await persist(next, d.id ? 'Competency updated' : 'Competency added')) setEditing(null);
        }}
      />

      <Modal
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title="Remove competency?"
        description={removing ? `“${removing.name}” will no longer count towards Employer AI Ready certification.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={saving}
              onClick={async () => {
                if (!removing) return;
                if (await persist(comps.filter((c) => c.id !== removing.id), 'Competency removed')) setRemoving(null);
              }}
            >
              Remove
            </Button>
          </>
        }
      />

      <TemplateModal
        open={templateOpen}
        industryId={org.industryId}
        saving={saving}
        onClose={() => setTemplateOpen(false)}
        onApply={async (industryId, mode) => {
          const tpl = competenciesFromTemplate(industryId);
          const next = mode === 'replace' ? tpl : [...comps, ...tpl.filter((t) => !comps.some((c) => c.name.toLowerCase() === t.name.toLowerCase()))];
          if (await persist(next, mode === 'replace' ? 'Template applied' : 'Missing competencies added')) setTemplateOpen(false);
        }}
      />
    </div>
  );
}

function CompetencyList({ org, members, onEdit, onRemove }: { org: Organisation; members: WorkforceMember[]; onEdit: (c: EmployerCompetency) => void; onRemove: (c: EmployerCompetency) => void }) {
  const coverage = useMemo(() => new Map(competencyCoverage(members, org.requiredCompetencies).map((c) => [c.competency.id, c])), [members, org]);
  const sorted = [...org.requiredCompetencies].sort((a, b) => PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {sorted.map((c) => {
        const cov = coverage.get(c.id);
        return (
          <Card key={c.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-ink-950">{c.name}</h3>
                  <Badge tone={PRIORITY_META[c.priority].tone}>{PRIORITY_META[c.priority].label}</Badge>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.description}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => onEdit(c)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink-900" aria-label={`Edit ${c.name}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onRemove(c)} className="rounded-lg p-2 text-slate-400 hover:bg-clay-50 hover:text-clay-600" aria-label={`Remove ${c.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.skillIds.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {skillName(s)}
                </span>
              ))}
            </div>
            <div className="mt-auto pt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Required: {SKILL_LEVEL_LABELS[c.requiredLevel]}</span>
                {cov && (
                  <span className="font-bold tabular-nums text-ink-950">
                    {cov.pct}% meet it <span className="font-medium text-slate-400">({cov.met}/{members.length})</span>
                  </span>
                )}
              </div>
              {cov && (
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${cov.pct}%`, background: cov.pct >= 60 ? '#0a8a5f' : cov.pct >= 40 ? '#e0a400' : '#e8590c' }} />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function DepartmentComparison({ org, members }: { org: Organisation; members: WorkforceMember[] }) {
  const heat = useMemo(() => competencyHeatmap(members, org), [members, org]);
  const overall = useMemo(() => competencyCoverage(members, org.requiredCompetencies), [members, org]);
  return (
    <Card className="mt-4">
      <CardTitle title="Workforce vs your framework" subtitle="Share of employees meeting each competency — overall and by department" />
      <Heatmap
        rows={[{ id: '__all', label: 'All employees', sub: `${members.length} employees` }, ...heat.rows.map((r) => ({ id: r.id, label: r.label, sub: `${r.count} employees` }))]}
        cols={heat.cols.map((c) => ({ id: c.id, label: c.label, sub: PRIORITY_META[c.priority].label }))}
        values={[overall.map((o) => o.pct), ...heat.values]}
      />
    </Card>
  );
}

function validate(d: Draft, existing: EmployerCompetency[]): Record<string, string> {
  const e: Record<string, string> = {};
  if (d.name.trim().length < 3) e.name = 'Give the competency a name (at least 3 characters).';
  else if (d.name.trim().length > 60) e.name = 'Keep the name under 60 characters.';
  else if (existing.some((c) => c.id !== d.id && c.name.trim().toLowerCase() === d.name.trim().toLowerCase())) e.name = 'A competency with this name already exists.';
  if (d.description.trim().length < 10) e.description = 'Describe what the competency looks like in practice (at least 10 characters).';
  if (!d.skillIds.length) e.skills = 'Map at least one platform skill so the competency can be measured.';
  if (d.skillIds.length > 4) e.skills = 'Map no more than 4 skills.';
  return e;
}

function CompetencyEditor({ draft, existing, saving, onClose, onSave }: { draft: Draft | null; existing: EmployerCompetency[]; saving: boolean; onClose: () => void; onSave: (d: Draft) => void }) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [lastId, setLastId] = useState<string | undefined | null>(null);
  if (draft && lastId !== (draft.id ?? '__new')) {
    setD(draft);
    setTouched(false);
    setLastId(draft.id ?? '__new');
  }
  if (!draft && lastId !== null) setLastId(null);
  const errors = validate(d, existing);
  const show = (k: string) => touched && errors[k];
  const toggleSkill = (id: string) => setD((x) => ({ ...x, skillIds: x.skillIds.includes(id) ? x.skillIds.filter((s) => s !== id) : x.skillIds.length >= 4 ? x.skillIds : [...x.skillIds, id] }));
  return (
    <Modal
      open={!!draft}
      onClose={onClose}
      size="lg"
      title={draft?.id ? 'Edit competency' : 'Add competency'}
      description="Competencies are measured through the platform skills you map to them."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={() => {
              setTouched(true);
              if (!Object.keys(errors).length) onSave({ ...d, name: d.name.trim(), description: d.description.trim() });
            }}
          >
            Save competency
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-950">Name</span>
          <input
            value={d.name}
            onChange={(e) => setD({ ...d, name: e.target.value })}
            placeholder="e.g. Fraud Detection Awareness"
            maxLength={70}
            className={cn('h-11 w-full rounded-xl border px-3 text-sm focus:outline-none focus:ring-2', show('name') ? 'border-clay-400 focus:ring-clay-200' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200')}
            aria-invalid={!!show('name')}
          />
          {show('name') && <span className="mt-1 block text-xs text-clay-700">{errors.name}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-950">Description</span>
          <textarea
            value={d.description}
            onChange={(e) => setD({ ...d, description: e.target.value })}
            rows={3}
            maxLength={280}
            placeholder="What does this competency look like in practice?"
            className={cn('w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2', show('description') ? 'border-clay-400 focus:ring-clay-200' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-200')}
            aria-invalid={!!show('description')}
          />
          {show('description') && <span className="mt-1 block text-xs text-clay-700">{errors.description}</span>}
        </label>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-950">
            Mapped skills <span className="font-normal text-slate-500">({d.skillIds.length}/4)</span>
          </p>
          <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
            {SKILLS.filter((s) => !s.id.startsWith('domain-') || d.skillIds.includes(s.id)).map((s) => (
              <Chip key={s.id} selected={d.skillIds.includes(s.id)} onClick={() => toggleSkill(s.id)} disabled={!d.skillIds.includes(s.id) && d.skillIds.length >= 4} className="py-1.5 text-[13px]">
                {s.name}
              </Chip>
            ))}
          </div>
          {show('skills') && <span className="mt-1 block text-xs text-clay-700">{errors.skills}</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink-950">Required level</legend>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {([1, 2, 3] as SkillLevel[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setD({ ...d, requiredLevel: l })}
                  aria-pressed={d.requiredLevel === l}
                  className={cn('rounded-lg px-2 py-2 text-xs font-semibold transition', d.requiredLevel === l ? 'bg-white text-ink-950 shadow-sm' : 'text-slate-500 hover:text-ink-900')}
                >
                  {l} · {SKILL_LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink-950">Priority</legend>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setD({ ...d, priority: p })}
                  aria-pressed={d.priority === p}
                  className={cn('rounded-lg px-2 py-2 text-xs font-semibold transition', d.priority === p ? 'bg-white text-ink-950 shadow-sm' : 'text-slate-500 hover:text-ink-900')}
                >
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </Modal>
  );
}

function TemplateModal({ open, industryId, saving, onClose, onApply }: { open: boolean; industryId: string; saving: boolean; onClose: () => void; onApply: (industryId: string, mode: 'replace' | 'merge') => void }) {
  const [choice, setChoice] = useState(getTemplate(industryId).id);
  const tpl = getTemplate(choice);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Load an industry template"
      description="Start from a proven set of AI competencies for your sector, then tailor it."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" loading={saving} onClick={() => onApply(choice, 'merge')}>
            Add missing only
          </Button>
          <Button loading={saving} onClick={() => onApply(choice, 'replace')}>
            Replace framework
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-950">Industry</span>
        <select value={choice} onChange={(e) => setChoice(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200">
          {COMPETENCY_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <ul className="mt-4 space-y-2">
        {tpl.competencies.map(([name, description, skillIds, level, priority]) => (
          <li key={name} className="rounded-xl border border-slate-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-ink-950">{name}</p>
              <Badge tone={PRIORITY_META[priority].tone}>{PRIORITY_META[priority].label}</Badge>
              <span className="text-xs text-slate-500">needs {SKILL_LEVEL_LABELS[level]}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
            <p className="mt-1 text-[11px] text-slate-400">Measured by: {skillIds.map(skillName).join(', ')}</p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
