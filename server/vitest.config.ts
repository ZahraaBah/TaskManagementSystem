import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: loadEnv('test', process.cwd(), ''),

    // Run test FILES sequentially to prevent workers from sharing
    // the same DB and truncating each other's data mid-test.
    fileParallelism: false,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/test/**',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
    testTimeout: 10000,
    alias: {
      '@': '/src',
    },
  },
});
