import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface AdminCompany {
  companyId: number
  companyName: string
  githubOrganizationUrl: string
  superAdminName: string
  superAdminEmail: string
  totalRepositories: number
  totalMembers: number
  createdAt: string
}

export default function SystemAdminCompanies() {
  const { getAccessTokenSilently } = useAuth0()

  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setError(null)

        const token = await getAccessTokenSilently()

        const response = await fetch(
          'http://localhost:8080/api/admin/companies',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load companies: ${response.status}`
          )
        }

        const data: AdminCompany[] = await response.json()

        console.log('ADMIN COMPANIES DATA:', data)

        setCompanies(data)
      } catch (err) {
        console.error('Failed to load companies:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred'
        )
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [getAccessTokenSilently])

  const formatDate = (dateString: string): string => {
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

  const extractOrgName = (url: string): string => {
    if (!url) return '—'
    try {
      const parts = url.replace(/\/+$/, '').split('/')
      return parts[parts.length - 1] || url
    } catch {
      return url
    }
  }

  /*
   * ================= LOADING STATE =================
   */
  if (loading) {
    return (
      <div className="companies-content">

        <div className="page-heading">
          <div>
            <h1>Companies</h1>
            <p>
              Monitor and manage registered organizations
              on the DebtLens platform.
            </p>
          </div>
        </div>

        <div className="companies-loading">
          <div className="loading-spinner" />
          <p>Loading companies...</p>
        </div>

      </div>
    )
  }

  /*
   * ================= ERROR STATE =================
   */
  if (error) {
    return (
      <div className="companies-content">

        <div className="page-heading">
          <div>
            <h1>Companies</h1>
            <p>
              Monitor and manage registered organizations
              on the DebtLens platform.
            </p>
          </div>
        </div>

        <div className="companies-error">
          <div className="error-icon">!</div>
          <h3>Failed to Load Companies</h3>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>

      </div>
    )
  }

  /*
   * ================= EMPTY STATE =================
   */
  if (companies.length === 0) {
    return (
      <div className="companies-content">

        <div className="page-heading">
          <div>
            <h1>Companies</h1>
            <p>
              Monitor and manage registered organizations
              on the DebtLens platform.
            </p>
          </div>
        </div>

        <div className="companies-empty">
          <div className="empty-icon">□</div>
          <h3>No Companies Found</h3>
          <p>
            There are no registered companies on the platform yet.
          </p>
        </div>

      </div>
    )
  }

  /*
   * ================= COMPANIES TABLE =================
   */
  return (
    <div className="companies-content">

      <div className="page-heading">
        <div>
          <h1>Companies</h1>
          <p>
            Monitor and manage registered organizations
            on the DebtLens platform.
          </p>
        </div>

        <div className="companies-count">
          <span className="count-badge">
            {companies.length}
          </span>
          Total Companies
        </div>
      </div>


      <div className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>All Companies</h2>
            <p>
              Complete list of organizations registered
              on DebtLens
            </p>
          </div>
        </div>

        <div className="companies-table-wrapper">
          <table className="companies-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>GitHub Organization</th>
                <th>Owner / Super Admin</th>
                <th>Repositories</th>
                <th>Members</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr key={company.companyId}>

                  <td>
                    <div className="company-name-cell">
                      <div className="company-avatar">
                        {company.companyName
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span>{company.companyName}</span>
                    </div>
                  </td>

                  <td>
                    <span className="org-badge">
                      {extractOrgName(
                        company.githubOrganizationUrl
                      )}
                    </span>
                  </td>

                  <td>
                    <div className="owner-cell">
                      <strong>
                        {company.superAdminName}
                      </strong>
                      <small>
                        {company.superAdminEmail}
                      </small>
                    </div>
                  </td>

                  <td>
                    <span className="count-pill">
                      {company.totalRepositories}
                    </span>
                  </td>

                  <td>
                    <span className="count-pill">
                      {company.totalMembers}
                    </span>
                  </td>

                  <td>
                    <span className="date-text">
                      {formatDate(company.createdAt)}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
