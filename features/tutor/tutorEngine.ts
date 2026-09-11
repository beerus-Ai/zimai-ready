import type { ChatMessage, DomainId, EmployeeProfile, EmployeeProgress, LessonBlock, ReadinessAssessment } from '../../types';
import { describeLearner } from '../../lib/aiContext';
import { getDomain, getModule, moduleTitle, resolveTargetDomain } from '../../data/catalog';
import { getRole, roleName } from '../../data/roles';
import { industryName } from '../../data/industries';
import { skillName } from '../../data/skills';
import { peekModuleContent } from '../learning/components/moduleContent';
import { seedFor } from '../learning/components/domainSeeds';

/**
 * AI Tutor engine: Gemini system prompt, suggested prompts, local persistence
 * and a rule-based offline tutor that answers from module content, the learner's
 * role and simple intent detection (and can pose + grade quiz questions).
 */

export interface TutorQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TutorState {
  messages: ChatMessage[];
  pendingQuiz: TutorQuiz | null;
  asked: number; // rotates offline quiz questions
}

export interface TutorContext {
  profile: EmployeeProfile | null;
  assessment: ReadinessAssessment | null;
  progress: EmployeeProgress | null;
  moduleId?: string;
  lessonTitle?: string;
  blockContext?: string;
}

// ───────────────────────── Persistence ─────────────────────────

export const tutorStorageKey = (userId: string, moduleId?: string) => `zimai:tutor:${userId}:${moduleId || 'general'}`;

const EMPTY_STATE: TutorState = { messages: [], pendingQuiz: null, asked: 0 };

export function loadTutorState(key: string): TutorState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as TutorState | ChatMessage[];
    if (Array.isArray(parsed)) return { ...EMPTY_STATE, messages: parsed };
    return { messages: Array.isArray(parsed.messages) ? parsed.messages : [], pendingQuiz: parsed.pendingQuiz ?? null, asked: parsed.asked ?? 0 };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveTutorState(key: string, state: TutorState) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...state, messages: state.messages.slice(-60) }));
  } catch {
    /* ignore quota errors */
  }
}

// ───────────────────────── Module knowledge ─────────────────────────

export function blockToText(block: LessonBlock | { type: 'field'; scenario: string; takeaway: string }): string {
  switch (block.type) {
    case 'explain':
      return `${block.title}: ${block.body}${block.bullets?.length ? ` Key points: ${block.bullets.join('; ')}` : ''}`;
    case 'example':
      return `Workplace example — ${block.title}: ${block.scenario} Takeaway: ${block.takeaway}`;
    case 'field':
      return `Example from the learner's field: ${block.scenario} Takeaway: ${block.takeaway}`;
    case 'ai-example':
      return `Personalised AI example — ${block.title}: ${block.fallback}`;
    case 'interactive':
      return `Interactive activity — ${block.title}: ${block.prompt} Options: ${block.options.map((o) => `${o.label}${o.correct ? ' (correct)' : ''}`).join(' | ')}`;
    case 'quiz':
      return `Quiz question: ${block.question} Options: ${block.options.join(' | ')}`;
    case 'task':
      return `Practical task — ${block.title}: ${block.instructions}`;
  }
}

interface ModuleKnowledge {
  title: string;
  summary: string;
  lessons: string[];
  explains: { title: string; body: string; bullets: string[] }[];
  examples: { scenario: string; takeaway: string }[];
  quizzes: TutorQuiz[];
  fieldExample?: { scenario: string; takeaway: string };
  skills: string[];
}

function knowledgeFor(moduleId: string | undefined, domainId: DomainId): ModuleKnowledge | null {
  if (!moduleId) return null;
  const meta = getModule(moduleId);
  if (!meta) return null;
  const content = peekModuleContent(moduleId, domainId);
  const blocks = content?.lessons.flatMap((l) => l.blocks) ?? [];
  return {
    title: moduleTitle(meta, domainId),
    summary: meta.summary,
    lessons: content?.lessons.map((l) => l.title) ?? [],
    explains: blocks.filter((b): b is Extract<LessonBlock, { type: 'explain' }> => b.type === 'explain').map((b) => ({ title: b.title, body: b.body, bullets: b.bullets ?? [] })),
    examples: blocks.filter((b): b is Extract<LessonBlock, { type: 'example' }> => b.type === 'example').map((b) => ({ scenario: b.scenario, takeaway: b.takeaway })),
    quizzes: blocks
      .filter((b): b is Extract<LessonBlock, { type: 'quiz' }> => b.type === 'quiz')
      .map((b) => ({ question: b.question, options: b.options, correctIndex: b.correctIndex, explanation: b.explanation })),
    fieldExample: content?.domainExamples?.[domainId],
    skills: meta.skillIds.map(skillName),
  };
}

const GENERAL_QUIZZES: TutorQuiz[] = [
  {
    question: 'An AI tool gives you a confident answer that includes a statistic you have not seen before. What should you do first?',
    options: ['Use it — it sounds confident', 'Verify it against a trusted source before using it', 'Ask the AI to repeat the answer', 'Delete the number and keep the rest'],
    correctIndex: 1,
    explanation: 'AI can "hallucinate" convincing facts and figures. Always verify against a trusted source before relying on them.',
  },
  {
    question: 'You want AI help with a document containing customer names and ID numbers. What is the responsible approach?',
    options: ['Paste it into a free chatbot', 'Anonymise the personal details and use an approved tool', 'Ask a colleague to paste it', 'Paste it at night when fewer people are online'],
    correctIndex: 1,
    explanation: 'Minimise and anonymise personal data, and only use tools your organisation has approved — Zimbabwe’s Cyber and Data Protection Act applies.',
  },
  {
    question: 'Which change most improves a prompt for a work task?',
    options: ['Adding "please" and "thank you"', 'Giving your role, the context, the output format and constraints', 'Writing it in capital letters', 'Keeping it to three words'],
    correctIndex: 1,
    explanation: 'Role, context, format and constraints give the AI what it needs to produce useful, work-ready output.',
  },
  {
    question: 'Who is accountable for a decision made with the help of AI?',
    options: ['The AI vendor', 'The AI tool itself', 'The professional who uses and approves the output', 'Nobody, if AI was used'],
    correctIndex: 2,
    explanation: 'AI supports decisions; people remain accountable. That is why human oversight matters.',
  },
];

// ───────────────────────── Gemini system prompt ─────────────────────────

const jobTitleOf = (p: EmployeeProfile | null) => p?.jobTitle?.trim() || (p ? roleName(p.roleId, p.roleOther) : 'professional');
const article = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function buildTutorSystem(ctx: TutorContext): string {
  const domainId = (ctx.progress?.domainId ?? ctx.profile?.domainId ?? 'operations') as DomainId;
  const k = knowledgeFor(ctx.moduleId, domainId);
  const job = jobTitleOf(ctx.profile);
  const industry = ctx.profile ? industryName(ctx.profile.industryId, ctx.profile.industryOther) : 'their industry';
  const tasks = getRole(ctx.profile?.roleId)?.aiImpactedTasks ?? [];
  const moduleBlock = k
    ? `Module: ${k.title}
Summary: ${k.summary}
Skills: ${k.skills.join(', ')}
Lessons: ${k.lessons.map((l, i) => `${i + 1}. ${l}`).join(' · ')}
Key concepts:
${k.explains
  .slice(0, 6)
  .map((e) => `- ${e.title}: ${clip(e.body, 240)}`)
  .join('\n')}${ctx.lessonTitle ? `\nCurrent lesson: ${ctx.lessonTitle}` : ''}${ctx.blockContext ? `\nWhat the learner is looking at right now: ${clip(ctx.blockContext, 700)}` : ''}`
    : `General AI tutoring (no specific module selected).${ctx.blockContext ? `\nContext: ${clip(ctx.blockContext, 900)}` : ''}`;

  return `You are the ZimAI Ready AI Tutor — a warm, expert workplace AI coach helping a working professional become AI-ready.

LEARNER PROFILE
${describeLearner({ profile: ctx.profile, assessment: ctx.assessment, progress: ctx.progress })}

CURRENT LEARNING CONTEXT
${moduleBlock}

HOW TO TUTOR
- Tailor EVERY answer to the learner's profession and industry (${job}, ${industry}). Use concrete examples from their daily work${tasks.length ? ` (e.g. ${tasks.slice(0, 3).join(', ').toLowerCase()})` : ''}. If they ask how to apply something in a specific field (e.g. "How can I actually use this in accounting?"), give examples specific to that field.
- Keep answers under 150 words unless the learner asks for more detail. Use short paragraphs or bullet points and **bold** the key idea.
- Give concrete, realistic workplace examples (fictional Zimbabwean organisations only).
- Where relevant, encourage verification of AI outputs and responsible use — privacy and confidentiality, bias and human oversight — without lecturing.
- When the learner asks you to "test my understanding": ask exactly ONE question about the current module (multiple choice with options A–D, or a short scenario question), then STOP and wait. When they reply, evaluate their answer: say clearly whether it is correct, explain why in 2–3 sentences and offer another question.
- If a question is outside the module, still help briefly and link it back to the learner's work.
- Never invent statistics or make claims about real organisations. If you are not sure, say so and suggest how to verify.`;
}

export function suggestedPrompts(ctx: TutorContext): string[] {
  const base = ['Explain this more simply', 'Give me an example from my job', 'Test my understanding', 'Show me how I would use this at work'];
  const job = jobTitleOf(ctx.profile);
  const meta = ctx.moduleId ? getModule(ctx.moduleId) : undefined;
  const extra: string[] = [];
  if (meta) {
    const skill = skillName(meta.skillIds[0]);
    extra.push(`What mistakes should I avoid with ${skill.toLowerCase()}?`);
    extra.push(meta.skillIds.some((s) => /privacy|responsible|bias/.test(s)) ? `How do I protect confidential data as ${article(job)} ${job}?` : 'How do I check the AI got it right?');
  } else {
    extra.push(`How is AI changing my role as ${article(job)} ${job}?`);
    extra.push('How do I write a better prompt?');
  }
  return [...base, ...extra];
}

// ───────────────────────── Offline tutor ─────────────────────────

type Intent = 'test' | 'simpler' | 'example' | 'atwork' | 'verify' | 'privacy' | 'bias' | 'prompt' | 'greet' | 'thanks' | 'general';

const INTENTS: [Intent, RegExp][] = [
  ['test', /test my|quiz me|question me|test me|check my understanding|ask me a question/],
  ['greet', /^(hi|hello|hey|mhoro|makadii|salibonani|good (morning|afternoon|evening))\b[\s!.,]*$/],
  ['thanks', /^(thanks|thank you|cheers|great|awesome|ok thanks|that helps)/],
  ['simpler', /simpl|easier|plain (english|terms)|eli5|don.?t understand|confus|lost|explain (this|it) (again|more)|what does .* mean/],
  ['example', /example|for instance|scenario|case study/],
  ['privacy', /privacy|confidential|personal data|data protection|sensitive|leak|secure|pii/],
  ['bias', /bias|fair|discriminat|inclusive/],
  ['verify', /verif|hallucin|accura|fact.?check|mistake|wrong|trust|check (the|if|that|it)|got it right/],
  ['prompt', /prompt|how (do|should) i ask|write .*better|instruction/],
  ['atwork', /at work|my job|my role|use (this|it)|apply|in practice|day.to.day|actually use|how (can|do|would|could) i|changing my/],
];

function detectIntent(message: string): Intent {
  const t = message.toLowerCase().trim();
  return INTENTS.find(([, re]) => re.test(t))?.[0] ?? 'general';
}

const firstSentences = (text: string, n: number) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return (t.match(/[^.!?]+[.!?]+/g) ?? [t])
    .slice(0, n)
    .map((s) => s.trim())
    .join(' ');
};

const PRIVACY_EXAMPLES: Record<DomainId, string> = {
  finance: 'never pasting client account numbers, payroll data or unpublished results into an unapproved tool',
  hr: 'never pasting CVs, ID numbers, medical notes or disciplinary records with names into an AI tool',
  marketing: 'never uploading customer phone lists or purchase histories without consent and an approved tool',
  software: 'never pasting API keys, credentials, production data or proprietary code into public AI assistants',
  'customer-service': 'never pasting customer ID numbers, account details or full complaint records into public chatbots',
  operations: 'never sharing supplier contracts, pricing or employee records with unapproved tools',
  management: 'never pasting board papers, salaries or confidential strategy into public AI tools',
  agriculture: 'never sharing farmers’ personal details, land records or loan information without consent',
  healthcare: 'never entering patient names, record numbers or clinical notes into anything but an approved, secure system',
  education: 'never pasting learners’ names, marks or personal circumstances into AI tools',
  'data-analytics': 'working with anonymised or aggregated data and never uploading customer-level records to public tools',
};

function parseAnswer(message: string, quiz: TutorQuiz): number | null {
  const t = message.trim().toLowerCase();
  const letter = t.match(/^\(?([a-d])\)?(?:[.):,\s]|$)/) ?? t.match(/\b(?:answer|option|it'?s|is|choose|pick)\s*:?\s*\(?([a-d])\)?\b/);
  if (letter) return 'abcd'.indexOf(letter[1]);
  const num = t.match(/^([1-4])(?:[.)\s]|$)/);
  if (num) return Number(num[1]) - 1;
  if (t.length >= 4) {
    const idx = quiz.options.findIndex((o) => {
      const ol = o.toLowerCase();
      return ol.includes(t) || t.includes(ol.slice(0, Math.min(ol.length, 24)));
    });
    if (idx >= 0) return idx;
  }
  return null;
}

function formatQuiz(q: TutorQuiz): string {
  return `**Quick check** — reply with A, B, C or D:\n\n${q.question}\n\n${q.options.map((o, i) => `- **${'ABCD'[i]}.** ${o}`).join('\n')}`;
}

function bestExplain(k: ModuleKnowledge | null, message: string) {
  if (!k?.explains.length) return null;
  const terms = new Set(
    message
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 3),
  );
  let best = k.explains[0];
  let bestScore = -1;
  for (const e of k.explains) {
    const hay = `${e.title} ${e.body} ${e.bullets.join(' ')}`.toLowerCase();
    const score = [...terms].filter((t) => hay.includes(t)).length;
    if (score > bestScore) {
      best = e;
      bestScore = score;
    }
  }
  return best;
}

export function offlineTutorReply(ctx: TutorContext, message: string, state: TutorState): { text: string; pendingQuiz: TutorQuiz | null; asked: number } {
  const learnerDomain = (ctx.progress?.domainId ?? ctx.profile?.domainId ?? 'operations') as DomainId;
  const k = knowledgeFor(ctx.moduleId, learnerDomain);
  const job = jobTitleOf(ctx.profile);
  const aJob = `${article(job)} ${job}`;
  const firstName = ctx.profile?.displayName?.split(' ')[0] ?? 'there';
  const tasks = getRole(ctx.profile?.roleId)?.aiImpactedTasks ?? ['Document drafting', 'Research', 'Reporting'];
  const mentioned = resolveTargetDomain(message);
  const domainId = mentioned ?? learnerDomain;
  const seed = seedFor(domainId);
  const field = getDomain(domainId)?.shortName ?? 'your';
  const shortTitle = k ? k.title.split(':')[0] : 'AI';
  let asked = state.asked;

  // 1 — answer to a pending quiz question
  if (state.pendingQuiz) {
    const q = state.pendingQuiz;
    const pick = parseAnswer(message, q);
    if (pick !== null) {
      const letter = 'ABCD'[q.correctIndex];
      const text =
        pick === q.correctIndex
          ? `✅ **Correct — ${letter}. ${q.options[q.correctIndex]}**\n\n${q.explanation}\n\nNice work. Want another question, or shall I show how this applies to your work as ${aJob}?`
          : `Not quite — you chose **${'ABCD'[pick] ?? '?'}**. The best answer is **${letter}. ${q.options[q.correctIndex]}**.\n\n${q.explanation}\n\n**Memory tip:** connect it to ${tasks[0].toLowerCase()} in your own job — what would go wrong if you skipped this step? Say "test my understanding" to try another.`;
      return { text, pendingQuiz: null, asked };
    }
    if (message.trim().split(/\s+/).length <= 3 && !/\?/.test(message)) {
      return { text: `Just reply with the letter of your answer — **A**, **B**, **C** or **D**.\n\n${formatQuiz(q)}`, pendingQuiz: q, asked };
    }
    // otherwise the learner moved on — fall through and answer normally
  }

  const intent = detectIntent(message);

  switch (intent) {
    case 'test': {
      const bank = k?.quizzes.length ? k.quizzes : GENERAL_QUIZZES;
      const q = bank[asked % bank.length];
      asked += 1;
      // shuffle options deterministically so repeats feel fresh
      const order = q.options.map((_, i) => i).sort((a, b) => ((a * 7 + asked) % 5) - ((b * 7 + asked) % 5));
      const shuffled: TutorQuiz = { ...q, options: order.map((i) => q.options[i]), correctIndex: order.indexOf(q.correctIndex) };
      return { text: formatQuiz(shuffled), pendingQuiz: shuffled, asked };
    }
    case 'greet':
      return {
        text: `Hi ${firstName}! I'm your AI Tutor${k ? ` for **${k.title}**` : ''}. I tailor explanations to your work as ${aJob}.\n\nAsk me anything — or try "Give me an example from my job" or "Test my understanding".`,
        pendingQuiz: null,
        asked,
      };
    case 'thanks':
      return { text: `You're welcome, ${firstName}! Want to keep going? I can test your understanding with a quick question or show how to use this at work.`, pendingQuiz: null, asked };
    case 'simpler': {
      const focus = ctx.blockContext ? ctx.blockContext.replace(/^[^:]{0,60}:\s*/, '') : k?.explains[0]?.body ?? k?.summary ?? 'AI tools predict useful text, numbers or suggestions from patterns in data. They are fast and helpful, but they can be wrong, so you check their work.';
      const key = k?.explains[0]?.bullets[0] ?? k?.examples[0]?.takeaway ?? 'AI assists — you verify and decide.';
      return {
        text: `**In plain terms:** ${firstSentences(focus, 2)}\n\n${seed.analogy}\n\n**The one thing to remember:** ${key}\n\nWould an example from your work as ${aJob} help?`,
        pendingQuiz: null,
        asked,
      };
    }
    case 'example': {
      const ex = (!mentioned || mentioned === learnerDomain ? k?.fieldExample ?? k?.examples[0] : undefined) ?? seed.example;
      return {
        text: `**An example from ${field === 'your' ? 'your' : field} work:**\n\n${ex.scenario}\n\n**Why it matters:** ${ex.takeaway}\n\n**Try it in your job:** next time you're working on ${tasks[0].toLowerCase()}, ask AI for a first draft — then check it against ${seed.source} before it goes anywhere.`,
        pendingQuiz: null,
        asked,
      };
    }
    case 'atwork': {
      const t1 = tasks[0];
      const t2 = tasks[1];
      const who = mentioned && mentioned !== learnerDomain ? `someone in ${getDomain(mentioned)?.name ?? 'that field'}` : aJob;
      return {
        text: `Here's how ${who} could apply **${shortTitle}** this week:\n\n1. **Pick one task:** ${mentioned && mentioned !== learnerDomain ? seed.task : `${t1.toLowerCase()}${t2 ? ` or ${t2.toLowerCase()}` : ''}`}.\n2. **Prompt with context:** give your role, the goal, the audience and the format. Remove names and confidential figures first.\n3. **Verify:** check facts, figures and claims against ${seed.source}.\n4. **Decide:** edit, approve or reject — you stay accountable.\n\n**Example prompt:** "You are an experienced ${job}. Using only the anonymised notes below, help me with ${seed.task}. Use bullet points and flag anything I should double-check."`,
        pendingQuiz: null,
        asked,
      };
    }
    case 'verify':
      return {
        text: `**A 4-point verification habit** before any AI output leaves your desk:\n\n1. **Facts & figures:** recalculate key numbers; check names, dates and references against ${seed.source}.\n2. **Sources:** ask where a claim comes from — then check that source yourself. AI can invent convincing references.\n3. **Fit:** does it match your organisation's policy, context and audience?\n4. **Sense-check:** would an experienced colleague agree? If something feels off, dig deeper.\n\nIn ${field === 'your' ? 'your' : field} work, the classic trap is ${seed.risk}.`,
        pendingQuiz: null,
        asked,
      };
    case 'privacy':
      return {
        text: `**Protecting data when you use AI:**\n\n- **Minimise:** share only what the task needs — remove names, ID and phone numbers, account details and confidential figures.\n- **Anonymise:** use placeholders such as "Client A" or "Branch 1".\n- **Use approved tools:** free public chatbots may store what you paste. Follow your organisation's AI policy.\n- **Know the law:** Zimbabwe's Cyber and Data Protection Act requires personal data to be handled lawfully and securely.\n\nFor ${aJob}, that means ${PRIVACY_EXAMPLES[domainId]}.`,
        pendingQuiz: null,
        asked,
      };
    case 'bias':
      return {
        text: `**Spotting bias in AI outputs:**\n\n- AI learns from historical data, so it can repeat past unfairness — favouring certain groups, locations or backgrounds.\n- **Check patterns:** who is ranked low or left out, and is there a genuine, work-related reason?\n- **Test it:** change a name, gender or location in your prompt and see whether the answer changes.\n- **Keep people accountable:** AI can inform decisions about people; it should never make them alone.\n\nAs ${aJob}, ask: would this output treat every customer, colleague or community fairly?`,
        pendingQuiz: null,
        asked,
      };
    case 'prompt':
      return {
        text: `**A reliable prompt formula — Role · Context · Task · Format · Checks:**\n\n> "You are an experienced ${job}. Context: [anonymised background]. Task: help me with ${seed.task}. Format: five bullet points in plain British English. Checks: flag any assumption or figure I should verify."\n\nThen iterate — ask it to shorten, change the tone or explain its reasoning. And never paste confidential data into an unapproved tool.`,
        pendingQuiz: null,
        asked,
      };
    default: {
      const e = bestExplain(k, message);
      if (e) {
        return {
          text: `**${e.title}:** ${e.body}${e.bullets.length ? `\n\n${e.bullets.slice(0, 3).map((b) => `- ${b}`).join('\n')}` : ''}\n\n**For you as ${aJob}:** think about ${tasks[0].toLowerCase()} — use AI for the first draft, then check it against ${seed.source}.\n\nWant a simpler explanation, an example from your job, or a quick question to test yourself?`,
          pendingQuiz: null,
          asked,
        };
      }
      return {
        text: `Good question. In your work as ${aJob}, AI is already changing tasks like **${tasks.slice(0, 3).join(', ').toLowerCase()}**. The pattern that works:\n\n- Let AI do the first draft or analysis\n- **Verify** it against ${seed.source}\n- Protect confidential data and keep the final decision yours\n\nI can explain a concept, give an example from your job, or test your understanding — just ask.`,
        pendingQuiz: null,
        asked,
      };
    }
  }
}
