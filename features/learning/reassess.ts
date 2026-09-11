import type {
  ActivitySubmission,
  AISource,
  Confidence,
  EmployeeProfile,
  EmployeeProgress,
  OnboardingAnswers,
  PersonalUsage,
  ReadinessAssessment,
  ReadinessLevel,
  PriorityState,
  UseCase,
} from '../../types';
import { generateJSON, Type } from '../../services/gemini';
import { computeScores } from '../../lib/scoring';
import type { ReadinessScores } from '../../lib/scoring';
import { clamp, priorityState, readinessLevel, SKILL_LEVEL_LABELS } from '../../lib/readiness';
import { baselineSkillLevels, pathStats } from '../../lib/progress';
import { describeLearner } from '../../lib/aiContext';
import { getModule, moduleTitle } from '../../data/catalog';
import { skillName } from '../../data/skills';
import { nowISO, uid } from '../../lib/utils';
import { activityTitle, averageSkillLevel, bestSubmissions, quizAccuracy, trackedSkillLevels } from '../dashboard/stats';

/**
 * READINESS REASSESSMENT ENGINE
 * ─────────────────────────────
 * Combines a short self-report "pulse check" with DEMONSTRATED evidence from
 * learning, so readiness can only rise meaningfully when the learner has
 * actually learnt and practised.
 *
 *   selfReport     = computeScores({ ...initialAssessment.answers, personalUsage, confidence, useCases }).personalReadiness
 *   evidenceScore  = 0.35 × lesson quiz accuracy (Σ correct / Σ answered, 0–100)
 *                  + 0.25 × required-module completion ratio (0–100)
 *                  + 0.25 × practical activity average (best score per activity, 0–100; 0 if none)
 *                  + 0.15 × (average tracked skill level / 3) × 100
 *   newPersonal    = round(0.5 × selfReport + 0.5 × evidenceScore)
 *                    bounded to [initial − 10, initial + 35], then clamped to 0–100
 *   exposure       = computeScores(updated answers).workplaceExposure
 *   level/priority = readinessLevel(newPersonal) / priorityState(newPersonal, exposure)
 *
 * Gemini then explains the change (comparing the ORIGINAL assessment with
 * demonstrated learning and practical performance); a deterministic engine
 * produces equivalent text when Gemini is unavailable.
 */

// ───────────────────────── Pulse-check options ─────────────────────────

export interface PulseAnswers {
  personalUsage: PersonalUsage;
  confidence: Confidence;
  useCases: UseCase[];
}

export const USAGE_OPTIONS: { id: PersonalUsage; label: string; description: string; icon: string }[] = [
  { id: 'daily', label: 'Daily', description: 'AI is part of my everyday workflow', icon: 'Zap' },
  { id: 'weekly', label: 'Weekly', description: 'I use AI for specific tasks most weeks', icon: 'Activity' },
  { id: 'occasionally', label: 'Occasionally', description: 'Now and then, when I remember', icon: 'Lightbulb' },
  { id: 'never', label: 'Never', description: 'I have not used AI at work yet', icon: 'Lock' },
];

export const CONFIDENCE_OPTIONS: { id: Confidence; label: string; description: string }[] = [
  { id: 1, label: 'Beginner', description: 'Unsure where to start' },
  { id: 2, label: 'Basic', description: 'Simple questions only' },
  { id: 3, label: 'Intermediate', description: 'Useful results with effort' },
  { id: 4, label: 'Proficient', description: 'Reliable, verified outputs' },
  { id: 5, label: 'Advanced', description: 'I design AI workflows' },
];

export const USE_CASE_OPTIONS: { id: Exclude<UseCase, 'none'>; label: string; icon: string }[] = [
  { id: 'writing', label: 'Writing', icon: 'PenTool' },
  { id: 'research', label: 'Research', icon: 'SearchCheck' },
  { id: 'data-analysis', label: 'Data analysis', icon: 'BarChart3' },
  { id: 'automation', label: 'Automation', icon: 'Workflow' },
  { id: 'coding', label: 'Coding', icon: 'Code2' },
  { id: 'customer-support', label: 'Customer support', icon: 'Headset' },
  { id: 'reporting', label: 'Reporting', icon: 'FileText' },
  { id: 'brainstorming', label: 'Brainstorming', icon: 'Lightbulb' },
  { id: 'decision-support', label: 'Decision support', icon: 'Brain' },
];

export const usageLabel = (u: PersonalUsage) => USAGE_OPTIONS.find((o) => o.id === u)?.label ?? u;
export const confidenceLabel = (c: Confidence) => CONFIDENCE_OPTIONS.find((o) => o.id === c)?.label ?? String(c);
export const useCaseLabel = (u: UseCase) => USE_CASE_OPTIONS.find((o) => o.id === u)?.label ?? u;

// ───────────────────────── Eligibility ─────────────────────────

export interface Eligibility {
  eligible: boolean;
  modulesCompleted: number;
  activitiesSubmitted: number;
  requirements: { id: string; label: string; detail: string; met: boolean; progress: number }[];
}

/** Eligible when ≥2 modules are completed OR ≥1 practical activity has been submitted. */
export function reassessEligibility(progress: EmployeeProgress | null, submissions: ActivitySubmission[]): Eligibility {
  const modulesCompleted = Object.values(progress?.modules ?? {}).filter((m) => m.status === 'completed').length;
  const activitiesSubmitted = new Set(submissions.map((s) => s.activityId)).size;
  const requirements = [
    { id: 'modules', label: 'Complete at least 2 learning modules', detail: `${Math.min(modulesCompleted, 2)}/2 completed`, met: modulesCompleted >= 2, progress: Math.min(100, (modulesCompleted / 2) * 100) },
    { id: 'practical', label: 'Or submit at least 1 practical workplace activity', detail: `${activitiesSubmitted} submitted`, met: activitiesSubmitted >= 1, progress: Math.min(100, activitiesSubmitted * 100) },
  ];
  return { eligible: Boolean(progress) && (modulesCompleted >= 2 || activitiesSubmitted >= 1), modulesCompleted, activitiesSubmitted, requirements };
}

// ───────────────────────── Evidence & scoring ─────────────────────────

export interface EvidenceBreakdown {
  quizAccuracy: number; // 0–100
  quizAnswered: number;
  requiredRatio: number; // 0–100
  requiredCompleted: number;
  requiredTotal: number;
  practicalAverage: number; // 0–100
  practicalsSubmitted: number;
  skillLevelScore: number; // 0–100 (average level / 3)
  averageSkillLevel: number; // 0–3
  score: number; // weighted evidence score 0–100
}

export const EVIDENCE_WEIGHTS = { quiz: 0.35, required: 0.25, practical: 0.25, skills: 0.15 } as const;

export function computeEvidence(progress: EmployeeProgress | null, submissions: ActivitySubmission[]): EvidenceBreakdown {
  const quiz = quizAccuracy(progress);
  const stats = pathStats(progress);
  const requiredRatio = stats.requiredTotal ? (stats.requiredCompleted / stats.requiredTotal) * 100 : 0;
  const best = bestSubmissions(submissions);
  const practicalAverage = best.length ? best.reduce((a, s) => a + s.feedback.score, 0) / best.length : 0;
  const avgLevel = averageSkillLevel(trackedSkillLevels(progress));
  const skillLevelScore = (avgLevel / 3) * 100;
  const score =
    EVIDENCE_WEIGHTS.quiz * quiz.percent +
    EVIDENCE_WEIGHTS.required * requiredRatio +
    EVIDENCE_WEIGHTS.practical * practicalAverage +
    EVIDENCE_WEIGHTS.skills * skillLevelScore;
  return {
    quizAccuracy: quiz.percent,
    quizAnswered: quiz.total,
    requiredRatio: Math.round(requiredRatio),
    requiredCompleted: stats.requiredCompleted,
    requiredTotal: stats.requiredTotal,
    practicalAverage: Math.round(practicalAverage),
    practicalsSubmitted: best.length,
    skillLevelScore: Math.round(skillLevelScore),
    averageSkillLevel: Math.round(avgLevel * 100) / 100,
    score: clamp(score),
  };
}

export interface ReassessmentScores {
  answers: OnboardingAnswers;
  selfReport: ReadinessScores;
  evidence: EvidenceBreakdown;
  raw: number; // unbounded 50/50 blend
  bounds: [number, number];
  personalReadiness: number;
  workplaceExposure: number;
  readinessLevel: ReadinessLevel;
  priorityState: PriorityState;
  initialReadiness: number;
  delta: number;
}

export function computeReassessmentScores(input: {
  initial: ReadinessAssessment;
  pulse: PulseAnswers;
  progress: EmployeeProgress | null;
  submissions: ActivitySubmission[];
}): ReassessmentScores {
  const { initial, pulse, progress, submissions } = input;
  const useCases = pulse.useCases.length ? pulse.useCases.filter((u) => u !== 'none') : (['none'] as UseCase[]);
  const answers: OnboardingAnswers = { ...initial.answers, personalUsage: pulse.personalUsage, confidence: pulse.confidence, useCases: useCases.length ? useCases : ['none'] };
  const selfReport = computeScores(answers);
  const evidence = computeEvidence(progress, submissions);
  const raw = Math.round(0.5 * selfReport.personalReadiness + 0.5 * evidence.score);
  const lo = Math.max(0, initial.personalReadiness - 10);
  const hi = Math.min(100, initial.personalReadiness + 35);
  const personalReadiness = clamp(Math.max(lo, Math.min(hi, raw)));
  const workplaceExposure = selfReport.workplaceExposure;
  return {
    answers,
    selfReport,
    evidence,
    raw,
    bounds: [lo, hi],
    personalReadiness,
    workplaceExposure,
    readinessLevel: readinessLevel(personalReadiness),
    priorityState: priorityState(personalReadiness, workplaceExposure),
    initialReadiness: initial.personalReadiness,
    delta: personalReadiness - initial.personalReadiness,
  };
}

// ───────────────────────── What changed since the initial assessment ─────────────────────────

export interface ChangeSummary {
  modulesCompleted: { moduleId: string; title: string; quiz?: number; completedAt?: string }[];
  practicals: { title: string; score: number; verdict: string; overall: string; moduleId: string }[];
  skillsRaised: { skillId: string; name: string; from: number; to: number }[];
  quiz: { correct: number; total: number; percent: number };
  tutorQuestions: number;
  streakLongest: number;
  daysSinceInitial: number;
}

export function changesSinceInitial(input: {
  initial: ReadinessAssessment;
  profile: EmployeeProfile | null;
  progress: EmployeeProgress | null;
  submissions: ActivitySubmission[];
}): ChangeSummary {
  const { initial, profile, progress, submissions } = input;
  const domain = progress?.domainId;
  const modulesCompleted = Object.values(progress?.modules ?? {})
    .filter((m) => m.status === 'completed')
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
    .map((m) => ({
      moduleId: m.moduleId,
      title: moduleTitle(m.moduleId, domain),
      quiz: m.quizTotal ? Math.round((m.quizCorrect / m.quizTotal) * 100) : undefined,
      completedAt: m.completedAt,
    }));
  const practicals = bestSubmissions(submissions).map((s) => ({
    title: activityTitle(s, getModule(s.moduleId) ? `${moduleTitle(s.moduleId, domain)} practical` : undefined),
    score: s.feedback.score,
    verdict: s.feedback.verdict,
    overall: s.feedback.overall,
    moduleId: s.moduleId,
  }));
  const baseline = profile ? baselineSkillLevels(profile, initial) : {};
  const skillsRaised = Object.entries(progress?.skillLevels ?? {})
    .filter(([id, l]) => l > (baseline[id] ?? 0))
    .map(([id, l]) => ({ skillId: id, name: skillName(id), from: baseline[id] ?? 0, to: l }))
    .sort((a, b) => b.to - a.to);
  const days = Math.max(0, Math.round((Date.now() - new Date(initial.createdAt).getTime()) / 86400000));
  return {
    modulesCompleted,
    practicals,
    skillsRaised,
    quiz: quizAccuracy(progress),
    tutorQuestions: progress?.tutorQuestions ?? 0,
    streakLongest: progress?.streak.longest ?? 0,
    daysSinceInitial: days,
  };
}

// ───────────────────────── Gemini insights ─────────────────────────

export interface ReassessmentInsights {
  improvementExplanation: string;
  improvementDrivers: string[];
  gaps: string[];
  learnNext: string[];
}

const INSIGHTS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    improvementExplanation: { type: Type.STRING, description: '2–3 sentences explaining why readiness changed, grounded in the evidence.' },
    improvementDrivers: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3–5 bullets naming specific modules, practical activities or behaviour changes.' },
    gaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3–4 remaining skill gaps.' },
    learnNext: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3–4 concrete next learning steps.' },
  },
  required: ['improvementExplanation', 'improvementDrivers', 'gaps', 'learnNext'],
};

const cleanList = (v: unknown, max: number): string[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is string => typeof x === 'string' && x.trim().length > 3)
        .map((x) => x.trim().replace(/^[-•*]\s*/, ''))
        .slice(0, max)
    : [];

function normalizeInsights(raw: unknown): ReassessmentInsights | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const improvementExplanation = typeof r.improvementExplanation === 'string' ? r.improvementExplanation.trim() : '';
  const improvementDrivers = cleanList(r.improvementDrivers, 5);
  const gaps = cleanList(r.gaps, 4);
  const learnNext = cleanList(r.learnNext, 4);
  if (improvementExplanation.length < 20 || improvementDrivers.length < 2 || !gaps.length || !learnNext.length) return null;
  return { improvementExplanation, improvementDrivers, gaps, learnNext };
}

const listJoin = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** Deterministic fallback — specific, evidence-based and responsibly worded. */
export function fallbackInsights(input: {
  initial: ReadinessAssessment;
  scores: ReassessmentScores;
  changes: ChangeSummary;
  pulse: PulseAnswers;
  progress: EmployeeProgress | null;
}): ReassessmentInsights {
  const { initial, scores, changes, pulse, progress } = input;
  const { evidence, delta } = scores;
  const before = initial.answers;
  const moved = delta > 0 ? `risen from ${initial.personalReadiness}% to ${scores.personalReadiness}% (+${delta} points)` : delta < 0 ? `moved from ${initial.personalReadiness}% to ${scores.personalReadiness}% (${delta} points)` : `held steady at ${scores.personalReadiness}%`;
  const evidenceBits = [
    changes.modulesCompleted.length ? `${changes.modulesCompleted.length} module${changes.modulesCompleted.length === 1 ? '' : 's'} completed` : '',
    evidence.quizAnswered ? `${evidence.quizAccuracy}% accuracy on lesson checks` : '',
    evidence.practicalsSubmitted ? `a ${evidence.practicalAverage}% practical activity average` : '',
  ].filter(Boolean);
  const levelChange =
    scores.readinessLevel !== initial.readinessLevel
      ? `That moves you from ${initial.readinessLevel} to ${scores.readinessLevel}.`
      : `You remain at ${scores.readinessLevel} — ${delta > 0 ? 'with clear momentum towards the next level' : 'more demonstrated practice will move you up'}.`;
  const improvementExplanation = `Your personal AI readiness has ${moved}. The score blends how you now use AI at work (${usageLabel(pulse.personalUsage).toLowerCase()}, confidence ${pulse.confidence}/5) with demonstrated evidence${evidenceBits.length ? ` — ${listJoin(evidenceBits)}` : ''}. ${levelChange}`;

  const drivers: string[] = [];
  changes.modulesCompleted.slice(0, 3).forEach((m) => drivers.push(`Completed ${m.title}${m.quiz != null ? ` with ${m.quiz}% on lesson checks` : ''}`));
  changes.practicals.slice(0, 2).forEach((p) => drivers.push(`Scored ${p.score}% on the practical "${p.title}"`));
  if (pulse.personalUsage !== before.personalUsage) drivers.push(`AI use at work has changed from ${usageLabel(before.personalUsage).toLowerCase()} to ${usageLabel(pulse.personalUsage).toLowerCase()}`);
  const newUses = pulse.useCases.filter((u) => u !== 'none' && !before.useCases.includes(u));
  if (newUses.length) drivers.push(`Now applying AI to ${listJoin(newUses.map((u) => useCaseLabel(u).toLowerCase()))}`);
  if (pulse.confidence > before.confidence) drivers.push(`Confidence has grown from ${before.confidence}/5 to ${pulse.confidence}/5`);
  const competent = changes.skillsRaised.filter((s) => s.to >= 2).map((s) => s.name);
  if (competent.length) drivers.push(`Demonstrated competence in ${listJoin(competent.slice(0, 3))}`);
  if (drivers.length < 3 && changes.tutorQuestions) drivers.push(`Asked the AI Tutor ${changes.tutorQuestions} question${changes.tutorQuestions === 1 ? '' : 's'} to deepen understanding`);
  if (drivers.length < 3) drivers.push('Built a consistent learning habit on your personalised pathway');

  // Remaining gaps: weakest tracked skills in path order, then original gaps as a backstop.
  const levels = trackedSkillLevels(progress);
  const ordered = [...(progress?.path ?? [])].sort((a, b) => a.priority - b.priority);
  const pending = ordered.filter((p) => progress?.modules[p.moduleId]?.status !== 'completed');
  const weak: string[] = [];
  pending.forEach((p) =>
    getModule(p.moduleId)?.skillIds.forEach((s) => {
      if ((levels[s] ?? 0) <= 1 && !weak.includes(s)) weak.push(s);
    }),
  );
  const gaps = weak.slice(0, 3).map((s) => `${skillName(s)} — currently ${SKILL_LEVEL_LABELS[levels[s] ?? 0].toLowerCase()}`);
  if (evidence.practicalsSubmitted < 2) gaps.push('Practical application — more workplace activities are needed to evidence your skills');
  if (gaps.length < 3) gaps.push(...initial.gaps.slice(0, 3 - gaps.length));

  const learnNext = pending.slice(0, 3).map((p) => `Complete ${moduleTitle(p.moduleId, progress?.domainId)}`);
  if (evidence.practicalsSubmitted < 2) learnNext.push('Submit a practical workplace activity to prove your skills');
  if (!pending.length) learnNext.push('Attempt the final knowledge assessment and capstone to certify your readiness');
  if (learnNext.length < 3) learnNext.push(...initial.learnNext.slice(0, 3 - learnNext.length));

  return { improvementExplanation, improvementDrivers: drivers.slice(0, 5), gaps: gaps.slice(0, 4), learnNext: learnNext.slice(0, 4) };
}

export async function generateReassessmentInsights(input: {
  initial: ReadinessAssessment;
  scores: ReassessmentScores;
  changes: ChangeSummary;
  pulse: PulseAnswers;
  profile: EmployeeProfile | null;
  progress: EmployeeProgress | null;
}): Promise<{ data: ReassessmentInsights; source: AISource }> {
  const { initial, scores, changes, pulse, profile, progress } = input;
  const fallback = () => fallbackInsights({ initial, scores, changes, pulse, progress });
  const levels = trackedSkillLevels(progress);
  const prompt = `Compare a learner's ORIGINAL AI readiness assessment with what they have since DEMONSTRATED through learning and practical work, and explain the change.

LEARNER
${describeLearner({ profile, assessment: initial, progress })}

ORIGINAL ASSESSMENT (${initial.createdAt.slice(0, 10)})
- Personal AI readiness: ${initial.personalReadiness}% (${initial.readinessLevel}); workplace AI exposure ${initial.workplaceExposure}%
- Used AI: ${initial.answers.personalUsage}; confidence ${initial.answers.confidence}/5; use cases: ${initial.answers.useCases.join(', ') || 'none'}
- Gaps identified: ${initial.gaps.join('; ')}
- Learn next: ${initial.learnNext.join('; ')}

PULSE CHECK TODAY
- Uses AI: ${pulse.personalUsage}; confidence ${pulse.confidence}/5; use cases: ${pulse.useCases.join(', ') || 'none'}

DEMONSTRATED EVIDENCE
- Modules completed: ${changes.modulesCompleted.map((m) => `${m.title}${m.quiz != null ? ` (lesson checks ${m.quiz}%)` : ''}`).join('; ') || 'none'}
- Overall lesson quiz accuracy: ${scores.evidence.quizAccuracy}% across ${scores.evidence.quizAnswered} questions
- Required modules: ${scores.evidence.requiredCompleted}/${scores.evidence.requiredTotal}
- Practical activities: ${changes.practicals.map((p) => `"${p.title}" scored ${p.score}% (${p.verdict}) — feedback: ${p.overall}`).join(' | ') || 'none submitted yet'}
- Skill levels (0 needs development – 3 AI ready): ${Object.entries(levels).map(([id, l]) => `${skillName(id)} ${l}`).join(', ')}

NEW SCORES (engine-calculated, do not change them)
- Personal AI readiness: ${initial.personalReadiness}% → ${scores.personalReadiness}% (${scores.delta >= 0 ? '+' : ''}${scores.delta}); level ${initial.readinessLevel} → ${scores.readinessLevel}
- Self-report component ${scores.selfReport.personalReadiness}%, evidence component ${scores.evidence.score}% (weighted 50/50)

Return JSON:
- improvementExplanation: 2–3 sentences, second person, explaining WHY readiness moved, referencing specific evidence. If practical evidence is thin, say so constructively.
- improvementDrivers: 3–5 short bullets naming specific modules, practical activities or behaviour changes that drove the change.
- gaps: 3–4 remaining gaps, updated in light of the evidence (drop gaps that are now clearly addressed).
- learnNext: 3–4 concrete next steps, referencing modules from their pathway where possible.`;

  const res = await generateJSON<ReassessmentInsights>({
    prompt,
    system: 'You are the ZimAI Ready readiness analyst. You explain progress honestly, credit demonstrated evidence over self-report, and never inflate results.',
    schema: INSIGHTS_SCHEMA,
    temperature: 0.4,
    fallback,
    normalize: normalizeInsights,
  });
  return { data: res.data, source: res.source };
}

// ───────────────────────── Build the saved record ─────────────────────────

export function buildReassessment(input: {
  userId: string;
  previous: ReadinessAssessment;
  initial: ReadinessAssessment;
  scores: ReassessmentScores;
  insights: ReassessmentInsights;
  source: AISource;
}): ReadinessAssessment {
  const { userId, previous, initial, scores, insights, source } = input;
  const summary = `Following your learning, your personal AI readiness is now ${scores.personalReadiness}% (${scores.readinessLevel}), up from ${initial.personalReadiness}% at your initial assessment, against ${scores.workplaceExposure}% workplace AI exposure.`;
  return {
    id: uid('ra-'),
    userId,
    kind: 'reassessment',
    createdAt: nowISO(),
    answers: scores.answers,
    personalReadiness: scores.personalReadiness,
    workplaceExposure: scores.workplaceExposure,
    readinessLevel: scores.readinessLevel,
    priorityState: scores.priorityState,
    summary: scores.delta >= 0 ? summary : summary.replace('up from', 'compared with'),
    strengths: previous.strengths,
    gaps: insights.gaps,
    roleChanges: previous.roleChanges,
    learnNext: insights.learnNext,
    careerOpportunities: previous.careerOpportunities,
    prescription: previous.prescription,
    ...(previous.careerTransition ? { careerTransition: previous.careerTransition } : {}),
    previousAssessmentId: previous.id,
    improvementExplanation: insights.improvementExplanation,
    improvementDrivers: insights.improvementDrivers,
    source,
  };
}
