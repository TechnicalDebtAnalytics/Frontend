import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { expect, test, type Locator, type Page } from '@playwright/test'

const AUTH_STATE_PATH = 'playwright/.auth/system-user.json'

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.e2e.example to .env.e2e and add the dedicated Auth0 test-account credentials.`,
    )
  }

  return value
}

async function visibleSubmitControl(page: Page): Promise<Locator> {
  const submit = page.locator('button[type="submit"], input[type="submit"]').first()
  await expect(submit).toBeVisible()
  return submit
}

test('valid user can log in through Auth0', async ({ page, context }) => {
  const email = requiredEnvironmentVariable('E2E_USER_EMAIL')
  const password = requiredEnvironmentVariable('E2E_USER_PASSWORD')
  const auth0Domain = requiredEnvironmentVariable('VITE_AUTH0_DOMAIN')

  await page.route('**/api/github/app/info', async (route) => {
    await route.fulfill({ json: {} })
  })
  await page.route(
    /\/api\/(companies\/my-admin|companies\/my-member|invitations\/my-pending)$/,
    async (route) => {
      await route.fulfill({ json: [] })
    },
  )
  await page.routeWebSocket('**/ws/analysis', () => undefined)

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue with Auth0' }).click()

  await expect.poll(() => new URL(page.url()).hostname).toBe(auth0Domain)

  const usernameInput = page
    .locator('input[name="username"], input[type="email"]')
    .first()
  const passwordInput = page
    .locator('input[name="password"], input[type="password"]')
    .first()

  await expect(usernameInput).toBeVisible()
  await usernameInput.fill(email)

  if (!(await passwordInput.isVisible())) {
    await (await visibleSubmitControl(page)).click()
    await expect(passwordInput).toBeVisible()
  }

  await passwordInput.fill(password)
  await (await visibleSubmitControl(page)).click()

  await expect(
    page.getByRole('heading', { name: 'My Companies' }),
  ).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Access Denied' })).toHaveCount(0)

  await mkdir(dirname(AUTH_STATE_PATH), { recursive: true })
  await context.storageState({ path: AUTH_STATE_PATH })
})
