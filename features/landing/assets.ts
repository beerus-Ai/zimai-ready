/// <reference types="vite/client" />

/** Public photo URL (served from `public/images/`), respecting Vite's base path. */
export const img = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

/** Inline animation-delay helper for staggered ghost motion. */
export const delay = (ms: number) => ({ animationDelay: `${ms}ms` });
