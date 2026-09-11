import type { ActivityLogEntry, ActivitySubmission, Certificate, EmployeeProgress, ModuleMeta, SkillCategory, SkillLevel } from '../../types';
import { getModule, MODULES } from '../../data/catalog';
import { getModuleContent } from '../../data/content';
import { getSkill } from '../../data/skills';
import { todayKey } from '../../lib/utils';

/**
 * Pure, deterministic learner statistics shared by the employee dashboard,
 * the skills map and the readiness reassessment (feature-local helpers).
 */

export const SKILL_LEVELS: SkillLevel[] = [0, 1, 2, 3];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  foundations: 'Foundations',
  tools: 'AI tools',
  analytics: 'Analytics',
  responsible: 'Responsible AI',
  critical: 'Critical thinking',
  domain: 'Domain application',
  leadership: 'Leadership',
};

export const CATEGORY_ORDER: SkillCategory[] = ['foundations', 'tools', 'analytics', 'responsible', 'critical', 'domain', 'leadership'];

/** Tracked skills = every skill with a recorded level ∪ every skill taught by a module on the learner's path (at 0). */
export function trackedSkillLevels(progress: EmployeeProgress | null | undefined): Record<string, SkillLevel> {
  if (!progress) return {};
  const levels: Record<string, SkillLevel> = {};
  progress.path.forEach((p) => getModule(p.moduleId)?.skillIds.forEach((s) => (levels[s] = 0)));
  Object.entries(progress.skillLevels).forEach(([s, l]) => (levels[s] = l));
  return levels;
}

/** [needs development, developing, competent, AI ready] counts. */
export function levelCounts(levels: Record<string, SkillLevel>): [number, number, number, number] {
  const out: [number, number, number, number] = [0, 0, 0, 0];
  Object.values(levels).forEach((l) => (out[l] += 1));
  return out;
}

export function averageSkillLevel(levels: Record<string, SkillLevel>): number {
  const vals = Object.values(levels);
  return vals.length ? vals.reduce((a: number, b) => a + b, 0) / vals.length : 0;
}

export interface QuizAccuracy {
  correct: number;
  total: number;
  percent: number; // 0–100 (0 when no questions answered)
}

/** Lesson quiz accuracy across every module = Σ quizCorrect / Σ quizTotal. */
export function quizAccuracy(progress: EmployeeProgress | null | undefined): QuizAccuracy {
  const mods = Object.values(progress?.modules ?? {});
  const correct = mods.reduce((a, m) => a + (m.quizCorrect || 0), 0);
  const total = mods.reduce((a, m) => a + (m.quizTotal || 0), 0);
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
}

/** Best submission per practical activity (distinct activities), newest-first input tolerated. */
export function bestSubmissions(submissions: ActivitySubmission[]): ActivitySubmission[] {
  const map = new Map<string, ActivitySubmission>();
  submissions.forEach((s) => {
    const cur = map.get(s.activityId);
    if (!cur || s.feedback.score > cur.feedback.score) map.set(s.activityId, s);
  });
  return [...map.values()].sort((a, b) => b.feedback.score - a.feedback.score);
}

export function activityTitle(s: Pick<ActivitySubmission, 'moduleId' | 'activityId'>, fallbackTitle?: string): string {
  const a = getModuleContent(s.moduleId)?.activity;
  if (a && a.id === s.activityId) return a.title;
  return a?.title ?? fallbackTitle ?? 'Practical workplace activity';
}

/** Path modules that ship with a practical activity, and whether each has been submitted. */
export function pathActivities(progress: EmployeeProgress | null | undefined, submissions: ActivitySubmission[]) {
  if (!progress) return [];
  return [...progress.path]
    .sort((a, b) => a.priority - b.priority)
    .map((p) => ({ moduleId: p.moduleId, activity: getModuleContent(p.moduleId)?.activity }))
    .filter((x): x is { moduleId: string; activity: NonNullable<typeof x.activity> } => Boolean(x.activity))
    .map((x) => ({
      ...x,
      submitted: submissions.some((s) => s.activityId === x.activity.id || s.moduleId === x.moduleId),
      moduleStatus: progress.modules[x.moduleId]?.status ?? 'not-started',
    }));
}

/** Streak as it stands today: a streak whose last active day is older than yesterday has lapsed. */
export function effectiveStreak(progress: EmployeeProgress | null | undefined): { current: number; longest: number; activeToday: boolean; atRisk: boolean } {
  if (!progress) return { current: 0, longest: 0, activeToday: false, atRisk: false };
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const last = progress.streak.lastActiveDate;
  const alive = last === today || last === yesterday;
  return {
    current: alive ? progress.streak.current : 0,
    longest: Math.max(progress.streak.longest, alive ? progress.streak.current : 0),
    activeToday: last === today,
    atRisk: last === yesterday,
  };
}

/** Last 7 days (oldest → today) with whether any learning activity was logged that day. */
export function lastSevenDays(progress: EmployeeProgress | null | undefined): { key: string; label: string; active: boolean; isToday: boolean }[] {
  const active = new Set<string>((progress?.activity ?? []).map((a) => a.at.slice(0, 10)));
  if (progress?.streak.lastActiveDate) active.add(progress.streak.lastActiveDate);
  const today = todayKey();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = todayKey(d);
    return { key, label: d.toLocaleDateString('en-GB', { weekday: 'narrow' }), active: active.has(key), isToday: key === today };
  });
}

/** Catalogue modules that teach a skill. */
export const modulesTeaching = (skillId: string): ModuleMeta[] => MODULES.filter((m) => m.skillIds.includes(skillId));

export const skillCategory = (skillId: string): SkillCategory => getSkill(skillId)?.category ?? 'domain';

/** Certificates that are valid and expire within `days` (or have already lapsed). */
export function expiringCertificates(certs: Certificate[], days = 60): Certificate[] {
  const horizon = Date.now() + days * 86400000;
  return certs.filter((c) => c.status !== 'revoked' && new Date(c.expiryDate).getTime() <= horizon);
}

export function formatMinutes(mins: number): string {
  if (mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export const ACTIVITY_TYPE_LABEL: Record<ActivityLogEntry['type'], string> = {
  lesson: 'Lesson',
  quiz: 'Quiz',
  activity: 'Practical',
  tutor: 'AI Tutor',
  assessment: 'Assessment',
  certificate: 'Certificate',
  reassessment: 'Reassessment',
  path: 'Learning path',
};
