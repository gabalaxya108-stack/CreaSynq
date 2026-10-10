import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createGroqMiddleware } from './server/groqMiddleware.js';

export default defineConfig(({ mode }) => {
  // Load environment variables on the server side (including non-VITE_ keys)
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GROQ_API_KEY) {
    process.env.GROQ_API_KEY = env.GROQ_API_KEY;
  }
  if (env.GROQ_MODEL) {
    process.env.GROQ_MODEL = env.GROQ_MODEL;
  }
  if (env.VITE_SUPABASE_URL) {
    process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL;
  }
  if (env.VITE_SUPABASE_ANON_KEY) {
    process.env.VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
  }

  return {
    plugins: [
      react(),
      {
        name: 'groq-api-server',
        configureServer(server) {
          server.middlewares.use(createGroqMiddleware());
        }
      }
    ],
    server: {
      port: 5173,
      open: false
    }
  };
});

