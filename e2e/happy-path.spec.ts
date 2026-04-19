import { test, expect } from '@playwright/test'

test('landing page renders with CTA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/stop overpaying/i)
  await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
})

test('sign-in page renders Google button', async ({ page }) => {
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
})
