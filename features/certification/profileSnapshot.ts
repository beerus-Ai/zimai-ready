import type {
  ActivitySubmission,
  AssessmentResult,
  Certificate,
  DomainId,
  EmployeeProfile,
  EmployeeProgress,
  PublicSkillsProfile,
  ReadinessAssessment,
  SkillLevel,
  User,
} from '../../types';
import { CORE_COMPETENCIES, skillName } from '../../data/skills';
import { getDomain, getModule } from '../../data/catalog';
import { roleName } from '../../data/roles';
import { industryName } from '../../data/industries';
import { LEVEL_META } from '../../lib/certification';
import { readinessLevel as toReadinessLevel, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { nowISO } from '../../lib/utils';
import { bestValidCertificate } from './cert-utils';

/**
 * Builds the shareable AI Skills Profile snapshot. It deliberately contains
 * NO private data: no assessment answers, submissions, email or tutor chats —
 * only competency status, skill levels, readiness and certification summary.
 */

export interface ProfileSnapshotInput {
  user: User;
  profile: EmployeeProfile | null;
  assessment: ReadinessAssessment | null;
  progress: EmployeeProgress | null;
  certificates: Certificate[];
  results: AssessmentResult[];
  submissions: ActivitySubmission[];
}

export interface ProfileCompetencyDef {
  name: string;
  skillIds: string[];
}

/** The six competencies on every profile: five core + "{Domain} AI Application". */
export function profileCompetencies(domainId: DomainId): ProfileCompetencyDef[] {
  const d = getDomain(domainId);
  return [...CORE_COMPETENCIES, { name: `${d?.shortName ?? 'Domain'} AI Application`, skillIds: [d?.domainSkillId ?? `domain-${domainId}`] }];
}

const KIND_LABEL: Record<AssessmentResult['kind'], string> = {
  'final-knowledge': 'final knowledge assessment',
  capstone: 'practical capstone',
};

export function buildPublicProfile(input: ProfileSnapshotInput): PublicSkillsProfile {
  const { user, profile, assessment, progress, certificates, results, submissions } = input;
  const domainId: DomainId = progress?.domainId ?? profile?.domainId ?? 'operations';
  const domain = getDomain(domainId);
  const levels = progress?.skillLevels ?? {};
  const cert = bestValidCertificate(certificates);
  const passedResults = results.filter((r) => r.passed).sort((a, b) => b.score - a.score);
  const passedSubs = submissions.filter((s) => s.feedback.score >= 60).sort((a, b) => b.feedback.score - a.feedback.score);

  const competencies: PublicSkillsProfile['competencies'] = profileCompetencies(domainId).map((def) => {
    const level = Math.max(0, ...def.skillIds.map((s) => levels[s] ?? 0)) as SkillLevel;

    const certCovers = cert?.competencies.some((c) => c.name === def.name || (c.skillId ? def.skillIds.includes(c.skillId) : false));
    if (cert && certCovers) {
      return { name: def.name, status: 'verified' as const, evidence: `${LEVEL_META[cert.level].label} certificate · ${cert.id}` };
    }

    if (level >= 2) {
      const result = passedResults.find((r) => r.domainId === domainId) ?? passedResults[0];
      if (result) return { name: def.name, status: 'verified' as const, evidence: `Passed ${KIND_LABEL[result.kind]} (${result.score}%)` };
      const related = passedSubs.find((s) => (getModule(s.moduleId)?.skillIds ?? []).some((id) => def.skillIds.includes(id)));
      const sub = related ?? passedSubs[0];
      if (sub) return { name: def.name, status: 'verified' as const, evidence: `Practical workplace activity scored ${sub.feedback.score}%` };
    }

    if (level >= 1) return { name: def.name, status: 'in-progress' as const, evidence: `${SKILL_LEVEL_LABELS[level]} · building evidence through learning` };
    return { name: def.name, status: 'not-started' as const, evidence: 'Not yet started' };
  });

  const skills: PublicSkillsProfile['skills'] = Object.entries(levels)
    .filter(([, l]) => (l ?? 0) >= 1)
    .map(([skillId, level]) => ({ skillId, name: skillName(skillId), level: level as SkillLevel }))
    .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

  const readiness = assessment?.personalReadiness ?? 0;
  const title = profile ? profile.jobTitle?.trim() || roleName(profile.roleId, profile.roleOther) : '';
  const headline = profile
    ? `${title} · ${industryName(profile.industryId, profile.industryOther)}`
    : `${domain?.name ?? 'Professional'} professional`;

  return {
    userId: user.id,
    name: user.name || profile?.displayName || 'ZimAI Ready learner',
    headline,
    domainId,
    domainName: domain?.name ?? domainId,
    readiness,
    readinessLevel: assessment?.readinessLevel ?? toReadinessLevel(readiness),
    certification: cert ? { id: cert.id, level: cert.level, type: cert.type, issueDate: cert.issueDate } : null,
    competencies,
    skills,
    updatedAt: nowISO(),
  };
}

/** Compares two snapshots ignoring the timestamp (used to detect unpublished changes). */
export function sameSnapshot(a: PublicSkillsProfile | null, b: PublicSkillsProfile | null): boolean {
  if (!a || !b) return false;
  const strip = ({ updatedAt: _u, ...rest }: PublicSkillsProfile) => JSON.stringify(rest);
  return strip(a) === strip(b);
}
