import { useCallback, useEffect, useState } from 'react';
import type { AISource, DomainId, Lesson, LessonBlock, ModuleContent, ModuleMeta, PracticalActivity } from '../../../types';
import { getDomain, getModule, moduleTitle } from '../../../data/catalog';
import { getModuleContent } from '../../../data/content';
import { skillName } from '../../../data/skills';
import { generateJSON, Type } from '../../../services/gemini';
import type { Schema } from '../../../services/gemini';
import { seedFor } from './domainSeeds';

/**
 * Resolves the lesson content for a module:
 *   authored content (data/content) → cached Gemini lessons (sessionStorage) →
 *   freshly generated Gemini lessons → deterministic lessons built from ModuleMeta.
 * Challenge modules (and the first module of each domain when no content exists)
 * always receive a practical activity so they can be completed.
 */

export type ContentSource = 'authored' | AISource;

export interface ResolvedModule {
  meta: ModuleMeta;
  content: ModuleContent;
  source: ContentSource;
}

const CACHE_PREFIX = 'zimai:lessons:v1:';
const cacheKey = (moduleId: string, domainId: DomainId) => `${CACHE_PREFIX}${moduleId}:${domainId}`;

function readCache(moduleId: string, domainId: DomainId): ModuleContent | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(moduleId, domainId));
    return raw ? (JSON.parse(raw) as ModuleContent) : null;
  } catch {
    return null;
  }
}

function writeCache(moduleId: string, domainId: DomainId, content: ModuleContent) {
  try {
    sessionStorage.setItem(cacheKey(moduleId, domainId), JSON.stringify(content));
  } catch {
    /* storage full or unavailable — content still works for this session */
  }
}

const isFirstDomainModule = (meta: ModuleMeta) => !!meta.domainId && getDomain(meta.domainId)?.moduleIds[0] === meta.id;
const shouldHaveActivity = (meta: ModuleMeta) => meta.kind === 'challenge' || isFirstDomainModule(meta);

// ───────────────────────── Practical activity fallback ─────────────────────────

export function fallbackActivity(meta: ModuleMeta, domainId: DomainId): PracticalActivity {
  const d = (meta.domainId ?? domainId) as DomainId;
  const domain = getDomain(d);
  const seed = seedFor(d);
  return {
    id: `${meta.id}-activity`,
    title: meta.kind === 'challenge' ? seed.activity.title : `Practice: ${seed.activity.title}`,
    domainId: d,
    scenario: seed.activity.scenario,
    data: seed.activity.data,
    task: seed.activity.task,
    rubric: [
      { criterion: 'Effective use of AI', description: 'Uses AI purposefully with a clear, context-rich prompt and explains how AI supported the work.', weight: 25 },
      { criterion: 'Verification of AI output', description: 'Checks the AI output against the data or a trusted source, identifies errors and corrects them with evidence.', weight: 25 },
      { criterion: 'Responsible AI', description: 'Protects personal and confidential data, considers bias and fairness, and keeps a human accountable for the final decision.', weight: 25 },
      { criterion: 'Domain accuracy & recommendation', description: `Applies sound ${domain?.shortName ?? 'professional'} knowledge, uses the figures correctly and ends with a clear, practical recommendation.`, weight: 25 },
    ],
    skillIds: Array.from(new Set([...meta.skillIds, 'ai-verification', 'responsible-ai'])),
    sampleStrongAnswer: seed.activity.sample,
  };
}

/** The practical activity for a module (authored, or the deterministic fallback where one is expected). */
export function activityFor(moduleId: string, domainId: DomainId, content?: ModuleContent | null): PracticalActivity | undefined {
  const meta = getModule(moduleId);
  if (!meta) return undefined;
  const c = content ?? getModuleContent(moduleId);
  if (c?.activity) return c.activity;
  const authored = getModuleContent(moduleId);
  if (meta.kind === 'challenge') return fallbackActivity(meta, domainId);
  if (!authored && isFirstDomainModule(meta)) return fallbackActivity(meta, domainId);
  return undefined;
}

export function moduleHasActivity(moduleId: string): boolean {
  const meta = getModule(moduleId);
  if (!meta) return false;
  const c = getModuleContent(moduleId);
  if (c?.activity) return true;
  return meta.kind === 'challenge' || (!c && isFirstDomainModule(meta));
}

/** Number of lessons a module has (authored count, else the generated default). */
export function lessonCountFor(moduleId: string): number {
  const c = getModuleContent(moduleId);
  if (c?.lessons.length) return c.lessons.length;
  return getModule(moduleId)?.kind === 'challenge' ? 1 : 2;
}

// ───────────────────────── Deterministic lessons ─────────────────────────

export function buildFallbackContent(meta: ModuleMeta, domainId: DomainId): ModuleContent {
  const d = (meta.domainId ?? domainId) as DomainId;
  const domain = getDomain(d);
  const seed = seedFor(d);
  const title = moduleTitle(meta, d);
  const skills = meta.skillIds.map(skillName);
  const field = domain?.shortName ?? 'your field';

  if (meta.kind === 'challenge') {
    const lesson: Lesson = {
      id: `${meta.id}-l1`,
      title: 'Challenge briefing',
      minutes: 5,
      blocks: [
        {
          type: 'explain',
          title: 'Your workplace challenge',
          body: `${meta.summary} You will work through a realistic, fictional ${field} scenario and submit your approach for AI feedback against a transparent rubric.`,
          bullets: ['Use AI purposefully — show your prompt', `Verify outputs against ${seed.source}`, 'Protect personal and confidential data', 'End with a clear recommendation you are accountable for'],
        },
        { type: 'example', title: `What good looks like at ${seed.org}`, scenario: seed.example.scenario, takeaway: seed.example.takeaway },
        {
          type: 'quiz',
          question: 'Which answer would score highest in a workplace AI challenge?',
          options: [
            'A polished AI output pasted without changes',
            'A short answer that avoids using AI at all',
            'An approach showing the prompt, the checks made, corrections and a human-owned recommendation',
            'A long list of AI tools that could be used',
          ],
          correctIndex: 2,
          explanation: 'Assessors look for demonstrated competency: purposeful AI use, evidence of verification, responsible handling of data and a decision you own.',
          skillId: 'ai-verification',
        },
        { type: 'task', title: 'Prepare your approach', instructions: 'Before opening the activity, jot down: (1) what you will ask AI to do, (2) what you will check, (3) which data you must not paste into an AI tool.', hint: 'Look for numbers, names or claims in the scenario that could be wrong or sensitive.' },
      ],
    };
    return { moduleId: meta.id, lessons: [lesson] };
  }

  const lesson1Blocks: LessonBlock[] = [
    {
      type: 'explain',
      title: 'What this module is about',
      body: `${meta.summary} In ${domain?.name ?? 'your work'}, you will meet this most when ${seed.task}.`,
      bullets: [`Where AI helps: ${seed.task}`, `Main risk to manage: ${seed.risk}`, `You stay accountable — check against ${seed.source}`],
    },
  ];
  if (meta.kind !== 'core') lesson1Blocks.push({ type: 'example', title: `A day at ${seed.org}`, scenario: seed.example.scenario, takeaway: seed.example.takeaway });
  lesson1Blocks.push(
    {
      type: 'quiz',
      question: `A colleague at ${seed.org} gets a fluent, confident AI output for ${seed.task}. What should happen before it is used?`,
      options: [
        'Use it as-is — confident AI answers are usually right',
        `Check it against ${seed.source} and correct it before sharing`,
        'Ask the AI whether it is sure, then use it',
        'Share it with a note saying AI wrote it',
      ],
      correctIndex: 1,
      explanation: 'AI can sound certain and still be wrong. Verification against a trusted source is what turns a draft into professional work.',
      skillId: 'ai-verification',
    },
    {
      type: 'task',
      title: 'Try it: find your first use case',
      instructions: `Write down one task from your week that involves ${seed.task} (or something similar). What would you ask AI to do, and what is one thing you would check before trusting the answer?`,
      hint: 'Pick a task that is repetitive, text-heavy or data-heavy — and low risk if the first draft is imperfect.',
    },
  );

  const lesson2Blocks: LessonBlock[] = [
    {
      type: 'explain',
      title: 'A simple four-step loop',
      body: `Use this loop whenever you apply AI to ${field.toLowerCase()} work. It keeps you fast and in control.`,
      bullets: ['Context — give your role, goal, audience and format', 'Draft — let AI produce a first version', `Verify — check facts and figures against ${seed.source}`, 'Decide — edit, approve or reject; you own the result'],
    },
    {
      type: 'interactive',
      title: 'Choose the better prompt',
      prompt: `You want AI help with ${seed.task}. Which prompt is more likely to give a useful, safe result?`,
      mode: 'choose-better',
      options: [
        { id: 'a', label: '"Do this for me quickly."', correct: false, feedback: 'Too vague — no role, context, format or constraints, so the output will be generic.' },
        {
          id: 'b',
          label: `"You are an experienced ${field} professional. Using only the anonymised information below, draft a short first version in bullet points and flag anything you are unsure about."`,
          correct: true,
          feedback: 'Great choice — role, context, format, a data boundary and a request to flag uncertainty.',
        },
        { id: 'c', label: '"Here is the full file with everyone’s details — summarise it."', correct: false, feedback: 'Risky — pasting personal or confidential details into an AI tool can breach privacy rules.' },
      ],
    },
    {
      type: 'quiz',
      question: `Which is the biggest risk to manage when ${seed.task} with AI?`,
      options: [`${seed.risk.charAt(0).toUpperCase()}${seed.risk.slice(1)}`, 'The AI takes a few seconds to respond', 'The output needs light formatting', 'Colleagues might use AI too'],
      correctIndex: 0,
      explanation: `The real risk is ${seed.risk}. Speed and formatting are minor; accuracy, fairness and accountability are what matter.`,
      skillId: meta.skillIds[0],
    },
    {
      type: 'quiz',
      question: 'Your document contains personal or confidential information and you want AI help. What is the responsible approach?',
      options: ['Paste it into any free chatbot', 'Remove or anonymise personal and confidential details and use an approved tool', 'Ask a colleague to paste it instead', 'Paste only half of the document'],
      correctIndex: 1,
      explanation: 'Protect people and your organisation: anonymise, minimise the data you share and use tools your organisation has approved.',
      skillId: 'data-privacy',
    },
    {
      type: 'task',
      title: 'Apply it this week',
      instructions: `Run the four-step loop on one small real task. Note the time saved, what you corrected, and how this builds your ${skills[0] ?? 'AI'} skills.`,
      hint: 'Keep a short "AI log": prompt used, what was wrong, what you changed. It becomes great evidence for certification.',
    },
  ];

  const content: ModuleContent = {
    moduleId: meta.id,
    lessons: [
      { id: `${meta.id}-l1`, title: `${title.split(':')[0]} — the essentials`, minutes: meta.kind === 'core' ? 6 : 7, blocks: lesson1Blocks },
      { id: `${meta.id}-l2`, title: 'Putting it into practice safely', minutes: 8, blocks: lesson2Blocks },
    ],
  };
  if (meta.kind === 'core') content.domainExamples = { [d]: seed.example };
  if (shouldHaveActivity(meta)) content.activity = fallbackActivity(meta, d);
  return content;
}

// ───────────────────────── Gemini generation ─────────────────────────

const BLOCK_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['explain', 'example', 'quiz', 'task'] },
    title: { type: Type.STRING },
    body: { type: Type.STRING },
    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
    scenario: { type: Type.STRING },
    takeaway: { type: Type.STRING },
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING },
    instructions: { type: Type.STRING },
    hint: { type: Type.STRING },
  },
  required: ['type'],
};

const LESSONS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    lessons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          minutes: { type: Type.INTEGER },
          blocks: { type: Type.ARRAY, items: BLOCK_SCHEMA },
        },
        required: ['title', 'blocks'],
      },
    },
  },
  required: ['lessons'],
};

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function normalizeBlock(raw: unknown): LessonBlock | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  switch (b.type) {
    case 'explain': {
      if (!str(b.body)) return null;
      const bullets = Array.isArray(b.bullets) ? b.bullets.map(str).filter(Boolean).slice(0, 5) : [];
      return { type: 'explain', title: str(b.title) || 'Key idea', body: str(b.body), ...(bullets.length ? { bullets } : {}) };
    }
    case 'example':
      if (!str(b.scenario)) return null;
      return { type: 'example', title: str(b.title) || 'Workplace example', scenario: str(b.scenario), takeaway: str(b.takeaway) || 'Use AI to assist, and verify before you act.' };
    case 'quiz': {
      const options = Array.isArray(b.options) ? b.options.map(str).filter(Boolean) : [];
      const ci = typeof b.correctIndex === 'number' ? Math.round(b.correctIndex) : -1;
      if (!str(b.question) || options.length < 3 || options.length > 5 || ci < 0 || ci >= options.length) return null;
      return { type: 'quiz', question: str(b.question), options, correctIndex: ci, explanation: str(b.explanation) || 'Review the concept above and try to connect it to your own work.' };
    }
    case 'task':
      if (!str(b.instructions)) return null;
      return { type: 'task', title: str(b.title) || 'Try it', instructions: str(b.instructions), ...(str(b.hint) ? { hint: str(b.hint) } : {}) };
    default:
      return null;
  }
}

function normalizeLessons(raw: unknown, meta: ModuleMeta, count: number): Lesson[] | null {
  const list = (raw as { lessons?: unknown })?.lessons;
  if (!Array.isArray(list)) return null;
  const lessons: Lesson[] = [];
  for (const l of list.slice(0, count)) {
    const lr = l as Record<string, unknown>;
    const blocks = (Array.isArray(lr.blocks) ? lr.blocks : []).map(normalizeBlock).filter((x): x is LessonBlock => !!x).slice(0, 7);
    if (blocks.length < 3) return null;
    const minutes = typeof lr.minutes === 'number' && lr.minutes > 0 && lr.minutes < 30 ? Math.round(lr.minutes) : 6;
    lessons.push({ id: `${meta.id}-l${lessons.length + 1}`, title: str(lr.title) || `Lesson ${lessons.length + 1}`, minutes, blocks });
  }
  return lessons.length ? lessons : null;
}

export async function generateModuleContent(meta: ModuleMeta, domainId: DomainId, learner: string): Promise<{ content: ModuleContent; source: AISource }> {
  const d = (meta.domainId ?? domainId) as DomainId;
  const domain = getDomain(d);
  const fallback = buildFallbackContent(meta, d);
  const count = fallback.lessons.length;
  const res = await generateJSON<Lesson[]>({
    system: 'You are an expert instructional designer who writes engaging, practical micro-learning for working professionals.',
    prompt: `Create micro-learning lessons for the ZimAI Ready module below.

MODULE
Title: ${moduleTitle(meta, d)}
Summary: ${meta.summary}
Level: ${meta.level}
Skills developed: ${meta.skillIds.map(skillName).join(', ')}
Learning domain: ${domain?.name ?? d} (${domain?.professional ?? 'professionals'})
Module type: ${meta.kind === 'challenge' ? 'workplace challenge briefing (the learner completes a practical activity afterwards)' : meta.kind}

LEARNER
${learner}

Write exactly ${count} short lesson${count > 1 ? 's' : ''} (5–8 minutes each). Each lesson has 4–6 blocks, usually in this order: explain → example → quiz → explain or quiz → task.
Block rules:
- explain: title, body (max 70 words), bullets (2–4 short items)
- example: title, scenario (a fictional Zimbabwean workplace, max 70 words), takeaway (one sentence)
- quiz: question, options (exactly 4), correctIndex (0–3), explanation (max 40 words)
- task: title, instructions (a practical try-it task, max 50 words), hint
Every lesson needs at least one quiz. Make the content specific to ${domain?.professional ?? 'this profession'}, emphasise verification of AI output and responsible AI (privacy, bias, human oversight). Use fictional organisations only.`,
    schema: LESSONS_SCHEMA,
    temperature: 0.6,
    fallback: () => fallback.lessons,
    normalize: (raw) => normalizeLessons(raw, meta, count),
  });
  const content: ModuleContent = { ...fallback, lessons: res.data };
  return { content, source: res.source };
}

// ───────────────────────── Hook ─────────────────────────

type ContentState = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; data: ResolvedModule };

function resolveSync(moduleId: string | undefined, domainId: DomainId): ContentState {
  const meta = moduleId ? getModule(moduleId) : undefined;
  if (!meta) return { status: 'missing' };
  const authored = getModuleContent(meta.id);
  if (authored && authored.lessons.length) {
    const content = authored.activity || meta.kind !== 'challenge' ? authored : { ...authored, activity: fallbackActivity(meta, domainId) };
    return { status: 'ready', data: { meta, content, source: 'authored' } };
  }
  const cached = readCache(meta.id, domainId);
  if (cached?.lessons?.length) return { status: 'ready', data: { meta, content: cached, source: 'gemini' } };
  return { status: 'loading' };
}

/** Synchronous best-effort content (authored → cached → deterministic). Used by the tutor and path views. */
export function peekModuleContent(moduleId: string, domainId: DomainId): ModuleContent | null {
  const meta = getModule(moduleId);
  if (!meta) return null;
  const s = resolveSync(moduleId, domainId);
  if (s.status === 'ready') return s.data.content;
  return buildFallbackContent(meta, domainId);
}

export function useModuleContent(moduleId: string | undefined, domainId: DomainId, learner: string) {
  const [state, setState] = useState<ContentState>(() => resolveSync(moduleId, domainId));
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const initial = resolveSync(moduleId, domainId);
    setState(initial);
    if (initial.status !== 'loading' || !moduleId) return;
    const meta = getModule(moduleId)!;
    let cancelled = false;
    generateModuleContent(meta, domainId, learner)
      .then(({ content, source }) => {
        if (cancelled) return;
        if (source === 'gemini') writeCache(meta.id, domainId, content);
        setState({ status: 'ready', data: { meta, content, source } });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'ready', data: { meta, content: buildFallbackContent(meta, domainId), source: 'engine' } });
      });
    return () => {
      cancelled = true;
    };
    // learner text only shapes the prompt; regenerate when the module/domain changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, domainId, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { state, retry };
}
