import { expect, test } from '@playwright/test'
import {
  AUTH_STATE_PATH,
  PENDING_INVITATION,
  openDashboard,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('unauthorized session action is rejected', async ({ page }) => {
  let acceptRequestCount = 0

  await page.route(
    `**/api/invitations/${PENDING_INVITATION.invitationId}/accept`,
    async (route) => {
      acceptRequestCount += 1
      await route.fulfill({
        status: 401,
        json: { message: 'Session expired. Please sign in again.' },
      })
    },
  )
  await openDashboard(page, { invitations: [PENDING_INVITATION] })

  await page.getByRole('button', { name: 'Accept & Join' }).click()

  await expect(page.getByText('Session expired. Please sign in again.')).toBeVisible()
  await expect(page.getByText(PENDING_INVITATION.companyName).first()).toBeVisible()
  expect(acceptRequestCount).toBe(1)
})

