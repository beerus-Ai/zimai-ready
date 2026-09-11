# Google AI Studio — one-time hand-off prompt

Import this project into Google AI Studio (Build mode), then paste the prompt below **once**.
Everything else (UI, all four stages, Gemini integration, Google sign-in code, Firestore code,
security rules, demo mode) is already built — AI Studio only needs to connect services.

---

```
This is a complete, working React + TypeScript + Vite app called "ZimAI Ready". Do NOT redesign, restructure, rename or remove anything — every screen and feature is finished. Your job is only to connect services, in 4 small steps:

1. GEMINI: Gemini is already integrated in services/gemini.ts and reads the key from process.env.GEMINI_API_KEY / process.env.API_KEY. Just make sure the AI Studio Gemini key is injected. If "gemini-2.5-flash" is not available, change only the first entry of GEMINI_MODELS in config.ts to the current recommended Gemini Flash model.

2. FIREBASE: Enable the Firebase integration for this app (create/connect a Firebase project with Cloud Firestore and Firebase Authentication with the Google sign-in provider enabled). Then put the Firebase web config into services/backend/firebaseConfig.ts (fill the `firebaseConfig` object, or import your generated Firebase config file there; set `firestoreDatabaseId` if you created a named database). Do not write any other Firebase code — Google login, Firestore reads/writes and public certificate verification are already implemented in services/backend/firebaseBackend.ts and switch on automatically once the config is filled in.

3. SECURITY RULES: Deploy the Firestore rules exactly as provided in firestore.rules. Add the app's preview/deployed domain to Firebase Authentication → Settings → Authorised domains.

4. CHECK: Confirm "Continue with Google" appears on /#/login, a new Google user can complete the employee assessment and see results, and an employer can complete organisation onboarding. Demo profiles on /#/demo must keep working (they intentionally use browser storage). Keep all offline fallbacks.
```

---

## If something needs attention

| Symptom | Fix |
| --- | --- |
| "Continue with Google" not shown | `firebaseConfig.apiKey` / `projectId` still empty in `services/backend/firebaseConfig.ts`. |
| Google popup error `auth/unauthorized-domain` | Add the app domain in Firebase Auth → Authorised domains. |
| `permission-denied` in console | Deploy `firestore.rules`. |
| AI labelled "ZimAI engine" instead of "Gemini AI" | Gemini key missing or model unavailable — see step 1. The app keeps working with its built-in engine. |
