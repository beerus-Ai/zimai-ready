import { useEffect, useMemo, useRef, useState } from 'react';
import type { DomainId, EmployeeProgress, ModuleProgress, PathItem } from '../../../types';
import { useApp } from '../../../services/store';
import { createProgressFromAssessment, emptyModuleProgress, recordActivity } from '../../../lib/progress';
import { describeLearner } from '../../../lib/aiContext';
import { getDomain, getModule, moduleTitle } from '../../../data/catalog';
import { nowISO, sleep } from '../../../lib/utils';

/**
 * Makes sure the learner has a progress record. If they have an assessment but no
 * progress yet, the personalised path is created from their Skills Prescription.
 */
export function useEnsureProgress() {
  const { user, profile, latestAssessment, progress, saveProgress } = useApp();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const canCreate = !!user && !!profile && !!latestAssessment;

  useEffect(() => {
    if (progress || !canCreate || started.current) return;
    started.current = true;
    (async () => {
      try {
        await sleep(1200); // let the learner see the path being built
        await saveProgress((prev) => prev ?? createProgressFromAssessment(user!.id, profile!, latestAssessment!));
      } catch (e) {
        console.warn('[ZimAI] could not create learning path', e);
        setError('We could not build your learning path. Please try again.');
        started.current = false;
      }
    })();
  }, [progress, canCreate, user, profile, latestAssessment, saveProgress]);

  return { progress, creating: !progress && canCreate && !error, canCreate, error };
}

/** The learner's effective learning domain. */
export function useLearnerDomain(): DomainId {
  const { progress, profile } = useApp();
  return (progress?.domainId ?? profile?.domainId ?? 'operations') as DomainId;
}

/** Prompt-ready learner description (memoised). */
export function useLearnerDescription(): string {
  const { profile, latestAssessment, progress } = useApp();
  return useMemo(() => describeLearner({ profile, assessment: latestAssessment, progress }), [profile, latestAssessment, progress]);
}

export const sortedPath = (p: EmployeeProgress | null | undefined): PathItem[] => [...(p?.path ?? [])].sort((a, b) => a.priority - b.priority);

export const moduleStatus = (p: EmployeeProgress | null | undefined, id: string) => p?.modules[id]?.status ?? 'not-started';

/** Next module in the path (after `afterId`, or overall) that is not completed. */
export function nextPathModule(p: EmployeeProgress | null | undefined, afterId?: string): PathItem | undefined {
  const items = sortedPath(p);
  const idx = afterId ? items.findIndex((i) => i.moduleId === afterId) : -1;
  const after = items.slice(idx + 1).find((i) => moduleStatus(p, i.moduleId) !== 'completed');
  return after ?? items.find((i) => i.moduleId !== afterId && moduleStatus(p, i.moduleId) !== 'completed');
}

/** Returns a copy of progress with the module entry updated (created if missing). Never writes undefined values. */
export function withModule(p: EmployeeProgress, moduleId: string, fn: (m: ModuleProgress) => ModuleProgress): EmployeeProgress {
  const current = p.modules[moduleId] ?? emptyModuleProgress(moduleId);
  const next = stripUndefined(fn({ ...current, lessonsCompleted: [...current.lessonsCompleted] }));
  return { ...p, modules: { ...p.modules, [moduleId]: next } };
}

export function stripUndefined<T extends object>(o: T): T {
  const out = { ...o } as Record<string, unknown>;
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out as T;
}

/** The advanced (optional) module of the learner's domain, when it is not already in the path. */
export function suggestedAdvancedModule(p: EmployeeProgress | null | undefined): string | undefined {
  if (!p) return undefined;
  const advanced = getDomain(p.domainId)?.moduleIds[2];
  if (!advanced || p.path.some((i) => i.moduleId === advanced)) return undefined;
  return advanced;
}

/** Adds a module to the path as an adaptive, optional recommendation. Pure. */
export function addModuleToPath(p: EmployeeProgress, moduleId: string, reason?: string): EmployeeProgress {
  if (p.path.some((i) => i.moduleId === moduleId)) return p;
  const meta = getModule(moduleId);
  const priority = Math.max(0, ...p.path.map((i) => i.priority)) + 1;
  const item: PathItem = {
    moduleId,
    priority,
    reason: reason ?? `Added by your adaptive path to stretch your ${getDomain(p.domainId)?.shortName ?? ''} skills once your core modules are in place.`.replace('  ', ' '),
    required: false,
    addedBy: 'adaptive',
    addedAt: nowISO(),
  };
  const next: EmployeeProgress = {
    ...p,
    path: [...p.path, item],
    modules: p.modules[moduleId] ? p.modules : { ...p.modules, [moduleId]: emptyModuleProgress(moduleId) },
  };
  return recordActivity(next, 'path', `Added to learning path: ${meta ? moduleTitle(meta, p.domainId) : moduleId}`);
}

export function formatMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

export const PACE_META: Record<EmployeeProgress['pace'], { label: string; description: string; tone: 'clay' | 'sky' | 'brand' }> = {
  supported: {
    label: 'Supported',
    description: 'We have slowed things down: extra explanations, practice questions and re-explanations tailored to your job, so every concept sticks before you move on.',
    tone: 'clay',
  },
  standard: {
    label: 'Standard',
    description: 'A balanced pace: short lessons, a quick check after each concept and practical tasks linked to your role.',
    tone: 'sky',
  },
  accelerated: {
    label: 'Accelerated',
    description: 'You are showing strong competency, so your path fast-tracks familiar ground and points you to advanced, stretch modules sooner.',
    tone: 'brand',
  },
};
