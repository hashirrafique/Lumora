import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000'
const API_URL = process.env['API_URL'] ?? 'http://localhost:4000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // journeys share state (seed DB) — run serially
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'e2e/report' }], ['line']],

  use: {
    baseURL: BASE_URL,
    // Only keep cookies/storage within each test file
    storageState: undefined,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /responsive\.spec\.ts/,
    },
  ],

  // Boot API + Web when running locally (comment out in CI if servers are started externally)
  // webServer: [
  //   {
  //     command: 'cd apps/api && npm run dev',
  //     port: 4000,
  //     reuseExistingServer: true,
  //     env: { NODE_ENV: 'test' },
  //   },
  //   {
  //     command: 'cd apps/web && npm run dev',
  //     port: 3000,
  //     reuseExistingServer: true,
  //     env: { NEXT_PUBLIC_API_URL: `${API_URL}/api/v1` },
  //   },
  // ],
})
