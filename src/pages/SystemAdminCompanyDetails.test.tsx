import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SystemAdminCompanyDetails from './SystemAdminCompanyDetails'

const mockNavigate = vi.fn()
const mockSetParams = vi.fn()
const mockApi = vi.fn()

let mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    mockSearchParams,
    mockSetParams,
  ],
}))

vi.mock('../config/adminApi', () => ({
  useAdminApi: () => mockApi,
}))

describe('SystemAdminCompanyDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()

    mockApi
      .mockResolvedValueOnce({
        companyId: 10,
        companyName: 'GN Company',
        githubOrganizationUrl:
          'https://github.com/GNCompany',
        superAdminName: 'Nalina',
        superAdminEmail: 'nalina@example.com',
        totalRepositories: 2,
        totalUsers: 3,
        createdAt: '2026-09-30T10:00:00',
      })
      .mockResolvedValueOnce([
        {
          repositoryId: 1,
          repositoryName: 'testing',
          repositoryUrl:
            'https://github.com/GNCompany/testing',
          defaultBranch: 'main',
          createdAt: '2026-09-30T10:00:00',
        },
      ])
      .mockResolvedValueOnce({
        content: [
          {
            userId: 5,
            firstName: 'Nalina',
            lastName: 'User',
            email: 'nalina@example.com',
            githubUsername: 'nalina',
            affiliations: [
              {
                companyId: 10,
                role: 'SUPER_ADMIN',
              },
            ],
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 1,
        size: 100,
      })
      .mockResolvedValueOnce({
        content: [
          {
            analysisId: 42,
            repositoryName: 'testing',
            status: 'COMPLETED',
            startedAt: '2026-09-30T10:00:00',
            totalClassesAnalyzed: 25,
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 1,
        size: 100,
      })
  })

  it('shows the loading state initially', () => {
    mockApi.mockReturnValue(new Promise(() => {}))

    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()

    expect(
      screen.getByText('Loading company…'),
    ).toBeInTheDocument()
  })

  it('displays company overview successfully', async () => {
    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'GN Company',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/ID:\s*#10/),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Nalina'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Company Metadata'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'https://github.com/GNCompany',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('tab', {
        name: /Repositories 1/,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('tab', {
        name: /Users 1/,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('tab', {
        name: /Analysis Jobs 1/,
      }),
    ).toBeInTheDocument()
  })

  it('displays repositories in the repositories tab', async () => {
    mockSearchParams =
      new URLSearchParams('tab=repositories')

    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    expect(
      await screen.findByText('testing'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Open repository'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('main'),
    ).toBeInTheDocument()

    const repositoriesTab =
      screen.getByRole('tab', {
        name: /Repositories 1/,
      })

    expect(
      repositoriesTab,
    ).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('displays users in the users tab', async () => {
    mockSearchParams =
      new URLSearchParams('tab=users')

    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    expect(
      await screen.findByText('Nalina User'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('nalina@example.com'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('@nalina'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('SUPER_ADMIN'),
    ).toBeInTheDocument()
  })

  it('displays analysis jobs in the jobs tab', async () => {
    mockSearchParams =
      new URLSearchParams('tab=jobs')

    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    expect(
      await screen.findByText('#42'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('testing'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('COMPLETED'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('25'),
    ).toBeInTheDocument()
  })

  it('changes tabs using search parameters', async () => {
    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    await screen.findByRole('heading', {
      name: 'GN Company',
    })

    fireEvent.click(
      screen.getByRole('tab', {
        name: /Repositories 1/,
      }),
    )

    expect(
      mockSetParams,
    ).toHaveBeenCalledTimes(1)

    const updatedParams =
      mockSetParams.mock.calls[0][0] as URLSearchParams

    expect(
      updatedParams.get('tab'),
    ).toBe('repositories')
  })

  it('navigates back to companies', async () => {
    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    await screen.findByRole('heading', {
      name: 'GN Company',
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Back to Companies',
      }),
    )

    expect(
      mockNavigate,
    ).toHaveBeenCalledWith(
      '/admin/companies',
    )
  })

  it('navigates to the job details page when a job is clicked', async () => {
    mockSearchParams =
      new URLSearchParams('tab=jobs')

    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    const job =
      await screen.findByText('#42')

    fireEvent.click(
      job.closest('tr')!,
    )

    expect(
      mockNavigate,
    ).toHaveBeenCalledWith(
      '/admin/jobs/42',
    )
  })

  it('displays an error and allows retry', async () => {
    mockApi.mockReset()

    // First load fails.
    mockApi.mockRejectedValueOnce(
      new Error(
        'Company service unavailable',
      ),
    )

    render(
      <SystemAdminCompanyDetails companyId={10} />,
    )

    expect(
      await screen.findByRole('alert'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Failed to Load Company',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Company service unavailable',
      ),
    ).toBeInTheDocument()

    // Retry: company
    mockApi.mockResolvedValueOnce({
      companyId: 10,
      companyName: 'GN Company',
      githubOrganizationUrl:
        'https://github.com/GNCompany',
      superAdminName: 'Nalina',
      superAdminEmail: 'nalina@example.com',
      totalRepositories: 2,
      totalUsers: 3,
      createdAt: '2026-09-30T10:00:00',
    })

    // Retry: repositories
    mockApi.mockResolvedValueOnce([
      {
        repositoryId: 1,
        repositoryName: 'testing',
        repositoryUrl:
          'https://github.com/GNCompany/testing',
        defaultBranch: 'main',
        createdAt: '2026-09-30T10:00:00',
      },
    ])

    // Retry: users
    mockApi.mockResolvedValueOnce({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 100,
    })

    // Retry: jobs
    mockApi.mockResolvedValueOnce({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 100,
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Retry',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'GN Company',
      }),
    ).toBeInTheDocument()
  })
})