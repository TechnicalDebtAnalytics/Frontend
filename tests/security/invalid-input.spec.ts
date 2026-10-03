import { expect, test } from '@playwright/test'

test('invalid registration input is rejected without submission', async ({ page }) => {
  let registrationRequestObserved = false

  await page.route('**/api/registration/register', async (route) => {
    registrationRequestObserved = true
    await route.fulfill({ status: 500, json: { message: 'Should not be called' } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Create Account' }).click()

  await page.getByLabel('First Name').fill('E2E')
  await page.getByLabel('Last Name').fill('User')
  await page.getByLabel('Work Email').fill('e2e.user@example.com')
  await page.getByLabel('GitHub Username').fill('e2e-user')
  await page.getByLabel('Password', { exact: true }).fill('ValidPassword123!')
  await page
    .getByLabel('Confirm Password', { exact: true })
    .fill('DifferentPassword123!')
  await page.getByRole('checkbox').check()

  await expect(page.getByText('Passwords do not match.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create Account' })).toBeDisabled()
  expect(registrationRequestObserved).toBe(false)
})
