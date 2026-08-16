import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SystemAdminDashboard from './pages/SystemAdminDashboard'
import UsersPage from './pages/UsersPage'
import CompaniesPage from './pages/CompaniesPage'
import RepositoriesPage from './pages/RepositoriesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/systemDashboard"
          element={<SystemAdminDashboard />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/systemDashboard/users"
          element={<UsersPage />}
        />

        <Route
          path="/systemDashboard/companies"
          element={<CompaniesPage />} />

        <Route
          path="/systemDashboard/repositories"
          element={<RepositoriesPage />} />
      
      </Routes>
    </BrowserRouter>
  )
}

