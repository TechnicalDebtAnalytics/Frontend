import { expect, test } from '@playwright/test'

test('unauthorized access to the admin page is rejected', async ({ page }) => {
  await page.goto('/admin')

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Auth0' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'System Overview' })).toHaveCount(0)
})

