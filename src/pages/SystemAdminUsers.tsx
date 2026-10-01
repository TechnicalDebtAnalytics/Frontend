import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { Search, Users } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import {
  queryString,
  useAdminApi,
  type PagedResponse,
} from '../config/adminApi'
import type { AdminUser } from './adminTypes'
import { formatDate } from './adminTypes'

export default function SystemAdminUsers() {
  const api = useAdminApi()
  const [params, setParams] = useSearchParams()

  const q = params.get('q') || ''
  const role = params.get('role') || ''
  const verified = params.get('verified') || ''

  const rawPage = Number(params.get('page') || '0')
  const page =
    Number.isInteger(rawPage) && rawPage >= 0
      ? rawPage
      : 0

  const [data, setData] =
    useState<PagedResponse<AdminUser> | null>(null)
  const [input, setInput] = useState(q)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api<PagedResponse<AdminUser>>(
        `/admin/users?${queryString({
          q,
          role,
          emailVerified: verified,
          page,
          size: 20,
          sort: 'createdAt,desc',
        })}`,
      )

      setData(response)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to load users.',
      )
    } finally {
      setLoading(false)
    }
  }, [api, page, q, role, verified])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const updateFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(params)

    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }

    nextParams.set('page', '0')
    setParams(nextParams)
  }

  const setPage = (value: number) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('page', String(value))
    setParams(nextParams)
  }

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    updateFilter('q', input.trim())
  }

  return (
    <section className="dashboard-content companies-content">
      <div className="page-heading">
        <div>
          <h1>Users</h1>
          <p>
            Inspect registered users and all company affiliations.
          </p>
        </div>

        <div className="companies-count">
          <span className="count-badge">
            {data?.totalElements ?? 0}
          </span>
          Total Users
        </div>
      </div>

      <form
        className="admin-filter-bar"
        onSubmit={submitSearch}
        role="search"
      >
        <Search size={16} aria-hidden="true" />

        <input
          aria-label="Search users"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search name, email, or GitHub username"
        />

        <select
          aria-label="Filter role"
          value={role}
          onChange={(event) =>
            updateFilter('role', event.target.value)
          }
        >
          <option value="">All roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="MEMBER">Member</option>
        </select>

        <select
          aria-label="Filter verification"
          value={verified}
          onChange={(event) =>
            updateFilter('verified', event.target.value)
          }
        >
          <option value="">All verification states</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <button type="submit">Search</button>
      </form>

      {loading ? (
        <div className="companies-loading" role="status">
          <div className="loading-spinner" />
          <p>Loading users…</p>
        </div>
      ) : error ? (
        <div className="companies-error" role="alert">
          <h3>Failed to Load Users</h3>
          <p>{error}</p>

          <button
            type="button"
            className="retry-button"
            onClick={() => void load()}
          >
            Retry
          </button>
        </div>
      ) : !data?.content.length ? (
        <div className="companies-empty">
          <Users size={32} aria-hidden="true" />
          <h3>No Users Found</h3>
          <p>Try different filters.</p>
        </div>
      ) : (
        <div className="dashboard-card">
          <div
            className="companies-table-wrapper"
            tabIndex={0}
            role="region"
            aria-label="Users table"
          >
            <table className="companies-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>GitHub</th>
                  <th>Affiliations</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {data.content.map((user) => {
                  const fullName =
                    `${user.firstName || ''} ${user.lastName || ''}`.trim()

                  const initials =
                    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() ||
                    'U'

                  return (
                    <tr key={user.userId}>
                      <td>
                        <div className="company-name-cell">
                          <div className="user-avatar-cell">
                            {initials}
                          </div>

                          <div className="owner-cell">
                            <strong>
                              {fullName || user.email}
                            </strong>
                            <small>ID: {user.userId}</small>
                          </div>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className="org-badge">
                          {user.githubUsername
                            ? `@${user.githubUsername}`
                            : '—'}
                        </span>
                      </td>

                      <td>
                        <div className="affiliation-list">
                          {user.affiliations.length > 0 ? (
                            user.affiliations.map(
                              (affiliation) => (
                                <span
                                  key={affiliation.companyId}
                                  className={`role-badge ${
                                    affiliation.role ===
                                    'Super Admin'
                                      ? 'role-super-admin'
                                      : 'role-member'
                                  }`}
                                >
                                  {affiliation.companyName} ·{' '}
                                  {affiliation.role}
                                </span>
                              ),
                            )
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            user.emailVerified
                              ? 'status-verified'
                              : 'status-unverified'
                          }`}
                        >
                          {user.emailVerified
                            ? 'Verified'
                            : 'Unverified'}
                        </span>
                      </td>

                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div
          className="admin-pagination"
          aria-label="User pagination"
        >
          <button
            type="button"
            disabled={data.page === 0}
            onClick={() => setPage(data.page - 1)}
          >
            Previous
          </button>

          <span>
            Page {data.page + 1} of {data.totalPages}
          </span>

          <button
            type="button"
            disabled={data.page + 1 >= data.totalPages}
            onClick={() => setPage(data.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}