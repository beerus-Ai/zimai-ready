# Google AI Studio — one-time hand-off prompt

Everything (UI, all four stages, Gemini integration, Google sign-in code, Firestore code,
security rules, demo mode) is already built and the project typechecks and builds cleanly.
AI Studio only needs to **connect services** — it must not redesign or rewrite anything.

There are two ways in. Use **A** if AI Studio offers a GitHub import; otherwise use **B**.

---

## A — Import from GitHub (preferred)

Repository: <https://github.com/beerus-Ai/zimai-ready> — branch `main`, public, source-only.

Paste this prompt **once** into AI Studio (Build mode):

```
Import the code from this public GitHub repository and use it as the complete
source for this app:

https://github.com/beerus-Ai/zimai-ready   (branch: main)

This is a FINISHED React 19 + TypeScript + Vite app called "ZimAI Ready" — an AI
workforce readiness, reskilling and certification platform for Zimbabwean
employees and employers. Every screen and all four stages (Readiness Assessment,
Learning Path, Certification, Employer Workforce Analytics) are already built and
the project typechecks and builds cleanly.

DO NOT redesign, restructure, rename, rewrite or remove anything. Do not
regenerate components or "improve" the UI. Your only job is to connect services,
in 4 small steps:

1. GEMINI — Gemini is already wired up in services/gemini.ts, which reads the key
   from process.env.GEMINI_API_KEY / process.env.API_KEY (injected via the
   `define` block in vite.config.ts). Just ensure the AI Studio Gemini key is
   injected. The model list is GEMINI_MODELS in config.ts
   ('gemini-2.5-flash' -> 'gemini-flash-latest' -> 'gemini-2.0-flash') and it falls
   back automatically. If the first model is unavailable, change ONLY that first
   array entry to the current recommended Gemini Flash model. Change nothing else.

2. FIREBASE — Enable the Firebase integration: create/connect a Firebase project
   with Cloud Firestore and Firebase Authentication with the Google sign-in
   provider enabled. Then paste the Firebase web config into
   services/backend/firebaseConfig.ts (fill the `firebaseConfig` object; set
   `firestoreDatabaseId` only if you created a named database). Write NO other
   Firebase code — Google login, Firestore reads/writes and public certificate
   verification are already implemented in services/backend/firebaseBackend.ts
   and switch on automatically via isFirebaseConfigured() once the config is
   filled in.

3. SECURITY RULES — Deploy the Firestore rules exactly as provided in
   firestore.rules, unmodified. Then add the app's preview/deployed domain under
   Firebase Authentication -> Settings -> Authorised domains.

4. VERIFY — Confirm that:
   • "Continue with Google" appears on /#/login
   • a new Google user can complete the employee readiness assessment and see results
   • an employer can complete organisation onboarding
   • demo profiles on /#/demo still work (they intentionally use browser storage)
   • AI responses are labelled "Gemini AI", not "ZimAI engine"

Keep every offline fallback intact — the app must continue to work end-to-end
even when Gemini or Firebase is unavailable. Report back what you changed,
file by file.
```

---

## B — Upload the project zip

If GitHub import is not available, upload `zimai-ready-ai-studio.zip` (build it from a clean
checkout; it is git-ignored and not in the repo) and paste the same prompt above **without**
its first paragraph and repository line.

---

## Expected on first run

`services/backend/firebaseConfig.ts` ships **empty on purpose**. Until step 2 is done the app
runs entirely on browser storage and "Continue with Google" will not appear. This is not a bug —
do not let AI Studio "fix" it by rewriting the auth layer.

## If something needs attention

| Symptom | Fix |
| --- | --- |
| "Continue with Google" not shown | `firebaseConfig.apiKey` / `projectId` still empty in `services/backend/firebaseConfig.ts`. |
| Google popup error `auth/unauthorized-domain` | Add the app domain in Firebase Auth → Authorised domains. |
| `permission-denied` in console | Deploy `firestore.rules`. |
| AI labelled "ZimAI engine" instead of "Gemini AI" | Gemini key missing or model unavailable — see step 1. The app keeps working with its built-in engine. |
