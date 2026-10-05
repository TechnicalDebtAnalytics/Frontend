import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SystemAdminCompanies from './SystemAdminCompanies'

const mockNavigate = vi.fn()
const mockSetSearchParams = vi.fn()
const mockApi = vi.fn()

let mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    mockSearchParams,
    mockSetSearchParams,
  ],
}))

vi.mock('../config/adminApi', () => ({
  useAdminApi: () => mockApi,
  queryString: (params: Record<string, string | number | undefined>) =>
    new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ).toString(),
}))

describe('SystemAdminCompanies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()

    mockApi.mockResolvedValue({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 20,
    })
  })

  it('shows the loading state initially', () => {
    mockApi.mockReturnValue(new Promise(() => {}))

    render(<SystemAdminCompanies />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.getByText('Loading companies…'),
    ).toBeInTheDocument()
  })

  it('displays companies after a successful API response', async () => {
    mockApi.mockResolvedValue({
      content: [
        {
          companyId: 10,
          companyName: 'GN Company',
          githubOrganizationUrl:
            'https://github.com/GNCompany',
          superAdminName: 'Nalina',
          superAdminEmail: 'nalina@example.com',
          totalRepositories: 3,
          totalUsers: 5,
          createdAt: '2026-09-30T10:00:00',
        },
      ],
      page: 0,
      totalPages: 1,
      totalElements: 1,
      size: 20,
    })

    render(<SystemAdminCompanies />)

    expect(
      await screen.findByText('GN Company'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('https://github.com/GNCompany'),
    ).toBeInTheDocument()

    expect(screen.getByText('Nalina')).toBeInTheDocument()
    expect(
      screen.getByText('nalina@example.com'),
    ).toBeInTheDocument()

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()

    expect(screen.getByText('Total Companies')).toBeInTheDocument()
  })

  it('displays the empty state when there are no companies', async () => {
    mockApi.mockResolvedValue({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 20,
    })

    render(<SystemAdminCompanies />)

    expect(
      await screen.findByText('No Companies Found'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'No companies match the current filters.',
      ),
    ).toBeInTheDocument()
  })

  it('displays an error and allows retry', async () => {
    mockApi
      .mockRejectedValueOnce(new Error('Server unavailable'))
      .mockResolvedValueOnce({
        content: [],
        page: 0,
        totalPages: 1,
        totalElements: 0,
        size: 20,
      })

    render(<SystemAdminCompanies />)

    expect(
      await screen.findByRole('alert'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Failed to Load Companies'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Server unavailable'),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Retry' }),
    )

    await waitFor(() => {
      expect(mockApi).toHaveBeenCalledTimes(2)
    })

    expect(
      await screen.findByText('No Companies Found'),
    ).toBeInTheDocument()
  })

  it('updates the query parameters when searching', async () => {
    mockApi.mockResolvedValue({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 20,
    })

    render(<SystemAdminCompanies />)

    await screen.findByText('No Companies Found')

    const searchInput = screen.getByRole('textbox', {
      name: 'Search companies',
    })

    fireEvent.change(searchInput, {
      target: { value: 'GN Company' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Search' }),
    )

    expect(mockSetSearchParams).toHaveBeenCalledTimes(1)

    const updatedParams =
      mockSetSearchParams.mock.calls[0][0] as URLSearchParams

    expect(updatedParams.get('q')).toBe('GN Company')
    expect(updatedParams.get('page')).toBe('0')
  })

  it('navigates to company details when a company is clicked', async () => {
    mockApi.mockResolvedValue({
      content: [
        {
          companyId: 25,
          companyName: 'Test Company',
          githubOrganizationUrl:
            'https://github.com/TestCompany',
          superAdminName: 'Admin User',
          superAdminEmail: 'admin@example.com',
          totalRepositories: 2,
          totalUsers: 4,
          createdAt: '2026-09-30T10:00:00',
        },
      ],
      page: 0,
      totalPages: 1,
      totalElements: 1,
      size: 20,
    })

    render(<SystemAdminCompanies />)

    const companyName =
      await screen.findByText('Test Company')

    fireEvent.click(companyName.closest('tr')!)

    expect(mockNavigate).toHaveBeenCalledWith(
      '/admin/companies/25',
    )
  })

  it('handles pagination', async () => {
    mockApi.mockResolvedValue({
      content: [
        {
          companyId: 1,
          companyName: 'Company One',
          githubOrganizationUrl:
            'https://github.com/CompanyOne',
          superAdminName: 'Admin',
          superAdminEmail: 'admin@example.com',
          totalRepositories: 2,
          totalUsers: 4,
          createdAt: '2026-09-30T10:00:00',
        },
      ],
      page: 0,
      totalPages: 3,
      totalElements: 60,
      size: 20,
    })

    render(<SystemAdminCompanies />)

    expect(
      await screen.findByText('Page 1 of 3'),
    ).toBeInTheDocument()

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    })

    expect(nextButton).not.toBeDisabled()

    fireEvent.click(nextButton)

    expect(mockSetSearchParams).toHaveBeenCalledTimes(1)

    const updatedParams =
      mockSetSearchParams.mock.calls[0][0] as URLSearchParams

    expect(updatedParams.get('page')).toBe('1')
  })
})