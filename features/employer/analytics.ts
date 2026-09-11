import type { CertificationLevel, DomainId, EmployerCompetency, ModuleMeta, Organisation, SkillLevel, WorkforceMember, WorkforceStatus } from '../../types';
import { average } from '../../lib/utils';
import { checkEmployerCompetencies, isEmployerReadyEligible, LEVEL_META } from '../../lib/certification';
import type { CompetencyCheck } from '../../lib/certification';
import { skillName } from '../../data/skills';
import { getIndustry } from '../../data/industries';
import { getDomain, MODULES, moduleTitle } from '../../data/catalog';
import { WORKFORCE_STATUS_META } from '../../lib/readiness';
import { AI_READY_THRESHOLD, CORE_SKILLS, deptProfile, LOW_READINESS_THRESHOLD } from './workforceModel';
import { ADOPTION_LABELS } from './maturity';

/** Pure workforce analytics used by every employer page, the insights engine and the advisor. */

const r = Math.round;
const pctOf = (n: number, total: number) => (total ? r((n / total) * 100) : 0);

export const STATUS_ORDER: WorkforceStatus[] = ['ai-ready', 'upskilling', 'priority-reskilling'];

/** Percentages that always sum to 100 (largest remainder). */
export function pctSplit(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  const raw = counts.map((c) => (c / total) * 100);
  const out = raw.map(Math.floor);
  let rest = 100 - out.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => [v - Math.floor(v), i] as const)
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => {
      if (rest > 0) {
        out[i]++;
        rest--;
      }
    });
  return out;
}

// ───────────────────────── Status & averages ─────────────────────────

export interface StatusSplit {
  total: number;
  counts: Record<WorkforceStatus, number>;
  pct: Record<WorkforceStatus, number>;
}

export function statusSplit(members: WorkforceMember[]): StatusSplit {
  const counts = { 'ai-ready': 0, upskilling: 0, 'priority-reskilling': 0 } as Record<WorkforceStatus, number>;
  members.forEach((m) => counts[m.status]++);
  const p = pctSplit(STATUS_ORDER.map((s) => counts[s]));
  return { total: members.length, counts, pct: { 'ai-ready': p[0], upskilling: p[1], 'priority-reskilling': p[2] } };
}

export function orgAverages(members: WorkforceMember[]) {
  const certified = members.filter((m) => m.certification).length;
  return {
    readiness: r(average(members.map((m) => m.readiness))),
    exposure: r(average(members.map((m) => m.exposure))),
    learning: r(average(members.map((m) => m.learningProgress))),
    certified,
    certifiedPct: pctOf(certified, members.length),
    lowCompetencyPct: pctOf(members.filter((m) => m.readiness < LOW_READINESS_THRESHOLD).length, members.length),
  };
}

// ───────────────────────── Departments ─────────────────────────

export interface DeptStat {
  department: string;
  count: number;
  readiness: number;
  exposure: number;
  gap: number; // exposure − readiness (positive = readiness lags exposure)
  lowCompetencyCount: number;
  lowCompetencyPct: number;
  certified: number;
  learning: number;
  aiReady: number;
  upskilling: number;
  priority: number;
  aiReadyPct: number;
  priorityPct: number;
  usingAI: boolean;
  transforming: boolean;
}

export function departmentNames(members: WorkforceMember[], org?: Organisation | null): string[] {
  const names = [...(org?.departments ?? [])];
  members.forEach((m) => !names.includes(m.department) && names.push(m.department));
  return names.filter((d) => members.some((m) => m.department === d));
}

export function departmentStats(members: WorkforceMember[], org?: Organisation | null): DeptStat[] {
  return departmentNames(members, org).map((department) => {
    const ms = members.filter((m) => m.department === department);
    const readiness = r(average(ms.map((m) => m.readiness)));
    const exposure = r(average(ms.map((m) => m.exposure)));
    const low = ms.filter((m) => m.readiness < LOW_READINESS_THRESHOLD).length;
    const aiReady = ms.filter((m) => m.status === 'ai-ready').length;
    const priority = ms.filter((m) => m.status === 'priority-reskilling').length;
    return {
      department,
      count: ms.length,
      readiness,
      exposure,
      gap: exposure - readiness,
      lowCompetencyCount: low,
      lowCompetencyPct: pctOf(low, ms.length),
      certified: ms.filter((m) => m.certification).length,
      learning: r(average(ms.map((m) => m.learningProgress))),
      aiReady,
      upskilling: ms.length - aiReady - priority,
      priority,
      aiReadyPct: pctOf(aiReady, ms.length),
      priorityPct: pctOf(priority, ms.length),
      usingAI: !!org?.departmentsUsingAI.includes(department),
      transforming: !!org?.transformationDepartments.includes(department),
    };
  });
}

export interface AttentionItem {
  stat: DeptStat;
  score: number;
  severity: 'high' | 'medium' | 'low';
  reasons: string[];
}

export function departmentsNeedingAttention(members: WorkforceMember[], org?: Organisation | null, limit = 4): AttentionItem[] {
  return departmentStats(members, org)
    .map((stat) => {
      const score = Math.max(0, stat.gap) + stat.lowCompetencyPct * 0.4 + stat.priorityPct * 0.3 + (stat.transforming ? 10 : 0) - (stat.usingAI ? 3 : 0);
      const reasons: string[] = [];
      if (stat.gap > 0) reasons.push(`${stat.gap}-point gap between AI exposure (${stat.exposure}%) and readiness (${stat.readiness}%)`);
      if (stat.lowCompetencyPct >= 20) reasons.push(`${stat.lowCompetencyPct}% of employees show low AI competency (readiness below ${LOW_READINESS_THRESHOLD}%)`);
      if (stat.priority) reasons.push(`${stat.priority} employee${stat.priority === 1 ? '' : 's'} flagged for priority reskilling`);
      if (stat.transforming) reasons.push('Expected to undergo significant AI transformation');
      if (!reasons.length) reasons.push(`Readiness ${stat.readiness}% is in line with exposure — sustain and certify`);
      return { stat, score: r(score), severity: (score >= 45 ? 'high' : score >= 22 ? 'medium' : 'low') as AttentionItem['severity'], reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ───────────────────────── Competencies ─────────────────────────

export const memberChecks = (m: WorkforceMember, competencies: EmployerCompetency[]): CompetencyCheck[] => checkEmployerCompetencies(m.skillLevels, competencies);

export interface CompetencyCoverage {
  competency: EmployerCompetency;
  met: number;
  pct: number;
  avgLevel: number; // 0–3, one decimal
}

export function competencyCoverage(members: WorkforceMember[], competencies: EmployerCompetency[]): CompetencyCoverage[] {
  return competencies.map((competency) => {
    const checks = members.map((m) => checkEmployerCompetencies(m.skillLevels, [competency])[0]);
    const met = checks.filter((c) => c.met).length;
    return { competency, met, pct: pctOf(met, members.length), avgLevel: Math.round(average(checks.map((c) => c.actual)) * 10) / 10 };
  });
}

export interface HeatmapData {
  rows: { id: string; label: string; count: number }[];
  cols: { id: string; label: string; priority: EmployerCompetency['priority'] }[];
  values: number[][]; // % of department meeting competency
}

export function competencyHeatmap(members: WorkforceMember[], org: Organisation): HeatmapData {
  const depts = departmentNames(members, org);
  const comps = org.requiredCompetencies;
  return {
    rows: depts.map((d) => ({ id: d, label: d, count: members.filter((m) => m.department === d).length })),
    cols: comps.map((c) => ({ id: c.id, label: c.name, priority: c.priority })),
    values: depts.map((d) => {
      const ms = members.filter((m) => m.department === d);
      return comps.map((c) => pctOf(ms.filter((m) => checkEmployerCompetencies(m.skillLevels, [c])[0].met).length, ms.length));
    }),
  };
}

// ───────────────────────── Skills ─────────────────────────

export interface SkillStat {
  skillId: string;
  name: string;
  avgLevel: number; // 0–3, one decimal
  required: SkillLevel;
  belowCount: number;
  belowPct: number;
  coveragePct: number; // % at Competent (2) or above
  source: 'critical' | 'important' | 'desirable' | 'desired' | 'core';
  competencies: string[];
}

function requirementMap(org: Organisation) {
  const map = new Map<string, { level: SkillLevel; source: SkillStat['source']; competencies: string[] }>();
  const rank = { critical: 0, important: 1, desirable: 2, desired: 3, core: 4 } as const;
  org.requiredCompetencies.forEach((c) =>
    c.skillIds.forEach((s) => {
      const prev = map.get(s);
      if (!prev) map.set(s, { level: c.requiredLevel, source: c.priority, competencies: [c.name] });
      else {
        prev.level = Math.max(prev.level, c.requiredLevel) as SkillLevel;
        if (rank[c.priority] < rank[prev.source]) prev.source = c.priority;
        prev.competencies.push(c.name);
      }
    }),
  );
  org.desiredSkills.forEach((s) => !map.has(s) && map.set(s, { level: 2, source: 'desired', competencies: [] }));
  CORE_SKILLS.forEach((s) => !map.has(s) && map.set(s, { level: 2, source: 'core', competencies: [] }));
  return map;
}

/** Required level for a skill in this organisation (competency requirement, else Competent). */
export function requiredLevelFor(org: Organisation, skillId: string): SkillLevel {
  return requirementMap(org).get(skillId)?.level ?? 2;
}

export function skillStats(members: WorkforceMember[], org: Organisation, skillIds?: string[]): SkillStat[] {
  const req = requirementMap(org);
  const ids = skillIds ?? [...req.keys()];
  return ids.map((skillId) => {
    const meta = req.get(skillId) ?? { level: 2 as SkillLevel, source: 'core' as const, competencies: [] };
    const levels = members.map((m) => m.skillLevels[skillId] ?? 0);
    const below = levels.filter((l) => l < meta.level).length;
    return {
      skillId,
      name: skillName(skillId),
      avgLevel: Math.round(average(levels) * 10) / 10,
      required: meta.level,
      belowCount: below,
      belowPct: pctOf(below, members.length),
      coveragePct: pctOf(levels.filter((l) => l >= 2).length, members.length),
      source: meta.source,
      competencies: meta.competencies,
    };
  });
}

/** Skills with the largest share of employees below the required level (critical/important/desired first). */
export function mostVulnerableSkills(members: WorkforceMember[], org: Organisation, limit = 6): SkillStat[] {
  const weight = { critical: 12, important: 8, desired: 5, desirable: 2, core: 0 } as const;
  return skillStats(members, org)
    .filter((s) => s.belowPct > 0)
    .sort((a, b) => b.belowPct + weight[b.source] - (a.belowPct + weight[a.source]) || a.avgLevel - b.avgLevel)
    .slice(0, limit);
}

export interface EmergingSkill {
  skillId: string;
  name: string;
  coveragePct: number;
  reason: string;
  departments: string[];
}

/** Skills management wants or transformation departments will need, where current coverage is low. */
export function emergingSkills(members: WorkforceMember[], org: Organisation, limit = 6): EmergingSkill[] {
  const out = new Map<string, EmergingSkill>();
  const coverage = (skillId: string, ms: WorkforceMember[]) => pctOf(ms.filter((m) => (m.skillLevels[skillId] ?? 0) >= 2).length, ms.length);
  org.transformationDepartments.forEach((d) => {
    const ms = members.filter((m) => m.department === d);
    if (!ms.length) return;
    deptProfile(d)
      .skills.filter((s) => !s.startsWith('domain-'))
      .forEach((s) => {
        const cov = coverage(s, ms);
        const prev = out.get(s);
        if (prev) {
          prev.departments.push(d);
          prev.coveragePct = Math.min(prev.coveragePct, cov);
          prev.reason = `Needed as AI transforms ${prev.departments.join(' & ')}`;
        } else out.set(s, { skillId: s, name: skillName(s), coveragePct: cov, reason: `Needed as AI transforms ${d}`, departments: [d] });
      });
  });
  org.desiredSkills.forEach((s) => {
    const cov = coverage(s, members);
    const prev = out.get(s);
    if (prev) prev.reason = `Management priority · ${prev.reason.charAt(0).toLowerCase()}${prev.reason.slice(1)}`;
    else out.set(s, { skillId: s, name: skillName(s), coveragePct: cov, reason: 'Management priority skill', departments: [] });
  });
  return [...out.values()]
    .filter((s) => s.coveragePct < 60)
    .sort((a, b) => a.coveragePct - b.coveragePct)
    .slice(0, limit);
}

// ───────────────────────── People ─────────────────────────

export const reskillingCandidates = (members: WorkforceMember[]) =>
  members.filter((m) => m.status === 'priority-reskilling').sort((a, b) => b.exposure - b.readiness - (a.exposure - a.readiness));

export const advancedReady = (members: WorkforceMember[]) =>
  members.filter((m) => m.readiness >= 80 && m.certification && LEVEL_META[m.certification.level].rank >= 2).sort((a, b) => b.readiness - a.readiness);

export const competencyGapsFor = (m: WorkforceMember, competencies: EmployerCompetency[]) =>
  checkEmployerCompetencies(m.skillLevels, competencies).filter((c) => !c.met);

// ───────────────────────── Certification ─────────────────────────

export function eligibleForEmployerReady(members: WorkforceMember[], competencies: EmployerCompetency[]): WorkforceMember[] {
  return members
    .filter((m) => m.certification?.type === 'domain' && isEmployerReadyEligible(m.certification.level, checkEmployerCompetencies(m.skillLevels, competencies)))
    .sort((a, b) => b.readiness - a.readiness);
}

export interface CertSummary {
  domain: Record<CertificationLevel, number>;
  domainTotal: number;
  employer: number;
  total: number;
  pct: number;
  eligibleNow: WorkforceMember[];
}

export function certificationSummary(members: WorkforceMember[], competencies: EmployerCompetency[]): CertSummary {
  const domain = { AI_AWARE: 0, AI_CAPABLE: 0, AI_READY: 0 } as Record<CertificationLevel, number>;
  let employer = 0;
  members.forEach((m) => {
    if (!m.certification) return;
    if (m.certification.type === 'employer') employer++;
    else domain[m.certification.level]++;
  });
  const domainTotal = domain.AI_AWARE + domain.AI_CAPABLE + domain.AI_READY;
  return { domain, domainTotal, employer, total: domainTotal + employer, pct: pctOf(domainTotal + employer, members.length), eligibleNow: eligibleForEmployerReady(members, competencies) };
}

// ───────────────────────── Reskilling plans & actions ─────────────────────────

export function moduleForSkill(skillId: string, domainId?: DomainId): ModuleMeta | undefined {
  const matches = MODULES.filter((m) => m.skillIds.includes(skillId));
  return (
    matches.find((m) => m.domainId === domainId && m.kind === 'domain') ??
    matches.find((m) => m.kind === 'core') ??
    matches.find((m) => m.kind === 'domain') ??
    matches[0]
  );
}

export function primaryDomain(ms: WorkforceMember[]): DomainId {
  const counts = new Map<DomainId, number>();
  ms.filter((m) => m.domainId !== 'management').forEach((m) => counts.set(m.domainId, (counts.get(m.domainId) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ms[0]?.domainId ?? 'operations';
}

export interface PlanModule {
  moduleId: string;
  title: string;
  minutes: number;
  level: ModuleMeta['level'];
  skills: string[];
  reason: string;
}

export interface DeptReskillPlan {
  department: string;
  stat: DeptStat;
  domainId: DomainId;
  domainName: string;
  focusSkills: SkillStat[];
  modules: PlanModule[];
  targetEmployees: number;
  horizon: 'Immediate' | 'Next quarter' | 'Sustain';
  totalMinutes: number;
}

export function reskillingPlan(members: WorkforceMember[], org: Organisation): DeptReskillPlan[] {
  const attention = new Map(departmentsNeedingAttention(members, org, 99).map((a) => [a.stat.department, a]));
  return departmentStats(members, org).map((stat) => {
    const ms = members.filter((m) => m.department === stat.department);
    const domainId = primaryDomain(ms);
    const domain = getDomain(domainId);
    const profile = deptProfile(stat.department);
    const skillIds = [...new Set([...CORE_SKILLS, ...profile.skills, ...org.requiredCompetencies.flatMap((c) => c.skillIds)])];
    const stats = skillStats(ms, org, skillIds).sort((a, b) => b.belowPct - a.belowPct);
    const weak = new Map(stats.map((s) => [s.skillId, s]));
    const competencyModules = org.requiredCompetencies
      .filter((c) => c.priority !== 'desirable')
      .flatMap((c) => c.skillIds)
      .map((s) => moduleForSkill(s, domainId)?.id)
      .filter((id): id is string => !!id);
    const candidates = [...new Set(['core-fundamentals', 'core-prompting', 'core-verification', 'core-responsible', ...(domain?.moduleIds ?? []), ...profile.modules, ...competencyModules])]
      .map((id) => MODULES.find((m) => m.id === id))
      .filter((m): m is ModuleMeta => !!m);
    const scored = candidates
      .map((m) => {
        const gaps = m.skillIds.map((s) => weak.get(s)).filter((s): s is SkillStat => !!s);
        const score = gaps.length ? average(gaps.map((g) => g.belowPct)) + (m.kind === 'core' && stat.readiness < 55 ? 12 : 0) + (m.domainId === domainId ? 6 : 0) - (m.domainId && m.domainId !== domainId && !profile.modules.includes(m.id) ? 18 : 0) - (m.level === 'advanced' && stat.readiness < 60 ? 25 : 0) : 0;
        return { m, gaps, score };
      })
      .filter((x) => x.score > 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    const modules: PlanModule[] = scored.map(({ m, gaps }) => {
      const worst = gaps.sort((a, b) => b.belowPct - a.belowPct)[0];
      return {
        moduleId: m.id,
        title: moduleTitle(m, domainId),
        minutes: m.estimatedMinutes,
        level: m.level,
        skills: m.skillIds.map(skillName),
        reason: worst && worst.belowPct > 0 ? `${worst.belowPct}% below the required level in ${worst.name}` : 'Deepens an existing strength towards advanced, certified use',
      };
    });
    const a = attention.get(stat.department);
    const chosen = new Set(scored.flatMap(({ m }) => m.skillIds));
    const focus = stats.filter((s) => chosen.has(s.skillId) && s.belowPct > 0).slice(0, 3);
    return {
      department: stat.department,
      stat,
      domainId,
      domainName: domain?.name ?? domainId,
      focusSkills: focus.length ? focus : stats.slice(0, 3),
      modules,
      targetEmployees: ms.filter((m) => m.readiness < AI_READY_THRESHOLD).length,
      horizon: a?.severity === 'high' ? 'Immediate' : a?.severity === 'medium' ? 'Next quarter' : 'Sustain',
      totalMinutes: modules.reduce((s, m) => s + m.minutes, 0),
    };
  });
}

/** Rule-based recommended actions for one employee. */
export function recommendedActions(m: WorkforceMember, org: Organisation): string[] {
  const actions: string[] = [];
  const gaps = competencyGapsFor(m, org.requiredCompetencies).sort((a, b) => (a.competency.priority === 'critical' ? -1 : 1) - (b.competency.priority === 'critical' ? -1 : 1));
  const days = Math.floor((Date.now() - new Date(m.lastActive).getTime()) / 86400000);
  if (m.status === 'priority-reskilling') {
    actions.push(`Start a supported reskilling pathway now — ${m.exposure}% AI exposure in this role against ${m.readiness}% readiness.`);
    actions.push(`Begin with “${moduleTitle('core-fundamentals', m.domainId)}” and “${moduleTitle('core-prompting', m.domainId)}”.`);
  }
  gaps.slice(0, 2).forEach((g) => {
    const mod = moduleForSkill(g.competency.skillIds.find((s) => (m.skillLevels[s] ?? 0) < g.competency.requiredLevel) ?? g.competency.skillIds[0], m.domainId);
    actions.push(`Close the ${g.competency.priority} “${g.competency.name}” gap${mod ? ` through “${moduleTitle(mod, m.domainId)}”` : ''}.`);
  });
  if (m.status === 'upskilling' && m.learningProgress >= 20)
    actions.push(`Keep momentum on the current learning pathway (${m.learningProgress}% complete) with a weekly learning goal agreed with the line manager.`);
  if (m.status === 'ai-ready' && !m.certification) actions.push('Complete the final assessment and practical capstone to earn Domain AI Ready certification.');
  if (m.certification?.type === 'domain' && LEVEL_META[m.certification.level].rank >= 2 && !gaps.some((g) => g.competency.priority !== 'desirable'))
    actions.push('Eligible now — nominate for Employer AI Ready certification.');
  if (m.readiness >= 80) actions.push(`Invite to act as an AI champion who coaches colleagues in ${m.department}.`);
  if (m.learningProgress < 20 && m.status !== 'ai-ready') actions.push('Agree a protected weekly learning slot with the line manager — learning has barely started.');
  if (days > 21) actions.push(`No learning activity for ${days} days — a manager check-in is recommended.`);
  if (!actions.length) actions.push('Keep momentum: continue the current learning pathway and reassess readiness next quarter.');
  return actions.slice(0, 5);
}

// ───────────────────────── Trends ─────────────────────────

/** Deterministic 6-month trend that ends exactly at today's values (sample history). */
export function momentumTrend(members: WorkforceMember[], months = 6) {
  const now = new Date();
  const labels = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return d.toLocaleDateString('en-GB', { month: 'short' });
  });
  const avg = orgAverages(members);
  const split = statusSplit(members);
  const series = (end: number, start: number) =>
    labels.map((_, i) => {
      if (i === months - 1) return end;
      const t = i / (months - 1);
      const eased = 1 - Math.pow(1 - t, 1.6);
      return r(start + (end - start) * eased + (i % 2 ? 0.8 : -0.6));
    });
  return {
    labels,
    readiness: series(avg.readiness, Math.max(15, avg.readiness - 12)),
    aiReady: series(split.pct['ai-ready'], Math.max(3, split.pct['ai-ready'] - 15)),
    learning: series(avg.learning, r(avg.learning * 0.3)),
  };
}

// ───────────────────────── Prompt context ─────────────────────────

/** Compact, factual description of the organisation's workforce for Gemini prompts. */
export function workforceSummaryText(org: Organisation, members: WorkforceMember[]): string {
  const split = statusSplit(members);
  const avg = orgAverages(members);
  const depts = departmentStats(members, org);
  const cov = competencyCoverage(members, org.requiredCompetencies);
  const vulnerable = mostVulnerableSkills(members, org, 5);
  const emerging = emergingSkills(members, org, 4);
  const cert = certificationSummary(members, org.requiredCompetencies);
  const attention = departmentsNeedingAttention(members, org, 3);
  const lines = [
    `ORGANISATION: ${org.name} (fictional) · ${getIndustry(org.industryId)?.name ?? org.industryId} · workforce size ${org.workforceSize}${org.isSampleWorkforce ? ' · workforce records are sample data' : ''}`,
    `AI adoption: ${ADOPTION_LABELS[org.adoptionLevel]}. Departments using AI: ${org.departmentsUsingAI.join(', ') || 'none'}. Tools being introduced: ${org.toolsIntroduced.join(', ') || 'none'}.`,
    `Departments expected to undergo significant AI transformation: ${org.transformationDepartments.join(', ') || 'none'}. Skills management wants to develop: ${org.desiredSkills.map(skillName).join(', ') || 'none'}.`,
    org.maturity ? `AI maturity: ${org.maturity.score}/100 (${org.maturity.level}); dimensions ${org.maturity.dimensions.map((d) => `${d.name} ${d.score}`).join(', ')}.` : 'AI maturity: not assessed.',
    `WORKFORCE: ${split.total} employees · ${split.pct['ai-ready']}% ${WORKFORCE_STATUS_META['ai-ready'].label} (${split.counts['ai-ready']}) · ${split.pct.upskilling}% ${WORKFORCE_STATUS_META.upskilling.label} (${split.counts.upskilling}) · ${split.pct['priority-reskilling']}% ${WORKFORCE_STATUS_META['priority-reskilling'].label} (${split.counts['priority-reskilling']}).`,
    `Averages: readiness ${avg.readiness}%, AI exposure ${avg.exposure}%, learning progress ${avg.learning}%, ${avg.lowCompetencyPct}% with low AI competency (readiness < 50%).`,
    'DEPARTMENTS (readiness / exposure / gap / low competency / AI Ready / priority reskilling / certified / learning):',
    ...depts.map(
      (d) =>
        `- ${d.department}: ${d.count} employees · readiness ${d.readiness}% · exposure ${d.exposure}% · gap ${d.gap > 0 ? '+' : ''}${d.gap} · ${d.lowCompetencyPct}% low competency · ${d.aiReady} AI Ready · ${d.priority} priority reskilling · ${d.certified} certified · learning ${d.learning}%${d.usingAI ? ' · already using AI' : ''}${d.transforming ? ' · transformation priority' : ''}`,
    ),
    'EMPLOYER COMPETENCIES (% of workforce meeting requirement):',
    ...cov.map((c) => `- ${c.competency.name} (${c.competency.priority}, level ${c.competency.requiredLevel}): ${c.pct}% meet it`),
    `Most vulnerable skills (share below required level): ${vulnerable.map((s) => `${s.name} ${s.belowPct}%`).join(', ') || 'none'}.`,
    `Emerging skills with low coverage: ${emerging.map((s) => `${s.name} (${s.coveragePct}% competent; ${s.reason})`).join('; ') || 'none'}.`,
    `CERTIFICATION: ${cert.total} certified (${cert.pct}%) — Domain AI Ready: ${cert.domain.AI_READY} AI Ready, ${cert.domain.AI_CAPABLE} AI Capable, ${cert.domain.AI_AWARE} AI Aware; Employer AI Ready: ${cert.employer}; eligible for Employer AI Ready now: ${cert.eligibleNow.length}.`,
    `Departments needing most attention: ${attention.map((a) => `${a.stat.department} (${a.reasons[0]})`).join('; ')}.`,
  ];
  return lines.join('\n');
}
