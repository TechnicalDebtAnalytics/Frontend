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
      name: 'Test User',
      email: 'test@example.com',
    },
  })

  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue([]),
  })
  vi.stubGlobal('fetch', fetchMock)

  render(<UserDashboard />)
  return { fetchMock, logout }
}

describe('UserDashboard UI flows', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('UI-07 — rejects an invalid GitHub organization before backend verification', async () => {
    const user = userEvent.setup()
    const { fetchMock } = renderAuthenticatedDashboard()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
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
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('UI-08 — logs out using the application origin as returnTo', async () => {
    const user = userEvent.setup()
    const { logout } = renderAuthenticatedDashboard()

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(logout).toHaveBeenCalledOnce()
    expect(logout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    })
  })
})
