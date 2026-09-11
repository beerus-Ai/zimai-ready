import type { AuthService, AuthUser, Backend, CollectionName, Database, WhereClause } from './types';

/**
 * Browser-storage implementation of the backend. Used for demo personas and
 * whenever Firebase is not configured. Data persists in localStorage.
 */

const NS = 'zimai:';
const SESSION_KEY = NS + 'session';

function readCollection(col: CollectionName): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(NS + 'col:' + col);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function writeCollection(col: CollectionName, data: Record<string, unknown>) {
  try {
    localStorage.setItem(NS + 'col:' + col, JSON.stringify(data));
  } catch (e) {
    console.warn('[ZimAI] localStorage write failed', e);
  }
}

const clone = <T>(v: T): T => (v == null ? v : JSON.parse(JSON.stringify(v)));

export const localDb: Database = {
  async get<T>(col: CollectionName, id: string) {
    const data = readCollection(col);
    return (data[id] as T) ? clone(data[id] as T) : null;
  },
  async set(col, id, value) {
    const data = readCollection(col);
    data[id] = clone(value);
    writeCollection(col, data);
  },
  async update(col, id, partial) {
    const data = readCollection(col);
    data[id] = { ...((data[id] as object) || {}), ...clone(partial) };
    writeCollection(col, data);
  },
  async remove(col, id) {
    const data = readCollection(col);
    delete data[id];
    writeCollection(col, data);
  },
  async query<T>(col: CollectionName, where: WhereClause[] = []) {
    const data = readCollection(col);
    return Object.values(data)
      .filter((doc) => where.every(([field, , value]) => (doc as Record<string, unknown>)[field] === value))
      .map((d) => clone(d as T));
  },
};

type Listener = (u: AuthUser | null) => void;
const listeners = new Set<Listener>();

function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeSession(u: AuthUser | null) {
  try {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(u));
}

const slug = (email: string) =>
  'local-' +
  email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const localAuth: AuthService = {
  supportsGoogle: false,
  current: readSession,
  onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  async signInWithGoogle() {
    throw new Error('Google sign-in is not configured yet. Use email or a demo profile.');
  },
  async signInLocal({ name, email }) {
    const u: AuthUser = { uid: slug(email), displayName: name.trim(), email: email.trim().toLowerCase(), provider: 'local' };
    writeSession(u);
    return u;
  },
  async signInDemo({ uid, name, email }) {
    const u: AuthUser = { uid, displayName: name, email, provider: 'demo' };
    writeSession(u);
    return u;
  },
  async signOut() {
    writeSession(null);
  },
};

export const localBackend: Backend = { kind: 'local', auth: localAuth, db: localDb };

/** Clears every locally stored collection and the session (used by "Reset demo data"). */
export function clearLocalData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(NS))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(null));
}
