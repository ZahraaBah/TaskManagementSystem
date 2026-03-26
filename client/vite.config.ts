import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config séparée selon l'environnement
export default defineConfig(({ command }) => ({
  plugins: [react()],
  ...(command === 'serve' && {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }),
}));