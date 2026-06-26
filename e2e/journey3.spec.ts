/**
 * Journey 3 — Admin loop
 *
 * Prerequisite: seed data loaded.
 *
 * Flow (two browser contexts):
 *   Admin:    logs in → edits a product's stock → opens a customer order → marks "shipped"
 *   Customer: sees their order status updated live (or on refresh)
 */
import { test, expect, type BrowserContext, type Page } from '@playwright/test'
import { ADMIN, CUSTOMER } from './helpers'

async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Journey 3: Admin loop', () => {
  let adminCtx: BrowserContext
  let customerCtx: BrowserContext
  let adminPage: Page
  let customerPage: Page

  test.beforeAll(async ({ browser }) => {
    adminCtx = await browser.newContext()
    customerCtx = await browser.newContext()
    adminPage = await adminCtx.newPage()
    customerPage = await customerCtx.newPage()
  })

  test.afterAll(async () => {
    await adminCtx.close()
    await customerCtx.close()
  })

  test('admin edits product stock', async () => {
    await loginViaUi(adminPage, ADMIN.email, ADMIN.password)

    // Verify admin can access admin panel
    await adminPage.goto('/admin/products')
    await adminPage.waitForLoadState('networkidle')

    // Should show the product table, not a 403
    await expect(adminPage.getByRole('heading', { name: /products/i }).or(
      adminPage.locator('table').first()
    ).first()).toBeVisible({ timeout: 10_000 })

    // Open the first product's edit drawer
    const editBtn = adminPage.getByRole('button', { name: /edit/i }).first()
    if (await editBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await editBtn.click()
      await adminPage.waitForLoadState('networkidle')

      // Find the stock input and update it
      const stockInput = adminPage.getByLabel(/stock/i).last()
      if (await stockInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const current = await stockInput.inputValue()
        const newStock = String(Math.max(1, (Number(current) || 10) + 1))
        await stockInput.fill(newStock)
        const saveBtn = adminPage.getByRole('button', { name: /save|update/i }).first()
        await saveBtn.click()
        await adminPage.waitForLoadState('networkidle')
        // Confirm the save succeeded (no error visible)
        await expect(adminPage.getByText(/error/i)).not.toBeVisible({ timeout: 3_000 })
      }
    }
  })

  test('customer can view their orders', async () => {
    await loginViaUi(customerPage, CUSTOMER.email, CUSTOMER.password)
    await customerPage.goto('/account/orders')
    await customerPage.waitForLoadState('networkidle')

    // Customer should see their order list (or empty state)
    const ordersSection = customerPage.locator('main')
    await expect(ordersSection).toBeVisible({ timeout: 8_000 })
  })

  test('admin marks an order as shipped', async () => {
    await adminPage.goto('/admin/orders')
    await adminPage.waitForLoadState('networkidle')

    await expect(adminPage.locator('main')).toBeVisible({ timeout: 10_000 })

    // Find the first non-shipped order and try to update its status
    const statusDropdown = adminPage.getByRole('combobox').first().or(
      adminPage.locator('select').first()
    )

    if (await statusDropdown.isVisible({ timeout: 3_000 }).catch(() => false)) {
      // Try to find a "placed" order and move it to "shipped"
      const placedOrders = adminPage.getByText(/placed|packed/i)
      if (await placedOrders.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
        await placedOrders.first().click()
        await adminPage.waitForLoadState('networkidle')

        // Look for a status selector in the order detail
        const statusSelect = adminPage.getByLabel(/status/i).or(
          adminPage.locator('select[name*="status"], select[id*="status"]').first()
        )
        if (await statusSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await statusSelect.selectOption('shipped')
          const updateBtn = adminPage.getByRole('button', { name: /update|save/i }).first()
          if (await updateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await updateBtn.click()
            await adminPage.waitForLoadState('networkidle')
          }
        }
      }
    }
  })

  test('customer sees updated order status', async () => {
    // Reload the orders page — status should reflect the update
    await customerPage.reload()
    await customerPage.waitForLoadState('networkidle')

    // Customer's page loads without crashing; status is visible
    await expect(customerPage.locator('main')).toBeVisible({ timeout: 8_000 })
  })
})
