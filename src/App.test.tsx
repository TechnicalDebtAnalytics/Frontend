import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import RegisterPage from './pages/RegisterPage'

const auth0 = vi.hoisted(() => ({
  useAuth0: vi.fn(),
}))

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: auth0.useAuth0,
}))

const ROLE_CLAIM = 'https://debtlens.example.com/roles'

function createAuth0State() {
  return {
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    getIdTokenClaims: vi.fn().mockResolvedValue({}),
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-access-token'),
    user: {
      name: 'Test User',
      email: 'test@example.com',
    },
  }
}

function mockEmptyDashboardResponses() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue([]),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('DebtLens core UI flows', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('UI-01 — displays login and redirects through Auth0 once', async () => {
    const user = userEvent.setup()
    const auth0State = createAuth0State()
    auth0.useAuth0.mockReturnValue(auth0State)

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue with Auth0' }))

    expect(auth0State.loginWithRedirect).toHaveBeenCalledOnce()
  })

  it('UI-02 — navigates from login to the existing registration page', async () => {
    const user = userEvent.setup()
    auth0.useAuth0.mockReturnValue(createAuth0State())

    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Create Account' }))

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('alex@company.com')).toBeInTheDocument()
  })

  it('UI-03 — prevents invalid registration and displays password mismatch validation', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<RegisterPage onNavigate={vi.fn()} />)

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    expect(submitButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Alex'), 'Alex')
    await user.type(screen.getByPlaceholderText('Johnson'), 'Johnson')
    await user.type(screen.getByPlaceholderText('alex@company.com'), 'alex@example.com')
    await user.type(screen.getByPlaceholderText('octocat'), 'alexhub')
    await user.type(screen.getByPlaceholderText('Create a password'), 'ValidPassword123!')
    await user.type(screen.getByPlaceholderText('Confirm your password'), 'DifferentPassword123!')
    await user.click(screen.getByRole('checkbox'))

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('UI-04 — submits valid registration data and displays the success behavior', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify({ auth0UserId: 'auth0|test-user' })),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<RegisterPage onNavigate={onNavigate} />)

    await user.type(screen.getByPlaceholderText('Alex'), ' Alex ')
    await user.type(screen.getByPlaceholderText('Johnson'), ' Johnson ')
    await user.type(screen.getByPlaceholderText('alex@company.com'), ' alex@example.com ')
    await user.type(screen.getByPlaceholderText('octocat'), ' alexhub ')
    await user.type(screen.getByPlaceholderText('Create a password'), 'ValidPassword123!')
    await user.type(screen.getByPlaceholderText('Confirm your password'), 'ValidPassword123!')
    await user.click(screen.getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(await screen.findByText('Registration successful! Redirecting to login...')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/registration/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Alex',
          lastName: 'Johnson',
          email: 'alex@example.com',
          githubUsername: 'alexhub',
          password: 'ValidPassword123!',
          role: 'MEMBER',
        }),
      },
    )

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('login'), { timeout: 2000 })
  }, 10000)

  it('UI-05 — renders UserDashboard for an authenticated SYSTEM_USER', async () => {
    mockEmptyDashboardResponses()
    const auth0State = createAuth0State()
    auth0State.isAuthenticated = true
    auth0State.getIdTokenClaims.mockResolvedValue({
      [ROLE_CLAIM]: ['SYSTEM_USER'],
    })
    auth0.useAuth0.mockReturnValue(auth0State)

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'My Companies' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Welcome back' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Access Denied' })).not.toBeInTheDocument()
  })

  it('UI-06 — displays Access Denied for an authenticated user without a supported role', async () => {
    const auth0State = createAuth0State()
    auth0State.isAuthenticated = true
    auth0State.getIdTokenClaims.mockResolvedValue({ [ROLE_CLAIM]: [] })
    auth0.useAuth0.mockReturnValue(auth0State)

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Access Denied' })).toBeInTheDocument()
    expect(screen.getByText('You do not have permission to access this application.')).toBeInTheDocument()
  })
})
