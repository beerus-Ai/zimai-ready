import type { OnboardingAnswers, UseCase } from '../types';
import { getIndustry } from '../data/industries';
import { getRole } from '../data/roles';
import { clamp } from './readiness';

/**
 * Transparent, deterministic readiness scoring (never random).
 *
 * PERSONAL AI READINESS (0–100) = how prepared the person is to work with AI:
 *   usage frequency (max 38) + self-rated confidence (max 26) + breadth/depth of
 *   AI use cases (max 22) + professional experience (max 5) + exposure to AI in
 *   their organisation/department (max 8).
 *
 * WORKPLACE AI EXPOSURE (0–100) = how much AI is changing their work context:
 *   0.4 × industry baseline + 0.4 × functional-role baseline + organisation
 *   adoption adjustment + department usage adjustment.
 *
 * Gemini may refine these within ±10 points with a stated reason; the engine
 * values are always the anchor.
 */

const USAGE_POINTS = { daily: 38, weekly: 28, occasionally: 14, never: 0 } as const;
const CONFIDENCE_POINTS = { 1: 2, 2: 8, 3: 15, 4: 21, 5: 26 } as const;
const ADVANCED_USES: UseCase[] = ['data-analysis', 'automation', 'coding', 'decision-support'];
const EXPERIENCE_POINTS = { '0-2': 2, '3-5': 4, '6-10': 5, '11-15': 5, '16+': 4 } as const;
const ORG_CONTEXT = { extensive: 5, partial: 3, experimenting: 3, 'not-yet': 0, unknown: 0 } as const;
const DEPT_CONTEXT = { regularly: 4, occasionally: 2, experimenting: 2, never: 0, unsure: 0 } as const;

const ORG_EXPOSURE = { extensive: 12, partial: 2, experimenting: 1, 'not-yet': -8, unknown: 0 } as const;
const DEPT_EXPOSURE = { regularly: 8, occasionally: 1, experimenting: 0, never: -6, unsure: 0 } as const;

export interface ScoreFactor {
  label: string;
  impact: number; // points contributed
  group: 'personal' | 'exposure';
}

export interface ReadinessScores {
  personalReadiness: number;
  workplaceExposure: number;
  factors: ScoreFactor[];
}

export function computeScores(a: OnboardingAnswers): ReadinessScores {
  const factors: ScoreFactor[] = [];
  const uses = a.useCases.filter((u) => u !== 'none');

  const usage = USAGE_POINTS[a.personalUsage] ?? 0;
  factors.push({ label: `Uses AI ${a.personalUsage === 'never' ? 'never' : a.personalUsage}`, impact: usage, group: 'personal' });

  const conf = CONFIDENCE_POINTS[a.confidence] ?? 2;
  factors.push({ label: `AI confidence ${a.confidence}/5`, impact: conf, group: 'personal' });

  const casePoints = Math.min(22, uses.reduce((sum, u) => sum + (ADVANCED_USES.includes(u) ? 4.5 : 3), 0));
  factors.push({ label: uses.length ? `${uses.length} AI use case${uses.length > 1 ? 's' : ''}` : 'No current AI use cases', impact: Math.round(casePoints), group: 'personal' });

  const exp = EXPERIENCE_POINTS[a.experience] ?? 3;
  factors.push({ label: `${a.experience} years' experience`, impact: exp, group: 'personal' });

  const ctx = Math.min(8, (ORG_CONTEXT[a.orgAdoption] ?? 0) + (DEPT_CONTEXT[a.deptUsage] ?? 0));
  factors.push({ label: 'AI in your workplace', impact: ctx, group: 'personal' });

  const personalReadiness = clamp(usage + conf + casePoints + exp + ctx, 3, 98);

  const industry = getIndustry(a.industryId);
  const role = getRole(a.roleId);
  const ind = 0.4 * (industry?.aiExposure ?? 50);
  const rol = 0.4 * (role?.aiExposure ?? 50);
  const orgAdj = ORG_EXPOSURE[a.orgAdoption] ?? 0;
  const deptAdj = DEPT_EXPOSURE[a.deptUsage] ?? 0;
  factors.push(
    { label: `${industry?.name ?? 'Industry'} sector`, impact: Math.round(ind), group: 'exposure' },
    { label: `${role?.name ?? 'Role'} tasks`, impact: Math.round(rol), group: 'exposure' },
    { label: 'Organisation AI adoption', impact: orgAdj, group: 'exposure' },
    { label: 'Department AI usage', impact: deptAdj, group: 'exposure' },
  );
  const workplaceExposure = clamp(ind + rol + orgAdj + deptAdj, 5, 97);

  return { personalReadiness, workplaceExposure, factors };
}

/** Keeps an AI-suggested score within ±maxDelta of the engine anchor. */
export const boundedScore = (suggested: unknown, anchor: number, maxDelta = 10) =>
  typeof suggested === 'number' && Number.isFinite(suggested) ? clamp(Math.max(anchor - maxDelta, Math.min(anchor + maxDelta, suggested))) : anchor;
