import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import SystemAdminDashboard from './pages/SystemAdminDashboard'

type Page = 'login' | 'register'

const ROLE_CLAIM = 'https://debtlens.example.com/roles'

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const params = new URLSearchParams(window.location.search)
    const path = window.location.pathname

    if (
      params.has('token') ||
      params.get('page') === 'register' ||
      path.includes('/register') ||
      path.includes('/invitation')
    ) {
      return 'register'
    }

    return 'login'
  })

  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  const {
    isAuthenticated,
    isLoading,
    getIdTokenClaims,
    getAccessTokenSilently,
  } = useAuth0()

  const navigate = (target: string) => {
    if (target === 'login' || target === 'register') {
      setPage(target)
    }
  }

  useEffect(() => {
    const loadUserRole = async () => {
      /*
       * Auth0 has not authenticated the user.
       */
      if (!isAuthenticated) {
        setUserRole(null)
        setRoleLoading(false)
        return
      }

      /*
       * Auth0 user is authenticated.
       * Get the ID token claims.
       */
      try {
        const claims = await getIdTokenClaims()

        console.log('AUTH0 ID TOKEN CLAIMS:', claims)

        const roles = claims?.[ROLE_CLAIM] as string[] | undefined

        console.log('AUTH0 ROLES:', roles)

        /*
         * Check whether SYSTEM_ADMIN exists.
         */
        if (roles?.includes('SYSTEM_ADMIN')) {
          setUserRole('SYSTEM_ADMIN')
        } else if (roles?.includes('SYSTEM_USER')) {
          setUserRole('SYSTEM_USER')
        } else {
          setUserRole(null)
        }
      } catch (error) {
        console.error('Failed to get ID token claims:', error)
        setUserRole(null)
      } finally {
        setRoleLoading(false)
      }
    }

    loadUserRole()
  }, [isAuthenticated, getIdTokenClaims])

  /*
   * Auth0 is still loading.
   */
  if (isLoading || roleLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        Loading...
      </div>
    )
  }

  /*
   * User is authenticated.
   */
  if (isAuthenticated) {
    /*
     * SYSTEM ADMIN
     */
    if (userRole === 'SYSTEM_ADMIN') {
      return <SystemAdminDashboard />
    }

    /*
     * NORMAL SYSTEM USER
     */
    if (userRole === 'SYSTEM_USER') {
      return <UserDashboard />
    }

    /*
     * Authenticated user with an unknown role.
     */
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Access Denied</h2>

          <p>
            You do not have permission to access this application.
          </p>
        </div>
      </div>
    )
  }

  /*
   * User is NOT authenticated.
   */
  if (page === 'register') {
    return <RegisterPage onNavigate={navigate} />
  }

  return <LoginPage onNavigate={navigate} />
}