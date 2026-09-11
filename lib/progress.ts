import type {
  ActivityLogEntry,
  DomainId,
  EmployeeProfile,
  EmployeeProgress,
  ModuleProgress,
  PathItem,
  ReadinessAssessment,
  SkillLevel,
} from '../types';
import { getModule } from '../data/catalog';
import { nowISO, todayKey } from './utils';

/**
 * Shared progress helpers used by learning (Stage 2), certification (Stage 3)
 * and demo seeding. Skill levels only rise through demonstrated evidence;
 * the self-reported baseline is capped at "Developing".
 */

export function emptyModuleProgress(moduleId: string): ModuleProgress {
  return { moduleId, status: 'not-started', lessonsCompleted: [], quizCorrect: 0, quizTotal: 0, struggling: false, mastery: 0, minutesSpent: 0 };
}

export function baselineSkillLevels(profile: EmployeeProfile, assessment: ReadinessAssessment): Record<string, SkillLevel> {
  const levels: Record<string, SkillLevel> = {};
  const skillIds = new Set<string>(['ai-fundamentals', 'prompt-engineering', 'ai-verification', 'responsible-ai', 'data-privacy', 'bias-awareness', 'critical-thinking', 'ai-analytics']);
  assessment.prescription.forEach((p) => p.skillIds.forEach((s) => skillIds.add(s)));
  skillIds.forEach((s) => (levels[s] = 0));
  const uses = new Set(profile.useCases);
  const active = profile.personalUsage === 'daily' || profile.personalUsage === 'weekly';
  if (assessment.personalReadiness > 25 || profile.confidence >= 3) levels['ai-fundamentals'] = 1;
  if (active) levels['prompt-engineering'] = 1;
  if (uses.has('writing') || uses.has('reporting')) levels['ai-writing'] = 1;
  if (uses.has('data-analysis')) levels['ai-analytics'] = 1;
  if (uses.has('automation')) levels['ai-automation'] = 1;
  if (uses.has('coding')) levels['ai-coding'] = 1;
  if (uses.has('decision-support')) levels['decision-support'] = 1;
  return levels;
}

export function pathFromAssessment(assessment: ReadinessAssessment): PathItem[] {
  return [...assessment.prescription]
    .sort((a, b) => a.priority - b.priority)
    .filter((p) => getModule(p.moduleId))
    .map((p, i) => ({
      moduleId: p.moduleId,
      priority: i + 1,
      reason: p.reason,
      required: getModule(p.moduleId)!.requiredForCertification,
      addedBy: p.category === 'transition' ? 'transition' : 'prescription',
      addedAt: nowISO(),
    }));
}

/** Creates a learner's progress record from their readiness assessment's Skills Prescription. */
export function createProgressFromAssessment(userId: string, profile: EmployeeProfile, assessment: ReadinessAssessment): EmployeeProgress {
  const domainId: DomainId = assessment.careerTransition?.targetDomainId ?? profile.targetDomainId ?? profile.domainId;
  const path = pathFromAssessment(assessment);
  return {
    userId,
    domainId: profile.careerObjective === 'transition' ? domainId : profile.domainId,
    targetDomainId: profile.careerObjective === 'transition' ? domainId : undefined,
    path,
    modules: Object.fromEntries(path.map((p) => [p.moduleId, emptyModuleProgress(p.moduleId)])),
    skillLevels: baselineSkillLevels(profile, assessment),
    streak: { current: 0, longest: 0 },
    activity: [{ at: nowISO(), type: 'path', label: 'Personalised learning path created' }],
    tutorQuestions: 0,
    pace: assessment.personalReadiness > 60 ? 'accelerated' : 'standard',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

/** Appends an activity-log entry and updates the daily learning streak. Pure — returns a new object. */
export function recordActivity(p: EmployeeProgress, type: ActivityLogEntry['type'], label: string): EmployeeProgress {
  const today = todayKey();
  const last = p.streak.lastActiveDate;
  let current = p.streak.current;
  if (last !== today) {
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    current = last === yesterday ? current + 1 : 1;
  }
  return {
    ...p,
    streak: { current, longest: Math.max(p.streak.longest, current), lastActiveDate: today },
    activity: [{ at: nowISO(), type, label }, ...p.activity].slice(0, 50),
    updatedAt: nowISO(),
  };
}

/** Raises skills to at least `level` (never lowers). Pure. */
export function raiseSkills(p: EmployeeProgress, skillIds: string[], level: SkillLevel): EmployeeProgress {
  const skillLevels = { ...p.skillLevels };
  skillIds.forEach((s) => {
    if ((skillLevels[s] ?? 0) < level) skillLevels[s] = level;
  });
  return { ...p, skillLevels, updatedAt: nowISO() };
}

export interface PathStats {
  total: number;
  completed: number;
  percent: number;
  current?: PathItem; // first in-progress, else first not started
  requiredTotal: number;
  requiredCompleted: number;
  minutesRemaining: number;
  minutesTotal: number;
}

export function pathStats(p: EmployeeProgress | null | undefined): PathStats {
  if (!p) return { total: 0, completed: 0, percent: 0, requiredTotal: 0, requiredCompleted: 0, minutesRemaining: 0, minutesTotal: 0 };
  const status = (id: string) => p.modules[id]?.status ?? 'not-started';
  const items = [...p.path].sort((a, b) => a.priority - b.priority);
  const completed = items.filter((i) => status(i.moduleId) === 'completed');
  const current = items.find((i) => status(i.moduleId) === 'in-progress') ?? items.find((i) => status(i.moduleId) !== 'completed');
  const mins = (id: string) => getModule(id)?.estimatedMinutes ?? 20;
  const required = items.filter((i) => i.required);
  return {
    total: items.length,
    completed: completed.length,
    percent: items.length ? Math.round((completed.length / items.length) * 100) : 0,
    current,
    requiredTotal: required.length,
    requiredCompleted: required.filter((i) => status(i.moduleId) === 'completed').length,
    minutesRemaining: items.filter((i) => status(i.moduleId) !== 'completed').reduce((a, i) => a + mins(i.moduleId), 0),
    minutesTotal: items.reduce((a, i) => a + mins(i.moduleId), 0),
  };
}
