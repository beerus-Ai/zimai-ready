/**
 * Backend abstraction. The app talks ONLY to this interface, so storage can be
 * swapped between the browser (localBackend) and Firebase (firebaseBackend)
 * without touching any feature code. The API deliberately mirrors Firestore.
 */

export const COLLECTIONS = {
  users: 'users',
  employeeProfiles: 'employeeProfiles', // doc id = userId
  readinessAssessments: 'readinessAssessments',
  employeeProgress: 'employeeProgress', // doc id = userId
  activitySubmissions: 'activitySubmissions',
  assessmentResults: 'assessmentResults',
  certificates: 'certificates', // doc id = certificate id (publicly readable for verification)
  organisations: 'organisations',
  workforceMembers: 'workforceMembers',
  publicProfiles: 'publicProfiles', // doc id = userId (shareable AI Skills Profile)
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: 'google' | 'local' | 'demo';
}

export type WhereClause = [field: string, op: '==', value: string | number | boolean];

export interface Database {
  get<T>(collection: CollectionName, id: string): Promise<T | null>;
  set<T extends object>(collection: CollectionName, id: string, data: T): Promise<void>;
  update<T extends object>(collection: CollectionName, id: string, partial: Partial<T>): Promise<void>;
  remove(collection: CollectionName, id: string): Promise<void>;
  query<T>(collection: CollectionName, where?: WhereClause[]): Promise<T[]>;
}

export interface AuthService {
  /** True when Google sign-in is available (Firebase configured). */
  supportsGoogle: boolean;
  current(): AuthUser | null;
  onChange(cb: (user: AuthUser | null) => void): () => void;
  signInWithGoogle(): Promise<AuthUser>;
  /** Email-only prototype sign-up/sign-in (no password) — local mode only. */
  signInLocal(input: { name: string; email: string }): Promise<AuthUser>;
  /** Demo personas. Always local. */
  signInDemo(input: { uid: string; name: string; email: string }): Promise<AuthUser>;
  signOut(): Promise<void>;
}

export interface Backend {
  kind: 'local' | 'firebase';
  auth: AuthService;
  db: Database;
}
