import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

type Page = 'login' | 'register'

export default function App() {
  const [page, setPage] = useState<Page>('login')

  const navigate = (target: string) => {
    if (target === 'login' || target === 'register') setPage(target)
  }

  if (page === 'register') return <RegisterPage onNavigate={navigate} />
  return <LoginPage onNavigate={navigate} />
}
