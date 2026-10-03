import { expect, test } from '@playwright/test'
import {
  AUTH_STATE_PATH,
  COMPANY_REPOSITORY,
  mockAnalysisWorkspace,
  openAnalysisWorkspace,
  openDashboard,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('analysis can be started', async ({ page }) => {
  let startRequestObserved = false

  await mockAnalysisWorkspace(page)
  await page.route(
    `**/api/repositories/${COMPANY_REPOSITORY.repositoryId}/analysis`,
    async (route) => {
      if (route.request().method() === 'POST') {
        startRequestObserved = true
        await route.fulfill({
          status: 202,
          json: {
            analysisId: 501,
            startedAt: '2026-10-03T08:00:00Z',
          },
        })
        return
      }

      await route.fulfill({ json: [] })
    },
  )
  await openDashboard(page)
  await openAnalysisWorkspace(page)

  await page.getByRole('button', { name: 'Start Analysis' }).click()

  await expect(page.getByText('Stage 1/2: Git Clone & Static AST Analysis')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel Analysis' })).toBeVisible()
  expect(startRequestObserved).toBe(true)
})
