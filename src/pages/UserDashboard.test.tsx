import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UserDashboard from './UserDashboard'
import { createDashboardCache } from '../lib/dashboardCache'
import { API_BASE_URL } from '../config/api'

const auth0 = vi.hoisted(() => ({
  useAuth0: vi.fn(),
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: auth0.useAuth0,
}))

function renderAuthenticatedDashboard(fetchImplementation?: (url: string, init?: RequestInit) => Promise<Response>) {
  const logout = vi.fn()
  auth0.useAuth0.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    logout,
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-access-token'),
    user: {
      sub: 'auth0|test-user',
      name: 'Test User',
      email: 'test@example.com',
    },
  })

  const fetchMock = vi.fn().mockImplementation(fetchImplementation ?? (() => Promise.resolve(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }))))
  vi.stubGlobal('fetch', fetchMock)

  const view = render(<UserDashboard />)
  return { fetchMock, logout, unmount: view.unmount }
}

describe('UserDashboard UI flows', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('UI-07 � rejects an invalid GitHub organization before backend verification', async () => {
    const user = userEvent.setup()
    const { fetchMock } = renderAuthenticatedDashboard()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4))
    await user.click(screen.getByRole('button', { name: 'Create Company' }))
    await user.type(
      screen.getByPlaceholderText('e.g. https://github.com/TechnicalDebtAnalytics'),
      'plain-organization-name',
    )
    await user.click(screen.getByRole('button', { name: 'Verify Org URL' }))

    expect(
      screen.getByText(
        'Invalid input: Please enter the full GitHub organization URL (e.g. https://github.com/TechnicalDebtAnalytics). Plain organization names are not accepted.',
      ),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('UI-08 � logs out using the application origin as returnTo', async () => {
    const user = userEvent.setup()
    const { logout } = renderAuthenticatedDashboard()

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(logout).toHaveBeenCalledOnce()
    expect(logout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    })
  })

  it('reuses company lists after a refresh while fetching invitations again', async () => {
    const first = renderAuthenticatedDashboard()
    await waitFor(() => expect(first.fetchMock).toHaveBeenCalledTimes(4))
    await waitFor(() => expect(Object.keys(sessionStorage).filter(key => key.startsWith('debtlens:api:'))).toHaveLength(3))
    first.unmount()

    const refreshed = renderAuthenticatedDashboard()
    await waitFor(() => expect(refreshed.fetchMock).toHaveBeenCalledTimes(1))
    expect(refreshed.fetchMock.mock.calls[0][0]).toContain('/invitations/my-pending')
  })


  it.each(['analysis', 'pastAnalyses'])('shows the cached %s view before history revalidation finishes', async (type) => {
    const repo = { repositoryId: 1, githubRepositoryId: 101, repositoryName: 'cached-backend', repositoryUrl: 'https://github.com/acme/backend', defaultBranch: 'main' }
    const company = { companyId: 1, companyName: 'Acme', githubOrganizationName: 'acme', githubOrganizationUrl: 'https://github.com/acme', totalRepositories: 1, repositories: [repo], createdAt: new Date().toISOString() }
    const completed = { analysisId: 42, repositoryId: 1, repositoryName: repo.repositoryName, repositoryUrl: repo.repositoryUrl, companyId: 1, companyName: 'Acme', branch: 'main', startedByUserId: null, startedByUserName: 'Test User', status: 'COMPLETED', startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), totalClassesAnalyzed: 8 }
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => Promise.resolve(new Response(JSON.stringify(url.endsWith('/repositories') ? [repo] : [completed]), { status: 200 }))))
    const cache = createDashboardCache(API_BASE_URL, 'auth0|test-user')
    const headers = { Authorization: 'Bearer test-token' }
    await cache.fetch(`${API_BASE_URL}/companies/1/repositories`, { headers })
    await cache.fetch(`${API_BASE_URL}/companies/1/analysis`, { headers })
    sessionStorage.setItem('debtlens_active_user_view:auth0|test-user', JSON.stringify({ type, company, role: 'admin' }))

    let resolveHistory!: (response: Response) => void
    const { fetchMock } = renderAuthenticatedDashboard(url => url.endsWith('/companies/1/analysis')
      ? new Promise<Response>(resolve => { resolveHistory = resolve })
      : Promise.resolve(new Response(JSON.stringify([]), { status: 200 })))
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/companies/1/analysis'))).toBe(true))
    expect(screen.getAllByText('cached-backend').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0)

    resolveHistory(new Response(JSON.stringify([{ ...completed, status: 'RUNNING', completedAt: null }]), { status: 200 }))
    await waitFor(() => expect(screen.getAllByText(/Running/i).length).toBeGreaterThan(0))
  })

  it.each([204, 500])('handles repository deletion returning %s without losing failed removals', async (status) => {
    const user = userEvent.setup()
    const repo = { repositoryId: 201, githubRepositoryId: 101, repositoryName: 'application-service', repositoryUrl: 'https://github.com/acme/application-service', defaultBranch: 'main' }
    const company = { companyId: 1, companyName: 'Acme', githubOrganizationName: 'acme', githubOrganizationUrl: 'https://github.com/acme', totalRepositories: 1, repositories: [repo], createdAt: new Date().toISOString() }
    const available = { githubRepositoryId: 101, name: repo.repositoryName, fullName: 'acme/application-service', htmlUrl: repo.repositoryUrl, defaultBranch: 'main', alreadyAdded: true, language: 'Java' }
    sessionStorage.setItem('debtlens_active_user_view:auth0|test-user', JSON.stringify({ type: 'manage', company }))
    const { fetchMock } = renderAuthenticatedDashboard((url, init) => {
      if (init?.method === 'DELETE') return Promise.resolve(status === 204 ? new Response(null, { status }) : new Response(JSON.stringify({ message: 'Removal failed' }), { status }))
      const body = url.endsWith('/available-repositories') ? [available] : url.endsWith('/repositories') ? [repo] : []
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
    })
    await user.click(await screen.findByRole('button', { name: 'Remove' }))
    await user.click(screen.getByRole('button', { name: 'Confirm Remove' }))
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => url.endsWith('/companies/1/repositories/201') && init?.method === 'DELETE')).toBe(true))
    if (status === 204) await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument())
    else {
      expect(await screen.findByText('Removal failed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    }
  })

  it('removes a member on a 204 response and refreshes repository invitations', async () => {
    const user = userEvent.setup()
    const repo = { repositoryId: 201, githubRepositoryId: 101, repositoryName: 'application-service', repositoryUrl: 'https://github.com/acme/application-service', defaultBranch: 'main' }
    const company = { companyId: 1, companyName: 'Acme', githubOrganizationName: 'acme', githubOrganizationUrl: 'https://github.com/acme', totalRepositories: 1, repositories: [repo], createdAt: new Date().toISOString() }
    const member = { memberId: 50, userId: 2, name: 'Alex', githubUsername: 'alex', email: 'alex@example.com', assignedRepositories: [repo] }
    sessionStorage.setItem('debtlens_active_user_view:auth0|test-user', JSON.stringify({ type: 'invite', company, role: 'admin' }))
    const { fetchMock } = renderAuthenticatedDashboard((url, init) => {
      if (init?.method === 'DELETE') return Promise.resolve(new Response(null, { status: 204 }))
      const body = url.endsWith('/members') ? [member] : url.endsWith('/repositories') ? [repo] : []
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
    })
    await user.click(await screen.findByRole('button', { name: /Organization Members/ }))
    await user.click(await screen.findByRole('button', { name: 'Remove' }))
    await user.click(screen.getByRole('button', { name: 'Confirm Remove' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument())
    expect(fetchMock.mock.calls.some(([url, init]) => url.endsWith('/companies/1/members/50') && init?.method === 'DELETE')).toBe(true)
    expect(await screen.findByText(/Member @alex has been removed/)).toBeInTheDocument()
  })

    it('starts repository analysis successfully', async () => {
    const user = userEvent.setup()

    const company = {
      companyId: 1,
      companyName: 'Acme',
      githubOrganizationName: 'acme',
      githubOrganizationUrl: 'https://github.com/acme',
      totalRepositories: 1,
      repositories: [],
      createdAt: new Date().toISOString(),
    }

    const repo = {
      repositoryId: 201,
      githubRepositoryId: 101,
      repositoryName: 'application-service',
      repositoryUrl: 'https://github.com/acme/application-service',
      defaultBranch: 'main',
    }

    sessionStorage.setItem(
      'debtlens_active_user_view:auth0|test-user',
      JSON.stringify({
        type: 'all',
        company,
        role: 'admin',
      }),
    )

    const { fetchMock } = renderAuthenticatedDashboard((url, init) => {
      if (
        url.endsWith('/companies/my-admin')
      ) {
        return Promise.resolve(
          new Response(JSON.stringify([company]), { status: 200 }),
        )
      }

      if (
        url.endsWith('/companies/1/repositories') &&
        init?.method !== 'POST'
      ) {
        return Promise.resolve(
          new Response(JSON.stringify([repo]), { status: 200 }),
        )
      }

      if (
        url.endsWith('/companies/1/analysis') &&
        init?.method !== 'POST'
      ) {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200 }),
        )
      }

      if (
        url.endsWith('/repositories/201/analysis') &&
        init?.method === 'POST'
      ) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              analysisId: 42,
              startedAt: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        )
      }

      return Promise.resolve(
        new Response(JSON.stringify([]), { status: 200 }),
      )
    })

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Analyze' }),
      ).toBeInTheDocument(),
    )

    await user.click(
      screen.getByRole('button', { name: 'Analyze' }),
    )

    await waitFor(() =>
      expect(
        screen.getByText('application-service'),
      ).toBeInTheDocument(),
    )

    const startButtons = screen.getAllByRole('button', {
      name: 'Start Analysis',
    })

    expect(startButtons).toHaveLength(1)

    await user.click(startButtons[0])

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url.endsWith('/repositories/201/analysis') &&
            init?.method === 'POST',
        ),
      ).toBe(true),
    )

    expect(
      await screen.findByText('Analyzing in Progress...'),
    ).toBeInTheDocument()
  })


    it('cancels a running repository analysis successfully', async () => {
  const user = userEvent.setup()

  const company = {
    companyId: 1,
    companyName: 'Acme',
    githubOrganizationName: 'acme',
    githubOrganizationUrl: 'https://github.com/acme',
    totalRepositories: 1,
    repositories: [],
    createdAt: new Date().toISOString(),
  }

  const repo = {
    repositoryId: 201,
    githubRepositoryId: 101,
    repositoryName: 'application-service',
    repositoryUrl: 'https://github.com/acme/application-service',
    defaultBranch: 'main',
  }

  sessionStorage.setItem(
    'debtlens_active_user_view:auth0|test-user',
    JSON.stringify({
      type: 'analysis',
      company,
      role: 'admin',
    }),
  )

  const runningAnalysis = {
    analysisId: 42,
    repositoryId: 201,
    repositoryName: 'application-service',
    repositoryUrl: repo.repositoryUrl,
    companyId: 1,
    companyName: 'Acme',
    branch: 'main',
    startedByUserId: 1,
    startedByUserName: 'Test User',
    status: 'RUNNING',
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalClassesAnalyzed: 10,
  }

  const { fetchMock } = renderAuthenticatedDashboard((url, init) => {
    if (url.endsWith('/companies/my-admin')) {
      return Promise.resolve(
        new Response(JSON.stringify([company]), { status: 200 }),
      )
    }

    if (
      url.endsWith('/companies/1/repositories') &&
      init?.method !== 'POST'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify([repo]), { status: 200 }),
      )
    }

    if (
      url.endsWith('/companies/1/analysis') &&
      init?.method !== 'POST'
    ) {
      return Promise.resolve(
        new Response(JSON.stringify([runningAnalysis]), { status: 200 }),
      )
    }

    if (
      url.endsWith('/analysis/42/cancel') &&
      init?.method === 'POST'
    ) {
      return Promise.resolve(
        new Response(
          JSON.stringify({ message: 'Analysis cancelled' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
    }

    return Promise.resolve(
      new Response(JSON.stringify([]), { status: 200 }),
    )
  })

  await waitFor(() =>
    expect(screen.getByText('application-service')).toBeInTheDocument(),
  )

  expect(
    await screen.findByRole('button', { name: 'Cancel Analysis' }),
  ).toBeInTheDocument()

  await user.click(
    screen.getByRole('button', { name: 'Cancel Analysis' }),
  )

  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          url.endsWith('/analysis/42/cancel') &&
          init?.method === 'POST',
      ),
    ).toBe(true),
  )
})

})
