import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { clearLocalData, COLLECTIONS, initBackend, localBackend, localDb } from './backend';
import type { AuthUser, Backend, Database } from './backend';
import type {
  ActivitySubmission,
  AssessmentResult,
  Certificate,
  DemoKey,
  EmployeeProfile,
  EmployeeProgress,
  Organisation,
  ReadinessAssessment,
  User,
  UserRole,
} from '../types';
import { DEMO_PERSONAS, seedDemo } from '../data/demo/seed';
import { nowISO } from '../lib/utils';

/**
 * Global app state. Loads the signed-in user's bundle (profile, assessments,
 * progress, submissions, results, certificates, organisation) and exposes
 * write-through actions. Demo & email sessions persist locally; Google
 * sessions persist in Firestore when Firebase is configured.
 */

interface AppData {
  user: User | null;
  profile: EmployeeProfile | null;
  assessments: ReadinessAssessment[]; // oldest → newest
  progress: EmployeeProgress | null;
  submissions: ActivitySubmission[]; // newest first
  results: AssessmentResult[]; // newest first
  certificates: Certificate[]; // newest first
  organisation: Organisation | null;
}

const EMPTY: AppData = { user: null, profile: null, assessments: [], progress: null, submissions: [], results: [], certificates: [], organisation: null };

export interface AppContextValue extends AppData {
  ready: boolean;
  backendKind: 'local' | 'firebase';
  supportsGoogle: boolean;
  /** Database for the current session (demo/email → local, Google → Firestore). */
  db: Database;
  latestAssessment: ReadinessAssessment | null;
  initialAssessment: ReadinessAssessment | null;

  signInWithGoogle(role: UserRole): Promise<User>;
  signInLocal(input: { name: string; email: string; role: UserRole }): Promise<User>;
  signInDemo(key: DemoKey): Promise<User>;
  signOut(): Promise<void>;
  updateUser(partial: Partial<User>): Promise<void>;

  saveProfile(profile: EmployeeProfile): Promise<void>;
  addAssessment(a: ReadinessAssessment): Promise<void>;
  /** Accepts a full record or an updater (receives the latest stored progress). */
  saveProgress(next: EmployeeProgress | ((prev: EmployeeProgress | null) => EmployeeProgress)): Promise<EmployeeProgress>;
  addSubmission(s: ActivitySubmission): Promise<void>;
  addAssessmentResult(r: AssessmentResult): Promise<void>;
  addCertificate(c: Certificate): Promise<void>;
  saveOrganisation(o: Organisation): Promise<void>;

  /** Public lookups (certificate verification / shared skills profile) across local + Firestore. */
  lookupCertificate(id: string): Promise<Certificate | null>;
  lookupPublic<T>(collection: 'publicProfiles' | 'users' | 'employeeProfiles', id: string): Promise<T | null>;
  publishPublic(collection: 'publicProfiles', id: string, data: object): Promise<void>;

  refresh(): Promise<void>;
  /** Wipes local data and re-seeds the current demo persona. */
  resetDemo(): Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const byDateAsc = <T extends { createdAt: string }>(a: T, b: T) => a.createdAt.localeCompare(b.createdAt);
const byDateDesc = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

async function loadBundle(uid: string, db: Database): Promise<AppData> {
  const [user, profile, assessments, progress, submissions, results, certificates] = await Promise.all([
    db.get<User>(COLLECTIONS.users, uid),
    db.get<EmployeeProfile>(COLLECTIONS.employeeProfiles, uid),
    db.query<ReadinessAssessment>(COLLECTIONS.readinessAssessments, [['userId', '==', uid]]),
    db.get<EmployeeProgress>(COLLECTIONS.employeeProgress, uid),
    db.query<ActivitySubmission>(COLLECTIONS.activitySubmissions, [['userId', '==', uid]]),
    db.query<AssessmentResult>(COLLECTIONS.assessmentResults, [['userId', '==', uid]]),
    db.query<Certificate>(COLLECTIONS.certificates, [['userId', '==', uid]]),
  ]);
  let organisation: Organisation | null = null;
  if (user?.organisationId) {
    organisation = (await db.get<Organisation>(COLLECTIONS.organisations, user.organisationId)) ?? (await localDb.get<Organisation>(COLLECTIONS.organisations, user.organisationId));
  }
  return {
    user,
    profile,
    assessments: assessments.sort(byDateAsc),
    progress,
    submissions: submissions.sort(byDateDesc),
    results: results.sort(byDateDesc),
    certificates: certificates.sort((a, b) => b.issueDate.localeCompare(a.issueDate)),
    organisation,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [backend, setBackend] = useState<Backend>(localBackend);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AuthUser | null>(null);
  const [data, setData] = useState<AppData>(EMPTY);
  const dataRef = useRef<AppData>(EMPTY);
  dataRef.current = data;

  const dbFor = useCallback((au: AuthUser | null, b: Backend = backend) => (au?.provider === 'google' ? b.db : localDb), [backend]);
  const db = dbFor(session);

  const load = useCallback(
    async (au: AuthUser | null, b: Backend = backend) => {
      if (!au) {
        setData(EMPTY);
        return EMPTY;
      }
      const bundle = await loadBundle(au.uid, dbFor(au, b));
      setData(bundle);
      return bundle;
    },
    [backend, dbFor],
  );

  // Boot: initialise backend and restore any session (local session wins, e.g. a demo persona).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const b = await initBackend();
      if (cancelled) return;
      setBackend(b);
      const au = localBackend.auth.current() ?? (b.kind === 'firebase' ? b.auth.current() : null);
      setSession(au);
      try {
        await load(au, b);
      } catch (e) {
        console.warn('[ZimAI] failed to load session', e);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureUser = useCallback(async (au: AuthUser, role: UserRole, targetDb: Database, extra: Partial<User> = {}) => {
    const existing = await targetDb.get<User>(COLLECTIONS.users, au.uid);
    if (existing) return existing;
    const user: User = { id: au.uid, name: au.displayName, email: au.email, role, photoURL: au.photoURL, createdAt: nowISO(), ...extra };
    await targetDb.set(COLLECTIONS.users, au.uid, user);
    return user;
  }, []);

  const signInWithGoogle = useCallback(
    async (role: UserRole) => {
      const au = await backend.auth.signInWithGoogle();
      await localBackend.auth.signOut();
      const user = await ensureUser(au, role, backend.db);
      setSession(au);
      await load(au);
      return user;
    },
    [backend, ensureUser, load],
  );

  const signInLocal = useCallback(
    async ({ name, email, role }: { name: string; email: string; role: UserRole }) => {
      const au = await localBackend.auth.signInLocal({ name, email });
      const user = await ensureUser(au, role, localDb);
      setSession(au);
      await load(au);
      return user;
    },
    [ensureUser, load],
  );

  const signInDemo = useCallback(
    async (key: DemoKey) => {
      const persona = DEMO_PERSONAS[key];
      await seedDemo(key, localDb);
      const au = await localBackend.auth.signInDemo({ uid: persona.uid, name: persona.name, email: persona.email });
      setSession(au);
      const bundle = await load(au);
      return bundle.user!;
    },
    [load],
  );

  const signOut = useCallback(async () => {
    if (session?.provider === 'google') await backend.auth.signOut();
    await localBackend.auth.signOut();
    setSession(null);
    setData(EMPTY);
  }, [backend, session]);

  const updateUser = useCallback(
    async (partial: Partial<User>) => {
      const u = dataRef.current.user;
      if (!u) return;
      const next = { ...u, ...partial };
      await db.set(COLLECTIONS.users, u.id, next);
      setData((d) => ({ ...d, user: next }));
    },
    [db],
  );

  const saveProfile = useCallback(
    async (profile: EmployeeProfile) => {
      await db.set(COLLECTIONS.employeeProfiles, profile.userId, profile);
      setData((d) => ({ ...d, profile }));
    },
    [db],
  );

  const addAssessment = useCallback(
    async (a: ReadinessAssessment) => {
      await db.set(COLLECTIONS.readinessAssessments, a.id, a);
      setData((d) => ({ ...d, assessments: [...d.assessments.filter((x) => x.id !== a.id), a].sort(byDateAsc) }));
    },
    [db],
  );

  const saveProgress = useCallback(
    async (next: EmployeeProgress | ((prev: EmployeeProgress | null) => EmployeeProgress)) => {
      const value = typeof next === 'function' ? next(dataRef.current.progress) : next;
      const stamped = { ...value, updatedAt: nowISO() };
      dataRef.current = { ...dataRef.current, progress: stamped };
      setData((d) => ({ ...d, progress: stamped }));
      await db.set(COLLECTIONS.employeeProgress, stamped.userId, stamped);
      return stamped;
    },
    [db],
  );

  const addSubmission = useCallback(
    async (s: ActivitySubmission) => {
      await db.set(COLLECTIONS.activitySubmissions, s.id, s);
      setData((d) => ({ ...d, submissions: [s, ...d.submissions.filter((x) => x.id !== s.id)] }));
    },
    [db],
  );

  const addAssessmentResult = useCallback(
    async (r: AssessmentResult) => {
      await db.set(COLLECTIONS.assessmentResults, r.id, r);
      setData((d) => ({ ...d, results: [r, ...d.results.filter((x) => x.id !== r.id)] }));
    },
    [db],
  );

  const addCertificate = useCallback(
    async (c: Certificate) => {
      await db.set(COLLECTIONS.certificates, c.id, c);
      setData((d) => ({ ...d, certificates: [c, ...d.certificates.filter((x) => x.id !== c.id)] }));
    },
    [db],
  );

  const saveOrganisation = useCallback(
    async (o: Organisation) => {
      const stamped = { ...o, updatedAt: nowISO() };
      await db.set(COLLECTIONS.organisations, o.id, stamped);
      const u = dataRef.current.user;
      if (u && u.organisationId !== o.id) {
        const nextUser = { ...u, organisationId: o.id };
        await db.set(COLLECTIONS.users, u.id, nextUser);
        setData((d) => ({ ...d, user: nextUser, organisation: stamped }));
      } else setData((d) => ({ ...d, organisation: stamped }));
    },
    [db],
  );

  const lookupCertificate = useCallback(
    async (id: string) => {
      const clean = id.trim().toUpperCase();
      const local = await localDb.get<Certificate>(COLLECTIONS.certificates, clean);
      if (local) return local;
      if (backend.kind === 'firebase') {
        try {
          return await backend.db.get<Certificate>(COLLECTIONS.certificates, clean);
        } catch {
          return null;
        }
      }
      return null;
    },
    [backend],
  );

  const lookupPublic = useCallback(
    async <T,>(collection: 'publicProfiles' | 'users' | 'employeeProfiles', id: string) => {
      const local = await localDb.get<T>(collection, id);
      if (local) return local;
      if (backend.kind === 'firebase') {
        try {
          return await backend.db.get<T>(collection, id);
        } catch {
          return null;
        }
      }
      return null;
    },
    [backend],
  );

  const publishPublic = useCallback(
    async (collection: 'publicProfiles', id: string, value: object) => {
      await db.set(collection, id, value);
    },
    [db],
  );

  const refresh = useCallback(async () => {
    await load(session);
  }, [load, session]);

  const resetDemo = useCallback(async () => {
    const key = dataRef.current.user?.demoKey;
    clearLocalData();
    setSession(null);
    setData(EMPTY);
    if (key) await signInDemo(key);
  }, [signInDemo]);

  const value = useMemo<AppContextValue>(() => {
    const initialAssessment = data.assessments.find((a) => a.kind === 'initial') ?? data.assessments[0] ?? null;
    return {
      ...data,
      ready,
      backendKind: backend.kind,
      supportsGoogle: backend.auth.supportsGoogle,
      db,
      latestAssessment: data.assessments[data.assessments.length - 1] ?? null,
      initialAssessment,
      signInWithGoogle,
      signInLocal,
      signInDemo,
      signOut,
      updateUser,
      saveProfile,
      addAssessment,
      saveProgress,
      addSubmission,
      addAssessmentResult,
      addCertificate,
      saveOrganisation,
      lookupCertificate,
      lookupPublic,
      publishPublic,
      refresh,
      resetDemo,
    };
  }, [data, ready, backend, db, signInWithGoogle, signInLocal, signInDemo, signOut, updateUser, saveProfile, addAssessment, saveProgress, addSubmission, addAssessmentResult, addCertificate, saveOrganisation, lookupCertificate, lookupPublic, publishPublic, refresh, resetDemo]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
