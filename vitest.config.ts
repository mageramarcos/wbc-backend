import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
    environment: 'node',
    coverage: {
      reporter: ['text', 'lcov', 'cobertura'],
      enabled: true,
    },
  },
});
