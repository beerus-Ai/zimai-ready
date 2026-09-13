import type { DomainId, LearningPathway, ModuleMeta } from '../types';

/**
 * Learning catalogue: domains, module metadata and pathway rules.
 * Lesson content for each module lives in data/content/<domain>.ts (keyed by module id).
 */

export interface Domain {
  id: DomainId;
  name: string; // e.g. "Finance & Accounting"
  shortName: string; // e.g. "Finance"
  professional: string; // e.g. "Finance Professionals"
  competency: string; // certificate competency title
  icon: string;
  color: string; // hex accent
  description: string;
  domainSkillId: string;
  moduleIds: string[]; // [domain-1, domain-2, domain-3 (advanced), challenge]
}

export const DOMAINS: Domain[] = [
  { id: 'finance', name: 'Finance & Accounting', shortName: 'Finance', professional: 'Finance Professionals', competency: 'AI-Augmented Financial Operations', icon: 'Calculator', color: '#034f46', description: 'AI for analysis, reporting, reconciliation and financial risk.', domainSkillId: 'domain-finance', moduleIds: ['fin-analysis', 'fin-automation', 'fin-risk', 'fin-challenge'] },
  { id: 'hr', name: 'Human Resources', shortName: 'HR', professional: 'HR Professionals', competency: 'AI-Enabled People Management', icon: 'Users', color: '#16717f', description: 'AI for recruitment, people analytics and employee experience.', domainSkillId: 'domain-hr', moduleIds: ['hr-recruitment', 'hr-analytics', 'hr-experience', 'hr-challenge'] },
  { id: 'marketing', name: 'Marketing & Sales', shortName: 'Marketing', professional: 'Marketing & Sales Professionals', competency: 'AI-Powered Marketing & Customer Growth', icon: 'Megaphone', color: '#c23a7a', description: 'AI for campaigns, content, insights and sales.', domainSkillId: 'domain-marketing', moduleIds: ['mkt-content', 'mkt-insights', 'mkt-sales', 'mkt-challenge'] },
  { id: 'software', name: 'Software & IT', shortName: 'Software/IT', professional: 'Software & IT Professionals', competency: 'AI-Assisted Software Engineering', icon: 'Code2', color: '#3b4f7a', description: 'AI pair programming, secure code review and IT automation.', domainSkillId: 'domain-software', moduleIds: ['sw-coding', 'sw-security', 'sw-automation', 'sw-challenge'] },
  { id: 'customer-service', name: 'Customer Service', shortName: 'Customer Service', professional: 'Customer Service Professionals', competency: 'AI-Enhanced Customer Experience', icon: 'Headset', color: '#1b8f78', description: 'AI-assisted responses, chatbots and service analytics.', domainSkillId: 'domain-customer-service', moduleIds: ['cs-assist', 'cs-chatbots', 'cs-insights', 'cs-challenge'] },
  { id: 'operations', name: 'Operations', shortName: 'Operations', professional: 'Operations Professionals', competency: 'AI-Optimised Operations', icon: 'Settings2', color: '#dc7110', description: 'AI for processes, maintenance, supply chains and safety.', domainSkillId: 'domain-operations', moduleIds: ['ops-process', 'ops-maintenance', 'ops-safety', 'ops-challenge'] },
  { id: 'management', name: 'Management & Leadership', shortName: 'Management', professional: 'Managers & Leaders', competency: 'AI-Informed Leadership & Decision-Making', icon: 'Crown', color: '#7f1c34', description: 'AI for decisions, strategy, change and governance.', domainSkillId: 'domain-management', moduleIds: ['mgmt-decisions', 'mgmt-strategy', 'mgmt-governance', 'mgmt-challenge'] },
  { id: 'agriculture', name: 'Agriculture', shortName: 'Agriculture', professional: 'Agriculture Professionals', competency: 'AI-Driven Agricultural Productivity', icon: 'Sprout', color: '#5f7a1f', description: 'AI for crops, advisory, climate risk and markets.', domainSkillId: 'domain-agriculture', moduleIds: ['agri-crops', 'agri-advisory', 'agri-markets', 'agri-challenge'] },
  { id: 'healthcare', name: 'Healthcare', shortName: 'Healthcare', professional: 'Healthcare Professionals', competency: 'Safe AI-Assisted Healthcare Delivery', icon: 'HeartPulse', color: '#d6361c', description: 'AI for documentation, decision support and health data.', domainSkillId: 'domain-healthcare', moduleIds: ['hc-admin', 'hc-decision', 'hc-data', 'hc-challenge'] },
  { id: 'education', name: 'Education', shortName: 'Education', professional: 'Educators', competency: 'AI-Enhanced Teaching & Learning', icon: 'GraduationCap', color: '#8a5a2b', description: 'AI for lesson planning, assessment and personalised learning.', domainSkillId: 'domain-education', moduleIds: ['edu-planning', 'edu-assessment', 'edu-personalised', 'edu-challenge'] },
  { id: 'data-analytics', name: 'Data & Analytics', shortName: 'Data Analytics', professional: 'Data Professionals', competency: 'AI-Augmented Data Analysis', icon: 'BarChart3', color: '#46463f', description: 'AI across querying, visualisation, storytelling and prediction.', domainSkillId: 'domain-data-analytics', moduleIds: ['da-foundations', 'da-visualisation', 'da-ml', 'da-challenge'] },
];

export const CORE_MODULE_IDS = ['core-fundamentals', 'core-prompting', 'core-verification', 'core-responsible'] as const;

const CORE_MODULES: ModuleMeta[] = [
  { id: 'core-fundamentals', kind: 'core', title: 'AI Fundamentals for {domain}', summary: 'What AI and generative AI really are, where they help in your work, and where they fall short.', skillIds: ['ai-fundamentals'], estimatedMinutes: 20, level: 'foundation', requiredForCertification: true, icon: 'Sparkles' },
  { id: 'core-prompting', kind: 'core', title: 'Prompt Engineering for {professional}', summary: 'Write prompts that get useful, accurate, work-ready outputs — with context, constraints and examples.', skillIds: ['prompt-engineering', 'ai-writing'], estimatedMinutes: 25, level: 'foundation', requiredForCertification: true, icon: 'MessageSquareText' },
  { id: 'core-verification', kind: 'core', title: 'Verifying AI Outputs: Hallucinations & Fact-Checking', summary: 'Spot confident-but-wrong answers and build a simple verification habit before anything leaves your desk.', skillIds: ['ai-verification', 'critical-thinking'], estimatedMinutes: 20, level: 'intermediate', requiredForCertification: true, icon: 'SearchCheck' },
  { id: 'core-responsible', kind: 'core', title: 'Responsible AI, Privacy & Human Oversight', summary: 'Protect confidential data, recognise bias and keep humans accountable for AI-assisted decisions.', skillIds: ['responsible-ai', 'data-privacy', 'bias-awareness'], estimatedMinutes: 25, level: 'foundation', requiredForCertification: true, icon: 'ShieldCheck' },
];

type DM = [id: string, domainId: DomainId, title: string, summary: string, skillIds: string[], minutes: number, icon: string];

// [domain-1, domain-2] are intermediate & required; domain-3 is advanced & optional; challenge is required.
const DOMAIN_MODULE_DEFS: { core: DM[]; advanced: DM; challenge: DM }[] = [
  {
    core: [
      ['fin-analysis', 'finance', 'AI-Assisted Financial Analysis & Variance Commentary', 'Use AI to analyse financial statements and draft variance commentary — then check every number.', ['financial-analysis', 'ai-analytics'], 25, 'LineChart'],
      ['fin-automation', 'finance', 'Automating Reconciliations & Reporting with AI', 'Speed up reconciliations, month-end reporting and invoice processing without losing control.', ['ai-automation', 'domain-finance'], 25, 'Workflow'],
    ],
    advanced: ['fin-risk', 'finance', 'AI for Fraud Detection & Financial Risk', 'How AI flags anomalies, what false positives cost, and how to act on alerts responsibly.', ['fraud-detection', 'ai-governance'], 25, 'ShieldAlert'],
    challenge: ['fin-challenge', 'finance', 'Finance AI Workplace Challenge', 'Analyse fictional financial information with AI and verify its conclusions.', ['domain-finance', 'ai-verification', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['hr-recruitment', 'hr', 'AI-Assisted Recruitment & Fair Screening', 'Use AI across job descriptions, screening and interviews while guarding fairness and privacy.', ['ai-recruitment', 'bias-awareness'], 25, 'UserSearch'],
      ['hr-analytics', 'hr', 'HR Analytics with AI', 'Turn HR data into insight on turnover, engagement and workforce planning.', ['ai-analytics', 'domain-hr'], 25, 'PieChart'],
    ],
    advanced: ['hr-experience', 'hr', 'AI for Employee Experience & Policy Communication', 'Personalise onboarding, answer policy queries and communicate change with AI.', ['ai-writing', 'domain-hr'], 20, 'HeartHandshake'],
    challenge: ['hr-challenge', 'hr', 'HR AI Workplace Challenge', 'Design an AI-assisted recruitment workflow that is fair, private and human-led.', ['domain-hr', 'bias-awareness', 'data-privacy'], 30, 'Trophy'],
  },
  {
    core: [
      ['mkt-content', 'marketing', 'AI for Campaigns & Content Creation', 'Plan campaigns and create on-brand content faster — and judge what is actually good.', ['ai-writing', 'domain-marketing'], 25, 'PenTool'],
      ['mkt-insights', 'marketing', 'Customer Insights & Segmentation with AI', 'Use AI to segment customers, read sentiment and find growth opportunities.', ['ai-analytics', 'data-interpretation'], 25, 'Target'],
    ],
    advanced: ['mkt-sales', 'marketing', 'AI-Assisted Sales & Personalisation at Scale', 'Lead scoring, personalised outreach and forecasting with AI.', ['customer-ai', 'ai-automation'], 20, 'TrendingUp'],
    challenge: ['mkt-challenge', 'marketing', 'Marketing AI Workplace Challenge', 'Build an AI-assisted campaign and critically evaluate the quality of its output.', ['domain-marketing', 'ai-verification', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['sw-coding', 'software', 'AI Pair Programming & Code Review', 'Code, refactor, test and document with AI assistants — while staying the engineer in charge.', ['ai-coding'], 25, 'Code2'],
      ['sw-security', 'software', 'Securing AI-Generated Code', 'Catch insecure patterns, licence issues and subtle bugs in AI-suggested code.', ['ai-verification', 'domain-software'], 25, 'Lock'],
    ],
    advanced: ['sw-automation', 'software', 'AI in DevOps, Testing & IT Support', 'Automate test generation, incident triage and service-desk workflows with AI.', ['ai-automation', 'ai-coding'], 25, 'Server'],
    challenge: ['sw-challenge', 'software', 'Software AI Workplace Challenge', 'Debug a fictional system with AI while identifying security and correctness problems.', ['domain-software', 'ai-verification', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['cs-assist', 'customer-service', 'AI-Assisted Responses & Knowledge Bases', 'Draft faster, friendlier, accurate responses and keep knowledge bases useful.', ['customer-ai', 'ai-writing'], 20, 'MessagesSquare'],
      ['cs-chatbots', 'customer-service', 'Working Alongside Chatbots & Designing Escalation', 'Know what chatbots should handle, when humans step in and how to hand over well.', ['ai-automation', 'domain-customer-service'], 25, 'Bot'],
    ],
    advanced: ['cs-insights', 'customer-service', 'Customer Sentiment & Service Analytics', 'Use AI to read complaints, spot trends and improve service quality.', ['ai-analytics', 'data-interpretation'], 20, 'Smile'],
    challenge: ['cs-challenge', 'customer-service', 'Customer Service AI Workplace Challenge', 'Handle a fictional complaint surge with AI while protecting customers and quality.', ['domain-customer-service', 'data-privacy', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['ops-process', 'operations', 'AI for Process Optimisation & Workflow Automation', 'Map processes, find bottlenecks and automate routine steps with AI.', ['ai-automation', 'domain-operations'], 25, 'Cog'],
      ['ops-maintenance', 'operations', 'Predictive Maintenance & Supply Chain Forecasting', 'Understand AI forecasts for equipment, inventory and logistics — and their limits.', ['predictive-analytics', 'ai-maintenance'], 25, 'Truck'],
    ],
    advanced: ['ops-safety', 'operations', 'AI for Safety, Quality & Risk Monitoring', 'Use AI to support — never replace — safety and quality processes.', ['safety-ai', 'data-interpretation'], 20, 'HardHat'],
    challenge: ['ops-challenge', 'operations', 'Operations AI Workplace Challenge', 'Use AI to improve a fictional operation while checking assumptions and safety risks.', ['domain-operations', 'ai-verification', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['mgmt-decisions', 'management', 'AI-Assisted Decision-Making', 'Use AI to frame options and analyse information without handing over judgement.', ['decision-support', 'critical-thinking'], 25, 'Brain'],
      ['mgmt-strategy', 'management', 'Leading AI Adoption & Change', 'Identify AI opportunities, bring teams along and measure value.', ['ai-strategy', 'domain-management'], 25, 'Compass'],
    ],
    advanced: ['mgmt-governance', 'management', 'AI Governance, Policy & Risk for Leaders', 'Set AI policies, controls and accountability for your team or organisation.', ['ai-governance', 'responsible-ai'], 25, 'Scale'],
    challenge: ['mgmt-challenge', 'management', 'Management AI Workplace Challenge', 'Analyse business information with AI without blindly accepting its recommendation.', ['domain-management', 'decision-support', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['agri-crops', 'agriculture', 'AI for Crop Monitoring & Yield Forecasting', 'Satellite, weather and sensor data turned into planting and yield decisions.', ['predictive-analytics', 'domain-agriculture'], 25, 'Leaf'],
      ['agri-advisory', 'agriculture', 'AI Advisory for Farmers & Extension Services', 'Use AI to give farmers timely, local, trustworthy advice.', ['ai-writing', 'domain-agriculture'], 20, 'Sprout'],
    ],
    advanced: ['agri-markets', 'agriculture', 'Climate Risk, Markets & Supply Chains with AI', 'Price forecasts, climate risk and value-chain decisions with AI.', ['data-interpretation', 'ai-analytics'], 25, 'CloudSun'],
    challenge: ['agri-challenge', 'agriculture', 'Agriculture AI Workplace Challenge', 'Plan a fictional season with AI while testing its assumptions against local realities.', ['domain-agriculture', 'ai-verification', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['hc-admin', 'healthcare', 'AI for Clinical Documentation & Administration', 'Reduce paperwork with AI while keeping records accurate and confidential.', ['ai-writing', 'domain-healthcare'], 20, 'FileText'],
      ['hc-decision', 'healthcare', 'AI Decision Support: Benefits & Limits', 'How diagnostic and triage AI works, where it fails, and why clinicians decide.', ['decision-support', 'ai-verification'], 25, 'Stethoscope'],
    ],
    advanced: ['hc-data', 'healthcare', 'Patient Data Privacy & Health Analytics', 'Use health data for insight while protecting patient privacy.', ['data-privacy', 'ai-analytics'], 25, 'Database'],
    challenge: ['hc-challenge', 'healthcare', 'Healthcare AI Workplace Challenge', 'Use AI to improve a fictional clinic workflow while protecting patient safety and privacy.', ['domain-healthcare', 'data-privacy', 'critical-thinking'], 30, 'Trophy'],
  },
  {
    core: [
      ['edu-planning', 'education', 'AI for Lesson Planning & Content Creation', 'Plan lessons, differentiate materials and create resources with AI.', ['ai-writing', 'domain-education'], 20, 'BookOpen'],
      ['edu-assessment', 'education', 'AI in Assessment, Feedback & Academic Integrity', 'Faster, fairer feedback with AI — and a sensible approach to AI-assisted work.', ['ai-verification', 'domain-education'], 25, 'ClipboardCheck'],
    ],
    advanced: ['edu-personalised', 'education', 'Personalised Learning & Learner Analytics', 'Use learner data and AI tutors to support every learner, responsibly.', ['ai-analytics', 'data-privacy'], 20, 'School'],
    challenge: ['edu-challenge', 'education', 'Education AI Workplace Challenge', 'Design an AI-supported unit of learning that is accurate, inclusive and honest.', ['domain-education', 'ai-verification', 'responsible-ai'], 30, 'Trophy'],
  },
  {
    core: [
      ['da-foundations', 'data-analytics', 'Data Analysis Foundations with AI (Excel → SQL)', 'Clean, query and summarise data with AI as your assistant — from spreadsheets to SQL.', ['sql-data', 'data-interpretation'], 30, 'Database'],
      ['da-visualisation', 'data-analytics', 'AI-Assisted Visualisation & Data Storytelling', 'Choose the right chart, build dashboards and tell a clear story with data.', ['data-visualisation', 'ai-analytics'], 25, 'BarChart3'],
    ],
    advanced: ['da-ml', 'data-analytics', 'Introduction to Predictive Analytics & ML Concepts', 'Understand forecasting and machine-learning models well enough to use them wisely.', ['predictive-analytics'], 30, 'Brain'],
    challenge: ['da-challenge', 'data-analytics', 'Data Analytics AI Workplace Challenge', 'Analyse a fictional dataset with AI, verify the analysis and present insights.', ['domain-data-analytics', 'ai-verification', 'data-interpretation'], 30, 'Trophy'],
  },
];

const toMeta = ([id, domainId, title, summary, skillIds, minutes, icon]: DM, kind: ModuleMeta['kind'], level: ModuleMeta['level'], required: boolean): ModuleMeta => ({
  id,
  kind,
  domainId,
  title,
  summary,
  skillIds,
  estimatedMinutes: minutes,
  level,
  requiredForCertification: required,
  icon,
});

export const MODULES: ModuleMeta[] = [
  ...CORE_MODULES,
  ...DOMAIN_MODULE_DEFS.flatMap((d) => [
    ...d.core.map((m) => toMeta(m, 'domain', 'intermediate', true)),
    toMeta(d.advanced, 'domain', 'advanced', false),
    toMeta(d.challenge, 'challenge', 'intermediate', true),
  ]),
];

export const getDomain = (id?: string) => DOMAINS.find((d) => d.id === id);
export const getModule = (id: string) => MODULES.find((m) => m.id === id);

/** Personalised module title — fills {domain}/{professional} for shared core modules. */
export function moduleTitle(moduleOrId: ModuleMeta | string, domainId?: DomainId): string {
  const m = typeof moduleOrId === 'string' ? getModule(moduleOrId) : moduleOrId;
  if (!m) return String(moduleOrId);
  const d = getDomain(domainId ?? m.domainId) ?? getDomain('operations')!;
  return m.title.replace('{domain}', d.shortName).replace('{professional}', d.professional);
}

/** Default full pathway for a domain (the prescription personalises, re-orders and trims this). */
export function getPathway(domainId: DomainId): LearningPathway {
  const d = getDomain(domainId)!;
  const [d1, d2, d3, challenge] = d.moduleIds;
  return { domainId, moduleIds: ['core-fundamentals', 'core-prompting', d1, d2, 'core-verification', 'core-responsible', d3, challenge] };
}

/** All modules a learner in `domainId` could be prescribed (core + domain + optional target domain). */
export function candidateModules(domainId: DomainId, targetDomainId?: DomainId): ModuleMeta[] {
  const ids = new Set<string>([...CORE_MODULE_IDS, ...getDomain(domainId)!.moduleIds]);
  if (targetDomainId && targetDomainId !== domainId) getDomain(targetDomainId)!.moduleIds.forEach((id) => ids.add(id));
  return MODULES.filter((m) => ids.has(m.id));
}

export const challengeModuleId = (domainId: DomainId) => getDomain(domainId)!.moduleIds[3];

const INDUSTRY_DOMAINS: Record<string, DomainId> = { agriculture: 'agriculture', healthcare: 'healthcare', education: 'education' };
const GENERALIST_ROLES = new Set(['operations', 'administration', 'other', 'engineering', 'procurement']);

/** Resolves the learning domain from industry + functional role. */
export function resolveDomain(industryId: string, roleId: string): DomainId {
  if (GENERALIST_ROLES.has(roleId) && INDUSTRY_DOMAINS[industryId]) return INDUSTRY_DOMAINS[industryId];
  const map: Record<string, DomainId> = {
    'finance-accounting': 'finance',
    'human-resources': 'hr',
    'software-it': 'software',
    operations: 'operations',
    marketing: 'marketing',
    sales: 'marketing',
    'customer-service': 'customer-service',
    administration: 'operations',
    management: 'management',
    engineering: 'operations',
    procurement: 'operations',
    'data-analytics': 'data-analytics',
    other: 'operations',
  };
  return map[roleId] ?? 'operations';
}

/** Quick-pick target careers for the "Transition into another field" question. */
export const TARGET_CAREERS: { id: string; label: string; domainId: DomainId; icon: string }[] = [
  { id: 'data-analyst', label: 'Data Analyst', domainId: 'data-analytics', icon: 'BarChart3' },
  { id: 'business-analyst', label: 'Business Analyst', domainId: 'data-analytics', icon: 'LineChart' },
  { id: 'software-developer', label: 'Software Developer', domainId: 'software', icon: 'Code2' },
  { id: 'ai-automation', label: 'AI / Automation Specialist', domainId: 'software', icon: 'Bot' },
  { id: 'digital-marketing', label: 'Digital Marketing', domainId: 'marketing', icon: 'Megaphone' },
  { id: 'people-analytics', label: 'HR / People Analytics', domainId: 'hr', icon: 'Users' },
  { id: 'project-manager', label: 'Project / Operations Manager', domainId: 'management', icon: 'Compass' },
  { id: 'customer-experience', label: 'Customer Experience', domainId: 'customer-service', icon: 'Headset' },
];

/** Best-effort mapping of a free-text target career to a learning domain. */
export function resolveTargetDomain(text?: string): DomainId | undefined {
  if (!text) return undefined;
  const t = text.toLowerCase();
  const quick = TARGET_CAREERS.find((c) => c.label.toLowerCase() === t || c.id === t);
  if (quick) return quick.domainId;
  const rules: [RegExp, DomainId][] = [
    [/data|analyt|business intel|\bbi\b|statistic|insight/, 'data-analytics'],
    [/software|develop|program|engineer.*software|cyber|devops|\bit\b|automation|ai special|machine learning/, 'software'],
    [/market|brand|digital|sales|social media|content/, 'marketing'],
    [/\bhr\b|human res|people|talent|recruit/, 'hr'],
    [/financ|account|audit|tax|credit|bank/, 'finance'],
    [/customer|client|service|call cent/, 'customer-service'],
    [/manag|lead|director|project|strategy/, 'management'],
    [/operat|supply|logistic|procure|production/, 'operations'],
    [/agri|farm|crop|livestock/, 'agriculture'],
    [/health|nurs|clinic|medic|pharm/, 'healthcare'],
    [/teach|lectur|educat|train|tutor/, 'education'],
  ];
  return rules.find(([re]) => re.test(t))?.[1];
}
