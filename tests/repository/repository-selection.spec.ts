import { expect, test } from '@playwright/test'
import {
  AVAILABLE_JAVA_REPOSITORY,
  AUTH_STATE_PATH,
  mockRepositoryManager,
  openDashboard,
  openRepositoryManager,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('repository can be selected', async ({ page }) => {
  await mockRepositoryManager(page, [AVAILABLE_JAVA_REPOSITORY])
  await openDashboard(page)
  await openRepositoryManager(page)

  const repositoryRow = page
    .getByText(AVAILABLE_JAVA_REPOSITORY.name, { exact: true })
    .locator('xpath=ancestor::label')
  const checkbox = repositoryRow.getByRole('checkbox')

  await expect(checkbox).not.toBeChecked()
  await checkbox.check()
  await expect(checkbox).toBeChecked()
  await expect(
    page.getByText('New Selected').locator('..').getByText('1', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Add 1 Repositories' }),
  ).toBeEnabled()
})
