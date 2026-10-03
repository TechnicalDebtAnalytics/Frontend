import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SystemAdminJobDetails from './SystemAdminJobDetails'

const mockNavigate = vi.fn()
const mockApi = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../config/adminApi', () => ({
  useAdminApi: () => mockApi,
}))

const completedJob = {
  job: {
    analysisId: 42,
    companyName: 'GN Company',
    repositoryName: 'testing',
    branch: 'main',
    status: 'COMPLETED',
    startedByName: 'Nalina',
    startedAt: '2026-09-30T10:00:00Z',
    completedAt: '2026-09-30T10:05:00Z',
    totalClassesAnalyzed: 25,
  },
  history: [
    {
      timestamp: '2026-09-30T10:00:00Z',
      status: 'QUEUED',
      message: 'Analysis job queued',
    },
    {
      timestamp: '2026-09-30T10:01:00Z',
      status: 'RUNNING',
      message: 'Repository analysis started',
    },
    {
      timestamp: '2026-09-30T10:05:00Z',
      status: 'COMPLETED',
      message: 'Analysis completed successfully',
    },
  ],
}

const report = {
  analysisId: 42,
  repositoryName: 'testing',
  overallDebtScore: 72,
  overallHealthScore: 'GOOD',
  overallRiskLevel: 'MEDIUM',
  totalClasses: 25,
  defectiveClassesCount: 4,
  totalSatdComments: 7,
}

describe('SystemAdminJobDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.mockResolvedValue(completedJob)
  })

  it('shows the loading state initially', () => {
    mockApi.mockReturnValue(new Promise(() => {}))

    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()

    expect(
      screen.getByText('Loading analysis job...'),
    ).toBeInTheDocument()
  })

  it('displays job details after a successful response', async () => {
    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Analysis #42',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'GN Company / testing / main',
      ),
    ).toBeInTheDocument()

    // The page has COMPLETED in both the status badge
    // and the timeline, so target the status badge.
    expect(
      screen.getByText('COMPLETED', {
        selector: '.status-badge',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Nalina'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('25'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Status Timeline'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Analysis Report'),
    ).toBeInTheDocument()
  })

  it('displays the status timeline events', async () => {
    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    await screen.findByRole('heading', {
      name: 'Analysis #42',
    })

    expect(
      screen.getByText('Analysis job queued'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Repository analysis started',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Analysis completed successfully',
      ),
    ).toBeInTheDocument()
  })

  it('opens the analysis report for a completed job', async () => {
    mockApi
      .mockResolvedValueOnce(completedJob)
      .mockResolvedValueOnce(report)

    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Analysis #42',
      }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open report',
      }),
    )

    expect(
      await screen.findByText('72'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('GOOD'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('MEDIUM'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('4/25'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('7'),
    ).toBeInTheDocument()

    expect(mockApi).toHaveBeenCalledTimes(2)

    expect(
      mockApi,
    ).toHaveBeenLastCalledWith(
      '/analysis/42/report',
    )
  })

  it('shows an error when loading the job fails and allows retry', async () => {
    mockApi
      .mockRejectedValueOnce(
        new Error('Job service unavailable'),
      )
      .mockResolvedValueOnce(completedJob)

    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    expect(
      await screen.findByText(
        'Job service unavailable',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Failed to Load Job',
      }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Retry',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Analysis #42',
      }),
    ).toBeInTheDocument()

    expect(
      mockApi,
    ).toHaveBeenCalledTimes(2)
  })

  it('navigates back to the analysis jobs page', async () => {
    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    await screen.findByRole('heading', {
      name: 'Analysis #42',
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Back to Jobs',
      }),
    )

    expect(
      mockNavigate,
    ).toHaveBeenCalledWith(
      '/admin/jobs',
    )
  })

  it('refreshes the job details', async () => {
    mockApi
      .mockResolvedValueOnce(completedJob)
      .mockResolvedValueOnce(completedJob)

    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    await screen.findByRole('heading', {
      name: 'Analysis #42',
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Refresh',
      }),
    )

    await waitFor(() => {
      expect(
        mockApi,
      ).toHaveBeenCalledTimes(2)
    })

    expect(
      mockApi,
    ).toHaveBeenLastCalledWith(
      '/admin/analysis-jobs/42',
    )
  })

  it('displays failure information for a failed job', async () => {
    const failedJob = {
      job: {
        ...completedJob.job,
        status: 'FAILED',
      },
      history: [
        {
          timestamp: '2026-09-30T10:00:00Z',
          status: 'QUEUED',
          message: 'Analysis job queued',
        },
        {
          timestamp: '2026-09-30T10:05:00Z',
          status: 'FAILED',
          message: 'Repository analysis failed',
        },
      ],
    }

    mockApi.mockResolvedValue(failedJob)

    render(
      <SystemAdminJobDetails analysisId={42} />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Analysis #42',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('FAILED', {
        selector: '.status-badge',
      }),
    ).toBeInTheDocument()

    // The message appears both in the failure alert
    // and in the timeline, so target the alert.
    const failureAlert =
      screen.getByRole('alert')

    expect(
      failureAlert,
    ).toHaveTextContent(
      'Failure: Repository analysis failed',
    )
  })
})