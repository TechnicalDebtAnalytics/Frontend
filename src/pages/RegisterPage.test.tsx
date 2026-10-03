import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import RegisterPage from './RegisterPage'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders the registration form correctly', () => {
    render(<RegisterPage onNavigate={vi.fn()} />)

    expect(
      screen.getByRole('heading', {
        name: 'Create Account',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Alex'),
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Johnson'),
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('alex@company.com'),
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('octocat'),
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Create a password'),
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText('Confirm your password'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Create Account',
      }),
    ).toBeInTheDocument()
  })

  it('keeps Create Account disabled until required fields and terms are completed', async () => {
    const user = userEvent.setup()

    render(<RegisterPage onNavigate={vi.fn()} />)

    const createButton = screen.getByRole('button', {
      name: 'Create Account',
    })

    expect(createButton).toBeDisabled()

    await user.type(
      screen.getByPlaceholderText('Alex'),
      'Nalina',
    )

    await user.type(
      screen.getByPlaceholderText('Johnson'),
      'Test',
    )

    await user.type(
      screen.getByPlaceholderText('alex@company.com'),
      'nalina@example.com',
    )

    await user.type(
      screen.getByPlaceholderText('octocat'),
      'nalina',
    )

    await user.type(
      screen.getByPlaceholderText('Create a password'),
      'Password123!',
    )

    await user.type(
      screen.getByPlaceholderText('Confirm your password'),
      'Password123!',
    )

    expect(createButton).toBeDisabled()

    await user.click(screen.getByRole('checkbox'))

    expect(createButton).not.toBeDisabled()
  })

  it('displays a password mismatch message', async () => {
    const user = userEvent.setup()

    render(<RegisterPage onNavigate={vi.fn()} />)

    await user.type(
      screen.getByPlaceholderText('Create a password'),
      'Password123!',
    )

    await user.type(
      screen.getByPlaceholderText('Confirm your password'),
      'DifferentPassword!',
    )

    expect(
      screen.getByText('Passwords do not match.'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Create Account',
      }),
    ).toBeDisabled()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()

    render(<RegisterPage onNavigate={vi.fn()} />)

    const passwordInput = screen.getByPlaceholderText(
      'Create a password',
    )

    expect(passwordInput).toHaveAttribute(
      'type',
      'password',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Show password',
      }),
    )

    expect(passwordInput).toHaveAttribute(
      'type',
      'text',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Hide password',
      }),
    )

    expect(passwordInput).toHaveAttribute(
      'type',
      'password',
    )
  })

  it('submits valid registration data successfully', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            auth0UserId: 'auth0|test-user',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )

    render(<RegisterPage onNavigate={onNavigate} />)

    await user.type(
      screen.getByPlaceholderText('Alex'),
      'Nalina',
    )

    await user.type(
      screen.getByPlaceholderText('Johnson'),
      'Test',
    )

    await user.type(
      screen.getByPlaceholderText('alex@company.com'),
      'nalina@example.com',
    )

    await user.type(
      screen.getByPlaceholderText('octocat'),
      'nalina',
    )

    await user.type(
      screen.getByPlaceholderText('Create a password'),
      'Password123!',
    )

    await user.type(
      screen.getByPlaceholderText('Confirm your password'),
      'Password123!',
    )

    await user.click(screen.getByRole('checkbox'))

    await user.click(
      screen.getByRole('button', {
        name: 'Create Account',
      }),
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/registration/register'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    const requestBody = JSON.parse(
      fetchMock.mock.calls[0][1]?.body as string,
    )

    expect(requestBody).toEqual({
      firstName: 'Nalina',
      lastName: 'Test',
      email: 'nalina@example.com',
      githubUsername: 'nalina',
      password: 'Password123!',
      role: 'MEMBER',
    })

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      'Registration successful! Redirecting to login...',
    )

    await waitFor(
      () => {
        expect(onNavigate).toHaveBeenCalledWith('login')
      },
      {
        timeout: 2000,
      },
    )

    fetchMock.mockRestore()
  })

  it('displays the backend error when registration fails', async () => {
    const user = userEvent.setup()

    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Email already exists',
          }),
          {
            status: 409,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      )

    render(<RegisterPage onNavigate={vi.fn()} />)

    await user.type(
      screen.getByPlaceholderText('Alex'),
      'Nalina',
    )

    await user.type(
      screen.getByPlaceholderText('Johnson'),
      'Test',
    )

    await user.type(
      screen.getByPlaceholderText('alex@company.com'),
      'nalina@example.com',
    )

    await user.type(
      screen.getByPlaceholderText('octocat'),
      'nalina',
    )

    await user.type(
      screen.getByPlaceholderText('Create a password'),
      'Password123!',
    )

    await user.type(
      screen.getByPlaceholderText('Confirm your password'),
      'Password123!',
    )

    await user.click(screen.getByRole('checkbox'))

    await user.click(
      screen.getByRole('button', {
        name: 'Create Account',
      }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Email already exists')

    fetchMock.mockRestore()
  })
})