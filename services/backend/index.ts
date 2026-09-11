import type { Backend } from './types';
import { localBackend } from './localBackend';
import { isFirebaseConfigured } from './firebaseConfig';

export * from './types';
export { localBackend, localDb, clearLocalData } from './localBackend';

let remote: Backend | null = null;
let initPromise: Promise<Backend> | null = null;

/**
 * Returns the primary backend: Firebase when configured, otherwise local.
 * Falls back to local storage if Firebase fails to initialise.
 */
export function initBackend(): Promise<Backend> {
  if (!initPromise) {
    initPromise = (async () => {
      if (!isFirebaseConfigured()) return localBackend;
      try {
        const { createFirebaseBackend } = await import('./firebaseBackend');
        remote = await createFirebaseBackend();
        return remote;
      } catch (e) {
        console.warn('[ZimAI] Firebase unavailable — using local storage.', e);
        return localBackend;
      }
    })();
  }
  return initPromise;
}

export const getRemoteBackend = () => remote;
