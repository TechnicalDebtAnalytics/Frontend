import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SystemAdminUsers from './SystemAdminUsers'

const mockApi = vi.fn()
const mockSetParams = vi.fn()

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [
    new URLSearchParams(),
    mockSetParams,
  ],
}))

vi.mock('../config/adminApi', () => ({
  useAdminApi: () => mockApi,

  queryString: (params: Record<string, unknown>) => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== '' &&
        value !== undefined &&
        value !== null
      ) {
        searchParams.set(key, String(value))
      }
    })

    return searchParams.toString()
  },
}))

const usersResponse = {
  content: [
    {
      userId: 1,
      firstName: 'Nalina',
      lastName: 'Genkeswaran',
      email: 'nalina@example.com',
      githubUsername: 'nalina',
      emailVerified: true,
      createdAt: '2026-09-30T10:00:00Z',
      affiliations: [
        {
          companyId: 10,
          companyName: 'GN Company',
          role: 'Super Admin',
        },
        {
          companyId: 20,
          companyName: 'Test Company',
          role: 'Member',
        },
      ],
    },
    {
      userId: 2,
      firstName: 'Kamal',
      lastName: 'Perera',
      email: 'kamal@example.com',
      githubUsername: 'kamal-dev',
      emailVerified: false,
      createdAt: '2026-09-29T09:00:00Z',
      affiliations: [],
    },
  ],
  totalElements: 2,
  totalPages: 1,
  page: 0,
  size: 20,
}

describe('SystemAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockApi.mockResolvedValue(usersResponse)
  })

  it('shows the loading state initially', () => {
    mockApi.mockReturnValue(new Promise(() => {}))

    render(<SystemAdminUsers />)

    expect(
      screen.getByRole('status'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Loading users…'),
    ).toBeInTheDocument()
  })

  it('displays users after a successful response', async () => {
    render(<SystemAdminUsers />)

    expect(
      await screen.findByRole('heading', {
        name: 'Users',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Nalina Genkeswaran'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Kamal Perera'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('nalina@example.com'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('kamal@example.com'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('@nalina'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('@kamal-dev'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('2'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Total Users'),
    ).toBeInTheDocument()
  })

  it('displays user affiliations and verification status', async () => {
    render(<SystemAdminUsers />)

    await screen.findByRole('heading', {
      name: 'Users',
    })

    expect(
      screen.getByText('GN Company · Super Admin'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Test Company · Member'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Verified', {
        selector: '.status-badge',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Unverified', {
        selector: '.status-badge',
      }),
    ).toBeInTheDocument()
  })

  it('shows the empty state when no users are returned', async () => {
    mockApi.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 20,
    })

    render(<SystemAdminUsers />)

    expect(
      await screen.findByRole('heading', {
        name: 'No Users Found',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Try different filters.'),
    ).toBeInTheDocument()
  })

  it('shows an error and allows retry when loading users fails', async () => {
    mockApi
      .mockRejectedValueOnce(
        new Error('Users service unavailable'),
      )
      .mockResolvedValueOnce(usersResponse)

    render(<SystemAdminUsers />)

    expect(
      await screen.findByRole('heading', {
        name: 'Failed to Load Users',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Users service unavailable'),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Retry',
      }),
    )

    expect(
      await screen.findByText(
        'Nalina Genkeswaran',
      ),
    ).toBeInTheDocument()

    expect(
      mockApi,
    ).toHaveBeenCalledTimes(2)
  })

  it('updates the search query when a search is submitted', async () => {
    render(<SystemAdminUsers />)

    await screen.findByRole('heading', {
      name: 'Users',
    })

    const searchInput =
      screen.getByRole('textbox', {
        name: 'Search users',
      })

    fireEvent.change(searchInput, {
      target: {
        value: 'Nalina',
      },
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Search',
      }),
    )

    expect(
      mockSetParams,
    ).toHaveBeenCalledTimes(1)

    const params =
      mockSetParams.mock.calls[0][0]

    expect(
      params.get('q'),
    ).toBe('Nalina')

    expect(
      params.get('page'),
    ).toBe('0')
  })

  it('updates the role and verification filters', async () => {
    render(<SystemAdminUsers />)

    await screen.findByRole('heading', {
      name: 'Users',
    })

    const roleSelect =
      screen.getByRole('combobox', {
        name: 'Filter role',
      })

    fireEvent.change(roleSelect, {
      target: {
        value: 'SUPER_ADMIN',
      },
    })

    expect(
      mockSetParams,
    ).toHaveBeenCalledTimes(1)

    let params =
      mockSetParams.mock.calls[0][0]

    expect(
      params.get('role'),
    ).toBe('SUPER_ADMIN')

    expect(
      params.get('page'),
    ).toBe('0')

    const verificationSelect =
      screen.getByRole('combobox', {
        name: 'Filter verification',
      })

    fireEvent.change(verificationSelect, {
      target: {
        value: 'true',
      },
    })

    expect(
      mockSetParams,
    ).toHaveBeenCalledTimes(2)

    params =
      mockSetParams.mock.calls[1][0]

    expect(
      params.get('verified'),
    ).toBe('true')

    expect(
      params.get('page'),
    ).toBe('0')
  })

  it('handles pagination correctly', async () => {
    mockApi.mockResolvedValue({
      ...usersResponse,
      totalPages: 3,
      page: 1,
    })

    render(<SystemAdminUsers />)

    await screen.findByRole('heading', {
      name: 'Users',
    })

    expect(
      screen.getByText('Page 2 of 3'),
    ).toBeInTheDocument()

    const previousButton =
      screen.getByRole('button', {
        name: 'Previous',
      })

    const nextButton =
      screen.getByRole('button', {
        name: 'Next',
      })

    expect(
      previousButton,
    ).not.toBeDisabled()

    expect(
      nextButton,
    ).not.toBeDisabled()

    fireEvent.click(previousButton)

    expect(
      mockSetParams,
    ).toHaveBeenCalledTimes(1)

    let params =
      mockSetParams.mock.calls[0][0]

    expect(
      params.get('page'),
    ).toBe('0')

    fireEvent.click(nextButton)

    expect(
      mockSetParams,
    ).toHaveBeenCalledTimes(2)

    params =
      mockSetParams.mock.calls[1][0]

    expect(
      params.get('page'),
    ).toBe('2')
  })
})