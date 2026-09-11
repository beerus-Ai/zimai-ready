import type {
  AISource,
  CareerTransitionAnalysis,
  DomainId,
  FunctionalRole,
  Industry,
  ModuleMeta,
  OnboardingAnswers,
  PrescriptionCategory,
  ReadinessAssessment,
  SkillPrescriptionItem,
  UseCase,
} from '../../types';
import { generateJSON, Type } from '../../services/gemini';
import type { Schema } from '../../services/gemini';
import {
  candidateModules,
  challengeModuleId,
  getDomain,
  getModule,
  moduleTitle,
  resolveDomain,
  resolveTargetDomain,
  TARGET_CAREERS,
} from '../../data/catalog';
import type { Domain } from '../../data/catalog';
import { getIndustry, industryName } from '../../data/industries';
import { getRole, roleName } from '../../data/roles';
import { skillName } from '../../data/skills';
import { boundedScore, computeScores } from '../../lib/scoring';
import type { ReadinessScores } from '../../lib/scoring';
import { clamp, exposureLabel, priorityState, readinessLevel } from '../../lib/readiness';
import { objectiveLabel } from '../../lib/aiContext';
import { nowISO, uid } from '../../lib/utils';

/**
 * ZimAI Ready — Readiness engine.
 *
 * ASSESS → ANALYSE → RECOMMEND. The deterministic scores from lib/scoring are
 * always the anchor. Gemini personalises the narrative, may refine scores by at
 * most ±10 points and chooses/explains the AI Skills Prescription from the
 * catalogue. Every Gemini output is validated and repaired; when Gemini is not
 * available the built-in engine below produces a complete, personalised
 * analysis on its own.
 */

// ───────────────────────────── Public types ─────────────────────────────

export interface ReadinessAnalysisInput {
  answers: OnboardingAnswers;
  userId: string;
  displayName: string;
  kind?: 'initial' | 'reassessment';
  previous?: ReadinessAssessment | null;
}

export interface AnalysisDomains {
  domainId: DomainId; // current-role learning domain
  targetDomainId?: DomainId; // transition target domain (transitioners only)
  learningDomainId: DomainId; // domain the prescription is built for
}

// ───────────────────────────── Small helpers ─────────────────────────────

const USE_CASE_LABEL: Record<UseCase, string> = {
  writing: 'writing',
  research: 'research',
  'data-analysis': 'data analysis',
  automation: 'automation',
  coding: 'coding',
  'customer-support': 'customer support',
  reporting: 'reporting',
  brainstorming: 'brainstorming',
  'decision-support': 'decision support',
  none: 'nothing yet',
};

const EXPERIENCE_TEXT: Record<OnboardingAnswers['experience'], string> = {
  '0-2': 'Up to 2 years',
  '3-5': '3–5 years',
  '6-10': '6–10 years',
  '11-15': '11–15 years',
  '16+': '16+ years',
};

const ADVANCED_USES: UseCase[] = ['data-analysis', 'automation', 'coding', 'decision-support'];
const REGULATED_INDUSTRIES = new Set(['banking', 'healthcare', 'government', 'telecoms', 'professional-services']);

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lcFirst = (s: string) => (s && !/^[A-Z]{2}/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
/** Lower-cases words for use mid-sentence, keeping acronyms and mixed-case tokens ("IT", "CV", "Excel/SQL"). */
const lower = (s: string) =>
  s
    .split(' ')
    .map((w) => (/\//.test(w) || /[A-Z]/.test(w.slice(1)) ? w : w.toLowerCase()))
    .join(' ');

/** "a Data Analyst role" / "an HR / People Analytics role". */
const rolePhrase = (t: string) => `${article(t)} ${t} role`;

/** Entry-level title for a target career ("Junior Data Analyst", "Digital Marketing Specialist"). */
function juniorTitle(t: string): string {
  if (/junior|trainee|graduate|intern/i.test(t)) return t;
  if (/(manager|lead|director|head)$/i.test(t)) return t;
  if (/(analyst|developer|specialist|officer|engineer|designer|consultant|scientist|coordinator|accountant|administrator|advis[eo]r|architect|technician|nurse|teacher|pilot|agent|representative|marketer|writer|planner|trainer|tester|clerk|assistant)$/i.test(t)) return `Junior ${t}`;
  return `${t} Specialist`;
}

export function listJoin(items: string[]): string {
  const xs = items.filter(Boolean);
  if (xs.length <= 1) return xs[0] ?? '';
  return `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}

/** "a"/"an" that also handles acronyms such as "HR Officer" or "M&E Officer". */
export function article(word: string): string {
  const w = word.trim();
  if (/^[A-Z]{2}|^[A-Z]&/.test(w)) return 'AEFHILMNORSX'.includes(w[0]) ? 'an' : 'a';
  return /^[aeiou]/i.test(w) ? 'an' : 'a';
}

const titleCase = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .map((w) => (/^[A-Z]{2,}/.test(w) || /[/&]/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

// ───────────────────────────── Knowledge base (engine) ─────────────────────────────

interface DomainInfo {
  data: string;
  audience: string;
  artefact: string;
  stakes: string;
  careers: string[];
  aiCompetencies: string[];
  extraMissing: { skill: string; importance: 'critical' | 'important' | 'helpful' }[];
  analyticsGap: string;
  promptGap: string;
}

const DOMAIN_INFO: Record<DomainId, DomainInfo> = {
  finance: {
    data: 'customer account and financial data',
    audience: 'managers, auditors or regulators',
    artefact: 'figure, formula and commentary',
    stakes: 'Financial figures must be right — every AI-generated number and formula needs checking before it reaches a report.',
    careers: ['AI-enabled Financial Analyst', 'Finance Automation Specialist', 'FP&A Analyst (AI-assisted forecasting)', 'Risk & Fraud Analytics Officer'],
    aiCompetencies: ['Prompting AI for variance and ratio analysis', 'Automating reconciliations with review controls', 'Verifying AI-generated figures and formulas', 'Protecting confidential financial data'],
    extraMissing: [
      { skill: 'Accounting principles & IFRS basics', importance: 'important' },
      { skill: 'Financial modelling', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse financial data — trends, ratios and forecasts',
    promptGap: 'Structured prompting for finance work (commentary, reconciliations, management reports)',
  },
  hr: {
    data: 'employee and candidate data',
    audience: 'candidates or employees',
    artefact: 'HR document and insight',
    stakes: 'HR outputs affect people’s careers — every AI-generated fact, summary or recommendation needs checking.',
    careers: ['AI-enabled HR Business Partner', 'People Analytics Officer', 'Talent Acquisition Specialist (AI-assisted)', 'HR Digital Transformation Lead'],
    aiCompetencies: ['Fair, transparent AI-assisted screening', 'AI-supported people analytics', 'Writing HR policies and adverts with AI', 'Protecting employee and candidate privacy'],
    extraMissing: [
      { skill: 'Employment law & HR policy basics', importance: 'important' },
      { skill: 'HR information systems', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse HR data — turnover, engagement and workforce planning',
    promptGap: 'Structured prompting for HR documents (job descriptions, policies, interview guides)',
  },
  marketing: {
    data: 'customer and prospect data',
    audience: 'customers and the public',
    artefact: 'claim, statistic and piece of content',
    stakes: 'Published content carries your brand — AI-generated claims and statistics must be checked before they go live.',
    careers: ['AI-powered Digital Marketer', 'Marketing Analytics Specialist', 'Content Strategist (AI-assisted)', 'Growth & CRM Manager'],
    aiCompetencies: ['Prompting AI for on-brand campaign content', 'AI-driven customer segmentation', 'Fact-checking AI-generated marketing claims', 'Responsible use of customer data'],
    extraMissing: [
      { skill: 'Digital channel & campaign analytics', importance: 'important' },
      { skill: 'Brand and copywriting fundamentals', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse campaign and customer data for insight',
    promptGap: 'Structured prompting for campaigns, content and sales messaging',
  },
  software: {
    data: 'source code, credentials and system data',
    audience: 'production systems and users',
    artefact: 'line of code and configuration',
    stakes: 'AI-suggested code can look right and still be insecure — review and test everything before it ships.',
    careers: ['AI-assisted Software Engineer', 'DevOps & Automation Engineer', 'AI Solutions Developer', 'IT Service Automation Lead'],
    aiCompetencies: ['AI pair programming with code review', 'Securing AI-generated code', 'Automating tests and IT workflows with AI', 'Protecting credentials and system data'],
    extraMissing: [
      { skill: 'Programming fundamentals (e.g. Python or JavaScript)', importance: 'critical' },
      { skill: 'Version control with Git', importance: 'important' },
    ],
    analyticsGap: 'Using AI to analyse logs, incidents and system data',
    promptGap: 'Structured prompting for coding, debugging and documentation',
  },
  'customer-service': {
    data: 'customer personal and account data',
    audience: 'customers',
    artefact: 'response and knowledge-base answer',
    stakes: 'Customers act on what you tell them — AI-drafted answers must be accurate and on-policy.',
    careers: ['AI-enhanced Customer Experience Specialist', 'Chatbot & Knowledge-Base Curator', 'Service Quality Analyst', 'Customer Insights Officer'],
    aiCompetencies: ['Drafting accurate responses with AI', 'Designing chatbot-to-human escalation', 'Reading customer sentiment with AI', 'Protecting customer data'],
    extraMissing: [
      { skill: 'CRM and ticketing tools', importance: 'important' },
      { skill: 'Service design basics', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse complaints, tickets and customer sentiment',
    promptGap: 'Structured prompting for customer responses and knowledge articles',
  },
  operations: {
    data: 'operational, supplier and safety data',
    audience: 'supervisors, suppliers and safety teams',
    artefact: 'forecast, schedule and recommendation',
    stakes: 'Operational decisions affect safety and cost — AI forecasts and schedules need a human sense-check.',
    careers: ['AI-enabled Operations Analyst', 'Process Automation Specialist', 'Supply Chain Planner (AI forecasting)', 'Maintenance Planning Lead'],
    aiCompetencies: ['Automating routine process steps with AI', 'Interpreting AI forecasts and their limits', 'Using AI to support safety monitoring', 'Protecting operational and supplier data'],
    extraMissing: [
      { skill: 'Process mapping & lean basics', importance: 'important' },
      { skill: 'Supply chain fundamentals', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse operational data — bottlenecks, stock and downtime',
    promptGap: 'Structured prompting for schedules, reports and procedures',
  },
  management: {
    data: 'confidential business and staff data',
    audience: 'boards, teams and stakeholders',
    artefact: 'analysis and recommendation',
    stakes: 'Leaders are accountable for AI-informed decisions — recommendations must be challenged, not accepted blindly.',
    careers: ['AI Transformation Lead', 'Head of Digital Operations', 'AI-informed Strategy Manager', 'Programme Manager (AI initiatives)'],
    aiCompetencies: ['AI-assisted decision analysis', 'Leading AI adoption and change', 'Setting AI governance and policy', 'Challenging AI recommendations'],
    extraMissing: [
      { skill: 'Project planning & stakeholder management', importance: 'critical' },
      { skill: 'Budgeting & business cases', importance: 'important' },
    ],
    analyticsGap: 'Using AI to analyse performance data for better decisions',
    promptGap: 'Structured prompting for strategy papers, board reports and decisions',
  },
  agriculture: {
    data: 'farmer, field and market data',
    audience: 'farmers and agribusiness partners',
    artefact: 'forecast and piece of advice',
    stakes: 'Farmers act on advice — AI forecasts must be tested against local conditions before they are shared.',
    careers: ['AgriTech Advisory Specialist', 'Crop & Climate Data Analyst', 'Digital Extension Officer', 'Agri Value-Chain Analyst'],
    aiCompetencies: ['Interpreting AI crop and weather forecasts', 'Delivering AI-supported farmer advice', 'Testing AI outputs against local realities', 'Protecting farmer data'],
    extraMissing: [
      { skill: 'Agronomy fundamentals', importance: 'important' },
      { skill: 'Agricultural value chains', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse crop, weather and market data',
    promptGap: 'Structured prompting for farmer advisories and field reports',
  },
  healthcare: {
    data: 'patient health records',
    audience: 'patients and clinicians',
    artefact: 'clinical note and summary',
    stakes: 'Patient safety depends on accuracy — AI-generated notes and suggestions must always be clinically checked.',
    careers: ['Clinical Informatics Officer', 'Health Data Analyst', 'Digital Health Coordinator', 'Clinical Documentation Lead (AI-assisted)'],
    aiCompetencies: ['Safe AI-assisted clinical documentation', 'Understanding decision-support limits', 'Protecting patient privacy', 'Clinician-led oversight of AI'],
    extraMissing: [
      { skill: 'Clinical governance basics', importance: 'important' },
      { skill: 'Health information systems', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse health and service data safely',
    promptGap: 'Structured prompting for clinical documentation and administration',
  },
  education: {
    data: 'learner records and assessment data',
    audience: 'learners and parents',
    artefact: 'lesson resource and piece of feedback',
    stakes: 'Learners trust what they are taught — AI-generated content must be accurate and age-appropriate.',
    careers: ['AI-enhanced Educator', 'Learning Designer (AI-assisted)', 'EdTech Coordinator', 'Learner Analytics Officer'],
    aiCompetencies: ['AI-assisted lesson planning', 'Fair AI-supported feedback', 'Handling AI-assisted learner work', 'Protecting learner data'],
    extraMissing: [
      { skill: 'Pedagogy & curriculum design', importance: 'important' },
      { skill: 'Learning technologies', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to analyse learner progress and assessment data',
    promptGap: 'Structured prompting for lesson plans, resources and feedback',
  },
  'data-analytics': {
    data: 'customer, sales and personal data',
    audience: 'decision-makers',
    artefact: 'query, formula and conclusion',
    stakes: 'AI-generated queries and conclusions must be checked before anyone relies on them.',
    careers: ['Junior Data Analyst', 'Business Intelligence Analyst', 'Insights Analyst', 'M&E Data Officer'],
    aiCompetencies: ['Prompting AI to write and explain SQL', 'AI-assisted data cleaning', 'Verifying AI-generated analysis', 'Responsible handling of customer data'],
    extraMissing: [
      { skill: 'Statistics fundamentals', importance: 'important' },
      { skill: 'Python basics', importance: 'helpful' },
    ],
    analyticsGap: 'Using AI to speed up querying, cleaning and visualisation',
    promptGap: 'Structured prompting for queries, analysis and insight reports',
  },
};

/** Imperative "what you will be able to do" per domain module. */
const MODULE_ACTION: Record<string, string> = {
  'fin-analysis': 'Use AI to analyse statements and draft variance commentary — then check every number',
  'fin-automation': 'Speed up reconciliations and month-end reporting with AI without losing control',
  'fin-risk': 'Understand how AI flags fraud and anomalies, and act on alerts responsibly',
  'fin-challenge': 'Analyse fictional financial information with AI and verify its conclusions',
  'hr-recruitment': 'Run an AI-assisted recruitment workflow with fairness and privacy checks',
  'hr-analytics': 'Use AI to analyse HR data and present insight on turnover and engagement',
  'hr-experience': 'Personalise onboarding and policy communication with AI',
  'hr-challenge': 'Design a fair, private and human-led AI recruitment workflow',
  'mkt-content': 'Plan campaigns and create on-brand content faster — and judge what is actually good',
  'mkt-insights': 'Segment customers and read sentiment with AI to find growth opportunities',
  'mkt-sales': 'Use AI for lead scoring, personalised outreach and forecasting',
  'mkt-challenge': 'Build an AI-assisted campaign and critically evaluate its output',
  'sw-coding': 'Code, refactor, test and document with AI while staying the engineer in charge',
  'sw-security': 'Catch insecure patterns and subtle bugs in AI-suggested code',
  'sw-automation': 'Automate testing, incident triage and service-desk workflows with AI',
  'sw-challenge': 'Debug a fictional system with AI while spotting security and correctness issues',
  'cs-assist': 'Draft faster, friendlier and accurate customer responses with AI',
  'cs-chatbots': 'Work alongside chatbots and design good escalation to humans',
  'cs-insights': 'Use AI to read complaints, spot trends and lift service quality',
  'cs-challenge': 'Handle a fictional complaint surge with AI while protecting customers',
  'ops-process': 'Map processes, find bottlenecks and automate routine steps with AI',
  'ops-maintenance': 'Interpret AI forecasts for equipment, inventory and logistics — and their limits',
  'ops-safety': 'Use AI to support safety, quality and risk monitoring',
  'ops-challenge': 'Improve a fictional operation with AI while checking assumptions and safety',
  'mgmt-decisions': 'Use AI to frame options and analyse information without handing over judgement',
  'mgmt-strategy': 'Identify AI opportunities, lead your team through change and measure value',
  'mgmt-governance': 'Set AI policies, controls and accountability for your team',
  'mgmt-challenge': 'Analyse business information with AI without blindly accepting its recommendation',
  'agri-crops': 'Turn satellite, weather and sensor data into planting and yield decisions',
  'agri-advisory': 'Give farmers timely, local and trustworthy AI-supported advice',
  'agri-markets': 'Use AI for price forecasts, climate risk and value-chain decisions',
  'agri-challenge': 'Plan a fictional season with AI and test it against local realities',
  'hc-admin': 'Reduce clinical paperwork with AI while keeping records accurate and confidential',
  'hc-decision': 'Understand where diagnostic and triage AI helps, where it fails, and why clinicians decide',
  'hc-data': 'Use health data for insight while protecting patient privacy',
  'hc-challenge': 'Improve a fictional clinic workflow with AI while protecting patients',
  'edu-planning': 'Plan lessons and create differentiated resources with AI',
  'edu-assessment': 'Give faster, fairer feedback with AI and handle AI-assisted work sensibly',
  'edu-personalised': 'Use learner data and AI tutors to support every learner responsibly',
  'edu-challenge': 'Design an AI-supported unit of learning that is accurate and inclusive',
  'da-foundations': 'Clean, query and summarise data with AI — from spreadsheets to SQL',
  'da-visualisation': 'Choose the right chart, build dashboards and tell a clear data story',
  'da-ml': 'Understand forecasting and machine-learning models well enough to use them wisely',
  'da-challenge': 'Analyse a fictional dataset with AI, verify it and present the insight',
};

/** How AI is changing each functional task (role transformation, never replacement). */
const TASK_CHANGE: Record<string, string> = {
  Reconciliations: 'Bank and supplier reconciliations are increasingly automated, shifting your time towards exception handling',
  'Management reporting': 'Management reports are moving to AI-drafted, self-service dashboards — interpretation becomes the key skill',
  'Variance analysis': 'AI can draft variance commentary in seconds; your value is checking it and explaining the “why”',
  'Invoice processing': 'Invoice capture is moving to AI document processing, with people reviewing the exceptions',
  Forecasting: 'Forecasts increasingly come from AI models — challenging their assumptions is now part of the job',
  'CV screening': 'CV screening and shortlisting are increasingly AI-assisted — HR sets fair criteria and reviews outcomes',
  'Job descriptions': 'Job adverts and descriptions can be drafted with AI, with HR ensuring accuracy and inclusive language',
  'Employee analytics': 'Employee analytics is shifting from manual spreadsheets to AI-supported insight on turnover and engagement',
  'Policy queries': 'Routine policy questions are moving to AI assistants, with HR curating accurate answers',
  'HR reporting': 'HR reporting is becoming faster and more automated, raising expectations for insight',
  'Writing code': 'AI assistants now draft much routine code — engineers focus on design, review and security',
  Debugging: 'AI speeds up debugging, but developers must confirm the root cause rather than accept the first fix',
  Testing: 'Test cases are increasingly generated by AI, shifting effort to coverage and edge cases',
  Documentation: 'Technical documentation can be drafted by AI and then reviewed for accuracy',
  'IT support tickets': 'First-line IT tickets are increasingly triaged by AI, with people resolving the complex issues',
  Scheduling: 'Scheduling is increasingly optimised by AI tools, with people handling trade-offs and exceptions',
  'Inventory planning': 'Inventory planning is shifting to AI demand forecasts that planners must sense-check',
  'Maintenance planning': 'Maintenance is moving from fixed schedules to AI-predicted interventions',
  'Process monitoring': 'AI monitors processes in real time, flagging anomalies for people to investigate',
  'Content creation': 'First drafts of content are increasingly AI-generated — judgement, brand voice and accuracy become your edge',
  'Campaign analysis': 'Campaign performance analysis is increasingly automated, raising the bar for insight',
  'Social media': 'Social media scheduling, replies and trend-spotting are increasingly AI-assisted',
  'Market research': 'AI summarises market research at speed, but findings still need human validation',
  'Lead qualification': 'Lead scoring is increasingly AI-driven, freeing sales people to focus on relationships',
  'Proposal writing': 'Proposals can be drafted with AI in minutes, with people tailoring and checking the details',
  'Sales forecasting': 'Sales forecasts increasingly come from AI models that need a human sense-check',
  'CRM updates': 'CRM notes and updates are increasingly captured automatically by AI',
  'Answering routine queries': 'Routine queries are increasingly handled by chatbots, with people handling complex and sensitive cases',
  'Ticket triage': 'Tickets are increasingly triaged and routed by AI, letting agents focus on resolution',
  'Complaint summaries': 'AI summarises complaints and sentiment, helping teams spot trends earlier',
  'Knowledge-base search': 'AI search surfaces knowledge-base answers instantly — keeping that content accurate becomes vital',
  'Minutes & correspondence': 'Minutes and routine correspondence can be drafted by AI and checked by you',
  'Data capture': 'Manual data capture is increasingly handled by AI document processing, with people validating results',
  'Document management': 'Documents are increasingly classified and searched by AI, shifting focus to records governance',
  'Reporting & dashboards': 'Reports and dashboards are increasingly AI-generated — leaders must interpret, not just read, them',
  'Decision analysis': 'AI can frame options and analyse data, but accountability for decisions stays with leaders',
  'Strategy papers': 'Strategy papers can be researched and drafted with AI, raising expectations for original thinking',
  'Performance reviews': 'AI can summarise performance data, but fair, human-led reviews remain essential',
  'Design calculations': 'Design calculations are increasingly checked or generated with AI tools that engineers must verify',
  'Maintenance prediction': 'Predictive maintenance models increasingly guide when equipment is serviced',
  'Technical documentation': 'Technical documentation can be drafted with AI and reviewed by engineers',
  'Inspection analysis': 'AI image analysis increasingly supports inspections, with engineers confirming the findings',
  'Supplier evaluation': 'Supplier evaluation increasingly draws on AI analysis of price, risk and performance',
  'Tender documents': 'Tender documents can be drafted and compared with AI, with people ensuring compliance',
  'Spend analysis': 'Spend analysis is increasingly automated, surfacing savings for procurement teams to act on',
  'Contract review': 'AI can flag risky contract clauses, but legal and commercial judgement remains human',
  'Data cleaning': 'Data cleaning is increasingly AI-assisted, freeing analysts for interpretation',
  Querying: 'AI can write SQL and formulas, so analysts must check the logic and the results',
  Visualisation: 'Charts and dashboards can be generated from plain-language requests',
  'Insight reporting': 'AI drafts insight reports quickly — analysts add context, caveats and recommendations',
  'Document drafting': 'Documents can be drafted by AI in minutes, with you ensuring accuracy and context',
  Research: 'AI speeds up research, but sources and conclusions must be verified',
  Reporting: 'Routine reporting is increasingly automated, raising expectations for interpretation',
};

type Transferable = { skill: string; note: string };
/** Transferable strengths per functional role. `{target}` is replaced with the target career. */
const ROLE_TRANSFERABLE: Record<string, Transferable[]> = {
  'finance-accounting': [
    { skill: 'Advanced spreadsheets', note: 'Lookups, pivots and reconciliations are everyday tools in {target} work.' },
    { skill: 'Data accuracy', note: 'Finance-grade attention to detail is rare and highly valued.' },
    { skill: 'Business understanding', note: 'You know how revenue, margins and costs really work.' },
    { skill: 'Reporting', note: 'You already turn numbers into regular reports for managers.' },
  ],
  'human-resources': [
    { skill: 'People skills & empathy', note: 'Understanding people and their needs transfers to almost every {target} role.' },
    { skill: 'Policy & compliance awareness', note: 'You are used to working within rules that protect people and organisations.' },
    { skill: 'Stakeholder communication', note: 'Interviewing and advising managers builds confident communication.' },
    { skill: 'Confidential data handling', note: 'You already treat sensitive records with care — essential when using AI.' },
  ],
  'software-it': [
    { skill: 'Technical problem-solving', note: 'Structured debugging habits transfer directly to {target} challenges.' },
    { skill: 'Systems thinking', note: 'You understand how tools, data and processes connect.' },
    { skill: 'Tool fluency', note: 'You pick up new software and AI tools quickly.' },
    { skill: 'Documentation', note: 'Clear technical writing makes your work easy for others to use.' },
  ],
  operations: [
    { skill: 'Process thinking', note: 'Seeing work as steps and bottlenecks is valuable in {target} roles.' },
    { skill: 'Planning & scheduling', note: 'You balance competing priorities and deadlines every day.' },
    { skill: 'Operational data', note: 'You already work with stock, output and performance figures.' },
    { skill: 'Cross-team coordination', note: 'You know how to get different teams moving together.' },
  ],
  marketing: [
    { skill: 'Communication & storytelling', note: 'Explaining ideas clearly is central to {target} work.' },
    { skill: 'Customer insight', note: 'You understand what customers want and why they buy.' },
    { skill: 'Campaign measurement', note: 'You already track results and adjust based on data.' },
    { skill: 'Creativity', note: 'Fresh ideas remain a human strength when AI drafts the first version.' },
  ],
  sales: [
    { skill: 'Relationship building', note: 'Trust with clients transfers to any role that serves stakeholders.' },
    { skill: 'Commercial awareness', note: 'You know how deals, margins and targets work.' },
    { skill: 'Persuasive communication', note: 'You can present a case and handle objections.' },
    { skill: 'Target-driven delivery', note: 'You are used to measurable goals and deadlines.' },
  ],
  'customer-service': [
    { skill: 'Customer empathy', note: 'Understanding customer pain points is valuable in {target} work.' },
    { skill: 'Clear communication', note: 'You explain complex things simply, under pressure.' },
    { skill: 'Problem resolution', note: 'You diagnose issues and follow them through to a fix.' },
    { skill: 'Process knowledge', note: 'You know where service processes break — and why.' },
  ],
  administration: [
    { skill: 'Organisation & coordination', note: 'Keeping many moving parts on track is a core {target} skill.' },
    { skill: 'Document management', note: 'You know how information is stored, found and governed.' },
    { skill: 'Data capture accuracy', note: 'Careful, accurate data entry is the foundation of good analysis.' },
    { skill: 'Stakeholder communication', note: 'You liaise confidently with managers and external parties.' },
  ],
  management: [
    { skill: 'Decision-making', note: 'Weighing options and consequences transfers to any senior {target} role.' },
    { skill: 'Team leadership', note: 'You know how to guide people through change.' },
    { skill: 'Strategic thinking', note: 'You connect day-to-day work to organisational goals.' },
    { skill: 'Stakeholder management', note: 'You balance competing interests and build support.' },
  ],
  engineering: [
    { skill: 'Analytical problem-solving', note: 'Structured, quantitative thinking is central to {target} work.' },
    { skill: 'Quantitative skills', note: 'You are comfortable with numbers, measurement and tolerances.' },
    { skill: 'Technical documentation', note: 'You write precise specifications others rely on.' },
    { skill: 'Safety mindset', note: 'You instinctively check for risk — vital when working with AI.' },
  ],
  procurement: [
    { skill: 'Supplier & spend analysis', note: 'Comparing options on cost and risk is valuable in {target} roles.' },
    { skill: 'Negotiation', note: 'You can reach agreements that work for both sides.' },
    { skill: 'Contract awareness', note: 'You read documents carefully and spot risk.' },
    { skill: 'Compliance discipline', note: 'You follow controls that protect the organisation.' },
  ],
  'data-analytics': [
    { skill: 'Data analysis', note: 'Your analytical foundation applies across many {target} problems.' },
    { skill: 'Data querying', note: 'You can get the data you need without waiting for others.' },
    { skill: 'Visualisation', note: 'You make complex findings easy to understand.' },
    { skill: 'Critical thinking', note: 'You question numbers before trusting them.' },
  ],
  other: [
    { skill: 'Professional communication', note: 'Clear communication transfers to every {target} role.' },
    { skill: 'Problem-solving', note: 'You are used to working through unfamiliar challenges.' },
    { skill: 'Organisation', note: 'You manage your work and deadlines independently.' },
    { skill: 'Sector knowledge', note: 'Knowing how your industry works is an advantage AI cannot copy.' },
  ],
};

/** Skills a person in each functional role can reasonably be assumed to bring (before any AI learning). */
const ROLE_HAVE: Record<string, string[]> = {
  'finance-accounting': ['data-interpretation', 'financial-analysis', 'domain-finance'],
  'human-resources': ['domain-hr', 'data-privacy'],
  'software-it': ['domain-software', 'sql-data', 'critical-thinking'],
  operations: ['domain-operations', 'data-interpretation'],
  marketing: ['domain-marketing'],
  sales: ['domain-marketing'],
  'customer-service': ['domain-customer-service'],
  administration: ['data-privacy'],
  management: ['decision-support', 'critical-thinking', 'domain-management'],
  engineering: ['data-interpretation', 'domain-operations'],
  procurement: ['data-interpretation', 'domain-operations'],
  'data-analytics': ['sql-data', 'data-interpretation', 'data-visualisation', 'domain-data-analytics'],
  other: [],
};

const RELATED_DOMAINS: [DomainId, DomainId][] = [
  ['finance', 'data-analytics'],
  ['marketing', 'data-analytics'],
  ['software', 'data-analytics'],
  ['operations', 'data-analytics'],
  ['operations', 'management'],
  ['hr', 'management'],
  ['finance', 'management'],
  ['customer-service', 'marketing'],
  ['software', 'operations'],
  ['hr', 'data-analytics'],
];
const areRelated = (a: DomainId, b: DomainId) => a === b || RELATED_DOMAINS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

// ───────────────────────────── Context ─────────────────────────────

/** Resolves the current, target and learning domains for a set of answers. */
export function resolveAnalysisDomains(answers: OnboardingAnswers): AnalysisDomains {
  const domainId = resolveDomain(answers.industryId, answers.roleId);
  if (answers.careerObjective !== 'transition') return { domainId, learningDomainId: domainId };
  const targetDomainId = answers.targetDomainId ?? resolveTargetDomain(answers.targetCareer);
  return { domainId, targetDomainId, learningDomainId: targetDomainId ?? domainId };
}

interface Ctx {
  a: OnboardingAnswers;
  scores: ReadinessScores;
  domainId: DomainId;
  targetDomainId?: DomainId;
  learningDomainId: DomainId;
  domain: Domain;
  target?: Domain;
  learning: Domain;
  info: DomainInfo; // learning-domain info
  role?: FunctionalRole;
  industry?: Industry;
  roleLabel: string;
  industryLabel: string;
  jobTitle: string;
  tasks: string[];
  uses: UseCase[];
  beginner: boolean;
  lowUsage: boolean;
  active: boolean;
  confident: boolean;
  highExposure: boolean;
  regulated: boolean;
  transition: boolean;
  targetCareer?: string;
}

function buildCtx(a: OnboardingAnswers, domainId?: DomainId, targetDomainId?: DomainId): Ctx {
  const resolved = resolveAnalysisDomains(a);
  const dId = domainId ?? resolved.domainId;
  const transition = a.careerObjective === 'transition';
  const tId = transition ? targetDomainId ?? resolved.targetDomainId : undefined;
  const learningDomainId = transition && tId ? tId : dId;
  const scores = computeScores(a);
  const role = getRole(a.roleId);
  const industry = getIndustry(a.industryId);
  const uses = a.useCases.filter((u) => u !== 'none');
  const active = a.personalUsage === 'daily' || a.personalUsage === 'weekly';
  const tasks = role?.aiImpactedTasks?.length ? role.aiImpactedTasks : ['Document drafting', 'Research', 'Reporting'];
  return {
    a,
    scores,
    domainId: dId,
    targetDomainId: tId,
    learningDomainId,
    domain: getDomain(dId)!,
    target: tId ? getDomain(tId) : undefined,
    learning: getDomain(learningDomainId)!,
    info: DOMAIN_INFO[learningDomainId],
    role,
    industry,
    roleLabel: roleName(a.roleId, a.roleOther),
    industryLabel: industryName(a.industryId, a.industryOther),
    jobTitle: (a.jobTitle || roleName(a.roleId, a.roleOther)).trim(),
    tasks,
    uses,
    beginner: a.confidence <= 2 || a.personalUsage === 'never' || scores.personalReadiness <= 25,
    lowUsage: a.personalUsage === 'never' || a.personalUsage === 'occasionally',
    active,
    confident: a.confidence >= 4 && active,
    highExposure: scores.workplaceExposure > 60,
    regulated: REGULATED_INDUSTRIES.has(a.industryId) || learningDomainId === 'healthcare' || learningDomainId === 'hr',
    transition,
    targetCareer: transition ? titleCase(a.targetCareer || getDomain(learningDomainId)!.shortName) : undefined,
  };
}

// ───────────────────────────── Prescription (rule-based) ─────────────────────────────

interface DraftItem {
  id: string;
  category: PrescriptionCategory;
  rank: number; // ordering
  keep: number; // importance when trimming (100 = mandatory)
}

const STOP_WORDS = new Set(['with', 'your', 'from', 'into', 'that', 'this', 'while', 'then', 'what', 'when', 'using', 'across', 'real', 'work']);
const stems = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
      .map((w) => w.slice(0, 5)),
  );

/** The role task most related to a module (keyword overlap), if any. */
function bestTask(m: ModuleMeta, tasks: string[]): string | undefined {
  const ms = stems(`${m.title} ${m.summary} ${MODULE_ACTION[m.id] ?? ''}`);
  let best: string | undefined;
  let score = 0;
  for (const t of tasks) {
    const s = [...stems(t)].filter((x) => ms.has(x)).length;
    if (s > score) {
      score = s;
      best = t;
    }
  }
  return best;
}

function reasonFor(id: string, c: Ctx): string {
  const m = getModule(id);
  if (!m) return 'Recommended for your role.';
  const [t1 = 'routine documents', t2 = 'reports'] = c.tasks.map(lower);
  const useList = listJoin(c.uses.map((u) => USE_CASE_LABEL[u]));
  const as = `${article(c.jobTitle)} ${c.jobTitle}`;
  switch (id) {
    case 'core-fundamentals':
      if (c.transition && c.target && c.targetCareer) return `Grounds your move into ${rolePhrase(c.targetCareer)} in how AI really works with ${lower(c.target.shortName)} tasks — and where it falls short.`;
      if (c.a.personalUsage === 'never') return 'You are not yet using AI at work — a clear grounding in what it can and cannot do makes every later module faster and safer.';
      return `Your AI use is ${c.a.personalUsage === 'occasionally' ? 'occasional' : c.a.personalUsage} and your confidence is ${c.a.confidence}/5 — a solid foundation makes the rest of your path faster and safer.`;
    case 'core-prompting':
      if (c.a.personalUsage === 'never') return `Prompting is the quickest way to get useful results from AI on day one — starting with the ${t1} and ${t2} you already handle.`;
      if (c.transition && c.target) return `Precise prompts turn AI into a reliable assistant while you build ${c.targetCareer} skills — and speed up your practice.`;
      if (c.uses.length) return `Better prompts will immediately improve the ${useList} you already do with AI as ${as}.`;
      return `Structured prompts turn AI into a reliable assistant for ${t1} and ${t2}.`;
    case 'core-verification':
      return c.info.stakes;
    case 'core-responsible':
      return `${cap(c.info.data)} ${c.regulated ? `is tightly regulated in ${c.industryLabel}` : 'is sensitive'} — learn to protect it and keep people accountable for AI-assisted decisions.`;
  }
  const action = MODULE_ACTION[id] ?? m.summary.replace(/\.$/, '');
  if (m.kind === 'challenge') {
    if (c.transition && m.domainId === c.targetDomainId) return `A portfolio-ready project that proves your new ${c.target?.shortName ?? ''} capability to future employers.`;
    return `Proves you can ${lcFirst(action)} — practical evidence towards your certification.`;
  }
  if (m.domainId === 'management' && c.domainId !== 'management') return `You want to move into leadership — this module shows you how to ${lcFirst(action)}.`;
  if (c.transition && m.domainId === c.targetDomainId) {
    const first = c.target?.moduleIds[0] === id;
    return first
      ? `The most critical skill gap for ${c.targetCareer} roles: ${lcFirst(action)}. AI can help you learn it faster.`
      : `${cap(action)} — a core expectation in ${c.targetCareer} roles.`;
  }
  if (m.level === 'advanced') {
    if (c.a.careerObjective === 'advanced-ai') return `Matches your goal of building advanced AI skills: ${lcFirst(action)}.`;
    return `You already use AI confidently — go further and ${lcFirst(action)}.`;
  }
  const idx = c.domain.moduleIds.indexOf(id);
  if (idx === 0 && c.highExposure) return `With ${lower(exposureLabel(c.scores.workplaceExposure))} in ${c.industryLabel}, this is where ${lower(c.roleLabel)} work is changing fastest — ${lcFirst(action)}.`;
  const task = bestTask(m, c.tasks);
  return task ? `${cap(action)} — directly relevant to ${lower(task)} in your role as ${as}.` : `${cap(action)} — a practical next step in your role as ${as}.`;
}

function draftPrescription(c: Ctx): DraftItem[] {
  const list: DraftItem[] = [];
  const add = (id: string, category: PrescriptionCategory, rank: number, keep: number) => {
    if (getModule(id) && !list.some((x) => x.id === id)) list.push({ id, category, rank, keep });
  };
  const objective = c.a.careerObjective;

  if (c.transition && c.target && c.targetDomainId !== c.domainId) {
    const [t1, t2, t3, tch] = c.target.moduleIds;
    if (!c.confident) add('core-fundamentals', 'fundamentals', 10, c.beginner ? 80 : 50);
    add(t1, 'transition', 14, 92);
    add('core-prompting', 'fundamentals', c.lowUsage ? 12 : 20, c.lowUsage ? 78 : 55);
    add(t2, 'transition', 24, 86);
    add('core-verification', 'responsible', 40, 70);
    add('core-responsible', 'responsible', 45, 100);
    if (c.confident) add(t3, 'transition', 50, 45);
    add(tch, 'practical', 90, 100);
  } else {
    const [d1, d2, d3, dch] = c.domain.moduleIds;
    if (!c.confident) add('core-fundamentals', 'fundamentals', 10, c.beginner ? 82 : 50);
    if (!(c.confident && c.a.personalUsage === 'daily')) add('core-prompting', 'fundamentals', c.lowUsage ? 12 : 26, c.lowUsage ? 78 : 52);
    add(d1, 'domain', c.highExposure ? 14 : 20, 90);
    add(d2, 'domain', c.highExposure ? 22 : 30, 72);
    add('core-verification', 'responsible', 40, 70);
    add('core-responsible', 'responsible', c.regulated ? 36 : 45, 100);
    if (c.confident || objective === 'advanced-ai') add(d3, 'advanced', objective === 'advanced-ai' ? 35 : 50, objective === 'advanced-ai' ? 88 : 60);
    if (objective === 'leadership') {
      if (c.domainId !== 'management') {
        const adopting = c.a.orgAdoption === 'extensive' || c.a.orgAdoption === 'partial' || c.a.orgAdoption === 'experimenting';
        add(adopting ? 'mgmt-strategy' : 'mgmt-decisions', 'domain', 34, 88);
      } else add('mgmt-governance', 'advanced', 48, 80);
    }
    add(dch, 'practical', 90, 100);
  }

  list.sort((x, y) => x.rank - y.rank);
  while (list.length > 7) {
    let worst = -1;
    list.forEach((x, i) => {
      if (x.keep < 100 && (worst < 0 || x.keep < list[worst].keep)) worst = i;
    });
    if (worst < 0) break;
    list.splice(worst, 1);
  }
  return list;
}

function toItem(id: string, priority: number, category: PrescriptionCategory, reason: string, learningDomainId: DomainId): SkillPrescriptionItem {
  const m = getModule(id)!;
  return { moduleId: id, title: moduleTitle(m, learningDomainId), reason, priority, category, estimatedMinutes: m.estimatedMinutes, skillIds: [...m.skillIds] };
}

/** Rule-based AI Skills Prescription (4–7 items) — the engine behind the fallback and the repair step. */
export function buildPrescription(answers: OnboardingAnswers, domainId: DomainId, targetDomainId?: DomainId): SkillPrescriptionItem[] {
  const c = buildCtx(answers, domainId, targetDomainId);
  return draftPrescription(c).map((d, i) => toItem(d.id, i + 1, d.category, reasonFor(d.id, c), c.learningDomainId));
}

/** Modules offered to Gemini (and accepted back) for this learner. */
function allowedModules(c: Ctx): ModuleMeta[] {
  const list = candidateModules(c.domainId, c.transition ? c.targetDomainId : undefined);
  if (c.a.careerObjective === 'leadership' && c.domainId !== 'management') {
    ['mgmt-decisions', 'mgmt-strategy'].forEach((id) => {
      const m = getModule(id);
      if (m && !list.some((x) => x.id === id)) list.push(m);
    });
  }
  return list;
}

const CATEGORIES: PrescriptionCategory[] = ['fundamentals', 'domain', 'responsible', 'practical', 'transition', 'advanced'];

function inferCategory(m: ModuleMeta, c: Ctx): PrescriptionCategory {
  if (m.id === 'core-verification' || m.id === 'core-responsible') return 'responsible';
  if (m.kind === 'core') return 'fundamentals';
  if (m.kind === 'challenge') return 'practical';
  if (c.transition && m.domainId === c.targetDomainId && c.targetDomainId !== c.domainId) return 'transition';
  if (m.level === 'advanced') return 'advanced';
  return 'domain';
}

/**
 * Validates and repairs a prescription (from Gemini): only catalogue candidates,
 * no duplicates, always includes Responsible AI and the learning domain's
 * challenge, 4–7 items, catalogue titles/minutes/skills, priorities 1..n.
 */
function finalisePrescription(raw: unknown, c: Ctx, fallback: SkillPrescriptionItem[]): SkillPrescriptionItem[] {
  const allowed = new Set(allowedModules(c).map((m) => m.id));
  const fallbackReason = (id: string) => fallback.find((f) => f.moduleId === id)?.reason ?? reasonFor(id, c);
  const seen = new Set<string>();
  const items: { id: string; category: PrescriptionCategory; reason: string }[] = [];
  if (Array.isArray(raw)) {
    const sorted = raw
      .map((r, i) => ({ r: r as Record<string, unknown>, i }))
      .filter(({ r }) => r && typeof r === 'object')
      .sort((x, y) => {
        const px = typeof x.r.priority === 'number' ? x.r.priority : x.i + 1;
        const py = typeof y.r.priority === 'number' ? y.r.priority : y.i + 1;
        return px - py;
      });
    for (const { r } of sorted) {
      const id = typeof r.moduleId === 'string' ? r.moduleId.trim() : '';
      if (!id || !allowed.has(id) || seen.has(id)) continue;
      const m = getModule(id);
      if (!m) continue;
      seen.add(id);
      const cat = typeof r.category === 'string' && CATEGORIES.includes(r.category as PrescriptionCategory) ? (r.category as PrescriptionCategory) : inferCategory(m, c);
      const reason = typeof r.reason === 'string' && r.reason.trim().length >= 12 ? cleanLine(r.reason, 260) : fallbackReason(id);
      items.push({ id, category: m.kind === 'challenge' ? 'practical' : cat, reason });
    }
  }
  const challenge = challengeModuleId(c.learningDomainId);
  const mandatory = new Set(['core-responsible', challenge]);
  if (!seen.has('core-responsible')) {
    const at = items.findIndex((x) => getModule(x.id)?.kind === 'challenge');
    const entry = { id: 'core-responsible', category: 'responsible' as PrescriptionCategory, reason: fallbackReason('core-responsible') };
    if (at >= 0) items.splice(at, 0, entry);
    else items.push(entry);
    seen.add('core-responsible');
  }
  if (!seen.has(challenge)) {
    items.push({ id: challenge, category: 'practical', reason: fallbackReason(challenge) });
    seen.add(challenge);
  }
  // Trim to 7 — drop from the end, never the mandatory modules.
  while (items.length > 7) {
    const idx = [...items].reverse().findIndex((x) => !mandatory.has(x.id));
    if (idx < 0) break;
    items.splice(items.length - 1 - idx, 1);
  }
  // Pad to 4 from the engine's own prescription, inserted before a trailing challenge.
  for (const f of fallback) {
    if (items.length >= 4) break;
    if (seen.has(f.moduleId)) continue;
    const last = items[items.length - 1];
    const entry = { id: f.moduleId, category: f.category, reason: f.reason };
    if (last && getModule(last.id)?.kind === 'challenge') items.splice(items.length - 1, 0, entry);
    else items.push(entry);
    seen.add(f.moduleId);
  }
  return items.map((x, i) => toItem(x.id, i + 1, x.category, x.reason, c.learningDomainId));
}

// ───────────────────────────── Narrative (engine) ─────────────────────────────

const ORG_PHRASE: Record<OnboardingAnswers['orgAdoption'], string> = {
  extensive: 'that has adopted AI extensively',
  partial: 'that is partially adopting AI',
  experimenting: 'that is beginning to experiment with AI',
  'not-yet': 'that has not yet formally adopted AI',
  unknown: 'where AI adoption is still unclear',
};

function engineSummary(c: Ctx, readiness: number, exposure: number): string {
  const org = `You are ${article(c.jobTitle)} ${c.jobTitle} in ${article(c.industryLabel)} ${c.industryLabel} organisation ${ORG_PHRASE[c.a.orgAdoption]}.`;
  const useList = listJoin(c.uses.slice(0, 3).map((u) => USE_CASE_LABEL[u]));
  const usage =
    c.a.personalUsage === 'never'
      ? 'You are not yet using AI in your own work'
      : c.a.personalUsage === 'occasionally'
        ? `Your personal AI usage remains limited${useList ? ` to occasional ${useList}` : ''}`
        : `You already use AI ${c.a.personalUsage}${useList ? ` for ${useList}` : ''}`;
  const tasks = listJoin(c.tasks.slice(0, 3).map(lower));
  const middle = `${usage}, while ${tasks} ${c.tasks.length > 1 ? 'are' : 'is'} increasingly being augmented by AI.`;
  let close: string;
  if (c.transition && c.targetCareer) close = `${readiness > 40 ? 'That is a strong launchpad' : 'Your experience gives you a solid starting point'} for your goal of moving into ${rolePhrase(c.targetCareer)}.`;
  else {
    const p = priorityState(readiness, exposure);
    close = {
      'Priority Upskilling Recommended': 'Focused, practical upskilling now will keep you ahead of these changes.',
      'Well Positioned': 'Your skills are keeping pace — the next step is to deepen and certify them.',
      'Future Ready': 'Your AI skills are ahead of your workplace, so you are well placed to lead adoption.',
      'Build Foundations': 'Change is still early in your role, so building foundations now gives you a head start.',
    }[p];
  }
  return `${org} ${middle} ${close}`;
}

function engineStrengths(c: Ctx): string[] {
  const out: { t: string; w: number }[] = [];
  const years = EXPERIENCE_TEXT[c.a.experience];
  if (c.a.experience === '0-2') out.push({ t: 'Early-career adaptability — you can build good AI habits into your work from the start', w: 60 });
  else out.push({ t: `${years} of ${lower(c.roleLabel)} experience — judgement and context that AI cannot replace`, w: 80 });
  const uses = c.uses.map((u) => USE_CASE_LABEL[u]);
  if (c.active && uses.length) out.push({ t: `Already uses AI ${c.a.personalUsage} for ${listJoin(uses.slice(0, 3))}`, w: 90 });
  else if (uses.length) out.push({ t: `Already experimenting with AI for ${listJoin(uses.slice(0, 3))}`, w: 75 });
  const adv = c.uses.filter((u) => ADVANCED_USES.includes(u)).map((u) => USE_CASE_LABEL[u]);
  if (adv.length) out.push({ t: `Applies AI to higher-value work such as ${listJoin(adv.slice(0, 2))}`, w: 70 });
  if (c.a.confidence >= 4) out.push({ t: 'Confident with AI tools — ready for more advanced, automated workflows', w: 72 });
  if (c.a.orgAdoption === 'extensive' || c.a.orgAdoption === 'partial') out.push({ t: 'Your organisation is investing in AI, so there are real opportunities to apply new skills', w: 65 });
  else if (c.a.orgAdoption === 'experimenting') out.push({ t: 'Your organisation is experimenting with AI — a chance to help shape how it is used', w: 55 });
  out.push({ t: `Hands-on knowledge of ${listJoin(c.tasks.slice(0, 2).map(lower))} — the context AI tools need to be useful`, w: 58 });
  out.push({ t: `A clear goal: ${lcFirst(objectiveLabel(c.a.careerObjective))}${c.targetCareer ? ` (${c.targetCareer})` : ''}`, w: 50 });
  return out
    .sort((x, y) => y.w - x.w)
    .slice(0, 4)
    .map((x) => x.t);
}

function engineGaps(c: Ctx, tx?: CareerTransitionAnalysis): string[] {
  const out: string[] = [];
  const info = c.info;
  if (c.transition && tx) {
    tx.missingSkills
      .filter((m) => m.importance !== 'helpful')
      .slice(0, 3)
      .forEach((m) =>
        out.push(!tx.targetDomainId || m.skill.toLowerCase().includes((c.targetCareer ?? '').toLowerCase()) ? m.skill : `${m.skill} — ${m.importance === 'critical' ? 'a core requirement' : 'expected'} in ${c.targetCareer} roles`),
      );
  }
  if (c.lowUsage || c.a.confidence <= 2) out.push(DOMAIN_INFO[c.learningDomainId].promptGap);
  if (!c.uses.includes('data-analysis') && !c.transition) out.push(DOMAIN_INFO[c.domainId].analyticsGap);
  if (!c.uses.includes('automation') && c.a.confidence >= 3 && !c.transition) out.push(`Automating repetitive ${lower(c.tasks[0])} steps with AI`);
  if (c.a.careerObjective === 'leadership') out.push('Leading a team through AI adoption and change');
  if (c.confident && !c.transition) {
    const adv = getModule(c.domain.moduleIds[2]);
    if (adv) out.push(`Advanced ${c.domain.shortName} AI applications — ${lcFirst(adv.title)}`);
  }
  if (!out.length) out.push(`Applying AI to ${lower(c.tasks[0])} with consistent quality and review steps`);
  out.push(`Verifying AI outputs before they reach ${info.audience}`);
  out.push(`${c.learningDomainId === 'hr' || c.learningDomainId === 'education' ? 'Bias and privacy safeguards' : 'Privacy and human-oversight safeguards'} when AI touches ${info.data}`);
  return Array.from(new Set(out)).slice(0, 5);
}

function engineRoleChanges(c: Ctx): string[] {
  const out = c.tasks.slice(0, 3).map((t) => TASK_CHANGE[t] ?? `${t} is increasingly AI-assisted — your value shifts to reviewing, judging and explaining the results`);
  const cases = c.industry?.aiUseCases ?? [];
  if (cases.length >= 2) out.push(`${c.industryLabel} organisations are adopting ${lower(cases[0])} and ${lower(cases[1])}, reshaping how ${lower(c.roleLabel)} teams work`);
  else out.push(`Employers increasingly expect ${lower(c.roleLabel)} professionals to use AI responsibly, with strong privacy and human oversight`);
  return out.slice(0, 4);
}

function engineLearnNext(c: Ctx, prescription: SkillPrescriptionItem[]): string[] {
  const d = c.learning.shortName;
  const phrase = (id: string): string => {
    switch (id) {
      case 'core-fundamentals':
        return `Understand what AI can and cannot do in ${d} work`;
      case 'core-prompting':
        return `Write effective prompts for everyday ${d} tasks`;
      case 'core-verification':
        return `Build a habit of verifying every AI-generated ${c.info.artefact}`;
      case 'core-responsible':
        return `Apply privacy and human-oversight rules to every AI-assisted ${d} decision`;
      default:
        return MODULE_ACTION[id] ?? moduleTitle(id, c.learningDomainId);
    }
  };
  const ordered = prescription.filter((p) => getModule(p.moduleId)?.kind !== 'challenge' && p.moduleId !== 'core-fundamentals');
  const out = ordered.map((p) => phrase(p.moduleId)).slice(0, 4);
  if (out.length < 4 && c.transition) out.push('Complete a portfolio-ready AI workplace challenge');
  if (out.length < 3) out.push(phrase('core-fundamentals'));
  return out.slice(0, 4);
}

function engineCareers(c: Ctx): string[] {
  if (c.transition && c.targetCareer) {
    if (!c.target) return Array.from(new Set([c.targetCareer, ...DOMAIN_INFO[c.domainId].careers])).slice(0, 4);
    const base = DOMAIN_INFO[c.learningDomainId].careers;
    const first = juniorTitle(c.targetCareer);
    const flavour = c.learningDomainId === 'data-analytics' && c.industry && c.industry.id !== 'other' ? `${c.industry.name.split(/[ /&]/)[0]} Insights Analyst` : '';
    return Array.from(new Set([first, ...(flavour ? [flavour] : []), ...base.filter((b) => b.toLowerCase() !== first.toLowerCase())])).slice(0, 4);
  }
  const list = [...DOMAIN_INFO[c.domainId].careers];
  if (c.a.careerObjective === 'leadership') list.splice(1, 0, `${c.domain.shortName} Team Lead (AI-enabled)`);
  return list.slice(0, 4);
}

// ───────────────────────────── Career transition (engine) ─────────────────────────────

function currentSkillSet(c: Ctx): Set<string> {
  const s = new Set<string>(ROLE_HAVE[c.a.roleId] ?? []);
  if (c.uses.includes('data-analysis')) ['ai-analytics', 'data-interpretation'].forEach((k) => s.add(k));
  if (c.uses.includes('writing') || c.uses.includes('reporting')) s.add('ai-writing');
  if (c.uses.includes('automation')) s.add('ai-automation');
  if (c.uses.includes('coding')) s.add('ai-coding');
  if (c.uses.includes('decision-support')) s.add('decision-support');
  if (c.uses.includes('customer-support')) s.add('customer-ai');
  if (c.a.confidence >= 3) ['ai-fundamentals', 'prompt-engineering'].forEach((k) => s.add(k));
  return s;
}

/** Deterministic career-transition analysis (fallback for Gemini). */
export function buildCareerTransition(answers: OnboardingAnswers, targetCareer: string, targetDomainId?: DomainId): CareerTransitionAnalysis {
  const c = buildCtx({ ...answers, careerObjective: 'transition', targetCareer, targetDomainId }, undefined, targetDomainId);
  const targetRole = titleCase(targetCareer);
  const currentRole = c.jobTitle;
  const expBonus = { '0-2': 1, '3-5': 3, '6-10': 5, '11-15': 5, '16+': 4 }[c.a.experience];

  // Transferable skills
  const pool = (ROLE_TRANSFERABLE[c.a.roleId] ?? ROLE_TRANSFERABLE.other).map((t) => ({ skill: t.skill, note: t.note.replace('{target}', targetRole) }));
  const transferable: Transferable[] = pool.slice(0, 3);
  if (c.uses.includes('data-analysis') || c.uses.includes('automation') || c.uses.includes('coding')) {
    transferable.push({ skill: 'Hands-on AI use', note: `You already use AI for ${listJoin(c.uses.filter((u) => ADVANCED_USES.includes(u)).map((u) => USE_CASE_LABEL[u]))} — a head start on AI-augmented ${targetRole} work.` });
  } else if (['6-10', '11-15', '16+'].includes(c.a.experience)) {
    transferable.push({ skill: 'Professional experience', note: `${EXPERIENCE_TEXT[c.a.experience]} of workplace judgement and credibility with colleagues.` });
  } else transferable.push(pool[3]);

  // Target outside the learning catalogue (e.g. "Pilot"): be honest and focus on transferable + AI skills.
  if (!c.target) {
    const core = buildPrescription({ ...answers, careerObjective: 'transition', targetCareer }, c.domainId).filter((p) => getModule(p.moduleId)?.kind === 'core');
    const pathway: CareerTransitionAnalysis['pathway'] = core.map((p, i) => ({ step: i + 1, title: p.title, description: getModule(p.moduleId)!.summary, moduleId: p.moduleId }));
    pathway.push(
      {
        step: pathway.length + 1,
        title: `Research ${targetRole} entry requirements`,
        description: `Use AI to map the qualifications, licences and experience ${targetRole} roles require in Zimbabwe — then verify them with official bodies and people in the field.`,
      },
      {
        step: pathway.length + 2,
        title: 'Gain first-hand exposure',
        description: `Arrange work-shadowing, informational interviews or short courses to test your interest in ${targetRole} work before committing.`,
      },
    );
    return {
      currentRole,
      targetRole,
      transferableSkills: transferable.slice(0, 4),
      missingSkills: [
        { skill: `Formal training or qualifications for ${targetRole} roles`, importance: 'critical' },
        { skill: `Sector knowledge and a professional network in ${targetRole} work`, importance: 'important' },
        { skill: 'Researching a new field critically with AI', importance: 'important' },
        { skill: 'AI Output Verification', importance: 'helpful' },
      ],
      aiCompetencies: [
        'Prompting AI to explain unfamiliar concepts and terminology',
        'Researching a new field quickly — and verifying what AI tells you',
        'Using AI to tailor CVs and applications responsibly',
        'Protecting personal data when using AI tools',
      ],
      readiness: clamp(16 + c.scores.personalReadiness * 0.25 + expBonus, 20, 45),
      pathway,
      outlook: `${targetRole} sits outside ZimAI Ready’s current learning domains, so this analysis focuses on the transferable and AI skills that help in any field. Your ${lower(transferable[0].skill)} and ${lower(transferable[1].skill)} will carry across; pair this pathway with the formal training ${targetRole} roles require. Timelines depend heavily on those requirements, so treat this as a starting point rather than a plan.`,
    };
  }
  const target = c.target;
  const tId = target.id;

  // Missing skills
  const have = currentSkillSet(c);
  const missing: CareerTransitionAnalysis['missingSkills'] = [];
  const pushSkill = (skill: string, importance: 'critical' | 'important' | 'helpful') => {
    if (!missing.some((m) => m.skill.toLowerCase() === skill.toLowerCase())) missing.push({ skill, importance });
  };
  const [t1, t2, t3] = target.moduleIds.map((id) => getModule(id)!);
  t1.skillIds.filter((k) => !have.has(k) && !k.startsWith('domain-')).forEach((k) => pushSkill(skillName(k), 'critical'));
  t2.skillIds.filter((k) => !have.has(k) && !k.startsWith('domain-')).forEach((k) => pushSkill(skillName(k), missing.length < 2 ? 'critical' : 'important'));
  DOMAIN_INFO[tId].extraMissing.forEach((x) => pushSkill(x.skill, x.importance));
  t3.skillIds.filter((k) => !have.has(k) && !k.startsWith('domain-')).forEach((k) => pushSkill(skillName(k), 'helpful'));
  if (missing.length < 3) pushSkill(`${target.shortName} domain knowledge`, 'important');
  const order = { critical: 0, important: 1, helpful: 2 } as const;
  const missingSkills = missing.sort((x, y) => order[x.importance] - order[y.importance]).slice(0, 5);
  if (missingSkills.length && !missingSkills.some((m) => m.importance === 'critical')) missingSkills[0] = { ...missingSkills[0], importance: 'critical' };

  // Readiness heuristic (20–80): skill overlap + personal readiness + experience + relatedness
  const targetSkills = new Set<string>([...t1.skillIds, ...t2.skillIds, 'ai-verification', 'prompt-engineering'].filter((k) => !k.startsWith('domain-')));
  const overlap = [...targetSkills].filter((k) => have.has(k)).length / Math.max(1, targetSkills.size);
  const related = areRelated(c.domainId, tId) ? 6 : 0;
  const readiness = clamp(14 + overlap * 30 + c.scores.personalReadiness * 0.32 + expBonus + related, 20, 80);

  // Pathway from the transition prescription
  const rx = buildPrescription({ ...answers, careerObjective: 'transition', targetCareer, targetDomainId: tId }, c.domainId, tId);
  const pathway: CareerTransitionAnalysis['pathway'] = rx.slice(0, 6).map((p, i) => {
    const m = getModule(p.moduleId)!;
    return { step: i + 1, title: p.title, description: m.summary, moduleId: p.moduleId };
  });
  pathway.push({
    step: pathway.length + 1,
    title: `Build your ${targetRole} portfolio`,
    description: `Package your challenge work and certificate, then look for ${lower(target.shortName)} projects inside your current organisation before applying externally.`,
  });

  const months = readiness >= 60 ? '4–6 months' : readiness >= 40 ? '6–9 months' : '9–12 months';
  const crit = missingSkills.filter((m) => m.importance === 'critical').map((m) => lower(m.skill));
  const focus = crit.length ? listJoin(crit.slice(0, 2)) : `${lower(target.shortName)} skills`;
  const outlook = `Your ${lower(transferable[0].skill)} and ${lower(transferable[1].skill)} transfer directly to ${targetRole} work. With focused work on ${focus}, plus regular AI-assisted ${lower(target.shortName)} practice, moving into ${rolePhrase(targetRole)} within ${months} is realistic. Timelines depend on your practice time and the opportunities available, so treat this as a guide rather than a guarantee.`;

  return {
    currentRole,
    targetRole,
    targetDomainId: tId,
    transferableSkills: transferable.slice(0, 4),
    missingSkills,
    aiCompetencies: [...DOMAIN_INFO[tId].aiCompetencies],
    readiness,
    pathway,
    outlook,
  };
}

// ───────────────────────────── Reassessment (engine) ─────────────────────────────

function engineImprovement(prev: ReadinessAssessment, c: Ctx, readiness: number, exposure: number): { explanation: string; drivers: string[] } {
  const diff = readiness - prev.personalReadiness;
  const pa = prev.answers;
  const drivers: string[] = [];
  const usageRank = { never: 0, occasionally: 1, weekly: 2, daily: 3 } as const;
  if (usageRank[c.a.personalUsage] > usageRank[pa.personalUsage]) drivers.push(`AI use increased from ${pa.personalUsage} to ${c.a.personalUsage}`);
  if (c.a.confidence > pa.confidence) drivers.push(`Confidence rose from ${pa.confidence}/5 to ${c.a.confidence}/5`);
  const newUses = c.uses.filter((u) => !pa.useCases.includes(u));
  if (newUses.length) drivers.push(`Now using AI for ${listJoin(newUses.map((u) => USE_CASE_LABEL[u]))}`);
  if (c.a.orgAdoption !== pa.orgAdoption) drivers.push(`Organisation AI adoption is now “${c.a.orgAdoption.replace('-', ' ')}”`);
  if (!drivers.length) drivers.push(diff >= 0 ? 'Consistent AI practice since your last assessment' : 'Answers suggest less day-to-day AI use than before');
  const trend = diff > 0 ? `rose by ${diff} points to ${readiness}%` : diff < 0 ? `moved from ${prev.personalReadiness}% to ${readiness}%` : `held steady at ${readiness}%`;
  const exp = exposure !== prev.workplaceExposure ? ` Workplace AI exposure is now ${exposure}% (was ${prev.workplaceExposure}%).` : '';
  const explanation = `Your personal AI readiness ${trend} since your previous assessment.${exp} ${diff > 0 ? 'Your learning and practice are showing up in how you work.' : 'Keep practising with the modules in your path to build momentum.'}`;
  return { explanation, drivers: drivers.slice(0, 4) };
}

// ───────────────────────────── Fallback assessment ─────────────────────────────

/** Deterministic, fully personalised readiness analysis (used when Gemini is unavailable). */
export function buildEngineAnalysis(input: ReadinessAnalysisInput): ReadinessAssessment {
  const { answers, userId, kind = 'initial', previous } = input;
  const c = buildCtx(answers);
  const readiness = c.scores.personalReadiness;
  const exposure = c.scores.workplaceExposure;
  const prescription = buildPrescription(answers, c.domainId, c.targetDomainId);
  const tx = c.transition && answers.targetCareer ? buildCareerTransition(answers, answers.targetCareer, c.targetDomainId) : undefined;
  const assessment: ReadinessAssessment = {
    id: uid('ra-'),
    userId,
    kind,
    createdAt: nowISO(),
    answers,
    personalReadiness: readiness,
    workplaceExposure: exposure,
    readinessLevel: readinessLevel(readiness),
    priorityState: priorityState(readiness, exposure),
    summary: engineSummary(c, readiness, exposure),
    strengths: engineStrengths(c),
    gaps: engineGaps(c, tx),
    roleChanges: engineRoleChanges(c),
    learnNext: engineLearnNext(c, prescription),
    careerOpportunities: engineCareers(c),
    prescription,
    source: 'engine',
  };
  if (tx) assessment.careerTransition = tx;
  if (previous) {
    const imp = engineImprovement(previous, c, readiness, exposure);
    assessment.previousAssessmentId = previous.id;
    assessment.improvementExplanation = imp.explanation;
    assessment.improvementDrivers = imp.drivers;
  }
  return assessment;
}

// ───────────────────────────── Gemini ─────────────────────────────

const STR: Schema = { type: Type.STRING };
const STR_ARR: Schema = { type: Type.ARRAY, items: { type: Type.STRING } };

const TRANSITION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    currentRole: STR,
    targetRole: STR,
    transferableSkills: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { skill: STR, note: STR }, required: ['skill', 'note'] } },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { skill: STR, importance: { type: Type.STRING, enum: ['critical', 'important', 'helpful'] } }, required: ['skill', 'importance'] },
    },
    aiCompetencies: STR_ARR,
    readiness: { type: Type.INTEGER },
    pathway: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { step: { type: Type.INTEGER }, title: STR, description: STR, moduleId: STR }, required: ['step', 'title', 'description'] },
    },
    outlook: STR,
  },
  required: ['currentRole', 'targetRole', 'transferableSkills', 'missingSkills', 'aiCompetencies', 'readiness', 'pathway', 'outlook'],
};

function readinessSchema(withTransition: boolean, withImprovement: boolean): Schema {
  const properties: Record<string, Schema> = {
    personalReadiness: { type: Type.INTEGER },
    workplaceExposure: { type: Type.INTEGER },
    summary: STR,
    strengths: STR_ARR,
    gaps: STR_ARR,
    roleChanges: STR_ARR,
    learnNext: STR_ARR,
    careerOpportunities: STR_ARR,
    prescription: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { moduleId: STR, reason: STR, category: { type: Type.STRING, enum: CATEGORIES } },
        required: ['moduleId', 'reason', 'category'],
      },
    },
  };
  const required = ['personalReadiness', 'workplaceExposure', 'summary', 'strengths', 'gaps', 'roleChanges', 'learnNext', 'careerOpportunities', 'prescription'];
  if (withTransition) {
    properties.careerTransition = TRANSITION_SCHEMA;
    required.push('careerTransition');
  }
  if (withImprovement) {
    properties.improvementExplanation = STR;
    properties.improvementDrivers = STR_ARR;
  }
  return { type: Type.OBJECT, properties, required };
}

function cleanLine(s: string, max = 220): string {
  const t = s
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function strArr(v: unknown, min: number, max: number, fallback: string[], maxLen = 220): string[] {
  if (!Array.isArray(v)) return fallback;
  const out = Array.from(new Set(v.filter((x): x is string => typeof x === 'string').map((x) => cleanLine(x, maxLen)).filter((x) => x.length >= 3)));
  return out.length >= min ? out.slice(0, max) : fallback;
}

function profileLines(c: Ctx, displayName: string): string {
  const role = c.role;
  const industry = c.industry;
  return [
    `Name: ${displayName.split(' ')[0] || 'the learner'}`,
    `Job title: ${c.jobTitle}`,
    `Functional area: ${c.roleLabel}${role ? ` — tasks being augmented by AI: ${role.aiImpactedTasks.join(', ')}` : ''}`,
    `Industry: ${c.industryLabel}${industry ? ` — AI use cases in this sector: ${industry.aiUseCases.join(', ')}` : ''}`,
    `Experience: ${EXPERIENCE_TEXT[c.a.experience]}`,
    `Organisation AI adoption: ${c.a.orgAdoption}; department AI usage: ${c.a.deptUsage}`,
    `Personal AI usage: ${c.a.personalUsage}; uses AI for: ${c.uses.map((u) => USE_CASE_LABEL[u]).join(', ') || 'nothing yet'}`,
    `Self-rated AI confidence: ${c.a.confidence}/5`,
    `Career objective: ${objectiveLabel(c.a.careerObjective)}${c.targetCareer ? ` — target career: ${c.targetCareer} (learning domain: ${c.learning.name})` : ''}`,
    `Current learning domain: ${c.domain.name}`,
  ].join('\n');
}

function candidateLines(c: Ctx): string {
  return allowedModules(c)
    .map((m) => `- ${m.id} | "${moduleTitle(m, c.learningDomainId)}" | ${m.level}${m.requiredForCertification ? ' | required for certification' : ''} | ${m.domainId ? getDomain(m.domainId)?.shortName : 'core'} | ${m.summary}`)
    .join('\n');
}

function normalizeTransition(raw: unknown, fb: CareerTransitionAnalysis, allowed: Set<string>): CareerTransitionAnalysis {
  if (!raw || typeof raw !== 'object') return fb;
  const r = raw as Record<string, unknown>;
  const transferable = Array.isArray(r.transferableSkills)
    ? (r.transferableSkills as unknown[])
        .map((x) => x as Record<string, unknown>)
        .filter((x) => x && typeof x.skill === 'string' && typeof x.note === 'string' && x.skill.trim())
        .map((x) => ({ skill: cleanLine(x.skill as string, 60), note: cleanLine(x.note as string, 180) }))
        .slice(0, 5)
    : [];
  const importances = ['critical', 'important', 'helpful'] as const;
  const missing = Array.isArray(r.missingSkills)
    ? (r.missingSkills as unknown[])
        .map((x) => x as Record<string, unknown>)
        .filter((x) => x && typeof x.skill === 'string' && x.skill.trim())
        .map((x) => ({
          skill: cleanLine(x.skill as string, 70),
          importance: (importances as readonly string[]).includes(x.importance as string) ? (x.importance as 'critical' | 'important' | 'helpful') : 'important',
        }))
        .slice(0, 6)
    : [];
  const pathway = Array.isArray(r.pathway)
    ? (r.pathway as unknown[])
        .map((x) => x as Record<string, unknown>)
        .filter((x) => x && typeof x.title === 'string' && x.title.trim())
        .slice(0, 8)
        .map((x, i) => {
          const id = typeof x.moduleId === 'string' && allowed.has(x.moduleId.trim()) ? x.moduleId.trim() : undefined;
          return { step: i + 1, title: cleanLine(x.title as string, 90), description: cleanLine(typeof x.description === 'string' ? x.description : '', 200), ...(id ? { moduleId: id } : {}) };
        })
    : [];
  const readiness = typeof r.readiness === 'number' && Number.isFinite(r.readiness) ? clamp(Math.max(fb.readiness - 15, Math.min(fb.readiness + 15, r.readiness)), 5, 95) : fb.readiness;
  return {
    currentRole: typeof r.currentRole === 'string' && r.currentRole.trim() ? cleanLine(r.currentRole, 60) : fb.currentRole,
    targetRole: typeof r.targetRole === 'string' && r.targetRole.trim() ? cleanLine(r.targetRole, 60) : fb.targetRole,
    targetDomainId: fb.targetDomainId,
    transferableSkills: transferable.length >= 2 ? transferable : fb.transferableSkills,
    missingSkills: missing.length >= 2 ? missing : fb.missingSkills,
    aiCompetencies: strArr(r.aiCompetencies, 2, 6, fb.aiCompetencies, 120),
    readiness,
    pathway: pathway.length >= 3 ? pathway : fb.pathway,
    outlook: typeof r.outlook === 'string' && r.outlook.trim().length > 30 ? cleanLine(r.outlook, 600) : fb.outlook,
  };
}

const SYSTEM_READINESS = `You are the ZimAI Ready readiness analyst. You turn a professional's onboarding answers into a precise, personal AI readiness analysis and an AI Skills Prescription.
- Write in the second person ("You are…"), warm but direct. Be specific to the person's job title, tasks, industry and objective — never generic.
- The engine scores are deterministic anchors. You may adjust each by at most ±10 points and only for a clear reason.
- The prescription MUST only use module ids from the candidate list. Each reason explains WHY that module matters for THIS person (one sentence, max ~30 words).
- Frame change as role transformation and augmentation, never as job loss.`;

/** Full ASSESS → ANALYSE → RECOMMEND pipeline: engine anchor + Gemini personalisation + validation. */
export async function runReadinessAnalysis(input: ReadinessAnalysisInput): Promise<ReadinessAssessment> {
  const { answers, displayName, kind = 'initial', previous } = input;
  const c = buildCtx(answers);
  const fallback = buildEngineAnalysis(input);
  const anchor = c.scores;
  const withTransition = c.transition && Boolean(answers.targetCareer);
  const withImprovement = Boolean(previous);
  const allowedIds = new Set(allowedModules(c).map((m) => m.id));

  const prompt = `Analyse this professional's AI readiness.

PROFILE
${profileLines(c, displayName)}

ENGINE SCORES (deterministic anchors)
- Personal AI readiness: ${anchor.personalReadiness}/100 (${readinessLevel(anchor.personalReadiness)})
- Workplace AI exposure: ${anchor.workplaceExposure}/100 (${exposureLabel(anchor.workplaceExposure)})
- Priority state: ${priorityState(anchor.personalReadiness, anchor.workplaceExposure)}
Score factors: ${anchor.factors.map((f) => `${f.label} (${f.group}, ${f.impact >= 0 ? '+' : ''}${f.impact})`).join('; ')}

CANDIDATE MODULES (id | personalised title | level | flags | domain | summary)
${candidateLines(c)}
${previous ? `\nPREVIOUS ASSESSMENT (${previous.createdAt.slice(0, 10)}): personal readiness ${previous.personalReadiness}, workplace exposure ${previous.workplaceExposure}; previous answers: usage ${previous.answers.personalUsage}, confidence ${previous.answers.confidence}/5, uses ${previous.answers.useCases.join(', ')}.` : ''}

RETURN JSON:
- personalReadiness, workplaceExposure: integers within ±10 of the anchors.
- summary: 2–3 sentences, second person. Model: "You are an HR Officer working in an organisation beginning to adopt AI. Your personal AI usage remains limited while recruitment, reporting and employee analytics are increasingly being augmented by AI."
- strengths: 3–4 short bullets grounded in the answers.
- gaps: 3–5 specific AI skills gaps for this role.
- roleChanges: 3–4 ways AI is transforming this specific role in ${c.industryLabel} (augmentation language).
- learnNext: 3–4 concrete learning actions.
- careerOpportunities: 3–4 realistic job titles this person could grow into.
- prescription: 4–7 modules in the order they should be studied. Must include "core-responsible" and "${challengeModuleId(c.learningDomainId)}" (the practical challenge, normally last). ${c.beginner ? 'This person is a beginner: fundamentals first.' : ''} ${c.lowUsage ? 'Low personal usage: put prompting early.' : ''} ${c.highExposure ? 'High exposure: bring domain modules forward.' : ''} ${c.confident ? 'Confident user: skip basics where sensible and include the advanced domain module.' : ''} ${answers.careerObjective === 'leadership' ? 'Leadership goal: include a management module (mgmt-decisions or mgmt-strategy).' : ''} ${answers.careerObjective === 'advanced-ai' ? 'Advanced AI goal: include the advanced domain module.' : ''} ${withTransition ? `Career transition: prioritise ${c.learning.name} modules with category "transition".` : ''}
${withTransition ? `- careerTransition: current role "${c.jobTitle}" → target "${c.targetCareer}". transferableSkills (3–4, with a note each), missingSkills (3–5 with importance), aiCompetencies (3–5), readiness 0–100 (realistic; the engine estimate is ${fallback.careerTransition?.readiness}), pathway (4–7 steps; use candidate moduleIds where relevant), outlook (2–3 responsible, non-alarmist sentences — no guarantees).` : ''}
${withImprovement ? '- improvementExplanation (2 sentences comparing with the previous assessment) and improvementDrivers (2–4 bullets).' : ''}`;

  const res = await generateJSON<ReadinessAssessment>({
    prompt,
    system: SYSTEM_READINESS,
    schema: readinessSchema(withTransition, withImprovement),
    temperature: 0.55,
    fallback: () => fallback,
    normalize: (raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const r = raw as Record<string, unknown>;
      if (typeof r.summary !== 'string' || r.summary.trim().length < 40) return null;
      const personalReadiness = boundedScore(r.personalReadiness, anchor.personalReadiness);
      const workplaceExposure = boundedScore(r.workplaceExposure, anchor.workplaceExposure);
      const out: ReadinessAssessment = {
        ...fallback,
        personalReadiness,
        workplaceExposure,
        readinessLevel: readinessLevel(personalReadiness),
        priorityState: priorityState(personalReadiness, workplaceExposure),
        summary: cleanLine(r.summary, 700),
        strengths: strArr(r.strengths, 3, 4, fallback.strengths),
        gaps: strArr(r.gaps, 3, 5, fallback.gaps),
        roleChanges: strArr(r.roleChanges, 3, 4, fallback.roleChanges),
        learnNext: strArr(r.learnNext, 3, 4, fallback.learnNext),
        careerOpportunities: strArr(r.careerOpportunities, 3, 4, fallback.careerOpportunities, 80),
        prescription: finalisePrescription(r.prescription, c, fallback.prescription),
        source: 'gemini',
      };
      if (withTransition && fallback.careerTransition) out.careerTransition = normalizeTransition(r.careerTransition, fallback.careerTransition, allowedIds);
      if (withImprovement) {
        if (typeof r.improvementExplanation === 'string' && r.improvementExplanation.trim().length > 20) out.improvementExplanation = cleanLine(r.improvementExplanation, 500);
        out.improvementDrivers = strArr(r.improvementDrivers, 1, 4, fallback.improvementDrivers ?? []);
      }
      return out;
    },
  });
  return { ...res.data, kind, source: res.source };
}

/** Standalone "what would it take to move into X?" analysis for the Career page. */
export async function analyseCareerTransition(input: { answers: OnboardingAnswers; displayName: string; targetCareer: string }): Promise<{ data: CareerTransitionAnalysis; source: AISource }> {
  const { answers, displayName } = input;
  const targetCareer = input.targetCareer.trim();
  const quick = TARGET_CAREERS.find((t) => t.label.toLowerCase() === targetCareer.toLowerCase());
  const targetDomainId =
    quick?.domainId ??
    resolveTargetDomain(targetCareer) ??
    (answers.targetCareer?.toLowerCase() === targetCareer.toLowerCase() ? answers.targetDomainId : undefined);
  const txAnswers: OnboardingAnswers = { ...answers, careerObjective: 'transition', targetCareer, targetDomainId };
  const c = buildCtx(txAnswers, undefined, targetDomainId);
  const fb = buildCareerTransition(answers, targetCareer, targetDomainId);
  const allowed = new Set(allowedModules(c).map((m) => m.id));

  const prompt = `Assess a realistic career transition for this professional.

PROFILE
${profileLines(c, displayName)}
Personal AI readiness (engine): ${c.scores.personalReadiness}/100

TARGET CAREER: ${titleCase(targetCareer)} (learning domain: ${c.learning.name})

CANDIDATE MODULES FOR THE PATHWAY (id | title | level | flags | domain | summary)
${candidateLines(c)}

RETURN JSON with: currentRole ("${c.jobTitle}"), targetRole, transferableSkills (3–4, each with a one-sentence note on why it transfers), missingSkills (3–5 with importance critical/important/helpful), aiCompetencies (3–5 AI-related competencies the target role requires), readiness (0–100 transition readiness; the engine estimate is ${fb.readiness}), pathway (4–7 ordered steps; use candidate moduleIds where a module fits, final step may be a portfolio/experience step without a moduleId), outlook (2–3 responsible, encouraging sentences with a realistic timeframe and no guarantees).`;

  const res = await generateJSON<CareerTransitionAnalysis>({
    prompt,
    system: 'You are the ZimAI Ready career transition advisor. Be specific, honest and encouraging. Build on genuinely transferable skills. Never promise outcomes.',
    schema: TRANSITION_SCHEMA,
    temperature: 0.5,
    fallback: () => fb,
    normalize: (raw) => (raw && typeof raw === 'object' ? normalizeTransition(raw, fb, allowed) : null),
  });
  return { data: res.data, source: res.source };
}
