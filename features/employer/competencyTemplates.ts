import type { EmployerCompetency, SkillLevel } from '../../types';

/**
 * Industry templates for employer-defined AI competencies. Each competency is
 * measured through mapped platform skills (data/skills.ts).
 */

type Tpl = [name: string, description: string, skillIds: string[], requiredLevel: SkillLevel, priority: EmployerCompetency['priority']];

export interface CompetencyTemplate {
  id: string; // industry id or 'generic'
  label: string;
  competencies: Tpl[];
}

const RESPONSIBLE: Tpl = ['Responsible AI', 'Uses AI ethically and accountably, checks outputs for bias and errors, and keeps a human in charge of decisions.', ['responsible-ai', 'bias-awareness', 'ai-verification'], 2, 'critical'];
const PRIVACY = (context: string): Tpl => ['Data Privacy', `Protects ${context} data when using AI tools — no confidential information in unapproved tools.`, ['data-privacy'], 2, 'critical'];

export const COMPETENCY_TEMPLATES: CompetencyTemplate[] = [
  {
    id: 'banking',
    label: 'Banking & Finance',
    competencies: [
      ['AI Governance', 'Understands the bank’s AI policy, model-risk controls and when AI use must be escalated or approved.', ['ai-governance', 'responsible-ai'], 2, 'important'],
      ['Financial Analysis with AI', 'Uses AI to analyse financial information and draft commentary — and verifies every figure before it is relied on.', ['financial-analysis', 'ai-analytics'], 2, 'desirable'],
      ['Fraud Detection Awareness', 'Understands how AI flags suspicious transactions, the cost of false positives and how to act on alerts responsibly.', ['fraud-detection'], 2, 'critical'],
      PRIVACY('customer, account and KYC'),
      RESPONSIBLE,
    ],
  },
  {
    id: 'mining',
    label: 'Mining',
    competencies: [
      ['Predictive Analytics', 'Reads AI forecasts for ore grade, throughput and equipment health, and understands their limits.', ['predictive-analytics', 'data-interpretation'], 2, 'important'],
      ['Operational Optimisation', 'Uses AI to identify bottlenecks and automate routine operational steps safely.', ['ai-automation', 'domain-operations'], 2, 'important'],
      ['AI-Assisted Maintenance', 'Acts on condition-monitoring and predictive-maintenance alerts with sound engineering judgement.', ['ai-maintenance'], 2, 'critical'],
      ['Safety & Risk Monitoring', 'Uses AI to support — never replace — safety processes, and escalates anomalies immediately.', ['safety-ai', 'critical-thinking'], 2, 'critical'],
      ['Data Interpretation', 'Interprets sensor and production data correctly before making decisions.', ['data-interpretation', 'ai-analytics'], 2, 'desirable'],
    ],
  },
  {
    id: 'telecoms',
    label: 'Telecommunications',
    competencies: [
      ['Customer AI & Automation', 'Works effectively alongside chatbots and automated support, designing clean human escalation.', ['customer-ai', 'ai-automation'], 2, 'important'],
      ['Network & Churn Analytics', 'Understands predictive models for network load and churn, and questions their outputs.', ['predictive-analytics', 'ai-analytics'], 2, 'desirable'],
      ['Fraud Detection Awareness', 'Recognises SIM-swap and mobile-money fraud patterns flagged by AI and acts responsibly.', ['fraud-detection'], 2, 'critical'],
      PRIVACY('subscriber'),
      RESPONSIBLE,
    ],
  },
  {
    id: 'retail',
    label: 'Retail',
    competencies: [
      ['Demand Forecasting', 'Uses AI demand forecasts for ordering and stock planning while checking them against local realities.', ['predictive-analytics', 'data-interpretation'], 2, 'important'],
      ['Customer Insights with AI', 'Uses AI to understand customer behaviour, segments and promotions.', ['customer-ai', 'ai-analytics'], 2, 'important'],
      ['AI-Supported Pricing Decisions', 'Treats AI pricing suggestions (USD/ZiG) as decision support, not decisions.', ['decision-support', 'critical-thinking'], 2, 'desirable'],
      PRIVACY('customer and loyalty'),
      ['Output Verification', 'Checks AI-generated reports and product content before publishing.', ['ai-verification'], 2, 'critical'],
    ],
  },
  {
    id: 'agriculture',
    label: 'Agriculture',
    competencies: [
      ['Crop & Climate Forecasting', 'Interprets AI weather, yield and pest forecasts to plan the season.', ['predictive-analytics', 'domain-agriculture'], 2, 'important'],
      ['AI-Assisted Farmer Advisory', 'Uses AI to prepare timely, local and trustworthy advice for farmers.', ['ai-writing', 'domain-agriculture'], 2, 'important'],
      ['Data Interpretation', 'Reads field and market data correctly before acting on it.', ['data-interpretation'], 2, 'desirable'],
      ['Output Verification', 'Tests AI advice against agronomic knowledge and local conditions.', ['ai-verification', 'critical-thinking'], 2, 'critical'],
      RESPONSIBLE,
    ],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    competencies: [
      ['Clinical Documentation with AI', 'Uses AI to reduce paperwork while keeping records accurate.', ['ai-writing', 'domain-healthcare'], 2, 'important'],
      ['Decision Support Limits', 'Understands where diagnostic and triage AI helps, where it fails, and that clinicians decide.', ['decision-support', 'ai-verification'], 2, 'critical'],
      PRIVACY('patient'),
      ['Bias & Fairness', 'Recognises bias in AI recommendations across patient groups.', ['bias-awareness'], 2, 'important'],
      RESPONSIBLE,
    ],
  },
  {
    id: 'education',
    label: 'Education',
    competencies: [
      ['AI Lesson Planning', 'Plans and differentiates learning materials with AI.', ['ai-writing', 'domain-education'], 2, 'important'],
      ['Assessment Integrity', 'Uses AI for feedback fairly and manages AI-assisted student work sensibly.', ['ai-verification', 'critical-thinking'], 2, 'critical'],
      PRIVACY('learner'),
      ['Learning Analytics', 'Interprets learner data and AI tutor insights to support every learner.', ['ai-analytics', 'data-interpretation'], 1, 'desirable'],
      RESPONSIBLE,
    ],
  },
  {
    id: 'government',
    label: 'Government / Public Sector',
    competencies: [
      ['Document Processing Automation', 'Uses AI to process and draft documents faster with proper controls.', ['ai-automation', 'ai-writing'], 2, 'important'],
      PRIVACY('citizen'),
      ['AI Governance & Accountability', 'Applies public-sector AI policy, transparency and accountability requirements.', ['ai-governance', 'responsible-ai'], 2, 'critical'],
      ['Evidence-Based Decision Support', 'Uses AI analysis to inform, not make, public decisions.', ['decision-support', 'data-interpretation'], 2, 'important'],
      ['Output Verification', 'Verifies AI-generated content before it reaches citizens.', ['ai-verification'], 2, 'critical'],
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    competencies: [
      ['Predictive Maintenance', 'Acts on AI equipment-health predictions to reduce downtime.', ['ai-maintenance', 'predictive-analytics'], 2, 'critical'],
      ['Quality & Safety Monitoring', 'Uses AI inspection and monitoring to support quality and safety processes.', ['safety-ai'], 2, 'critical'],
      ['Production Optimisation', 'Uses AI to improve planning, energy use and throughput.', ['ai-automation', 'domain-operations'], 2, 'important'],
      ['Data Interpretation', 'Interprets production data correctly.', ['data-interpretation'], 2, 'desirable'],
      RESPONSIBLE,
    ],
  },
  {
    id: 'tourism',
    label: 'Tourism & Hospitality',
    competencies: [
      ['Guest Experience AI', 'Uses AI for multilingual guest service and personalisation, with warm human handover.', ['customer-ai'], 2, 'important'],
      ['Marketing Content with AI', 'Creates on-brand destination content with AI and checks its accuracy.', ['ai-writing', 'domain-marketing'], 2, 'important'],
      ['Revenue & Demand Insights', 'Interprets AI booking and pricing forecasts.', ['ai-analytics', 'predictive-analytics'], 1, 'desirable'],
      PRIVACY('guest'),
      ['Output Verification', 'Checks AI content and translations before guests see them.', ['ai-verification'], 2, 'critical'],
    ],
  },
  {
    id: 'ict',
    label: 'ICT / Technology',
    competencies: [
      ['AI-Assisted Development', 'Codes, tests and documents with AI assistants while remaining accountable for the result.', ['ai-coding'], 2, 'important'],
      ['Secure AI Use', 'Detects insecure or incorrect AI-generated code and configurations.', ['ai-verification', 'domain-software'], 2, 'critical'],
      ['AI Governance', 'Applies model, licence and usage policies to AI products and tools.', ['ai-governance'], 2, 'important'],
      ['Workflow Automation', 'Automates testing, triage and support workflows with AI.', ['ai-automation'], 2, 'desirable'],
      PRIVACY('customer and system'),
    ],
  },
  {
    id: 'professional-services',
    label: 'Professional Services',
    competencies: [
      ['Research & Drafting with AI', 'Uses structured prompting for research, drafting and proposals.', ['ai-writing', 'prompt-engineering'], 2, 'important'],
      ['Document Review Verification', 'Verifies AI document review and citations before advice is given.', ['ai-verification', 'critical-thinking'], 2, 'critical'],
      PRIVACY('client'),
      ['Audit & Advisory Analytics', 'Uses AI analytics to test data and surface insights.', ['ai-analytics', 'data-interpretation'], 2, 'desirable'],
      ['AI Governance', 'Applies professional standards and firm policy to AI use.', ['ai-governance'], 2, 'important'],
    ],
  },
  {
    id: 'generic',
    label: 'General (any industry)',
    competencies: [
      ['AI Fundamentals', 'Understands what AI can and cannot do in their role.', ['ai-fundamentals'], 2, 'important'],
      ['Effective Prompting', 'Writes clear, structured prompts that produce work-ready outputs.', ['prompt-engineering'], 2, 'important'],
      PRIVACY('confidential'),
      ['Output Verification', 'Checks AI outputs against sources before relying on them.', ['ai-verification', 'critical-thinking'], 2, 'critical'],
      RESPONSIBLE,
    ],
  },
];

export const getTemplate = (id?: string): CompetencyTemplate => COMPETENCY_TEMPLATES.find((t) => t.id === id) ?? COMPETENCY_TEMPLATES.find((t) => t.id === 'generic')!;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Materialises a template into EmployerCompetency records with stable ids. */
export function competenciesFromTemplate(industryId?: string): EmployerCompetency[] {
  const tpl = getTemplate(industryId);
  return tpl.competencies.map(([name, description, skillIds, requiredLevel, priority]) => ({
    id: `comp-${tpl.id}-${slug(name)}`,
    name,
    description,
    skillIds,
    requiredLevel,
    priority,
  }));
}

export const PRIORITY_META: Record<EmployerCompetency['priority'], { label: string; tone: 'clay' | 'gold' | 'neutral'; rank: number }> = {
  critical: { label: 'Critical', tone: 'clay', rank: 0 },
  important: { label: 'Important', tone: 'gold', rank: 1 },
  desirable: { label: 'Desirable', tone: 'neutral', rank: 2 },
};
