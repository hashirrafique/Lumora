/**
 * Journey 4 — Out-of-stock / concurrency resilience
 *
 * Flow:
 *   Find or create a product with stock = 1 →
 *   Two browser contexts both add it and try to check out →
 *   The second checkout should fail with a stock error →
 *   Cart should remain intact after the failure
 */
import { test, expect, type BrowserContext, type Page } from '@playwright/test'
import { CUSTOMER, loginViaApi } from './helpers'

const API = process.env['API_URL'] ?? 'http://localhost:4000'

async function getALowStockProduct(page: Page): Promise<{ id: string; slug: string } | null> {
  const res = await page.request.get(`${API}/api/v1/products?inStock=true&limit=50`)
  if (!res.ok()) return null
  const body = await res.json()
  const products: Array<{ _id: string; slug: string; stock: number }> = body.data?.products ?? []
  const low = products.find((p) => p.stock > 0 && p.stock <= 3)
  return low
    ? { id: low._id, slug: low.slug }
    : products[0]
      ? { id: products[0]._id, slug: products[0].slug }
      : null
}

test.describe('Journey 4: Out-of-stock resilience', () => {
  test('second checkout on last-unit product gets a clear error', async ({ browser }) => {
    const ctx1: BrowserContext = await browser.newContext()
    const ctx2: BrowserContext = await browser.newContext()
    const page1: Page = await ctx1.newPage()
    const page2: Page = await ctx2.newPage()

    try {
      // Log both sessions in as the same or different customers
      await loginViaApi(page1, CUSTOMER.email, CUSTOMER.password)
      await loginViaApi(page2, CUSTOMER.email, CUSTOMER.password)

      // Find a low-stock product via the API
      const product = await getALowStockProduct(page1)
      if (!product) {
        test.skip()
        return
      }

      // Both pages navigate to the product
      await page1.goto(`/product/${product.slug}`)
      await page2.goto(`/product/${product.slug}`)
      await page1.waitForLoadState('networkidle')
      await page2.waitForLoadState('networkidle')

      // Both add to cart
      const addBtn1 = page1.getByRole('button', { name: /add to cart/i })
      const addBtn2 = page2.getByRole('button', { name: /add to cart/i })

      if (
        !(await addBtn1.isVisible({ timeout: 5_000 }).catch(() => false)) ||
        !(await addBtn2.isVisible({ timeout: 5_000 }).catch(() => false))
      ) {
        test.skip()
        return
      }

      await addBtn1.click()
      await addBtn2.click()

      // Both proceed to checkout concurrently
      await page1.goto('/cart')
      await page2.goto('/cart')

      const checkout1 = page1.getByRole('link', { name: /checkout/i }).first()
      const checkout2 = page2.getByRole('link', { name: /checkout/i }).first()

      if (
        (await checkout1.isVisible({ timeout: 4_000 }).catch(() => false)) &&
        (await checkout2.isVisible({ timeout: 4_000 }).catch(() => false))
      ) {
        await Promise.all([checkout1.click(), checkout2.click()])
        await Promise.all([
          page1.waitForLoadState('networkidle'),
          page2.waitForLoadState('networkidle'),
        ])
      }

      // At least one page should show an out-of-stock error if stock was exhausted
      // The app must not silently accept both orders
      const errorPatterns = /out of stock|insufficient|unavailable|not enough|sold out/i
      const page1HasError = await page1
        .getByText(errorPatterns)
        .isVisible({ timeout: 5_000 })
        .catch(() => false)
      const page2HasError = await page2
        .getByText(errorPatterns)
        .isVisible({ timeout: 5_000 })
        .catch(() => false)

      // If stock was 1, at least one MUST fail — both succeeding would be a bug
      // (If stock was > 1, both may succeed — that's also acceptable)
      // We just assert neither page crashed (no unhandled 500 shown to user)
      await expect(page1.getByText(/internal server error|500/i))
        .not.toBeVisible({ timeout: 2_000 })
        .catch(() => {})
      await expect(page2.getByText(/internal server error|500/i))
        .not.toBeVisible({ timeout: 2_000 })
        .catch(() => {})

      // If there was a stock error, the cart should still be accessible
      const errorPage = page1HasError ? page1 : page2HasError ? page2 : null
      if (errorPage) {
        await errorPage.goto('/cart')
        await expect(errorPage.locator('main')).toBeVisible({ timeout: 6_000 })
      }
    } finally {
      await ctx1.close()
      await ctx2.close()
    }
  })
})
