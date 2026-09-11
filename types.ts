/**
 * ZimAI Ready — core data models.
 *
 * Every persisted entity lives in a named collection (see COLLECTIONS in
 * services/backend/types.ts). Shapes are Firestore-friendly: plain JSON, ISO
 * date strings, no class instances, no undefined inside arrays.
 */

// ───────────────────────────── Shared primitives ─────────────────────────────

export type ISODate = string; // e.g. new Date().toISOString()
export type AISource = 'gemini' | 'engine'; // 'engine' = built-in deterministic fallback

export type UserRole = 'employee' | 'employer';

/** 0 Needs development · 1 Developing · 2 Competent · 3 AI Ready */
export type SkillLevel = 0 | 1 | 2 | 3;

export type ReadinessLevel = 'AI Beginner' | 'Developing' | 'AI Capable' | 'AI Ready';

export type PriorityState =
  | 'Priority Upskilling Recommended'
  | 'Well Positioned'
  | 'Future Ready'
  | 'Build Foundations';

export type DomainId =
  | 'finance'
  | 'hr'
  | 'marketing'
  | 'software'
  | 'customer-service'
  | 'operations'
  | 'management'
  | 'agriculture'
  | 'healthcare'
  | 'education'
  | 'data-analytics';

// ───────────────────────────── Users ─────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  organisationId?: string; // employer: org they manage · employee: org they belong to (optional)
  isDemo?: boolean; // demo users are always stored locally
  demoKey?: DemoKey;
  createdAt: ISODate;
}

export type DemoKey = 'employee' | 'transition' | 'employer';

// ───────────────────────────── Reference data ─────────────────────────────

export interface Industry {
  id: string;
  name: string;
  icon: string; // lucide icon name, resolved by components/ui/Icon
  aiExposure: number; // 0–100 baseline sector exposure to AI-driven change
  description: string;
  aiUseCases: string[]; // how AI is showing up in this sector (Zimbabwe context)
}

export interface FunctionalRole {
  id: string;
  name: string;
  icon: string;
  aiExposure: number; // 0–100 baseline task exposure for the function
  domainId: DomainId; // default learning domain
  exampleTitles: string[];
  aiImpactedTasks: string[];
}

export type SkillCategory =
  | 'foundations'
  | 'tools'
  | 'analytics'
  | 'responsible'
  | 'critical'
  | 'domain'
  | 'leadership';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
}

// ───────────────────────────── Onboarding & profiles ─────────────────────────────

export type ExperienceBand = '0-2' | '3-5' | '6-10' | '11-15' | '16+';
export type OrgAdoption = 'extensive' | 'partial' | 'experimenting' | 'not-yet' | 'unknown';
export type DeptUsage = 'regularly' | 'occasionally' | 'experimenting' | 'never' | 'unsure';
export type PersonalUsage = 'daily' | 'weekly' | 'occasionally' | 'never';
export type UseCase =
  | 'writing'
  | 'research'
  | 'data-analysis'
  | 'automation'
  | 'coding'
  | 'customer-support'
  | 'reporting'
  | 'brainstorming'
  | 'decision-support'
  | 'none';
export type Confidence = 1 | 2 | 3 | 4 | 5; // Beginner → Advanced
export type CareerObjective =
  | 'better-current-job'
  | 'ai-ready-current'
  | 'prepare-changes'
  | 'transition'
  | 'leadership'
  | 'advanced-ai';

export interface OnboardingAnswers {
  industryId: string;
  industryOther?: string;
  roleId: string;
  roleOther?: string;
  jobTitle: string;
  experience: ExperienceBand;
  orgAdoption: OrgAdoption;
  deptUsage: DeptUsage;
  personalUsage: PersonalUsage;
  useCases: UseCase[];
  confidence: Confidence;
  careerObjective: CareerObjective;
  targetCareer?: string; // free text or a role name when objective = 'transition'
  targetDomainId?: DomainId; // resolved learning domain for the target career
}

export interface EmployeeProfile extends OnboardingAnswers {
  userId: string;
  displayName: string;
  department?: string;
  organisationId?: string;
  domainId: DomainId; // resolved learning domain for current role
  onboardingCompletedAt?: ISODate;
  updatedAt: ISODate;
}

// ───────────────────────────── Readiness assessment ─────────────────────────────

export type PrescriptionCategory = 'fundamentals' | 'domain' | 'responsible' | 'practical' | 'transition' | 'advanced';

export interface SkillPrescriptionItem {
  moduleId: string; // must exist in data/catalog.ts
  title: string; // personalised title shown to the learner
  reason: string; // WHY it matters for this person
  priority: number; // 1 = first
  category: PrescriptionCategory;
  estimatedMinutes: number;
  skillIds: string[];
}

export interface CareerTransitionAnalysis {
  currentRole: string;
  targetRole: string;
  targetDomainId?: DomainId;
  transferableSkills: { skill: string; note: string }[];
  missingSkills: { skill: string; importance: 'critical' | 'important' | 'helpful' }[];
  aiCompetencies: string[];
  readiness: number; // 0–100 career transition readiness
  pathway: { step: number; title: string; description: string; moduleId?: string }[];
  outlook: string; // responsible, non-alarmist summary
}

export interface ReadinessAssessment {
  id: string;
  userId: string;
  kind: 'initial' | 'reassessment';
  createdAt: ISODate;
  answers: OnboardingAnswers; // snapshot of what the analysis used
  personalReadiness: number; // 0–100
  workplaceExposure: number; // 0–100
  readinessLevel: ReadinessLevel;
  priorityState: PriorityState;
  summary: string; // short personalised explanation
  strengths: string[];
  gaps: string[];
  roleChanges: string[]; // how AI is changing the role
  learnNext: string[];
  careerOpportunities: string[];
  prescription: SkillPrescriptionItem[]; // 4–7 items in priority order
  careerTransition?: CareerTransitionAnalysis;
  // Reassessment only
  previousAssessmentId?: string;
  improvementExplanation?: string;
  improvementDrivers?: string[];
  source: AISource;
}

// ───────────────────────────── Learning content ─────────────────────────────

export type ModuleKind = 'core' | 'domain' | 'challenge';

export interface ModuleMeta {
  id: string;
  kind: ModuleKind;
  domainId?: DomainId; // undefined for shared core modules
  title: string; // may contain {domain} or {professional} placeholders (core modules)
  summary: string;
  skillIds: string[];
  estimatedMinutes: number;
  level: 'foundation' | 'intermediate' | 'advanced';
  requiredForCertification: boolean;
  icon: string;
}

export type LessonBlock =
  | { type: 'explain'; title: string; body: string; bullets?: string[] }
  | { type: 'example'; title: string; scenario: string; takeaway: string }
  | {
      /** Rendered with a live Gemini example personalised to the learner; `fallback` is shown offline. */
      type: 'ai-example';
      title: string;
      instruction: string; // what Gemini should generate, e.g. "Show a before/after prompt for month-end variance commentary"
      fallback: string;
    }
  | {
      /** Tap-to-sort / choose-the-better-option style activity. */
      type: 'interactive';
      title: string;
      prompt: string;
      mode: 'choose-better' | 'spot-the-risk' | 'sort';
      options: { id: string; label: string; correct: boolean; feedback: string }[];
    }
  | {
      type: 'quiz';
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      skillId?: string;
    }
  | { type: 'task'; title: string; instructions: string; hint?: string };

export interface Lesson {
  id: string; // unique across the app, e.g. "fin-ai-analysis-1"
  title: string;
  minutes: number;
  blocks: LessonBlock[]; // 4–7 blocks, short text only
}

export interface PracticalActivity {
  id: string;
  title: string;
  domainId?: DomainId;
  scenario: string; // fictional Zimbabwean workplace scenario
  data?: string; // optional fictional data/table/text the learner works with (markdown-ish plain text)
  task: string; // what the learner must submit
  rubric: { criterion: string; description: string; weight: number }[]; // weights sum to 100
  skillIds: string[];
  sampleStrongAnswer?: string; // used by the offline evaluator & as a model answer after submission
}

export interface ModuleContent {
  moduleId: string;
  /** Optional per-domain override examples for shared core modules. */
  domainExamples?: Partial<Record<DomainId, { scenario: string; takeaway: string }>>;
  lessons: Lesson[];
  activity?: PracticalActivity;
}

export interface LearningPathway {
  domainId: DomainId;
  moduleIds: string[]; // default full pathway order
}

// ───────────────────────────── Progress ─────────────────────────────

export type ModuleStatus = 'not-started' | 'in-progress' | 'completed';

export interface ModuleProgress {
  moduleId: string;
  status: ModuleStatus;
  lessonsCompleted: string[];
  currentLessonId?: string;
  quizCorrect: number;
  quizTotal: number;
  struggling: boolean; // adaptive flag
  mastery: number; // 0–100
  startedAt?: ISODate;
  completedAt?: ISODate;
  minutesSpent: number;
}

export interface PathItem {
  moduleId: string;
  priority: number;
  reason: string;
  required: boolean;
  addedBy: 'prescription' | 'adaptive' | 'maintenance' | 'transition';
  addedAt: ISODate;
}

export interface ActivityLogEntry {
  at: ISODate;
  type: 'lesson' | 'quiz' | 'activity' | 'tutor' | 'assessment' | 'certificate' | 'reassessment' | 'path';
  label: string;
}

export interface EmployeeProgress {
  userId: string;
  domainId: DomainId;
  targetDomainId?: DomainId;
  path: PathItem[];
  modules: Record<string, ModuleProgress>;
  skillLevels: Record<string, SkillLevel>;
  streak: { current: number; longest: number; lastActiveDate?: string }; // YYYY-MM-DD
  activity: ActivityLogEntry[]; // newest first, capped at ~50
  tutorQuestions: number;
  pace: 'supported' | 'standard' | 'accelerated';
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ───────────────────────────── AI feedback, activities & assessments ─────────────────────────────

export interface AIFeedback {
  score: number; // 0–100
  verdict: 'excellent' | 'good' | 'developing' | 'needs-work';
  overall: string;
  criteria: { criterion: string; score: number; max: number; comment: string }[];
  strengths: string[];
  improvements: string[];
}

export interface ActivitySubmission {
  id: string;
  userId: string;
  moduleId: string;
  activityId: string;
  answer: string;
  feedback: AIFeedback;
  createdAt: ISODate;
  source: AISource;
}

export type AssessmentKind = 'final-knowledge' | 'capstone';

export interface AssessmentResult {
  id: string;
  userId: string;
  kind: AssessmentKind;
  domainId: DomainId;
  score: number; // 0–100
  passed: boolean;
  /** Dimension scores, e.g. Knowledge, Tool usage, Domain application, Critical thinking, Responsible AI, Verification */
  breakdown: { dimension: string; score: number; max: number; comment?: string }[];
  responsibleAIScore?: number; // 0–100, used by certification rules
  answer?: string; // capstone submission
  feedback?: AIFeedback;
  createdAt: ISODate;
  source: AISource;
}

// ───────────────────────────── Certification ─────────────────────────────

export type CertificationLevel = 'AI_AWARE' | 'AI_CAPABLE' | 'AI_READY';
export type CertificateType = 'domain' | 'employer';

export interface Certificate {
  id: string; // e.g. "ZAR-2026-7F3K9Q"
  userId: string;
  holderName: string;
  type: CertificateType;
  level: CertificationLevel;
  domainId: DomainId;
  domainName: string;
  competency: string; // e.g. "AI-Augmented Financial Operations"
  competencies: { name: string; skillId?: string; status: 'verified' }[];
  readinessScore: number;
  issueDate: ISODate;
  expiryDate: ISODate; // readiness is not permanent — renew annually
  organisationId?: string; // employer certificates only
  organisationName?: string;
  status: 'valid' | 'expired' | 'revoked';
  evidence: {
    knowledgeScore: number;
    capstoneScore: number;
    responsibleAIScore: number;
    modulesCompleted: number;
    practicalsCompleted: number;
  };
}

/** Shareable AI Skills Profile snapshot (collection publicProfiles, doc id = userId). Contains no private answers. */
export interface PublicSkillsProfile {
  userId: string;
  name: string;
  headline: string; // e.g. "HR Officer · Banking & Finance"
  domainId: DomainId;
  domainName: string;
  readiness: number;
  readinessLevel: ReadinessLevel;
  certification: { id: string; level: CertificationLevel; type: CertificateType; issueDate: ISODate } | null;
  competencies: { name: string; status: 'verified' | 'in-progress' | 'not-started'; evidence?: string }[];
  skills: { skillId: string; name: string; level: SkillLevel }[];
  updatedAt: ISODate;
}

// ───────────────────────────── Employer ─────────────────────────────

export type WorkforceSize = '1-50' | '51-200' | '201-500' | '501-1000' | '1000+';
export type MaturityLevel = 'Exploring' | 'Emerging' | 'Developing' | 'Scaling' | 'Leading';

export interface EmployerCompetency {
  id: string;
  name: string;
  description: string;
  skillIds: string[]; // mapped platform skills used to measure it
  requiredLevel: SkillLevel; // minimum level expected
  priority: 'critical' | 'important' | 'desirable';
}

export interface OrgMaturity {
  score: number; // 0–100
  level: MaturityLevel;
  summary: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
  dimensions: { name: string; score: number }[]; // e.g. Strategy, Adoption, Skills, Data, Governance
  source: AISource;
  assessedAt: ISODate;
}

export interface Organisation {
  id: string;
  name: string;
  industryId: string;
  workforceSize: WorkforceSize;
  departments: string[];
  adoptionLevel: OrgAdoption;
  departmentsUsingAI: string[];
  toolsIntroduced: string[];
  transformationDepartments: string[];
  desiredSkills: string[]; // skill ids
  requiredCompetencies: EmployerCompetency[];
  maturity?: OrgMaturity;
  ownerUserId: string;
  isDemo?: boolean;
  isSampleWorkforce?: boolean; // true when workforce records are generated sample data
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type WorkforceStatus = 'ai-ready' | 'upskilling' | 'priority-reskilling';

/** An employee as seen by their employer — deliberately minimal personal data. */
export interface WorkforceMember {
  id: string;
  organisationId: string;
  name: string;
  department: string;
  role: string;
  domainId: DomainId;
  readiness: number; // personal AI readiness 0–100
  exposure: number; // workplace AI exposure 0–100
  learningProgress: number; // 0–100
  status: WorkforceStatus;
  skillLevels: Record<string, SkillLevel>;
  certification: { type: CertificateType; level: CertificationLevel } | null;
  lastActive: ISODate;
  linkedUserId?: string;
}

// ───────────────────────────── AI chat ─────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  at: ISODate;
  source?: AISource;
}
