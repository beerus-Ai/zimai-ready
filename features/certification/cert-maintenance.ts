import type {
  ActivitySubmission,
  AISource,
  AssessmentResult,
  Certificate,
  DomainId,
  EmployeeProfile,
  EmployeeProgress,
  ModuleMeta,
  ReadinessAssessment,
} from '../../types';
import { getDomain, MODULES, moduleTitle } from '../../data/catalog';
import { skillName } from '../../data/skills';
import { generateJSON, Type } from '../../services/gemini';
import { describeLearner } from '../../lib/aiContext';
import { CERT_TYPE_META, certificateState, LEVEL_META } from '../../lib/certification';
import { daysSince, daysUntil } from './cert-utils';

/**
 * Continuous readiness ("Maintain My AI Readiness") logic:
 * freshness scoring, maintenance learning recommendations (Gemini + deterministic
 * fallback) and the readiness timeline.
 */

// ───────────────────────── Freshness ─────────────────────────

export type Freshness = 'fresh' | 'review' | 'renewal';

export interface CertCountdown {
  cert: Certificate;
  daysLeft: number;
  state: Certificate['status'];
  percentRemaining: number;
}

export interface FreshnessReport {
  status: Freshness;
  reasons: { level: Freshness; text: string }[];
  daysSinceAssessment: number | null;
  daysSinceActivity: number | null;
  countdowns: CertCountdown[];
  nearestDaysLeft: number | null;
}

export const ASSESSMENT_REVIEW_DAYS = 90;
export const ASSESSMENT_RENEWAL_DAYS = 180;
export const INACTIVITY_REVIEW_DAYS = 21;

/** The newest certificate per (type, domain, organisation) — older superseded ones are ignored. */
export function currentCertificates(certs: Certificate[]): Certificate[] {
  const byKey = new Map<string, Certificate>();
  certs
    .filter((c) => c.status !== 'revoked')
    .forEach((c) => {
      const key = `${c.type}|${c.domainId}|${c.organisationId ?? ''}`;
      const prev = byKey.get(key);
      if (!prev || c.issueDate > prev.issueDate) byKey.set(key, c);
    });
  return [...byKey.values()];
}

export function assessFreshness(input: {
  latestAssessment: ReadinessAssessment | null;
  progress: EmployeeProgress | null;
  certificates: Certificate[];
  submissions: ActivitySubmission[];
  results: AssessmentResult[];
}): FreshnessReport {
  const { latestAssessment, progress, certificates, submissions, results } = input;
  const reasons: FreshnessReport['reasons'] = [];

  const daysSinceAssessment = latestAssessment ? daysSince(latestAssessment.createdAt) : null;
  if (daysSinceAssessment == null) reasons.push({ level: 'renewal', text: 'You have not completed a readiness assessment yet.' });
  else if (daysSinceAssessment >= ASSESSMENT_RENEWAL_DAYS) reasons.push({ level: 'renewal', text: `Your last readiness assessment was ${daysSinceAssessment} days ago — reassess at least every 6 months.` });
  else if (daysSinceAssessment >= ASSESSMENT_REVIEW_DAYS) reasons.push({ level: 'review', text: `Your readiness assessment is ${daysSinceAssessment} days old — a refresh will show how far you have come.` });

  const activityDates = [progress?.activity[0]?.at, progress?.streak.lastActiveDate, submissions[0]?.createdAt, results[0]?.createdAt].filter((d): d is string => Boolean(d));
  const lastActivity = activityDates.sort().pop();
  const daysSinceActivity = lastActivity ? daysSince(lastActivity) : null;
  if (progress && (daysSinceActivity == null || daysSinceActivity >= INACTIVITY_REVIEW_DAYS))
    reasons.push({ level: 'review', text: daysSinceActivity == null ? 'No learning activity recorded yet.' : `No learning activity for ${daysSinceActivity} days — skills fade without practice.` });

  const countdowns: CertCountdown[] = currentCertificates(certificates)
    .map((cert) => {
      const total = Math.max(1, new Date(cert.expiryDate).getTime() - new Date(cert.issueDate).getTime());
      const remaining = new Date(cert.expiryDate).getTime() - Date.now();
      return { cert, daysLeft: daysUntil(cert.expiryDate), state: certificateState(cert), percentRemaining: Math.max(0, Math.min(100, Math.round((remaining / total) * 100))) };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  countdowns.forEach(({ cert, daysLeft, state }) => {
    const name = `${LEVEL_META[cert.level].label} (${CERT_TYPE_META[cert.type].label})`;
    if (state === 'expired') reasons.push({ level: 'renewal', text: `Your ${name} certificate has expired — renew it to stay verifiably AI ready.` });
    else if (daysLeft <= 30) reasons.push({ level: 'renewal', text: `Your ${name} certificate expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.` });
    else if (daysLeft <= 90) reasons.push({ level: 'review', text: `Your ${name} certificate expires in ${daysLeft} days — plan your renewal.` });
  });

  const status: Freshness = reasons.some((r) => r.level === 'renewal') ? 'renewal' : reasons.some((r) => r.level === 'review') ? 'review' : 'fresh';
  const valid = countdowns.filter((c) => c.state === 'valid');
  return { status, reasons, daysSinceAssessment, daysSinceActivity, countdowns, nearestDaysLeft: valid.length ? valid[0].daysLeft : null };
}

// ───────────────────────── Maintenance recommendations ─────────────────────────

export type RecKind = 'advanced' | 'domain' | 'target' | 'responsible' | 'adjacent' | 'core';

export const REC_KIND_LABEL: Record<RecKind, string> = {
  advanced: 'Advanced · your domain',
  domain: 'Your domain',
  target: 'Target career',
  responsible: 'Responsible AI refresher',
  adjacent: 'Adjacent domain',
  core: 'Core AI skill',
};

export interface MaintenanceRec {
  moduleId: string;
  reason: string;
  kind: RecKind;
}

const ADJACENT: Record<DomainId, DomainId[]> = {
  finance: ['data-analytics', 'management'],
  hr: ['management', 'data-analytics'],
  marketing: ['customer-service', 'data-analytics'],
  software: ['data-analytics', 'operations'],
  'customer-service': ['marketing', 'operations'],
  operations: ['management', 'data-analytics'],
  management: ['hr', 'finance'],
  agriculture: ['data-analytics', 'operations'],
  healthcare: ['data-analytics', 'management'],
  education: ['data-analytics', 'management'],
  'data-analytics': ['software', 'finance'],
};

const RESPONSIBLE_SKILLS = new Set(['responsible-ai', 'data-privacy', 'bias-awareness', 'ai-governance', 'ai-verification']);
const RESPONSIBLE_CORE = new Set(['core-responsible', 'core-verification']);

interface Candidate {
  m: ModuleMeta;
  score: number;
  kind: RecKind;
}

function kindOf(m: ModuleMeta, domainId: DomainId, target?: DomainId): RecKind {
  if (m.kind === 'core') return RESPONSIBLE_CORE.has(m.id) ? 'responsible' : 'core';
  if (m.domainId === domainId) return m.level === 'advanced' ? 'advanced' : 'domain';
  if (target && m.domainId === target) return 'target';
  if (m.skillIds.some((s) => RESPONSIBLE_SKILLS.has(s))) return 'responsible';
  return 'adjacent';
}

/** Ranks every catalogue module NOT already in the learner's path. */
export function maintenanceCandidates(profile: EmployeeProfile | null, progress: EmployeeProgress): Candidate[] {
  const inPath = new Set(progress.path.map((p) => p.moduleId));
  const domainId = progress.domainId;
  const target = profile?.careerObjective === 'transition' ? profile.targetDomainId ?? progress.targetDomainId : progress.targetDomainId;
  const adjacent = ADJACENT[domainId] ?? [];
  const weak = new Set(Object.entries(progress.skillLevels).filter(([, l]) => l <= 1).map(([s]) => s));
  const objective = profile?.careerObjective;

  return MODULES.filter((m) => !inPath.has(m.id))
    .map((m) => {
      const kind = kindOf(m, domainId, target);
      const own = m.domainId === domainId;
      const isTarget = Boolean(target && target !== domainId && m.domainId === target);
      const isAdjacent = Boolean(m.domainId && adjacent.includes(m.domainId));
      const responsible = m.skillIds.some((s) => RESPONSIBLE_SKILLS.has(s));
      let score = 0;
      if (m.kind === 'core') score += 7;
      if (own) score += m.level === 'advanced' ? 10 : 6;
      if (isTarget) score += objective === 'transition' ? 10 : 6;
      if (isAdjacent) score += m.level === 'advanced' ? 5 : 4;
      if (responsible) score += 3;
      score += m.skillIds.filter((s) => weak.has(s)).length * 1.5;
      if (objective === 'leadership' && m.domainId === 'management') score += 6;
      if (objective === 'advanced-ai' && m.level === 'advanced') score += 4;
      if (objective === 'prepare-changes' && responsible) score += 2;
      if (m.kind === 'challenge' && !own && !isTarget) score -= 6;
      // Modules from unrelated professions are rarely useful, even if they touch responsible-AI skills.
      if (!own && !isTarget && !isAdjacent && m.kind !== 'core') score -= 12;
      return { m, score, kind };
    })
    .sort((a, b) => b.score - a.score || a.m.id.localeCompare(b.m.id));
}

/** Picks up to `n` candidates with variety (max 2 per domain). */
function pickDiverse(ranked: Candidate[], n: number): Candidate[] {
  const perDomain = new Map<string, number>();
  const out: Candidate[] = [];
  for (const c of ranked) {
    const key = c.m.domainId ?? 'core';
    if ((perDomain.get(key) ?? 0) >= 2) continue;
    perDomain.set(key, (perDomain.get(key) ?? 0) + 1);
    out.push(c);
    if (out.length >= n) break;
  }
  return out;
}

function fallbackReason(c: Candidate, profile: EmployeeProfile | null, progress: EmployeeProgress): string {
  const role = profile?.jobTitle?.trim() || 'professional';
  const own = getDomain(progress.domainId)?.shortName ?? 'your field';
  const skills = c.m.skillIds.slice(0, 2).map(skillName).join(' and ');
  const other = getDomain(c.m.domainId)?.name ?? 'This';
  switch (c.kind) {
    case 'advanced':
      return `You have built your ${own} AI foundations — this advanced module takes your ${skills} further, the natural next step for an experienced ${role}.`;
    case 'domain':
      return `A core ${own} module not yet on your path. It strengthens ${skills} directly in your day-to-day work.`;
    case 'target':
      return `Moves you towards ${profile?.targetCareer || other}: it builds ${skills}, which employers in that field increasingly expect.`;
    case 'responsible':
      return `A responsible-AI refresher — tools and risks change quickly, and strong ${skills} keeps your AI use safe, private and defensible as a ${role}.`;
    case 'adjacent':
      return `${other} work increasingly overlaps with ${own}. Adding ${skills} broadens how you can apply AI across teams.`;
    default:
      return `Strengthens ${skills} — a foundation every AI-ready ${role} relies on as tools evolve.`;
  }
}

export async function recommendMaintenance(input: {
  profile: EmployeeProfile | null;
  assessment: ReadinessAssessment | null;
  progress: EmployeeProgress;
}): Promise<{ items: MaintenanceRec[]; source: AISource; error?: string }> {
  const { profile, assessment, progress } = input;
  const ranked = maintenanceCandidates(profile, progress);
  if (!ranked.length) return { items: [], source: 'engine' };

  const fallback = (): MaintenanceRec[] => pickDiverse(ranked, 4).map((c) => ({ moduleId: c.m.id, reason: fallbackReason(c, profile, progress), kind: c.kind }));
  const pool = ranked.slice(0, 14);
  const kinds = new Map(pool.map((c) => [c.m.id, c.kind] as const));

  const catalogue = pool
    .map((c) => `- ${c.m.id} | ${moduleTitle(c.m, progress.domainId)} | ${c.m.level} | ${c.m.domainId ? getDomain(c.m.domainId)?.name : 'Core (all professions)'} | ${REC_KIND_LABEL[c.kind]} | ${c.m.summary}`)
    .join('\n');

  const prompt = `Recommend 3 or 4 NEW learning modules that will help this professional MAINTAIN and extend their AI readiness now that they have progressed through their current pathway.

Rules:
- Choose ONLY module ids from the catalogue below (they are not yet in the learner's path).
- Aim for a balanced mix: an advanced or adjacent-domain module that stretches them, plus a responsible-AI refresher when one is available. Respect their career objective.
- For each, write a specific 1–2 sentence reason (max 45 words) addressed to the learner as "you", tailored to their role, goals and skill gaps.

LEARNER
${describeLearner({ profile, assessment, progress })}

CATALOGUE (id | title | level | domain | category | summary)
${catalogue}

Return JSON: { "recommendations": [ { "moduleId": string, "reason": string } ] }`;

  const res = await generateJSON<MaintenanceRec[]>({
    prompt,
    system: 'You are the ZimAI Ready continuous-readiness advisor. You recommend catalogue modules that keep professionals AI ready as tools, risks and roles change.',
    schema: {
      type: Type.OBJECT,
      properties: {
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { moduleId: { type: Type.STRING }, reason: { type: Type.STRING } },
            required: ['moduleId', 'reason'],
          },
        },
      },
      required: ['recommendations'],
    },
    temperature: 0.4,
    fallback,
    normalize: (raw) => {
      const list = (raw as { recommendations?: unknown } | null)?.recommendations;
      if (!Array.isArray(list)) return null;
      const seen = new Set<string>();
      const out: MaintenanceRec[] = [];
      for (const r of list as { moduleId?: unknown; reason?: unknown }[]) {
        const id = typeof r?.moduleId === 'string' ? r.moduleId.trim() : '';
        const reason = typeof r?.reason === 'string' ? r.reason.trim() : '';
        const kind = kinds.get(id);
        if (!kind || seen.has(id) || reason.length < 12) continue;
        seen.add(id);
        out.push({ moduleId: id, reason: reason.length > 360 ? `${reason.slice(0, 357)}…` : reason, kind });
        if (out.length === 4) break;
      }
      if (out.length < 2) return null;
      for (const f of fallback()) {
        if (out.length >= 3) break;
        if (!seen.has(f.moduleId)) {
          seen.add(f.moduleId);
          out.push(f);
        }
      }
      return out;
    },
  });
  return { items: res.data, source: res.source, error: res.error };
}

// ───────────────────────── Timeline ─────────────────────────

export interface TimelineEvent {
  id: string;
  at: string;
  kind: 'assessment' | 'result' | 'certificate' | 'expiry';
  title: string;
  detail: string;
  future: boolean;
  tone: 'brand' | 'gold' | 'clay' | 'sky' | 'ink';
  to?: string;
}

export function buildTimeline(input: { assessments: ReadinessAssessment[]; results: AssessmentResult[]; certificates: Certificate[] }): TimelineEvent[] {
  const now = Date.now();
  const events: TimelineEvent[] = [];
  input.assessments.forEach((a) =>
    events.push({
      id: `a-${a.id}`,
      at: a.createdAt,
      kind: 'assessment',
      title: a.kind === 'initial' ? 'Initial AI readiness assessment' : 'Readiness reassessment',
      detail: `${a.personalReadiness}% · ${a.readinessLevel}`,
      future: false,
      tone: 'sky',
      to: '/app/readiness',
    }),
  );
  input.results.forEach((r) =>
    events.push({
      id: `r-${r.id}`,
      at: r.createdAt,
      kind: 'result',
      title: `${r.kind === 'final-knowledge' ? 'Final knowledge assessment' : 'Practical capstone'} ${r.passed ? 'passed' : 'attempted'}`,
      detail: `Scored ${r.score}%`,
      future: false,
      tone: r.passed ? 'brand' : 'ink',
      to: '/app/assessments',
    }),
  );
  input.certificates.forEach((c) => {
    events.push({
      id: `c-${c.id}`,
      at: c.issueDate,
      kind: 'certificate',
      title: `Certificate issued · ${LEVEL_META[c.level].label}`,
      detail: `${CERT_TYPE_META[c.type].label} · ${c.domainName}`,
      future: false,
      tone: 'gold',
      to: `/app/certificates/${c.id}`,
    });
    if (c.status !== 'revoked') {
      const future = new Date(c.expiryDate).getTime() > now;
      events.push({
        id: `e-${c.id}`,
        at: c.expiryDate,
        kind: 'expiry',
        title: future ? `Certificate expires · ${LEVEL_META[c.level].label}` : `Certificate expired · ${LEVEL_META[c.level].label}`,
        detail: c.id,
        future,
        tone: 'clay',
        to: `/app/certificates/${c.id}`,
      });
    }
  });
  return events.sort((a, b) => b.at.localeCompare(a.at));
}
