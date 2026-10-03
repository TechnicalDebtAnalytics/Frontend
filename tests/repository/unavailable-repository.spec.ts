import { expect, test } from '@playwright/test'
import {
  AUTH_STATE_PATH,
  UNAVAILABLE_REPOSITORY,
  mockRepositoryManager,
  openDashboard,
  openRepositoryManager,
} from '../support/fixtures'

test.use({ storageState: AUTH_STATE_PATH })

test('unsupported repository is handled correctly', async ({ page }) => {
  await mockRepositoryManager(page, [UNAVAILABLE_REPOSITORY])
  await openDashboard(page)
  await openRepositoryManager(page)

  const repositoryRow = page
    .getByText(UNAVAILABLE_REPOSITORY.name, { exact: true })
    .locator('xpath=ancestor::label')
  const checkbox = repositoryRow.getByRole('checkbox')
  await checkbox.click()

  await expect(checkbox).not.toBeChecked()
  await expect(
    page.getByText(
      `Cannot add '${UNAVAILABLE_REPOSITORY.name}'. DebtLens currently only analyzes Java repositories (detected language: ${UNAVAILABLE_REPOSITORY.language}).`,
    ),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /Add 0 Repositories/ })).toBeDisabled()
})
