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

function renderAuthenticatedDashboard(fetchImplementation?: (url: string) => Promise<Response>) {
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

})
