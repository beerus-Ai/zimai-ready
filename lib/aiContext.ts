import type { EmployeeProfile, EmployeeProgress, ReadinessAssessment } from '../types';
import { industryName } from '../data/industries';
import { roleName } from '../data/roles';
import { getDomain, moduleTitle } from '../data/catalog';
import { skillName } from '../data/skills';
import { SKILL_LEVEL_LABELS } from './readiness';

const OBJECTIVES: Record<string, string> = {
  'better-current-job': 'Become better at my current job',
  'ai-ready-current': 'Become AI-ready in my current profession',
  'prepare-changes': 'Prepare for future changes to my role',
  transition: 'Transition into another field',
  leadership: 'Move into leadership/management',
  'advanced-ai': 'Build advanced AI skills',
};
export const objectiveLabel = (id?: string) => (id ? OBJECTIVES[id] ?? id : '—');

/**
 * Compact, prompt-ready description of a learner. Use it in every Gemini
 * prompt that should be personalised (tutor, feedback, assessments…).
 */
export function describeLearner(input: {
  profile: EmployeeProfile | null;
  assessment?: ReadinessAssessment | null;
  progress?: EmployeeProgress | null;
}): string {
  const { profile, assessment, progress } = input;
  if (!profile) return 'Learner profile: not yet available.';
  const domain = getDomain(profile.domainId);
  // A reassessment updates usage/confidence answers — prefer the latest assessment's snapshot.
  const now = assessment?.answers ?? profile;
  const lines = [
    `Name: ${profile.displayName}`,
    `Job title: ${profile.jobTitle || roleName(profile.roleId, profile.roleOther)}`,
    `Functional area: ${roleName(profile.roleId, profile.roleOther)}`,
    `Industry: ${industryName(profile.industryId, profile.industryOther)}`,
    `Experience: ${profile.experience} years`,
    `Learning domain: ${domain?.name ?? profile.domainId}`,
    `Organisation AI adoption: ${profile.orgAdoption}; department AI usage: ${profile.deptUsage}`,
    `Personal AI usage: ${now.personalUsage}; uses AI for: ${now.useCases.join(', ') || 'nothing yet'}`,
    `Self-rated AI confidence: ${now.confidence}/5`,
    `Career objective: ${objectiveLabel(profile.careerObjective)}${profile.targetCareer ? ` (target: ${profile.targetCareer})` : ''}`,
  ];
  if (assessment) {
    lines.push(
      `Personal AI readiness: ${assessment.personalReadiness}% (${assessment.readinessLevel}); workplace AI exposure: ${assessment.workplaceExposure}%`,
      `Priority: ${assessment.priorityState}`,
      `Key gaps: ${assessment.gaps.slice(0, 4).join('; ')}`,
    );
  }
  if (progress) {
    const done = Object.values(progress.modules).filter((m) => m.status === 'completed');
    const current = Object.values(progress.modules).find((m) => m.status === 'in-progress');
    lines.push(`Modules completed: ${done.length}/${progress.path.length}${done.length ? ` (${done.map((m) => moduleTitle(m.moduleId, profile.domainId)).join(', ')})` : ''}`);
    if (current) lines.push(`Currently studying: ${moduleTitle(current.moduleId, profile.domainId)}`);
    const weak = Object.entries(progress.skillLevels)
      .filter(([, l]) => l <= 1)
      .slice(0, 5)
      .map(([id, l]) => `${skillName(id)} (${SKILL_LEVEL_LABELS[l]})`);
    if (weak.length) lines.push(`Skills still developing: ${weak.join(', ')}`);
    lines.push(`Learning pace: ${progress.pace}`);
  }
  return lines.join('\n');
}
