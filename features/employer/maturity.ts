import type { MaturityLevel, Organisation, OrgMaturity } from '../../types';
import { generateJSON, Type } from '../../services/gemini';
import type { Schema } from '../../services/gemini';
import { getIndustry } from '../../data/industries';
import { skillName } from '../../data/skills';
import { nowISO } from '../../lib/utils';

/**
 * Organisational AI maturity. A deterministic engine anchors the score from the
 * onboarding answers; Gemini may refine it by at most ±10 and writes the
 * narrative. Without Gemini, the engine writes everything.
 */

export const MATURITY_LEVELS: { level: MaturityLevel; min: number; max: number; description: string; color: string }[] = [
  { level: 'Exploring', min: 0, max: 20, description: 'Curious about AI; little structured use yet.', color: '#94a3b8' },
  { level: 'Emerging', min: 21, max: 40, description: 'Pockets of experimentation without a shared approach.', color: '#e0a400' },
  { level: 'Developing', min: 41, max: 60, description: 'AI in use in several teams; skills and governance uneven.', color: '#0284c7' },
  { level: 'Scaling', min: 61, max: 80, description: 'AI embedded across functions with growing governance.', color: '#10a36f' },
  { level: 'Leading', min: 81, max: 100, description: 'AI-first operating model with mature skills and controls.', color: '#086f4e' },
];

export function maturityLevel(score: number): MaturityLevel {
  return (MATURITY_LEVELS.find((l) => score <= l.max) ?? MATURITY_LEVELS[4]).level;
}
export const maturityMeta = (level: MaturityLevel) => MATURITY_LEVELS.find((l) => l.level === level)!;

export type MaturityInput = Pick<
  Organisation,
  'name' | 'industryId' | 'workforceSize' | 'departments' | 'adoptionLevel' | 'departmentsUsingAI' | 'toolsIntroduced' | 'transformationDepartments' | 'desiredSkills'
>;

export const DIMENSIONS = ['Strategy', 'Adoption', 'Skills', 'Data', 'Governance'] as const;
const WEIGHTS: Record<(typeof DIMENSIONS)[number], number> = { Strategy: 0.2, Adoption: 0.25, Skills: 0.2, Data: 0.15, Governance: 0.2 };

const LEVEL_SCORE: Record<Organisation['adoptionLevel'], number> = { extensive: 88, partial: 58, experimenting: 36, 'not-yet': 12, unknown: 18 };
export const ADOPTION_LABELS: Record<Organisation['adoptionLevel'], string> = {
  extensive: 'Extensive — AI embedded in many workflows',
  partial: 'Partial — AI used in some departments',
  experimenting: 'Experimenting — pilots and trials',
  'not-yet': 'Not yet — no organisational AI use',
  unknown: 'Unsure',
};

const GOV_SKILLS = ['responsible-ai', 'ai-governance', 'data-privacy', 'bias-awareness', 'ai-verification', 'critical-thinking'];
const DATA_SKILLS = ['ai-analytics', 'data-interpretation', 'predictive-analytics', 'data-visualisation', 'sql-data'];
const DATA_TOOL = /data|analytic|fraud|forecast|predict|document|kyc|monitor|insight|scor|vision/i;
const GOV_TOOL = /governance|policy|risk|complian|kyc|fraud|audit|security/i;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeMaturityAnchor(input: MaturityInput): { score: number; dimensions: { name: string; score: number }[] } {
  const depts = Math.max(1, input.departments.length);
  const level = LEVEL_SCORE[input.adoptionLevel] ?? 18;
  const usingPct = (input.departmentsUsingAI.length / depts) * 100;
  const toolsScore = (Math.min(input.toolsIntroduced.length, 6) / 6) * 100;
  const transformPct = (input.transformationDepartments.length / depts) * 100;
  const desired = Math.min(input.desiredSkills.length, 6);
  const govSkills = input.desiredSkills.filter((s) => GOV_SKILLS.includes(s)).length;
  const dataSkills = input.desiredSkills.filter((s) => DATA_SKILLS.includes(s)).length;
  const dataTools = input.toolsIntroduced.filter((t) => DATA_TOOL.test(t)).length;
  const govTools = Math.min(2, input.toolsIntroduced.filter((t) => GOV_TOOL.test(t)).length);
  const exposure = getIndustry(input.industryId)?.aiExposure ?? 50;

  const dims: Record<(typeof DIMENSIONS)[number], number> = {
    Strategy: clamp(15 + 0.25 * Math.min(100, transformPct * 1.3) + 3 * desired + 0.2 * level),
    Adoption: clamp(0.5 * level + 0.3 * usingPct + 0.2 * toolsScore),
    Skills: clamp(10 + 0.38 * level + 0.28 * usingPct + 1.2 * desired),
    Data: clamp(15 + 0.25 * exposure + 7 * Math.min(dataTools, 4) + 4 * dataSkills + 0.1 * level),
    Governance: clamp(13 + 9 * govSkills + 0.15 * level + 4 * govTools),
  };
  const score = clamp(DIMENSIONS.reduce((s, d) => s + dims[d] * WEIGHTS[d], 0));
  return { score, dimensions: DIMENSIONS.map((d) => ({ name: d, score: dims[d] })) };
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** Deterministic maturity profile — used offline and as the Gemini anchor/fallback. */
export function engineMaturity(input: MaturityInput): OrgMaturity {
  const { score, dimensions } = computeMaturityAnchor(input);
  const level = maturityLevel(score);
  const d = Object.fromEntries(dimensions.map((x) => [x.name, x.score])) as Record<string, number>;
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const industry = getIndustry(input.industryId)?.name ?? 'your sector';
  const using = input.departmentsUsingAI;
  const transformNotUsing = input.transformationDepartments.filter((x) => !using.includes(x));
  const govSkills = input.desiredSkills.filter((s) => GOV_SKILLS.includes(s));

  const strengths: string[] = [];
  if (using.length) strengths.push(`AI is already in use in ${list(using)} — a base of practical experience to build on.`);
  if (input.toolsIntroduced.length >= 3) strengths.push(`${input.toolsIntroduced.length} AI tools are being introduced (${input.toolsIntroduced.slice(0, 3).join(', ')}), showing real investment.`);
  else if (input.toolsIntroduced.length) strengths.push(`Early tool investment: ${input.toolsIntroduced.join(', ')}.`);
  if (input.transformationDepartments.length) strengths.push(`Leadership has identified where AI will change work most (${list(input.transformationDepartments)}), which makes reskilling targetable.`);
  if (input.desiredSkills.length >= 3) strengths.push(`Clear skills intent: ${list(input.desiredSkills.slice(0, 3).map(skillName))}.`);
  if (sorted[0]) strengths.push(`${sorted[0].name} is your strongest maturity dimension (${sorted[0].score}/100).`);

  const risks: string[] = [];
  if (transformNotUsing.length) risks.push(`${list(transformNotUsing)} ${transformNotUsing.length > 1 ? 'are' : 'is'} expected to change significantly but ${transformNotUsing.length > 1 ? 'are' : 'is'} not yet using AI — the highest reskilling risk.`);
  if (d.Governance < 55) risks.push(`Governance (${d.Governance}/100) lags behind adoption — AI use may be outpacing policy, privacy and oversight controls.`);
  if (d.Skills < 55) risks.push(`Workforce AI skills (${d.Skills}/100) are uneven; tools alone will not deliver value without capability.`);
  if (input.adoptionLevel === 'partial' || input.adoptionLevel === 'experimenting') risks.push('Adoption is concentrated in a few teams, so benefits and risks are unevenly spread across the organisation.');
  if (d.Data < 50) risks.push(`Data readiness (${d.Data}/100) may limit the accuracy and usefulness of AI tools.`);
  if (!risks.length) risks.push('Sustaining momentum: readiness decays without regular reassessment and practice.');

  const recommendations: string[] = [];
  if (input.transformationDepartments.length) recommendations.push(`Prioritise structured reskilling in ${list(input.transformationDepartments.slice(0, 2))} before AI changes their workflows.`);
  if (d.Governance < 65 || !govSkills.length) recommendations.push('Publish a practical AI use policy and make Responsible AI and Data Privacy critical competencies for every employee.');
  if (using.length) recommendations.push(`Turn early adopters in ${list(using.slice(0, 2))} into internal AI champions who coach other departments.`);
  recommendations.push('Define employer AI competencies and certify employees against them so progress is measurable.');
  recommendations.push('Reassess maturity and workforce readiness every quarter to track return on reskilling investment.');

  const summary = `${input.name} is at the **${level}** stage of AI maturity (${score}/100). ${
    using.length ? `AI is active in ${list(using)}` : 'AI is not yet in structured use'
  }${input.toolsIntroduced.length ? ` with ${input.toolsIntroduced.length} tool${input.toolsIntroduced.length === 1 ? '' : 's'} being introduced` : ''}, while ${sorted[sorted.length - 1].name.toLowerCase()} (${sorted[sorted.length - 1].score}/100) is the weakest dimension. For a ${industry} organisation, the priority is to build workforce capability and controls at the same pace as adoption.`;

  return {
    score,
    level,
    summary,
    strengths: strengths.slice(0, 4),
    risks: risks.slice(0, 4),
    recommendations: recommendations.slice(0, 5),
    dimensions,
    source: 'engine',
    assessedAt: nowISO(),
  };
}

const MATURITY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: 'Final maturity score 0–100, within ±10 of the anchor score' },
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    dimensions: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, score: { type: Type.INTEGER } }, required: ['name', 'score'] },
    },
  },
  required: ['score', 'summary', 'strengths', 'risks', 'recommendations', 'dimensions'],
};

const strArr = (v: unknown, min: number, max: number): string[] | null => {
  if (!Array.isArray(v)) return null;
  const out = v.filter((x): x is string => typeof x === 'string' && x.trim().length > 3).map((x) => x.trim()).slice(0, max);
  return out.length >= min ? out : null;
};

/** Gemini-refined maturity (±10 of the deterministic anchor) with a full engine fallback. */
export async function assessMaturity(input: MaturityInput): Promise<{ maturity: OrgMaturity; error?: string }> {
  const engine = engineMaturity(input);
  const industry = getIndustry(input.industryId)?.name ?? input.industryId;
  const prompt = `Assess the organisational AI maturity of a fictional Zimbabwean organisation.

Organisation: ${input.name}
Industry: ${industry}
Workforce size: ${input.workforceSize}
Departments: ${input.departments.join(', ')}
Current AI adoption: ${ADOPTION_LABELS[input.adoptionLevel]}
Departments currently using AI: ${input.departmentsUsingAI.join(', ') || 'none'}
AI tools being introduced: ${input.toolsIntroduced.join(', ') || 'none'}
Departments expected to experience significant AI transformation: ${input.transformationDepartments.join(', ') || 'none'}
Skills management wants to develop: ${input.desiredSkills.map(skillName).join(', ') || 'none specified'}

Deterministic anchor score: ${engine.score}/100.
Anchor dimensions: ${engine.dimensions.map((d) => `${d.name} ${d.score}`).join(', ')}.

Maturity levels: Exploring 0–20, Emerging 21–40, Developing 41–60, Scaling 61–80, Leading 81–100.
Return a final score within ±10 of the anchor, dimension scores for exactly Strategy, Adoption, Skills, Data and Governance (each within ±15 of its anchor),
a 2–3 sentence executive summary, 3–4 strengths, 3–4 risks and 4–5 specific, actionable recommendations for leadership (reskilling, governance, data, change management).
Refer to departments by name. Use responsible language about workforce impact (augmentation and reskilling, never job losses).`;

  const res = await generateJSON<OrgMaturity>({
    prompt,
    system: 'You are an organisational AI transformation consultant advising Zimbabwean executives. Be specific, evidence-based and concise.',
    schema: MATURITY_SCHEMA,
    temperature: 0.4,
    fallback: () => engine,
    normalize: (raw) => {
      const r = raw as Record<string, unknown>;
      if (!r || typeof r !== 'object') return null;
      const rawScore = Number(r.score);
      if (!Number.isFinite(rawScore)) return null;
      const score = Math.max(engine.score - 10, Math.min(engine.score + 10, Math.round(rawScore)));
      const strengths = strArr(r.strengths, 2, 4);
      const risks = strArr(r.risks, 2, 4);
      const recommendations = strArr(r.recommendations, 2, 5);
      const summary = typeof r.summary === 'string' && r.summary.trim().length > 20 ? r.summary.trim() : null;
      if (!strengths || !risks || !recommendations || !summary) return null;
      const rawDims = Array.isArray(r.dimensions) ? (r.dimensions as { name?: unknown; score?: unknown }[]) : [];
      const dimensions = engine.dimensions.map((anchor) => {
        const hit = rawDims.find((x) => typeof x?.name === 'string' && x.name.toLowerCase().startsWith(anchor.name.toLowerCase().slice(0, 4)));
        const v = Number(hit?.score);
        return { name: anchor.name, score: Number.isFinite(v) ? Math.max(0, Math.min(100, Math.max(anchor.score - 15, Math.min(anchor.score + 15, Math.round(v))))) : anchor.score };
      });
      return { score, level: maturityLevel(score), summary, strengths, risks, recommendations, dimensions, source: 'gemini', assessedAt: nowISO() };
    },
  });
  return { maturity: res.data, error: res.error };
}
