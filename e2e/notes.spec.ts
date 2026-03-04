import { test, expect } from '@playwright/test'

test.describe('Notes page (protected route)', () => {
  test('unauthenticated visit to /notes redirects to /', async ({ page }) => {
    await page.goto('/notes')
    await expect(page).toHaveURL('/')
  })

  test('authenticated user sees notes page', async ({ page }) => {
    // Seed auth state in localStorage to bypass login
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: { id: '1', name: 'Test', email: 'test@test.com' },
            isAuthenticated: true,
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh',
          },
          version: 0,
        })
      )
    })
    await page.goto('/notes')
    await expect(page.getByText('Notes')).toBeVisible()
    await expect(page.getByPlaceholder(/search notes/i)).toBeVisible()
  })

  test('shows empty state when no notes exist', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: { id: '1', name: 'Test', email: 'test@test.com' },
            isAuthenticated: true,
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh',
          },
          version: 0,
        })
      )
    })
    await page.goto('/notes')
    await expect(page.getByText(/create your first note/i)).toBeVisible()
  })
})
