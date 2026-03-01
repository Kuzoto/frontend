import { test, expect } from '@playwright/test'

test.describe('Dashboard (protected route)', () => {
  test('unauthenticated visit to /dashboard redirects to /', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
    // Should show signup page
    await expect(page.getByRole('heading', { name: /personal space/i })).toBeVisible()
  })

  test('unauthenticated visit to /settings redirects to /', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/')
  })

  test('unauthenticated visit to /profile redirects to /', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL('/')
  })
})
