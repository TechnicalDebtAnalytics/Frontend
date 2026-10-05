import { expect, test } from '@playwright/test'
import {
  AUTH_STATE_PATH,
  COMPANY_REPOSITORY,
  mockAnalysisWorkspace,
  openAnalysisWorkspace,
  openDashboard,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('analysis progress and status are displayed correctly', async ({ page }) => {
  await mockAnalysisWorkspace(page, [
    {
      analysisId: 502,
      repositoryId: COMPANY_REPOSITORY.repositoryId,
      repositoryName: COMPANY_REPOSITORY.repositoryName,
      repositoryUrl: COMPANY_REPOSITORY.repositoryUrl,
      companyId: 11,
      companyName: 'Acme Engineering',
      branch: 'main',
      startedByUserId: 1,
      startedByUserName: 'E2E User',
      status: 'RUNNING',
      startedAt: '2026-10-03T08:00:00Z',
      completedAt: null,
      totalClassesAnalyzed: 24,
    },
  ])
  await openDashboard(page)
  await openAnalysisWorkspace(page)

  await expect(
    page.getByText('Stage 2/2: Machine Learning Models Active'),
  ).toBeVisible()
  await expect(page.getByText('ML Processing')).toBeVisible()
  await expect(
    page.getByText(/Static metrics computed for 24 classes/),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel Analysis' })).toBeVisible()
})

