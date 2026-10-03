import { expect, test } from '@playwright/test'
import {
  requiredEnvironmentVariable,
  submitAuth0Credentials,
} from '../support/auth'

test('invalid Auth0 login remains rejected', async ({ page }) => {
  const auth0Domain = requiredEnvironmentVariable('VITE_AUTH0_DOMAIN')
  const invalidEmail = `missing-user-${Date.now()}@example.invalid`

  await page.goto('/')
  await page.getByRole('button', { name: 'Continue with Auth0' }).click()
  await expect.poll(() => new URL(page.url()).hostname).toBe(auth0Domain)

  await submitAuth0Credentials(page, invalidEmail, 'Definitely-Wrong-Password-123!')

  await expect.poll(() => new URL(page.url()).hostname).toBe(auth0Domain)
  await expect(
    page.getByText(
      /wrong email or password|invalid credentials|unable to log in|user does not exist/i,
    ),
  ).toBeVisible({ timeout: 15_000 })
})

