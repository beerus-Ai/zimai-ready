import type { CertificationLevel, DomainId, EmployerCompetency, Organisation, SkillLevel, WorkforceMember, WorkforceStatus } from '../../types';
import { seededRandom } from '../../lib/utils';
import { checkEmployerCompetencies, isEmployerReadyEligible, LEVEL_META } from '../../lib/certification';
import { getIndustry } from '../../data/industries';

/**
 * Workforce model — department profiles, the status rule and the deterministic
 * sample-workforce generator shared by the demo organisation and newly
 * onboarded organisations. All generated people are fictional.
 */

// ───────────────────────── Status rule (single source of truth) ─────────────────────────

export const AI_READY_THRESHOLD = 72;
export const LOW_READINESS_THRESHOLD = 50;
export const HIGH_EXPOSURE_THRESHOLD = 65;

/**
 * - AI Ready: readiness ≥ 72 (with competent skills — the generator guarantees core skills ≥ Competent)
 * - Priority reskilling: high AI exposure (≥ 65) combined with low readiness (< 50)
 * - Currently upskilling: everyone else
 */
export function deriveStatus(readiness: number, exposure: number): WorkforceStatus {
  if (readiness >= AI_READY_THRESHOLD) return 'ai-ready';
  if (readiness < LOW_READINESS_THRESHOLD && exposure >= HIGH_EXPOSURE_THRESHOLD) return 'priority-reskilling';
  return 'upskilling';
}

// ───────────────────────── Department profiles ─────────────────────────

export interface RoleDef {
  title: string;
  domainId: DomainId;
  exposure: number; // typical task exposure to AI for this role
  weight: number;
  lead?: boolean; // head-of-department role (one per department)
}

export interface DeptProfile {
  key: string;
  match: RegExp;
  exposure: number;
  readinessOffset: number; // relative to organisation baseline
  sizeWeight: number;
  skills: string[]; // department-specific skills
  modules: string[]; // catalogue modules most relevant to this department
  roles: RoleDef[];
}

export const CORE_SKILLS = ['ai-fundamentals', 'prompt-engineering', 'ai-writing', 'ai-analytics', 'data-interpretation', 'responsible-ai', 'data-privacy', 'ai-verification', 'critical-thinking'];

export const DEPT_PROFILES: DeptProfile[] = [
  {
    key: 'customer',
    match: /customer|client|call cent|contact cent|service desk|guest|front office/i,
    exposure: 80,
    readinessOffset: -8,
    sizeWeight: 1.4,
    skills: ['customer-ai', 'ai-automation', 'domain-customer-service'],
    modules: ['cs-assist', 'cs-chatbots', 'cs-insights', 'cs-challenge'],
    roles: [
      { title: 'Customer Service Manager', domainId: 'management', exposure: 56, weight: 0, lead: true },
      { title: 'Customer Service Agent', domainId: 'customer-service', exposure: 82, weight: 7 },
      { title: 'Call Centre Agent', domainId: 'customer-service', exposure: 86, weight: 7 },
      { title: 'Branch Teller', domainId: 'customer-service', exposure: 80, weight: 6 },
      { title: 'Client Relations Officer', domainId: 'customer-service', exposure: 72, weight: 4 },
      { title: 'Digital Banking Support Officer', domainId: 'customer-service', exposure: 80, weight: 4 },
      { title: 'Complaints Resolution Officer', domainId: 'customer-service', exposure: 70, weight: 3 },
      { title: 'Customer Experience Team Leader', domainId: 'customer-service', exposure: 64, weight: 2 },
    ],
  },
  {
    key: 'risk',
    match: /risk|complian|audit|legal|governance|fraud/i,
    exposure: 66,
    readinessOffset: -2,
    sizeWeight: 0.8,
    skills: ['ai-governance', 'fraud-detection', 'decision-support'],
    modules: ['fin-risk', 'mgmt-governance', 'core-responsible', 'core-verification'],
    roles: [
      { title: 'Head of Risk & Compliance', domainId: 'management', exposure: 52, weight: 0, lead: true },
      { title: 'Compliance Officer', domainId: 'finance', exposure: 66, weight: 5 },
      { title: 'AML/KYC Analyst', domainId: 'finance', exposure: 78, weight: 4 },
      { title: 'Risk Analyst', domainId: 'data-analytics', exposure: 72, weight: 3 },
      { title: 'Internal Auditor', domainId: 'finance', exposure: 66, weight: 3 },
      { title: 'Fraud Analyst', domainId: 'data-analytics', exposure: 76, weight: 2 },
      { title: 'Operational Risk Officer', domainId: 'operations', exposure: 58, weight: 2 },
    ],
  },
  {
    key: 'finance',
    match: /financ|account|treasur|credit|revenue|payroll accounts/i,
    exposure: 74,
    readinessOffset: 4,
    sizeWeight: 1,
    skills: ['financial-analysis', 'fraud-detection', 'ai-automation', 'sql-data', 'domain-finance'],
    modules: ['fin-analysis', 'fin-automation', 'fin-risk', 'fin-challenge'],
    roles: [
      { title: 'Finance Manager', domainId: 'management', exposure: 58, weight: 0, lead: true },
      { title: 'Accountant', domainId: 'finance', exposure: 74, weight: 5 },
      { title: 'Accounts Clerk', domainId: 'finance', exposure: 82, weight: 5 },
      { title: 'Management Accountant', domainId: 'finance', exposure: 74, weight: 3 },
      { title: 'Financial Analyst', domainId: 'finance', exposure: 76, weight: 3 },
      { title: 'Credit Analyst', domainId: 'finance', exposure: 76, weight: 3 },
      { title: 'Treasury Officer', domainId: 'finance', exposure: 68, weight: 2 },
    ],
  },
  {
    key: 'hr',
    match: /human|\bhr\b|people|talent|payroll|learning & dev|training/i,
    exposure: 60,
    readinessOffset: 0,
    sizeWeight: 0.6,
    skills: ['ai-recruitment', 'bias-awareness', 'domain-hr'],
    modules: ['hr-recruitment', 'hr-analytics', 'hr-experience', 'hr-challenge'],
    roles: [
      { title: 'Head of People', domainId: 'management', exposure: 50, weight: 0, lead: true },
      { title: 'HR Officer', domainId: 'hr', exposure: 60, weight: 4 },
      { title: 'Recruitment Officer', domainId: 'hr', exposure: 68, weight: 3 },
      { title: 'Payroll Administrator', domainId: 'hr', exposure: 70, weight: 2 },
      { title: 'Training & Development Officer', domainId: 'hr', exposure: 56, weight: 2 },
      { title: 'HR Business Partner', domainId: 'hr', exposure: 54, weight: 2 },
      { title: 'HR Assistant', domainId: 'hr', exposure: 64, weight: 2 },
    ],
  },
  {
    key: 'marketing',
    match: /market|brand|communic|sales|business dev|public relations|\bpr\b/i,
    exposure: 72,
    readinessOffset: 8,
    sizeWeight: 0.7,
    skills: ['data-visualisation', 'customer-ai', 'domain-marketing'],
    modules: ['mkt-content', 'mkt-insights', 'mkt-sales', 'mkt-challenge'],
    roles: [
      { title: 'Head of Marketing', domainId: 'management', exposure: 56, weight: 0, lead: true },
      { title: 'Marketing Officer', domainId: 'marketing', exposure: 72, weight: 4 },
      { title: 'Digital Marketing Specialist', domainId: 'marketing', exposure: 78, weight: 3 },
      { title: 'Communications Officer', domainId: 'marketing', exposure: 70, weight: 2 },
      { title: 'Market Research Analyst', domainId: 'data-analytics', exposure: 76, weight: 2 },
      { title: 'Brand Manager', domainId: 'marketing', exposure: 64, weight: 2 },
    ],
  },
  {
    key: 'ict',
    match: /\bict\b|\bit\b|tech|digital|software|data|information|systems|engineering \(it\)/i,
    exposure: 74,
    readinessOffset: 12,
    sizeWeight: 0.8,
    skills: ['ai-coding', 'ai-automation', 'sql-data', 'ai-governance', 'domain-software'],
    modules: ['sw-coding', 'sw-security', 'sw-automation', 'da-foundations'],
    roles: [
      { title: 'ICT Manager', domainId: 'management', exposure: 58, weight: 0, lead: true },
      { title: 'Software Developer', domainId: 'software', exposure: 84, weight: 4 },
      { title: 'IT Support Officer', domainId: 'software', exposure: 76, weight: 3 },
      { title: 'Systems Administrator', domainId: 'software', exposure: 70, weight: 2 },
      { title: 'Data Analyst', domainId: 'data-analytics', exposure: 84, weight: 2 },
      { title: 'Information Security Analyst', domainId: 'software', exposure: 68, weight: 2 },
      { title: 'Network Engineer', domainId: 'software', exposure: 64, weight: 1 },
      { title: 'Business Systems Analyst', domainId: 'data-analytics', exposure: 76, weight: 1 },
    ],
  },
  {
    key: 'engineering',
    match: /engineer|maint|plant|mine|mining|workshop|production|manufactur|quality|safety/i,
    exposure: 58,
    readinessOffset: -6,
    sizeWeight: 1.2,
    skills: ['ai-maintenance', 'safety-ai', 'predictive-analytics', 'domain-operations'],
    modules: ['ops-maintenance', 'ops-safety', 'ops-process', 'ops-challenge'],
    roles: [
      { title: 'Engineering Manager', domainId: 'management', exposure: 50, weight: 0, lead: true },
      { title: 'Maintenance Engineer', domainId: 'operations', exposure: 60, weight: 4 },
      { title: 'Plant Technician', domainId: 'operations', exposure: 56, weight: 4 },
      { title: 'Production Supervisor', domainId: 'operations', exposure: 58, weight: 3 },
      { title: 'Safety Officer', domainId: 'operations', exposure: 52, weight: 2 },
      { title: 'Quality Controller', domainId: 'operations', exposure: 64, weight: 2 },
    ],
  },
  {
    key: 'clinical',
    match: /clinic|nurs|medical|health|pharm|patient|ward/i,
    exposure: 55,
    readinessOffset: -4,
    sizeWeight: 1.2,
    skills: ['decision-support', 'data-privacy', 'domain-healthcare'],
    modules: ['hc-admin', 'hc-decision', 'hc-data', 'hc-challenge'],
    roles: [
      { title: 'Clinical Services Manager', domainId: 'management', exposure: 48, weight: 0, lead: true },
      { title: 'Registered Nurse', domainId: 'healthcare', exposure: 52, weight: 5 },
      { title: 'Medical Officer', domainId: 'healthcare', exposure: 58, weight: 2 },
      { title: 'Pharmacist', domainId: 'healthcare', exposure: 60, weight: 2 },
      { title: 'Health Records Officer', domainId: 'healthcare', exposure: 72, weight: 2 },
      { title: 'Laboratory Scientist', domainId: 'healthcare', exposure: 56, weight: 1 },
    ],
  },
  {
    key: 'education',
    match: /teach|academ|lectur|school|faculty|curricul|student/i,
    exposure: 56,
    readinessOffset: -2,
    sizeWeight: 1.2,
    skills: ['ai-writing', 'domain-education'],
    modules: ['edu-planning', 'edu-assessment', 'edu-personalised', 'edu-challenge'],
    roles: [
      { title: 'Head of Department', domainId: 'management', exposure: 48, weight: 0, lead: true },
      { title: 'Lecturer', domainId: 'education', exposure: 58, weight: 5 },
      { title: 'Teacher', domainId: 'education', exposure: 56, weight: 5 },
      { title: 'Curriculum Developer', domainId: 'education', exposure: 64, weight: 1 },
      { title: 'Student Support Officer', domainId: 'education', exposure: 52, weight: 2 },
    ],
  },
  {
    key: 'agronomy',
    match: /agronom|farm|field|extension|agri|crop|livestock|estate/i,
    exposure: 48,
    readinessOffset: -6,
    sizeWeight: 1.2,
    skills: ['predictive-analytics', 'data-interpretation', 'domain-agriculture'],
    modules: ['agri-crops', 'agri-advisory', 'agri-markets', 'agri-challenge'],
    roles: [
      { title: 'Farm Operations Manager', domainId: 'management', exposure: 46, weight: 0, lead: true },
      { title: 'Agronomist', domainId: 'agriculture', exposure: 52, weight: 3 },
      { title: 'Extension Officer', domainId: 'agriculture', exposure: 50, weight: 3 },
      { title: 'Field Supervisor', domainId: 'agriculture', exposure: 44, weight: 3 },
      { title: 'Farm Data Officer', domainId: 'data-analytics', exposure: 70, weight: 1 },
    ],
  },
  {
    key: 'executive',
    match: /executive|management|strategy|board|leadership|office of the ceo/i,
    exposure: 52,
    readinessOffset: 4,
    sizeWeight: 0.4,
    skills: ['ai-strategy', 'decision-support', 'ai-governance', 'domain-management'],
    modules: ['mgmt-decisions', 'mgmt-strategy', 'mgmt-governance', 'mgmt-challenge'],
    roles: [
      { title: 'Executive Director', domainId: 'management', exposure: 50, weight: 0, lead: true },
      { title: 'Strategy Manager', domainId: 'management', exposure: 56, weight: 2 },
      { title: 'Executive Assistant', domainId: 'operations', exposure: 72, weight: 2 },
      { title: 'Business Analyst', domainId: 'data-analytics', exposure: 74, weight: 1 },
    ],
  },
  {
    key: 'operations',
    match: /operat|logistic|supply|procure|facilit|admin|branch|warehouse|transport|records/i,
    exposure: 72,
    readinessOffset: -10,
    sizeWeight: 1.3,
    skills: ['ai-automation', 'predictive-analytics', 'domain-operations'],
    modules: ['ops-process', 'ops-maintenance', 'ops-safety', 'ops-challenge'],
    roles: [
      { title: 'Operations Manager', domainId: 'management', exposure: 58, weight: 0, lead: true },
      { title: 'Operations Officer', domainId: 'operations', exposure: 72, weight: 5 },
      { title: 'Back-Office Processing Clerk', domainId: 'operations', exposure: 84, weight: 5 },
      { title: 'Payments Processing Officer', domainId: 'operations', exposure: 82, weight: 4 },
      { title: 'Cash Services Officer', domainId: 'operations', exposure: 70, weight: 3 },
      { title: 'Records & Archives Officer', domainId: 'operations', exposure: 76, weight: 2 },
      { title: 'Branch Operations Supervisor', domainId: 'operations', exposure: 64, weight: 2 },
      { title: 'Procurement Officer', domainId: 'operations', exposure: 62, weight: 2 },
      { title: 'Facilities Officer', domainId: 'operations', exposure: 48, weight: 1 },
    ],
  },
];

function genericProfile(department: string): DeptProfile {
  return {
    key: 'generic',
    match: /.*/,
    exposure: 62,
    readinessOffset: 0,
    sizeWeight: 0.9,
    skills: ['ai-automation', 'decision-support', 'domain-operations'],
    modules: ['core-prompting', 'ops-process', 'core-verification', 'core-responsible'],
    roles: [
      { title: `${department} Manager`, domainId: 'management', exposure: 52, weight: 0, lead: true },
      { title: `${department} Officer`, domainId: 'operations', exposure: 64, weight: 5 },
      { title: `${department} Specialist`, domainId: 'operations', exposure: 66, weight: 2 },
      { title: `${department} Assistant`, domainId: 'operations', exposure: 70, weight: 3 },
    ],
  };
}

export function deptProfile(department: string): DeptProfile {
  return DEPT_PROFILES.find((p) => p.match.test(department)) ?? genericProfile(department);
}

/** Skills that matter most for a department (department-specific first, then core). */
export const deptSkills = (department: string) => deptProfile(department).skills;

// ───────────────────────── Names (fictional) ─────────────────────────

const FIRST_NAMES = [
  'Tendai', 'Tatenda', 'Farai', 'Nyasha', 'Rudo', 'Chipo', 'Tapiwa', 'Tinashe', 'Kudzai', 'Rumbidzai', 'Tafadzwa', 'Chiedza',
  'Munyaradzi', 'Tawanda', 'Takudzwa', 'Ropafadzo', 'Nyarai', 'Fadzai', 'Simbarashe', 'Tanaka', 'Anesu', 'Vimbai', 'Shingai',
  'Tariro', 'Ruvimbo', 'Kudakwashe', 'Makanaka', 'Tsitsi', 'Tinotenda', 'Panashe', 'Mufaro', 'Chenai', 'Rufaro', 'Nokutenda',
  'Tonderai', 'Kundai', 'Fungai', 'Paida', 'Batsirai', 'Ngonidzashe', 'Ruramai', 'Tadiwa', 'Yeukai', 'Farirai', 'Tendekai',
  'Sibusiso', 'Thandeka', 'Nomvula', 'Sipho', 'Themba', 'Busisiwe', 'Mthokozisi', 'Nkosana', 'Lindiwe', 'Sithembile', 'Bongani',
  'Zanele', 'Nqobile', 'Sibongile', 'Thulani', 'Khanyisile', 'Mandla', 'Nokuthula', 'Siphiwe', 'Lwazi', 'Mduduzi', 'Nomsa',
  'Andile', 'Zodwa', 'Sakhile', 'Grace', 'Blessing', 'Memory', 'Precious', 'Loveness', 'Gift', 'Patience', 'Kelvin', 'Ruth',
  'Mercy', 'Nigel', 'Charmaine', 'Brian', 'Edith', 'Lovemore', 'Prosper', 'Shamiso', 'Tino', 'Natasha', 'Primrose',
];

const SURNAMES = [
  'Ncube', 'Dube', 'Sibanda', 'Ndlovu', 'Nyathi', 'Mpofu', 'Khumalo', 'Mlambo', 'Chikore', 'Chiweshe', 'Mhlanga', 'Gumbo',
  'Maposa', 'Makoni', 'Banda', 'Phiri', 'Mazarura', 'Matongo', 'Mudzingwa', 'Chinembiri', 'Marufu', 'Mushonga', 'Nyoni', 'Tshuma',
  'Mathe', 'Mguni', 'Masuku', 'Hove', 'Shumba', 'Chigumba', 'Mukanya', 'Madziva', 'Gwaze', 'Kanengoni', 'Chitando', 'Murwira',
  'Zhou', 'Muchena', 'Chimedza', 'Mangena', 'Nkomo', 'Sithole', 'Mabhena', 'Masunda', 'Chakanyuka', 'Nhamo', 'Mutisi', 'Kaseke',
  'Munemo', 'Chivasa', 'Tembo', 'Mwale', 'Sibindi', 'Hlabangana', 'Ngwenya', 'Moyo', 'Mupfumi', 'Chinhoyi', 'Nyamayaro', 'Mandaza',
  'Chari', 'Zulu', 'Ruzvidzo', 'Mapuranga', 'Dzvairo', 'Mahachi', 'Chipunza', 'Munetsi',
];

/** Names reserved for demo personas — never generated for other employees. */
const RESERVED_NAMES = new Set(['Rutendo Moyo', 'Farai Ncube', 'Nyasha Mutasa', 'Tatenda Chirwa']);

function nameFactory(rand: () => number, reserved: string[] = []) {
  const used = new Set<string>([...RESERVED_NAMES, ...reserved]);
  return () => {
    for (let i = 0; i < 400; i++) {
      const name = `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${SURNAMES[Math.floor(rand() * SURNAMES.length)]}`;
      if (!used.has(name)) {
        used.add(name);
        return name;
      }
    }
    const fallback = `Employee ${used.size + 1}`;
    used.add(fallback);
    return fallback;
  };
}

// ───────────────────────── Generator ─────────────────────────

export interface DeptPlan {
  department: string;
  count: number;
  /** Target average readiness (the generator hits this exactly for constructive plans). */
  readiness: number;
  /** Target average exposure (approximate). */
  exposure: number;
  /** Optional exact status targets (constructive mode). */
  aiReady?: number;
  priority?: number;
  /** Optional explicit role headcounts. */
  roles?: { title: string; count: number }[];
}

export interface PinnedMember {
  department: string;
  name: string;
  role: string;
  readiness: number;
  exposure: number;
  learningProgress?: number;
  linkedUserId?: string;
  skillLevels?: Record<string, SkillLevel>;
  certification?: WorkforceMember['certification'];
  lastActiveDaysAgo?: number;
}

const clampInt = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(n)));

function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map(Math.floor);
  let rest = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; rest > 0 && order.length; k = (k + 1) % order.length, rest--) out[order[k][1]]++;
  return out;
}

function roleSlots(plan: DeptPlan, profile: DeptProfile, rand: () => number, pinnedRoles: string[]): RoleDef[] {
  const byTitle = (t: string) => profile.roles.find((r) => r.title === t) ?? { title: t, domainId: profile.roles[1]?.domainId ?? 'operations', exposure: profile.exposure, weight: 1 };
  let slots: RoleDef[] = [];
  if (plan.roles) {
    plan.roles.forEach((r) => {
      for (let i = 0; i < r.count; i++) slots.push(byTitle(r.title));
    });
  } else {
    const lead = profile.roles.find((r) => r.lead);
    const others = profile.roles.filter((r) => !r.lead);
    const n = plan.count;
    if (lead && n >= 5) slots.push(lead);
    const counts = allocate(n - slots.length, others.map((r) => r.weight));
    others.forEach((r, i) => {
      for (let k = 0; k < counts[i]; k++) slots.push(r);
    });
  }
  // Pinned members take a matching slot (so explicit role counts remain exact).
  pinnedRoles.forEach((title) => {
    const idx = slots.findIndex((s) => s.title === title);
    if (idx >= 0) slots.splice(idx, 1);
    else slots.pop();
  });
  // deterministic shuffle
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}

const SKILL_OFFSETS: Record<string, number> = {
  'ai-fundamentals': 0.4,
  'prompt-engineering': 0.15,
  'ai-writing': 0.25,
  'ai-governance': -0.6,
  'fraud-detection': -0.15,
  'predictive-analytics': -0.35,
  'ai-coding': -0.5,
  'sql-data': -0.25,
  'ai-strategy': -0.3,
};

function skillLevelsFor(readiness: number, profile: DeptProfile, competencies: EmployerCompetency[], desired: string[], status: WorkforceStatus, rand: () => number): Record<string, SkillLevel> {
  const ids = new Set<string>([...CORE_SKILLS, ...profile.skills, ...competencies.flatMap((c) => c.skillIds), ...desired]);
  const base = (readiness / 100) * 3.1 - 0.2;
  const out: Record<string, SkillLevel> = {};
  ids.forEach((id) => {
    let v = base + (SKILL_OFFSETS[id] ?? 0) + (rand() - 0.5) * 1.1;
    if (profile.skills.includes(id)) v += 0.35;
    else if (id.startsWith('domain-') || ['financial-analysis', 'fraud-detection', 'ai-recruitment', 'customer-ai', 'ai-maintenance', 'safety-ai'].includes(id)) v -= 0.3;
    let lvl = clampInt(v, 0, 3);
    // AI Ready employees demonstrate competent core skills.
    if (status === 'ai-ready' && CORE_SKILLS.includes(id)) lvl = Math.max(2, lvl);
    if (status === 'ai-ready') lvl = Math.max(1, lvl);
    out[id] = lvl as SkillLevel;
  });
  return out;
}

const daysAgoISO = (d: number, rand: () => number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(8 + Math.floor(rand() * 9), Math.floor(rand() * 60), 0, 0);
  return t.toISOString();
};

export interface GenerateOptions {
  organisation: Organisation;
  plans: DeptPlan[];
  seed: string;
  idPrefix: string;
  pinned?: PinnedMember[];
  /** Probability tuning for certification (0–1). */
  certificationRate?: number;
}

/**
 * Deterministic workforce generator.
 * Constructive plans (aiReady/priority given) hit the department's average readiness
 * and status counts exactly; other plans sample naturally around the target.
 * Status is always consistent with {@link deriveStatus}.
 */
export function generateWorkforce(opts: GenerateOptions): WorkforceMember[] {
  const { organisation: org, plans, seed, idPrefix, pinned = [], certificationRate = 0.72 } = opts;
  const rand = seededRandom(seed);
  const nextName = nameFactory(rand, pinned.map((p) => p.name));
  const competencies = org.requiredCompetencies ?? [];
  const members: WorkforceMember[] = [];
  let seq = 0;

  for (const plan of plans) {
    const profile = deptProfile(plan.department);
    const pins = pinned.filter((p) => p.department === plan.department);
    const slots = roleSlots(plan, profile, rand, pins.map((p) => p.role));
    const n = slots.length; // excluding pinned
    const meanRoleExposure = slots.length ? slots.reduce((a, s) => a + s.exposure, 0) / slots.length : plan.exposure;
    const shift = plan.exposure - meanRoleExposure;

    const exposure = slots.map((s) => clampInt(s.exposure + shift + (rand() - 0.5) * 14, 18, 97));
    const status: WorkforceStatus[] = new Array(n).fill('upskilling');
    const readiness: number[] = new Array(n).fill(0);
    const total = plan.readiness * plan.count;
    const pinnedSum = pins.reduce((a, p) => a + p.readiness, 0);
    const pinnedStatus = pins.map((p) => deriveStatus(p.readiness, p.exposure));

    if (plan.aiReady != null || plan.priority != null) {
      // ── Constructive mode: exact status counts & exact average ──
      const a = (plan.aiReady ?? 0) - pinnedStatus.filter((s) => s === 'ai-ready').length;
      const p = (plan.priority ?? 0) - pinnedStatus.filter((s) => s === 'priority-reskilling').length;
      const idx = [...Array(n).keys()];
      // priority: the highest-exposure roles (with some noise)
      const byExposure = [...idx].sort((i, j) => exposure[j] + rand() * 8 - (exposure[i] + rand() * 8));
      const priorityIdx = new Set(byExposure.slice(0, Math.max(0, p)));
      const rest = idx.filter((i) => !priorityIdx.has(i));
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      const readyIdx = new Set(rest.slice(0, Math.max(0, a)));
      idx.forEach((i) => (status[i] = priorityIdx.has(i) ? 'priority-reskilling' : readyIdx.has(i) ? 'ai-ready' : 'upskilling'));

      const band = (s: WorkforceStatus): [number, number] => (s === 'ai-ready' ? [72, 97] : s === 'priority-reskilling' ? [12, 49] : [28, 71]);
      const cA = clampInt(plan.readiness + 6, 76, 88);
      const cP = clampInt(plan.readiness - 16, 22, 40);
      let sumAP = 0;
      idx.forEach((i) => {
        if (status[i] === 'ai-ready') readiness[i] = clampInt(cA + (rand() - 0.5) * 16, 72, 97);
        else if (status[i] === 'priority-reskilling') readiness[i] = clampInt(cP + (rand() - 0.5) * 18, 12, 49);
        else return;
        sumAP += readiness[i];
      });
      const upIdx = idx.filter((i) => status[i] === 'upskilling');
      const x = upIdx.length ? (total - pinnedSum - sumAP) / upIdx.length : 0;
      upIdx.forEach((i) => (readiness[i] = clampInt(x + (rand() - 0.5) * 22, 28, 71)));
      // Exact average: nudge values ±1 within their status band.
      let diff = total - pinnedSum - readiness.reduce((s, v) => s + v, 0);
      const order = [...upIdx, ...idx.filter((i) => status[i] !== 'upskilling')];
      let guard = 0;
      while (diff !== 0 && order.length && guard++ < 20000) {
        const i = order[guard % order.length];
        const [lo, hi] = band(status[i]);
        const step = diff > 0 ? 1 : -1;
        if (readiness[i] + step >= lo && readiness[i] + step <= hi) {
          readiness[i] += step;
          diff -= step;
        }
      }
      // Keep exposure consistent with the status rule.
      idx.forEach((i) => {
        if (status[i] === 'priority-reskilling' && exposure[i] < HIGH_EXPOSURE_THRESHOLD) exposure[i] = HIGH_EXPOSURE_THRESHOLD + Math.floor(rand() * 10);
        if (status[i] === 'upskilling' && readiness[i] < LOW_READINESS_THRESHOLD && exposure[i] >= HIGH_EXPOSURE_THRESHOLD) exposure[i] = 56 + Math.floor(rand() * 9);
      });
    } else {
      // ── Natural mode ──
      for (let i = 0; i < n; i++) {
        const noise = (rand() + rand() + rand() - 1.5) * 28; // ~ normal, sd ≈ 14
        readiness[i] = clampInt(plan.readiness + noise, 14, 96);
        status[i] = deriveStatus(readiness[i], exposure[i]);
      }
    }

    const make = (i: number | null, pin?: PinnedMember): WorkforceMember => {
      const slot = i != null ? slots[i] : null;
      const r = pin ? pin.readiness : readiness[i!];
      const e = pin ? pin.exposure : exposure[i!];
      const st = deriveStatus(r, e);
      const roleTitle = pin ? pin.role : slot!.title;
      const role = profile.roles.find((x) => x.title === roleTitle);
      const skills = pin?.skillLevels ? { ...skillLevelsFor(r, profile, competencies, org.desiredSkills, st, rand), ...pin.skillLevels } : skillLevelsFor(r, profile, competencies, org.desiredSkills, st, rand);
      const learning =
        pin?.learningProgress ??
        clampInt(st === 'ai-ready' ? 62 + rand() * 38 : st === 'upskilling' ? 18 + rand() * 46 + (r - 50) * 0.35 : 2 + rand() * 30, 0, 100);

      let certification: WorkforceMember['certification'] = null;
      if (pin?.certification !== undefined) certification = pin.certification;
      else if (st === 'ai-ready' && rand() < certificationRate) {
        const level: CertificationLevel = r >= 82 ? 'AI_READY' : 'AI_CAPABLE';
        const eligible = isEmployerReadyEligible(level, checkEmployerCompetencies(skills, competencies));
        certification = eligible && rand() < 0.3 ? { type: 'employer', level } : { type: 'domain', level };
      } else if (st === 'upskilling' && rand() < 0.14) {
        certification = { type: 'domain', level: r >= 62 && rand() < 0.4 ? 'AI_CAPABLE' : 'AI_AWARE' };
      } else if (st === 'priority-reskilling' && rand() < 0.04) {
        certification = { type: 'domain', level: 'AI_AWARE' };
      }
      // sanity: an employer certificate requires AI Capable or above
      if (certification?.type === 'employer' && LEVEL_META[certification.level].rank < 2) certification = { type: 'domain', level: certification.level };

      const days = pin?.lastActiveDaysAgo ?? Math.floor(st === 'ai-ready' ? rand() * 7 : st === 'upskilling' ? rand() * 16 : 2 + rand() * 40);
      seq++;
      return {
        id: `${idPrefix}-${String(seq).padStart(3, '0')}`,
        organisationId: org.id,
        name: pin ? pin.name : nextName(),
        department: plan.department,
        role: roleTitle,
        domainId: role?.domainId ?? slot?.domainId ?? 'operations',
        readiness: r,
        exposure: e,
        learningProgress: learning,
        status: st,
        skillLevels: skills,
        certification,
        lastActive: daysAgoISO(days, rand),
        ...(pin?.linkedUserId ? { linkedUserId: pin.linkedUserId } : {}),
      };
    };

    pins.forEach((p) => members.push(make(null, p)));
    for (let i = 0; i < n; i++) members.push(make(i));
  }
  return members;
}

// ───────────────────────── Sample workforce for a new organisation ─────────────────────────

export const SAMPLE_COUNT_BY_SIZE: Record<Organisation['workforceSize'], number> = {
  '1-50': 32,
  '51-200': 60,
  '201-500': 80,
  '501-1000': 90,
  '1000+': 100,
};

/** Builds natural department plans from the organisation's onboarding answers and maturity. */
export function planForOrganisation(org: Organisation, count: number): DeptPlan[] {
  const departments = org.departments.length ? org.departments : ['Operations', 'Finance', 'Customer Service'];
  const rand = seededRandom(`${org.id}:plan`);
  const industryExposure = getIndustry(org.industryId)?.aiExposure ?? 55;
  const maturity = org.maturity?.score ?? 45;
  const weights = departments.map((d) => deptProfile(d).sizeWeight);
  const counts = allocate(Math.max(count, departments.length * 2), weights).map((c) => Math.max(2, c));
  return departments.map((d, i) => {
    const profile = deptProfile(d);
    const usingAI = org.departmentsUsingAI.includes(d);
    const transforming = org.transformationDepartments.includes(d);
    const readiness = clampInt(40 + maturity * 0.4 + profile.readinessOffset + (usingAI ? 10 : 0) - (transforming && !usingAI ? 5 : 0) + (rand() - 0.5) * 8, 28, 86);
    const exposure = clampInt(industryExposure * 0.45 + profile.exposure * 0.55 + (transforming ? 7 : 0), 25, 92);
    return { department: d, count: counts[i], readiness, exposure };
  });
}
