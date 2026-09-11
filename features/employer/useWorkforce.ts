import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../services/store';
import { COLLECTIONS } from '../../services/backend';
import type { Organisation, WorkforceMember } from '../../types';

/** In-memory cache so moving between employer pages does not flash a loader. */
const cache = new Map<string, WorkforceMember[]>();

export function invalidateWorkforce(orgId?: string) {
  if (orgId) cache.delete(orgId);
  else cache.clear();
}

export interface WorkforceState {
  organisation: Organisation | null;
  members: WorkforceMember[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/** Loads the workforce members of the signed-in employer's organisation. */
export function useWorkforce(): WorkforceState {
  const { db, organisation } = useApp();
  const orgId = organisation?.id;
  const [members, setMembers] = useState<WorkforceMember[]>(() => (orgId ? cache.get(orgId) ?? [] : []));
  const [loading, setLoading] = useState<boolean>(() => !!orgId && !cache.has(orgId));
  const [error, setError] = useState<string | null>(null);
  const reqRef = useRef(0);

  const reload = useCallback(async () => {
    const req = ++reqRef.current;
    if (!orgId) {
      setMembers([]);
      setLoading(false);
      return;
    }
    if (!cache.has(orgId)) setLoading(true);
    setError(null);
    try {
      const rows = await db.query<WorkforceMember>(COLLECTIONS.workforceMembers, [['organisationId', '==', orgId]]);
      rows.sort((a, b) => a.name.localeCompare(b.name));
      cache.set(orgId, rows);
      if (req === reqRef.current) setMembers(rows);
    } catch (e) {
      console.warn('[ZimAI] failed to load workforce', e);
      if (req === reqRef.current) setError('We could not load your workforce data. Check your connection and try again.');
    } finally {
      if (req === reqRef.current) setLoading(false);
    }
  }, [db, orgId]);

  useEffect(() => {
    setMembers(orgId ? cache.get(orgId) ?? [] : []);
    void reload();
  }, [reload, orgId]);

  return { organisation, members, loading, error, reload };
}
