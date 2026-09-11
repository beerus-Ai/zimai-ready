import type { AuthService, AuthUser, Backend, CollectionName, Database, WhereClause } from './types';
import { firebaseConfig, firestoreDatabaseId } from './firebaseConfig';

/**
 * Firebase implementation (Auth with Google + Cloud Firestore).
 * Loaded lazily only when firebaseConfig is filled in, so the app has zero
 * Firebase overhead in local/demo mode.
 */
export async function createFirebaseBackend(): Promise<Backend> {
  const [{ initializeApp, getApps }, authMod, fsMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  const { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } = authMod;
  const { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } = fsMod;

  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

  // Firestore rejects `undefined` values — strip them.
  const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

  const toAuthUser = (u: import('firebase/auth').User | null): AuthUser | null =>
    u
      ? {
          uid: u.uid,
          displayName: u.displayName || u.email?.split('@')[0] || 'ZimAI user',
          email: u.email || '',
          photoURL: u.photoURL || undefined,
          provider: 'google',
        }
      : null;

  let current: AuthUser | null = toAuthUser(auth.currentUser);
  // Resolve once Firebase has restored any persisted session.
  await new Promise<void>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      current = toAuthUser(u);
      unsub();
      resolve();
    });
  });

  const authService: AuthService = {
    supportsGoogle: true,
    current: () => current,
    onChange(cb) {
      return onAuthStateChanged(auth, (u) => {
        current = toAuthUser(u);
        cb(current);
      });
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      current = toAuthUser(cred.user);
      return current!;
    },
    async signInLocal() {
      throw new Error('Please continue with Google.');
    },
    async signInDemo() {
      throw new Error('Demo personas run on the local backend.');
    },
    async signOut() {
      await signOut(auth);
      current = null;
    },
  };

  const db: Database = {
    async get<T>(col: CollectionName, id: string) {
      const snap = await getDoc(doc(firestore, col, id));
      return snap.exists() ? (snap.data() as T) : null;
    },
    async set(col, id, data) {
      await setDoc(doc(firestore, col, id), clean(data));
    },
    async update(col, id, partial) {
      await updateDoc(doc(firestore, col, id), clean(partial) as Record<string, unknown>);
    },
    async remove(col, id) {
      await deleteDoc(doc(firestore, col, id));
    },
    async query<T>(col: CollectionName, clauses: WhereClause[] = []) {
      const ref = collection(firestore, col);
      const q = clauses.length ? query(ref, ...clauses.map(([f, op, v]) => where(f, op, v))) : ref;
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as T);
    },
  };

  return { kind: 'firebase', auth: authService, db };
}
