import type { Skill } from '../types';

/** Platform skills taxonomy. Skill ids are referenced by modules, assessments, certificates and employer competencies. */
export const SKILLS: Skill[] = [
  // Foundations & tools
  { id: 'ai-fundamentals', name: 'AI Fundamentals', category: 'foundations', description: 'What AI and generative AI are, what they can and cannot do.' },
  { id: 'prompt-engineering', name: 'Prompt Engineering', category: 'tools', description: 'Writing clear, structured prompts with context, constraints and examples.' },
  { id: 'ai-writing', name: 'AI-Assisted Writing & Communication', category: 'tools', description: 'Drafting and refining documents, emails and content with AI.' },
  { id: 'ai-automation', name: 'Workflow Automation with AI', category: 'tools', description: 'Using AI to automate repetitive steps in a workflow.' },
  // Analytics
  { id: 'ai-analytics', name: 'AI-Assisted Analytics', category: 'analytics', description: 'Using AI to explore, summarise and interpret data.' },
  { id: 'data-interpretation', name: 'Data Interpretation', category: 'analytics', description: 'Reading data correctly and drawing sound conclusions.' },
  { id: 'predictive-analytics', name: 'Predictive Analytics', category: 'analytics', description: 'Understanding forecasts and predictive models and their limits.' },
  { id: 'data-visualisation', name: 'Data Visualisation & Storytelling', category: 'analytics', description: 'Turning analysis into clear charts and narratives.' },
  { id: 'sql-data', name: 'Data Querying (Excel/SQL)', category: 'analytics', description: 'Extracting and shaping data using spreadsheets and SQL.' },
  // Responsible & critical
  { id: 'responsible-ai', name: 'Responsible AI', category: 'responsible', description: 'Ethical, appropriate and accountable use of AI at work.' },
  { id: 'data-privacy', name: 'Data Privacy & Confidentiality', category: 'responsible', description: 'Protecting personal and confidential information when using AI.' },
  { id: 'bias-awareness', name: 'Bias & Fairness', category: 'responsible', description: 'Recognising and mitigating bias in AI outputs and decisions.' },
  { id: 'ai-governance', name: 'AI Governance & Policy', category: 'responsible', description: 'Policies, controls and accountability for AI use.' },
  { id: 'ai-verification', name: 'AI Output Verification', category: 'critical', description: 'Detecting hallucinations and checking AI outputs against sources.' },
  { id: 'critical-thinking', name: 'Critical Evaluation & Human Oversight', category: 'critical', description: 'Challenging AI recommendations and keeping humans accountable.' },
  { id: 'decision-support', name: 'AI Decision Support', category: 'critical', description: 'Using AI to inform — not replace — professional judgement.' },
  // Leadership
  { id: 'ai-strategy', name: 'AI Strategy & Change Leadership', category: 'leadership', description: 'Leading teams through AI adoption and change.' },
  // Specialised / domain
  { id: 'financial-analysis', name: 'AI-Assisted Financial Analysis', category: 'domain', description: 'Analysing financial information with AI while checking conclusions.' },
  { id: 'fraud-detection', name: 'Fraud Detection Awareness', category: 'domain', description: 'How AI flags anomalies and how to act on alerts responsibly.' },
  { id: 'ai-recruitment', name: 'AI-Assisted Recruitment', category: 'domain', description: 'Fair, transparent use of AI across the hiring process.' },
  { id: 'customer-ai', name: 'AI in Customer Experience', category: 'domain', description: 'AI-assisted service, personalisation and escalation.' },
  { id: 'ai-coding', name: 'AI-Assisted Software Development', category: 'domain', description: 'Coding, debugging and reviewing with AI assistants safely.' },
  { id: 'ai-maintenance', name: 'AI-Assisted Maintenance', category: 'domain', description: 'Predictive maintenance and condition monitoring.' },
  { id: 'safety-ai', name: 'Safety & Risk Monitoring with AI', category: 'domain', description: 'Using AI to support — not replace — safety processes.' },
  // Domain application competencies (one per learning domain)
  { id: 'domain-finance', name: 'AI in Finance & Accounting', category: 'domain', description: 'Applying AI responsibly across finance workflows.' },
  { id: 'domain-hr', name: 'AI in Human Resources', category: 'domain', description: 'Applying AI responsibly across the employee lifecycle.' },
  { id: 'domain-marketing', name: 'AI in Marketing & Sales', category: 'domain', description: 'Applying AI to campaigns, content and customer growth.' },
  { id: 'domain-software', name: 'AI in Software & IT', category: 'domain', description: 'Applying AI across the software and IT lifecycle securely.' },
  { id: 'domain-customer-service', name: 'AI in Customer Service', category: 'domain', description: 'Applying AI to service quality and efficiency.' },
  { id: 'domain-operations', name: 'AI in Operations', category: 'domain', description: 'Applying AI to process, supply chain and asset management.' },
  { id: 'domain-management', name: 'AI in Management', category: 'domain', description: 'Applying AI to decisions, strategy and team leadership.' },
  { id: 'domain-agriculture', name: 'AI in Agriculture', category: 'domain', description: 'Applying AI to crops, livestock, markets and advisory.' },
  { id: 'domain-healthcare', name: 'AI in Healthcare', category: 'domain', description: 'Applying AI safely in clinical and health administration settings.' },
  { id: 'domain-education', name: 'AI in Education', category: 'domain', description: 'Applying AI to teaching, learning and assessment.' },
  { id: 'domain-data-analytics', name: 'AI in Data Analytics', category: 'domain', description: 'Applying AI across the analytics workflow.' },
];

export const getSkill = (id: string) => SKILLS.find((s) => s.id === id);
export const skillName = (id: string) => getSkill(id)?.name ?? id;

/** The five competencies shown on the shareable AI Skills Profile / certificate. */
export const CORE_COMPETENCIES = [
  { name: 'AI Fundamentals', skillIds: ['ai-fundamentals'] },
  { name: 'Prompt Engineering', skillIds: ['prompt-engineering'] },
  { name: 'AI-Assisted Analytics', skillIds: ['ai-analytics', 'data-interpretation'] },
  { name: 'Responsible AI', skillIds: ['responsible-ai', 'data-privacy', 'bias-awareness'] },
  { name: 'Output Verification', skillIds: ['ai-verification', 'critical-thinking'] },
];
