import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface AdminUser {
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

export default function SystemAdminUsers() {
  const { getAccessTokenSilently } = useAuth0()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setError(null)

        const token = await getAccessTokenSilently()

        const response = await fetch(
          'http://localhost:8080/api/admin/users',
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
            `Failed to load users: ${response.status}`
          )
        }

        const data: AdminUser[] = await response.json()

        console.log('ADMIN USERS DATA:', data)

        setUsers(data)
      } catch (err) {
        console.error('Failed to load users:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred'
        )
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
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

  /*
   * ================= LOADING STATE =================
   */
  if (loading) {
    return (
      <div className="companies-content">

        <div className="page-heading">
          <div>
            <h1>Users</h1>
            <p>
              Monitor and manage registered users
              on the DebtLens platform.
            </p>
          </div>
        </div>

        <div className="companies-loading">
          <div className="loading-spinner" />
          <p>Loading users...</p>
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
            <h1>Users</h1>
            <p>
              Monitor and manage registered users
              on the DebtLens platform.
            </p>
          </div>
        </div>

        <div className="companies-error">
          <div className="error-icon">!</div>
          <h3>Failed to Load Users</h3>
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
  if (users.length === 0) {
    return (
      <div className="companies-content">

        <div className="page-heading">
          <div>
            <h1>Users</h1>
            <p>
              Monitor and manage registered users
              on the DebtLens platform.
            </p>
          </div>
        </div>

        <div className="companies-empty">
          <div className="empty-icon">♙</div>
          <h3>No Users Found</h3>
          <p>
            There are no registered users on the platform yet.
          </p>
        </div>

      </div>
    )
  }

  /*
   * ================= USERS TABLE =================
   */
  return (
    <div className="companies-content">

      <div className="page-heading">
        <div>
          <h1>Users</h1>
          <p>
            Monitor and manage registered users
            on the DebtLens platform.
          </p>
        </div>

        <div className="companies-count">
          <span className="count-badge">
            {users.length}
          </span>
          Total Users
        </div>
      </div>


      <div className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>All Users</h2>
            <p>
              Complete list of users registered
              on DebtLens
            </p>
          </div>
        </div>

        <div className="companies-table-wrapper">
          <table className="companies-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>GitHub</th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>

                  <td>
                    <div className="company-name-cell">
                      <div className="user-avatar-cell">
                        {user.firstName
                          .charAt(0)
                          .toUpperCase()}
                        {user.lastName
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="owner-cell">
                        <strong>
                          {user.firstName} {user.lastName}
                        </strong>
                        <small>
                          ID: {user.userId}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="user-email-text">
                      {user.email}
                    </span>
                  </td>

                  <td>
                    <span className="org-badge">
                      {user.githubUsername}
                    </span>
                  </td>

                  <td>
                    <span className="date-text">
                      {user.companyName}
                    </span>
                  </td>

                  <td>
                    <span className={
                      user.companyRole === 'Super Admin'
                        ? 'role-badge role-super-admin'
                        : user.companyRole === 'Member'
                          ? 'role-badge role-member'
                          : 'role-badge role-none'
                    }>
                      {user.companyRole}
                    </span>
                  </td>

                  <td>
                    <span className={
                      user.emailVerified
                        ? 'status-badge status-verified'
                        : 'status-badge status-unverified'
                    }>
                      {user.emailVerified
                        ? 'Verified'
                        : 'Unverified'}
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

      </div>

    </div>
  )
}
