import { expect, type Page } from '@playwright/test'

export const AUTH_STATE_PATH = 'playwright/.auth/system-user.json'

export const ADMIN_COMPANY = {
  companyId: 11,
  companyName: 'Acme Engineering',
  githubOrganizationName: 'acme-labs',
  githubOrganizationUrl: 'https://github.com/acme-labs',
  githubInstallationId: 77,
  totalRepositories: 1,
  createdAt: '2026-09-01T10:00:00Z',
}

export const MEMBER_COMPANY = {
  companyId: 12,
  companyName: 'Member Works',
  githubOrganizationName: 'member-works',
  githubOrganizationUrl: 'https://github.com/member-works',
  githubInstallationId: 88,
  totalRepositories: 2,
  createdAt: '2026-09-02T10:00:00Z',
}

export const COMPANY_REPOSITORY = {
  repositoryId: 101,
  githubRepositoryId: 9001,
  repositoryName: 'debt-service',
  repositoryUrl: 'https://github.com/acme-labs/debt-service',
  defaultBranch: 'main',
  createdAt: '2026-09-01T10:00:00Z',
}

export const AVAILABLE_JAVA_REPOSITORY = {
  githubRepositoryId: 9002,
  name: 'billing-engine',
  fullName: 'acme-labs/billing-engine',
  htmlUrl: 'https://github.com/acme-labs/billing-engine',
  defaultBranch: 'main',
  description: 'Java billing service',
  alreadyAdded: false,
  language: 'Java',
  stargazersCount: 12,
}

export const UNAVAILABLE_REPOSITORY = {
  githubRepositoryId: 9003,
  name: 'frontend-only',
  fullName: 'acme-labs/frontend-only',
  htmlUrl: 'https://github.com/acme-labs/frontend-only',
  defaultBranch: 'main',
  description: 'Unsupported frontend repository',
  alreadyAdded: false,
  language: 'TypeScript',
  stargazersCount: 4,
}

export const PENDING_INVITATION = {
  invitationId: 301,
  email: 'e2e.user@example.com',
  githubUsername: 'e2e-user',
  repositoryId: 101,
  repositoryName: 'debt-service',
  companyId: 11,
  companyName: 'Acme Engineering',
  status: 'PENDING',
  token: 'fixture-token',
  expiresAt: '2027-01-01T00:00:00Z',
  createdAt: '2026-10-01T00:00:00Z',
}

type DashboardOptions = {
  adminCompanies?: unknown[]
  memberCompanies?: unknown[]
  invitations?: unknown[]
}

export async function mockDashboardShell(
  page: Page,
  options: DashboardOptions = {},
): Promise<void> {
  const {
    adminCompanies = [ADMIN_COMPANY],
    memberCompanies = [],
    invitations = [],
  } = options

  await page.route('**/api/github/app/info', async (route) => {
    await route.fulfill({ json: { configured: false } })
  })
  await page.route('**/api/companies/my-admin', async (route) => {
    await route.fulfill({ json: adminCompanies })
  })
  await page.route('**/api/companies/my-member', async (route) => {
    await route.fulfill({ json: memberCompanies })
  })
  await page.route('**/api/invitations/my-pending', async (route) => {
    await route.fulfill({ json: invitations })
  })
  await page.routeWebSocket('**/ws/analysis', () => undefined)
}

export async function openDashboard(
  page: Page,
  options: DashboardOptions = {},
): Promise<void> {
  await mockDashboardShell(page, options)
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'My Companies' }),
  ).toBeVisible({ timeout: 30_000 })
}

export async function mockRepositoryManager(
  page: Page,
  repositories: unknown[],
): Promise<void> {
  await page.route(
    `**/api/companies/${ADMIN_COMPANY.companyId}/available-repositories`,
    async (route) => {
      await route.fulfill({ json: repositories })
    },
  )
  await page.route('**/api/github/repos/**/contributors', async (route) => {
    await route.fulfill({ json: [] })
  })
}

export async function openRepositoryManager(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Repos', exact: true }).click()
  await expect(
    page.getByRole('heading', {
      name: `${ADMIN_COMPANY.companyName} Repository Manager`,
    }),
  ).toBeVisible()
}

export async function mockAnalysisWorkspace(
  page: Page,
  analyses: unknown[] = [],
): Promise<void> {
  await page.route(
    `**/api/companies/${ADMIN_COMPANY.companyId}/repositories`,
    async (route) => {
      await route.fulfill({ json: [COMPANY_REPOSITORY] })
    },
  )
  await page.route(
    `**/api/companies/${ADMIN_COMPANY.companyId}/analysis`,
    async (route) => {
      await route.fulfill({ json: analyses })
    },
  )
}

export async function openAnalysisWorkspace(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Analyze', exact: true }).click()
  await expect(
    page.getByRole('heading', {
      name: `${ADMIN_COMPANY.companyName} Analysis Hub`,
    }),
  ).toBeVisible()
  await expect(page.getByText(COMPANY_REPOSITORY.repositoryName)).toBeVisible()
}

