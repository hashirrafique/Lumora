/**
 * Journey 1 — Guest shops → buys
 *
 * Prerequisite: seed data loaded (admin@lumora.dev / Admin1234!, products in DB).
 *
 * Flow:
 *   home → catalog → filter → product → add to cart →
 *   register at checkout → fill card → place order →
 *   order confirmation → order visible in history
 */
import { test, expect } from '@playwright/test'

// Unique email per run so registration always succeeds
const TEST_EMAIL = `e2e-buyer-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestE2E1!'
const TEST_NAME = 'E2E Buyer'

// Valid Luhn test card (Visa)
const CARD = { number: '4532015112830366', exp: '12/30', cvc: '123', name: TEST_NAME }

test.describe('Journey 1: Guest shops → buys', () => {
  test('complete purchase flow', async ({ page }) => {
    // ── 1. Home page ─────────────────────────────────────────────────────────
    await page.goto('/')
    await expect(page).toHaveTitle(/LUMORA/i)

    // Navigate to shop via the nav link
    await page.getByRole('link', { name: /^shop$/i }).first().click()
    await expect(page).toHaveURL(/\/shop/)
    await page.waitForLoadState('networkidle')

    // ── 2. Catalog — filter by category ──────────────────────────────────────
    // The catalog should show product cards
    const productCards = page.locator('[data-testid="product-card"]').or(
      page.locator('a[href*="/product/"]').first().locator('..')
    )
    await expect(productCards.first()).toBeVisible({ timeout: 10_000 })

    // Apply an "in stock" filter
    const inStockToggle = page.getByLabel(/in stock/i)
    if (await inStockToggle.isVisible()) {
      await inStockToggle.check()
      await page.waitForLoadState('networkidle')
      // URL should reflect the filter
      await expect(page).toHaveURL(/inStock=true/)
    }

    // ── 3. Open a product page ────────────────────────────────────────────────
    const firstProductLink = page.locator('a[href*="/product/"]').first()
    await firstProductLink.click()
    await expect(page).toHaveURL(/\/product\//)
    await page.waitForLoadState('networkidle')

    // Product title and Add to Cart button should be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i })
    await expect(addToCartBtn).toBeVisible()

    // ── 4. Add to cart ────────────────────────────────────────────────────────
    await addToCartBtn.click()

    // Expect cart indicator to update (badge count > 0)
    const cartBadge = page.locator('[aria-label*="cart"]').or(
      page.getByRole('link', { name: /cart/i })
    ).first()
    await expect(cartBadge).toBeVisible({ timeout: 5_000 })

    // ── 5. Go to cart ─────────────────────────────────────────────────────────
    await page.goto('/cart')
    await expect(page.getByText(/proceed to checkout/i).or(
      page.getByRole('link', { name: /checkout/i })
    ).first()).toBeVisible({ timeout: 8_000 })

    // ── 6. Proceed to checkout ────────────────────────────────────────────────
    await page.getByRole('link', { name: /proceed to checkout|checkout/i }).first().click()
    await expect(page).toHaveURL(/\/checkout|\/login/)

    // If redirected to login (guest checkout), register a new account
    if (page.url().includes('/login') || page.url().includes('/register')) {
      // Navigate to register if needed
      const registerLink = page.getByRole('link', { name: /sign up|create account|register/i })
      if (await registerLink.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await registerLink.click()
      }
      // Fill registration form
      await page.getByLabel(/name/i).fill(TEST_NAME)
      await page.getByLabel(/email/i).fill(TEST_EMAIL)
      await page.getByLabel(/password/i).first().fill(TEST_PASSWORD)
      const confirmPwd = page.getByLabel(/confirm password/i)
      if (await confirmPwd.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await confirmPwd.fill(TEST_PASSWORD)
      }
      await page.getByRole('button', { name: /register|sign up|create account/i }).click()
      await page.waitForURL(/\/checkout/, { timeout: 10_000 })
    }

    await page.waitForLoadState('networkidle')

    // ── 7. Shipping address ───────────────────────────────────────────────────
    const fullNameInput = page.getByLabel(/full name/i)
    if (await fullNameInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await fullNameInput.fill(TEST_NAME)
      await page.getByLabel(/phone/i).fill('5551234567')
      await page.getByLabel(/address|line 1/i).first().fill('123 Test St')
      await page.getByLabel(/city/i).fill('New York')
      await page.getByLabel(/state|province/i).first().fill('NY')
      await page.getByLabel(/postal|zip/i).fill('10001')
      // Country might be a select
      const countrySelect = page.getByLabel(/country/i)
      if (await countrySelect.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await countrySelect.selectOption('US')
      }
      await page.getByRole('button', { name: /next|continue|shipping/i }).first().click()
      await page.waitForLoadState('networkidle')
    }

    // ── 8. Shipping method ────────────────────────────────────────────────────
    const standardShipping = page.getByText(/standard/i).first()
    if (await standardShipping.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await standardShipping.click()
      await page.getByRole('button', { name: /next|continue|payment/i }).first().click()
      await page.waitForLoadState('networkidle')
    }

    // ── 9. Payment ────────────────────────────────────────────────────────────
    const cardInput = page.getByLabel(/card number/i).or(
      page.getByPlaceholder(/\d{4} \d{4}|\d{16}/)
    ).first()
    if (await cardInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await cardInput.fill(CARD.number)
      await page.getByLabel(/expir/i).first().fill(CARD.exp)
      await page.getByLabel(/cvc|cvv|security code/i).first().fill(CARD.cvc)
      const nameOnCard = page.getByLabel(/name on card|cardholder/i)
      if (await nameOnCard.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await nameOnCard.fill(CARD.name)
      }
    }

    // ── 10. Place order ───────────────────────────────────────────────────────
    const placeOrderBtn = page.getByRole('button', { name: /place order|pay|confirm/i })
    await expect(placeOrderBtn).toBeVisible({ timeout: 5_000 })
    await placeOrderBtn.click()

    // ── 11. Order confirmation ────────────────────────────────────────────────
    await expect(
      page.getByText(/order confirmed|thank you|order #|order number/i).first()
    ).toBeVisible({ timeout: 15_000 })

    // Grab the order number from the page
    const orderNumberEl = page.getByText(/ORD-\d+/).first()
    const orderNumber = await orderNumberEl.textContent({ timeout: 5_000 }).catch(() => null)
    expect(orderNumber).toBeTruthy()

    // ── 12. Order appears in history ──────────────────────────────────────────
    await page.goto('/account/orders')
    await page.waitForLoadState('networkidle')

    if (orderNumber) {
      await expect(page.getByText(orderNumber.trim())).toBeVisible({ timeout: 8_000 })
    } else {
      // At minimum, at least one order card should be visible
      await expect(
        page.locator('[data-testid="order-card"]').or(
          page.getByText(/placed|processing|shipped/i).first()
        )
      ).toBeVisible({ timeout: 8_000 })
    }
  })
})
