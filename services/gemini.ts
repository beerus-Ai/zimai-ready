import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import { useSyncExternalStore } from 'react';
import { GEMINI_MODELS, GEMINI_TIMEOUT_MS } from '../config';
import type { AISource, ChatMessage } from '../types';

/**
 * Single entry point for every Gemini call in the app.
 *
 * Every helper takes a `fallback` so the product keeps working when Gemini is
 * not configured, times out, rate-limits or returns malformed output. The
 * result always reports `source` ('gemini' | 'engine') so the UI can label it.
 *
 * Usage:
 *   const { data, source } = await generateJSON<MyShape>({
 *     prompt, system, schema: { type: Type.OBJECT, properties: {...}, required: [...] },
 *     fallback: () => deterministicResult,
 *     normalize: (raw) => isValid(raw) ? repair(raw) : null,
 *   });
 */

export { Type };
export type { Schema };

export interface AIResult<T> {
  data: T;
  source: AISource;
  error?: string; // friendly reason when the fallback was used
}

/** Shared guardrails appended to every system instruction. */
export const AI_GUARDRAILS = `You are part of ZimAI Ready, an AI workforce readiness, reskilling and certification platform for professionals in Zimbabwe.
- Use British English spelling. Be concise, specific, practical and encouraging. No filler.
- Never state that AI will definitely eliminate someone's job. Use responsible language: "AI exposure", "role transformation", "augmentation", "skills transition".
- Ground examples in realistic Zimbabwean workplace contexts (e.g. USD/ZiG pricing, mobile money, load-shedding, agriculture seasons, mining operations, banking compliance) but use FICTIONAL organisations and people only. Never make claims about specific real Zimbabwean companies.
- Promote responsible AI: privacy, confidentiality, verification of outputs, bias awareness and human oversight.
- Never ask for or repeat sensitive personal data.`;

// ───────────────────────── API key & client ─────────────────────────

const USER_KEY_STORAGE = 'zimai:geminiKey';

function envKey(): string {
  try {
    // Replaced at build time by Vite `define`, injected by Google AI Studio at runtime.
    return (process.env.GEMINI_API_KEY || process.env.API_KEY || '') as string;
  } catch {
    return '';
  }
}

function storedKey(): string {
  try {
    return localStorage.getItem(USER_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export const getApiKey = () => envKey() || storedKey();
export const hasEnvApiKey = () => Boolean(envKey());
export const isGeminiAvailable = () => Boolean(getApiKey());

let client: GoogleGenAI | null = null;
let clientKey = '';

function getClient(): GoogleGenAI | null {
  const key = getApiKey();
  if (!key) return null;
  if (!client || clientKey !== key) {
    client = new GoogleGenAI({ apiKey: key });
    clientKey = key;
  }
  return client;
}

/** Lets a presenter paste a key at runtime (Settings) when none is injected. */
export function setUserApiKey(key: string) {
  try {
    if (key.trim()) localStorage.setItem(USER_KEY_STORAGE, key.trim());
    else localStorage.removeItem(USER_KEY_STORAGE);
  } catch {
    /* ignore */
  }
  client = null;
  setStatus(isGeminiAvailable() ? 'ready' : 'offline');
}

// ───────────────────────── Status (for the UI indicator) ─────────────────────────

/** ready = key present, not yet called · connected = last call OK · degraded = last call failed · offline = no key */
export type AIStatus = 'ready' | 'connected' | 'degraded' | 'offline';

let status: AIStatus = isGeminiAvailable() ? 'ready' : 'offline';
let activeModel: string | null = null;
const statusListeners = new Set<() => void>();

function setStatus(s: AIStatus) {
  if (s === status) return;
  status = s;
  statusListeners.forEach((l) => l());
}

export function useAIStatus(): AIStatus {
  return useSyncExternalStore(
    (cb) => {
      statusListeners.add(cb);
      return () => statusListeners.delete(cb);
    },
    () => status,
  );
}

export const getActiveModel = () => activeModel;

// ───────────────────────── Core call ─────────────────────────

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

const isModelUnavailable = (e: unknown) =>
  /not found|404|not supported|is not available|deprecated|no longer available/i.test(String((e as Error)?.message ?? e));

export function friendlyError(e: unknown): string {
  const msg = String((e as Error)?.message ?? e);
  if (/api key|API_KEY|permission|401|403/i.test(msg)) return 'Gemini could not authenticate. Showing built-in analysis instead.';
  if (/429|quota|rate/i.test(msg)) return 'Gemini is busy (rate limit). Showing built-in analysis instead.';
  if (/timed out/i.test(msg)) return 'Gemini took too long to respond. Showing built-in analysis instead.';
  if (/fetch|network|Failed to/i.test(msg)) return 'Network issue reaching Gemini. Showing built-in analysis instead.';
  return 'Gemini is temporarily unavailable. Showing built-in analysis instead.';
}

type Contents = string | { role: 'user' | 'model'; parts: { text: string }[] }[];

async function callGemini(contents: Contents, config: Record<string, unknown>): Promise<string> {
  const ai = getClient();
  if (!ai) throw new Error('Gemini API key not configured');
  const order = activeModel ? [activeModel, ...GEMINI_MODELS.filter((m) => m !== activeModel)] : GEMINI_MODELS;
  let lastErr: unknown = null;
  for (const model of order) {
    try {
      const res = await withTimeout(ai.models.generateContent({ model, contents, config }), GEMINI_TIMEOUT_MS);
      const text = res.text ?? '';
      if (!text.trim()) throw new Error('Empty response from Gemini');
      activeModel = model;
      setStatus('connected');
      return text;
    } catch (e) {
      lastErr = e;
      if (!isModelUnavailable(e)) break; // only try the next model when this one is missing
    }
  }
  setStatus('degraded');
  throw lastErr ?? new Error('Gemini call failed');
}

const system = (s?: string) => (s ? `${s}\n\n${AI_GUARDRAILS}` : AI_GUARDRAILS);

export function parseJSONLoose(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('Gemini returned invalid JSON');
  }
}

// ───────────────────────── Public helpers ─────────────────────────

export async function generateJSON<T>(opts: {
  prompt: string;
  system?: string;
  schema?: Schema;
  temperature?: number;
  fallback: () => T | Promise<T>;
  /** Validate/repair the raw object. Return null to reject it and use the fallback. */
  normalize?: (raw: unknown) => T | null;
}): Promise<AIResult<T>> {
  if (!isGeminiAvailable()) return { data: await opts.fallback(), source: 'engine' };
  try {
    const text = await callGemini(opts.prompt, {
      systemInstruction: system(opts.system),
      responseMimeType: 'application/json',
      ...(opts.schema ? { responseSchema: opts.schema } : {}),
      temperature: opts.temperature ?? 0.5,
    });
    const raw = parseJSONLoose(text);
    const data = opts.normalize ? opts.normalize(raw) : (raw as T);
    if (data == null) throw new Error('Gemini response failed validation');
    return { data, source: 'gemini' };
  } catch (e) {
    console.warn('[ZimAI] Gemini JSON fallback:', e);
    return { data: await opts.fallback(), source: 'engine', error: friendlyError(e) };
  }
}

export async function generateText(opts: {
  prompt: string;
  system?: string;
  temperature?: number;
  fallback: () => string | Promise<string>;
}): Promise<AIResult<string>> {
  if (!isGeminiAvailable()) return { data: await opts.fallback(), source: 'engine' };
  try {
    const text = await callGemini(opts.prompt, {
      systemInstruction: system(opts.system),
      temperature: opts.temperature ?? 0.7,
    });
    return { data: text.trim(), source: 'gemini' };
  } catch (e) {
    console.warn('[ZimAI] Gemini text fallback:', e);
    return { data: await opts.fallback(), source: 'engine', error: friendlyError(e) };
  }
}

/** Multi-turn chat. `history` excludes the new message. Only the last 12 turns are sent. */
export async function chat(opts: {
  system: string;
  history: ChatMessage[];
  message: string;
  temperature?: number;
  fallback: () => string | Promise<string>;
}): Promise<AIResult<string>> {
  if (!isGeminiAvailable()) return { data: await opts.fallback(), source: 'engine' };
  try {
    const contents = [
      ...opts.history.slice(-12).map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      { role: 'user' as const, parts: [{ text: opts.message }] },
    ];
    const text = await callGemini(contents, {
      systemInstruction: system(opts.system),
      temperature: opts.temperature ?? 0.7,
    });
    return { data: text.trim(), source: 'gemini' };
  } catch (e) {
    console.warn('[ZimAI] Gemini chat fallback:', e);
    return { data: await opts.fallback(), source: 'engine', error: friendlyError(e) };
  }
}
