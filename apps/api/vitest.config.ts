import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 60_000,
    testTimeout: 30_000,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/services/**', 'src/middleware/**', 'src/utils/**'],
      exclude: ['**/*.d.ts', '**/__tests__/**', 'src/seed.ts'],
      thresholds: { lines: 70, functions: 70 },
    },
  },
  resolve: {
    alias: {
      '@lumora/types': '../../packages/types/src/index.ts',
    },
  },
})
