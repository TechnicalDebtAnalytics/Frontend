import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export interface AnalysisJob {
  analysisId: number
  repositoryId: number
  repositoryName: string
  repositoryUrl: string
  companyId?: number
  companyName?: string
  branch: string
  startedByUserId?: number
  startedByName?: string
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  startedAt: string
  completedAt?: string
  totalClassesAnalyzed?: number
}

type StatusFilter = 'ALL' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export default function SystemAdminAnalysisJobs() {
  const { getAccessTokenSilently } = useAuth0()

  const [jobs, setJobs] = useState<AnalysisJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setError(null)
        const token = await getAccessTokenSilently()

        const response = await fetch(
          'http://localhost:8080/api/admin/analysis-jobs',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to load analysis jobs: ${response.status}`)
        }

        const data: AnalysisJob[] = await response.json()
        console.log('ADMIN GLOBAL ANALYSIS JOBS:', data)
        setJobs(data)
      } catch (err) {
        console.error('Failed to load global analysis jobs:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred'
        )
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [getAccessTokenSilently])

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === 'ALL') return true
    return job.status === statusFilter
  })

  /*
   * ================= LOADING STATE =================
   */
  if (loading) {
    return (
      <div className="companies-content">
        <div className="page-heading">
          <div>
            <h1>Analysis Jobs</h1>
            <p>Monitor technical debt analysis tasks across all platform repositories.</p>
          </div>
        </div>

        <div className="companies-loading">
          <div className="loading-spinner" />
          <p>Loading platform analysis jobs...</p>
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
            <h1>Analysis Jobs</h1>
            <p>Monitor technical debt analysis tasks across all platform repositories.</p>
          </div>
        </div>

        <div className="companies-error">
          <div className="error-icon">!</div>
          <h3>Failed to Load Analysis Jobs</h3>
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
  if (jobs.length === 0) {
    return (
      <div className="companies-content">
        <div className="page-heading">
          <div>
            <h1>Analysis Jobs</h1>
            <p>Monitor technical debt analysis tasks across all platform repositories.</p>
          </div>
        </div>

        <div className="companies-empty">
          <div className="empty-icon">◌</div>
          <h3>No Analysis Jobs Found</h3>
          <p>There are no analysis jobs registered on the DebtLens platform yet.</p>
        </div>
      </div>
    )
  }

  /*
   * ================= MAIN DATA VIEW =================
   */
  return (
    <div className="companies-content">
      <div className="page-heading">
        <div>
          <h1>Analysis Jobs</h1>
          <p>Monitor technical debt analysis tasks across all platform repositories.</p>
        </div>

        <div className="companies-count">
          <span className="count-badge">{filteredJobs.length}</span>
          Total Filtered Jobs
        </div>
      </div>

      {/* STATUS FILTER BAR */}
      <div className="dashboard-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginRight: '0.5rem' }}>
            Filter Status:
          </span>

          {(['ALL', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`retry-button ${statusFilter === st ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: '6rem',
                background: statusFilter === st ? 'var(--accent-primary, #6366f1)' : 'transparent',
                color: statusFilter === st ? '#ffffff' : 'inherit',
                border: '1px solid var(--border-color, #334155)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {st} ({st === 'ALL' ? jobs.length : jobs.filter((j) => j.status === st).length})
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>All Analysis Jobs</h2>
            <p>Chronological analysis job executions ordered by newest first</p>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="companies-empty" style={{ padding: '3rem' }}>
            <h3>No {statusFilter} Jobs</h3>
            <p>There are no analysis jobs matching status "{statusFilter}".</p>
          </div>
        ) : (
          <div className="companies-table-wrapper">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Company</th>
                  <th>Repository</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Started By</th>
                  <th>Started At</th>
                  <th>Completed At</th>
                  <th>Classes</th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.analysisId}>
                    <td>
                      <strong>#{job.analysisId}</strong>
                    </td>

                    <td>
                      <span className="date-text" style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {job.companyName || '—'}
                      </span>
                    </td>

                    <td>
                      <div className="company-name-cell">
                        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {job.repositoryName}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="org-badge">{job.branch}</span>
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${job.status ? job.status.toLowerCase() : 'queued'}`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td>
                      <span className="user-email-text">
                        {job.startedByName || 'System User'}
                      </span>
                    </td>

                    <td>
                      <span className="date-text">{formatDate(job.startedAt)}</span>
                    </td>

                    <td>
                      <span className="date-text">{formatDate(job.completedAt)}</span>
                    </td>

                    <td>
                      <span className="count-pill">
                        {job.totalClassesAnalyzed != null ? job.totalClassesAnalyzed : 0}
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
  )
}
