import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'

type Page = 'login' | 'register'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const { isAuthenticated, isLoading } = useAuth0()

  const navigate = (target: string) => {
    if (target === 'login' || target === 'register') setPage(target)
  }

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading...</div>
  }

  if (isAuthenticated) return <UserDashboard />
  if (page === 'register') return <RegisterPage onNavigate={navigate} />
  return <LoginPage onNavigate={navigate} />
}
