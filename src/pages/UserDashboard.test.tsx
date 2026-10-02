import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UserDashboard from './UserDashboard'

const auth0 = vi.hoisted(() => ({
  useAuth0: vi.fn(),
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: auth0.useAuth0,
}))

function renderAuthenticatedDashboard() {
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

  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })))
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

})
