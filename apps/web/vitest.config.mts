import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/store/**', 'src/lib/**', 'src/components/**'],
      exclude: ['**/*.d.ts', '**/__tests__/**'],
      thresholds: { lines: 60, functions: 60 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lumora/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
})
