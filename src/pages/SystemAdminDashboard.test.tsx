import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SystemAdminDashboard from './SystemAdminDashboard'

const auth0 = vi.hoisted(() => ({ useAuth0: vi.fn() }))
vi.mock('@auth0/auth0-react', () => ({ useAuth0: auth0.useAuth0 }))

const logout = vi.fn()
const jsonResponse = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) }) as Promise<Response>
const renderDashboard = (initialEntry: string) => render(
  <MemoryRouter initialEntries={[initialEntry]}>
    <Routes><Route path="/admin/*" element={<SystemAdminDashboard />} /></Routes>
  </MemoryRouter>,
)

describe('System admin dashboard', () => {
  beforeEach(() => {
    logout.mockReset()
    auth0.useAuth0.mockReturnValue({
      user: { name: 'Ada Admin', email: 'ada@example.com' }, logout,
      getAccessTokenSilently: vi.fn().mockResolvedValue('admin-token'),
    })
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/admin/stats')) return jsonResponse({ totalUsers: 12, totalCompanies: 3, totalRepositories: 8, totalAnalysisJobs: 20, queuedJobs: 1, runningJobs: 2, completedJobs: 15, failedJobs: 2, cancelledJobs: 0 })
      if (url.includes('/admin/health')) return jsonResponse({ overallStatus: 'UP', timestamp: '2026-10-01T10:00:00', services: [{ name: 'Application Service', key: 'backend', description: 'API', status: 'UP', details: 'Ready', responseTimeMs: 1, checkedAt: '2026-10-01T10:00:00' }] })
      if (url.includes('/admin/activity')) return jsonResponse([])
      if (url.includes('/admin/companies') || url.includes('/admin/users') || url.includes('/admin/analysis-jobs')) return jsonResponse({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
      return jsonResponse([])
    }))
  })

  it('renders real statistics and logs the authenticated admin out', async () => {
    const user = userEvent.setup()
    renderDashboard('/admin')

    expect(await screen.findByText('Ada Admin')).toBeInTheDocument()
    expect(await screen.findByText('20')).toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(logout).toHaveBeenCalledWith({ logoutParams: { returnTo: window.location.origin } })
  })

  it('navigates between the nested sidebar routes', async () => {
    const user = userEvent.setup()
    renderDashboard('/admin')

    expect(await screen.findByRole('heading', { name: 'System Overview' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Companies' }))
    expect(await screen.findByRole('heading', { name: 'Companies' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Users' }))
    expect(await screen.findByRole('heading', { name: 'Users' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Analysis Jobs' }))
    expect(await screen.findByRole('heading', { name: 'Analysis Jobs' })).toBeInTheDocument()
  })

  it('supports a direct analysis-job detail URL', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/admin/analysis-jobs/42')) return jsonResponse({
        job: { analysisId: 42, companyName: 'Acme', repositoryName: 'api', branch: 'main', status: 'FAILED', startedAt: '2026-10-01T09:00:00', completedAt: '2026-10-01T09:01:00', totalClassesAnalyzed: 5 },
        history: [{ status: 'FAILED', message: 'Worker failed safely', timestamp: '2026-10-01T09:01:00' }],
      })
      return jsonResponse([])
    }))
    renderDashboard('/admin/jobs/42')

    expect(await screen.findByRole('heading', { name: 'Analysis #42' })).toBeInTheDocument()
    expect(screen.getAllByText('Worker failed safely')).toHaveLength(2)
    await waitFor(() => expect(screen.getByText('Acme / api / main')).toBeInTheDocument())
  })

  it('loads company drill-down data only through admin endpoints', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/api/admin/companies/10')) return jsonResponse({
        companyId: 10, companyName: 'Acme', githubOrganizationUrl: 'https://github.com/acme',
        superAdminName: 'Ada Owner', superAdminEmail: 'ada@example.com', totalRepositories: 0,
        totalUsers: 0, createdAt: '2026-10-01T09:00:00',
      })
      if (url.includes('/api/admin/companies/10/repositories')) return jsonResponse([])
      if (url.includes('/api/admin/companies/10/users')) return jsonResponse({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
      if (url.includes('/api/admin/companies/10/analysis-jobs')) return jsonResponse({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
      return jsonResponse([])
    })
    vi.stubGlobal('fetch', fetchMock)

    renderDashboard('/admin/companies/10')

    expect(await screen.findByRole('heading', { name: 'Acme' })).toBeInTheDocument()
    expect(screen.getByText(/Ada Owner/)).toBeInTheDocument()
    expect(fetchMock.mock.calls.every(([input]) => !String(input).includes('/api/companies/'))).toBe(true)
  })
})
