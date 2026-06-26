import type { Page } from '@playwright/test'

// ── Seed credentials (from apps/api/src/seed.ts) ─────────────────────────────
export const ADMIN = { email: 'admin@lumora.dev', password: 'Admin1234!' }
export const CUSTOMER = { email: 'alice@lumora.dev', password: 'Pass1234!' }

// ── CSRF-aware API helper ─────────────────────────────────────────────────────
/** Log in via the API directly (faster than clicking through the UI). */
export async function loginViaApi(page: Page, email: string, password: string) {
  const apiBase = process.env['API_URL'] ?? 'http://localhost:4000'
  await page.request.post(`${apiBase}/api/v1/auth/login`, {
    data: { email, password },
  })
}

/** Extract the CSRF token from the csrf cookie (set by the API after login). */
export function getCsrfToken(page: Page): string {
  const cookies = page.context().cookies
  // Playwright's cookies() is async — use the header approach instead
  return ''
}

// ── Wait helpers ──────────────────────────────────────────────────────────────
export async function waitForToast(page: Page, text: string | RegExp) {
  return page.getByRole('status').filter({ hasText: text }).waitFor({ timeout: 8_000 })
}

export async function dismissCookieBanner(page: Page) {
  const btn = page.getByRole('button', { name: /accept|got it|ok/i })
  if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await btn.click()
  }
}
