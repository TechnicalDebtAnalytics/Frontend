import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export interface AdminCompanySummary {
  companyId: number
  companyName: string
  githubOrganizationUrl: string
  superAdminName: string
  superAdminEmail: string
  totalRepositories: number
  totalMembers: number
  createdAt: string
}

interface RepositoryData {
  repositoryId: number
  githubRepositoryId: string
  repositoryName: string
  repositoryUrl: string
  defaultBranch: string
  createdAt?: string
}

interface CompanyDetailsData {
  companyId: number
  companyName: string
  githubOrganizationUrl: string
  githubOrganizationName?: string
  createdByUserId?: number
  createdByName?: string
  totalRepositories: number
  repositories?: RepositoryData[]
  createdAt: string
  updatedAt?: string
}

interface CompanyUser {
  userId: number
  firstName: string
  lastName: string
  email: string
  githubUsername: string
  emailVerified: boolean
  companyRole: string
  companyName: string
  createdAt: string
}

interface SystemAdminCompanyDetailsProps {
  companyId: number
  initialCompanyData?: AdminCompanySummary | null
  onBack: () => void
}

type TabType = 'overview' | 'repositories' | 'users' | 'jobs'

export default function SystemAdminCompanyDetails({
  companyId,
  initialCompanyData,
  onBack,
}: SystemAdminCompanyDetailsProps) {
  const { getAccessTokenSilently } = useAuth0()

  const [company, setCompany] = useState<CompanyDetailsData | null>(null)
  const [repositories, setRepositories] = useState<RepositoryData[]>([])
  const [users, setUsers] = useState<CompanyUser[]>([])
  
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [reposError, setReposError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  /* 1. Fetch Company Details & Repositories */
  useEffect(() => {
    let isMounted = true

    const fetchDetails = async () => {
      if (!companyId || isNaN(companyId)) {
        setCompanyError('Invalid Company ID')
        setLoadingCompany(false)
        setLoadingRepos(false)
        return
      }

      setLoadingCompany(true)
      setLoadingRepos(true)
      setCompanyError(null)
      setReposError(null)

      try {
        const token = await getAccessTokenSilently()

        // Fetch Company Details from GET /api/companies/{companyId}
        const companyRes = await fetch(
          `http://localhost:8080/api/companies/${companyId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!companyRes.ok) {
          if (companyRes.status === 404) {
            throw new Error(`Company with ID #${companyId} was not found.`)
          }
          throw new Error(`Failed to load company details (${companyRes.status}).`)
        }

        const companyData: CompanyDetailsData = await companyRes.json()
        if (isMounted) {
          setCompany(companyData)
          if (companyData.repositories && Array.isArray(companyData.repositories)) {
            setRepositories(companyData.repositories)
          }
        }

        // Fetch Repositories from GET /api/companies/{companyId}/repositories
        try {
          const reposRes = await fetch(
            `http://localhost:8080/api/companies/${companyId}/repositories`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (reposRes.ok) {
            const reposData: RepositoryData[] = await reposRes.json()
            if (isMounted && Array.isArray(reposData) && reposData.length > 0) {
              setRepositories(reposData)
            }
          } else {
            console.warn(
              `GET /api/companies/${companyId}/repositories returned ${reposRes.status}. Using company data fallback.`
            )
          }
        } catch (rErr) {
          console.warn('Failed to fetch repositories endpoint directly:', rErr)
        }
      } catch (err) {
        if (isMounted) {
          setCompanyError(
            err instanceof Error ? err.message : 'An error occurred loading company details.'
          )
        }
      } finally {
        if (isMounted) {
          setLoadingCompany(false)
          setLoadingRepos(false)
        }
      }
    }

    fetchDetails()

    return () => {
      isMounted = false
    }
  }, [companyId, getAccessTokenSilently])

  /* 2. Fetch Company Users from GET /api/admin/companies/{companyId}/users */
  useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      if (!companyId || isNaN(companyId)) return

      setLoadingUsers(true)
      setUsersError(null)

      try {
        const token = await getAccessTokenSilently()
        const res = await fetch(
          `http://localhost:8080/api/admin/companies/${companyId}/users`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!res.ok) {
          throw new Error(`Failed to load company users (${res.status}).`)
        }

        const data: CompanyUser[] = await res.json()
        if (isMounted) {
          setUsers(data)
        }
      } catch (err) {
        if (isMounted) {
          setUsersError(
            err instanceof Error ? err.message : 'Failed to load company users.'
          )
        }
      } finally {
        if (isMounted) {
          setLoadingUsers(false)
        }
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [companyId, getAccessTokenSilently])

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const extractOrgName = (url?: string): string => {
    if (!url) return '—'
    try {
      const parts = url.replace(/\/+$/, '').split('/')
      return parts[parts.length - 1] || url
    } catch {
      return url
    }
  }

  const getUserInitials = (user: CompanyUser): string => {
    const fn = user.firstName ? user.firstName.charAt(0).toUpperCase() : ''
    const ln = user.lastName ? user.lastName.charAt(0).toUpperCase() : ''
    if (fn || ln) return `${fn}${ln}`
    if (user.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  const getUserFullName = (user: CompanyUser): string => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    return fullName || user.email || `User #${user.userId}`
  }

  const displayCompany = company || (initialCompanyData ? {
    companyId: initialCompanyData.companyId,
    companyName: initialCompanyData.companyName,
    githubOrganizationUrl: initialCompanyData.githubOrganizationUrl,
    createdByName: initialCompanyData.superAdminName,
    totalRepositories: initialCompanyData.totalRepositories,
    createdAt: initialCompanyData.createdAt,
  } : null)

  const ownerName = displayCompany?.createdByName || initialCompanyData?.superAdminName || '—'
  const ownerEmail = initialCompanyData?.superAdminEmail || '—'
  const totalMembersCount = users.length > 0 ? users.length : (initialCompanyData?.totalMembers ?? '—')
  const totalReposCount = repositories.length || displayCompany?.totalRepositories || 0

  /* ================= LOADING STATE ================= */
  if (loadingCompany && !displayCompany) {
    return (
      <div className="companies-content">
        <div className="details-header-nav">
          <button className="back-button" onClick={onBack}>
            ← Back to Companies
          </button>
        </div>
        <div className="companies-loading">
          <div className="loading-spinner" />
          <p>Loading company details...</p>
        </div>
      </div>
    )
  }

  /* ================= ERROR STATE ================= */
  if (companyError && !displayCompany) {
    return (
      <div className="companies-content">
        <div className="details-header-nav">
          <button className="back-button" onClick={onBack}>
            ← Back to Companies
          </button>
        </div>
        <div className="companies-error">
          <div className="error-icon">!</div>
          <h3>Failed to Load Company</h3>
          <p>{companyError}</p>
          <button className="retry-button" onClick={onBack}>
            Back to Companies List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="companies-content">
      {/* Top Back Navigation */}
      <div className="details-header-nav">
        <button className="back-button" onClick={onBack}>
          ← Back to Companies
        </button>
      </div>

      {/* Hero Header */}
      <div className="company-details-hero">
        <div className="hero-main-info">
          <div className="company-avatar-large">
            {(displayCompany?.companyName || 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="hero-title-row">
              <h1>{displayCompany?.companyName}</h1>
              <span className="org-badge">
                {extractOrgName(displayCompany?.githubOrganizationUrl)}
              </span>
            </div>
            <p className="hero-subtitle">
              ID: #{companyId} • Created {formatDate(displayCompany?.createdAt)}
            </p>
          </div>
        </div>

        <div className="hero-actions">
          {displayCompany?.githubOrganizationUrl && (
            <a
              href={displayCompany.githubOrganizationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="github-org-link"
            >
              <span>GitHub Org ↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="company-details-tabs">
        <button
          className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-item ${activeTab === 'repositories' ? 'active' : ''}`}
          onClick={() => setActiveTab('repositories')}
        >
          Repositories <span className="tab-badge">{totalReposCount}</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users <span className="tab-badge">{totalMembersCount}</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Analysis Jobs
        </button>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="details-tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">📦</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalReposCount}</span>
                <span className="stat-label">Total Repositories</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">👥</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalMembersCount}</span>
                <span className="stat-label">Total Members</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">⚙</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">0</span>
                <span className="stat-label">Analysis Jobs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">📅</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{formatDate(displayCompany?.createdAt)}</span>
                <span className="stat-label">Registration Date</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <div>
                <h2>Company Overview</h2>
                <p>Super Admin and Organization metadata</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Super Admin / Owner</span>
                <span className="info-value">
                  <strong>{ownerName}</strong>
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Super Admin Email</span>
                <span className="info-value">{ownerEmail}</span>
              </div>

              <div className="info-item">
                <span className="info-label">GitHub Organization URL</span>
                <span className="info-value">
                  {displayCompany?.githubOrganizationUrl ? (
                    <a
                      href={displayCompany.githubOrganizationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-link"
                    >
                      {displayCompany.githubOrganizationUrl} ↗
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Company ID</span>
                <span className="info-value">#{companyId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Repositories */}
      {activeTab === 'repositories' && (
        <div className="details-tab-content">
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h2>Connected Repositories</h2>
                <p>Repositories monitored under {displayCompany?.companyName}</p>
              </div>
              <span className="count-pill">{repositories.length} Repos</span>
            </div>

            {loadingRepos ? (
              <div className="companies-loading" style={{ minHeight: '200px' }}>
                <div className="loading-spinner" />
                <p>Loading repositories...</p>
              </div>
            ) : reposError ? (
              <div className="companies-error" style={{ minHeight: '200px' }}>
                <div className="error-icon">!</div>
                <h3>Failed to Load Repositories</h3>
                <p>{reposError}</p>
              </div>
            ) : repositories.length === 0 ? (
              <div className="companies-empty" style={{ minHeight: '200px' }}>
                <div className="empty-icon">📦</div>
                <h3>No Repositories Linked</h3>
                <p>This company does not have any connected repositories yet.</p>
              </div>
            ) : (
              <div className="companies-table-wrapper">
                <table className="companies-table">
                  <thead>
                    <tr>
                      <th>Repository Name</th>
                      <th>GitHub URL</th>
                      <th>Default Branch</th>
                      <th>Added Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repositories.map((repo) => (
                      <tr key={repo.repositoryId || repo.githubRepositoryId}>
                        <td>
                          <div className="company-name-cell">
                            <span className="repo-icon">📦</span>
                            <span>{repo.repositoryName}</span>
                          </div>
                        </td>
                        <td>
                          {repo.repositoryUrl ? (
                            <a
                              href={repo.repositoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-link"
                            >
                              {repo.repositoryUrl} ↗
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <span className="branch-badge">
                            {repo.defaultBranch || 'main'}
                          </span>
                        </td>
                        <td>
                          <span className="date-text">
                            {formatDate(repo.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Users */}
      {activeTab === 'users' && (
        <div className="details-tab-content">
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h2>Company Users</h2>
                <p>Users registered under {displayCompany?.companyName}</p>
              </div>
              <span className="count-pill">{users.length} Users</span>
            </div>

            {loadingUsers ? (
              <div className="companies-loading" style={{ minHeight: '200px' }}>
                <div className="loading-spinner" />
                <p>Loading company users...</p>
              </div>
            ) : usersError ? (
              <div className="companies-error" style={{ minHeight: '200px' }}>
                <div className="error-icon">!</div>
                <h3>Failed to Load Users</h3>
                <p>{usersError}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="companies-empty" style={{ minHeight: '200px' }}>
                <div className="empty-icon">👥</div>
                <h3>No Users Found</h3>
                <p>No members or super admins are currently associated with this company.</p>
              </div>
            ) : (
              <div className="companies-table-wrapper">
                <table className="companies-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>GitHub Username</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.userId}>
                        <td>
                          <div className="company-name-cell">
                            <div className="company-avatar">
                              {getUserInitials(user)}
                            </div>
                            <div className="user-name-wrapper">
                              <strong>{getUserFullName(user)}</strong>
                              <small className="user-id-sub">ID: #{user.userId}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="user-email-text">{user.email || '—'}</span>
                        </td>
                        <td>
                          {user.githubUsername ? (
                            <span className="github-user-badge">
                              @{user.githubUsername}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <span
                            className={`role-badge ${
                              user.companyRole === 'Super Admin'
                                ? 'role-super-admin'
                                : 'role-member'
                            }`}
                          >
                            {user.companyRole}
                          </span>
                        </td>
                        <td>
                          <span className="date-text">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Analysis Jobs Placeholder */}
      {activeTab === 'jobs' && (
        <div className="details-tab-content">
          <div className="dashboard-card">
            <div className="companies-empty" style={{ padding: '50px 20px' }}>
              <div className="empty-icon">⚙</div>
              <h3>Company Analysis Jobs</h3>
              <p>
                Historical technical debt analysis jobs for {displayCompany?.companyName} will be listed here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
