import { expect, test } from '@playwright/test'
import { requiredEnvironmentVariable } from '../support/auth'
import { AUTH_STATE_PATH, mockDashboardShell } from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('logout returns the user to the public login page', async ({ page, context }) => {
  const auth0Domain = requiredEnvironmentVariable('VITE_AUTH0_DOMAIN')
  await mockDashboardShell(page)
  await page.route(`https://${auth0Domain}/v2/logout**`, async (route) => {
    await context.clearCookies()
    await route.fulfill({
      status: 302,
      headers: { location: 'http://localhost:5173/' },
    })
  })

  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole('button', { name: 'Log out' }).click()

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Auth0' })).toBeVisible()
})

