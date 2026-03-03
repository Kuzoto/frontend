import { test, expect } from '@playwright/test'

test.describe('Auth pages', () => {
  test('signup page loads at root', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /noook/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()
  })

  test('navigate from signup to login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /log in/i }).first().click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('navigate from login back to signup', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/')
  })
})
