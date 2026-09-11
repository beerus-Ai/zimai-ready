import type { Organisation, WorkforceMember } from '../../types';
import { generateJSON, Type } from '../../services/gemini';
import type { AIResult, Schema } from '../../services/gemini';
import { getIndustry } from '../../data/industries';
import { exposureLabel, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import {
  advancedReady,
  certificationSummary,
  competencyCoverage,
  competencyHeatmap,
  departmentsNeedingAttention,
  departmentStats,
  emergingSkills,
  mostVulnerableSkills,
  reskillingCandidates,
  statusSplit,
  workforceSummaryText,
} from './analytics';

/** AI-powered management insights with a data-driven fallback. */

export type InsightType = 'risk' | 'opportunity' | 'action';
export interface Insight {
  title: string;
  detail: string;
  type: InsightType;
}
export interface InsightsResult {
  headline: string;
  insights: Insight[];
}
export type InsightFocus = 'overview' | 'skills';

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export function computeInsights(org: Organisation, members: WorkforceMember[], focus: InsightFocus = 'overview'): InsightsResult {
  const split = statusSplit(members);
  const stats = departmentStats(members, org);
  const attention = departmentsNeedingAttention(members, org, 3);
  const industry = getIndustry(org.industryId)?.name ?? 'your sector';
  const insights: Insight[] = [];
  const top = attention[0]?.stat;
  const cov = competencyCoverage(members, org.requiredCompetencies);
  const weakestCritical = [...cov].filter((c) => c.competency.priority !== 'desirable').sort((a, b) => a.pct - b.pct)[0];

  if (focus === 'overview') {
    const byGap = [...stats].sort((a, b) => b.gap - a.gap)[0];
    if (byGap && byGap.gap > 0)
      insights.push({
        type: 'risk',
        title: `${byGap.department} has the largest AI readiness gap`,
        detail: `${byGap.department} currently has the largest AI readiness gap. ${byGap.lowCompetencyPct}% of employees demonstrate low AI competency while the department has ${exposureLabel(byGap.exposure).toLowerCase()} (${byGap.exposure}%) to AI-driven change.`,
      });
    const best = [...stats].sort((a, b) => b.readiness - a.readiness)[0];
    const weakest = [...stats].sort((a, b) => a.readiness - b.readiness)[0];
    if (best && weakest && best.department !== weakest.department)
      insights.push({
        type: 'opportunity',
        title: `${best.department} can lead internal adoption`,
        detail: `${best.department} leads the organisation at ${best.readiness}% average readiness — ${best.aiReady} of ${best.count} employees are AI Ready. Use them as internal AI champions to coach ${weakest.department} (${weakest.readiness}%).`,
      });
    if (weakestCritical)
      insights.push({
        type: 'risk',
        title: `${weakestCritical.competency.name} is the weakest required competency`,
        detail: `Only ${weakestCritical.pct}% of employees meet the ${weakestCritical.competency.name} requirement (${weakestCritical.competency.priority}). For a ${industry} organisation, this is a control risk as AI tools scale.`,
      });
    const lagging = stats.filter((s) => s.transforming && s.aiReadyPct < 30 && s.department !== byGap?.department);
    if (lagging.length)
      insights.push({
        type: 'action',
        title: `Reskill ${list(lagging.map((l) => l.department))} before AI changes their workflows`,
        detail: `${lagging.map((l) => `${l.department}: ${l.aiReady} of ${l.count} AI Ready, ${l.priority} in priority reskilling`).join('; ')}. These teams are expected to undergo significant AI transformation — start structured reskilling now.`,
      });
    const cert = certificationSummary(members, org.requiredCompetencies);
    if (cert.eligibleNow.length)
      insights.push({
        type: 'opportunity',
        title: `${cert.eligibleNow.length} employees are ready for Employer AI Ready certification`,
        detail: `They already hold Domain AI Capable or above and meet every critical and important employer competency — certifying them makes your AI capability visible and auditable.`,
      });
    const prio = members.filter((m) => m.status === 'priority-reskilling');
    if (prio.length) {
      const learning = Math.round(prio.reduce((a, m) => a + m.learningProgress, 0) / prio.length);
      insights.push({
        type: 'action',
        title: 'Give priority reskilling employees protected learning time',
        detail: `${prio.length} employees combine high AI exposure with low readiness but average only ${learning}% learning progress. Protected weekly learning time and manager check-ins will accelerate them.`,
      });
    }
    return {
      headline: `${split.pct['ai-ready']}% of your workforce is AI Ready today. ${top ? `Invest first in ${list(attention.slice(0, 2).map((a) => a.stat.department))}.` : ''}`.trim(),
      insights: insights.slice(0, 5),
    };
  }

  // Skills focus
  const vulnerable = mostVulnerableSkills(members, org, 3);
  const emerging = emergingSkills(members, org, 3);
  if (vulnerable[0])
    insights.push({
      type: 'risk',
      title: `${vulnerable[0].name} is your most vulnerable skill`,
      detail: `${vulnerable[0].belowPct}% of employees are below the required level (${SKILL_LEVEL_LABELS[vulnerable[0].required]})${vulnerable[0].competencies.length ? `, putting the “${vulnerable[0].competencies[0]}” competency at risk` : ''}.`,
    });
  if (emerging[0])
    insights.push({
      type: 'action',
      title: `Build ${emerging[0].name} ahead of demand`,
      detail: `${emerging[0].reason} — but only ${emerging[0].coveragePct}% of the relevant employees are competent today.`,
    });
  const heat = competencyHeatmap(members, org);
  let low = { v: 101, r: -1, c: -1 };
  heat.values.forEach((row, ri) => row.forEach((v, ci) => v < low.v && (low = { v, r: ri, c: ci })));
  if (low.r >= 0)
    insights.push({
      type: 'risk',
      title: `Weakest competency coverage: ${heat.rows[low.r].label}`,
      detail: `Only ${low.v}% of ${heat.rows[low.r].label} meet the ${heat.cols[low.c].label} requirement — the lowest cell in your competency heatmap.`,
    });
  const cands = reskillingCandidates(members);
  if (cands.length) {
    const byDept = new Map<string, number>();
    cands.forEach((m) => byDept.set(m.department, (byDept.get(m.department) ?? 0) + 1));
    insights.push({
      type: 'action',
      title: `${cands.length} employees need priority reskilling`,
      detail: `They combine high AI exposure with low readiness: ${[...byDept.entries()].sort((a, b) => b[1] - a[1]).map(([d, n]) => `${d} ${n}`).join(', ')}.`,
    });
  }
  const adv = advancedReady(members);
  if (adv.length)
    insights.push({
      type: 'opportunity',
      title: `${adv.length} employees are ready for advanced AI responsibilities`,
      detail: `Readiness of 80% or more and certified — ideal to lead pilots, review AI outputs and mentor colleagues.`,
    });
  return {
    headline: vulnerable[0]
      ? `The biggest capability gap is ${vulnerable[0].name}; ${weakestCritical ? `${weakestCritical.competency.name} coverage is ${weakestCritical.pct}%.` : ''}`
      : 'Your workforce skills profile is broadly on track.',
    insights: insights.slice(0, 5),
  };
}

const SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: 'One-sentence executive answer' },
    insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          detail: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['risk', 'opportunity', 'action'] },
        },
        required: ['title', 'detail', 'type'],
      },
    },
  },
  required: ['headline', 'insights'],
};

export async function generateInsights(org: Organisation, members: WorkforceMember[], focus: InsightFocus = 'overview'): Promise<AIResult<InsightsResult>> {
  const fallback = () => computeInsights(org, members, focus);
  const ask =
    focus === 'overview'
      ? 'Answer the question "Is our workforce ready for AI transformation, and where should we invest in reskilling?" with a one-sentence headline and 4–5 management insights.'
      : 'Write a one-sentence headline and 4–5 skills-gap insights: vulnerable skills, emerging skills, competency coverage gaps, reskilling candidates and employees ready for advanced AI responsibilities.';
  return generateJSON<InsightsResult>({
    prompt: `${ask}
Each insight: a short title (max 10 words), a 1–2 sentence detail that cites specific numbers from the data, and a type (risk, opportunity or action). Refer to departments and groups, never to individual employees.

${workforceSummaryText(org, members)}`,
    system: 'You are an AI workforce strategy analyst writing for a Zimbabwean executive team. Be precise, data-driven and concise.',
    schema: SCHEMA,
    temperature: 0.4,
    fallback,
    normalize: (raw) => {
      const r = raw as Partial<InsightsResult>;
      if (!r || typeof r.headline !== 'string' || !Array.isArray(r.insights)) return null;
      const insights = r.insights
        .filter((i): i is Insight => !!i && typeof i.title === 'string' && typeof i.detail === 'string')
        .map((i) => ({ title: i.title.trim(), detail: i.detail.trim(), type: (['risk', 'opportunity', 'action'].includes(i.type) ? i.type : 'action') as InsightType }))
        .slice(0, 5);
      return insights.length >= 2 ? { headline: r.headline.trim(), insights } : null;
    },
  });
}

// ───────── session cache (avoids re-calling Gemini on every navigation) ─────────

export const insightsCacheKey = (org: Organisation, members: WorkforceMember[], focus: InsightFocus) =>
  `zimai:insights:${org.id}:${focus}:${org.updatedAt}:${members.length}:${members.reduce((a, m) => a + m.readiness, 0)}`;

export function readCachedInsights(key: string): AIResult<InsightsResult> | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AIResult<InsightsResult>) : null;
  } catch {
    return null;
  }
}

export function writeCachedInsights(key: string, value: AIResult<InsightsResult>) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
