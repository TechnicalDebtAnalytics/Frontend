import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './LoginPage'

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}))

const mockedUseAuth0 = vi.mocked(useAuth0)

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedUseAuth0.mockReturnValue({
      loginWithRedirect: vi.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useAuth0>)
  })

  it('renders the login page correctly', () => {
    render(<LoginPage onNavigate={vi.fn()} />)

    expect(screen.getByText('Welcome back')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Continue with Auth0',
      }),
    ).toBeInTheDocument()

    expect(
  screen.getByText(/Sign in to access your Technical Debt/),
).toBeInTheDocument()
  })

  it('calls loginWithRedirect when the Auth0 button is clicked', async () => {
    const user = userEvent.setup()
    const loginWithRedirect = vi.fn()

    mockedUseAuth0.mockReturnValue({
      loginWithRedirect,
      isLoading: false,
    } as unknown as ReturnType<typeof useAuth0>)

    render(<LoginPage onNavigate={vi.fn()} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Continue with Auth0',
      }),
    )

    await waitFor(() => {
      expect(loginWithRedirect).toHaveBeenCalledTimes(1)
    })
  })

  it('shows Redirecting when authentication is loading', () => {
    mockedUseAuth0.mockReturnValue({
      loginWithRedirect: vi.fn(),
      isLoading: true,
    } as unknown as ReturnType<typeof useAuth0>)

    render(<LoginPage onNavigate={vi.fn()} />)

    const button = screen.getByRole('button', {
      name: 'Redirecting...',
    })

    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('navigates to registration when Create Account is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    render(<LoginPage onNavigate={onNavigate} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Create Account',
      }),
    )

    expect(onNavigate).toHaveBeenCalledWith('register')
  })
})