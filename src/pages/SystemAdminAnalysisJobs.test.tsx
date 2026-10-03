import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SystemAdminAnalysisJobs from './SystemAdminAnalysisJobs'

const mockNavigate = vi.fn()
const mockSetParams = vi.fn()
const mockApi = vi.fn()

let mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, mockSetParams],
}))

vi.mock('../config/adminApi', () => ({
  useAdminApi: () => mockApi,
  queryString: (params: Record<string, string | number>) =>
    new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ).toString(),
}))

describe('SystemAdminAnalysisJobs', () => {
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

    render(<SystemAdminAnalysisJobs />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.getByText('Loading analysis jobs…'),
    ).toBeInTheDocument()
  })

  it('displays analysis jobs after a successful API response', async () => {
    mockApi.mockResolvedValue({
      content: [
        {
          analysisId: 101,
          companyName: 'GN Company',
          repositoryName: 'testing',
          branch: 'main',
          status: 'COMPLETED',
          startedByName: 'Nalina',
          startedAt: '2026-09-30T10:00:00',
          completedAt: '2026-09-30T10:05:00',
          totalClassesAnalyzed: 25,
        },
      ],
      page: 0,
      totalPages: 1,
      totalElements: 1,
      size: 20,
    })

    render(<SystemAdminAnalysisJobs />)

    expect(await screen.findByText('#101')).toBeInTheDocument()
    expect(screen.getByText('GN Company')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
    expect(screen.getByText('main')).toBeInTheDocument()
    expect(
  screen.getByText('COMPLETED', { selector: '.status-badge' }),
).toBeInTheDocument()
    expect(screen.getByText('Nalina')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('displays the empty state when there are no analysis jobs', async () => {
    mockApi.mockResolvedValue({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 20,
    })

    render(<SystemAdminAnalysisJobs />)

    expect(
      await screen.findByText('No Analysis Jobs Found'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Try different filters.'),
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

    render(<SystemAdminAnalysisJobs />)

    expect(
      await screen.findByRole('alert'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Failed to Load Analysis Jobs'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Server unavailable'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(mockApi).toHaveBeenCalledTimes(2)
    })

    expect(
      await screen.findByText('No Analysis Jobs Found'),
    ).toBeInTheDocument()
  })

  it('updates the query when searching', async () => {
    mockApi.mockResolvedValue({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 20,
    })

    render(<SystemAdminAnalysisJobs />)

    await screen.findByText('No Analysis Jobs Found')

    const searchInput = screen.getByRole('textbox', {
      name: 'Search analysis jobs',
    })

    fireEvent.change(searchInput, {
      target: { value: 'testing' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(mockSetParams).toHaveBeenCalledTimes(1)

    const updatedParams = mockSetParams.mock.calls[0][0] as URLSearchParams

    expect(updatedParams.get('q')).toBe('testing')
    expect(updatedParams.get('page')).toBe('0')
  })

  it('updates the status filter', async () => {
    mockApi.mockResolvedValue({
      content: [],
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 20,
    })

    render(<SystemAdminAnalysisJobs />)

    await screen.findByText('No Analysis Jobs Found')

    const statusSelect = screen.getByRole('combobox', {
      name: 'Filter status',
    })

    fireEvent.change(statusSelect, {
      target: { value: 'FAILED' },
    })

    expect(mockSetParams).toHaveBeenCalledTimes(1)

    const updatedParams = mockSetParams.mock.calls[0][0] as URLSearchParams

    expect(updatedParams.get('status')).toBe('FAILED')
    expect(updatedParams.get('page')).toBe('0')
  })

  it('navigates to the job details page when a job is clicked', async () => {
    mockApi.mockResolvedValue({
      content: [
        {
          analysisId: 42,
          companyName: 'GN Company',
          repositoryName: 'testing',
          branch: 'main',
          status: 'RUNNING',
          startedByName: 'Nalina',
          startedAt: '2026-09-30T10:00:00',
          completedAt: null,
          totalClassesAnalyzed: 10,
        },
      ],
      page: 0,
      totalPages: 1,
      totalElements: 1,
      size: 20,
    })

    render(<SystemAdminAnalysisJobs />)

    const jobId = await screen.findByText('#42')

    fireEvent.click(jobId.closest('tr')!)

    expect(mockNavigate).toHaveBeenCalledWith('/admin/jobs/42')
  })

  it('handles pagination', async () => {
    mockApi.mockResolvedValue({
      content: [
        {
          analysisId: 1,
          companyName: 'GN Company',
          repositoryName: 'testing',
          branch: 'main',
          status: 'COMPLETED',
          startedByName: 'System',
          startedAt: '2026-09-30T10:00:00',
          completedAt: '2026-09-30T10:05:00',
          totalClassesAnalyzed: 10,
        },
      ],
      page: 0,
      totalPages: 3,
      totalElements: 60,
      size: 20,
    })

    render(<SystemAdminAnalysisJobs />)

    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument()

    const nextButton = screen.getByRole('button', { name: 'Next' })

    expect(nextButton).not.toBeDisabled()

    fireEvent.click(nextButton)

    expect(mockSetParams).toHaveBeenCalledTimes(1)

    const updatedParams = mockSetParams.mock.calls[0][0] as URLSearchParams

    expect(updatedParams.get('page')).toBe('1')
  })
})