import type {
  ActivitySubmission,
  AssessmentResult,
  Certificate,
  CertificateType,
  CertificationLevel,
  EmployeeProgress,
  EmployerCompetency,
  Organisation,
  SkillLevel,
  User,
} from '../types';
import { APP, CERT_RULES } from '../config';
import { getDomain } from '../data/catalog';
import { CORE_COMPETENCIES } from '../data/skills';
import { nowISO } from './utils';

/**
 * Certification rules (Stage 3) — single source of truth.
 * Certification requires DEMONSTRATED competency; completing content alone never certifies.
 */

export const LEVEL_META: Record<CertificationLevel, { label: string; description: string; color: string; rank: number }> = {
  AI_AWARE: { label: 'AI Aware', description: 'Understands AI concepts and risks.', color: '#0284c7', rank: 1 },
  AI_CAPABLE: { label: 'AI Capable', description: 'Can effectively use AI for selected professional activities.', color: '#d98300', rank: 2 },
  AI_READY: { label: 'AI Ready', description: 'Can responsibly integrate AI into professional workflows and demonstrate practical competency.', color: '#0a8a5f', rank: 3 },
};

export const LEVEL_ORDER: CertificationLevel[] = ['AI_AWARE', 'AI_CAPABLE', 'AI_READY'];

export const CERT_TYPE_META: Record<CertificateType, { label: string; description: string }> = {
  domain: {
    label: 'Domain AI Ready',
    description: 'Independently demonstrates AI readiness within a profession. Portable across employers.',
  },
  employer: {
    label: 'Employer AI Ready',
    description: 'Demonstrates competency against the AI requirements defined by a specific employer.',
  },
};

export interface Requirement {
  id: string;
  level: CertificationLevel;
  label: string;
  detail: string;
  met: boolean;
  progress: number; // 0–100
}

export interface CertificationStatus {
  domainId: EmployeeProgress['domainId'];
  requirements: Requirement[];
  achievableLevel: CertificationLevel | null; // highest level whose requirements (and all lower levels') are met
  nextLevel: CertificationLevel | null;
  bestKnowledge?: AssessmentResult;
  bestCapstone?: AssessmentResult;
  practicalsCompleted: number;
  practicalAverage: number;
  requiredTotal: number;
  requiredCompleted: number;
  pathPercent: number;
  responsibleAIScore: number;
  finalUnlocked: boolean;
  capstoneUnlocked: boolean;
  readinessScore: number; // composite used on the certificate
}

const best = (rs: AssessmentResult[], kind: AssessmentResult['kind']) =>
  rs.filter((r) => r.kind === kind).sort((a, b) => b.score - a.score)[0];

export function evaluateCertification(input: {
  progress: EmployeeProgress | null;
  submissions: ActivitySubmission[];
  results: AssessmentResult[];
}): CertificationStatus {
  const { progress, submissions, results } = input;
  const status = (id: string) => progress?.modules[id]?.status ?? 'not-started';
  const required = (progress?.path ?? []).filter((p) => p.required);
  const requiredCompleted = required.filter((p) => status(p.moduleId) === 'completed').length;
  const requiredTotal = required.length;
  const pathPercent = requiredTotal ? Math.round((requiredCompleted / requiredTotal) * 100) : 0;

  const bestByActivity = new Map<string, number>();
  submissions.forEach((s) => bestByActivity.set(s.activityId, Math.max(bestByActivity.get(s.activityId) ?? 0, s.feedback.score)));
  const passedPracticals = [...bestByActivity.values()].filter((v) => v >= 60);
  const practicalsCompleted = passedPracticals.length;
  const practicalAverage = bestByActivity.size ? Math.round([...bestByActivity.values()].reduce((a, b) => a + b, 0) / bestByActivity.size) : 0;

  const bestKnowledge = best(results, 'final-knowledge');
  const bestCapstone = best(results, 'capstone');
  const k = bestKnowledge?.score ?? 0;
  const c = bestCapstone?.score ?? 0;
  const rai = [bestKnowledge?.responsibleAIScore, bestCapstone?.responsibleAIScore].filter((x): x is number => typeof x === 'number');
  const responsibleAIScore = rai.length === 2 ? Math.round((rai[0] + rai[1]) / 2) : rai.length === 1 ? Math.round(rai[0] * 0.5) : 0;

  const awareModules = ['core-fundamentals', 'core-responsible'].filter((id) => status(id) === 'completed').length;
  const pct = (v: number, target: number) => Math.min(100, Math.round((v / Math.max(1, target)) * 100));

  const requirements: Requirement[] = [
    { id: 'aware-modules', level: 'AI_AWARE', label: 'AI Fundamentals & Responsible AI modules completed', detail: `${awareModules}/2 completed`, met: awareModules === 2, progress: pct(awareModules, 2) },
    { id: 'aware-knowledge', level: 'AI_AWARE', label: `Knowledge assessment ≥ ${CERT_RULES.awareKnowledgeMark}%`, detail: bestKnowledge ? `Best score ${k}%` : 'Not attempted', met: k >= CERT_RULES.awareKnowledgeMark, progress: pct(k, CERT_RULES.awareKnowledgeMark) },
    { id: 'capable-path', level: 'AI_CAPABLE', label: 'At least 60% of required learning completed', detail: `${requiredCompleted}/${requiredTotal} required modules`, met: requiredTotal > 0 && requiredCompleted / requiredTotal >= 0.6, progress: pct(requiredCompleted, Math.ceil(requiredTotal * 0.6)) },
    { id: 'capable-practical', level: 'AI_CAPABLE', label: 'At least 1 practical workplace activity passed', detail: `${practicalsCompleted} passed`, met: practicalsCompleted >= 1, progress: pct(practicalsCompleted, 1) },
    { id: 'capable-knowledge', level: 'AI_CAPABLE', label: `Knowledge assessment ≥ ${CERT_RULES.capableKnowledgeMark}%`, detail: bestKnowledge ? `Best score ${k}%` : 'Not attempted', met: k >= CERT_RULES.capableKnowledgeMark, progress: pct(k, CERT_RULES.capableKnowledgeMark) },
    { id: 'ready-path', level: 'AI_READY', label: 'Required learning pathway completed', detail: `${requiredCompleted}/${requiredTotal} required modules`, met: requiredTotal > 0 && requiredCompleted === requiredTotal, progress: pct(requiredCompleted, requiredTotal) },
    { id: 'ready-practicals', level: 'AI_READY', label: `At least ${CERT_RULES.minPracticalActivities} practical activities passed`, detail: `${practicalsCompleted} passed`, met: practicalsCompleted >= CERT_RULES.minPracticalActivities, progress: pct(practicalsCompleted, CERT_RULES.minPracticalActivities) },
    { id: 'ready-knowledge', level: 'AI_READY', label: `Final knowledge assessment ≥ ${CERT_RULES.knowledgePassMark}%`, detail: bestKnowledge ? `Best score ${k}%` : 'Not attempted', met: k >= CERT_RULES.knowledgePassMark, progress: pct(k, CERT_RULES.knowledgePassMark) },
    { id: 'ready-responsible', level: 'AI_READY', label: `Responsible AI competency ≥ ${CERT_RULES.responsibleAIPassMark}%`, detail: rai.length === 2 ? `${responsibleAIScore}% (knowledge + capstone)` : 'Needs final assessment and capstone', met: rai.length === 2 && responsibleAIScore >= CERT_RULES.responsibleAIPassMark, progress: pct(responsibleAIScore, CERT_RULES.responsibleAIPassMark) },
    { id: 'ready-capstone', level: 'AI_READY', label: `Practical capstone passed (≥ ${CERT_RULES.capstonePassMark}%)`, detail: bestCapstone ? `Best score ${c}%` : 'Not attempted', met: c >= CERT_RULES.capstonePassMark, progress: pct(c, CERT_RULES.capstonePassMark) },
  ];

  let achievableLevel: CertificationLevel | null = null;
  for (const level of LEVEL_ORDER) {
    if (requirements.filter((r) => r.level === level).every((r) => r.met)) achievableLevel = level;
    else break;
  }
  const nextLevel = achievableLevel ? LEVEL_ORDER[LEVEL_ORDER.indexOf(achievableLevel) + 1] ?? null : 'AI_AWARE';

  const readinessScore = Math.round(0.3 * k + 0.35 * c + 0.2 * practicalAverage + 0.15 * pathPercent);

  return {
    domainId: progress?.domainId ?? 'operations',
    requirements,
    achievableLevel,
    nextLevel,
    bestKnowledge,
    bestCapstone,
    practicalsCompleted,
    practicalAverage,
    requiredTotal,
    requiredCompleted,
    pathPercent,
    responsibleAIScore,
    finalUnlocked: requiredTotal > 0 && (requiredCompleted / requiredTotal >= 0.5 || requiredCompleted >= 3),
    capstoneUnlocked: k >= CERT_RULES.awareKnowledgeMark,
    readinessScore,
  };
}

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateCertificateId(date = new Date()): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  return `${APP.certificatePrefix}-${date.getFullYear()}-${s}`;
}

/** Competencies listed on a certificate for a given level. */
export function certificateCompetencies(level: CertificationLevel, domainId: EmployeeProgress['domainId']): Certificate['competencies'] {
  const domain = getDomain(domainId);
  const core = CORE_COMPETENCIES.map((c) => ({ name: c.name, skillId: c.skillIds[0], status: 'verified' as const }));
  const domainComp = { name: `${domain?.shortName ?? 'Domain'} AI Application`, skillId: domain?.domainSkillId, status: 'verified' as const };
  if (level === 'AI_AWARE') return [core[0], core[3]];
  if (level === 'AI_CAPABLE') return [core[0], core[1], core[3], domainComp];
  return [...core, domainComp];
}

export function buildCertificate(input: {
  user: User;
  progress: EmployeeProgress;
  status: CertificationStatus;
  level: CertificationLevel;
  type?: CertificateType;
  organisation?: Organisation | null;
}): Certificate {
  const { user, progress, status, level, type = 'domain', organisation } = input;
  const domain = getDomain(progress.domainId)!;
  const issue = new Date();
  const expiry = new Date(issue);
  expiry.setMonth(expiry.getMonth() + APP.certificateValidityMonths);
  return {
    id: generateCertificateId(issue),
    userId: user.id,
    holderName: user.name,
    type,
    level,
    domainId: domain.id,
    domainName: domain.name,
    competency: domain.competency,
    competencies: certificateCompetencies(level, domain.id),
    readinessScore: status.readinessScore,
    issueDate: issue.toISOString(),
    expiryDate: expiry.toISOString(),
    ...(type === 'employer' && organisation ? { organisationId: organisation.id, organisationName: organisation.name } : {}),
    status: 'valid',
    evidence: {
      knowledgeScore: status.bestKnowledge?.score ?? 0,
      capstoneScore: status.bestCapstone?.score ?? 0,
      responsibleAIScore: status.responsibleAIScore,
      modulesCompleted: status.requiredCompleted,
      practicalsCompleted: status.practicalsCompleted,
    },
  };
}

/** Effective status (a stored 'valid' certificate past its expiry date reads as expired). */
export const certificateState = (c: Certificate): Certificate['status'] =>
  c.status === 'valid' && new Date(c.expiryDate).getTime() < Date.now() ? 'expired' : c.status;

// ───────────────────────── Employer AI Ready ─────────────────────────

export interface CompetencyCheck {
  competency: EmployerCompetency;
  actual: SkillLevel;
  met: boolean;
}

/** Measures a person's skill levels against an employer's required competencies. */
export function checkEmployerCompetencies(skillLevels: Record<string, SkillLevel>, competencies: EmployerCompetency[]): CompetencyCheck[] {
  return competencies.map((competency) => {
    const levels = competency.skillIds.map((s) => skillLevels[s] ?? 0);
    const actual = (levels.length ? Math.floor(levels.reduce((a: number, b) => a + b, 0) / levels.length) : 0) as SkillLevel;
    return { competency, actual, met: actual >= competency.requiredLevel };
  });
}

/**
 * Employer AI Ready requires: a Domain certification of AI Capable or above AND
 * every 'critical' and 'important' employer competency met.
 */
export function isEmployerReadyEligible(domainLevel: CertificationLevel | null, checks: CompetencyCheck[]): boolean {
  if (!domainLevel || LEVEL_META[domainLevel].rank < 2 || !checks.length) return false;
  return checks.filter((c) => c.competency.priority !== 'desirable').every((c) => c.met);
}
