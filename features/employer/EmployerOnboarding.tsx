import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building, Check, CircleHelp, FlaskConical, Layers, Plus, Rocket, Sparkles, X } from 'lucide-react';
import type { OrgAdoption, Organisation, WorkforceSize } from '../../types';
import { Button, Chip, ErrorState, Icon, LoadingState, OptionCard, useToast } from '../../components/ui';
import { AccentBar, Logo } from '../../components/brand';
import { useApp } from '../../services/store';
import { COLLECTIONS } from '../../services/backend';
import { INDUSTRIES } from '../../data/industries';
import { SKILLS } from '../../data/skills';
import { cn, nowISO, sleep, uid } from '../../lib/utils';
import { generateSampleWorkforce } from '../../data/demo/organisation';
import { assessMaturity } from './maturity';
import { competenciesFromTemplate } from './competencyTemplates';
import { SAMPLE_COUNT_BY_SIZE } from './workforceModel';
import { invalidateWorkforce } from './useWorkforce';

interface Draft {
  name: string;
  industryId: string;
  workforceSize: WorkforceSize | '';
  departments: string[];
  adoptionLevel: OrgAdoption | '';
  departmentsUsingAI: string[];
  toolsIntroduced: string[];
  transformationDepartments: string[];
  desiredSkills: string[];
}

const EMPTY: Draft = { name: '', industryId: '', workforceSize: '', departments: [], adoptionLevel: '', departmentsUsingAI: [], toolsIntroduced: [], transformationDepartments: [], desiredSkills: [] };

const COMMON_DEPARTMENTS = [
  'Finance', 'Human Resources', 'Marketing', 'Sales', 'Operations', 'Customer Service', 'ICT', 'Risk & Compliance', 'Legal', 'Procurement',
  'Administration', 'Engineering', 'Production', 'Logistics', 'Research & Development', 'Executive Management',
];
const COMMON_TOOLS = [
  'Enterprise generative AI assistant', 'Customer service chatbot', 'AI fraud monitoring', 'Document AI / OCR', 'Predictive analytics & forecasting', 'AI-assisted coding tools',
  'Marketing content generation', 'Recruitment screening tools', 'Meeting transcription & summaries', 'Process automation (RPA + AI)', 'Computer vision inspection', 'AI credit scoring',
];
const SIZES: { id: WorkforceSize; label: string; description: string }[] = [
  { id: '1-50', label: '1–50 employees', description: 'Small organisation or start-up' },
  { id: '51-200', label: '51–200 employees', description: 'Growing organisation' },
  { id: '201-500', label: '201–500 employees', description: 'Mid-sized organisation' },
  { id: '501-1000', label: '501–1,000 employees', description: 'Large organisation' },
  { id: '1000+', label: '1,000+ employees', description: 'Enterprise or group' },
];
const ADOPTION: { id: OrgAdoption; label: string; description: string; icon: ReactNode }[] = [
  { id: 'extensive', label: 'Extensive', description: 'AI is embedded in many workflows across the organisation', icon: <Rocket className="h-5 w-5" /> },
  { id: 'partial', label: 'Partial', description: 'Some departments use AI regularly', icon: <Layers className="h-5 w-5" /> },
  { id: 'experimenting', label: 'Experimenting', description: 'Pilots, trials or individual use', icon: <FlaskConical className="h-5 w-5" /> },
  { id: 'not-yet', label: 'Not yet', description: 'No organisational use of AI so far', icon: <Building className="h-5 w-5" /> },
  { id: 'unknown', label: 'Not sure', description: 'We do not have a clear picture yet', icon: <CircleHelp className="h-5 w-5" /> },
];
const MAX_SKILLS = 6;
const SKILL_GROUPS: { label: string; categories: string[] }[] = [
  { label: 'Foundations & tools', categories: ['foundations', 'tools'] },
  { label: 'Data & analytics', categories: ['analytics'] },
  { label: 'Responsible & critical', categories: ['responsible', 'critical'] },
  { label: 'Leadership & specialist', categories: ['leadership', 'domain'] },
];

const fromOrg = (o: Organisation): Draft => ({
  name: o.name,
  industryId: o.industryId,
  workforceSize: o.workforceSize,
  departments: o.departments,
  adoptionLevel: o.adoptionLevel,
  departmentsUsingAI: o.departmentsUsingAI,
  toolsIntroduced: o.toolsIntroduced,
  transformationDepartments: o.transformationDepartments,
  desiredSkills: o.desiredSkills,
});

function AddCustom({ placeholder, onAdd, existing, label }: { placeholder: string; onAdd: (v: string) => void; existing: string[]; label: string }) {
  const [v, setV] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    const t = v.trim().replace(/\s+/g, ' ');
    if (t.length < 2) return setErr('Enter at least 2 characters.');
    if (t.length > 50) return setErr('Keep it under 50 characters.');
    if (existing.some((e) => e.toLowerCase() === t.toLowerCase())) return setErr('Already added.');
    onAdd(t);
    setV('');
    setErr('');
  };
  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-semibold text-ink-950">{label}</label>
      <div className="flex gap-2">
        <input
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            setErr('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <Button variant="outline" onClick={submit} icon={<Plus className="h-4 w-4" />}>
          Add
        </Button>
      </div>
      {err && <p className="mt-1 text-xs text-clay-700">{err}</p>}
    </div>
  );
}

export default function EmployerOnboarding() {
  const { user, organisation, db, saveOrganisation } = useApp();
  const [params] = useSearchParams();
  const edit = params.get('edit') === '1' && !!organisation;
  const navigate = useNavigate();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(() => (organisation ? fromOrg(organisation) : EMPTY));
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<'form' | 'analysing' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggle = (k: 'departments' | 'departmentsUsingAI' | 'toolsIntroduced' | 'transformationDepartments' | 'desiredSkills', v: string, max?: number) =>
    setDraft((d) => {
      const has = d[k].includes(v);
      if (!has && max && d[k].length >= max) return d;
      const next = has ? d[k].filter((x) => x !== v) : [...d[k], v];
      if (k === 'departments' && has) return { ...d, departments: next, departmentsUsingAI: d.departmentsUsingAI.filter((x) => x !== v), transformationDepartments: d.transformationDepartments.filter((x) => x !== v) };
      return { ...d, [k]: next };
    });

  const deptOptions = useMemo(() => [...COMMON_DEPARTMENTS, ...draft.departments.filter((d) => !COMMON_DEPARTMENTS.includes(d))], [draft.departments]);
  const toolOptions = useMemo(() => [...COMMON_TOOLS, ...draft.toolsIntroduced.filter((t) => !COMMON_TOOLS.includes(t))], [draft.toolsIntroduced]);

  const steps: { title: string; subtitle: string; error: () => string | null; body: ReactNode }[] = [
    {
      title: 'What is your organisation called?',
      subtitle: 'We use this on your dashboards and Employer AI Ready certificates.',
      error: () => (draft.name.trim().length < 2 ? 'Enter your organisation’s name (at least 2 characters).' : draft.name.trim().length > 80 ? 'Keep the name under 80 characters.' : null),
      body: (
        <input
          autoFocus
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && next()}
          placeholder="e.g. Highveld Logistics Group"
          maxLength={90}
          className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-lg font-semibold text-ink-950 focus:border-brand-500 focus:outline-none"
          aria-label="Organisation name"
        />
      ),
    },
    {
      title: 'Which industry are you in?',
      subtitle: 'Sets your sector’s AI exposure baseline and competency template.',
      error: () => (draft.industryId ? null : 'Select your industry.'),
      body: (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {INDUSTRIES.map((i) => (
            <OptionCard key={i.id} compact selected={draft.industryId === i.id} onClick={() => set('industryId', i.id)} icon={<Icon name={i.icon} className="h-5 w-5" />} label={i.name} description={i.description} />
          ))}
        </div>
      ),
    },
    {
      title: 'Approximately how many employees?',
      subtitle: 'An approximate figure is fine.',
      error: () => (draft.workforceSize ? null : 'Select your approximate workforce size.'),
      body: (
        <div className="grid gap-2.5">
          {SIZES.map((s) => (
            <OptionCard key={s.id} compact selected={draft.workforceSize === s.id} onClick={() => set('workforceSize', s.id)} label={s.label} description={s.description} />
          ))}
        </div>
      ),
    },
    {
      title: 'Which departments do you have?',
      subtitle: 'Select all that apply, or add your own.',
      error: () => (draft.departments.length < 2 ? 'Select at least 2 departments.' : draft.departments.length > 16 ? 'Select no more than 16 departments.' : null),
      body: (
        <>
          <div className="flex flex-wrap gap-2">
            {deptOptions.map((d) => (
              <Chip key={d} selected={draft.departments.includes(d)} onClick={() => toggle('departments', d)} icon={draft.departments.includes(d) ? <Check className="h-3.5 w-3.5" /> : undefined}>
                {d}
              </Chip>
            ))}
          </div>
          <AddCustom label="Add a custom department" placeholder="e.g. Mining Operations" existing={deptOptions} onAdd={(v) => set('departments', [...draft.departments, v])} />
        </>
      ),
    },
    {
      title: 'What is your current level of AI adoption?',
      subtitle: 'Across the organisation as a whole.',
      error: () => (draft.adoptionLevel ? null : 'Select your current level of AI adoption.'),
      body: (
        <div className="grid gap-2.5">
          {ADOPTION.map((a) => (
            <OptionCard key={a.id} compact selected={draft.adoptionLevel === a.id} onClick={() => set('adoptionLevel', a.id)} icon={a.icon} label={a.label} description={a.description} />
          ))}
        </div>
      ),
    },
    {
      title: 'Which departments currently use AI?',
      subtitle: 'Regular use of AI tools in day-to-day work. Leave empty if none do yet.',
      error: () => null,
      body: (
        <>
          <div className="flex flex-wrap gap-2">
            {draft.departments.map((d) => (
              <Chip key={d} selected={draft.departmentsUsingAI.includes(d)} onClick={() => toggle('departmentsUsingAI', d)} icon={draft.departmentsUsingAI.includes(d) ? <Check className="h-3.5 w-3.5" /> : undefined}>
                {d}
              </Chip>
            ))}
          </div>
          <button type="button" onClick={() => set('departmentsUsingAI', [])} className={cn('mt-4 text-sm font-semibold', draft.departmentsUsingAI.length ? 'text-slate-500 hover:text-ink-900' : 'text-brand-700')}>
            {draft.departmentsUsingAI.length ? 'Clear — none of our departments use AI yet' : '✓ None of our departments use AI yet'}
          </button>
        </>
      ),
    },
    {
      title: 'Which AI tools or technologies are being introduced?',
      subtitle: 'Select any that apply, or add your own. Optional.',
      error: () => (draft.toolsIntroduced.length > 12 ? 'Select no more than 12 tools.' : null),
      body: (
        <>
          <div className="flex flex-wrap gap-2">
            {toolOptions.map((t) => (
              <Chip key={t} selected={draft.toolsIntroduced.includes(t)} onClick={() => toggle('toolsIntroduced', t)} icon={draft.toolsIntroduced.includes(t) ? <Check className="h-3.5 w-3.5" /> : undefined}>
                {t}
              </Chip>
            ))}
          </div>
          <AddCustom label="Add another tool" placeholder="e.g. AI demand forecasting" existing={toolOptions} onAdd={(v) => set('toolsIntroduced', [...draft.toolsIntroduced, v])} />
        </>
      ),
    },
    {
      title: 'Which departments will experience significant AI transformation?',
      subtitle: 'Where you expect AI to change how work is done over the next 1–2 years.',
      error: () => (draft.transformationDepartments.length ? null : 'Select at least one department.'),
      body: (
        <div className="flex flex-wrap gap-2">
          {draft.departments.map((d) => (
            <Chip key={d} selected={draft.transformationDepartments.includes(d)} onClick={() => toggle('transformationDepartments', d)} icon={draft.transformationDepartments.includes(d) ? <Check className="h-3.5 w-3.5" /> : undefined}>
              {d}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      title: 'Which skills do you want employees to develop?',
      subtitle: `Choose up to ${MAX_SKILLS}. These shape your skills-gap analysis and maturity score.`,
      error: () => (draft.desiredSkills.length ? null : 'Select at least one skill.'),
      body: (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-600">
            {draft.desiredSkills.length}/{MAX_SKILLS} selected
          </p>
          {SKILL_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.filter((s) => g.categories.includes(s.category) && !s.id.startsWith('domain-')).map((s) => {
                  const sel = draft.desiredSkills.includes(s.id);
                  return (
                    <Chip key={s.id} selected={sel} disabled={!sel && draft.desiredSkills.length >= MAX_SKILLS} onClick={() => toggle('desiredSkills', s.id, MAX_SKILLS)} icon={sel ? <Check className="h-3.5 w-3.5" /> : undefined}>
                      {s.name}
                    </Chip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];
  const err = current.error();
  const last = step === steps.length - 1;

  function next() {
    setTouched(true);
    if (current.error()) return;
    setTouched(false);
    if (last) void submit();
    else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
    }
  }

  async function submit() {
    if (!user) return;
    setPhase('analysing');
    try {
      const input = { ...draft, name: draft.name.trim(), workforceSize: draft.workforceSize as WorkforceSize, adoptionLevel: draft.adoptionLevel as OrgAdoption };
      const [{ maturity, error }] = await Promise.all([assessMaturity(input), sleep(1800)]);
      if (edit && organisation) {
        const industryChanged = organisation.industryId !== input.industryId;
        const org: Organisation = {
          ...organisation,
          ...input,
          requiredCompetencies: organisation.requiredCompetencies.length ? organisation.requiredCompetencies : competenciesFromTemplate(input.industryId),
          maturity,
          updatedAt: nowISO(),
        };
        await saveOrganisation(org);
        toast.success('Maturity reassessed', industryChanged ? 'Your industry changed — review your required competencies.' : error ?? undefined);
        navigate('/employer/maturity');
        return;
      }
      const now = nowISO();
      const org: Organisation = {
        id: `org-${uid()}`,
        ...input,
        requiredCompetencies: competenciesFromTemplate(input.industryId),
        maturity,
        ownerUserId: user.id,
        isSampleWorkforce: true,
        createdAt: now,
        updatedAt: now,
      };
      const workforce = generateSampleWorkforce(org, SAMPLE_COUNT_BY_SIZE[org.workforceSize]);
      for (let i = 0; i < workforce.length; i += 20) {
        await Promise.all(workforce.slice(i, i + 20).map((w) => db.set(COLLECTIONS.workforceMembers, w.id, w)));
      }
      invalidateWorkforce(org.id);
      await saveOrganisation(org);
      if (error) toast.info('Built-in analysis used', error);
      navigate('/employer/maturity?new=1');
    } catch (e) {
      console.warn('[ZimAI] employer onboarding failed', e);
      setErrorMsg('We could not save your organisation. Check your connection and try again.');
      setPhase('error');
    }
  }

  if (organisation && !edit && phase === 'form') return <Navigate to="/employer" replace />;

  if (phase === 'analysing')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <LoadingState
          variant="ai"
          title={edit ? 'Reassessing your AI maturity…' : 'Analysing your organisation…'}
          messages={['Scoring strategy, adoption, skills, data and governance…', 'Comparing with your sector’s AI exposure…', 'Mapping employer competencies…', edit ? 'Updating your maturity profile…' : 'Preparing your workforce dashboard…']}
        />
      </div>
    );
  if (phase === 'error')
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <ErrorState message={errorMsg} onRetry={() => void submit()} className="max-w-md" />
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo to={organisation ? '/employer' : '/'} />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-slate-500 sm:inline">{edit ? 'Reassess AI maturity' : 'Employer AI assessment'}</span>
            <button
              type="button"
              onClick={() => navigate(organisation ? '/employer/maturity' : '/')}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-ink-900"
              aria-label="Exit assessment"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3 sm:px-6">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>
              Step {step + 1} of {steps.length}
            </span>
            <span>{Math.round((step / steps.length) * 100)}% complete</span>
          </div>
          <div className="mt-1.5 flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1}>
            {steps.map((_, i) => (
              <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i < step ? 'bg-brand-500' : i === step ? 'bg-brand-300' : 'bg-slate-200')} />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-8 sm:px-6 sm:pt-12">
        <div key={step} className="animate-fade-up">
          {step === 0 && !edit && (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> About 3 minutes · 9 short questions
            </p>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{current.title}</h1>
          <p className="mt-2 text-[15px] text-slate-500">{current.subtitle}</p>
          <div className="mt-6">{current.body}</div>
          {touched && err && (
            <p role="alert" className="mt-4 rounded-xl bg-clay-50 px-3.5 py-2.5 text-sm font-medium text-clay-700">
              {err}
            </p>
          )}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <AccentBar className="rounded-none opacity-60" />
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
          <Button size="lg" onClick={next} iconRight={last ? <Sparkles className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}>
            {last ? (edit ? 'Reassess maturity' : 'Analyse my organisation') : 'Continue'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
