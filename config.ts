/** App-wide configuration. */
export const APP = {
  name: 'ZimAI Ready',
  tagline: 'Prepare for the Future of Work.',
  statement: 'Discover where you stand, learn what matters, and become AI Ready in your profession.',
  certificatePrefix: 'ZAR',
  certificateValidityMonths: 12,
};

/**
 * Gemini models tried in order. If the first model is unavailable (404 /
 * deprecated) the wrapper automatically falls back to the next one.
 */
export const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

/** Request timeout for any single Gemini call. */
export const GEMINI_TIMEOUT_MS = 35000;

/** Certification rules (Stage 3). Watching content never certifies anyone on its own. */
export const CERT_RULES = {
  knowledgePassMark: 70, // final knowledge assessment
  capstonePassMark: 70, // practical capstone
  responsibleAIPassMark: 70, // responsible AI dimension (knowledge + capstone)
  minPracticalActivities: 2, // practical workplace activities completed during learning
  capableKnowledgeMark: 60, // AI Capable threshold
  awareKnowledgeMark: 50, // AI Aware threshold
};
