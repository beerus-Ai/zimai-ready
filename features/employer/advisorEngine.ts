import type { ChatMessage, Organisation, WorkforceMember } from '../../types';
import { chat } from '../../services/gemini';
import type { AIResult } from '../../services/gemini';
import { CORE_MODULE_IDS, getDomain, getModule, moduleTitle } from '../../data/catalog';
import { getIndustry } from '../../data/industries';
import { SKILL_LEVEL_LABELS } from '../../lib/readiness';
import {
  advancedReady,
  certificationSummary,
  competencyCoverage,
  competencyHeatmap,
  departmentNames,
  departmentsNeedingAttention,
  departmentStats,
  emergingSkills,
  mostVulnerableSkills,
  primaryDomain,
  reskillingPlan,
  statusSplit,
  workforceSummaryText,
} from './analytics';
import type { DeptStat } from './analytics';

/** AI Workforce Advisor — Gemini chat grounded in workforce data, with a data-driven offline engine. */

export const SUGGESTED_QUESTIONS = [
  'Which department should we prioritise?',
  'Which skills are we currently missing?',
  'Where is our greatest AI readiness risk?',
  'What training should Finance receive?',
  'How ready are we to introduce AI into customer service?',
];

const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const lowerFirst = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

function catalogueText(org: Organisation, members: WorkforceMember[]): string {
  const lines = [`- Core (all employees): ${CORE_MODULE_IDS.map((id) => moduleTitle(id, 'management')).join('; ')}`];
  departmentNames(members, org).forEach((d) => {
    const domainId = primaryDomain(members.filter((m) => m.department === d));
    const domain = getDomain(domainId);
    if (domain) lines.push(`- ${d} (${domain.name}): ${domain.moduleIds.map((id) => moduleTitle(id, domainId)).join('; ')}`);
  });
  return lines.join('\n');
}

export function advisorSystemPrompt(org: Organisation, members: WorkforceMember[]): string {
  return `You are the AI Workforce Advisor inside ZimAI Ready, advising the leadership team of ${org.name}, a fictional ${getIndustry(org.industryId)?.name ?? ''} organisation in Zimbabwe.
Answer questions about workforce AI readiness, reskilling investment, employer competencies and certification using ONLY the organisation data below.
- Always cite specific numbers (percentages, headcounts, department names) from the data.
- When recommending training, name ZimAI Ready catalogue modules from the list below.
- Structure: a one-sentence direct answer in bold, then 3–5 concise bullets, then a line starting "**Recommended next step:**". Keep answers under 220 words.
- Discuss groups and departments, never single out individual employees by name.
- If the data cannot answer the question, say so and suggest what to measure next.
- Frame AI impact as augmentation and reskilling — never predict that employees will lose their jobs.

ORGANISATION DATA
${workforceSummaryText(org, members)}

ZIMAI READY CATALOGUE MODULES
${catalogueText(org, members)}`;
}

// ───────────────────────── Offline engine ─────────────────────────

const ALIASES: [RegExp, RegExp][] = [
  [/human resources|people/i, /\bhr\b|human res|people|recruit|payroll/i],
  [/\bict\b|\bit\b|technology|digital/i, /\bict\b|\bit\b|tech|software|digital|systems/i],
  [/customer/i, /customer|call cent|client|contact cent|\bcs\b|service desk/i],
  [/operat/i, /operat|\bops\b|back.?office|processing/i],
  [/risk|complian/i, /risk|complian|audit|aml|kyc/i],
  [/financ/i, /financ|account|treasur|credit/i],
  [/market/i, /market|brand|communicat|sales/i],
];

export function detectDepartment(question: string, org: Organisation, members: WorkforceMember[]): string | null {
  const q = question.toLowerCase();
  const depts = departmentNames(members, org);
  const direct = depts.find((d) => q.includes(d.toLowerCase()));
  if (direct) return direct;
  for (const d of depts) {
    const alias = ALIASES.find(([deptRe]) => deptRe.test(d));
    if (alias && alias[1].test(q)) return d;
    const words = d.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !['services', 'department', 'and'].includes(w));
    if (words.some((w) => q.includes(w))) return d;
  }
  return null;
}

function prioritiseAnswer(org: Organisation, members: WorkforceMember[]): string {
  const att = departmentsNeedingAttention(members, org, 3);
  const top = att[0];
  if (!top) return 'There is not enough workforce data to prioritise departments yet.';
  const plan = reskillingPlan(members, org).find((p) => p.department === top.stat.department);
  return [
    `**Prioritise ${top.stat.department}** — it has the largest combination of AI exposure and low readiness in ${org.name}.`,
    '',
    ...att.map(
      (a, i) =>
        `${i + 1}. **${a.stat.department}** (${a.stat.count} employees): readiness ${a.stat.readiness}% vs exposure ${a.stat.exposure}% — ${a.reasons.slice(1, 3).join('; ') || a.reasons[0]}.`,
    ),
    '',
    `**Recommended next step:** launch a reskilling cohort in ${top.stat.department}${top.stat.priority ? ` for the ${plural(top.stat.priority, 'priority-reskilling employee')}` : ''}${plan?.modules[0] ? `, starting with “${plan.modules[0].title}”` : ''}, and review progress in 30 days.`,
  ].join('\n');
}

function missingSkillsAnswer(org: Organisation, members: WorkforceMember[]): string {
  const vul = mostVulnerableSkills(members, org, 5);
  const em = emergingSkills(members, org, 3);
  const cov = competencyCoverage(members, org.requiredCompetencies).sort((a, b) => a.pct - b.pct);
  return [
    `**Your largest skills gaps are in ${list(vul.slice(0, 2).map((s) => s.name))}.**`,
    '',
    ...vul.map((s) => `- **${s.name}**: ${s.belowPct}% of employees are below the required level (${SKILL_LEVEL_LABELS[s.required]}); average level ${s.avgLevel}/3.`),
    ...(em.length ? ['', `Emerging skills with low coverage: ${em.map((s) => `**${s.name}** (${s.coveragePct}% competent — ${lowerFirst(s.reason)})`).join('; ')}.`] : []),
    ...(cov[0] ? ['', `The weakest employer competency is **${cov[0].competency.name}** — only ${cov[0].pct}% of the workforce meets it.`] : []),
    '',
    `**Recommended next step:** make “${moduleTitle('core-responsible', 'management')}” and “${moduleTitle('core-verification', 'management')}” organisation-wide, then add department modules for the specialist gaps.`,
  ].join('\n');
}

function riskAnswer(org: Organisation, members: WorkforceMember[]): string {
  const att = departmentsNeedingAttention(members, org, 2);
  const top = att[0]?.stat;
  const cov = competencyCoverage(members, org.requiredCompetencies)
    .filter((c) => c.competency.priority === 'critical')
    .sort((a, b) => a.pct - b.pct)[0];
  const split = statusSplit(members);
  if (!top) return 'There is not enough workforce data to assess risk yet.';
  return [
    `**Your greatest AI readiness risk is ${top.department}**: ${top.lowCompetencyPct}% of its ${top.count} employees show low AI competency while AI exposure is ${top.exposure}%.`,
    '',
    `- Readiness gap: ${top.gap} points (exposure ${top.exposure}% vs readiness ${top.readiness}%), with ${top.priority} employees in priority reskilling.`,
    ...(att[1] ? [`- Second highest: **${att[1].stat.department}** — readiness ${att[1].stat.readiness}%, ${att[1].stat.priority} in priority reskilling.`] : []),
    ...(cov ? [`- Control risk: only ${cov.pct}% of employees meet the critical **${cov.competency.name}** competency.`] : []),
    `- Organisation-wide, ${split.pct['priority-reskilling']}% of employees (${split.counts['priority-reskilling']}) combine high AI exposure with low readiness.`,
    '',
    `**Recommended next step:** pair ${top.department} with AI champions from ${departmentStats(members, org).sort((a, b) => b.readiness - a.readiness)[0]?.department ?? 'your strongest team'}, and do not scale new AI tools there until critical competencies are above 60%.`,
  ].join('\n');
}

function trainingAnswer(org: Organisation, members: WorkforceMember[], dept: string): string {
  const plan = reskillingPlan(members, org).find((p) => p.department === dept);
  if (!plan) return `I could not find workforce data for ${dept}.`;
  const heat = competencyHeatmap(members, org);
  const ri = heat.rows.findIndex((r) => r.id === dept);
  const weakest = ri >= 0 ? heat.cols.map((c, ci) => ({ c, v: heat.values[ri][ci] })).sort((a, b) => a.v - b.v)[0] : null;
  return [
    `**${dept} should follow a ${plan.modules.length}-module ${plan.domainName} reskilling path focused on ${list(plan.focusSkills.slice(0, 2).map((s) => s.name))}.**`,
    '',
    `${dept}: ${plan.stat.count} employees · readiness ${plan.stat.readiness}% · exposure ${plan.stat.exposure}% · ${plan.stat.aiReady} AI Ready · ${plan.stat.priority} priority reskilling.`,
    '',
    ...plan.modules.map((m, i) => `${i + 1}. **${m.title}** (${m.minutes} min, ${m.level}) — ${m.reason}.`),
    '',
    ...(weakest ? [`- Weakest employer competency in ${dept}: **${weakest.c.label}** (${weakest.v}% meet it).`] : []),
    `- Target group: ${plan.targetEmployees} employees below AI Ready; about ${Math.round(plan.totalMinutes / 60)} hours of learning each.`,
    '',
    `**Recommended next step:** ${plan.horizon === 'Immediate' ? 'start this cohort immediately' : plan.horizon === 'Next quarter' ? 'schedule this cohort for next quarter' : 'use this path to sustain and certify'}, beginning with ${plan.stat.priority ? `the ${plural(plan.stat.priority, 'priority-reskilling employee')}` : 'the lowest-readiness employees'}.`,
  ].join('\n');
}

function readyForAIAnswer(org: Organisation, members: WorkforceMember[], dept: string): string {
  const stat = departmentStats(members, org).find((s) => s.department === dept) as DeptStat | undefined;
  if (!stat) return `I could not find workforce data for ${dept}.`;
  const verdict = stat.readiness >= 70 && stat.aiReadyPct >= 50 ? 'Largely ready' : stat.readiness >= 55 ? 'Partly ready' : 'Not yet ready';
  const heat = competencyHeatmap(members, org);
  const ri = heat.rows.findIndex((r) => r.id === dept);
  const comps = ri >= 0 ? heat.cols.map((c, ci) => `${c.label} ${heat.values[ri][ci]}%`) : [];
  const key = dept.split(/\s+/)[0].replace(/[^a-z]/gi, '');
  const tools = org.toolsIntroduced.filter(
    (t) => (key.length > 2 && new RegExp(key, 'i').test(t)) || /enterprise|assistant/i.test(t) || (/customer|client|call/i.test(dept) && /chatbot/i.test(t)),
  );
  return [
    `**${verdict}.** ${dept} has ${stat.readiness}% average readiness against ${stat.exposure}% AI exposure; ${stat.aiReady} of ${stat.count} employees ${stat.aiReady === 1 ? 'is' : 'are'} AI Ready and ${stat.priority} ${stat.priority === 1 ? 'needs' : 'need'} priority reskilling.`,
    '',
    `- ${stat.lowCompetencyPct}% of the team show low AI competency (readiness below 50%).`,
    ...(comps.length ? [`- Employer competencies met in ${dept}: ${comps.join(' · ')}.`] : []),
    `- Learning momentum: ${stat.learning}% average learning progress; ${stat.certified} employees certified.`,
    ...(tools.length ? [`- Relevant tools already being introduced: ${tools.join(', ')}.`] : []),
    '',
    verdict === 'Largely ready'
      ? `**Recommended next step:** proceed with a controlled rollout, with AI Ready staff reviewing outputs and a clear escalation path to humans.`
      : `**Recommended next step:** run a small pilot with the ${stat.aiReady + Math.min(stat.upskilling, 4)} most ready employees while the rest complete a reskilling cohort; keep human escalation for every customer-affecting decision and track Data Privacy and Responsible AI coverage before scaling.`,
  ].join('\n');
}

function certificationAnswer(org: Organisation, members: WorkforceMember[]): string {
  const c = certificationSummary(members, org.requiredCompetencies);
  return [
    `**${c.total} employees (${c.pct}%) hold a ZimAI Ready certificate, and ${c.eligibleNow.length} more are eligible for Employer AI Ready now.**`,
    '',
    `- **Domain AI Ready** (independent, portable): ${c.domain.AI_READY} AI Ready, ${c.domain.AI_CAPABLE} AI Capable, ${c.domain.AI_AWARE} AI Aware.`,
    `- **Employer AI Ready** (against ${org.name}'s ${org.requiredCompetencies.length} competencies): ${c.employer} holders.`,
    `- Employer AI Ready requires Domain AI Capable or above plus every critical and important competency.`,
    '',
    `**Recommended next step:** nominate the ${c.eligibleNow.length} eligible employees, then use ${advancedReady(members).length} advanced-ready staff as assessors and champions.`,
  ].join('\n');
}

function deptSnapshot(org: Organisation, members: WorkforceMember[], dept: string): string {
  const stat = departmentStats(members, org).find((s) => s.department === dept)!;
  const plan = reskillingPlan(members, org).find((p) => p.department === dept);
  return [
    `**${dept}: ${stat.readiness}% average readiness across ${stat.count} employees.**`,
    '',
    `- AI exposure ${stat.exposure}% (gap ${stat.gap > 0 ? '+' : ''}${stat.gap} points).`,
    `- ${stat.aiReady} AI Ready · ${stat.upskilling} upskilling · ${stat.priority} priority reskilling.`,
    `- ${stat.certified} certified · ${stat.learning}% average learning progress.`,
    ...(plan?.modules[0] ? [`- Highest-impact module: “${plan.modules[0].title}” (${plan.modules[0].reason}).`] : []),
    '',
    `**Recommended next step:** ask me "What training should ${dept} receive?" for a full reskilling path.`,
  ].join('\n');
}

function summaryAnswer(org: Organisation, members: WorkforceMember[]): string {
  const split = statusSplit(members);
  const stats = departmentStats(members, org);
  const best = [...stats].sort((a, b) => b.readiness - a.readiness)[0];
  const worst = [...stats].sort((a, b) => a.readiness - b.readiness)[0];
  return [
    `**${org.name} is partly ready: ${split.pct['ai-ready']}% of ${split.total} employees are AI Ready, ${split.pct.upskilling}% are upskilling and ${split.pct['priority-reskilling']}% need priority reskilling.**`,
    '',
    ...(best ? [`- Strongest department: **${best.department}** (${best.readiness}% readiness).`] : []),
    ...(worst ? [`- Weakest department: **${worst.department}** (${worst.readiness}% readiness, exposure ${worst.exposure}%).`] : []),
    ...(org.maturity ? [`- Organisational AI maturity: ${org.maturity.score}/100 (${org.maturity.level}).`] : []),
    '',
    'You can ask me which department to prioritise, which skills are missing, where the greatest risk is, what training a department needs or how ready a team is to introduce AI.',
  ].join('\n');
}

/** Data-driven answer used when Gemini is unavailable. */
export function answerOffline(question: string, org: Organisation, members: WorkforceMember[]): string {
  if (!members.length) return 'There is no workforce data for your organisation yet, so I cannot answer with evidence. Add or generate workforce records first.';
  const q = question.toLowerCase();
  const dept = detectDepartment(question, org, members);
  const fallbackDept = () => org.transformationDepartments.find((d) => members.some((m) => m.department === d)) ?? departmentsNeedingAttention(members, org, 1)[0]?.stat.department;
  if (/train|course|module|learn|upskill|reskill|programme|curriculum|develop/.test(q)) {
    const d = dept ?? departmentsNeedingAttention(members, org, 1)[0]?.stat.department;
    if (d) return trainingAnswer(org, members, d);
  }
  if (/\bready\b|introduc|deploy|roll.?out|launch|adopt|implement|bring ai/.test(q)) {
    const d = dept ?? fallbackDept();
    if (d) return readyForAIAnswer(org, members, d);
  }
  if (/certif|credential|employer ai ready|domain ai ready/.test(q)) return certificationAnswer(org, members);
  if (/priorit|first|focus|invest|where should|start with|budget/.test(q)) return prioritiseAnswer(org, members);
  if (/missing|lack|skill|gap|capabilit|competenc/.test(q)) return missingSkillsAnswer(org, members);
  if (/risk|vulnerab|exposed|threat|concern|weak|worr/.test(q)) return riskAnswer(org, members);
  if (dept) return deptSnapshot(org, members, dept);
  return summaryAnswer(org, members);
}

export async function askAdvisor(question: string, history: ChatMessage[], org: Organisation, members: WorkforceMember[]): Promise<AIResult<string>> {
  return chat({
    system: advisorSystemPrompt(org, members),
    history,
    message: question,
    temperature: 0.5,
    fallback: () => answerOffline(question, org, members),
  });
}

/** Exposed for tests / other pages: module title lookup that tolerates unknown ids. */
export const safeModuleTitle = (id: string) => (getModule(id) ? moduleTitle(id) : id);
