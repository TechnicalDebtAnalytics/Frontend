import { expect, test } from '@playwright/test'
import {
  ADMIN_COMPANY,
  AVAILABLE_JAVA_REPOSITORY,
  AUTH_STATE_PATH,
  mockRepositoryManager,
  openDashboard,
  openRepositoryManager,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('valid repository can be connected', async ({ page }) => {
  let submittedBody: unknown

  await mockRepositoryManager(page, [AVAILABLE_JAVA_REPOSITORY])
  await page.route(
    `**/api/companies/${ADMIN_COMPANY.companyId}/repositories`,
    async (route) => {
      submittedBody = route.request().postDataJSON()
      await route.fulfill({ status: 200, json: { connected: 1 } })
    },
  )
  await openDashboard(page)
  await openRepositoryManager(page)

  const repositoryRow = page
    .getByText(AVAILABLE_JAVA_REPOSITORY.name, { exact: true })
    .locator('xpath=ancestor::label')
  await repositoryRow.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Add 1 Repositories' }).click()

  await expect(
    page.getByText(
      `Repositories successfully added to ${ADMIN_COMPANY.companyName}! Redirecting...`,
    ),
  ).toBeVisible()
  expect(submittedBody).toEqual({
    repositories: [
      {
        githubRepositoryId: AVAILABLE_JAVA_REPOSITORY.githubRepositoryId,
        repositoryName: AVAILABLE_JAVA_REPOSITORY.name,
        repositoryUrl: AVAILABLE_JAVA_REPOSITORY.htmlUrl,
        defaultBranch: AVAILABLE_JAVA_REPOSITORY.defaultBranch,
      },
    ],
  })
})
