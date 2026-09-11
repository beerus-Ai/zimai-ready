import type { Organisation, WorkforceMember } from '../../types';
import { competenciesFromTemplate } from '../../features/employer/competencyTemplates';
import { engineMaturity } from '../../features/employer/maturity';
import { generateWorkforce, planForOrganisation, SAMPLE_COUNT_BY_SIZE } from '../../features/employer/workforceModel';
import type { DeptPlan } from '../../features/employer/workforceModel';

/**
 * Fictional demo organisation (Stage 4): Savanna Crest Bank — HQ Harare with
 * branches in Bulawayo, Mutare, Gweru and Masvingo. All organisations and
 * people are fictional; any resemblance to real entities is coincidental.
 */
export const DEMO_ORG_ID = 'org-savanna-crest';

const daysAgo = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(9, 0, 0, 0);
  return t.toISOString();
};

/**
 * Department plans. Averages and status counts are hit exactly by the generator:
 * 148 employees · 46 AI Ready (31%) · 68 upskilling (46%) · 34 priority reskilling (23%).
 */
export const DEMO_PLANS: DeptPlan[] = [
  {
    department: 'Finance',
    count: 22,
    readiness: 72,
    exposure: 72,
    aiReady: 12,
    priority: 1,
    roles: [
      { title: 'Finance Manager', count: 1 },
      { title: 'Accountant', count: 5 },
      { title: 'Accounts Clerk', count: 4 },
      { title: 'Management Accountant', count: 3 },
      { title: 'Financial Analyst', count: 3 },
      { title: 'Credit Analyst', count: 4 },
      { title: 'Treasury Officer', count: 2 },
    ],
  },
  {
    department: 'Human Resources',
    count: 14,
    readiness: 61,
    exposure: 60,
    aiReady: 4,
    priority: 1,
    roles: [
      { title: 'Head of People', count: 1 },
      { title: 'HR Officer', count: 4 },
      { title: 'Recruitment Officer', count: 3 },
      { title: 'Payroll Administrator', count: 2 },
      { title: 'Training & Development Officer', count: 2 },
      { title: 'HR Business Partner', count: 1 },
      { title: 'HR Assistant', count: 1 },
    ],
  },
  {
    department: 'Marketing',
    count: 14,
    readiness: 84,
    exposure: 70,
    aiReady: 11,
    priority: 0,
    roles: [
      { title: 'Head of Marketing', count: 1 },
      { title: 'Marketing Officer', count: 4 },
      { title: 'Digital Marketing Specialist', count: 3 },
      { title: 'Communications Officer', count: 2 },
      { title: 'Market Research Analyst', count: 2 },
      { title: 'Brand Manager', count: 2 },
    ],
  },
  {
    department: 'Operations',
    count: 30,
    readiness: 39,
    exposure: 75,
    aiReady: 1,
    priority: 16,
    roles: [
      { title: 'Operations Manager', count: 1 },
      { title: 'Operations Officer', count: 7 },
      { title: 'Back-Office Processing Clerk', count: 7 },
      { title: 'Payments Processing Officer', count: 5 },
      { title: 'Cash Services Officer', count: 4 },
      { title: 'Records & Archives Officer', count: 3 },
      { title: 'Branch Operations Supervisor', count: 2 },
      { title: 'Procurement Officer', count: 1 },
    ],
  },
  {
    department: 'Customer Service',
    count: 34,
    readiness: 48,
    exposure: 78,
    aiReady: 2,
    priority: 13,
    roles: [
      { title: 'Customer Service Manager', count: 1 },
      { title: 'Customer Service Agent', count: 8 },
      { title: 'Call Centre Agent', count: 8 },
      { title: 'Branch Teller', count: 7 },
      { title: 'Client Relations Officer', count: 4 },
      { title: 'Digital Banking Support Officer', count: 3 },
      { title: 'Complaints Resolution Officer', count: 2 },
      { title: 'Customer Experience Team Leader', count: 1 },
    ],
  },
  {
    department: 'ICT',
    count: 16,
    readiness: 80,
    exposure: 74,
    aiReady: 12,
    priority: 0,
    roles: [
      { title: 'ICT Manager', count: 1 },
      { title: 'Software Developer', count: 4 },
      { title: 'IT Support Officer', count: 3 },
      { title: 'Systems Administrator', count: 2 },
      { title: 'Data Analyst', count: 2 },
      { title: 'Information Security Analyst', count: 2 },
      { title: 'Network Engineer', count: 1 },
      { title: 'Business Systems Analyst', count: 1 },
    ],
  },
  {
    department: 'Risk & Compliance',
    count: 18,
    readiness: 58,
    exposure: 66,
    aiReady: 4,
    priority: 3,
    roles: [
      { title: 'Head of Risk & Compliance', count: 1 },
      { title: 'Compliance Officer', count: 5 },
      { title: 'AML/KYC Analyst', count: 4 },
      { title: 'Risk Analyst', count: 3 },
      { title: 'Internal Auditor', count: 2 },
      { title: 'Fraud Analyst', count: 2 },
      { title: 'Operational Risk Officer', count: 1 },
    ],
  },
];

export function buildDemoOrganisation(ownerUserId: string): { organisation: Organisation; workforce: WorkforceMember[] } {
  const base: Organisation = {
    id: DEMO_ORG_ID,
    name: 'Savanna Crest Bank',
    industryId: 'banking',
    workforceSize: '51-200',
    departments: ['Finance', 'Human Resources', 'Marketing', 'Operations', 'Customer Service', 'ICT', 'Risk & Compliance'],
    adoptionLevel: 'partial',
    departmentsUsingAI: ['Marketing', 'ICT', 'Finance'],
    toolsIntroduced: ['Enterprise generative AI assistant', 'AI fraud monitoring', 'Customer service chatbot', 'Document AI for KYC'],
    transformationDepartments: ['Operations', 'Customer Service', 'Finance'],
    desiredSkills: ['prompt-engineering', 'ai-analytics', 'data-privacy', 'responsible-ai', 'customer-ai', 'ai-automation'],
    requiredCompetencies: competenciesFromTemplate('banking'),
    ownerUserId,
    isDemo: true,
    isSampleWorkforce: true,
    createdAt: daysAgo(21),
    updatedAt: daysAgo(2),
  };
  const maturity = { ...engineMaturity(base), assessedAt: daysAgo(14) };
  const organisation: Organisation = { ...base, maturity };

  const workforce = generateWorkforce({
    organisation,
    plans: DEMO_PLANS,
    seed: 'savanna-crest-bank-v1',
    idPrefix: 'wm-scb',
    pinned: [
      {
        department: 'Human Resources',
        name: 'Rutendo Moyo',
        role: 'HR Officer',
        readiness: 38,
        exposure: 59,
        learningProgress: 29,
        linkedUserId: 'demo-employee',
        skillLevels: { 'ai-fundamentals': 2, 'prompt-engineering': 1, 'ai-writing': 1, 'ai-recruitment': 1, 'data-privacy': 1, 'responsible-ai': 1 },
        certification: null,
        lastActiveDaysAgo: 1,
      },
    ],
  });
  return { organisation, workforce };
}

/** Generates realistic sample workforce records for a newly onboarded organisation. */
export function generateSampleWorkforce(org: Organisation, count = 60): WorkforceMember[] {
  const n = count || SAMPLE_COUNT_BY_SIZE[org.workforceSize] || 60;
  return generateWorkforce({
    organisation: org,
    plans: planForOrganisation(org, n),
    seed: `${org.id}:${org.createdAt}`,
    idPrefix: `wm-${org.id.replace(/^org-/, '').slice(0, 16)}`,
  });
}
