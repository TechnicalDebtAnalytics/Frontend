import { expect, test } from '@playwright/test'
import { requiredEnvironmentVariable } from '../support/auth'
import {
  ADMIN_COMPANY,
  AUTH_STATE_PATH,
  MEMBER_COMPANY,
  PENDING_INVITATION,
  openDashboard,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('company and user information load correctly', async ({ page }) => {
  await openDashboard(page, {
    adminCompanies: [ADMIN_COMPANY],
    memberCompanies: [MEMBER_COMPANY],
    invitations: [PENDING_INVITATION],
  })

  await expect(page.getByText(ADMIN_COMPANY.companyName).first()).toBeVisible()
  await expect(page.getByText(`@${ADMIN_COMPANY.githubOrganizationName}`)).toBeVisible()
  await expect(page.getByText(MEMBER_COMPANY.companyName)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pending Invitations' })).toBeVisible()
  await expect(page.getByText(requiredEnvironmentVariable('E2E_USER_EMAIL'))).toBeVisible()
})

