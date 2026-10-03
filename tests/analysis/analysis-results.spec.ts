import { expect, test } from '@playwright/test'
import {
  AUTH_STATE_PATH,
  COMPANY_REPOSITORY,
  mockAnalysisWorkspace,
  openAnalysisWorkspace,
  openDashboard,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('technical-debt and ML analysis results are displayed', async ({ page }) => {
  const completedAt = new Date().toISOString()

  await mockAnalysisWorkspace(page, [
    {
      analysisId: 503,
      repositoryId: COMPANY_REPOSITORY.repositoryId,
      repositoryName: COMPANY_REPOSITORY.repositoryName,
      repositoryUrl: COMPANY_REPOSITORY.repositoryUrl,
      companyId: 11,
      companyName: 'Acme Engineering',
      branch: 'main',
      startedByUserId: 1,
      startedByUserName: 'E2E User',
      status: 'COMPLETED',
      startedAt: completedAt,
      completedAt,
      totalClassesAnalyzed: 42,
    },
  ])
  await page.route('**/api/analysis/503/report', async (route) => {
    await route.fulfill({
      json: {
        reportId: 700,
        analysisId: 503,
        repositoryId: COMPANY_REPOSITORY.repositoryId,
        repositoryName: COMPANY_REPOSITORY.repositoryName,
        branch: 'main',
        generatedAt: completedAt,
        overallDebtScore: 68,
        overallHealthScore: 'FAIR',
        overallRiskLevel: 'HIGH',
        totalClasses: 42,
        defectiveClassesCount: 6,
        totalSatdComments: 9,
        prioritizedRefactoringList: [
          {
            classId: 1,
            className: 'PaymentService',
            filePath: 'src/main/java/PaymentService.java',
            startLine: 10,
            endLine: 240,
            numberOfLinesOfCode: 231,
            technicalDebtScore: 82,
            healthScore: 'POOR',
            riskLevel: 'CRITICAL',
            bugProbability: 0.82,
            refactorPriorityRank: 1,
            primaryDrivers: ['High complexity', 'SATD comments'],
            recommendedActions: [],
          },
        ],
      },
    })
  })
  await openDashboard(page)
  await openAnalysisWorkspace(page)

  await expect(page.getByText('Analysis Succeeded')).toBeVisible()
  await page.getByRole('button', { name: 'View Recommendations' }).click()

  await expect(
    page.getByRole('heading', { name: 'Technical Debt & Refactoring Report' }),
  ).toBeVisible()
  await expect(page.getByText('Overall Debt Score')).toBeVisible()
  await expect(page.getByText('68', { exact: true })).toBeVisible()
  await expect(page.getByText('PaymentService', { exact: true })).toBeVisible()
  await expect(page.getByText('82%', { exact: true })).toBeVisible()
  await expect(page.getByText('High complexity')).toBeVisible()
})
