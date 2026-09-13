/**
 * Firebase web configuration.
 *
 * ── GOOGLE AI STUDIO / FIREBASE HOOK-UP ─────────────────────────────────────
 * Paste the Firebase web app config below (Firebase console → Project settings
 * → Your apps → Web app → SDK setup and configuration → Config).
 * As soon as `apiKey` and `projectId` are filled in, the app automatically:
 *   • enables "Continue with Google" sign-in (Firebase Auth), and
 *   • stores real users' data in Cloud Firestore (see firestore.rules).
 * Leave it empty to run fully in the browser (localStorage) — demo personas
 * always run locally either way.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyAMFRr8q5_Ke2EpK2XjtNpF3iITDo8kEvQ',
  authDomain: 'gen-lang-client-0914689610.firebaseapp.com',
  projectId: 'gen-lang-client-0914689610',
  storageBucket: 'gen-lang-client-0914689610.firebasestorage.app',
  messagingSenderId: '189820158178',
  appId: '1:189820158178:web:c5abec3faa740324161ebb',
};

/** Optional: a named Firestore database id. Leave '' for the (default) database. */
export const firestoreDatabaseId = '';

export const isFirebaseConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
