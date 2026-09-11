import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Matches the Google AI Studio app template: the Gemini key is read from
// GEMINI_API_KEY (in .env.local locally, or injected by AI Studio) and exposed
// to the client as process.env.API_KEY / process.env.GEMINI_API_KEY.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const key = env.GEMINI_API_KEY || env.API_KEY || '';
  return {
    server: { port: 3000, host: '0.0.0.0' },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(key),
      'process.env.GEMINI_API_KEY': JSON.stringify(key),
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
    },
  };
});
