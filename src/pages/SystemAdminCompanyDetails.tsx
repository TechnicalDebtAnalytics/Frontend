import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  GitBranch,
  Users,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useAdminApi,
  type PagedResponse,
} from '../config/adminApi'
import type {
  AdminCompany,
  AdminUser,
  AnalysisJob,
} from './adminTypes'
import { formatDate } from './adminTypes'

interface RepositoryData {
  repositoryId: number
  repositoryName: string
  repositoryUrl: string
  defaultBranch: string
  createdAt?: string
}

type Tab = 'overview' | 'repositories' | 'users' | 'jobs'

interface SystemAdminCompanyDetailsProps {
  companyId: number
}

export default function SystemAdminCompanyDetails({
  companyId,
}: SystemAdminCompanyDetailsProps) {
  const api = useAdminApi()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const rawTab = params.get('tab')
  const tab: Tab =
    rawTab === 'repositories' ||
    rawTab === 'users' ||
    rawTab === 'jobs'
      ? rawTab
      : 'overview'

  const [company, setCompany] = useState<AdminCompany | null>(null)
  const [repositories, setRepositories] = useState<RepositoryData[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [jobs, setJobs] = useState<AnalysisJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [companyData, repos, userPage, jobPage] =
        await Promise.all([
          api<AdminCompany>(
            `/admin/companies/${companyId}`,
          ),
          api<RepositoryData[]>(
            `/admin/companies/${companyId}/repositories`,
          ),
          api<PagedResponse<AdminUser>>(
            `/admin/companies/${companyId}/users?size=100`,
          ),
          api<PagedResponse<AnalysisJob>>(
            `/admin/companies/${companyId}/analysis-jobs?size=100`,
          ),
        ])

      setCompany(companyData)
      setRepositories(repos)
      setUsers(userPage.content)
      setJobs(jobPage.content)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to load company.',
      )
    } finally {
      setLoading(false)
    }
  }, [api, companyId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const selectTab = (value: Tab) => {
    const nextParams = new URLSearchParams(params)

    if (value === 'overview') {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', value)
    }

    setParams(nextParams)
  }

  const openJob = (analysisId: number) => {
    navigate(`/admin/jobs/${analysisId}`)
  }

  if (loading) {
    return (
      <section className="dashboard-content">
        <div className="companies-loading" role="status">
          <div className="loading-spinner" />
          <p>Loading company…</p>
        </div>
      </section>
    )
  }

  if (error || !company) {
    return (
      <section className="dashboard-content">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/admin/companies')}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Companies
        </button>

        <div className="companies-error" role="alert">
          <h3>Failed to Load Company</h3>
          <p>{error ?? 'Company data is unavailable.'}</p>

          <button
            type="button"
            className="retry-button"
            onClick={() => void load()}
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  const tabs: Array<[Tab, string]> = [
    ['overview', 'Overview'],
    ['repositories', `Repositories ${repositories.length}`],
    ['users', `Users ${users.length}`],
    ['jobs', `Analysis Jobs ${jobs.length}`],
  ]

  return (
    <section className="dashboard-content companies-content">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate('/admin/companies')}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to Companies
      </button>

      <div className="company-details-hero">
        <div className="hero-main-info">
          <div className="company-avatar-large">
            {company.companyName[0]?.toUpperCase() ?? '?'}
          </div>

          <div>
            <h1>{company.companyName}</h1>
            <p className="hero-subtitle">
              ID: #{company.companyId} · Created{' '}
              {formatDate(company.createdAt)}
            </p>
          </div>
        </div>

        {company.githubOrganizationUrl && (
          <a
            className="github-org-link"
            href={company.githubOrganizationUrl}
            target="_blank"
            rel="noreferrer"
          >
            GitHub Organization
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>

      <div
        className="company-details-tabs"
        role="tablist"
        aria-label="Company details"
      >
        {tabs.map(([value, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === value}
            key={value}
            className={`tab-item ${tab === value ? 'active' : ''}`}
            onClick={() => selectTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="details-tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <GitBranch aria-hidden="true" />
              <div className="stat-value">{repositories.length}</div>
              <div className="stat-title">Repositories</div>
            </div>

            <div className="stat-card">
              <Users aria-hidden="true" />
              <div className="stat-value">{users.length}</div>
              <div className="stat-title">Users</div>
            </div>

            <div className="stat-card">
              <Building2 aria-hidden="true" />
              <div className="stat-value">{jobs.length}</div>
              <div className="stat-title">Analysis Jobs</div>
            </div>
          </div>

          <div className="dashboard-card company-metadata">
            <h2>Company Metadata</h2>

            <p>
              <strong>Owner:</strong>{' '}
              {company.superAdminName || '—'}
            </p>

            <p>
              <strong>GitHub:</strong>{' '}
              {company.githubOrganizationUrl || '—'}
            </p>
          </div>
        </div>
      )}

      {tab === 'repositories' && (
        <DataTable
          empty="No repositories connected"
          rowCount={repositories.length}
        >
          <thead>
            <tr>
              <th>Repository</th>
              <th>URL</th>
              <th>Default Branch</th>
              <th>Added</th>
            </tr>
          </thead>

          <tbody>
            {repositories.map((repository) => (
              <tr key={repository.repositoryId}>
                <td>
                  <strong>{repository.repositoryName}</strong>
                </td>

                <td>
                  <a
                    href={repository.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open repository
                  </a>
                </td>

                <td>
                  <span className="org-badge">
                    {repository.defaultBranch || 'main'}
                  </span>
                </td>

                <td>{formatDate(repository.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      {tab === 'users' && (
        <DataTable
          empty="No users associated"
          rowCount={users.length}
        >
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>GitHub</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>
                  <strong>
                    {`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                      user.email}
                  </strong>
                </td>

                <td>{user.email}</td>

                <td>
                  {user.githubUsername
                    ? `@${user.githubUsername}`
                    : '—'}
                </td>

                <td>
                  {user.affiliations.length > 0
                    ? user.affiliations.map((affiliation) => (
                        <span
                          className="role-badge role-member"
                          key={affiliation.companyId}
                        >
                          {affiliation.role}
                        </span>
                      ))
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      {tab === 'jobs' && (
        <DataTable
          empty="No analysis jobs"
          rowCount={jobs.length}
        >
          <thead>
            <tr>
              <th>Job</th>
              <th>Repository</th>
              <th>Status</th>
              <th>Started</th>
              <th>Classes</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr
                className="clickable-row"
                key={job.analysisId}
                tabIndex={0}
                onClick={() => openJob(job.analysisId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    openJob(job.analysisId)
                  }
                }}
              >
                <td>
                  <strong>#{job.analysisId}</strong>
                </td>

                <td>{job.repositoryName || '—'}</td>

                <td>
                  <span
                    className={`status-badge status-${job.status.toLowerCase()}`}
                  >
                    {job.status}
                  </span>
                </td>

                <td>{formatDate(job.startedAt, true)}</td>
                <td>{job.totalClassesAnalyzed ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </section>
  )
}

interface DataTableProps {
  children: ReactNode
  empty: string
  rowCount: number
}

function DataTable({
  children,
  empty,
  rowCount,
}: DataTableProps) {
  return (
    <div className="dashboard-card details-tab-content">
      {rowCount > 0 ? (
        <div className="companies-table-wrapper">
          <table className="companies-table">{children}</table>
        </div>
      ) : (
        <div className="companies-empty">
          <p>{empty}</p>
        </div>
      )}
    </div>
  )
}