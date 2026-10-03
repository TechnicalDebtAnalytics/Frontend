import { expect, type Locator, type Page } from '@playwright/test'

export function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.e2e.example to .env.e2e and configure the Auth0 test account.`,
    )
  }

  return value
}

async function visibleSubmitControl(page: Page): Promise<Locator> {
  const submit = page.locator('button[type="submit"], input[type="submit"]').first()
  await expect(submit).toBeVisible()
  return submit
}

export async function submitAuth0Credentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
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
}

