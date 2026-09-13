import type { PriorityState, ReadinessLevel, SkillLevel, WorkforceStatus } from '../types';

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

/** 0–25 AI Beginner · 26–50 Developing · 51–75 AI Capable · 76–100 AI Ready */
export function readinessLevel(score: number): ReadinessLevel {
  if (score <= 25) return 'AI Beginner';
  if (score <= 50) return 'Developing';
  if (score <= 75) return 'AI Capable';
  return 'AI Ready';
}

export function exposureLabel(score: number): string {
  if (score <= 25) return 'Low exposure';
  if (score <= 60) return 'Moderate exposure';
  if (score <= 80) return 'High exposure';
  return 'Very high exposure';
}

export function priorityState(readiness: number, exposure: number): PriorityState {
  const highExposure = exposure > 50;
  const highReadiness = readiness > 50;
  if (highExposure && !highReadiness) return 'Priority Upskilling Recommended';
  if (highExposure && highReadiness) return 'Well Positioned';
  if (!highExposure && highReadiness) return 'Future Ready';
  return 'Build Foundations';
}

export const PRIORITY_META: Record<PriorityState, { tone: 'warn' | 'good' | 'info' | 'neutral'; description: string }> = {
  'Priority Upskilling Recommended': {
    tone: 'warn',
    description: 'AI is already reshaping your work faster than your current AI skills. Focused upskilling now will keep you ahead.',
  },
  'Well Positioned': {
    tone: 'good',
    description: 'Your AI skills match the pace of change in your workplace. Deepen and certify your competency.',
  },
  'Future Ready': {
    tone: 'info',
    description: 'Your AI skills are ahead of your workplace. You are well placed to lead adoption when it arrives.',
  },
  'Build Foundations': {
    tone: 'neutral',
    description: 'AI change is still early in your role. Building foundations now gives you a head start.',
  },
};

/** Tailwind colour tokens per readiness level (used for chips, rings and bars). */
export const LEVEL_COLORS: Record<ReadinessLevel, { text: string; bg: string; ring: string; hex: string }> = {
  'AI Beginner': { text: 'text-clay-700', bg: 'bg-clay-50', ring: 'ring-clay-200', hex: '#f14e2e' },
  Developing: { text: 'text-gold-800', bg: 'bg-gold-50', ring: 'ring-gold-200', hex: '#ffa946' },
  'AI Capable': { text: 'text-lilac-700', bg: 'bg-lilac-50', ring: 'ring-lilac-200', hex: '#2f9f72' },
  'AI Ready': { text: 'text-brand-700', bg: 'bg-brand-50', ring: 'ring-brand-200', hex: '#034f46' },
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  0: 'Needs development',
  1: 'Developing',
  2: 'Competent',
  3: 'AI Ready',
};

export const SKILL_LEVEL_COLORS: Record<SkillLevel, { text: string; bg: string; dot: string; hex: string }> = {
  0: { text: 'text-clay-700', bg: 'bg-clay-50', dot: 'bg-clay-500', hex: '#ff6c4c' },
  1: { text: 'text-gold-800', bg: 'bg-gold-50', dot: 'bg-gold-500', hex: '#ffa946' },
  2: { text: 'text-lilac-700', bg: 'bg-lilac-50', dot: 'bg-lilac-500', hex: '#4fbf8e' },
  3: { text: 'text-brand-700', bg: 'bg-brand-50', dot: 'bg-brand-500', hex: '#1b8f78' },
};

export const WORKFORCE_STATUS_META: Record<WorkforceStatus, { label: string; hex: string; text: string; bg: string }> = {
  'ai-ready': { label: 'AI Ready', hex: '#1b8f78', text: 'text-brand-700', bg: 'bg-brand-50' },
  upskilling: { label: 'Currently Upskilling', hex: '#ffa946', text: 'text-gold-800', bg: 'bg-gold-50' },
  'priority-reskilling': { label: 'Priority Reskilling', hex: '#ff6c4c', text: 'text-clay-700', bg: 'bg-clay-50' },
};
