import type { Database } from '../../services/backend';
import { COLLECTIONS } from '../../services/backend';
import type {
  ActivitySubmission,
  Certificate,
  DemoKey,
  EmployeeProfile,
  EmployeeProgress,
  ModuleProgress,
  OnboardingAnswers,
  PublicSkillsProfile,
  ReadinessAssessment,
  SkillPrescriptionItem,
  User,
} from '../../types';
import { computeScores } from '../../lib/scoring';
import { priorityState, readinessLevel } from '../../lib/readiness';
import { baselineSkillLevels, pathFromAssessment, raiseSkills } from '../../lib/progress';
import { todayKey } from '../../lib/utils';
import { getModule, moduleTitle } from '../catalog';
import { buildDemoOrganisation, DEMO_ORG_ID } from './organisation';

/** Fictional demo personas. All people and organisations are fictional. */
export const DEMO_PERSONAS: Record<DemoKey, { uid: string; name: string; email: string; role: User['role']; title: string; headline: string; description: string }> = {
  employee: {
    uid: 'demo-employee',
    name: 'Rutendo Moyo',
    email: 'rutendo.demo@zimaiready.app',
    role: 'employee',
    title: 'HR Officer · Banking & Finance',
    headline: 'Moderate AI exposure, low personal readiness',
    description: 'Works at a fictional bank that is partially adopting AI. Uses AI only occasionally and wants to become AI-ready in HR.',
  },
  transition: {
    uid: 'demo-transition',
    name: 'Farai Ncube',
    email: 'farai.demo@zimaiready.app',
    role: 'employee',
    title: 'Accounts Clerk → Data Analyst',
    headline: 'Career transition into data analytics',
    description: 'An accounts clerk in retail preparing to move into data analytics, building on strong spreadsheet and reconciliation skills.',
  },
  employer: {
    uid: 'demo-employer',
    name: 'Nyasha Mutasa',
    email: 'nyasha.demo@zimaiready.app',
    role: 'employer',
    title: 'Chief People Officer · Savanna Crest Bank',
    headline: 'Workforce of 148 across 7 departments',
    description: 'A fictional Zimbabwean bank with departments at very different stages of AI readiness.',
  },
};

/** Publicly verifiable demo certificate (fictional graduate) for the verification page. */
export const DEMO_CERTIFICATE_ID = 'ZAR-2026-7F3K9Q';
export const DEMO_PUBLIC_PROFILE_ID = 'demo-graduate';

const daysAgo = (d: number, hour = 10) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(hour, 15, 0, 0);
  return t.toISOString();
};
const dayKey = (d: number) => todayKey(new Date(daysAgo(d)));

function rx(moduleId: string, domainId: EmployeeProfile['domainId'], priority: number, category: SkillPrescriptionItem['category'], reason: string): SkillPrescriptionItem {
  const m = getModule(moduleId)!;
  return { moduleId, title: moduleTitle(m, domainId), reason, priority, category, estimatedMinutes: m.estimatedMinutes, skillIds: m.skillIds };
}

function mp(moduleId: string, status: ModuleProgress['status'], lessons: number, quiz: [number, number], mastery: number, started: number, completed?: number): ModuleProgress {
  return {
    moduleId,
    status,
    lessonsCompleted: Array.from({ length: lessons }, (_, i) => `${moduleId}-l${i + 1}`),
    currentLessonId: status === 'in-progress' ? `${moduleId}-l${lessons + 1}` : undefined,
    quizCorrect: quiz[0],
    quizTotal: quiz[1],
    struggling: false,
    mastery,
    startedAt: daysAgo(started),
    completedAt: completed != null ? daysAgo(completed) : undefined,
    minutesSpent: Math.round(lessons * 7.5),
  };
}

// ───────────────────────── Rutendo — employee demo ─────────────────────────

function rutendoBundle(uid: string) {
  const answers: OnboardingAnswers = {
    industryId: 'banking',
    roleId: 'human-resources',
    jobTitle: 'HR Officer',
    experience: '6-10',
    orgAdoption: 'partial',
    deptUsage: 'occasionally',
    personalUsage: 'occasionally',
    useCases: ['writing', 'research'],
    confidence: 2,
    careerObjective: 'ai-ready-current',
  };
  const s = computeScores(answers);
  const profile: EmployeeProfile = {
    ...answers,
    userId: uid,
    displayName: 'Rutendo Moyo',
    department: 'Human Resources',
    organisationId: DEMO_ORG_ID,
    domainId: 'hr',
    onboardingCompletedAt: daysAgo(9),
    updatedAt: daysAgo(9),
  };
  const assessment: ReadinessAssessment = {
    id: 'demo-employee-assessment-1',
    userId: uid,
    kind: 'initial',
    createdAt: daysAgo(9),
    answers,
    personalReadiness: s.personalReadiness,
    workplaceExposure: s.workplaceExposure,
    readinessLevel: readinessLevel(s.personalReadiness),
    priorityState: priorityState(s.personalReadiness, s.workplaceExposure),
    summary:
      'You are an HR Officer in a bank that is partially adopting AI. You use AI occasionally for writing and research, while recruitment screening, HR reporting and employee analytics in banking are increasingly being augmented by AI. Building practical, responsible AI skills now will keep you ahead of these changes.',
    strengths: [
      '6–10 years of HR experience — judgement and empathy that AI cannot replace',
      'Already experimenting with AI for writing and research',
      'Your organisation is investing in AI, so there are real opportunities to apply new skills',
      'A clear goal: become AI-ready in your current profession',
    ],
    gaps: [
      'Structured prompting for HR documents (job descriptions, policies, interview guides)',
      'Using AI to analyse HR data — turnover, engagement and workforce planning',
      'Verifying AI outputs before they reach candidates or employees',
      'Bias and privacy safeguards when AI touches candidate or employee data',
    ],
    roleChanges: [
      'CV screening and shortlisting are increasingly AI-assisted — HR sets fair criteria and reviews outcomes',
      'Routine policy questions are moving to AI assistants, with HR curating accurate answers',
      'HR reporting is shifting from manual spreadsheets to AI-supported insight',
      'Banking regulators and employees expect stronger data-privacy controls around AI',
    ],
    learnNext: [
      'Write effective prompts for everyday HR documents',
      'Run an AI-assisted recruitment workflow with fairness checks',
      'Use AI to analyse HR data and present insights',
      'Apply privacy and human-oversight rules to every AI-assisted HR decision',
    ],
    careerOpportunities: ['AI-enabled HR Business Partner', 'People Analytics Officer', 'Talent Acquisition Specialist (AI-assisted)', 'HR Digital Transformation Lead'],
    prescription: [
      rx('core-fundamentals', 'hr', 1, 'fundamentals', 'Your AI use is occasional — a solid foundation will make every later module faster and safer.'),
      rx('core-prompting', 'hr', 2, 'fundamentals', 'Better prompts will immediately improve the HR letters, policies and job adverts you already draft.'),
      rx('hr-recruitment', 'hr', 3, 'domain', 'Recruitment is the HR area most exposed to AI in banking — learn to use it fairly.'),
      rx('hr-analytics', 'hr', 4, 'domain', 'Moves your reporting from manual spreadsheets to insight leadership will act on.'),
      rx('core-verification', 'hr', 5, 'responsible', 'HR outputs affect people’s careers — every AI-generated fact needs checking.'),
      rx('core-responsible', 'hr', 6, 'responsible', 'Employee and candidate data is highly sensitive in a regulated bank.'),
      rx('hr-challenge', 'hr', 7, 'practical', 'Proves you can design a fair, private, human-led AI recruitment workflow.'),
    ],
    source: 'engine',
  };
  let progress: EmployeeProgress = {
    userId: uid,
    domainId: 'hr',
    path: pathFromAssessment(assessment).map((p) => ({ ...p, addedAt: daysAgo(9) })),
    modules: {
      'core-fundamentals': mp('core-fundamentals', 'completed', 3, [5, 6], 83, 8, 7),
      'core-prompting': mp('core-prompting', 'completed', 3, [4, 6], 72, 6, 4),
      'hr-recruitment': mp('hr-recruitment', 'in-progress', 1, [1, 2], 50, 2),
    },
    skillLevels: baselineSkillLevels(profile, assessment),
    streak: { current: 4, longest: 6, lastActiveDate: dayKey(1) },
    activity: [
      { at: daysAgo(1, 18), type: 'tutor', label: 'Asked the AI Tutor about bias in CV screening' },
      { at: daysAgo(2, 12), type: 'lesson', label: 'Completed lesson: AI-Assisted Recruitment · Lesson 1' },
      { at: daysAgo(4, 9), type: 'lesson', label: 'Completed module: Prompt Engineering for HR Professionals' },
      { at: daysAgo(7, 17), type: 'lesson', label: 'Completed module: AI Fundamentals for HR' },
      { at: daysAgo(9, 10), type: 'path', label: 'Personalised learning path created' },
    ],
    tutorQuestions: 5,
    pace: 'standard',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(1),
  };
  progress = raiseSkills(progress, ['ai-fundamentals'], 2);
  progress = raiseSkills(progress, ['prompt-engineering', 'ai-writing'], 1);
  progress.updatedAt = daysAgo(1);
  return { profile, assessment, progress, submissions: [] as ActivitySubmission[] };
}

// ───────────────────────── Farai — career transition demo ─────────────────────────

function faraiBundle(uid: string) {
  const answers: OnboardingAnswers = {
    industryId: 'retail',
    roleId: 'finance-accounting',
    jobTitle: 'Accounts Clerk',
    experience: '3-5',
    orgAdoption: 'partial',
    deptUsage: 'occasionally',
    personalUsage: 'weekly',
    useCases: ['data-analysis', 'reporting', 'writing'],
    confidence: 2,
    careerObjective: 'transition',
    targetCareer: 'Data Analyst',
    targetDomainId: 'data-analytics',
  };
  const s = computeScores(answers);
  const profile: EmployeeProfile = {
    ...answers,
    userId: uid,
    displayName: 'Farai Ncube',
    department: 'Finance',
    domainId: 'finance',
    onboardingCompletedAt: daysAgo(12),
    updatedAt: daysAgo(12),
  };
  const assessment: ReadinessAssessment = {
    id: 'demo-transition-assessment-1',
    userId: uid,
    kind: 'initial',
    createdAt: daysAgo(12),
    answers,
    personalReadiness: s.personalReadiness,
    workplaceExposure: s.workplaceExposure,
    readinessLevel: readinessLevel(s.personalReadiness),
    priorityState: priorityState(s.personalReadiness, s.workplaceExposure),
    summary:
      'You are an Accounts Clerk in retail, where reconciliations, invoice processing and routine reporting are increasingly being augmented by AI. You already use AI weekly for data work — a strong launchpad for your goal of moving into data analytics.',
    strengths: [
      'Daily spreadsheet work — reconciliations, lookups and pivot tables',
      'Accuracy and attention to detail with financial data',
      'Understands retail business processes, margins and KPIs',
      'Already uses AI weekly for data analysis and reporting',
    ],
    gaps: [
      'Querying data with SQL rather than only spreadsheets',
      'Building dashboards and visual data stories',
      'Verifying AI-generated analysis and formulas',
      'Statistics fundamentals for sound conclusions',
    ],
    roleChanges: [
      'Bank and supplier reconciliations are increasingly automated, shifting clerks towards exception handling',
      'Invoice capture is moving to AI document processing',
      'Routine reports are becoming self-service dashboards',
      'Finance teams value people who can interpret data, not just prepare it',
    ],
    learnNext: [
      'Use AI to write, explain and check SQL queries',
      'Turn analysis into clear dashboards and stories',
      'Build a habit of verifying every AI-generated number',
      'Complete a portfolio-ready analytics challenge',
    ],
    careerOpportunities: ['Junior Data Analyst', 'Finance Data Analyst', 'Business Intelligence Analyst', 'Retail Insights Analyst'],
    prescription: [
      rx('core-fundamentals', 'data-analytics', 1, 'fundamentals', 'Grounds your transition in how AI actually works with data.'),
      rx('da-foundations', 'data-analytics', 2, 'transition', 'SQL is the most critical missing skill for Data Analyst roles — AI can help you learn it fast.'),
      rx('core-prompting', 'data-analytics', 3, 'fundamentals', 'Precise prompts make AI a reliable analysis assistant.'),
      rx('da-visualisation', 'data-analytics', 4, 'transition', 'Analysts are judged on how clearly they communicate insight.'),
      rx('core-verification', 'data-analytics', 5, 'responsible', 'AI-generated formulas and conclusions must be checked before anyone relies on them.'),
      rx('core-responsible', 'data-analytics', 6, 'responsible', 'Customer and sales data must be handled lawfully and confidentially.'),
      rx('da-challenge', 'data-analytics', 7, 'practical', 'A portfolio-ready project that demonstrates your new analytics competency.'),
    ],
    careerTransition: {
      currentRole: 'Accounts Clerk',
      targetRole: 'Data Analyst',
      targetDomainId: 'data-analytics',
      transferableSkills: [
        { skill: 'Advanced spreadsheets', note: 'Lookups, pivots and reconciliations are core analyst tools.' },
        { skill: 'Data accuracy', note: 'Finance-grade attention to detail is rare and valued.' },
        { skill: 'Business understanding', note: 'You know how retail revenue, margins and stock really work.' },
        { skill: 'Reporting', note: 'You already turn numbers into regular reports for managers.' },
      ],
      missingSkills: [
        { skill: 'SQL and data querying', importance: 'critical' },
        { skill: 'Dashboards and data visualisation', importance: 'critical' },
        { skill: 'Statistics fundamentals', importance: 'important' },
        { skill: 'Data storytelling', importance: 'important' },
        { skill: 'Python basics', importance: 'helpful' },
      ],
      aiCompetencies: ['Prompting AI to write and explain SQL', 'AI-assisted data cleaning', 'Verifying AI-generated analysis', 'Responsible handling of customer data'],
      readiness: 48,
      pathway: [
        { step: 1, title: 'AI fundamentals for data work', description: 'Understand what AI can and cannot do with data.', moduleId: 'core-fundamentals' },
        { step: 2, title: 'From spreadsheets to SQL with AI', description: 'Query real datasets with AI as your assistant.', moduleId: 'da-foundations' },
        { step: 3, title: 'Prompting for analysis', description: 'Get accurate, explainable analysis from AI.', moduleId: 'core-prompting' },
        { step: 4, title: 'Visualisation & storytelling', description: 'Build dashboards managers actually use.', moduleId: 'da-visualisation' },
        { step: 5, title: 'Verify and act responsibly', description: 'Check outputs and protect customer data.', moduleId: 'core-verification' },
        { step: 6, title: 'Portfolio challenge', description: 'Complete an end-to-end analysis for your portfolio.', moduleId: 'da-challenge' },
      ],
      outlook:
        'Your spreadsheet fluency and financial accuracy transfer directly to analytics. With focused SQL, visualisation and AI-assisted analysis skills, a move into a junior Data Analyst role within 6–9 months is realistic.',
    },
    source: 'engine',
  };
  const submissions: ActivitySubmission[] = [
    {
      id: 'demo-transition-sub-1',
      userId: uid,
      moduleId: 'da-foundations',
      activityId: 'da-foundations-activity',
      answer:
        'I asked the AI to write a SQL query summarising monthly sales by branch, then checked it against my pivot table. The AI grouped by the wrong date field (invoice date vs payment date), so I corrected it and re-ran. I removed customer names before pasting any data and noted that the Mutare branch totals differed by $1,240 because of a returns adjustment.',
      feedback: {
        score: 72,
        verdict: 'good',
        overall: 'Solid, practical approach — you verified the AI query against an independent source and caught a real error. Strengthen your write-up of assumptions and how you would present the insight.',
        criteria: [
          { criterion: 'Correct use of AI', score: 20, max: 25, comment: 'Clear prompt and sensible use of AI for query drafting.' },
          { criterion: 'Verification', score: 22, max: 25, comment: 'Excellent — you reconciled against a pivot table and caught the date-field error.' },
          { criterion: 'Data handling & privacy', score: 16, max: 20, comment: 'Good anonymisation; mention where the data is stored.' },
          { criterion: 'Insight quality', score: 14, max: 30, comment: 'Explain what the branch difference means for the business.' },
        ],
        strengths: ['Independent verification of AI output', 'Removed personal data before using AI'],
        improvements: ['State assumptions explicitly', 'Add a one-line business recommendation'],
      },
      createdAt: daysAgo(3),
      source: 'engine',
    },
  ];
  let progress: EmployeeProgress = {
    userId: uid,
    domainId: 'data-analytics',
    targetDomainId: 'data-analytics',
    path: pathFromAssessment(assessment).map((p) => ({ ...p, addedAt: daysAgo(12) })),
    modules: {
      'core-fundamentals': mp('core-fundamentals', 'completed', 3, [6, 6], 94, 11, 10),
      'da-foundations': mp('da-foundations', 'in-progress', 1, [2, 3], 67, 5),
    },
    skillLevels: baselineSkillLevels(profile, assessment),
    streak: { current: 2, longest: 5, lastActiveDate: dayKey(1) },
    activity: [
      { at: daysAgo(1, 19), type: 'lesson', label: 'Completed lesson: Data Analysis Foundations · Lesson 1' },
      { at: daysAgo(3, 20), type: 'activity', label: 'Submitted practical: SQL with AI — scored 72%' },
      { at: daysAgo(10, 18), type: 'lesson', label: 'Completed module: AI Fundamentals for Data Analytics' },
      { at: daysAgo(12, 9), type: 'path', label: 'Career transition path created: Accounts Clerk → Data Analyst' },
    ],
    tutorQuestions: 3,
    pace: 'accelerated',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
  };
  progress = raiseSkills(progress, ['ai-fundamentals'], 2);
  progress = raiseSkills(progress, ['sql-data', 'data-interpretation'], 1);
  progress.updatedAt = daysAgo(1);
  return { profile, assessment, progress, submissions };
}

// ───────────────────────── Public demo data (verification page) ─────────────────────────

export async function seedPublicDemoData(db: Database): Promise<void> {
  if (await db.get(COLLECTIONS.certificates, DEMO_CERTIFICATE_ID)) return;
  const cert: Certificate = {
    id: DEMO_CERTIFICATE_ID,
    userId: DEMO_PUBLIC_PROFILE_ID,
    holderName: 'Tatenda Chirwa',
    type: 'domain',
    level: 'AI_READY',
    domainId: 'finance',
    domainName: 'Finance & Accounting',
    competency: 'AI-Augmented Financial Operations',
    competencies: [
      { name: 'AI Fundamentals', skillId: 'ai-fundamentals', status: 'verified' },
      { name: 'Prompt Engineering', skillId: 'prompt-engineering', status: 'verified' },
      { name: 'AI-Assisted Analytics', skillId: 'ai-analytics', status: 'verified' },
      { name: 'Responsible AI', skillId: 'responsible-ai', status: 'verified' },
      { name: 'Output Verification', skillId: 'ai-verification', status: 'verified' },
      { name: 'Finance AI Application', skillId: 'domain-finance', status: 'verified' },
    ],
    readinessScore: 87,
    issueDate: '2026-06-18T09:00:00.000Z',
    expiryDate: '2027-06-18T09:00:00.000Z',
    status: 'valid',
    evidence: { knowledgeScore: 88, capstoneScore: 84, responsibleAIScore: 90, modulesCompleted: 7, practicalsCompleted: 3 },
  };
  const profile: PublicSkillsProfile = {
    userId: DEMO_PUBLIC_PROFILE_ID,
    name: 'Tatenda Chirwa',
    headline: 'Management Accountant · Banking & Finance',
    domainId: 'finance',
    domainName: 'Finance & Accounting',
    readiness: 87,
    readinessLevel: 'AI Ready',
    certification: { id: DEMO_CERTIFICATE_ID, level: 'AI_READY', type: 'domain', issueDate: cert.issueDate },
    competencies: cert.competencies.map((c) => ({ name: c.name, status: 'verified' as const, evidence: 'Final assessment & capstone' })),
    skills: [
      { skillId: 'ai-fundamentals', name: 'AI Fundamentals', level: 3 },
      { skillId: 'prompt-engineering', name: 'Prompt Engineering', level: 3 },
      { skillId: 'financial-analysis', name: 'AI-Assisted Financial Analysis', level: 3 },
      { skillId: 'ai-verification', name: 'AI Output Verification', level: 3 },
      { skillId: 'responsible-ai', name: 'Responsible AI', level: 3 },
      { skillId: 'fraud-detection', name: 'Fraud Detection Awareness', level: 2 },
    ],
    updatedAt: cert.issueDate,
  };
  await db.set(COLLECTIONS.certificates, cert.id, cert);
  await db.set(COLLECTIONS.publicProfiles, profile.userId, profile);
}

async function ensureDemoOrganisation(db: Database, ownerUserId: string) {
  // Rebuild if missing or seeded by an older build without a workforce.
  const existing = await db.get(COLLECTIONS.organisations, DEMO_ORG_ID);
  if (existing) {
    const members = await db.query(COLLECTIONS.workforceMembers, [['organisationId', '==', DEMO_ORG_ID]]);
    if (members.length) return;
  }
  const { organisation, workforce } = buildDemoOrganisation(ownerUserId);
  await db.set(COLLECTIONS.organisations, organisation.id, organisation);
  for (const w of workforce) await db.set(COLLECTIONS.workforceMembers, w.id, w);
}

/** Idempotently seeds a demo persona's data into the given database. */
export async function seedDemo(key: DemoKey, db: Database): Promise<void> {
  await seedPublicDemoData(db);
  const p = DEMO_PERSONAS[key];
  if (await db.get(COLLECTIONS.users, p.uid)) return;
  const base: User = { id: p.uid, name: p.name, email: p.email, role: p.role, isDemo: true, demoKey: key, createdAt: daysAgo(14) };

  if (key === 'employer') {
    await ensureDemoOrganisation(db, p.uid);
    await db.set(COLLECTIONS.users, p.uid, { ...base, organisationId: DEMO_ORG_ID });
    return;
  }

  const bundle = key === 'employee' ? rutendoBundle(p.uid) : faraiBundle(p.uid);
  if (key === 'employee') await ensureDemoOrganisation(db, DEMO_PERSONAS.employer.uid);
  await db.set(COLLECTIONS.users, p.uid, key === 'employee' ? { ...base, organisationId: DEMO_ORG_ID } : base);
  await db.set(COLLECTIONS.employeeProfiles, p.uid, bundle.profile);
  await db.set(COLLECTIONS.readinessAssessments, bundle.assessment.id, bundle.assessment);
  await db.set(COLLECTIONS.employeeProgress, p.uid, bundle.progress);
  for (const s of bundle.submissions) await db.set(COLLECTIONS.activitySubmissions, s.id, s);
}
