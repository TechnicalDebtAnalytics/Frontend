import { expect, test } from '@playwright/test'
import { AUTH_STATE_PATH, openDashboard } from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('dashboard loads correctly after login', async ({ page }) => {
  await openDashboard(page, { adminCompanies: [], memberCompanies: [] })

  await expect(page.getByText('Manage organizations you administer')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create Company' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Company Admin' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Company Member' })).toBeVisible()
  await expect(page.getByText('Admin Orgs')).toBeVisible()
  await expect(page.getByText('Member Orgs')).toBeVisible()
})
