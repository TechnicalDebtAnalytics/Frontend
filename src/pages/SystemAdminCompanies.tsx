import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Building2, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  queryString,
  useAdminApi,
  type PagedResponse,
} from '../config/adminApi'
import {
  formatDate,
  type AdminCompany,
} from './adminTypes'

export type { AdminCompany }

export default function SystemAdminCompanies() {
  const api = useAdminApi()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const page = Math.max(0, Number(searchParams.get('page') ?? '0'))

  const [input, setInput] = useState(q)
  const [companies, setCompanies] =
    useState<PagedResponse<AdminCompany> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api<PagedResponse<AdminCompany>>(
        `/admin/companies${queryString({
          q: q || undefined,
          page,
          size: 20,
          sort: 'createdAt,desc',
        })}`,
      )

      setCompanies(response)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load companies.',
      )
    } finally {
      setLoading(false)
    }
  }, [api, page, q])

  useEffect(() => {
    void loadCompanies()
  }, [loadCompanies])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()

    const next = new URLSearchParams(searchParams)
    const trimmed = input.trim()

    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }

    next.set('page', '0')
    setSearchParams(next)
  }

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <section className="companies-page">
      <div className="companies-summary">
        <div>
          <h1>Companies</h1>
          <p className="companies-summary-label">Companies</p>
          <strong>{companies?.totalElements ?? 0}</strong>
        </div>

        <form
          className="companies-search"
          onSubmit={submitSearch}
          role="search"
        >
          <Search size={18} aria-hidden="true" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search companies"
            aria-label="Search companies"
          />
        </form>
      </div>

      <div className="companies-table-card">
        {loading ? (
          <div className="admin-page-state">Loading companies…</div>
        ) : error ? (
          <div className="admin-page-state admin-page-state-error">
            <p>{error}</p>
            <button type="button" onClick={() => void loadCompanies()}>
              Retry
            </button>
          </div>
        ) : !companies || companies.content.length === 0 ? (
          <div className="admin-page-state">
            <Building2 size={28} aria-hidden="true" />
            <p>No companies match the current filters.</p>
          </div>
        ) : (
          <>
            <div className="companies-table-wrapper">
              <table className="companies-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Super admin</th>
                    <th>Repositories</th>
                    <th>Users</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {companies.content.map((company) => (
                    <tr
                      key={company.companyId}
                      tabIndex={0}
                      onClick={() =>
                        navigate(`/admin/companies/${company.companyId}`)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          navigate(
                            `/admin/companies/${company.companyId}`,
                          )
                        }
                      }}
                    >
                      <td>
                        <div className="company-name-cell">
                          <span className="company-icon">
                            <Building2 size={18} aria-hidden="true" />
                          </span>

                          <div>
                            <strong>{company.companyName}</strong>
                            <span>
                              {company.githubOrganizationUrl || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{company.superAdminName || '—'}</strong>
                        <span>{company.superAdminEmail || '—'}</span>
                      </td>

                      <td>{company.totalRepositories}</td>
                      <td>{company.totalUsers}</td>
                      <td>{formatDate(company.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="admin-pagination"
              aria-label="Company pagination"
            >
              <button
                type="button"
                disabled={companies.page <= 0}
                onClick={() => changePage(companies.page - 1)}
              >
                Previous
              </button>

              <span>
                Page {companies.page + 1} of{' '}
                {Math.max(companies.totalPages, 1)}
              </span>

              <button
                type="button"
                disabled={companies.page + 1 >= companies.totalPages}
                onClick={() => changePage(companies.page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}